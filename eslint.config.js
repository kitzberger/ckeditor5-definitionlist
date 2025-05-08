import js from '@eslint/js';
import pluginTs from '@typescript-eslint/eslint-plugin';
import parserTs from '@typescript-eslint/parser';

export default [
	js.configs.recommended,
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			parser: parserTs,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: process.cwd()
			}
		},
		plugins: {
			'@typescript-eslint': pluginTs
		},
		rules: {
			...pluginTs.configs.recommended.rules,
			// Add your own rules here:
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	}
];
