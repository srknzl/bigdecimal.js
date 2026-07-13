<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ code?: string }>()
const seed =
  props.code ??
  "// Edit me, then press Run (or Ctrl / ⌘ + Enter).\n// The last expression is printed; use console.log for scripts.\nBig('0.1').add(Big('0.2')).toString()"

const { isDark } = useData()
const editorEl = ref<HTMLElement | null>(null)
const view = shallowRef<any>(null)
const themeCompartment = shallowRef<any>(null)
const oneDarkRef = shallowRef<any>(null)
const output = ref<{ kind: 'log' | 'result' | 'error'; text: string }[]>([])
const running = ref(false)
const ready = ref(false)

function fmt(v: any): string {
  if (v === null) return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'string') return JSON.stringify(v)
  if (typeof v === 'bigint') return v.toString() + 'n'
  if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']'
  if (typeof v === 'object' && v.toString && v.toString !== Object.prototype.toString) return v.toString()
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

async function run() {
  running.value = true
  output.value = []
  try {
    // Aliased in .vitepress/config.ts to the locally-built ESM bundle.
    const lib: any = await import('bigdecimal.js')
    const { Big, MC, RoundingMode, BigDecimal, MathContext } = lib
    const logs: string[] = []
    // Note the block body: these must return undefined so the eval completion value
    // below isn't polluted by console.log's return.
    const push = (...a: any[]) => {
      logs.push(a.map(fmt).join(' '))
    }
    const sandboxConsole = { log: push, info: push, warn: push, error: push }

    const src = view.value ? view.value.state.doc.toString() : seed
    const names = ['Big', 'MC', 'RoundingMode', 'BigDecimal', 'MathContext', 'console', '__src__']
    const args = [Big, MC, RoundingMode, BigDecimal, MathContext, sandboxConsole, src]

    // Direct eval gives REPL-style completion values: console.log output is captured
    // AND the value of the last expression is returned, even in a multi-statement script.
    const fn = new Function(...names, 'return eval(__src__);')
    const returned = fn(...args)

    for (const l of logs) output.value.push({ kind: 'log', text: l })
    if (returned !== undefined) output.value.push({ kind: 'result', text: fmt(returned) })
    if (output.value.length === 0)
      output.value.push({ kind: 'log', text: '(no output — use console.log or end with an expression)' })
  } catch (e: any) {
    output.value.push({ kind: 'error', text: e && e.message ? `${e.name}: ${e.message}` : String(e) })
  } finally {
    running.value = false
  }
}

// Export the current editor contents as a runnable StackBlitz project. Uses StackBlitz's
// form-POST API (https://developer.stackblitz.com/platform/api/post-api) so there's no
// extra dependency — we just build a <form> and submit it.
function openInStackBlitz() {
  const userCode = view.value ? view.value.state.doc.toString() : seed
  const index =
    "import { Big, MC, RoundingMode, BigDecimal, MathContext } from 'bigdecimal.js'\n\n" +
    '// Tip: use console.log(...) to print results in the terminal below.\n\n' +
    userCode +
    '\n'
  const pkg = JSON.stringify(
    {
      name: 'bigdecimal-js-playground',
      type: 'module',
      scripts: { start: 'node index.mjs' },
      dependencies: { 'bigdecimal.js': 'latest' },
    },
    null,
    2,
  )
  const fields: Record<string, string> = {
    'project[title]': 'BigDecimal.js Playground',
    'project[description]': 'Exact decimal arithmetic with bigdecimal.js',
    'project[template]': 'node',
    'project[files][index.mjs]': index,
    'project[files][package.json]': pkg,
  }
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = 'https://stackblitz.com/run?file=index.mjs'
  form.target = '_blank'
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
  form.remove()
}

onMounted(async () => {
  const [cm, state, viewMod, lang, dark] = await Promise.all([
    import('codemirror'),
    import('@codemirror/state'),
    import('@codemirror/view'),
    import('@codemirror/lang-javascript'),
    import('@codemirror/theme-one-dark'),
  ])
  const { EditorView, basicSetup } = cm
  const { EditorState, Compartment, Prec } = state
  const { keymap } = viewMod
  const { javascript } = lang
  const { oneDark } = dark

  const theme = new Compartment()
  themeCompartment.value = theme
  oneDarkRef.value = oneDark

  view.value = new EditorView({
    parent: editorEl.value!,
    state: EditorState.create({
      doc: seed,
      extensions: [
        basicSetup,
        javascript(),
        theme.of(isDark.value ? oneDark : []),
        Prec.highest(
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                run()
                return true
              },
            },
          ]),
        ),
        EditorView.theme({
          '&': { fontSize: '14px', backgroundColor: 'transparent' },
          '.cm-scroller': { fontFamily: 'var(--vp-font-family-mono)' },
          '.cm-gutters': { backgroundColor: 'transparent', border: 'none' },
        }),
      ],
    }),
  })
  ready.value = true
})

watch(isDark, (dark) => {
  if (view.value && themeCompartment.value) {
    view.value.dispatch({ effects: themeCompartment.value.reconfigure(dark ? oneDarkRef.value : []) })
  }
})

onBeforeUnmount(() => {
  if (view.value) view.value.destroy()
})
</script>

<template>
  <div class="pg">
    <div class="pg-editor" ref="editorEl" />
    <div class="pg-bar">
      <button class="pg-run" :disabled="running || !ready" @click="run">
        <span v-if="running">Running…</span>
        <span v-else>▶&nbsp;Run</span>
      </button>
      <span class="pg-hint">Ctrl / ⌘ + Enter</span>
      <button class="pg-sb" title="Open this snippet as a Node project on StackBlitz" @click="openInStackBlitz">
        Open in StackBlitz&nbsp;↗
      </button>
    </div>
    <div class="pg-output" v-if="output.length">
      <div v-for="(o, i) in output" :key="i" class="pg-line" :class="'pg-' + o.kind">
        <span class="pg-gutter">{{ o.kind === 'result' ? '⟵' : o.kind === 'error' ? '✖' : '›' }}</span>
        <span class="pg-text">{{ o.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pg {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0;
  background: var(--vp-c-bg-soft);
}
.pg-editor {
  max-height: 460px;
  overflow: auto;
}
.pg-editor :deep(.cm-editor) {
  outline: none;
  padding: 6px 4px;
}
.pg-editor :deep(.cm-editor.cm-focused) {
  outline: none;
}
.pg-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-top: 1px solid var(--vp-c-divider);
}
.pg-run {
  font-weight: 600;
  color: #fff;
  background: var(--vp-c-brand-2);
  border-radius: 8px;
  padding: 6px 16px;
  transition: background 0.2s, opacity 0.2s;
}
.pg-run:hover:not(:disabled) {
  background: var(--vp-c-brand-1);
}
.pg-run:disabled {
  opacity: 0.5;
  cursor: default;
}
.pg-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.pg-sb {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 5px 12px;
  transition: color 0.2s, border-color 0.2s;
}
.pg-sb:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.pg-output {
  border-top: 1px solid var(--vp-c-divider);
  padding: 10px 14px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  background: var(--vp-c-bg);
}
.pg-line {
  display: flex;
  gap: 10px;
  padding: 1px 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.pg-gutter {
  user-select: none;
  opacity: 0.55;
}
.pg-result .pg-text {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.pg-error .pg-text {
  color: var(--vp-c-danger-1);
}
</style>
