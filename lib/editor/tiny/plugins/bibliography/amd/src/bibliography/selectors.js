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

/**
 * Tiny Media plugin helper function to build queryable data selectors.
 *
 * @module      tiny_media/selectors
 * @copyright   2022 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

export default {
    actions: {
        generateBibliography: '[data-action="generate-list"]',
        updateBibliography: '[data-action="update-bibliography"]',
        showOtherFields: '[data-action="show-other-fields"]',
        citeThis: '[data-action="cite-this"]',
        deleteBibliography: '[data-action="delete-bibliography"]',
        editBibliography: '[data-action="edit-bibliography"]',
        resetBibliographyForm: '[data-action="reset-bibliography-form"]',
        selectStyle: '[data-action="select-style"]',
        selectSource: '[data-action="select-source"]',
        getBibliographyExample: '[data-type="bibliography-info-example"]',
        setCustomAuthor: '[data-action="custom-bibliography-author"]',
        cancelCustomAuthor: '[data-action="cancel-custom-bibliography-author"]',
        okCustomAuthor: '[data-action="ok-custom-bibliography-author"]',
        backToBibliographyList: '[data-action="back-to-bibliography-list"]',
        deleteAllBibliography: '[data-action="delete-all-bibliography"]',
        addBibliography: '[data-action="add-bibliography"]',
    },
    elements: {
        modalBodyTemplateContainer: '.tiny_bibliography_body_template',
        modalFooterTemplateContainer: '.tiny_bibliography_footer_template',
        mainInputFields: '#main-input-fields',
        bibliographyListContainer: 'bibliography-list-container',
        bibliographyListContainerClass: '[class="bibliography-list-container"]',
        warning: '.tiny_bibliography_warning',
        bibliographyListModalContainer: 'bibliography-list-modal-container',
        bibliographyIePanel: '#bibliography-ie-panel',
        bibliographyFormContainer: '#bibliography-form-container',
        bibliographyListOuterModalContainer: '#bibliography-list-outer-modal-container',
        showAllFieldContainer: '#show-all-field-container',
        bibliographyStyle: '#id_bibliography_style',
        bibliographySource: '#id_bibliography_source',
    },
    template: {
        body: {
            insertBibliography: 'tiny_bibliography/body/insert_bibliography_body',
            bibliographyField: 'tiny_bibliography/forms/field',
        },
        footer: {
            insertBibliography: 'tiny_bibliography/footer/insert_bibliography_footer',
        }
    },
    allowedMethods: [
        'getSources',
    ]
};
