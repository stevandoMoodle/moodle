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
 * @copyright  2023 Stevani Andolo <stevani@hotmail.com.au>/
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getStrings} from 'core/str';
import {component} from './../common';
import {generateLabel} from './template_loader';

/**
 * Gets the citation number.
 *
 * @param {Document} refelement
 * @returns {string}
 */
export const getInTextRefNumber = (refelement) => {
    return refelement.textContent.replaceAll('[', '').replaceAll(']', '');
};

/**
 * Returns elementById.
 *
 * @param {element} element
 * @returns {element}
 */
export const byId = (element) => {
    return document.getElementById(element);
};

/**
 * Returns elementById.
 *
 * @param {element} element
 * @returns {element}
 */
export const selector = (element) => {
    return document.querySelector(element);
};

/**
 * Returns elementById.
 *
 * @param {element} element
 * @returns {element}
 */
export const selectorAll = (element) => {
    return document.querySelectorAll(element);
};

export const toCamelCase = (strings, delimiter) => {
    let newString = '';
    if (strings.includes(delimiter)) {
        strings.split(delimiter).forEach(string => {
            newString += string.charAt(0).toUpperCase() + string.slice(1);
        });
    } else {
        newString = strings.charAt(0).toUpperCase() + strings.slice(1);
    }
    return newString;
};

export const ucFirst = (string, returnAllString = true) => {
    if (returnAllString) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
        return string.charAt(0).toUpperCase();
    }
};

export const wordsFormat = (strings) => {
    if (strings.includes(',')) {
        const f = new Intl.ListFormat(document.documentElement.lang);
        return f.format(strings.split(','));
    }
    return strings;
};

export const lcFirst = (string) => {
    return string.charAt(0).toLowerCase() + string.slice(1);
};

export const hideElement = (elements = []) => {
    elements.forEach(element => {
        byId(element).classList.add('hide');
    });
};

export const addClass = (element, className) => {
    byId(element).classList.add(className);
};

export const showElement = (elements) => {
    elements.forEach(element => {
        byId(element).classList.remove('hide');
    });
};

export const toWords = (delimiter, strings, upperCase = false) => {
    let newString = '';
    if (strings.includes(delimiter)) {
        strings = strings.split(delimiter);
        strings.forEach(string => {
            if (upperCase) {
                newString += string.toUpperCase();
            } else {
                newString += string.charAt(0).toUpperCase() + string.slice(1) + ' ';
            }
        });
    } else {
        newString = strings.toUpperCase();
    }
    return newString.trim();
};

export const getUpperCase = (strings) => {
    return strings.replace(/[^A-Z]/g, '');
};

export const fromCamelCase = (delimiter, strings) => {
    let newString = '';
    strings = strings.charAt(0).toUpperCase() + strings.slice(1);
    strings = strings.match(/[A-Z][a-z]+/g);
    strings.forEach(string => {
        if (newString === '') {
            newString += string.toLowerCase();
        } else {
            newString += delimiter + string.toLowerCase();
        }
    });
    return newString;
};

export const getBibliographyFormFields = () => {
    const form = document.forms['bibliography-form'];
    const inputs = form.getElementsByTagName('input');
    const textAreas = form.getElementsByTagName('textarea');
    const selects = form.getElementsByTagName('select');
    let all = [].concat(Array.prototype.slice.call(inputs), Array.prototype.slice.call(textAreas));
    all = all.concat(Array.prototype.slice.call(selects));
    return all;
};

export const resetBibliographyFormFields = async(bio, resetStyleSource = true) => {
    getBibliographyFormFields().forEach(field => {
        const name = field.dataset.name;
        if (name && bio.allData[`pure${ucFirst(name)}`]) {
            bio.allData[`pure${ucFirst(name)}`] = '';
        } else {
            if (field.nodeName !== 'SELECT') {
                bio.allData[name] = '';
            }
        }

        if (field.nodeName === 'SELECT' && resetStyleSource) {
            const styleSource = (name === 'style') ?
                bio.DEFAULT.STYLE :
                bio.DEFAULT.SOURCE[bio.DEFAULT.STYLE];

            field.value = styleSource;
            bio.allData[name] = styleSource;
        } else {
            if (field.nodeName !== 'SELECT') {
                field.value = '';
            }
        }
    });

    if (bio.allData.showOtherFields) {
        bio.allData.showOtherFields = false;
        byId('id_other_fields').checked = false;
    }

    if (!resetStyleSource) {
        selector('[data-action="save-as-new"]').remove();
        selector('[data-action="generate-list"]').innerHTML = await generateLabel();
    } else {
        bio.setSource();
    }
};

export const getSourceLangString = async(strings, type = null, defaultCheck = null) => {
    const labels = await getStrings(strings.map((key) => ({key, component})));

    let i = 0;
    let sources = [];
    strings.forEach((string) => {
        if (type) {
            string = string.replaceAll(type === 'style' ? 'style:' : 'source:', '');
        }

        sources.push({
            name: string,
            label: labels[i],
            isSetDefault: (string === defaultCheck) ? true : false,
        });
        i++;
    });
    return sources;
};

/**
 * Extracts bibliography reference number from tiny editor.
 *
 * <p class="id-bibliography-list-1">
 *    <span class="d-flex mb-0">
 *       <span class="id-refno-1">[1]</span>
 *    </span>
 * </p>
 *
 * @param {element} element Bibliography element from tiny editor
 * @returns {string}
 */
export const extractRefNumber = (element) => {
    return parseInt(element // <p class="id-bibliography-list-1">.
           .childNodes[1] // <span class="d-flex mb-0">.
           .childNodes[1] // <span class="id-refno-1">[1]</span>.
           .textContent // [1].
           .replace('[', '').replace(']', '')); // 1.
};
