import eslintPluginImport from "eslint-plugin-import"
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y"
import eslintPluginPrettier from "eslint-plugin-prettier/recommended"
import eslintPluginReact from "eslint-plugin-react"
import eslintPluginReactHooks from "eslint-plugin-react-hooks"
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
  // Ignore directories
  {
    ignores: [
      "ignition/deployments",
      "artifacts",
      "cache",
      "build",
      ".next",
      ".vercel",
      "**/constants.ts",
    ],
  },
  // General configuration
  {
    rules: {
      "padding-line-between-statements": [
        "warn",
        {
          blankLine: "always",
          prev: "*",
          next: ["return", "break", "export"],
        },
        {
          blankLine: "always",
          prev: ["const", "let", "var"],
          next: "*",
        },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
      ],
      "no-console": "warn",
    },
  },
  // TypeScript configuration
  ...[
    ...tseslint.configs.recommended,
    {
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            args: "after-used",
            ignoreRestSiblings: false,
            argsIgnorePattern: "^_.*?$",
          },
        ],
      },
    },
  ],
  // Import configuration
  ...[
    eslintPluginImport.flatConfigs.recommended,
    {
      rules: {
        "import/no-default-export": "off",
        "import/order": [
          "warn",
          {
            "groups": [
              "type",
              "builtin",
              "object",
              "external",
              "internal",
              "parent",
              "sibling",
              "index",
            ],
            "pathGroups": [
              {
                pattern: "~/**",
                group: "external",
                position: "after",
              },
            ],
            "alphabetize": {
              order: "asc",
              caseInsensitive: true,
            },
            "newlines-between": "always",
          },
        ],
      },
      settings: {
        "import/resolver": {
          typescript: true,
          node: true,
        },
      },
    },
  ],
  // React configuration
  {
    plugins: {
      "react": eslintPluginReact,
      "react-hooks": eslintPluginReactHooks,
      "jsx-a11y": eslintPluginJsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginJsxA11y.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
    },
  },
  // Tailwind CSS configuration
  ...eslintPluginTailwindcss.configs["flat/recommended"],
  // Prettier configuration
  ...[
    eslintPluginPrettier,
    {
      rules: {
        "prettier/prettier": "warn",
      },
    },
  ],
]
