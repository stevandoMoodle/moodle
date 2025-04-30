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

import {getData} from '../options';
import {Setter} from './setter';
import {getSourceLangString, showElement, ucFirst} from './helper';
import BibliographyModal from './bibliography_modal';
import {Handler} from './handler';
import {getStrings, getString} from 'core/str';
import {component} from '../common';
import {prefetchStrings} from 'core/prefetch';
import Selectors from "./selectors";
import Notification from 'core/notification';
import {getBibliographyButtons} from './template_loader';
import {alert} from 'core/notification';

prefetchStrings(component, [
    // Modal title.
    'modal_title:insert',
    'modal_title:bibliography',
    'modal_title:citation',
    'modal_title:update',
    'modal_title:default_style_not_enabled',
    'modal_title:citation_not_selected',
    'modal_title:used_style_not_available',
    'modal_title:used_style_not_selected',
    'alert:oops',
    'modal_warning:no_selected_citation',
]);

export default class Bibliography extends Setter {

    constructor(editor, type = 'bibliography', api = []) {
        super();

        this.toggleButtonApi = api;

        this.editor = editor;
        this.type = type;

        const pluginData = getData(editor);
        this.styleSources = pluginData.stylesAndSource;
        this.defaultStyleNotEnabled = pluginData.defaultStyleNotEnabled;

        const defaultSetting = pluginData.default;
        this.DEFAULT = {
            STYLE: defaultSetting.style,
            SOURCE: defaultSetting.sources,
        };

        this.allData = {};
        this.fields = [];
        this.saveAsNew = false;
        this.create = true;

        // Get bibliography used style and check if it's enabled.
        const [usedStyleNotAvailable, usedStyle] = (new Handler(this)).getCurrentBibliographyStyle();
        if (usedStyleNotAvailable) {
            this.usedStyleNotAvailable = true;
        }

        if (usedStyle) {
            this.usedStyle = usedStyle;
        }

        if (!this.defaultStyleNotEnabled && !usedStyleNotAvailable) {
            this.initSetter();
        }
    }

    setType = (type) => {
        this.type = type;
    };

    destroy() {
        delete this.editor;
        this.modal.destroy();
        delete this.modal;
    }

    editCitation = async() => {
        let selectedNode = this.editor.selection.getNode();
        if (selectedNode.nodeType === 1) {
            const citationContainer = selectedNode.closest('.citation-list');
            if (citationContainer) {
                let targetId = null;
                citationContainer.classList.forEach(className => {
                    if (className.includes('bibliography-item-')) {
                        targetId = className;
                    }
                });

                if (targetId) {
                    await this.prefetchAllLangStrings();
                    await this.crateModal();

                    const styles = await getSourceLangString(
                        this.getStyles(),
                        'style',
                        this.allData.style ?? this.DEFAULT.STYLE,
                    );

                    const sources = await getSourceLangString(
                        this.getSources(this.allData.style ?? this.DEFAULT.STYLE),
                        'source',
                        this.DEFAULT.SOURCE[this.allData.style ?? this.DEFAULT.STYLE],
                    );

                    const templateContext = {
                        styles: styles,
                        sources: sources,
                        isEditCitation: true,
                        showForm: true,
                        targetId,
                        index: targetId.replace('bibliography-item-', '')
                    };

                    this.bibliography = this;
                    await (new Handler(this)).loadTemplatePromise(templateContext);
                }
            }
        }
    };

    removeCitation = async() => {
        let selectedNode = this.editor.selection.getNode();
        if (selectedNode.nodeType === 1) {
            const citationContainer = selectedNode.closest('.citation-list');
            if (citationContainer) {
                let targetId = null;
                citationContainer.classList.forEach(className => {
                    if (className.includes('bibliography-item-')) {
                        targetId = className;
                    }
                });

                if (targetId) {
                    const index = targetId.replace('bibliography-item-', '');
                    const newNode = await getBibliographyButtons({
                        id: targetId,
                        index: index,
                        bio: citationContainer.querySelectorAll('.d-flex')[0].innerHTML.trim(),
                        heading: false,
                        buttons: false,
                    });

                    Notification.deleteCancelPromise(
                        getString('modal_title:confirmation', component),
                        getString('message:remove_citation', component, newNode),
                    ).then(() => {
                        this.selectedStyle.deleteBibliography({...this, targetId});
                        this.editor.focus();
                        return;
                    }).catch(error => {
                        window.console.log(error);
                    });
                } else {
                    alert(
                        await getString('alert:oops', component),
                        await getString('alert:invalid_citation', component)
                    );
                }
            } else {
                const classList = selectedNode.classList;
                if (classList.length > 0) {
                    if (Object.values(classList).includes('cited-bibliography')) { // Remove in-text citation.
                        Notification.deleteCancelPromise(
                            getString('modal_title:confirmation', component),
                            getString('message:remove_in_text_citation', component),
                        ).then(() => {
                            selectedNode.remove();
                            this.editor.focus();
                            return;
                        }).catch(error => {
                            window.console.log(error);
                        });
                    }
                }
            }
        }
    };

