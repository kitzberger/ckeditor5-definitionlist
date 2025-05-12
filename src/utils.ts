/**
 * Copied from @ckeditor/ckeditor5-html-support/src/utils.js
 * and renamed to avoid potential conflicts with environments
 * that included said file themselves.
 */

import type {
	DowncastWriter,
	ViewElement
} from 'ckeditor5';

interface GHSViewAttributes {
	attributes?: Record<string, unknown>;
	classes?: Array<string>;
	styles?: Record<string, string>;
}

/**
* Helper function for the downcast converter. Updates attributes on the given view element.
*
* @param writer The view writer.
* @param oldViewAttributes The previous GHS attribute value.
* @param newViewAttributes The current GHS attribute value.
* @param viewElement The view element to update.
*/
export function updateViewAttributesDefinitionListPlugin(
	writer: DowncastWriter,
	oldViewAttributes: GHSViewAttributes,
	newViewAttributes: GHSViewAttributes,
	viewElement: ViewElement
): void {
	if (oldViewAttributes) {
		removeViewAttributesDefinitionListPlugin(writer, oldViewAttributes, viewElement);
	}

	if (newViewAttributes) {
		setViewAttributesDefinitionListPlugin(writer, newViewAttributes, viewElement);
	}
}

/**
 * Helper function for the downcast converter. Sets attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 */
export function setViewAttributesDefinitionListPlugin(
	writer: DowncastWriter,
	viewAttributes: GHSViewAttributes,
	viewElement: ViewElement
): void {
	if (viewAttributes.attributes) {
		for (const [key, value] of Object.entries(viewAttributes.attributes)) {
			writer.setAttribute(key, value, viewElement);
		}
	}

	if (viewAttributes.styles) {
		writer.setStyle(viewAttributes.styles, viewElement);
	}

	if (viewAttributes.classes) {
		writer.addClass(viewAttributes.classes, viewElement);
	}
}

/**
 * Helper function for the downcast converter. Removes attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 */
export function removeViewAttributesDefinitionListPlugin(
	writer: DowncastWriter,
	viewAttributes: GHSViewAttributes,
	viewElement: ViewElement
): void {
	if (viewAttributes.attributes) {
		for (const [key] of Object.entries(viewAttributes.attributes)) {
			writer.removeAttribute(key, viewElement);
		}
	}

	if (viewAttributes.styles) {
		for (const style of Object.keys(viewAttributes.styles)) {
			writer.removeStyle(style, viewElement);
		}
	}

	if (viewAttributes.classes) {
		writer.removeClass(viewAttributes.classes, viewElement);
	}
}
