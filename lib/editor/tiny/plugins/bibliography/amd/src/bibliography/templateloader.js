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

export const bookSource = async() => {
    return Templates.render('tiny_bibliography/book');
};

export const articleInJournalSource = async() => {
    return Templates.render('tiny_bibliography/article_in_journal');
};

export const fieldTemplate = async(allData) => {
    return Templates.render(`tiny_bibliography/forms/field`, {...allData});
};

/**
 * Return the dialogue content.
 *
 * @param {Object} sources
 * @return {Promise<Array>} A template promise containing the rendered dialogue content.
 */
export const getDialogueContent = async(sources) => {
    return Templates.render('tiny_bibliography/bibliography_form', {
        sources: sources
    });
};

/**
 * Return the bio content.
 *
 * @param {object} data
 * @return {Promise<Array>} A template promise containing the rendered content.
 */
export const getBioContent = async(data) => {
    return Templates.render(`tiny_bibliography/reference/${data.allData.source}`, {
        ...data
    });
};

/**
 * Return the bio content with buttons.
 *
 * @param {object} data
 * @return {Promise<Array>} A template promise containing the rendered content.
 */
export const getBioListWithButtons = async(data) => {
    return Templates.render('tiny_bibliography/bibliography_list_with_buttons', {
        ...data
    });
};

export const firstItem = async(data) => {
    return Templates.render('tiny_bibliography/first_item', {...data});
};