    resetToggleButton = () => {
        this.toggleButtonApi.forEach(api => {
            api.setActive(false);
        });
    };

    async displayDialogue() {
        await this.prefetchAllLangStrings();
        await this.crateModal();

        if (this.defaultStyleNotEnabled) {
            this.modal.setTitle(this.langStrings['modal_title:default_style_not_enabled']);
            showElement([Selectors.elements.warning], this.root);
            return;
        } else if (this.usedStyleNotAvailable) {
            // Set modal title.
            this.modal.setTitle(this.langStrings['modal_title:used_style_not_available']);

            // Handle warning message.
            const warning = this.root.querySelector(Selectors.elements.warning);
            warning.innerHTML = await getString('modal_warning:used_style_not_available', component, ucFirst(this.usedStyle));
            showElement([Selectors.elements.warning], this.root);

            // Add delete all bibliography event.
            this.addDeleteAllBibliographyEvent(this.root);
            return;
        } else {
            const styles = await getSourceLangString(
                this.getStyles(),
                'style',
                this.allData.style ?? this.DEFAULT.STYLE,
            );

            const sources = await getSourceLangString(
                this.getSources(this.allData.style ?? this.DEFAULT.STYLE),
                'source',
                this.DEFAULT.SOURCE[this.allData.style ?? this.DEFAULT.STYLE],
            );

            const templateContext = {
                styles: styles,
                sources: sources,
                isInsertBibliography: (this.type === 'insert'),
                showForm: (this.type === 'insert'),
                isBibliography: (this.type === 'bibliography'),
            };

            const selectedNode = this.editor.selection.getNode();
            if (selectedNode.nodeType === 1) {
                const classList = selectedNode.classList;
                if (classList.length > 0 && Object.values(classList).includes('cited-bibliography')) {
                    this.selectedIndex = selectedNode.textContent.replace(/[\[\]]/g, '');
                }
            }

            if (
                (this.type === 'citation' && this.selectedIndex) ||
                this.type === 'bibliography' ||
                this.type === 'insert'
            ) {
                // Let's create a bibliography reference property.
                this.bibliography = this;
                (new Handler(this)).loadTemplatePromise(templateContext);
            } else {
                this.modal.setTitle(this.langStrings['alert:oops']);
                this.modal.setBody(this.langStrings['modal_warning:no_selected_citation']);
                return;
            }
        }
    }

    crateModal = async() => {
        this.modal = await BibliographyModal.create({
            large: true,
            templateContext: {
                id: this.editor.getElement().id,
                defaultStyle: ucFirst(this.allData.style ?? this.DEFAULT.STYLE),
                usedStyleNotAvailable: this.usedStyleNotAvailable,
            },
        });
        this.modalRoot = this.modal.getRoot();
        this.root = this.modal.getRoot()[0];
    };

    getStyles = () => {
        return Object.keys(this.styleSources).sort();
    };

    getSources = (style = null) => {
        if (!style.includes('style:')) {
            style = `style:${style}`;
        }

        const data = this.styleSources;
        if (!data[style]) {
            return [];
        }

        return Object.values(data[style]).sort();
    };

    prefetchAllLangStrings = async() => {
        const langStringKeys = [
            // Modal title.
            'modal_title:insert',
            'modal_title:bibliography',
            'modal_title:citation',
            'modal_title:update',
            'modal_title:default_style_not_enabled',
            'modal_title:used_style_not_available',
            'modal_title:used_style_not_selected',
            'alert:oops',
            'modal_warning:no_selected_citation',
        ];
        const langStringValues = await getStrings([...langStringKeys].map((key) => ({key, component})));
        this.langStrings = Object.fromEntries(langStringKeys.map((key, index) => [key, langStringValues[index]]));
    };

    addDeleteAllBibliographyEvent = (root) => {
        const deleteAllBibliography = root.querySelector(Selectors.actions.deleteAllBibliography);
        if (deleteAllBibliography) {
            deleteAllBibliography.addEventListener('click', () => {
                (new Handler(this)).deleteAllBibliography();
            });
        }
    };

    // resetBibliographyContainerHeight = () => {
        // const form = byId('bibliography-form-container');
        // const bibliographyContainer = byId('bibliography-list-modal-container');
        // bibliographyContainer.style.height = `0px`;
        // if (bibliographyContainer) {
        //     bibliographyContainer.style.height = `${form.offsetHeight - 15}px`;
        //     showElement(['bibliography-list-modal-container']);
        // }
    // };
}
