module.exports = {
  extends: "erb",
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    "import/no-extraneous-dependencies": "off",
    "class-methods-use-this": "warn",
    "no-restricted-syntax": [
      // Copied from $ eslint --print-config file.js
      "error",
      {
        selector: "ForInStatement",
        message:
          "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
      },
      // {
      //   selector: 'ForOfStatement',
      //   message:
      //     'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
      // },
      {
        selector: "LabeledStatement",
        message: "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
      },
      {
        selector: "WithStatement",
        message: "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
      },
    ],
    "import/prefer-default-export": "off",
    "@typescript-eslint/lines-between-class-members": "warn",
    "@typescript-eslint/no-inferrable-types": "warn",

    // ShellPiper eslint adjustments
    yoda: ["warn", "never", { exceptRange: true }],
    "no-underscore-dangle": ["error", { allowAfterThis: true }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "no-extend-native": "off", // Extending the lame native prototype is highly encouraged
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "react/jsx-props-no-spreading": "off",
    "react/jsx-no-duplicate-props": ["error", { ignoreCase: false }],
    "no-alert": "off",
    "no-multi-assign": ["warn", { ignoreNonDeclaration: true }],
    "prefer-destructuring": [
      "warn",
      {
        array: false,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        // Enforce that boolean variables are prefixed with an allowed verb
        selector: "variable",
        types: ["boolean"],
        format: ["PascalCase"],
        prefix: ["is", "should", "has", "can", "did", "will"],
      },
      {
        // Allow underscore for parameters (indicates unused)
        selector: "parameter",
        format: ["camelCase"],
        leadingUnderscore: "allow",
      },
    ],
    "prettier/prettier": "warn",
    "import/no-cycle": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "spaced-comment": "warn",
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    "import/resolver": {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve("./.erb/configs/webpack.config.eslint.js"),
      },
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
};
