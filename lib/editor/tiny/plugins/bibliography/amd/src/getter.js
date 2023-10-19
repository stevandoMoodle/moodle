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
 * @copyright  2023 Stevani Andolo  <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import * as Helper from './helper';
import * as Example from './example';

/**
 * Gets a reserved example based on the info type.
 *
 * @param {event} event
 * @returns {null}
 */
export const getExample = (event) => {
    const exampleNodes = event.target.closest('[data-type="bibliography-info-example"]');
    const examplePanel = Helper.elementId('bibliography-ie-panel');
    if (exampleNodes) {
        const example = (typeof Example[exampleNodes.dataset.action] === "function")
                ? Example[exampleNodes.dataset.action]() : null;
        if (!example) {
            examplePanel.style.display = 'none';
            return;
        }

        event.preventDefault();
        examplePanel.style.display = 'block';
        if (typeof example === 'object') {
            examplePanel.innerHTML = `
                Instructions: ${example.intro}
                <br>
                Example: ${example.example}
            `;
        } else {
            examplePanel.innerHTML = `Example: ${example}`;
        }
    } else {
        if (examplePanel) {
            examplePanel.style.display = 'none';
        }
    }
};

/**
 * Gets example manually.
 */
export const getExampleManually = () => {
    const examplePanel = Helper.elementId('bibliography-ie-panel');

    // Get author example.
    Helper.elementId("id_author").addEventListener("focus", () => {
        const author = Example.authorExample();
        examplePanel.innerHTML = `
            Instructions: ${author.intro}
            <br>
            Example: ${author.example}
        `;
    });

    // Get title example.
    Helper.elementId("id_title").addEventListener("focus", () => {
        examplePanel.innerHTML = `Example: ${Example.titleExample()}`;
    });

    // Get city example.
    Helper.elementId("id_city_bio").addEventListener("focus", () => {
        examplePanel.innerHTML = `Example: ${Example.cityExample()}`;
    });

    // Get publisher example.
    Helper.elementId("id_publisher").addEventListener("focus", () => {
        examplePanel.innerHTML = `Example: ${Example.publisherExample()}`;
    });

    // Get year example.
    Helper.elementId("id_year").addEventListener("focus", () => {
        examplePanel.innerHTML = `Example: ${Example.yearExample()}`;
    });
};
