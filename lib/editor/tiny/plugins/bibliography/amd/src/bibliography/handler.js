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
    body,
    footer,
    setPropertiesFromData,
    showElement,
    hideElement,
    ucFirst,
    clearInputField,
    insertNodes,
    getSourceLangString,
} from './helper';
import {
    removeAttachedExampleListeners,
    getExample
} from './example';
import Selectors from "./selectors";
import {getString} from 'core/str';
import {component} from '../common';
import {getStrings} from 'core/str';
import {Setter} from './setter';
import {EventHandler} from './event_handler';
import {AuthorFormatter} from './author_formatter';
import {getBibliographyButtons} from './template_loader';

export class Handler {

    constructor(data) {
        // Creates dynamic properties based on "data" param.
        setPropertiesFromData(this, data);
    }

    /**
     * Load the media insert dialogue.
     *
     * @param {object} templateContext
     */
    loadTemplatePromise = async(templateContext) => {
        templateContext.id = this.editor.id;
        templateContext.bodyTemplate = Selectors.template.body.insertBibliography;
        templateContext.footerTemplate = Selectors.template.footer.insertBibliography;

        Promise.all([body(templateContext, this.root), footer(templateContext, this.root)])
            .then(async() => {
                this.modal.setTitle(this.setModalTitle());
                if (templateContext.isInsertBibliography) {
                    await (new Setter(this)).setSource();
                } else {
                    await this.displayBibliographyInModal();
                    this.addListeners();
                }
                return;
            })
            .catch(error => {
                window.console.log(error);
            });
    };

    setModalTitle = async() => {
        if (this.type === 'insert') {
            return await getString('modalTitle:insert', component);
        } else if (this.type === 'bibliography') {
            return await getString('modalTitle:bibliography', component);
        } else {
            return await getString('modalTitle:citation', component);
        }
    };

    loadFieldTemplate = async(isAddListener = true) => {
        let status = false;
        if (typeof this.allData.showOtherFields === 'undefined') {
            status = false;
        } else if (typeof this.allData.showOtherFields === 'string') {
            status = (this.allData.showOtherFields === 'true') ? true : false;
        } else {
            status = this.allData.showOtherFields;
        }

        // Set showOtherFields status.
        this.allData.showOtherFields = status;

        const templateContext = {
            // Object of bibliography.
            ...this,
            // Arrays of required fields.
            fields: await this.requiredFieldObject(),
            // Template file.
            template: Selectors.template.body.bibliographyField,
            // Target element to be inserted.
            targetElement: Selectors.elements.mainInputFields,
        };

        Promise.all([insertNodes(templateContext, this.root)])
            .then(async() => {
                // Add back events once the form is ready.
                if (isAddListener) {
                    this.addListeners();
                }
                return;
            })
            .catch(error => {
                window.console.log(error);
            });
    };

    addListeners = () => {
        // Then re-create new listeners.
        getExample();

        const eventHandler = new EventHandler(this);
        eventHandler.addClickListeners();
        eventHandler.addChangeListeners();
        eventHandler.addKeyupListeners();
    };

    removeListeners = async() => {
        // Clear attached listeners.
        removeAttachedExampleListeners();

        const eventHandler = new EventHandler(this);
        eventHandler.removeAttachedClickListeners();
        eventHandler.removeAttachedChangeListeners();
        eventHandler.removeAttachedKeyupListeners();
    };

    /**
     * Get's all the required fields based on the selected source.
     *
     * @returns {Array}
     */
    requiredFieldObject = async() => {
        let fieldLabelArray = [],
        optionLabelArray = [];
        // Get all fields labels and push them in labelArray.
        this.fields.forEach((field) => {
            fieldLabelArray.push(field.label);
            if (field.options) {
                field.options.forEach((option) => {
                    optionLabelArray.push(option);
                });
            }
        });

        // Get labels' string lang.
        const labels = await getStrings(fieldLabelArray.map((key) => ({key, component})));
        let optionLabels = [];
        if (optionLabelArray.length > 0) {
            optionLabels = await getSourceLangString(optionLabelArray, null, 'no');
        }

        let fields = [];
        let i = 0;
        // Loop this.fields with custom data for html and push them into fields array.
        this.fields.forEach((field) => {
            fields.push({
                data: field.author ? this.allData[`pure${ucFirst(field.field)}`] : this.allData[field.field],
                field: field.field,
                label: labels[i],
                example: field.example,
                inputType: field.inputType,
                author: field.author,
                input: field.input,
                select: field.select,
                options: optionLabels,
                show: field.required ?? this.allData.showOtherFields,
                required: this.allData.showOtherFields ? field.required : this.allData.showOtherFields,
            });
            i++;
        });

        return fields;
    };

