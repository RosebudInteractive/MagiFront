module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'airbnb-typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    'import/no-unresolved': 'off',
    'react/jsx-filename-extension': [2, { 'extensions': ['.js', '.jsx', '.ts', '.tsx'] }],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'import/extensions': 'off',
	"linebreak-style": 0,
    "react/jsx-props-no-spreading": [2, {
      "html": "ignore",
      "custom": "enforce",
      "explicitSpread": "enforce",
      }],
    "react/require-default-props": 'warn',
    // "react/function-component-definition": [2, {
    //   "namedComponents": "function-declaration" | "function-expression" | "arrow-function" | Array<"function-declaration" | "function-expression" | "arrow-function">,
    //   "unnamedComponents": "function-expression" | "arrow-function" | Array<"function-expression" | "arrow-function">
    // }]
  },
};
