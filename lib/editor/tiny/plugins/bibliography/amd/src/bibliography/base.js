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
    getTextNodes,
    // lcFirst
} from './helper';
import {getBioContent, viewItemButtons} from './templateloader';

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
        const index = cite.dataset.index;
        if (list) {
            bio.editor.insertContent(
                await Templates.render('tiny_bibliography/bibliography_citation', {
                    index: index
                })
            );
            bio.modal.hide();
        }
    };

    /**
     * Delete a citation.
     *
     * @param {object} bio
     * @param {event} event
     */
    deleteBibliography = (bio, event) => {
        const deleteBio = event.target.closest('[data-action="delete-bio"]');
        const list = bio.editor.dom.select(`[class="${deleteBio.dataset.id}"]`);
        const index = parseInt(deleteBio.dataset.index);
        if (list) {
            const refNo = bio.editor.dom.select(`[class="cited-bibliography"]`);
            refNo.forEach(ref => {
                const text = getInTextRefNumber(ref);
                if (parseInt(text) === index) {
                    // Delete citation(s) if data-index is the same as current text of it.
                    ref.remove();
                }
            });

            // Delete found bibliography list.
            list[0].remove();

            // Close the modal.
            bio.modal.hide();
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
        bio.updateIndex = editBio.id.split('-')[3];

        const asdf = byId('id-button-container').querySelectorAll('button');
        if (asdf.length === 1) {
            byId('id-button-container').innerHTML += await viewItemButtons({id: editBio.id});
        }

        byId('id-generate-label').textContent = await getString('update', component);
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
        // Concat author, style and source to requiredFields.
        const fields = [
            'style',
            'source'
        ].concat(this.getRequiredFields(bio));

        let i = 0;
        fields.every(field => {
            if (!bio.allData[field] || bio.allData[field] === '') {
                window.console.log(field);
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
                let bioList = bio.editor.dom.select('[id="id-bibliography-holder"]'),
                index = bioList.length;
                if (index > 0) {
                    index = bioList[0].querySelectorAll('p').length;
                }

                bio.updateIndex = index + 1;
                const info = await getBioContent(bio);
                let bibliography;
                let textNodes;
                if (index > 0) {
                    textNodes = getTextNodes(bioList[0].lastChild);
                    bibliography = info;
                } else {
                    textNodes = getTextNodes(bio.editor.getBody().lastChild);
                    bibliography = await Templates.render('tiny_bibliography/bibliography_header', {
                        info: info
                    });
                }

                const currentElement = bio.editor.selection.getNode().getAttribute('class');
                if (currentElement && currentElement.includes('id-bibliography-list-')) {
                    // Put the cursor to the end of the selected bio element.
                    textNodes = getTextNodes(bio.editor.selection.getNode());
                }

                // Locate to insert a new bio.
                bio.editor.selection.setCursorLocation(
                    textNodes[textNodes.length - 1],
                    textNodes[textNodes.length - 1].textContent.length
                );

                // Insert new bio list.
                await bio.editor.insertContent(bibliography);
            } else {
                const targetList = bio.editor.dom.select(`[class="${bio.updateId}"]`)[0];
                targetList.innerHTML = await getBioContent(bio);
                bio.create = true;
            }

            // Close the modal.
            bio.modal.hide();
        } else {
            alert('Error!', 'You need to provide all information');
        }
    };

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
        bio.editor.dom.select('[id="id-bibliography-holder"]')[0].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    };
}
