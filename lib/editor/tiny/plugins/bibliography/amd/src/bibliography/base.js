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
 * @package    tiny_bibliography
 * @copyright  2023 Stevani Andolo <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import {component} from '../common';
import {
    byId,
    getInTextRefNumber,
    extractRefNumber,
    wordsFormat,
    showElement,
} from './helper';
import {
    getBibliographyContent,
    viewItemButtons,
    firstItem,
    noBibliography,
    citation,
    bibliographyHeader,
} from './template_loader';
import Selectors from "./selectors";
import {Setter} from './setter';

export default class Base {
    /**
     * Cite in a bibliography.
     *
     * @param {object} bibliography
     * @param {event} event
     */
    citeThis = async(bibliography, event) => {
        const cite = event.target.closest('[data-action="cite-this"]');
        const list = bibliography.editor.dom.select(`[class="${cite.dataset.id}"]`);
        const inTextCitation = this.extendInTextCitation(cite.dataset.index);
        if (list) {
            bibliography.editor.insertContent(await citation(inTextCitation));
            bibliography.modal.destroy();
        }
    };

    /**
     * Can be extended by any style.js.
     *
     * @param {string|number} index In-text citation
     *
     */
    extendInTextCitation = (index) => {
        return index;
    };

    /**
     * Delete a bibliography from tinyMCE editor and modal.
     *
     * @param {object} bibliography
     */
    deleteBibliography = async(bibliography) => {
        const list = bibliography.editor.dom.select(`[class="${bibliography.deleteBibliography.dataset.targetId}"]`);
        const listInModal = byId(`id-${bibliography.deleteBibliography.dataset.targetId}`);
        const index = parseInt(bibliography.deleteBibliography.dataset.targetId.replace(/^\D+/g, ''));
        if (list && listInModal) {
            const refNo = bibliography.editor.dom.select(`[class="cited-bibliography"]`);
            refNo.forEach(ref => {
                const text = getInTextRefNumber(ref);
                const currentRefNo = extractRefNumber(list[0]);
                if (parseInt(text) === parseInt(currentRefNo)) {
                    // Delete citation(s) if data-index is the same as current text of it.
                    ref.remove();
                }
            });

            // Delete bibliography in tinyMCE editor.
            list[0].remove();

            // Delete bibliography from the modal.
            listInModal.remove();

            const bibliographyInModal = byId('bibliography-list-modal-container');
            if (bibliographyInModal.childNodes.length <= 1) {
                // Set bibliography data in modal to no bibliography if nothing left.
                bibliographyInModal.innerHTML += await noBibliography();
            }
            // The business is done up to this stage.

            // If there needs to do some more jobs, just override the following method.
            this.extendDeleteBibliography(bibliography, index);
        }
    };

    /**
     * Can be extended by any style.js.
     *
     * @param {object} bibliography Object of bibliography.js
     * @param {number} index Number of bibliography index
     *
     */
    // eslint-disable-next-line no-unused-vars
    extendDeleteBibliography = (bibliography, index) => {
        // Empty function that can be overridden by any style.js.
    };

    /**
     * Edit bibliography list.
     *
     * @param {object} bibliography
     * @param {Element} editBibliographyButton
     */
    editBibliography = async(bibliography, editBibliographyButton) => {
        const targetList = bibliography.editor.dom.select(`[class="${editBibliographyButton.id}"]`)[0];
        const dataObject = `{${targetList.querySelector('.hide-ori-data').innerHTML.replaceAll('" "', '"')}}`;
        const allData = JSON.parse(dataObject);

        // Assign allData to this.allData.
        bibliography.allData = allData;

        // Set style and source.
        const setter = new Setter(bibliography);
        setter.setStyle(bibliography.allData.style);
        setter.setSource(bibliography.allData.source);

        // Set show other fields.
        const otherFields = bibliography.root.querySelector(Selectors.actions.showOtherFields);
        if (allData.showOtherFields === 'true' && !otherFields.checked) {
            otherFields.checked = true;
        } else {
            otherFields.checked = false;
        }

        const buttonContainer = byId('id-button-container').querySelectorAll('button');
        if (buttonContainer.length === 2) {
            byId('id-button-container').innerHTML += await viewItemButtons({
                id: editBibliographyButton.id,
                index: editBibliographyButton.dataset.index
            });
        }
    };

    getRequiredFields = (bibliography) => {
        let fields = [];
        bibliography.fields.forEach(field => {
            if (field.required) {
                fields.push(field.field);
            }
        });
        return fields;
    };

    createKeyValuePair = (bibliography) => {
        let keyValuePair = '';
        for (const key in bibliography.allData) {
            if (key !== 'keyValuePair') {
                if (keyValuePair === '') {
                    keyValuePair += `"${key}": "${bibliography.allData[key]}"`;
                } else {
                    keyValuePair += `, "${key}": "${bibliography.allData[key]}"`;
                }
            }
        }
        bibliography.allData.keyValuePair = keyValuePair;
    };

