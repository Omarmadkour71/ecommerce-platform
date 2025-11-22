import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],

    // Plugins (flat config syntax)
    plugins: {
      prettier: require("eslint-plugin-prettier"),
    },

    extends: [
      js.configs.recommended,
      "airbnb",
      "prettier",
      "plugin:node/recommended",
    ],

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },

    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],

      "spaced-comment": "off",
      "no-console": "off",
      "consistent-return": "off",
      "func-names": "off",
      "object-shorthand": "off",
      "no-process-exit": "off",
      "no-param-reassign": "off",
      "no-return-await": "off",
      "no-underscore-dangle": "off",
      "class-methods-use-this": "off",

      "prefer-destructuring": ["error", { object: true, array: false }],

      "no-unused-vars": ["error", { argsIgnorePattern: "req|res|next|val" }],
    },
  },
]);
