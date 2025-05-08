import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import definitionListIcon from './definitionlist.svg';
export default class DefinitionList extends Plugin {
    static get pluginName() {
        return 'DefinitionList';
    }
    init() {
        const editor = this.editor;
        const t = editor.t;
        const model = editor.model;
        this.defineSchema();
        this.defineConverters();
        editor.commands.add('insertDefinitionList', new InsertDefinitionListCommand(editor));
        editor.commands.add('indentDefinitionTerm', new AlterDefinitionListCommand(editor, 'forward'));
        editor.commands.add('outdentDefinitionDescription', new AlterDefinitionListCommand(editor, 'backward'));
        // Register the "descriptionList" button, so it can be displayed in the toolbar.
        editor.ui.componentFactory.add('descriptionList', locale => {
            const view = new ButtonView(locale);
            view.set({
                label: t('Definition list'),
                icon: definitionListIcon,
                tooltip: true
            });
            const command = editor.commands.get('insertDefinitionList');
            view.bind('isOn').to(command, 'value');
            view.on('execute', () => {
                editor.execute('insertDefinitionList');
                editor.editing.view.focus();
            });
            return view;
        });
        // this.editor.keystrokes.set('Shift+Tab', (keyEvtData, cancel) => {
        // 	return this._transformElement('definitionDescription', 'definitionTerm', cancel);
        // });
        // this.editor.keystrokes.set('Tab', (keyEvtData, cancel) => {
        // 	return this._transformElement('definitionTerm', 'definitionDescription', cancel);
        // });
    }
    afterInit() {
        const editor = this.editor;
        const commands = editor.commands;
        const indent = commands.get('indent');
        const outdent = commands.get('outdent');
        if (indent) {
            // Priority is high due to integration with `IndentBlock` plugin. We want to indent list first and if it's not possible
            // user can indent content with `IndentBlock` plugin.
            indent.registerChildCommand(commands.get('indentDefinitionTerm'), { priority: 'high' });
        }
        if (outdent) {
            // Priority is lowest due to integration with `IndentBlock` and `IndentCode` plugins.
            // First we want to allow user to outdent all indendations from other features then he can oudent list item.
            outdent.registerChildCommand(commands.get('outdentDefinitionDescription'), { priority: 'lowest' });
        }
    }
    defineSchema() {
        const schema = this.editor.model.schema;
        schema.register('definitionList', {
            allowWhere: '$block',
            allowContentOf: '$block',
            isBlock: true
        });
        schema.register('definitionTerm', {
            allowIn: 'definitionList',
            allowContentOf: '$block',
            isBlock: true
        });
        schema.register('definitionDescription', {
            allowIn: 'definitionList',
            allowContentOf: '$block',
            isBlock: true
        });
    }
    defineConverters() {
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
            view: (modelElement, { writer }) => writer.createContainerElement('dl')
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'definitionTerm',
            view: (modelElement, { writer }) => writer.createEditableElement('dt')
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'definitionDescription',
            view: (modelElement, { writer }) => writer.createEditableElement('dd')
        });
    }
}
class InsertDefinitionListCommand extends Command {
    constructor(editor) {
        super(editor);
        this.value = false;
    }
    execute() {
        const editor = this.editor;
        const model = editor.model;
        model.change(writer => {
            const dl = writer.createElement('definitionList');
            const dt = writer.createElement('definitionTerm');
            const dd = writer.createElement('definitionDescription');
            writer.insertText('Term', dt);
            writer.insertText('Definition', dd);
            writer.append(dt, dl);
            writer.append(dd, dl);
            model.insertContent(dl);
            writer.setSelection(dt, 'end');
        });
    }
    refresh() {
        var _a;
        const model = this.editor.model;
        const selection = model.document.selection;
        const isInDefinitionList = !!((_a = selection.getFirstPosition()) === null || _a === void 0 ? void 0 : _a.findAncestor('definitionList'));
        this.isEnabled = true;
        this.value = isInDefinitionList;
    }
}
class AlterDefinitionListCommand extends Command {
    constructor(editor, indentDirection) {
        super(editor);
        this._direction = indentDirection;
        this._source = this._direction === 'forward' ? 'definitionTerm' : 'definitionDescription';
        this._target = this._direction === 'backward' ? 'definitionTerm' : 'definitionDescription';
    }
    refresh() {
        var _a;
        const model = this.editor.model;
        const selection = model.document.selection;
        const position = selection.getFirstPosition();
        const element = position === null || position === void 0 ? void 0 : position.parent;
        this.isEnabled = (_a = element === null || element === void 0 ? void 0 : element.is('element', this._source)) !== null && _a !== void 0 ? _a : false;
    }
    execute() {
        this._transformElement(this._source, this._target, () => { });
    }
    _transformElement(from, to, cancel) {
        const model = this.editor.model;
        const selection = model.document.selection;
        const position = selection.getFirstPosition();
        const element = position === null || position === void 0 ? void 0 : position.parent;
        if (element === null || element === void 0 ? void 0 : element.is('element', from)) {
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
