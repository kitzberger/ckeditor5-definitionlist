declare global {
	interface Window {
		editor: ClassicEditor;
	}
}

import {
	ClassicEditor,
	Autoformat,
	Base64UploadAdapter,
	BlockQuote,
	Bold,
	Code,
	CodeBlock,
	Essentials,
	GeneralHtmlSupport,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Italic,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	Style,
	Table,
	TableToolbar
} from 'ckeditor5';

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

import DefinitionList from '../src/definitionlist.js';

import 'ckeditor5/ckeditor5.css';

ClassicEditor
	.create(document.getElementById('editor')!, {
		licenseKey: 'GPL',
		plugins: [
			DefinitionList,
			Essentials,
			Autoformat,
			BlockQuote,
			Bold,
			GeneralHtmlSupport,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			Italic,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			Style,
			Table,
			TableToolbar,
			CodeBlock,
			Code,
			Base64UploadAdapter
		],
		toolbar: [
			'undo',
			'redo',
			'|',
			'definitionList',
			'|',
			'heading',
			'style',
			'|',
			'bold',
			'italic',
			'link',
			'code',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'uploadImage',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'codeBlock'
		],
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		style: {
			definitions: [
				{
					name: 'Fancy headline',
					element: 'h3',
					classes: ['fancy']
				},
				{
					name: 'Gray box',
					element: 'p',
					classes: ['gray']
				},
				{
					name: 'Green DL',
					element: 'dl',
					classes: ['green']
				},
				{
					name: 'Red DL',
					element: 'dl',
					classes: ['red']
				},
				{
					name: 'Red DT',
					element: 'dt',
					classes: ['red']
				},
				{
					name: 'Blue DT',
					element: 'dt',
					classes: ['blue']
				}
			]
		}
	})
	.then(editor => {
		window.editor = editor;
		CKEditorInspector.attach(editor);
		window.console.log('CKEditor 5 is ready.', editor);
	})
	.catch(err => {
		window.console.error(err.stack);
	});
