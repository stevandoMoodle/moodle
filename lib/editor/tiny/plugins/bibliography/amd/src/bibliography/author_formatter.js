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
    setPropertiesFromData,
    ucFirst,
} from './helper';

export class AuthorFormatter {

    constructor(data) {
        // Creates dynamic properties based on "data" param.
        setPropertiesFromData(this, data);
    }

    /**
     * Splits author's name.
     *
     * @param {string} field
     */
    splitAuthorName(field = null) {
        const data = this.allData[field];
        this.allData[`pure${ucFirst(field)}`] = data;
        this.allData[field] = '';
        if (!data) {
            return;
        }

        if (data.includes(';') === true) {
            const authors = data.split(';');
            authors.forEach(author => {
                author = author.trim();
                if (author !== '') {
                    this.setGeneratedAuthorNames(this.generateDetailedAuthorName(author), field);
                }
            });
        } else {
            this.setGeneratedAuthorNames(this.generateDetailedAuthorName(data), field);
        }
    }

    /**
     * Sets generated author's name.
     *
     * @param {string} names
     * @param {string} field
     */
    setGeneratedAuthorNames(names = null, field = null) {
        if (this.allData[field] !== '') {
            this.allData[field] += ', ' + names;
        } else {
            this.allData[field] = names;
        }
    }

    /**
     * Returns generated author's name.
     *
     * @param {string} author
     * @returns {string}
     */
    generateDetailedAuthorName(author = null) {
        let sureName = '';
        let firstName = '';
        let middleName = '';

        if (author.includes(',')) {
            const names = author.split(',');
            sureName = names[0];
            let fmName = names[1];

            if (fmName.includes(' ')) {
                fmName = fmName.split(' ');
                let i = 0;
                fmName.forEach(fm => {
                    if (fm !== '') {
                        if (i === 0) {
                            firstName = fm;
                        } else {
                            middleName += fm + ' ';
                        }
                        i++;
                    }
                });
            } else {
                firstName = fmName;
            }
        } else {
            firstName = author;
        }

        return this.selectedStyle.generateAuthorName(firstName.trim(), middleName.trim(), sureName.trim()).generated;
    }
}
