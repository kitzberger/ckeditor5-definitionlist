import { Plugin, ButtonView, Command, StyleUtils, type MultiCommand, type Editor } from 'ckeditor5';
import { updateViewAttributesDefinitionListPlugin as updateViewAttributes } from './utils.js';

import definitionListIcon from './icon.svg';

export default class DefinitionList extends Plugin {
	public static get pluginName() {
		return 'DefinitionList' as const;
	}

	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		this.defineSchema();
		this.defineConverters();

		editor.commands.add('insertDefinitionList', new InsertDefinitionListCommand(editor));
		editor.commands.add('indentDefinitionTerm', new AlterDefinitionListCommand(editor, 'forward'));
		editor.commands.add('outdentDefinitionDescription', new AlterDefinitionListCommand(editor, 'backward'));

		// Register the "definitionList" button, so it can be displayed in the toolbar.
		editor.ui.componentFactory.add('definitionList', locale => {
			const view = new ButtonView(locale);

			view.set({
				label: t('Definition list'),
				icon: definitionListIcon,
				tooltip: true
			});

			const command = editor.commands.get('insertDefinitionList') as InsertDefinitionListCommand;
			view.bind('isOn').to(command, 'value');

			view.on('execute', () => {
				editor.execute('insertDefinitionList');
				editor.editing.view.focus();
			});

			return view;
		});

