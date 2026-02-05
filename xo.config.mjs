export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    semicolon: true,
    prettier: 'compat',
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-require-imports': 'off',
      'object-curly-spacing': 'off',
    }
  }
];