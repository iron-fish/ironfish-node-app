module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "next/core-web-vitals",
    "prettier",
  ],
  // ignore patterns
  ignorePatterns: ["node_modules/*", "app/*", "dist/*", "renderer/.next/*"],
};
