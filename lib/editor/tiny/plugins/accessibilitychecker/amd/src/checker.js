// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    tiny_accessibilitychecker
 * @copyright  2022, Stevani Andolo  <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Templates from 'core/templates';
import {get_string as getString} from 'core/str';
import {saveCancelPromise} from 'core/notification';
import {component} from './common';
import * as Modal from 'core/modal_factory';
import * as ModalEvents from 'core/modal_events';
import {ColorBase} from './colorbase';

export default class {

    constructor(editor) {
        this.editor = editor;
        this.colorBase = new ColorBase();
        this.selectedNode = null;
        this.modal = null;
    }

    async displayDialogue() {
        await this.setSelectedNode();
        Modal.create({
            type: Modal.types.DEFAULT,
            large: true,
            title: getString('pluginname', component),
            body: this.getDialogueContent()
        }).then(modal => {
            this.modal = modal;
            modal.getRoot().on(ModalEvents.hidden, () => {
                if (!this.selectedNode || (this.selectedNode && !['TD', 'TABLE'].includes(this.selectedNode.nodeName))) {
                    if (this.selectedNode) {
                        this.selectAndScroll(this.selectedNode);
                    }
                    this.editor.dom.select('body')[0].focus();
                }
                modal.destroy();
                this.selectedNode = null;
            });
            modal.show();
            return modal;
        }).catch();
    }

    /**
     * Set selected node if any has been selected.
     *
     * @method setSelectedNode
     * @return {boolean} The content to place in the dialogue.
     */
    async setSelectedNode() {
        const selectedNode = this.editor.selection.getNode();

        // Set the selected node if the current selected node is not 'body'.
        if (selectedNode.nodeName !== 'BODY') {
            this.selectedNode = selectedNode;
        }

        // Set the selected node to null if:
        // 1. Selected node name is 'p' and is empty,
        // 2. Or selected node name is 'br',
        // 3. Or selected node name is 'br' and has 'data-mce-bogus' attribute.
        if (this.selectedNode?.nodeName === 'P' && this.selectedNode?.textContent === '' ||
            this.selectedNode?.nodeName === 'BR' ||
            this.selectedNode?.nodeName === 'BR' && this.selectedNode?.hasAttribute('data-mce-bogus')) {
            this.selectedNode = null;
        }

        // Set selected node to null if user chose 'Yes' from the confirmation.
        if (this.selectedNode) {
            const checkAll = await this.checkConfirmation();
            this.selectedNode = checkAll ? null : this.selectedNode;
        }
    }

