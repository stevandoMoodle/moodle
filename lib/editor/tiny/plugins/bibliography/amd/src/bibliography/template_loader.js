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

import Templates from 'core/templates';

/**
 * Return the dialogue content.
 *
 * @param {Object} styles Selected style
 * @param {Object} sources Object of sources based on the selected style
 * @return {Promise<Array>} A template promise containing the rendered dialogue content.
 */
export const getDialogueContent = async(styles, sources) => {
    return Templates.render('tiny_bibliography/bibliography_form', {
        styles: styles,
        sources: sources,
    });
};

/**
 * Return the bibliography content with buttons.
 *
 * @param {object} data
 * @return {Promise<Array>} A template promise containing the rendered content.
 */
export const getBibliographyButtons = async(data) => {
    return Templates.render('tiny_bibliography/view_in_modal', {
        ...data
    });
};

export const firstItem = async(data) => {
    return Templates.render('tiny_bibliography/first_item', {...data});
};

export const viewItemButtons = async(data) => {
    return Templates.render('tiny_bibliography/view_item_buttons', {...data});
};

export const bibliographyHeader = async(data) => {
    return Templates.render('tiny_bibliography/bibliography_header', {...data});
};

/**
 * Return the bibliography content.
 *
 * @param {string} directory
 * @param {object} data
 * @return {Promise<Array>} A template promise containing the rendered content.
 */
export const getBibliographyContent = async(directory, data = null) => {
    return Templates.render(`tiny_bibliography/${directory}/${data.allData.source}`, {
        ...data
    });
};

export const editIcon = async() => {
    return Templates.render(`tiny_bibliography/edit_icon`);
};

export const noBibliography = async() => {
    return Templates.render(`tiny_bibliography/no_bibliography`);
};

export const citation = async(index) => {
    return Templates.render(`tiny_bibliography/citation`, {
        index: index
    });
};

export const sourceOptions = async(sources) => {
    return Templates.render(`tiny_bibliography/source_options`, {
        sources: sources
    });
};