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

import {AuthorFormatter} from './author_formatter';
import {Handler} from './handler';
import {
    resetBibliographyFormFields,
    getSourceLangString,
    byId,
    setPropertiesFromData,
    showElement,
    hideElement,
} from './helper';
import Selectors from "./selectors";
import {Setter} from './setter';
import {sourceOptions} from './template_loader';

export class EventHandler {

    constructor(data) {
        // Creates dynamic properties based on "data" param.
        setPropertiesFromData(this, data);
    }

    addClickListeners = () => {
        const element = this.root;
        const handler = this.createClickListenerHandler.bind(null);
        element.addEventListener('click', handler);

        if (!this.attachedClickEventListener) {
            this.attachedClickEventListener = [];
        }
        this.attachedClickEventListener.push([element, handler, 'click']);
    };

    createClickListenerHandler = (event) => {
        const eventTarget = event.target;

        // Sets and generates custom authors' names.
        (new Handler(this)).setCustomAuthorNames(event);

        // Generates a new bibliography list and inserts it.
        const generateList = eventTarget.closest(Selectors.actions.generateBibliography);
        if (generateList) {
            this.selectedStyle.generateBibliography(this);
        }

        // Save to bo updated bio as a new bio.
        const updateBibliography = eventTarget.closest(Selectors.actions.updateBibliography);
        if (updateBibliography) {
            this.create = false;
            this.updateId = updateBibliography.dataset.id;
            this.updateIndex = updateBibliography.dataset.index;
            this.selectedStyle.generateBibliography(this);
        }

        // Generates and inserts a new citation.
        const optionalFields = eventTarget.closest(Selectors.actions.showOtherFields);
        if (optionalFields) {
            // Show update / generate button in case it was hidden.
            showElement([
                Selectors.actions.generateBibliography,
                Selectors.actions.updateBibliography,
            ], this.root);
            this.allData.showOtherFields = optionalFields.checked;
            (new Handler(this)).loadFieldTemplate(false);
        }

        // Generates and inserts a new citation.
        const cite = eventTarget.closest(Selectors.actions.citeThis);
        if (cite) {
            this.selectedStyle.citeThis(this, event);
        }

        // Delete bibliography.
        const deleteBibliography = eventTarget.closest(Selectors.actions.deleteBibliography);
        if (deleteBibliography) {
            this.selectedStyle.deleteBibliography({...this, deleteBibliography: deleteBibliography});
        }

        // Edit bibliography.
        const editBio = eventTarget.closest(Selectors.actions.editBibliography);
        if (editBio) {
            showElement([
                Selectors.elements.bibliographyFormContainer,
                Selectors.elements.bibliographyIePanel,
                Selectors.actions.generateBibliography,
                Selectors.elements.showAllFieldContainer,
            ], this.root);
            hideElement([Selectors.elements.bibliographyListOuterModalContainer], this.root);

            this.modal.setTitle(this.langStrings['modal_title:update']);
            this.selectedStyle.editBibliography(this, editBio);
        }

        // Reset bibliography form.
        const resetBibliography = eventTarget.closest(Selectors.actions.resetBibliographyForm);
        if (resetBibliography) {
            this.create = true;
            this.updateId = null;
            this.updateIndex = null;
            this.modal.setTitle(this.langStrings['modal_title:insert']);
            resetBibliographyFormFields(this);

            resetBibliography.remove();
        }

        // Back to bibliography list.
        const backToBibliography = eventTarget.closest(Selectors.actions.backToBibliographyList);
        if (backToBibliography) {
            hideElement([
                Selectors.elements.bibliographyFormContainer,
                Selectors.elements.bibliographyIePanel,
                Selectors.actions.generateBibliography,
                Selectors.elements.showAllFieldContainer,
            ], this.root);
            showElement([Selectors.elements.bibliographyListOuterModalContainer], this.root);

            this.modal.setTitle(this.langStrings['modal_title:bibliography']);

            // Remove update related buttons.
            const resetBibliography = this.root.querySelector(Selectors.actions.resetBibliographyForm);
            if (resetBibliography) {
                resetBibliography.remove();
            }

            const updateBibliography = this.root.querySelector(Selectors.actions.updateBibliography);
            if (updateBibliography) {
                updateBibliography.remove();
            }
            backToBibliography.remove();
        }
    };

    removeAttachedClickListeners = () => {
        if (this.attachedClickEventListener) {
            this.attachedClickEventListener.forEach(listener => {
                // Destruct the listener.
                const [element, handler, even] = listener;

                // Remove the attached listener.
                element.removeEventListener(even, handler);
            });
            this.attachedClickEventListener = [];
        }
    };

    addChangeListeners = () => {
        const element = this.root;
        const handler = this.createChangeListenerHandler.bind(null);
        element.addEventListener('change', handler);

        if (!this.attachedChangeEventListener) {
            this.attachedChangeEventListener = [];
        }
        this.attachedChangeEventListener.push([element, handler, 'change']);
    };

    createChangeListenerHandler = async(event) => {
        const setter = new Setter(this);
        const selectStyle = event.target.closest(Selectors.actions.selectStyle);
        if (selectStyle) {
            setter.setStyle(selectStyle.value);

            const sources = await getSourceLangString(
                this.getSources(selectStyle.value),
                'source',
                this.DEFAULT.SOURCE[selectStyle.value],
            );
            byId('id_bibliography_source').innerHTML = await sourceOptions(sources);
            setter.setSource(this.DEFAULT.SOURCE[selectStyle.value]);
        }

        const selectSource = event.target.closest(Selectors.actions.selectSource);
        if (selectSource) {
            setter.setSource(selectSource.value);
        }
    };

    removeAttachedChangeListeners = () => {
        if (this.attachedChangeEventListener) {
            this.attachedChangeEventListener.forEach(listener => {
                // Destruct the listener.
                const [element, handler, even] = listener;

                // Remove the attached listener.
                element.removeEventListener(even, handler);
            });
            this.attachedChangeEventListener = [];
        }
    };

    addKeyupListeners = () => {
        const element = this.root;
        const handler = this.createKeyupListenerHandler.bind(null);
        element.addEventListener('keyup', handler);

        if (!this.attachedKeyupEventListener) {
            this.attachedKeyupEventListener = [];
        }
        this.attachedKeyupEventListener.push([element, handler, 'keyup']);
    };

    createKeyupListenerHandler = (event) => {
        const exampleNodes = event.target.closest(Selectors.actions.getBibliographyExample);
        if (exampleNodes) {
            this.allData[exampleNodes.dataset.name] = exampleNodes.value;
            if (exampleNodes.dataset.author === 'true') {
                (new AuthorFormatter(this)).splitAuthorName(exampleNodes.dataset.name);
            }
        }
    };

    removeAttachedKeyupListeners = () => {
        if (this.attachedKeyupEventListener) {
            this.attachedKeyupEventListener.forEach(listener => {
                // Destruct the listener.
                const [element, handler, even] = listener;

                // Remove the attached listener.
                element.removeEventListener(even, handler);
            });
            this.attachedKeyupEventListener = [];
        }
    };
}