		if (this.editor.plugins.has('StyleUtils')) {
			const _styleUtils = editor.plugins.get(StyleUtils);
			this.listenTo(_styleUtils, 'isStyleEnabledForBlock', (evt, [definition, block]) => {
				// console.log('isStyleEnabledForBlock(' + definition.element + ')');
				if (block.is('element', 'definitionList') && definition.element === 'dl' ||
					block.is('element', 'definitionTerm') && definition.element === 'dt' ||
					block.is('element', 'definitionDescription') && definition.element === 'dd') {
					evt.return = true;
					evt.stop();
				}
			}, { priority: 'high' });

			this.listenTo(_styleUtils, 'isStyleActiveForBlock', (evt, [definition, block]) => {
				// console.log('isStyleActiveForBlock(' + definition.element + ')');
				if (
					(
						block.is('element', 'definitionList') && definition.element === 'dl' ||
						block.is('element', 'definitionTerm') && definition.element === 'dt' ||
						block.is('element', 'definitionDescription') && definition.element === 'dd'
					) &&
					block.getAttribute('class')?.split(' ').includes(definition.classes[0])
				) {
					evt.return = true;
					evt.stop();
				}
			}, { priority: 'high' });

			this.listenTo(_styleUtils, 'getAffectedBlocks', (evt, [definition, block]) => {
				// console.log('getAffectedBlocks(' + definition.element + ')');
				if (block.is('element', 'definitionList') && definition.element === 'dl' ||
					block.is('element', 'definitionTerm') && definition.element === 'dt' ||
					block.is('element', 'definitionDescription') && definition.element === 'dd'
				) {
					evt.return = [block];
					evt.stop();
				}
			}, { priority: 'high' });
		}
	}

	public afterInit(): void {
		const editor = this.editor;
		const commands = editor.commands;
		const model = editor.model;
		const doc = model.document;
		const indent = commands.get('indent') as MultiCommand;
		const outdent = commands.get('outdent') as MultiCommand;

		if (indent) {
			// Priority is high due to integration with `IndentBlock` plugin. We want to indent list first and if it's not possible
			// user can indent content with `IndentBlock` plugin.
			indent.registerChildCommand(commands.get('indentDefinitionTerm')!, { priority: 'high' });
		}

		this.editor.keystrokes.set('Tab', (keyEvtData, cancel) => {
			editor.execute('indentDefinitionTerm');
			cancel();
		});

		if (outdent) {
			// Priority is lowest due to integration with `IndentBlock` and `IndentCode` plugins.
			// First we want to allow user to outdent all indendations from other features then he can oudent list item.
			outdent.registerChildCommand(commands.get('outdentDefinitionDescription')!, { priority: 'lowest' });
		}

		this.editor.keystrokes.set('Shift+Tab', (keyEvtData, cancel) => {
			editor.execute('outdentDefinitionDescription');
			cancel();
		});

		editor.editing.view.document.on('keydown', (evt, data) => {
			const selection = doc.selection;
			const position = selection.getFirstPosition();
			const parent = position?.parent;

			// Handle Delete at the end of a <dd>
			if (
				data.domEvent.key === 'Delete' &&
				parent?.is('element', 'definitionDescription') &&
				position?.isAtEnd
			) {
				const next = parent.nextSibling;

				if (next?.is('element', 'definitionDescription')) {
					evt.stop();
					data.preventDefault();

					model.change(writer => {
						// Move contents of next <dd> into current <dd>
						const range = writer.createRangeIn(next);
						const insertPos = writer.createPositionAt(parent, 'end');
						writer.move(range, insertPos);

						// Remove the now-empty <dd>
						writer.remove(next);

						// Reselect at end of merged content
						writer.setSelection(insertPos);
					});
				}
			}

			// Handle Backspace at the beginning of a <dd>
			if (
				data.domEvent.key === 'Backspace' &&
				parent?.is('element', 'definitionDescription') &&
				position?.isAtStart
			) {
				const previous = parent.previousSibling;

				if (previous?.is('element', 'definitionDescription')) {
					evt.stop();
					data.preventDefault();

					model.change(writer => {
						// Move contents of current <dd> into the previous <dd>
						const range = writer.createRangeIn(parent);
						const insertPos = writer.createPositionAt(previous, 'end');
						writer.move(range, insertPos);

						// Remove the now-empty <dd>
						writer.remove(parent);

						// Set selection to end of merged content
						writer.setSelection(insertPos);
					});
				}
			}

			// Handle Enter at the end of <dd> or <dt>
			if (data.domEvent.key === 'Enter' && data.domEvent.shiftKey === false) {
				if (parent?.is('element', 'definitionDescription') || parent?.is('element', 'definitionTerm')) {
					const dl = parent.findAncestor('definitionList');
					const isAtEnd = position?.isAtEnd;

					if (dl && isAtEnd) {
						data.preventDefault();
						evt.stop();

						if (parent.isEmpty) {
							// console.log('Create a new <p>!');
							model.change(writer => {
								const paragraph = writer.createElement('paragraph');
								writer.insert(paragraph, model.createPositionAfter(dl));
								writer.setSelection(paragraph, 'in');
								writer.remove(parent);
							});
						} else {
							if (parent?.is('element', 'definitionDescription')) {
								// console.log('Create a new <dt>!');
								model.change(writer => {
									const dt = writer.createElement('definitionTerm');
									writer.insert(dt, model.createPositionAfter(parent));
									writer.setSelection(dt, 'in');
								});
							} else {
								// console.log('Create a new <dd>!');
								model.change(writer => {
									const dd = writer.createElement('definitionDescription');
									writer.insert(dd, model.createPositionAfter(parent));
									writer.setSelection(dd, 'in');
								});
							}
						}
					}
				}
			}

			// Handle Delete/Backspace at an empty <dd> or <dt>
			if (data.domEvent.key === 'Delete' || data.domEvent.key === 'Backspace') {
				if (parent?.is('element', 'definitionDescription') || parent?.is('element', 'definitionTerm')) {
					if (parent.isEmpty) {
						data.preventDefault();
						evt.stop();
						model.change(writer => {
							const previous = parent.previousSibling;
							if (previous) {
								const position = writer.createPositionAt(previous, 'end');
								writer.setSelection(position);
							}
							writer.remove(parent);
						});
					}
				}
			}

			// Handle Arrow Down at the end of last <dd>
			if (data.domEvent.key === 'ArrowDown' && parent?.is('element', 'definitionDescription')) {
				const dl = parent.findAncestor('definitionList');
				const isLastChild = dl?.getChild(dl.childCount - 1) === parent;
				const isAtEnd = position?.isAtEnd;

				if (dl && isLastChild && isAtEnd) {
					data.preventDefault();
					evt.stop();
					model.change(writer => {
						const paragraph = writer.createElement('paragraph');
						writer.insert(paragraph, model.createPositionAfter(dl));
						writer.setSelection(paragraph, 'in');
					});
				}
			}

			// Handle Arrow Up at the start of first <dt>
			if (data.domEvent.key === 'ArrowUp' && parent?.is('element', 'definitionTerm')) {
				const dl = parent.findAncestor('definitionList');
				const isFirstChild = dl?.getChild(0) === parent;
				const isAtStart = position?.isAtStart;

				if (dl && isFirstChild && isAtStart) {
					data.preventDefault();
					evt.stop();
					model.change(writer => {
						const paragraph = writer.createElement('paragraph');
						writer.insert(paragraph, model.createPositionBefore(dl));
						writer.setSelection(paragraph, 'in');
					});
				}
			}
		});
	}

	private defineSchema(): void {
		const schema = this.editor.model.schema;

		schema.register('definitionList', {
			allowWhere: '$block',
			allowContentOf: '$block',
			isBlock: true,
			isObject: true,
			allowAttributes: ['htmlDlAttributes']
		});

		schema.register('definitionTerm', {
			allowIn: 'definitionList',
			allowContentOf: '$block',
			isBlock: true,
			isObject: true,
			allowAttributes: ['htmlDtAttributes']
		});

		schema.register('definitionDescription', {
			allowIn: 'definitionList',
			allowContentOf: '$block',
			isBlock: true,
			isObject: true,
			allowAttributes: ['htmlDdAttributes']
		});
	}

	private defineConverters(): void {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			view: 'dl',
			model: 'definitionList'
		});

		conversion.for('upcast').elementToElement({
			view: 'dt',
			model: 'definitionTerm'
		});

		conversion.for('upcast').elementToElement({
			view: 'dd',
			model: 'definitionDescription'
		});

		conversion.for('dataDowncast').elementToElement({
			model: 'definitionList',
			view: 'dl'
		});

		conversion.for('dataDowncast').elementToElement({
			model: 'definitionTerm',
			view: 'dt'
		});

		conversion.for('dataDowncast').elementToElement({
			model: 'definitionDescription',
			view: 'dd'
		});

		conversion.for('editingDowncast').elementToElement({
			model: 'definitionList',
			view: 'dl'
		});

		conversion.for('editingDowncast').elementToElement({
			model: 'definitionTerm',
			view: 'dt'
		});

		conversion.for('editingDowncast').elementToElement({
			model: 'definitionDescription',
			view: 'dd'
		});

		conversion.for('downcast').add(dispatcher => {
			const eventNames = [
				'attribute:htmlDlAttributes',
				'attribute:htmlDtAttributes',
				'attribute:htmlDdAttributes'
			];
			eventNames.forEach(eventName => {
				dispatcher.on(eventName, (evt, data, conversionApi) => {
					// Tell the conversion API we're handling this attribute conversion
					// so nothing else tries to do something with it.
					if (!conversionApi.consumable.consume(data.item, evt.name)) {
						return;
					}

					const { attributeOldValue, attributeNewValue } = data;
					const viewCodeElement = conversionApi.mapper.toViewElement(data.item);

					updateViewAttributes(
						conversionApi.writer,
						attributeOldValue,
						attributeNewValue,
						viewCodeElement
					);
				});
			});
		});
	}
}

