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
 * Tiny Media Manager commands.
 *
 * @module      tiny_accessibilitychecker/commands
 * @copyright   2023 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getStrings} from 'core/str';
import {
    component,
    citationButtonName,
    viewBibliographyButtonName,
    addBibliographyButtonName,
    removeCitationButtonName,
    editCitationButtonName,
} from './common';
import Bibliography from './bibliography/bibliography';
import {getData} from './options';
import {getButtonImage} from 'editor_tiny/utils';

let API = [];

const registerViewBibliographyCommand = async(editor, buttonTooltip) => {
    const [
        buttonIcon,
    ] = await Promise.all([
        getButtonImage('bibliography', component),
    ]);

    const icon = 'bibliography';
    editor.ui.registry.addIcon(icon, buttonIcon.html);

    // Register the Menu Button as a toggle.
    // This means that when highlighted over an existing in-text reference element it will show as toggled on.
    editor.ui.registry.addToggleButton(viewBibliographyButtonName, {
        icon: icon,
        tooltip: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor, 'bibliography', API);
            bibliography.displayDialogue();
        },
        onSetup: api => {
            API.push(api);
            return editor.selection.selectorChangedWithUnbind(
                'div:not([data-mce-object]):not([data-mce-placeholder])[class=bibliography-list-container]',
                api.setActive
            ).unbind;
        }
    });
};

const registerAddBibliographyCommand = async(editor, buttonTooltip) => {
    const icon = 'plus';

    // Register the Menu Button as a toggle.
    editor.ui.registry.addButton(addBibliographyButtonName, {
        icon,
        tooltip: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor, 'insert');
            bibliography.displayDialogue();
        }
    });

    editor.ui.registry.addMenuItem(addBibliographyButtonName, {
        icon,
        text: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor, 'insert');
            bibliography.displayDialogue();
        }
    });
};

const registerCitationCommand = (editor, buttonTooltip) => {
    const icon = 'quote';

    // Register the Menu Button as a toggle.
    // This means that when highlighted over an existing in-text reference element it will show as toggled on.
    editor.ui.registry.addToggleButton(citationButtonName, {
        icon: icon,
        tooltip: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor, 'citation', API);
            bibliography.displayDialogue();
        },
        onSetup: api => {
            API.push(api);
            return editor.selection.selectorChangedWithUnbind(
                'span:not([data-mce-object]):not([data-mce-placeholder])[class=cited-bibliography]',
                api.setActive
            ).unbind;
        }
    });
};

const registerRemoveCitationCommand = (editor, buttonTooltip) => {
    const icon = 'remove';

    // Register the Menu Button as a toggle.
    // This means that when highlighted over an existing in-text reference element it will show as toggled on.
    editor.ui.registry.addToggleButton(removeCitationButtonName, {
        icon: icon,
        tooltip: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor, 'remove_in_text_citation', API);
            bibliography.removeCitation();
        },
        onSetup: api => {
            API.push(api);
            const unbind = editor.selection.selectorChangedWithUnbind([
                'span.cited-bibliography', 'p.citation-list'
            ], (state) => {
                api.setActive(state);
            });
            return unbind;
        },
    });
};

const registerEditCitationCommand = (editor, buttonTooltip) => {
    const icon = 'edit-block';

    // Register the Menu Button as a toggle.
    // This means that when highlighted over an existing in-text reference element it will show as toggled on.
    editor.ui.registry.addToggleButton(editCitationButtonName, {
        icon: icon,
        tooltip: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor, 'edit_citation', API);
            bibliography.editCitation();
        },
        onSetup: api => {
            API.push(api);
            const unbind = editor.selection.selectorChangedWithUnbind('p.citation-list', (state) => {
                api.setActive(state);
            });
            return unbind;
        },
    });
};

export const getSetup = async() => {
    const [
        addBibliography,
        bibliographyList,
        removeCitation,
        editCitation,
        citation,
    ] = await getStrings([
        'command:add_bibliography',
        'command:bibliography_list',
        'command:remove_citation',
        'command:edit_citation',
        'citation'
    ].map((key) => ({key, component})));

    return (editor) => {
        const pluginData = getData(editor);
        const installed = Object.keys(pluginData.stylesAndSource).length;
        if (installed > 0) {
            registerViewBibliographyCommand(editor, bibliographyList);
            registerAddBibliographyCommand(editor, addBibliography);
            registerCitationCommand(editor, citation);
            registerRemoveCitationCommand(editor, removeCitation);
            registerEditCitationCommand(editor, editCitation);
        }
    };
};
