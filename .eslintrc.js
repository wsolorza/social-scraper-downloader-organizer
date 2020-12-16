module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: [
    "import",
    "eslint-plugin-import-order-alphabetical",
    "typescript-sort-keys",
  ],
  extends: [
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:typescript-sort-keys/recommended",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/prettier",
  ],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    "import-order-alphabetical/order": "error",
    "no-restricted-syntax": 0,
    "no-await-in-loop": 0,
    "no-continue": 0,
  },
};