    /**
     * Sets custom authors' names.
     *
     * @param {event} event
     */
    setCustomAuthorNames(event) {
        // Show custom author name's fields.
        const customAuthorName = event.target.closest(Selectors.actions.setCustomAuthor);
        if (customAuthorName) {
            const field = customAuthorName.dataset.field;
            hideElement([
                `#full-${field}-holder`,
                Selectors.actions.generateBibliography,
            ], this.root);
            showElement([`#custom-${field}-holder`], this.root);
        }

        // Hide custom author name's fields.
        const cancelCustom = event.target.closest(Selectors.actions.cancelCustomAuthor);
        if (cancelCustom) {
            const field = cancelCustom.dataset.field;
            showElement([
                `#full-${field}-holder`,
                Selectors.actions.generateBibliography,
            ], this.root);
            hideElement([`#custom-${field}-holder`], this.root);
        }

        // Process custom author name.
        const okCustom = event.target.closest(Selectors.actions.okCustomAuthor);
        if (okCustom) {
            const field = okCustom.dataset.field;
            const fullName = this.selectedStyle.generateAuthorName(
                this.root.querySelector(`#id_bibliography_${field}_firstname`).value,
                this.root.querySelector(`#id_bibliography_${field}_middlename`).value,
                this.root.querySelector(`#id_bibliography_${field}_surename`).value
            ).originated.trim();

            let oriData = this.root.querySelector(`#id_bibliography_${field}`).value;
            if (oriData === '') {
                if (fullName !== ',') {
                    oriData = fullName;
                }
            } else {
                oriData += '; ' + fullName;
            }

            this.allData[field] = oriData;
            (new AuthorFormatter(this)).splitAuthorName(field);
            if (oriData !== '') {
                this.root.querySelector(`#id_bibliography_${field}`).value = oriData;
            }

            // Clear the input fields.
            clearInputField([
                `#id_bibliography_${field}_firstname`,
                `#id_bibliography_${field}_middlename`,
                `#id_bibliography_${field}_surename`,
            ], this.root);

            showElement([
                `#full-${field}-holder`,
                Selectors.actions.generateBibliography,
            ], this.root);
            hideElement([`#custom-${field}-holder`], this.root);
        }
    }

    /**
     * Generates bibliography list and display them in the modal.
     */
    displayBibliographyInModal = async() => {
        const BibliographyList = this.editor.dom.select('[class="bibliography-list-container"]');
        if (BibliographyList.length > 0) {
            const nodes = this.root.querySelector(Selectors.elements.bibliographyListModalContainer);
            let index = 1;
            nodes.innerHTML = '';
            BibliographyList[0].childNodes.forEach(async node => {
                let newNode;
                if (node.nodeName === 'P' && node.textContent.trim() !== '') {
                    newNode = await getBibliographyButtons({
                        id: node.getAttribute('class'),
                        last: (index === BibliographyList[0].childNodes.length - 1) ? true : false,
                        index: index++,
                        bio: node.querySelectorAll('.d-flex')[0].innerHTML.trim(),
                        heading: false
                    });
                } else if (node.nodeName === 'H3' && node.textContent.trim() !== '') {
                    newNode = await getBibliographyButtons({
                        id: node.getAttribute('class'),
                        bio: node.innerHTML.trim(),
                        heading: true
                    });
                }

                if (newNode) {
                    nodes.innerHTML += newNode;
                }
            });
        }
    };
}
