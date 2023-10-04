module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "next/core-web-vitals",
    "prettier",
  ],
  rules: {
    "no-else-return": "error",
  },
  ignorePatterns: ["node_modules/*", "app/*", "dist/*", "renderer/.next/*"],
};