    /**
     * Confirm whether the user wants to do the accessibility check on selected element or everything.
     *
     * @returns {Promise<boolean>} Whether the user confirmed the check.
     */
    async checkConfirmation() {
        try {
            await saveCancelPromise(
                await getString("check_title", component),
                await getString("check_desc", component),
                await getString("confirm_yes", component)
            );
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Return the dialogue content.
     *
     * @method getDialogueContent
     * @return {Node} The content to place in the dialogue.
     */
     async getDialogueContent() {
        let currentdesc = '';
        let warnings = [];
        this.getWarnings().map(async(top) => {
            let object = [];
            top.map(async(warning) => {
                if (warning.key?.includes(':stringlang')) {
                    warning.key = warning.key.split(':stringlang')[0];
                }
                currentdesc = (currentdesc === warning.key) ? currentdesc : warning.key;

                if (warning.text?.includes(':stringlang')) {
                    warning.text = await getString(warning.text.split(':stringlang')[0], component);
                }
                object.push(warning);
            });
            warnings.push({'description': await getString(currentdesc, component), 'dataobject': object});
        });

        const content = await Templates.render('tiny_accessibilitychecker/warning_content', {
            data: warnings
        });

        const parsedHtml = this.parseHtml(content);
        this.setSelection(parsedHtml);
        return parsedHtml;
    }

    /**
     * Parsed string of htmls into html elements.
     *
     * @method parseHtml
     * @param {html} html
     * @return {node} parsed html
     */
    parseHtml(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        return doc.body.firstElementChild;
    }

    /**
     * Add listerner to every anchor to perform a selection.
     *
     * @method setSelection
     * @param {content} content
     */
    setSelection(content) {
        content.querySelectorAll('a').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const node = e.currentTarget.getAttribute('sourceNode');
                let nodeId = e.currentTarget.getAttribute('nodeId');
                nodeId = (nodeId === 'null') ? 0 : nodeId;

                if (node) {
                    if (node.includes(',') || node === 'body') {
                        this.selectAndScroll(this.editor.dom.select('body')[0]);
                    } else {
                        this.selectAndScroll(this.editor.dom.select(node)[nodeId]);
                    }
                }
                this.closeModal();
            });
        });
    }

    /**
     * Set the selection and scroll to the selected element.
     *
     * @method selectAndScroll
     * @param {Node} node
     */
    selectAndScroll(node) {
        this.selectedNode = node;
        this.editor.selection.select(node).scrollIntoView({
            behavior: 'smooth', block: 'nearest'
        });
    }

    /**
     * Close current modal.
     *
     * @method closeModal
     */
    closeModal() {
        this.modal.destroy();
    }

    /**
     * Find all problems with the content editable region.
     *
     * @method getWarnings
     * @return {Node} A complete list of all warnings and problems.
     * @private
     */
    getWarnings() {
        let warnings = [];
        let selectedNodeName = this.selectedNode ? this.selectedNode.nodeName.toLowerCase() : null;
        selectedNodeName = selectedNodeName === 'td' ? 'table' : selectedNodeName;

        // Check Images with no alt text or dodgy alt text.
        if (selectedNodeName === null || selectedNodeName === 'img') {
            const warning = this.createWarning('imagesmissingalt', this.checkImage(), true);
            if (warning.length > 0) {
                warnings.push(warning);
            }
        }

        if (selectedNodeName === null || (selectedNodeName !== 'img' && selectedNodeName !== 'table')) {
            const warning = this.createWarning('needsmorecontrast', this.checkOtherElements(selectedNodeName), false);
            if (warning.length > 0) {
                warnings.push(warning);
            }
        }

        // Check for no headings.
        if (this.editor.getContent({format: 'text'}).length > 1000 && this.editor.dom.select('h3,h4,h5').length < 1) {
            const warning = this.createWarning('needsmoreheadings', [this.editor], false);
            if (warning.length > 0) {
                warnings.push(warning);
            }
        }

        if (selectedNodeName === null || selectedNodeName === 'table') {
            // Check for tables with no captions.
            let warning = this.createWarning('tablesmissingcaption', this.checkTableCaption(), false);
            if (warning.length > 0) {
                warnings.push(warning);
            }

            // Check for tables with merged cells.
            warning = this.createWarning('tableswithmergedcells', this.checkTableMergedCells(), false);
            if (warning.length > 0) {
                warnings.push(warning);
            }

            // Check for tables with no row/col headers.
            warning = this.createWarning('tablesmissingheaders', this.checkTableHeaders(), false);
            if (warning.length > 0) {
                warnings.push(warning);
            }
        }

        if (warnings.length < 1) {
            warnings.push([{
                key: this.selectedNode ? 'nowarningonselected:stringlang' : 'nowarnings:stringlang',
                nowarning: true
            }]);
        }
        return warnings;
    }

    /**
     * Generate the HTML that lists the found warnings.
     *
     * @method createWarning
     * @param {String} description Description of this failure.
     * @param {array} nodes An array of failing nodes.
     * @param {boolean} imagewarnings true if the warnings are related to images, false if text.
     * @return {array} array of objects
     */
    createWarning(description, nodes, imagewarnings) {
        let warnings = [];
        let text, src;
        for (let i = 0; i < nodes.length; i++) {
            if (imagewarnings) {
                src = nodes[i].getAttribute('src');
            } else {
                if ('innerText' in nodes[i]) {
                    text = nodes[i].innerText.trim();
                } else if ('textContent' in nodes[i]) {
                    text = nodes[i].textContent.trim();
                }

                if (text === '') {
                    text = 'emptytext:stringlang';
                }

                if (nodes[i] === this.editor) {
                    text = 'entiredocument:stringlang';
                    const childnodes = nodes[i].dom.select('body')[0].childNodes;
                    if (childnodes.length > 1) {
                        nodes[i] = 'body';
                    } else {
                        nodes[i] = childnodes.nodeName.toLowerCase();
                    }
                }
                text = text ?? nodes[i].nodeName;
            }
            warnings.push({
                key: description,
                sourceNode: (typeof nodes[i] === 'string') ? nodes[i] : nodes[i].nodeName.toLowerCase(),
                nodeId: nodes[i].getAttribute('nodeId'),
                text: text,
                img: src
            });
        }
        return warnings;
    }

    /**
     * Check accessiblity issue only for img type.
     *
     * @method checkImage
     * @return {Node} A complete list of all warnings and problems.
     * @private
     */
    checkImage() {
        let problemNodes = [],
            index = 0;
        this.editor.dom.select('img').forEach(img => {
            img.setAttribute('nodeId', index);
            let alt = img.getAttribute('alt');
            if (typeof alt === 'undefined' || alt === '' || alt === null) {
                if (img.getAttribute('role') !== 'presentation') {
                    problemNodes.push(img);
                }
            }
            index += 1;
        });
        return problemNodes;
    }

    /**
     * Check accessiblity issue only for table with no caption.
     *
     * @method checkTableCaption
     * @return {Node} A complete list of all warnings and problems.
     * @private
     */
    checkTableCaption() {
        let problemNodes = [],
            index = 0;
        this.editor.dom.select('table').forEach(function(table) {
            table.setAttribute('nodeId', index);
            let caption = table.querySelector('caption');
            if (caption === null || caption.textContent.trim() === '') {
                problemNodes.push(table);
            }
            index += 1;
        });
        return problemNodes;
    }

    /**
     * Check accessiblity issue for not img and table only.
     *
     * @method checkOtherElements
     * @param {node} node
     * @return {Node} A complete list of all warnings and problems.
     * @private
     */
    checkOtherElements(node) {
        let problemNodes = [],
            index = 0;
        this.editor.dom.select(node ?? 'body').forEach(node => {
            node.setAttribute('nodeId', index);
            let foreground,
                background,
                ratio,
                lum1,
                lum2;

            // Check for non-empty text.
            if (node.textContent.trim() !== '') {
                foreground = this.colorBase.fromArray(
                    this.getComputedBackgroundColor(
                        node,
                        window.getComputedStyle(node, null).getPropertyValue('color')
                    ),
                    this.colorBase.TYPES.RGBA
                );
                background = this.colorBase.fromArray(
                    this.getComputedBackgroundColor(
                        node
                    ),
                    this.colorBase.TYPES.RGBA
                );

                lum1 = this.getLuminanceFromCssColor(foreground);
                lum2 = this.getLuminanceFromCssColor(background);

                // Algorithm from "http://www.w3.org/TR/WCAG20-GENERAL/G18.html".
                if (lum1 > lum2) {
                    ratio = (lum1 + 0.05) / (lum2 + 0.05);
                } else {
                    ratio = (lum2 + 0.05) / (lum1 + 0.05);
                }

                if (ratio <= 4.5) {
                    window.console.log(`
                        Contrast ratio is too low: ${ratio}
                        Colour 1: ${foreground}
                        Colour 2: ${background}
                        Luminance 1: ${lum1}
                        Luminance 2: ${lum2}
                    `);

                    // We only want the highest node with dodgy contrast reported.
                    let i = 0;
                    let found = false;
                    for (i = 0; i < problemNodes.length; i++) {
                        if (node.parentElement.indexOf(problemNodes[i]) !== -1) {
                            found = true;
                            break;
                        } else if (problemNodes[i].parentElement.indexOf(node) !== -1) {
                            problemNodes[i] = node;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        problemNodes.push(node);
                    }
                }
            }
            index += 1;
        });
        return problemNodes;
    }

    /**
     * Check accessiblity issue only for table with merged celss.
     *
     * @method checkTableMergedCells
     * @return {Node} A complete list of all warnings and problems.
     * @private
     */
    checkTableMergedCells() {
        let problemNodes = [],
            index = 0;
        this.editor.dom.select('table').forEach(table => {
            table.setAttribute('nodeId', index);
            let rowcolspan = table.querySelectorAll('[colspan], [rowspan]');
            if (rowcolspan.length > 0) {
                problemNodes.push(table);
            }
            index += 1;
        });
        return problemNodes;
    }

    /**
     * Check accessiblity issue only for table with no headers.
     *
     * @method checkTableHeaders
     * @return {Node} A complete list of all warnings and problems.
     * @private
     */
    checkTableHeaders() {
        let problemNodes = [],
            index = 0;
        this.editor.dom.select('table').forEach(function(table) {
            table.setAttribute('nodeId', index);
            if (table.querySelectorAll('tr, td')) {
                table.querySelectorAll('tr').forEach(row => {
                    let header = row.querySelector('th');
                    if (!header || (header.textContent.trim() === '')) {
                        problemNodes.push(table);
                    }
                });
            } else {
                let hasHeader = false;
                table.querySelector('tr').querySelectorAll('th').some(header => {
                    hasHeader = true;
                    if (header.textContent.trim() === '') {
                        problemNodes.push(table);
                        return true;
                    }
                    return false;
                });
                if (!hasHeader) {
                    problemNodes.push(table);
                }
            }
            index += 1;
        });
        return problemNodes;
    }

    /**
     * Convert a CSS color to a luminance value.
     *
     * @method getLuminanceFromCssColor
     * @param {String} colortext The Hex value for the colour
     * @return {Number} The luminance value.
     * @private
     */
    getLuminanceFromCssColor(colortext) {
        let color;

        if (colortext === 'transparent') {
            colortext = '#ffffff';
        }
        color = this.colorBase.toArray(this.colorBase.toRGB(colortext));

        // Algorithm from "http://www.w3.org/TR/WCAG20-GENERAL/G18.html".
        let part1 = function(a) {
            a = parseInt(a, 10) / 255.0;
            if (a <= 0.03928) {
                a = a / 12.92;
            } else {
                a = Math.pow(((a + 0.055) / 1.055), 2.4);
            }
            return a;
        };

        let r1 = part1(color[0]),
            g1 = part1(color[1]),
            b1 = part1(color[2]);

        return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
    }

    /**
     * Get the computed RGB converted to full alpha value, considering the node hierarchy.
     *
     * @method getComputedBackgroundColor
     * @param {Node} node
     * @param {String} color The initial colour. If not specified, fetches the backgroundColor from the node.
     * @return {Array} Colour in Array form (RGBA)
     * @private
     */
    getComputedBackgroundColor(node, color) {
        color = color ? color : window.getComputedStyle(node, null).getPropertyValue('background-color');
        if (color.toLowerCase() === 'transparent') {
            color = 'rgba(1, 1, 1, 0)';
        }

        // Convert the colour to its constituent parts in RGBA format, then fetch the alpha.
        let colorParts = this.colorBase.toArray(color);
        let alpha = colorParts[3];

        if (alpha === 1) {
            // If the alpha of the background is already 1, then the parent background colour does not change anything.
            return colorParts;
        }

        // Fetch the computed background colour of the parent and use it to calculate the RGB of this item.
        let parentColor = this.getComputedBackgroundColor(node.parentNode);
        return [
            // RGB = (alpha * R|G|B) + (1 - alpha * solid parent colour).
            (1 - alpha) * parentColor[0] + alpha * colorParts[0],
            (1 - alpha) * parentColor[1] + alpha * colorParts[1],
            (1 - alpha) * parentColor[2] + alpha * colorParts[2],
            // We always return a colour with full alpha.
            1
        ];
    }
}
