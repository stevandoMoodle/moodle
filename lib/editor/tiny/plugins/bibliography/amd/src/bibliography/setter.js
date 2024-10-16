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

import {StyleSourceSelector} from './style_source_selector';
import {setPropertiesFromData} from './helper';
import {Handler} from './handler';

export class Setter extends StyleSourceSelector {

    constructor(data) {
        super(data);
        // Creates dynamic properties based on "data" param.
        setPropertiesFromData(this, data);
    }

    /**
     * Initiates the style and source.
     */
    initSetter = async() => {
        this.allData.style = this.DEFAULT.STYLE;
        this.setSelectedStyle(this.DEFAULT.STYLE);
        await this.setSelectedSource();
    };

    /**
     * Sets bio's style.
     *
     * @param {string} selectedStyle Selected style name
     */
    setStyle = (selectedStyle = null) => {
        this.allData.style = selectedStyle;
        this.setSelectedStyle(selectedStyle);
    };

    /**
     * Sets source of bibliography.
     *
     * @param {string} selectedSource Selected source name
     */
    setSource = async(selectedSource = null) => {
        window.console.log('set source');
        if (!selectedSource) {
            selectedSource = this.DEFAULT.SOURCE[this.DEFAULT.STYLE];
        }

        // Clear the previous source's fields.
        this.fields = [];

        // Set selected source.
        this.setSelectedSource(selectedSource);

        // Remove current created events if exist and get fields and insert the dom.
        const handler = new Handler(this);
        await handler.removeListeners();
        await handler.loadFieldTemplate();

        // Set bibliography container height to form container's height accordingly.
        // this.resetBibliographyContainerHeight();
    };
}
