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
 * Tiny Record RTC abstractmodule.
 *
 * @module      tiny_recordrtc/abstractmodule
 * @copyright   2022 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import * as Modal from 'core/modal_factory';
import * as ModalEvents from 'core/modal_events';
import {component} from '../common';
import * as CommonModule from './commonmodule';

// A helper for making a Moodle alert appear.
// Subject is the content of the alert (which error ther alert is for).
// Possibility to add on-alert-close event.
export const showAlert = (subject, commonConfig) => {
    window.console.log(commonConfig);
    Modal.create({
        type: Modal.types.DEFAULT,
        title: getString(subject + '_title', component),
        body: getString(subject, component)
    }).then(modal => {
        modal.getRoot().on(ModalEvents.hidden, () => {
            modal.destroy();
        });
        modal.show();
        return modal;
    }).catch();
};

// Handle getUserMedia errors.
export const handleGumErrors = (error, commonConfig) => {
    // Changes 'CertainError' -> 'gumcertain' to match language string names.
    var stringName = 'gum' + error.name.replace('Error', '').toLowerCase();

    // After alert, proceed to treat as stopped recording, or close dialogue.
    if (stringName !== 'gumsecurity') {
        showAlert(stringName, commonConfig);
    } else {
        showAlert(stringName, commonConfig);
    }
};

// Select best options for the recording codec.
export let selectRecOptions = (recType) => {
    var types, options;

    if (recType === 'audio') {
        types = [
            'audio/webm;codecs=opus',
            'audio/ogg;codecs=opus'
        ];
        options = {
            audioBitsPerSecond: window.parseInt(CommonModule.data.editorScope.audiobitrate)
        };
    } else {
        types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=h264,opus',
            'video/webm;codecs=vp8,opus'
        ];
        options = {
            audioBitsPerSecond: window.parseInt(CommonModule.data.editorScope.audiobitrate),
            videoBitsPerSecond: window.parseInt(CommonModule.data.editorScope.videobitrate)
        };
    }

    var compatTypes = types.filter(function(type) {
        return window.MediaRecorder.isTypeSupported(type);
    });

    if (compatTypes.length !== 0) {
        options.mimeType = compatTypes[0];
    }

    return options;
};
