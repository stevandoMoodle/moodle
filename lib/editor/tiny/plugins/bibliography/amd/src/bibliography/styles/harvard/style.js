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

import {
    ucFirst,
} from '../../helper';
import Base from '../../base';

// All sources.
import Book from './sources/book';

export default class extends Base {
    constructor() {
        super();
        this.styleDirectory = 'styles/apa';
    }

    /**
     * Overrides this function to show [1].
     *
     * @param {string|number} index Number of bibliography index
     *
     * @return {string}
     */
    extendInTextCitation = (index) => {
        return `[${index}]`;
    };

    /**
     * Returns object of available sources for IEEE style.
     *
     * @returns {object} Object of available sources
     */
    getAvailableSources = () => {
        return {
            book: new Book(),
        };
    };

    /**
     * Generates author's name based on the style.
     *
     * @param {string} firstName Author's first name
     * @param {string} middleName Author's middle name
     * @param {string} sureName Author's last name
     * @returns {object|null}
     */
    generateAuthorName(firstName = null, middleName = null, sureName = null) {
        if (firstName !== null) {
            const genSureName = sureName ? `${(ucFirst(sureName))}, ` : ''; // Generated sure name.
            sureName = sureName ? sureName + ', ' : null;

            let genMiddleName = ''; // Generated middle name.
            let genFirstName = ''; // Generated first name.

            // if (sureName) {
                genMiddleName = middleName ? ucFirst(middleName, false) + '. ' : '';
                middleName = middleName ? middleName + '' : null;
            // } else {
            //     genMiddleName = middleName ? ucFirst(middleName, false) : '';
            //     middleName = middleName ? middleName : null;
            // }

            if (sureName || middleName) {
                genFirstName = firstName ? ucFirst(firstName, false) + '. ' : '';
                firstName = firstName ? firstName + ' ' : '';
            } else {
                genFirstName = firstName ? ucFirst(firstName, false) : '';
                firstName = firstName ? firstName : '';
            }

            return {
                "generated": genSureName + genFirstName + genMiddleName, // Generated names.
                "originated": (sureName ?? ', ') + firstName + (middleName ?? '') // Pure names.
            };
        }
        return null;
    }
}
