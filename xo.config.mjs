export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    semicolon: true,
    prettier: 'compat',
    rules: {
      semi: ["error", "always"],
      "space-infix-ops": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {argsIgnorePattern: "^_"}
      ],
      '@typescript-eslint/no-require-imports': 'off',
      'object-curly-spacing': 'off',
    }
  }
];