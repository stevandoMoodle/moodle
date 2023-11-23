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
import {get_string as getString} from 'core/str';
import {alert} from 'core/notification';
import {byId, getInTextRefNumber, resetBibliographyFormFields, toWords, ucFirst, wordsFormat} from './../helper';
import {firstItem, getBioContent} from './../templateloader';
import Base from '../base';
import {component} from '../../common';
import Book from '../handlers/book';
import Website from '../handlers/website';
import BookWithChapterTitle from '../handlers/book_with_chapter_title';

export default class Ieee extends Base {
    constructor() {
        super();
        this.DEFAULT = {
            SOURCE: 'book'
        };

        this.ALL_SOURCES = [
            'source:book',
            'source:website',
            'source:book_with_chapter_title'
        ];
    }

    /**
     * Sets selected source.
     *
     * @param {String} data
     */
    setSelectedSource = async(data = null) => {
        let selectedSource;
        if (!data) {
            data = this.DEFAULT.SOURCE;
        }

        switch (data) {
            case 'book':
                selectedSource = new Book();
                break;
            case 'website':
                selectedSource = new Website();
                break;
            case 'book_with_chapter_title':
                selectedSource = new BookWithChapterTitle();
                break;
            default:
                // Set to default resource
                selectedSource = new Book();

                // Set the selected option to default source
                byId('id_bibliography_source').value = this.DEFAULT.SOURCE;

                // Alert the user.
                alert(
                    await getString('alert:warning', component),
                    await getString('sourcenotavailable', component, toWords('_', data))
                );
        }
        return selectedSource;
    };

    /**
     * Delete a citation.
     *
     * @param {object} bio
     * @param {event} event
     */
    deleteBibliography = (bio, event) => {
        const deleteBio = event.target.closest('[data-action="delete-bio"]');
        if (deleteBio) {
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

                // Reorder citations.
                this.reorderCitation(bio.editor, index, false);

                // Delete found bibliography list.
                list[0].remove();

                // Reorder the bibliography list.
                this.reorderBibliography(bio.editor);

                // Close the modal.
                bio.modal.hide();
            }
        }
    };

    /**
     * Reorder bibliography list.
     *
     * @param {object} editor
     */
    reorderBibliography = (editor) => {
        let bioList = editor.dom.select('[class="id-bibliography-holder"]');

        // Check if child nodes of bioList is equal to 1, delete the whole bibliography div.
        if (bioList[0].childNodes.length === 1) {
            bioList[0].remove();
        }

        if (bioList.length > 0) {
            let index = 0;
            bioList[0].childNodes.forEach(node => {
                if (node.nodeName === 'P' && node.textContent.trim() !== '') {
                    // Reset all info to pure text.
                    node.childNodes[2].removeAttribute('class');
                    node.childNodes[2].classList.add(`id-refno-${index}`);
                    node.childNodes[2].textContent = `[${index}]`;

                    node.removeAttribute('class');
                    node.classList.add(`id-bibliography-list-${index}`);
                }
                index++;
            });
        }
    };

    /**
     * Reorder all citations.
     *
     * @param {object} editor
     * @param {number} refNumber
     * @param {boolean} increase
     */
    reorderCitation = (editor, refNumber, increase = false) => {
        const refList = editor.dom.select('[class="cited-bibliography"]');
        if (refList.length > 0) {
            refList.forEach(ref => {
                const content = parseInt(getInTextRefNumber(ref));
                if (content >= refNumber) {
                    ref.textContent = `[${content - 1}]`;
                    if (increase) {
                        ref.textContent = `[${content + 1}]`;
                    }
                }
            });
        }
    };

    /**
     * Generates author's name based on the style.
     *
     * @param {string} firstName
     * @param {string} middleName
     * @param {string} sureName
     * @returns {object|null}
     */
    generateAuthorName(firstName = null, middleName = null, sureName = null) {
        if (firstName !== null) {
            const genSureName = sureName ? (ucFirst(sureName)) : ''; // Generated sure name.
            sureName = sureName ? sureName + ', ' : null;

            let genMiddleName = ''; // Generated middle name.
            let genFirstName = ''; // Generated first name.
            if (sureName) {
                genMiddleName = middleName ? ucFirst(middleName, false) + '. ' : '';
                middleName = middleName ? middleName + '' : null;
            } else {
                genMiddleName = middleName ? ucFirst(middleName, false) : '';
                middleName = middleName ? middleName : null;
            }

            if (sureName || middleName) {
                genFirstName = firstName ? ucFirst(firstName, false) + '. ' : '';
                firstName = firstName ? firstName + ' ' : '';
            } else {
                genFirstName = firstName ? ucFirst(firstName, false) : '';
                firstName = firstName ? firstName : '';
            }

            return {
                "generated": genFirstName + genMiddleName + genSureName, // Generated names.
                "originated": (sureName ?? ', ') + firstName + (middleName ?? '') // Pure names.
            };
        }
        return null;
    }

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
                    index = bioList[0].querySelectorAll('div').length;
                }

                bio.updateIndex = index + 1;
                bio.allData.author = wordsFormat(bio.allData.author);

                let info = await getBioContent(bio);
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

                if (index === 0) {
                    bio.editor.dom.add(
                        bio.editor.getBody(),
                        'div',
                        {'id': 'bibliography-container'},
                        bibliography
                    );
                    bio.editor.dom.select('[id="bibliography-container"]')[0].scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                } else {
                    bio.editor.dom.add(
                        bioList[0],
                        'div',
                        {'id': `id-bibliography-list-${bio.updateIndex}`},
                        bibliography
                    );

                    // const currentElement = bio.editor.selection.getNode().getAttribute('class');
                    // if (currentElement && currentElement.includes('id-bibliography-list-')) {
                    //     // Put the cursor to the end of the selected bio element.
                    //     textNodes = getTextNodes(bio.editor.selection.getNode());
                    // }

                    // // Locate to insert a new bio.
                    // bio.editor.selection.setCursorLocation(
                    //     textNodes[textNodes.length - 1],
                    //     textNodes[textNodes.length - 1].textContent.length
                    // );

                    // // Insert new bio list.
                    // await bio.editor.insertContent(bibliography);

                    // // Check if cursor is currently located within the bio list element.
                    // if (currentElement && currentElement.includes('id-bibliography-list-')) {
                    //     // Reorder citations.
                    //     let refNo = currentElement.split('-');
                    //     refNo = parseInt(refNo[refNo.length - 1]) + 1;

                    //     // Reorder all citations.
                    //     this.reorderCitation(bio.editor, refNo, true);

                    //     // Reorder bibliography list.
                    //     this.reorderBibliography(bio.editor);
                    // }
                }
            } else {
                const targetList = bio.editor.dom.select(`[class="${bio.updateId}"]`)[0];
                targetList.innerHTML = await getBioContent(bio);
                bio.create = true;
            }

            resetBibliographyFormFields(bio);
            bio.generateBioAndDisplayInModal();
        } else {
            alert(
                await getString('alert:error', component),
                await getString('fieldsrequired', component)
            );
        }
    };
}
