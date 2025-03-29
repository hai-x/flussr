import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'
import globals from 'globals'

import prettier from 'eslint-config-prettier'

export default tseslint.config(
  globalIgnores(['**/node_modules/**', '**/dist/**', '**/.flussr/**']),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off'
    }
  },
  {
    name: 'main',
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2022
      },
      globals: {
        ...globals.es2021,
        ...globals.node
      }
    }
  }
)
