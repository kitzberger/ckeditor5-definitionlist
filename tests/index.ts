import { describe, expect, it } from 'vitest';
import { DefinitionList as DefinitionListDll, icons } from '../src/index.js';
import DefinitionList from '../src/definitionlist.js';

import ckeditor from './../theme/icons/ckeditor.svg';

describe('CKEditor5 DefinitionList DLL', () => {
	it('exports DefinitionList', () => {
		expect(DefinitionListDll).to.equal(DefinitionList);
	});

	describe('icons', () => {
		it('exports the "ckeditor" icon', () => {
			expect(icons.ckeditor).to.equal(ckeditor);
		});
	});
});
