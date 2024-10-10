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

// import {get_string as getString} from 'core/str';
import {getStrings} from 'core/str';
import {
    component,
    bibliographyButtonName,
    insertCitationButtonName,
    insertBibliographyButtonName,
    icon,
} from './common';
import Bibliography from './bibliography/bibliography';

const registerBibliographyCommand = (editor, buttonTooltip) => {
    // Register the Menu Button as a toggle.
    editor.ui.registry.addButton(bibliographyButtonName, {
        icon,
        tooltip: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor);
            bibliography.displayDialogue();
        }
    });

    editor.ui.registry.addMenuItem(bibliographyButtonName, {
        icon,
        text: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor);
            bibliography.displayDialogue();
        }
    });
};

const registerInsertBibliographyCommand = (editor, buttonTooltip) => {
    const icon = 'align-justify';

    // Register the Menu Button as a toggle.
    editor.ui.registry.addButton(insertBibliographyButtonName, {
        icon,
        tooltip: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor);
            bibliography.displayDialogue();
        }
    });

    editor.ui.registry.addMenuItem(insertBibliographyButtonName, {
        icon,
        text: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor);
            bibliography.displayDialogue();
        }
    });
};

const registerInsertCitationCommand = (editor, buttonTooltip) => {
    const icon = 'quote';

    // Register the Menu Button as a toggle.
    editor.ui.registry.addButton(insertCitationButtonName, {
        icon,
        tooltip: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor);
            bibliography.displayDialogue();
        }
    });

    editor.ui.registry.addMenuItem(insertCitationButtonName, {
        icon,
        text: buttonTooltip,
        onAction: () => {
            const bibliography = new Bibliography(editor);
            bibliography.displayDialogue();
        }
    });
};

export const getSetup = async() => {
    const [
        buttonTooltip,
        citation,
    ] = await getStrings([
        'pluginname', 'citation'
    ].map((key) => ({key, component})));

    return (editor) => {
        registerBibliographyCommand(editor, buttonTooltip);
        registerInsertBibliographyCommand(editor, buttonTooltip);
        registerInsertCitationCommand(editor, citation);
    };
};
