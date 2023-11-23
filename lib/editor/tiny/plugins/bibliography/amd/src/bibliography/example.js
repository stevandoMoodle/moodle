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

import {byId, getBibliographyFormFields} from "./helper";

const date = new Date();
/**
 * Holds arrays of attached request listeners.
 *
 * @var {Array} attachedExampleListeners
 */
let attachedExampleListeners = [];

/**
 * Returns example for month.
 *
 * @returns {string}
 */
const monthExample = () => {
    const month = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    return month[date.getMonth()];
};

const exampleMap = {
    authorExample: {
        "intro": "<b>Author's surename, Author's initials; Author's surename, Author's initials</b>",
        "example": "Smith, John Wick; Smith, Michael"
    },
    titleExample: "How to create a new bibliography",
    bookTitleExample: 'Harry Potter',
    chapterTitleExample: 'Random patterns',
    shortTitleExample: 'Bibliography',
    publishedTitleExample: 'Computers and You',
    pageTitleExample: 'Obama inaugurated as President',
    websiteTitleExample: 'CNN.com',

    publisherExample: "IEEE",
    yearExample: date.getFullYear(),
    volumeExample: 'II',
    volumesExample: 'IV',

    issueExample: '12',
    chapterExample: '2',
    sectionExample: '3',
    pagesExample: '10-12',

    dayExample: date.getDay(),
    dateExample: date.getDate(),
    monthExample: monthExample(),
    cityExample: 'Perth',
    urlExample: "https://www.ieee.org/",
    webAddressExample: "https://www.ieee.org/",
    productionCompanyExample: "Moodle Production Line",

    stateProvinceExample: 'West Australia',
    countryExample: 'Australia',

    standardNumberExample: 'ISBN',
    nameOfWebsiteExample: 'Litware, Inc',
    commentsExample: 'Source was about bibliography',
    editionExample: '2nd Edition'
};

/**
 * Gets example manually.
 *
 * @param {Object} bio
 */
export const getExample = (bio) => {
    const form = getBibliographyFormFields();
    form.forEach(field => {
        const example = field.dataset.example;
        if (example) {
            addExampleListener(field.id, exampleMap[example], bio);
        }
    });
};

const addExampleListener = (element, example, bio) => {
    if (Array.isArray(element)) {
        element.forEach(el => {
            if (byId(el)) {
                const exampleEl = byId(el);
                const handler = createExampleHandler.bind(null, example, bio);
                exampleEl.addEventListener('focus', handler);
                attachedExampleListeners.push([exampleEl, handler, 'focus']);
            }
        });
    } else {
        if (byId(element)) {
            const exampleEl = byId(element);
            const handler = createExampleHandler.bind(null, example, bio);
            exampleEl.addEventListener('focus', handler);
            attachedExampleListeners.push([exampleEl, handler, 'focus']);
        }
    }
};

const createExampleHandler = (example = {}, args) => {
    const examplePanel = byId('bibliography-ie-panel');
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

    if (args) {
        args.resetBibliographyContainerHeight();
    }
};

/**
 * Removes attached focus listeners.
 *
 * @returns {void}
 */
export const removeAttachedExampleListeners = () => {
    attachedExampleListeners.forEach(listener => {
        // Destruct the listener.
        const [element, handler, even] = listener;

        // Remove the attached listener.
        element.removeEventListener(even, handler);
    });
    attachedExampleListeners = [];
};
