import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { ClassicEditor, Essentials, Paragraph, Heading } from 'ckeditor5';
import DefinitionList from '../src/definitionlist.js';

describe('DefinitionList', () => {
	it('should be named', () => {
		expect(DefinitionList.pluginName).to.equal('DefinitionList');
	});

	describe('init()', () => {
		let domElement: HTMLElement, editor: ClassicEditor;

		beforeEach(async () => {
			domElement = document.createElement('div');
			document.body.appendChild(domElement);

			editor = await ClassicEditor.create(domElement, {
				licenseKey: 'GPL',
				plugins: [
					Paragraph,
					Heading,
					Essentials,
					DefinitionList
				],
				toolbar: [
					'definitionList'
				]
			});
		});

		afterEach(() => {
			domElement.remove();
			return editor.destroy();
		});

		it('should load DefinitionList', () => {
			const myPlugin = editor.plugins.get('DefinitionList');

			expect(myPlugin).to.be.an.instanceof(DefinitionList);
		});

		it('should add an icon to the toolbar', () => {
			expect(editor.ui.componentFactory.has('definitionList')).to.equal(true);
		});

		it('should add a text into the editor after clicking the icon', () => {
			const icon = editor.ui.componentFactory.create('definitionList');

			expect(editor.getData()).to.equal('');

			icon.fire('execute');

			expect(editor.getData()).to.equal('<p>Hello CKEditor 5!</p>');
		});
	});
});
