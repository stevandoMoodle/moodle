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

import BaseField from "./base_field";

/*
 * @package    tiny_bibliography
 * @copyright  2023 Stevani Andolo <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

export default class Website extends BaseField {
    constructor() {
        super();
        this.fields = [
            this.author({field: 'author'}),
            this.input({field: 'pageTitle'}),
            this.input({field: 'websiteTitle'}),
            this.input({field: 'webAddress'}),
            this.input({field: 'monthAccessed', example: 'month'}),
            this.input({field: 'dateAccessed', example: 'date', type: 'number'}),
            this.input({field: 'yearAccessed', example: 'year', type: 'number'}),
        ];
    }
}