    checkRequiredFields = (bibliography) => {
        // Concat style and source to requiredFields.
        const fields = [
            'style',
            'source'
        ].concat(this.getRequiredFields(bibliography));

        let i = 0;
        fields.every(field => {
            if (!bibliography.allData[field] || bibliography.allData[field] === '') {
                return false;
            }
            i++;
            return true;
        });

        this.createKeyValuePair(bibliography);
        return (i === fields.length);
    };

    /**
     * Generates or updates the bibliography.
     *
     * @param {object} bibliography
     */
    generateBibliography = async(bibliography) => {
        if (this.checkRequiredFields(bibliography)) {
            if (bibliography.create) {
                const bibliographyList = bibliography.editor.dom.select(Selectors.elements.bibliographyListContainerClass);
                let index = bibliographyList.length;
                if (index > 0) {
                    index = bibliographyList[0].querySelectorAll('p').length;
                }

                bibliography.updateIndex = index + 1;
                bibliography.allData.author = wordsFormat(bibliography.allData.author);

                let info = await getBibliographyContent(this.styleDirectory, bibliography);
                if (index === 0) {
                    info = await firstItem({reference: info, referenceNumber: bibliography.updateIndex});
                }

                let bibliographyItem;
                if (index > 0) {
                    bibliographyItem = info;
                } else {
                    bibliographyItem = await bibliographyHeader({info: info});
                }
                bibliographyItem = bibliographyItem.replaceAll(/\r?\n|\r/g, '');

                if (index === 0) {
                    bibliography.editor.dom.add(
                        bibliography.editor.getBody(),
                        'div',
                        {'class': Selectors.elements.bibliographyListContainer},
                        bibliographyItem
                    );
                    this.scrollToBottom(bibliography);
                } else {
                    const currentElement = bibliography.editor.selection.getNode().parentElement.parentElement;
                    const elementClass = currentElement.getAttribute('class');
                    if (currentElement && elementClass && elementClass.includes('bibliography-item-')) {
                        const textNodes = this.getTextNodes(currentElement);

                        // Locate to insert a new bibliography.
                        bibliography.editor.selection.setCursorLocation(
                            textNodes[textNodes.length - 1],
                            textNodes[textNodes.length - 1].textContent.length
                        );

                        // Insert new bibliography list and the business is done up to this stage.
                        const newBibliography = await firstItem({reference: info, referenceNumber: bibliography.updateIndex});
                        await bibliography.editor.insertContent(newBibliography.replaceAll(/\r?\n|\r/g, ''));

                        // If there needs to do some more jobs, just override the following method.
                        this.extendGenerateBibliography(elementClass, bibliography);
                    } else {
                        bibliography.editor.dom.add(
                            bibliographyList[0],
                            'p',
                            {'class': `bibliography-item-${bibliography.updateIndex}`},
                            bibliographyItem,
                        );
                        this.scrollToBottom(bibliography);
                    }
                }
            } else {
                const targetList = bibliography.editor.dom.select(`[class="${bibliography.updateId}"]`)[0];
                const updatedBibliography = await getBibliographyContent(this.styleDirectory, bibliography);
                targetList.innerHTML = updatedBibliography.replaceAll(/\r?\n|\r/g, '');
                bibliography.create = true;
            }

            bibliography.modal.destroy();
        } else {
            // Handle the error.
            const warning = bibliography.root.querySelector(Selectors.elements.warning);
            warning.innerHTML = await getString('field:required', component);
            showElement([Selectors.elements.warning], bibliography.root);
        }
    };

    /**
     * Can be extended by any style.js.
     *
     * @param {*} elementClass Bibliography element
     * @param {*} bibliography Object of bibliography.js
     *
     */
    // eslint-disable-next-line no-unused-vars
    extendGenerateBibliography = (elementClass, bibliography) => {
        // Empty function that can be overridden by any style.js.
    };

    /**
     * Gets last node to set the cursor position.
     * https://stackoverflow.com/questions/7962474/tinymce-insert-content-at-the-bottom.
     *
     * @param {node} node
     * @param {number} nodeType
     * @param {node} result
     * @returns {node}
     */
    getTextNodes = (node, nodeType, result) => {
        var children = node.childNodes;
        var nodeType = nodeType ? nodeType : 3;

        var result = !result ? [] : result;
        if (node.nodeType == nodeType) {
            result.push(node);
        }

        for (var i = 0; i < children.length; i++) {
            result = this.getTextNodes(children[i], nodeType, result);
        }

        return result;
    };

    scrollToBottom = (bibliography) => {
        bibliography.editor.dom.select(Selectors.elements.bibliographyListContainerClass)[0].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    };
}
