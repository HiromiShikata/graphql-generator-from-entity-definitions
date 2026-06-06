const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importX = require('eslint-plugin-import-x');

const isUnknownOrConst = (typeAnnotation) => {
  if (!typeAnnotation) {
    return false;
  }
  if (typeAnnotation.type === 'TSUnknownKeyword') {
    return true;
  }
  if (
    typeAnnotation.type === 'TSTypeReference' &&
    typeAnnotation.typeName &&
    typeAnnotation.typeName.type === 'Identifier' &&
    typeAnnotation.typeName.name === 'const'
  ) {
    return true;
  }
  return false;
};

const noTypeAssertionPlugin = {
  rules: {
    'no-type-assertion': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'disallow type assertions in TypeScript code',
        },
        messages: {
          typeAssertion: 'Do not use type assertion',
          asOperator: 'Do not use `as` operator for type assertion',
          nonNullAssertion: 'Do not use non-null assertion operator',
        },
        schema: [],
      },
      create(context) {
        return {
          TSTypeAssertion(node) {
            if (isUnknownOrConst(node.typeAnnotation)) {
              return;
            }
            context.report({ node, messageId: 'typeAssertion' });
          },
          TSAsExpression(node) {
            if (isUnknownOrConst(node.typeAnnotation)) {
              return;
            }
            context.report({ node, messageId: 'asOperator' });
          },
          TSNonNullExpression(node) {
            context.report({ node, messageId: 'nonNullAssertion' });
          },
        };
      },
    },
  },
};

module.exports = [
  {
    ignores: ['bin/**', 'node_modules/**', 'reports/**', 'coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended-type-checked'],
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
    },
    plugins: {
      'import-x': importX,
      'no-type-assertion': noTypeAssertionPlugin,
    },
    settings: {
      'import-x/extensions': ['.ts', '.tsx', '.js', '.jsx'],
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import-x/resolver': {
        node: {
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-type-assertion/no-type-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/domain',
              from: './src/adapter',
            },
            {
              target: './src/domain/entities',
              from: './src/domain/usecases',
            },
            {
              target: './src/adapter/repositories',
              from: './src/adapter/entry-points',
            },
          ],
        },
      ],
    },
  },
];
