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
//

/**
 * TTiny Record RTC compatcheckmodule.
 *
 * @module      tiny_recordrtc/compatcheckmodule
 * @copyright   2022, Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {AbstractModule} from './abstractmodule';
import * as CommonModule from './commonmodule';

// Show alert and close plugin if browser does not support WebRTC at all.
export const checkHasGum = () => {
    if (!(navigator.mediaDevices && window.MediaRecorder)) {
        AbstractModule.showAlert('nowebrtc', function() {
            CommonModule.data.editorScope.closeDialogue(CommonModule.data.editorScope);
        });
    }
};

// Notify and redirect user if plugin is used from insecure location.
export const checkSecure = () => {
    var isSecureOrigin = (window.location.protocol === 'https:') ||
                            (window.location.host.indexOf('localhost') !== -1);

    if (!isSecureOrigin) {
        CommonModule.data.alertDanger.ancestor().ancestor().removeClass('hide');
    }
};
