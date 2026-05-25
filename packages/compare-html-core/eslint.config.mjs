import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfig from '@compare-html/eslint-config/base-ts';

export default defineConfig([
  eslintConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },
  },
  globalIgnores(['dist/**', 'node_modules/**', '.coverage/**']),
]);
