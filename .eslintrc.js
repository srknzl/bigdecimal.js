module.exports = {
    'env': {
        'commonjs': true,
        'node': true,
        'es2020': true
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'tsconfigRootDir': __dirname,
        'project': 'tsconfig.eslint.json'
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    'rules': {
        '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
        'arrow-spacing': [
            'error',
            {
                'after': true,
                'before': true
            }
        ],
        'strict': 'error',
        'block-spacing': 'error',
        'brace-style': [
            'error',
            '1tbs'
        ],
        'camelcase': 'error',
        'comma-spacing': [
            'error',
            {
                'after': true,
                'before': false
            }
        ],
        'comma-style': [
            'error',
            'last'
        ],
        'eol-last': 'error',
        'func-call-spacing': 'error',
        'keyword-spacing': [
            'error',
            {
                'after': true,
                'before': true
            }
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'max-len': [
            'error',
            {
                'code': 130
            }
        ],
        'prefer-const': 'error',
        'quotes': [
            'error',
            'single'
        ],
        'semi': 'error',
        'semi-style': [
            'error',
            'last'
        ],
        'space-before-blocks': 'error',
        'spaced-comment': [
            'error',
            'always'
        ],
        'no-trailing-spaces': 'error',
        'no-multi-spaces': 'error',
        'no-multiple-empty-lines': [
            'error',
            {
                'max': 1
            }
        ],
        'no-useless-concat': 'error',
        'indent': ['warn', 4, {
            'CallExpression': {
                'arguments': 1
            },
            'VariableDeclarator': 'off',
            'outerIIFEBody': 'off',
            'MemberExpression': 'off',
            'FunctionDeclaration': {
                'parameters': 'off'
            },
            'FunctionExpression': {
                'parameters': 'off'
            },
            'ArrayExpression': 'off',
            'ObjectExpression': 'off',
            'ImportDeclaration': 'off',
            'ignoredNodes': [
                'SwitchCase',
                'FunctionDeclaration > BlockStatement.body',
                'FunctionExpression > BlockStatement.body'
            ]
        }],
        'space-in-parens': 'error'
    }
};
