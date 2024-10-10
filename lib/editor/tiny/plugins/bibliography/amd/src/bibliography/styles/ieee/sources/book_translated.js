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

import BaseField from "../../../base_field";

/*
 * @package    tiny_bibliography
 * @copyright  2023 Stevani Andolo <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

export default class BookTranslated extends BaseField {
    constructor() {
        super();
        this.fields = [
            // Generates a required author textarea.
            this.author({field: 'author'}),

            // Generates a not required chapter title input field.
            this.input({field: 'chapterTitle', required: false}),

            // Generates a required published title input field.
            this.input({field: 'publishedTitle'}),

            // Generates a not required volume input field.
            this.input({field: 'volume', required: false}),

            // Generates a not required edition input field.
            this.input({field: 'edition', required: false}),

            // Generates a required city input field.
            this.input({field: 'city'}),

            // Generates a not required state input field.
            this.input({field: 'state', required: false}),

            // Generates a required country input field.
            this.input({field: 'country'}),

            // Generates a required publisher input field.
            this.input({field: 'publisher'}),

            // Generates a required language input field.
            this.input({field: 'translatedTo', example: 'language'}),

            // Generates a required year input field.
            this.input({field: 'year', type: 'number'}),

            // Generates a not required chapter input field.
            this.input({field: 'chapter', type: 'number', required: false}),

            // Generates a not required section input field.
            this.input({field: 'section', type: 'number', required: false}),

            // Generates a required pages input field.
            this.input({field: 'pages', required: false})
        ];
    }
}
