import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '.orch/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Best-effort localStorage access intentionally ignores failures.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['src/components/Sidebar.tsx'],
    rules: {
      // tighten after v0.3: existing navigation icon props use React.FC<any>.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
