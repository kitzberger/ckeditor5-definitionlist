import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	build: {
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: () => 'index.js'
		},
		outDir: 'dist',
		rollupOptions: {
			external: [
				'@ckeditor/ckeditor5-core',
				'@ckeditor/ckeditor5-ui',
				'@ckeditor/ckeditor5-utils',
				'@ckeditor/ckeditor5-engine'
			]
		}
	},
	plugins: [
		dts({ insertTypesEntry: true }),
		viteStaticCopy({
			targets: [
				{
					src: 'src/icon.svg',
					dest: ''
				}
			]
		})
	]
});
