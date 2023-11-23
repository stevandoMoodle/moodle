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

import * as Modal from 'core/modal_factory';
import * as ModalEvents from 'core/modal_events';
import {get_string as getString} from 'core/str';

import {component} from '../common';
import Setter from './setter';
import {getExample} from './example';
import {getDialogueContent, getBioListWithButtons} from './templateloader';
import {byId, getSourceLangString, showElement, ucFirst} from './helper';

export default class Bibliography extends Setter {

    constructor(editor) {
        super();
        this.editor = editor;
        this.modal = null;

        this.allData = {};
        this.selectedSource = null;
        this.selectedStyle = null;
        this.fields = [];

        this.create = true;
        this.updateId = null;
        this.updateIndex = null;

        this.attachedClickEventListener = [];
        this.attachedChangeEventListener = [];
        this.attachedKeyupEventListener = [];
        this.initSetter();
    }

    destroy() {
        delete this.editor;
        this.modal.destroy();
        delete this.modal;
    }

    async displayDialogue() {
        const sources = await getSourceLangString(this.selectedStyle.ALL_SOURCES);
        this.modal = await Modal.create({
            type: Modal.types.DEFAULT,
            large: true,
            title: getString('pluginname', component),
            body: getDialogueContent(sources)
        });

        // Destroy the class when hiding the modal.
        this.modal.getRoot().on(ModalEvents.hidden, () => this.destroy());

        this.modal.getRoot().on(ModalEvents.bodyRendered, async() => {
            // Generates bibliography list and display in modal.
            this.generateBioAndDisplayInModal();

            // Manually get the bio example.
            getExample();

            await this.setSource();
        });

        this.modal.show();
    }

    resetBibliographyContainerHeight = () => {
        const form = byId('bibliography-info-holder');
        const bibliographyContainer = byId('bibliography-info-list-holder');
        bibliographyContainer.style.height = `0px`;
        if (bibliographyContainer) {
            bibliographyContainer.style.height = `${form.offsetHeight - 15}px`;
            showElement(['bibliography-info-list-holder']);
        }
    };

    addKeyupListeners = () => {
        const element = this.modal.getRoot()[0];
        const handler = this.createKeyupListenerHandler.bind(null);
        element.addEventListener('keyup', handler);
        this.attachedKeyupEventListener.push([element, handler, 'keyup']);
    };

    createKeyupListenerHandler = (event) => {
        const exampleNodes = event.target.closest('[data-type="bibliography-info-example"]');
        if (exampleNodes) {
            this.allData[exampleNodes.dataset.name] = exampleNodes.value;
            if (exampleNodes.dataset.author === 'true') {
                this.splitAuthorName(exampleNodes.dataset.name);
            }
        }
    };

    removeAttachedKeyupListeners = () => {
        this.attachedKeyupEventListener.forEach(listener => {
            // Destruct the listener.
            const [element, handler, even] = listener;

            // Remove the attached listener.
            element.removeEventListener(even, handler);
        });
        this.attachedKeyupEventListener = [];
    };

    addChangeListeners = () => {
        const element = this.modal.getRoot()[0];
        const handler = this.createChangeListenerHandler.bind(null);
        element.addEventListener('change', handler);
        this.attachedChangeEventListener.push([element, handler, 'change']);
    };

    createChangeListenerHandler = (event) => {
        const exampleNodes = event.target.closest('[data-type="style-source"]');
        if (exampleNodes) {
            const callback = `set${ucFirst(exampleNodes.dataset.name)}`;
            this[callback](exampleNodes.value);
        }
    };

    removeAttachedChangeListeners = () => {
        this.attachedChangeEventListener.forEach(listener => {
            // Destruct the listener.
            const [element, handler, even] = listener;

            // Remove the attached listener.
            element.removeEventListener(even, handler);
        });
        this.attachedChangeEventListener = [];
    };

    addClickListeners = () => {
        const element = this.modal.getRoot()[0];
        const handler = this.createClickListenerHandler.bind(null);
        element.addEventListener('click', handler);
        this.attachedClickEventListener.push([element, handler, 'click']);
    };

    createClickListenerHandler = (event) => {
        // Sets and generates custom authors' names.
        this.setCustomAuthorNames(event);

        // Generates a new bibliography list and inserts it.
        const generateList = event.target.closest('[data-action="generate-list"]');
        if (generateList) {
            this.selectedStyle.generateBibliography(this);
        }

        // Generates and inserts a new citation.
        const optionalFields = event.target.closest('[data-action="show-other-fields"]');
        if (optionalFields) {
            this.allData.showOtherFields = optionalFields.checked;
            this.setSource(this.allData.source);
        }

        // Generates and inserts a new citation.
        const cite = event.target.closest('[data-action="cite-this"]');
        if (cite) {
            this.selectedStyle.citeThis(this, event);
        }

        // Delete citation.
        const deleteBio = event.target.closest('[data-action="delete-bio"]');
        if (deleteBio) {
            this.selectedStyle.deleteBibliography(this, event);
        }

        // Edit bibliography.
        const editBio = event.target.closest('[data-action="edit-bio"]');
        if (editBio) {
            this.selectedStyle.editBibliography(this, editBio);
        }
    };

    removeAttachedClickListeners = () => {
        this.attachedClickEventListener.forEach(listener => {
            // Destruct the listener.
            const [element, handler, even] = listener;

            // Remove the attached listener.
            element.removeEventListener(even, handler);
        });
        this.attachedClickEventListener = [];
    };

    /**
     * Generates bibliography list and display them in the modal.
     */
    generateBioAndDisplayInModal = () => {
        let bioList = this.editor.dom.select('[class="id-bibliography-holder"]');
        if (bioList.length > 0) {
            let nodes = byId('bibliography-info-list-holder'),
            index = 1;
            nodes.innerHTML = '';
            bioList[0].childNodes.forEach(async node => {

                let newNode;
                if (node.nodeName === 'DIV' && node.textContent.trim() !== '') {
                    let textContent = '';
                    if (node.firstChild.nodeName !== 'SPAN') {
                        textContent = node.childNodes[1].innerHTML.replaceAll('" "', '"');
                    } else {
                        textContent = node.firstChild.innerHTML.replaceAll('" "', '"');
                    }

                    newNode = await getBioListWithButtons({
                        id: node.getAttribute('class'),
                        last: (index === bioList[0].childNodes.length - 1) ? true : false,
                        index: index++,
                        dataObject: `{${textContent}}`,
                        bio: node.innerHTML.trim(),
                        heading: false
                    });
                } else if (node.nodeName === 'H3' && node.textContent.trim() !== '') {
                    newNode = await getBioListWithButtons({
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
