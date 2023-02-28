module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["import", "prettier", "@typescript-eslint"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: ["prettier", "eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    "no-duplicate-imports": "error",
    "sort-imports": ["error", { ignoreCase: true, ignoreDeclarationSort: true }],
    "import/order": [
      1,
      {
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "@typescript-eslint/no-var-requires": "off",
  },
};
