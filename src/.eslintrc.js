const path = require('path');

module.exports = {
    'env': {
        'commonjs': true,
        'node': true,
        'es2020': true
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'tsconfigRootDir': path.join(__dirname, '..'),
        'project': 'tsconfig.eslint.json'
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    'rules': {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }]
    }
};
