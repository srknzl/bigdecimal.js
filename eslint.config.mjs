import globals from 'globals';
import tseslint from 'typescript-eslint';

// Shared stylistic rules (carried over unchanged from the old .eslintrc).
const stylistic = {
    'arrow-spacing': ['error', { 'after': true, 'before': true }],
    'block-spacing': 'error',
    'brace-style': ['error', '1tbs'],
    'camelcase': 'error',
    'comma-spacing': ['error', { 'after': true, 'before': false }],
    'comma-style': ['error', 'last'],
    'eol-last': 'error',
    'func-call-spacing': 'error',
    'keyword-spacing': ['error', { 'after': true, 'before': true }],
    'linebreak-style': ['error', 'unix'],
    'max-len': ['error', { 'code': 130 }],
    'prefer-const': 'error',
    'quotes': ['error', 'single'],
    'semi': 'error',
    'semi-style': ['error', 'last'],
    'space-before-blocks': 'error',
    'spaced-comment': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 1 }],
    'no-useless-concat': 'error',
    'indent': ['warn', 4, {
        'CallExpression': { 'arguments': 1 },
        'VariableDeclarator': 'off',
        'outerIIFEBody': 'off',
        'MemberExpression': 'off',
        'FunctionDeclaration': { 'parameters': 'off' },
        'FunctionExpression': { 'parameters': 'off' },
        'ArrayExpression': 'off',
        'ObjectExpression': 'off',
        'ImportDeclaration': 'off',
        'ignoredNodes': [
            'SwitchCase',
            'FunctionDeclaration > BlockStatement.body',
            'FunctionExpression > BlockStatement.body'
        ]
    }],
    'space-in-parens': 'error',
    'eqeqeq': 'error'
};

export default tseslint.config(
    {
        ignores: [
            'lib/',
            'docs/',
            'coverage/',
            '.nyc_output/',
            'util/testNumbers.js',
            'website/.vitepress/cache/',
            'website/.vitepress/dist/'
        ]
    },
    // Plain JS (tests, benchmarks, util): same rule surface as before the flat-config migration.
    {
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'commonjs',
            globals: { ...globals.node, ...globals.mocha }
        },
        rules: {
            'strict': 'error',
            ...stylistic
        }
    },
    {
        files: ['**/*.mjs'],
        languageOptions: { sourceType: 'module' },
        rules: { 'strict': 'off' }
    },
    // Library source: type-checked linting.
    {
        files: ['src/**/*.ts'],
        extends: [tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            ...stylistic,
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }]
        }
    }
);
