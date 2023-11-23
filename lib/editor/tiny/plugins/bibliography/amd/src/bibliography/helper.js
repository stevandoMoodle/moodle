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
        window.console.log(f.format(strings.split(',')));
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

export const resetBibliographyFormFields = (bio) => {
    getBibliographyFormFields().forEach(field => {
        const name = field.dataset.name;
        if (name && bio.allData[`pure${ucFirst(name)}`]) {
            bio.allData[`pure${ucFirst(name)}`] = '';
        } else {
            bio.allData[name] = '';
        }

        if (field.nodeName.toLowerCase() === 'select') {
            const styleSource = (name === 'style') ?
                bio.DEFAULT[name.toUpperCase()] :
                bio.selectedStyle.DEFAULT[name.toUpperCase()];

            field.value = styleSource;
            bio.allData[name] = styleSource;
        } else {
            field.value = '';
        }
    });

    if (bio.allData.showOtherFields) {
        bio.allData.showOtherFields = false;
        byId('id_other_fields').checked = false;
    }
    bio.setSource();
};

export const getSourceLangString = async(strings) => {
    const labels = await getStrings(strings.map((key) => ({key, component})));

    let i = 0;
    let sources = [];
    strings.forEach((string) => {
        sources.push({
            name: string.replaceAll('source:', ''),
            label: labels[i]
        });
        i++;
    });
    return sources;
};

/**
 * Gets last node to set the cursor position.
 * https://stackoverflow.com/questions/7962474/tinymce-insert-content-at-the-bottom.
 *
 * @param {node} node
 * @param {number} nodeType
 * @param {node} result
 * @returns {node}
 */
export const getTextNodes = (node, nodeType, result) => {
    var children = node.childNodes;
    nodeType = nodeType ? nodeType : 3;
    result = !result ? [] : result;
    if (node.nodeType == nodeType) {
        result.push(node);
    }

    for (var i = 0; i < children.length; i++) {
        result = getTextNodes(children[i], nodeType, result);
    }

    return result;
};
