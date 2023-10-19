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
 * @copyright  2023 Stevani Andolo  <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Templates from 'core/templates';
import {get_string as getString} from 'core/str';
import {component} from './common';
import FormSetter from './formsetter';
import * as Modal from 'core/modal_factory';
import * as ModalEvents from 'core/modal_events';
import * as Getter from './getter';
import * as Bibliography from './bibliography';

export default class Generator extends FormSetter {

    constructor(editor) {
        super();
        this.editor = editor;
        this.modal = null;

        // Required properties for bibliography form.
        this.style = 'IEEE';
        this.source = 'Book';
        this.allsources = {
            "Article in journal": "Journal name",
            "Book": "Publisher"
        };
        this.pureauthor = null;
        this.author = '';
        this.title = null;
        this.city = null;
        this.purecity = null;
        this.publisher = null;
        this.year = null;
        this.volume = null;
        this.issue = null;
        this.pages = null;

        // Other required properties.
        this.create = true;
        this.updateid = null;
        this.updateindex = null;
        this.reorderfrom = null;
    }

    destroy() {
        delete this.editor;

        this.modal.destroy();
        delete this.modal;
    }

    async displayDialogue() {
        this.modal = await Modal.create({
            type: Modal.types.DEFAULT,
            large: true,
            title: getString('pluginname', component),
            body: this.getDialogueContent()
        });

        // Destroy the class when hiding the modal.
        this.modal.getRoot().on(ModalEvents.hidden, () => this.destroy());

        this.modal.getRoot().on(ModalEvents.bodyRendered, () => {
            // Generates bibliography list and display in modal.
            Bibliography.generateBioAndDisplayInModal(this);

            // Manually get the bio example.
            Getter.getExampleManually();
        });

        this.modal.getRoot()[0].addEventListener('click', async(event) => {
            // Displays bibliography info example when clicked in any form inputs based on dataset.action.
            Getter.getExample(event);

            // Sets and generates custom authors' names.
            this.setCustomAuthorNames(event);

            // Generates a new bibliography list and inserts it.
            const generateList = event.target.closest('[data-action="generate-list"]');
            if (generateList) {
                Bibliography.generateBibliography(this);
            }

            // Generates and inserts a new citation.
            Bibliography.citeThis(this, event);

            // Delete citation.
            Bibliography.deleteBibliography(this, event);

            // Edit bibliography.
            Bibliography.editBibliography(this, event);
        });

        // Sets bibliography style and source.
        this.modal.getRoot()[0].addEventListener('change', (event) => {
            const exampleNodes = event.target.closest('[data-type="style-source"]');
            if (exampleNodes) {
                const variable = exampleNodes.dataset.name.replaceAll('_', '');
                const callback = `set${variable.charAt(0).toUpperCase() + variable.slice(1)}`;
                this[callback](exampleNodes.value);
            }
        });

        // Sets bibliography info.
        this.modal.getRoot()[0].addEventListener('keyup', (event) => {
            const exampleNodes = event.target.closest('[data-type="bibliography-info-example"]');
            if (exampleNodes) {
                const variable = exampleNodes.dataset.name.replaceAll('_', '');
                const callback = `set${variable.charAt(0).toUpperCase() + variable.slice(1)}`;
                this[callback](exampleNodes.value);
            }
        });

        this.modal.show();
    }

    /**
     * Splits author's name.
     */
    splitAuthorName() {
        const data = this.pureauthor;
        if (!data) {
            return;
        }

        if (data.includes(';') === true) {
            const authors = data.split(';');
            authors.forEach(author => {
                author = author.trim();
                if (author !== '') {
                    this.setGeneratedAuthorNames(this.generateDetailedAuthorName(author));
                }
            });
        } else {
            this.setGeneratedAuthorNames(this.generateDetailedAuthorName(data));
        }
    }

    /**
     * Returns generated author's name.
     *
     * @param {string} author
     * @returns {string}
     */
    generateDetailedAuthorName(author = null) {
        let surename = '',
        firstname = '',
        middlename = '';

        if (author.includes(',')) {
            const names = author.split(',');
            surename = names[0];
            let fmname = names[1];

            if (fmname.includes(' ')) {
                fmname = fmname.split(' ');
                let i = 0;
                fmname.forEach(fm => {
                    if (fm !== '') {
                        if (i === 0) {
                            firstname = fm;
                        } else {
                            middlename += fm + ' ';
                        }
                        i++;
                    }
                });
            } else {
                firstname = fmname;
            }
        } else {
            firstname = author;
        }

        return this.generateAuthorName(firstname.trim(), middlename.trim(), surename.trim()).generated;
    }

    /**
     * Generates author's name based on the style.
     *
     * @param {string} firstname
     * @param {string} middlename
     * @param {string} surename
     * @returns {object|null}
     */
    generateAuthorName(firstname = null, middlename = null, surename = null) {
        if (firstname !== null) {
            const gensurename = surename ? (surename.charAt(0).toUpperCase() + surename.slice(1)) : '';
            surename = surename ? surename + ', ' : null;

            let genmiddlename = '',
            genfirstname = '';
            if (surename) {
                genmiddlename = middlename ? middlename.charAt(0).toUpperCase() + '. ' : '';
                middlename = middlename ? middlename + '' : null;
            } else {
                genmiddlename = middlename ? middlename.charAt(0).toUpperCase() : '';
                middlename = middlename ? middlename : null;
            }

            if (surename || middlename) {
                genfirstname = firstname ? firstname.charAt(0).toUpperCase() + '. ' : '';
                firstname = firstname ? firstname + ' ' : '';
            } else {
                genfirstname = firstname ? firstname.charAt(0).toUpperCase() : '';
                firstname = firstname ? firstname : '';
            }

            return {
                "generated": genfirstname + genmiddlename + gensurename,
                "originated": (surename ?? ', ') + firstname + (middlename ?? '')
            };
        }
        return null;
    }

    /**
     * Gets last node to set the cursor position.
     * https://stackoverflow.com/questions/7962474/tinymce-insert-content-at-the-bottom.
     *
     * @param {node} node
     * @param {number} nodeType
     * @param {node} result
     * @returns {node}
     */
    getTextNodes(node, nodeType, result) {
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
    }

    /**
     * Return the dialogue content.
     *
     * @return {Promise<Array>} A template promise containing the rendered dialogue content.
     */
     async getDialogueContent() {
        const warnings = [];

        return Templates.render('tiny_bibliography/bibliography_form', {
            warnings
        });
    }

    /**
     * Return the bio content.
     *
     * @param {object} data
     * @return {Promise<Array>} A template promise containing the rendered content.
     */
     async getBioContent(data) {
        return Templates.render('tiny_bibliography/bibliography_content', {
            ...data
        });
    }

    /**
     * Return the bio content with buttons.
     *
     * @param {object} data
     * @return {Promise<Array>} A template promise containing the rendered content.
     */
    async getBioListWithButtons(data) {
        return Templates.render('tiny_bibliography/bibliography_list_with_buttons', {
            ...data
        });
    }

    /**
     * Check bio's source.
     *
     * @param {string} source
     * @returns {boolean}
     */
    checkSource(source = null) {
        return (this.source === source);
    }
}
