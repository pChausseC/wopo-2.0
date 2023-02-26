module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["prettier", "@typescript-eslint"],
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
  },
};
