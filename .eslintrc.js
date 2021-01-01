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
    "airbnb-typescript",
    "airbnb/hooks",
    // "plugin:@typescript-eslint/recommended",
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:typescript-sort-keys/recommended",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/react",
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
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        "react/prop-types": "off",
      },
    },
  ],
  rules: {
    "no-restricted-syntax": 0,
    "no-await-in-loop": 0,
    "no-continue": 0,
    "import-order-alphabetical/order": "error",
    "react/jsx-props-no-spreading": "off",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { args: "all", argsIgnorePattern: "^_" },
    ],
  },
};
