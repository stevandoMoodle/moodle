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

import {alert} from 'core/notification';
import {get_string as getString} from 'core/str';
import {component} from '../common';
import {
    byId,
    toWords,
    setPropertiesFromData,
} from './helper';
import Selectors from "./selectors";

// All styles.
import Ieee from './styles/ieee/style';
import Harvard from './styles/harvard/style';

export class StyleSourceSelector {

    constructor(data) {
        // Creates dynamic properties based on "data" param.
        setPropertiesFromData(this, data);
    }

    /**
     * Set selected style.
     *
     * @param {String} selectedStyle Selected style name
     */
    setSelectedStyle = async(selectedStyle = null) => {
        switch (selectedStyle) {
            case 'ieee':
                this.selectedStyle = new Ieee();
                break;
            case 'harvard':
                this.selectedStyle = new Harvard();
                break;
            default:
                // Set to default style.
                this.selectedStyle = new Ieee();

                // Set the selected option to default style.
                byId('id_bibliography_style').value = this.DEFAULT.STYLE;

                // Alert the user.
                alert(
                    await getString('alert:oops', component),
                    await getString('alert:style_not_available', component, toWords('_', selectedStyle, true))
                );
        }
    };

    /**
     * Sets selected source.
     *
     * @param {String} selectedSource
     */
    setSelectedSource = async(selectedSource = null) => {
        const defaultSource = this.DEFAULT.SOURCE[this.allData.style ?? this.DEFAULT.STYLE];
        selectedSource = selectedSource ?? defaultSource;
        const availableSources = this.selectedStyle.getAvailableSources();
        if (availableSources[selectedSource] !== undefined) {
            this.allData.source = selectedSource;
            this.selectedSource = availableSources[selectedSource];
            this.fields = this.selectedSource.fields;

            if (this.root) {
                const bibliographySource = this.root.querySelector(Selectors.elements.bibliographySource);
                bibliographySource.value = selectedSource;
            }
        } else {
            this.setSelectedSource(defaultSource);
        }
    };
}
