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
 * Tiny Media Manager configuration.
 *
 * @module      tiny_accessibilitychecker/configuration
 * @copyright   2023 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {
    citationButtonName,
    addBibliographyButtonName,
    viewBibliographyButtonName,
} from './common';
import {
    addContextmenuItem,
} from 'editor_tiny/utils';

const configureMenu = (menu) => {
    menu.insert.items = `${addBibliographyButtonName}`;

    return menu;
};

const configureToolbar = (toolbar) => {
    // The toolbar contains an array of named sections.
    // The Moodle integration ensures that there is a section called 'bibliography'.

    return toolbar.map((section) => {
        if (section.name === 'bibliography') {
            // Insert the image, and embed, buttons at the start of it.
            section.items.push(addBibliographyButtonName, viewBibliographyButtonName, citationButtonName);
        }

        return section;
    });
};

export const configure = (instanceConfig) => {
    return {
        contextmenu: addContextmenuItem(instanceConfig.contextmenu, addBibliographyButtonName, citationButtonName),
        menu: configureMenu(instanceConfig.menu),
        toolbar: configureToolbar(instanceConfig.toolbar),
    };
};
