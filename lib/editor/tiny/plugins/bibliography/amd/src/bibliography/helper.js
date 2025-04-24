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

import Templates from 'core/templates';
import {getStrings} from 'core/str';
import {component} from './../common';
import Selectors from './selectors';
import {Setter} from './setter';

/**
 * Renders and inserts the body template for inserting an media into the modal.
 *
 * @param {object} templateContext - The context for rendering the template.
 * @param {HTMLElement} root - The root element where the template will be inserted.
 * @returns {Promise<void>}
 */
export const body = async(templateContext, root) => {
    return Templates.renderForPromise(templateContext.bodyTemplate, {...templateContext})
    .then(({html, js}) => {
        Templates.replaceNodeContents(root.querySelector(Selectors.elements.modalBodyTemplateContainer), html, js);
        return;
    })
    .catch(error => {
        window.console.log(error);
    });
};

/**
 * Renders and inserts the footer template for inserting an media into the modal.
 *
 * @param {object} templateContext - The context for rendering the template.
 * @param {HTMLElement} root - The root element where the template will be inserted.
 * @returns {Promise<void>}
 */
export const footer = async(templateContext, root) => {
    return Templates.renderForPromise(templateContext.footerTemplate, {...templateContext})
    .then(({html, js}) => {
        Templates.replaceNodeContents(root.querySelector(Selectors.elements.modalFooterTemplateContainer), html, js);
        return;
    })
    .catch(error => {
        window.console.log(error);
    });
};

export const insertNodes = async(templateContext, root) => {
    return Templates.renderForPromise(templateContext.template, {...templateContext})
    .then(({html, js}) => {
        Templates.replaceNodeContents(root.querySelector(templateContext.targetElement), html, js);
        return;
    })
    .catch(error => {
        window.console.log(error);
    });
};

/**
 * Set extra properties on an instance using incoming data.
 *
 * @param {object} instance
 * @param {object} data
 * @return {object} Modified instance
 */
export const setPropertiesFromData = async(instance, data) => {
    for (const property in data) {
        if (typeof data[property] === 'function' && Selectors.allowedMethods.includes(property)) {
            instance[property] = data[property];
        } else if (typeof data[property] !== 'function') {
            instance[property] = data[property];
        }
    }
    return instance;
};

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

export const addClass = (element, className) => {
    byId(element).classList.add(className);
};

export const hideElement = (elements = [], root) => {
    elements.forEach(element => {
        if (isDisplayed(element, root)) {
            root.querySelector(element).classList.add('d-none');
        }
    });
};

export const showElement = (elements, root) => {
    elements.forEach(element => {
        if (isHidden(element, root)) {
            root.querySelector(element).classList.remove('d-none');
        }
    });
};

export const isDisplayed = (element, root) => {
    const el = root.querySelector(element);
    if (el) {
        return !el.classList.contains('d-none');
    }
    return false;
};

export const isHidden = (element, root) => {
    // if (Array.isArray(elements)) {
    //     const all = elements.length;
    //     let count = 0;
    //     elements.forEach(element => {
    //         const el = root.querySelector(element);
    //         if (el) {
    //             if (el.classList.contains('d-none')) {
    //                 count++;
    //             }
    //         }
    //     });

    //     if (all === count) {
    //         return true;
    //     }
    //     return false;
    // } else {
        const el = root.querySelector(element);
        if (el) {
            return el.classList.contains('d-none');
        }
        return false;
    // }
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
    return [].concat(
        Array.prototype.slice.call(inputs),
        Array.prototype.slice.call(textAreas),
        Array.prototype.slice.call(selects),
    );
};

export const resetBibliographyFormFields = async(bibliography) => {
    const root = bibliography.root;
    getBibliographyFormFields().forEach(field => {
        const name = field.dataset.name;
        const nodeName = field.nodeName;
        if (name && bibliography.allData[`pure${ucFirst(name)}`]) {
            bibliography.allData[`pure${ucFirst(name)}`] = '';
        } else {
            if (nodeName !== 'SELECT') {
                bibliography.allData[name] = '';
            }
        }

        if (nodeName === 'SELECT') {
            const styleSource = (name === 'style') ?
                                bibliography.DEFAULT.STYLE :
                                bibliography.DEFAULT.SOURCE[bibliography.DEFAULT.STYLE];

            field.value = styleSource;
            bibliography.allData[name] = styleSource;
        } else {
            if (nodeName !== 'SELECT') {
                field.value = '';
            }
        }
    });

    if (bibliography.allData.showOtherFields) {
        bibliography.allData.showOtherFields = false;
        bibliography.root.querySelector(Selectors.actions.showOtherFields).checked = false;
    }

    root.querySelector(Selectors.actions.updateBibliography).remove();
    showElement([Selectors.actions.generateBibliography], bibliography.root);
    (new Setter(bibliography)).setSource();
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
 * <p class="bibliography-item-1">
 *    <span class="d-flex mb-0">
 *       <span class="citation-index-1">[1]</span>
 *    </span>
 * </p>
 *
 * @param {element} element Bibliography element from tiny editor
 * @returns {string}
 */
export const extractRefNumber = (element) => {
    return parseInt(element // <p class="bibliography-item-1">.
           .childNodes[1] // <span class="d-flex mb-0">.
           .childNodes[1] // <span class="citation-index-1">[1]</span>.
           .textContent // [1].
           .replace('[', '').replace(']', '')); // 1.
};

export const clearInputField = (fieldElements = [], root) => {
    fieldElements.forEach(field => {
        const el = root.querySelector(field);
        if (el) {
            el.value = '';
        }
    });
};
