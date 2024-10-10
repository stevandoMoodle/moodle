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

import Templates from 'core/templates';
import {alert} from 'core/notification';
import {get_string as getString} from 'core/str';
import {component} from '../common';
import {
    byId,
    getInTextRefNumber,
    selector,
    extractRefNumber,
    resetBibliographyFormFields,
    wordsFormat,
    toWords,
} from './helper';
import {
    getBioContent,
    viewItemButtons,
    editIcon,
    firstItem,
    generateLabel,
    noBibliography,
    citation,
} from './template_loader';

export default class Base {
    /**
     * Cite in a bibliography.
     *
     * @param {object} bio
     * @param {event} event
     */
    citeThis = async(bio, event) => {
        const cite = event.target.closest('[data-action="cite-this"]');
        const list = bio.editor.dom.select(`[class="${cite.dataset.id}"]`);
        const inTextCitation = this.extendInTextCitation(cite.dataset.index);
        if (list) {
            bio.editor.insertContent(await citation(inTextCitation));
            bio.modal.hide();
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

    checkDefaultSelectedSource = async(selectedSource, defaultSource) => {
        // Set the selected option to default source
        byId('id_bibliography_source').value = defaultSource;

        // Alert the user.
        alert(
            await getString('alert:warning', component),
            await getString('sourcenotavailable', component, toWords('_', selectedSource))
        );
    };

    /**
     * Delete a bibliography from tinyMCE editor and modal.
     *
     * @param {object} bio
     */
    deleteBibliography = async(bio) => {
        const list = bio.editor.dom.select(`[class="${bio.deleteBio.dataset.targetId}"]`);
        const listInModal = byId(`id-${bio.deleteBio.dataset.targetId}`);
        const index = parseInt(bio.deleteBio.dataset.targetId.replace(/^\D+/g, ''));
        if (list && listInModal) {
            const refNo = bio.editor.dom.select(`[class="cited-bibliography"]`);
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

            // Reset the form and remove edit buttons if bibliography.updateId is not null.
            if (bio.updateId) {
                // Reset the form.
                resetBibliographyFormFields(bio);

                // Remove edit buttons.
                this.removeEditButtons(); // The business is done up to this stage.
            }

            const bibliographyInModal = byId('bibliography-info-list-holder');
            if (bibliographyInModal.childNodes.length <= 1) {
                // Set bibliography data in modal to no bibliography if nothing left.
                bibliographyInModal.innerHTML += await noBibliography();
            }

            // If there needs to do some more jobs, just override the following method.
            this.extendDeleteBibliography(bio, index);
        }
    };

    /**
     * Can be extended by any style.js.
     *
     * @param {object} bio Object of bibliography.js
     * @param {number} index Number of bibliography index
     *
     */
    // eslint-disable-next-line no-unused-vars
    extendDeleteBibliography = (bio, index) => {
        // Empty function that can be overridden by any style.js.
    };

    removeEditButtons = async() => {
        const asdf = byId('id-button-container').querySelectorAll('button');
        if (asdf.length > 1) {
            selector('[data-action="reset-form"]').remove();
            selector('[data-action="save-as-new"]').remove();
            selector('[data-action="generate-list"]').innerHTML = await generateLabel();
        }
    };

    /**
     * Edit bibliography list.
     *
     * @param {object} bio
     * @param {Element} editBio
     */
    editBibliography = async(bio, editBio) => {
        const targetList = bio.editor.dom.select(`[class="${editBio.id}"]`)[0];
        const dataObject = `{${targetList.querySelector('.hide-ori-data').innerHTML.replaceAll('" "', '"')}}`;
        const allData = JSON.parse(dataObject);

        // Assign allData to this.allData.
        bio.allData = allData;

        // Set style.
        bio.setStyle(bio.allData.style);
        byId('id_bibliography_style').value = allData.style;

        // Set source.
        bio.setSource(bio.allData.source);
        byId('id_bibliography_source').value = allData.source;

        // Set show other fields.
        const otherFields = byId('id_other_fields');
        if (allData.showOtherFields === 'true' && !otherFields.checked) {
            byId('id_other_fields').checked = true;
        } else {
            byId('id_other_fields').checked = false;
        }

        bio.create = false;
        bio.updateId = editBio.id;
        bio.updateIndex = extractRefNumber(targetList);

        const asdf = byId('id-button-container').querySelectorAll('button');
        if (asdf.length === 1) {
            byId('id-button-container').innerHTML += await viewItemButtons({
                id: editBio.id,
                index: editBio.dataset.index
            });
        }

        selector('[data-action="generate-list"]').innerHTML = await editIcon();
    };

    getRequiredFields = (bio) => {
        let fields = [];
        bio.fields.forEach(field => {
            if (field.required) {
                fields.push(field.field);
            }
        });
        return fields;
    };

    createKeyValuePair = (bio) => {
        let keyValuePair = '';
        for (const key in bio.allData) {
            if (key !== 'keyValuePair') {
                if (keyValuePair === '') {
                    keyValuePair += `"${key}": "${bio.allData[key]}"`;
                } else {
                    keyValuePair += `, "${key}": "${bio.allData[key]}"`;
                }
            }
        }
        bio.allData.keyValuePair = keyValuePair;
    };

    checkRequiredFields = (bio) => {
        // Concat style and source to requiredFields.
        const fields = [
            'style',
            'source'
        ].concat(this.getRequiredFields(bio));

        let i = 0;
        fields.every(field => {
            if (!bio.allData[field] || bio.allData[field] === '') {
                return false;
            }
            i++;
            return true;
        });

        this.createKeyValuePair(bio);
        return (i === fields.length);
    };

    /**
     * Generates or updates the bibliography.
     *
     * @param {object} bio
     */
    generateBibliography = async(bio) => {
        if (this.checkRequiredFields(bio)) {
            if (bio.create) {
                let bioList = bio.editor.dom.select('[class="id-bibliography-holder"]'),
                index = bioList.length;
                if (index > 0) {
                    index = bioList[0].querySelectorAll('p').length;
                }

                bio.updateIndex = index + 1;
                bio.allData.author = wordsFormat(bio.allData.author);

                let info = await getBioContent(this.styleDirectory, bio);
                if (index === 0) {
                    info = await firstItem({reference: info, referenceNumber: bio.updateIndex});
                }

                let bibliography;
                if (index > 0) {
                    bibliography = info;
                } else {
                    bibliography = await Templates.render('tiny_bibliography/bibliography_header', {
                        info: info
                    });
                }
                bibliography = bibliography.replaceAll(/\r?\n|\r/g, '');

                if (index === 0) {
                    bio.editor.dom.add(
                        bio.editor.getBody(),
                        'div',
                        {'class': 'id-bibliography-holder'},
                        bibliography
                    );
                    this.scrollToBottom(bio);
                } else {
                    const currentElement = bio.editor.selection.getNode().parentElement.parentElement;
                    const elementClass = currentElement.getAttribute('class');
                    if (currentElement && elementClass && elementClass.includes('id-bibliography-list-')) {
                        const textNodes = this.getTextNodes(currentElement);

                        // Locate to insert a new bio.
                        bio.editor.selection.setCursorLocation(
                            textNodes[textNodes.length - 1],
                            textNodes[textNodes.length - 1].textContent.length
                        );

                        // Insert new bio list and the business is done up to this stage.
                        const newBio = await firstItem({reference: info, referenceNumber: bio.updateIndex});
                        await bio.editor.insertContent(newBio.replaceAll(/\r?\n|\r/g, ''));

                        // If there needs to do some more jobs, just override the following method.
                        this.extendGenerateBibliography(elementClass, bio);
                    } else {
                        bio.editor.dom.add(
                            bioList[0],
                            'p',
                            {'class': `id-bibliography-list-${bio.updateIndex}`},
                            bibliography,
                        );
                        this.scrollToBottom(bio);
                    }
                }
            } else {
                const targetList = bio.editor.dom.select(`[class="${bio.updateId}"]`)[0];
                const updatedBio = await getBioContent(this.styleDirectory, bio);
                targetList.innerHTML = updatedBio.replaceAll(/\r?\n|\r/g, '');
                bio.create = true;
            }

            // If the list was "Save as new", we need to remove all buttons but generate button.
            if (bio.saveAsNew) {
                this.removeEditButtons();
            }

            resetBibliographyFormFields(bio);
            this.removeEditButtons();
            bio.generateBioAndDisplayInModal();
        } else {
            alert(
                await getString('alert:error', component),
                await getString('fieldsrequired', component)
            );
        }
    };

    /**
     * Can be extended by any style.js.
     *
     * @param {*} elementClass Bibliography element
     * @param {*} bio Object of bibliography.js
     *
     */
    // eslint-disable-next-line no-unused-vars
    extendGenerateBibliography = (elementClass, bio) => {
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

    scrollToBottom = (bio) => {
        bio.editor.dom.select('[class="id-bibliography-holder"]')[0].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    };
}
