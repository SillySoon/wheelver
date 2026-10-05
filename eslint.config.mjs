// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default tseslint.config(
    { ignores: ["dist/", "node_modules/", "_backup/", "coverage/"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts", "tests/**/*.ts", "scripts/**/*.ts"],
        languageOptions: { globals: globals.node },
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["public/js/**/*.js"],
        languageOptions: { globals: globals.browser, sourceType: "script" },
    },
    prettier,
);
