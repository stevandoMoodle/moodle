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
} from './common';
import Bibliography from './bibliography/bibliography';
import {getData} from './options';
import {getButtonImage} from 'editor_tiny/utils';

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
            const bibliography = new Bibliography(editor, 'bibliography');
            bibliography.displayDialogue();
        },
        onSetup: api => {
            return editor.selection.selectorChangedWithUnbind(
                'div:not([data-mce-object]):not([data-mce-placeholder])[class=bibliography-list-container]',
                api.setActive
            ).unbind;
        }
    });

    editor.ui.registry.addMenuItem(viewBibliographyButtonName, {
        icon,
        text: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor, 'bibliography');
            bibliography.displayDialogue();
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

const registerInsertCitationCommand = (editor, buttonTooltip) => {
    const icon = 'quote';

    // Register the Menu Button as a toggle.
    // This means that when highlighted over an existing in-text reference element it will show as toggled on.
    editor.ui.registry.addToggleButton(citationButtonName, {
        icon: icon,
        tooltip: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor, 'citation');
            bibliography.displayDialogue();
        },
        onSetup: api => {
            return editor.selection.selectorChangedWithUnbind(
                'span:not([data-mce-object]):not([data-mce-placeholder])[class=cited-bibliography]',
                api.setActive
            ).unbind;
        }
    });

    editor.ui.registry.addMenuItem(citationButtonName, {
        icon,
        text: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor, 'citation');
            bibliography.displayDialogue();
        }
    });
};

export const getSetup = async() => {
    const [
        addBibliography,
        bibliographyList,
        citation,
    ] = await getStrings([
        'command:add_bibliography',
        'command:bibliography_list',
        'citation'
    ].map((key) => ({key, component})));

    return (editor) => {
        const pluginData = getData(editor);
        const installed = Object.keys(pluginData.stylesAndSource).length;
        if (installed > 0) {
            registerViewBibliographyCommand(editor, bibliographyList);
            registerAddBibliographyCommand(editor, addBibliography);
            registerInsertCitationCommand(editor, citation);
        }
    };
};
