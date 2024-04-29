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

import {alert} from 'core/notification';
import {get_string as getString} from 'core/str';
import {component} from '../common';
import {byId, toWords} from './helper';

// All styles.
import Ieee from './styles/ieee/style';

/*
 * @package    tiny_bibliography
 * @copyright  2023 Stevani Andolo <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

export default class StyleSourceSelector {
    constructor() {
        this.DEFAULT = {
            STYLE: 'ieee'
        };
    }

    /**
     * Set selected style.
     *
     * @param {String} data
     */
    setSelectedStyle = async(data = null) => {
        switch (data) {
            case 'ieee':
                this.selectedStyle = new Ieee();
                this.ieee = true;
                break;
            default:
                // Set to default style.
                this.selectedStyle = new Ieee();

                // Set the selected option to default style.
                byId('id_bibliography_style').value = this.DEFAULT.STYLE;

                // Alert the user.
                alert(
                    await getString('alert:warning', component),
                    await getString('stylenotavailable', component, toWords('_', data, true))
                );
        }
    };

    /**
     * Sets selected source.
     *
     * @param {String} data
     */
    setSelectedSource = async(data = null) => {
        this.allData.source = data ?? this.selectedStyle.DEFAULT.SOURCE;
        this.selectedSource = await this.selectedStyle.setSelectedSource(data);
        this.fields = this.selectedSource.fields;
    };
}