class InsertDefinitionListCommand extends Command {
	declare public value: boolean;

	public constructor(editor: Editor) {
		super(editor);
		this.value = false;
	}

	public override execute(): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		const isInsideDefinitionList = !!selection.getFirstPosition()?.findAncestor('definitionList');
		if (isInsideDefinitionList) {
			return; // Prevent insertion if already inside a <dl>
		}

		model.change(writer => {
			const dl = writer.createElement('definitionList');
			const dt = writer.createElement('definitionTerm');
			const dd = writer.createElement('definitionDescription');

			let selectedText = '';
			for (const range of selection.getRanges()) {
				for (const item of range.getItems()) {
					if (item.is('$textProxy')) {
						selectedText += item.data;
					}
				}
			}

			if (selectedText) {
				writer.insertText(selectedText, dt);
				model.deleteContent(selection);
			} else {
				writer.insertText('Term', dt);
			}
			writer.insertText('Definition', dd);

			writer.append(dt, dl);
			writer.append(dd, dl);

			model.insertContent(dl);
			writer.setSelection(dt, 'end');
		});
	}

	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isInDefinitionList = !!selection.getFirstPosition()?.findAncestor('definitionList');
		this.isEnabled = true;
		this.value = isInDefinitionList;
	}
}

class AlterDefinitionListCommand extends Command {
	private readonly _direction: 'forward' | 'backward';
	private readonly _source: 'definitionTerm' | 'definitionDescription';
	private readonly _target: 'definitionTerm' | 'definitionDescription';

	public constructor(editor: Editor, indentDirection: 'forward' | 'backward') {
		super(editor);
		this._direction = indentDirection;
		this._source = this._direction === 'forward' ? 'definitionTerm' : 'definitionDescription';
		this._target = this._direction === 'backward' ? 'definitionTerm' : 'definitionDescription';
	}

	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const position = selection.getFirstPosition();
		const element = position?.parent;
		this.isEnabled = element?.is('element', this._source) ?? false;
	}

	public override execute(): void {
		this._transformElement(this._source, this._target, () => {});
	}

	private _transformElement(from: string, to: string, cancel: () => void): boolean {
		const model = this.editor.model;
		const selection = model.document.selection;
		const position = selection.getFirstPosition();
		const element = position?.parent;

		if (element?.is('element', from)) {
			model.change(writer => {
				const newElement = writer.createElement(to);

				// Insert the new element after the old one
				writer.insert(newElement, element, 'after');

				// Move all child nodes into the new element
				const range = writer.createRangeIn(element);
				writer.move(range, writer.createPositionAt(newElement, 0));

				// Remove the old element
				writer.remove(element);

				// Set selection into the new element
				writer.setSelection(newElement, 'in');
			});

			cancel(); // prevent native behavior
			return true;
		}

		return false;
	}
}
