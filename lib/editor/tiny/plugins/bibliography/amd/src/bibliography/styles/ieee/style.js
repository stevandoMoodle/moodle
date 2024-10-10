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

import {
    byId,
    getInTextRefNumber,
    ucFirst,
} from '../../helper';
import Base from '../../base';

// All sources.
import Book from './sources/book';
import Website from './sources/website';
import BookWithChapterTitle from './sources/book_with_chapter_title';
import BookTranslated from './sources/book_translated';

export default class extends Base {
    constructor() {
        super();
        this.styleDirectory = 'styles/ieee';
    }

    /**
     * Overrides this function to show [1].
     *
     * @param {string|number} index Number of bibliography index
     *
     * @return {string}
     */
    extendInTextCitation = (index) => {
        return `[${index}]`;
    };

    /**
     * Returns object of available sources for IEEE style.
     *
     * @returns {object} Object of available sources
     */
    getAvailableSources = () => {
        return {
            book: new Book(),
            website: new Website(),
            // eslint-disable-next-line camelcase
            book_with_chapter_title: new BookWithChapterTitle(),
            // eslint-disable-next-line camelcase
            book_translated: new BookTranslated(),
        };
    };

    /**
     * Overrides this function to handle IEEE's specific features:
     * 1. Citation reorder.
     * 2. Bibliography reorder.
     *
     * @param {object} bio Object of bibliography.js
     * @param {number} index Number of bibliography index
     *
     */
    extendDeleteBibliography = (bio, index) => {
        // Reorder citations.
        this.reorderCitation(bio.editor, index, false);

        // Reorder the bibliography list.
        this.reorderBibliography(bio);
    };

    /**
     * Reorder bibliography list.
     *
     * @param {object} bio Bibliography object
     * @param {boolean} afterCreate State of post bibliography creation
     */
    reorderBibliography = (bio, afterCreate = false) => {
        let bioList = bio.editor.dom.select('[class="id-bibliography-holder"]');

        // Check if child nodes of bioList is equal to 1, delete the whole bibliography div.
        if (bioList[0].querySelectorAll('p').length === 0) {
            bioList[0].remove();
        }

        if (bioList.length > 0) {
            let index = 1;

            // Reorder the list in tinyMCE editor.
            bioList[0].childNodes.forEach(node => {
                if (node.nodeName === 'P' && node.textContent.trim() !== '') {
                    const targetRefNo = node.querySelectorAll('span')[1].querySelectorAll('span')[0];
                    if (targetRefNo) {
                        // Reset all info to pure text.
                        targetRefNo.removeAttribute('class');
                        targetRefNo.classList.add(`id-refno-${index}`);
                        targetRefNo.textContent = `[${index}]`;

                        if (afterCreate) {
                            node.removeAttribute('class');
                            node.classList.add(`id-bibliography-list-${index}`);
                        }
                        index++;
                    }
                }
            });

            // Reorder the list in modal.
            const bioListInModal = byId('bibliography-info-list-holder');
            index = 1;
            bioListInModal.childNodes.forEach(node => {
                if (node.nodeName === 'DIV' && node.textContent.trim() !== '') {
                    const nodeId = node.id.replace('id-', '');
                    const targetRefNo = node.querySelectorAll('span')[1];
                    if (targetRefNo) {
                        const id = `id-bibliography-list-${index}`;

                        // Reset all info to pure text.
                        targetRefNo.setAttribute('class', `id-refno-${index}`);
                        targetRefNo.textContent = `[${index}]`;

                        if (afterCreate) {
                            const bioContainer = byId(nodeId);
                            bioContainer.setAttribute('id', id);
                            bioContainer.dataset.index = index;

                            node.setAttribute('id', `id-${id}`);
                        }
                        index++;
                    }
                }
            });
        }
    };

    /**
     * Reorder all citations.
     *
     * @param {object} editor Object of tinyMCE editor
     * @param {number} refNumber Current index
     * @param {boolean} increment State to increment the index or not
     */
    reorderCitation = (editor, refNumber, increment = false) => {
        const refList = editor.dom.select('[class="cited-bibliography"]');
        if (refList.length > 0) {
            refList.forEach(ref => {
                const content = parseInt(getInTextRefNumber(ref));
                if (content >= refNumber) {
                    ref.textContent = `[${content - 1}]`;
                    if (increment) {
                        ref.textContent = `[${content + 1}]`;
                    }
                }
            });
        }
    };

    /**
     * Generates author's name based on the style.
     *
     * @param {string} firstName Author's first name
     * @param {string} middleName Author's middle name
     * @param {string} sureName Author's last name
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
     * Overrides this function to handle IEEE's specific features:
     * 1. Citation reorder.
     * 2. Bibliography reorder.
     *
     * @param {element} elementClass Bibliography element
     * @param {object} bio Object of bibliography.js
     */
    extendGenerateBibliography = (elementClass, bio) => {
        // Reorder citations.
        let refNo = elementClass.split('-');
        refNo = parseInt(refNo[refNo.length - 1]) + 1;

        // Reorder all citations.
        this.reorderCitation(bio.editor, refNo, true);

        // Reorder bibliography list.
        this.reorderBibliography(bio, true);
    };
}
