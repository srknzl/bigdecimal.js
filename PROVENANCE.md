# Provenance and licensing

## What this software is derived from

`bigdecimal.js` is a port of `java.math.BigDecimal` from
[OpenJDK](https://github.com/openjdk/jdk). This is not an independent
reimplementation against a published specification — it is a translation of the
OpenJDK implementation. The derivation is visible throughout `src/bigdecimal.ts`:

- the dual compact (`number`) / inflated (`bigint`) significand representation,
  including the `INFLATED` sentinel, is OpenJDK's design;
- internal helpers (`divideAndRound*`, the numbered `add*` / `divide*` overload
  families, `TEN_POWERS_TABLE`, `compactValFor`) correspond directly to their
  OpenJDK counterparts;
- local variable naming (`xs`, `ys`, `rs`, `scl`, `prec`) is retained from the
  OpenJDK source deliberately, so the port stays diffable against upstream;
- much of the API documentation is adapted from the OpenJDK javadoc.

The test material under `test/jdk/` is taken from the OpenJDK repository; see
[`test/jdk/NOTICE.md`](test/jdk/NOTICE.md).

## Licensing

OpenJDK is distributed under the **GNU General Public License, version 2 only,
with the Classpath Exception** (GPLv2+CE). A translation of GPLv2+CE source is a
derivative work of it. The Classpath Exception permits *linking* without the GPL
propagating to the linking program; it does not grant permission to relicense the
OpenJDK source itself under different terms.

This project therefore carries the same terms as its upstream:

```
SPDX-License-Identifier: GPL-2.0-only WITH Classpath-exception-2.0
```

### What this means if you depend on this library

The Classpath Exception is what makes this practically usable. You may depend on
`bigdecimal.js` from a program under **any** license, including a proprietary,
closed-source one, without that program becoming subject to the GPL. The GPL's
obligations attach to this library's own source and to modifications of it — not
to independent modules that merely link against it.

If you modify `bigdecimal.js` itself and distribute the result, those
modifications are covered by the GPL.

### Licensing history

Releases up to and including **1.7.0** were published under Apache-2.0. That grant
cannot be and is not being retracted: anyone who received those versions under
Apache-2.0 retains that license for those versions. The change to GPLv2+CE applies
to **1.7.1 and later**, correcting the licensing to match the upstream work this
software is derived from.

## Open items

These are recorded rather than resolved, and should be confirmed with counsel:

1. **Third-party contributions to `src/bigdecimal.ts`.** Two contributors other
   than the project owner have authored code in the ported file, while the project
   was labelled Apache-2.0:

   | Contributor | PR | Change |
   | --- | --- | --- |
   | `guerin olivier` | [#99](https://github.com/srknzl/bigdecimal.js/pull/99) | +106 lines — `compareTo` aliases |
   | `guerin olivier` | [#72](https://github.com/srknzl/bigdecimal.js/pull/72) | +11 / −9 — unsafe-number conversion |
   | `zdu-strong` | [#163](https://github.com/srknzl/bigdecimal.js/pull/163) | +34 lines — `toJSON` |

   These are original, public-API contributions rather than de minimis edits, so
   they are not simply disregardable. However, `CONTRIBUTING.md` had contributors
   grant their work under Apache-2.0, and Apache-2.0 §2 expressly grants the right
   to **sublicense**. That likely permits redistributing those portions under
   GPLv2+CE without individual sign-off — the usual Apache-2.0/GPLv2
   incompatibility concern applies to *combining* separately licensed works, which
   is not quite this case.

   The remaining task is therefore to confirm that sublicense analysis with
   counsel, not necessarily to collect signatures. Obtaining explicit agreement
   from the two contributors would nonetheless remove the question entirely and is
   cheap insurance.
2. **Exception wording.** The GPLv2 text in [`LICENSE`](LICENSE) is a verbatim
   copy of the Free Software Foundation's canonical text. The Classpath Exception
   paragraph appended to it should be verified byte-for-byte against
   <https://openjdk.org/legal/gplv2+ce.html>.
3. **Downstream impact.** Some automated license scanners flag anything matching
   `GPL-2.0` regardless of the Classpath Exception. Consumers whose policy blocks
   on that string may need the exception pointed out to them explicitly.
