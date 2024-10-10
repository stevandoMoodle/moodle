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

import {alert} from 'core/notification';
import {
    byId,
    getSourceLangString,
    toWords,
} from "./helper";
import {component} from '../common';
import {get_string as getString} from 'core/str';
import {sourceOptions} from "./template_loader";

/**
 * Options helper for Tiny Record RTC plugin.
 *
 * @module      tiny_bibliography/options
 * @copyright   2024 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

let styleSourceArray = [];

export const init = (styles, currentStyle, editor) => {
    window.console.log(styles, currentStyle, editor);
    const currentSelectedStyle = currentStyle;
    setStyleSourceArray(styles);

    const selectStyle = byId('id_s_tiny_bibliography_defaultstyle');
    const selectSource = byId('id_s_tiny_bibliography_defaultsource');

    if (selectStyle) {
        selectStyle.addEventListener('change', async(event) => {
            const selectedStyle = event.target.value;
            const sources = await getSourceLangString(styleSourceArray[selectedStyle], 'source');

            if (selectSource && sources.length > 0) {
                selectSource.innerHTML = await sourceOptions(sources);
            } else {
                selectStyle.value = currentSelectedStyle;

                // Alert the user.
                alert(
                    await getString('alert:warning', component),
                    await getString('stylenotavailable', component, toWords('_', selectedStyle, true))
                );
            }
        });
    }

    if (selectSource) {
        selectSource.addEventListener('change', (event) => {
            window.console.log(event.target.value);
        });
    }
};

const setStyleSourceArray = (styles) => {
    for (let key in styles) {
        styleSourceArray[key] = styles[key];
    }
};