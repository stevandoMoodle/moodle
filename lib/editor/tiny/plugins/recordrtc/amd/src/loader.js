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

/**
 * Tiny Record RTC plugin class for Moodle.
 *
 * @module      tiny_recordrtc/loader
 * @copyright   2022, Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import * as Modal from 'core/modal_factory';
import * as ModalEvents from 'core/modal_events';
import {getData} from './options';
import Templates from 'core/templates';
import {component} from './common';
import * as AudioModule from './recording/audiomodule';
import * as VideoModule from './recording/videomodule';
import * as CommonModule from './recording/commonmodule';

export const Loader = class {

    editor = null;
    contextid = null;
    sesskey = null;
    allowedtypes = null;
    audiobitrate = null;
    videobitrate = null;
    audiotimelimit = null;
    videotimelimit = null;
    defaulttimelimit = null;
    maxrecsize = null;
    filepickeroptions = null;
    currentModal = null;

    constructor(editor) {
        const data = getData(editor);
        this.editor = editor;
        this.contextid = data.params.contextid;
        this.sesskey = data.params.sesskey;
        this.allowedtypes = data.params.allowedtypes;
        this.audiobitrate = data.params.audiobitrate;
        this.videobitrate = data.params.videobitrate;
        this.audiotimelimit = data.params.audiotimelimit;
        this.videotimelimit = data.params.videotimelimit;
        this.defaulttimelimit = data.params.defaulttimelimit;
        this.maxrecsize = data.params.maxrecsize;
        this.filepickeroptions = data.fpoptions;
    }

    displayAudioDialogue() {
        Modal.create({
            type: Modal.types.DEFAULT,
            large: true,
            title: getString('audiotitle', component),
            body: this.createContent('audio')
        }).then(modal => {
            this.currentModal = modal;
            modal.getRoot().on(ModalEvents.hidden, () => {
                modal.destroy();
                this.killRecording();
            });
            modal.getRoot().on(ModalEvents.bodyRendered, () => {
                AudioModule.init(this);
            });
            modal.show();
            return modal;
        }).catch();
    }

    displayVideoDialogue() {
        Modal.create({
            type: Modal.types.DEFAULT,
            large: true,
            title: getString('videotitle', component),
            body: this.createContent('video')
        }).then(modal => {
            this.currentModal = modal;
            modal.getRoot().on(ModalEvents.hidden, () => {
                modal.destroy();
                this.killRecording();
            });
            modal.getRoot().on(ModalEvents.bodyRendered, () => {
                VideoModule.init(this);
            });
            modal.show();
            return modal;
        }).catch();
    }

    createContent(rtctype) {
        return Templates.render('tiny_recordrtc/insert_recording', {
            PLUGINNAME: component,
            isaudio: (rtctype === 'audio'),
            bsrow: 'row',
            bscol: 'col-',
            bsaldang: 'alert-danger',
            bsssbtn: 'btn btn-lg btn-outline-danger btn-block'
        });
    }

    killRecording() {
        window.clearInterval(CommonModule.data.countdownTicker);

        if (CommonModule.data.mediaRecorder && CommonModule.data.mediaRecorder.state !== 'inactive') {
            CommonModule.data.mediaRecorder.stop();
        }

        if (CommonModule.data.stream) {
            CommonModule.data.stream.getTracks().forEach(function(track) {
                if (track.readyState !== 'ended') {
                    track.stop();
                }
            });
        }
    }
};
