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

import {getStrings, get_string as getString} from 'core/str';
import {component} from './../common';
import StyleSourceSelector from './style_source_selector';
import {fieldTemplate} from './templateloader';
import {
    byId,
    showElement,
    hideElement,
    ucFirst,
    resetBibliographyFormFields
} from './helper';
import {
    removeAttachedExampleListeners,
    getExample
} from './example';

export default class Setter extends StyleSourceSelector {
    constructor() {
        super();
    }

    /**
     * Initiates the style and source.
     */
    initSetter = async() => {
        this.allData.style = this.DEFAULT.STYLE;
        this.setSelectedStyle(this.DEFAULT.STYLE);
        await this.setSelectedSource();
    };

    /**
     * Sets bio's style.
     *
     * @param {string} data
     */
    setStyle = (data = null) => {
        this.allData.style = data;
        this.setSelectedStyle(data);
    };

    /**
     * Sets source of bibliography.
     *
     * @param {string} data
     */
    setSource = async(data = null) => {
        if (!data) {
            data = this.selectedStyle.DEFAULT.SOURCE;
        }
        // Clear the previous source's fields.
        this.fields = [];

        // Reset the fields if this.create is set to false when changing source.
        if (!this.create) {
            this.create = true;
            resetBibliographyFormFields(this);
            byId('id-generate-label').textContent = await getString('button:generate', component);
        }

        // Set selected source.
        await this.setSelectedSource(data);

        // Clear attached listeners.
        removeAttachedExampleListeners();
        this.removeAttachedClickListeners();
        this.removeAttachedChangeListeners();
        this.removeAttachedKeyupListeners();

        // Get fields and insert the dom.
        const template = await fieldTemplate({
            ...this, // Object of bibliography.
            fields: await this.requiredFieldObject() // Arrays of required fields.
        });
        byId('main-input-fields').innerHTML = template;

        // Then re-create new listeners.
        getExample(this);
        this.addClickListeners();
        this.addChangeListeners();
        this.addKeyupListeners();

        // Set bibliography container height to form container's height accordingly.
        this.resetBibliographyContainerHeight();
    };

    /**
     * Get's all the required fields based on the selected source.
     *
     * @returns {Array}
     */
    requiredFieldObject = async() => {
        let labelArray = [];
        // Get all fields labels and push them in labelArray.
        this.fields.forEach((field) => {
            labelArray.push(field.label);
        });

        // Get labels' string lang.
        const labels = await getStrings(labelArray.map((key) => ({key, component})));

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
                show: field.required ?? this.allData.showOtherFields,
                required: this.allData.showOtherFields ? field.required : this.allData.showOtherFields
            });
            i++;
        });

        return fields;
    };

    /**
     * Splits author's name.
     *
     * @param {string} field
     */
    splitAuthorName(field = null) {
        const data = this.allData[field];
        this.allData[`pure${ucFirst(field)}`] = data;
        this.allData[field] = '';
        if (!data) {
            return;
        }

        if (data.includes(';') === true) {
            const authors = data.split(';');
            authors.forEach(author => {
                author = author.trim();
                if (author !== '') {
                    this.setGeneratedAuthorNames(this.generateDetailedAuthorName(author), field);
                }
            });
        } else {
            this.setGeneratedAuthorNames(this.generateDetailedAuthorName(data), field);
        }
    }

    /**
     * Sets generated author's name.
     *
     * @param {string} names
     * @param {string} field
     */
    setGeneratedAuthorNames(names = null, field = null) {
        if (this.allData[field] !== '') {
            this.allData[field] += ', ' + names;
        } else {
            this.allData[field] = names;
        }
    }

    /**
     * Returns generated author's name.
     *
     * @param {string} author
     * @returns {string}
     */
    generateDetailedAuthorName(author = null) {
        let sureName = '';
        let firstName = '';
        let middleName = '';

        if (author.includes(',')) {
            const names = author.split(',');
            sureName = names[0];
            let fmName = names[1];

            if (fmName.includes(' ')) {
                fmName = fmName.split(' ');
                let i = 0;
                fmName.forEach(fm => {
                    if (fm !== '') {
                        if (i === 0) {
                            firstName = fm;
                        } else {
                            middleName += fm + ' ';
                        }
                        i++;
                    }
                });
            } else {
                firstName = fmName;
            }
        } else {
            firstName = author;
        }

        return this.selectedStyle.generateAuthorName(firstName.trim(), middleName.trim(), sureName.trim()).generated;
    }

    /**
     * Sets custom authors' names.
     *
     * @param {event} event
     */
    setCustomAuthorNames(event) {
        // Show custom author name's fields.
        const customAuthorName = event.target.closest('[data-action="custom-bibliography-author"]');
        if (customAuthorName) {
            const field = customAuthorName.dataset.field;
            hideElement([`full-${field}-holder`, 'generate-button']);
            showElement([`custom-${field}-holder`]);
        }

        // Hide custom author name's fields.
        const cancelCustom = event.target.closest('[data-action="cancel-custom-bibliography-author"]');
        if (cancelCustom) {
            const field = cancelCustom.dataset.field;
            showElement([`full-${field}-holder`, 'generate-button']);
            hideElement([`custom-${field}-holder`]);
        }

        // Process custom author name.
        const okCustom = event.target.closest('[data-action="ok-custom-bibliography-author"]');
        if (okCustom) {
            const field = okCustom.dataset.field;
            const fullName = this.selectedStyle.generateAuthorName(
                byId(`id_bibliography_${field}_firstname`).value,
                byId(`id_bibliography_${field}_middlename`).value,
                byId(`id_bibliography_${field}_surename`).value
            ).originated.trim();

            let oriData = byId(`id_bibliography_${field}`).value;
            if (oriData === '') {
                oriData = fullName;
            } else {
                oriData += '; ' + fullName;
            }

            this.allData[field] = oriData;
            this.splitAuthorName(field);
            this.allData[`pure${ucFirst(field)}`] = oriData;

            byId(`id_bibliography_${field}`).value = oriData;

            // Clear the inputs.
            byId(`id_bibliography_${field}_firstname`).value = '';
            byId(`id_bibliography_${field}_middlename`).value = '';
            byId(`id_bibliography_${field}_surename`).value = '';

            showElement([`full-${field}-holder`, 'generate-button']);
            hideElement([`custom-${field}-holder`]);
        }
    }
}
