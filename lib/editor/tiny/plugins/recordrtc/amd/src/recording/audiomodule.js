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
 * Tiny Record RTC - audio module configuration.
 *
 * @module      tiny_recordrtc/audiomodule
 * @copyright   2022 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import * as CompatCheckModule from './compatcheckmodule';
import * as CommonModule from './commonmodule';
import * as AbstractModule from './abstractmodule';
import {component} from '../common';


// Setup to get audio stream from microphone.
const captureAudio = (config) => {
    CommonModule.captureUserMedia(
        // Media constraints.
        {
            audio: true
        },

        // Success callback.
        function(audioStream) {
            // Set audio player source to microphone stream.
            CommonModule.data.playerDOM.srcObject = audioStream;

            config.onMediaCaptured(audioStream);
        },

        // Error callback.
        function(error) {
            config.onMediaCapturingFailed(error);
        }
    );
};

export const init = async(scope) => {
    const [
        startrecording,
        recordagain,
        recordingfailed
    ] = await Promise.all([
        getString('startrecording', component),
        getString('recordagain', component),
        getString('recordingfailed', component)
    ]);

    // Assignment of global variables.
    CommonModule.data.editorScope = scope; // Allows access to the editor's "this" context.
    CommonModule.data.alertWarning = document.querySelector('div#alert-warning');
    CommonModule.data.alertDanger = document.querySelector('div#alert-danger');
    CommonModule.data.player = document.querySelector('audio#player');
    CommonModule.data.playerDOM = document.querySelector('audio#player');
    CommonModule.data.startStopBtn = document.querySelector('button#start-stop');
    CommonModule.data.uploadBtn = document.querySelector('button#upload');
    CommonModule.data.recType = 'audio';
    CommonModule.data.maxUploadSize = scope.maxrecsize;

    // Show alert and close plugin if WebRTC is not supported.
    CompatCheckModule.checkHasGum();
    // Show alert and redirect user if connection is not secure.
    CompatCheckModule.checkSecure();

    // Run when user clicks on "record" button.
    CommonModule.data.startStopBtn.addEventListener('click', function() {
        CommonModule.data.startStopBtn.disabled = true;

        // If button is displaying "Start Recording" or "Record Again".
        if ((CommonModule.data.startStopBtn.textContent.trim() === startrecording) ||
            (CommonModule.data.startStopBtn.textContent.trim() === recordagain) ||
            (CommonModule.data.startStopBtn.textContent.trim() === recordingfailed)) {
            // Make sure the audio player and upload button are not shown.
            CommonModule.data.player.parentElement.parentElement.classList.add('hide');
            CommonModule.data.uploadBtn.parentElement.parentElement.classList.add('hide');

            // Change look of recording button.
            CommonModule.data.startStopBtn.classList.replace('btn-outline-danger', 'btn-danger');

            // Empty the array containing the previously recorded chunks.
            CommonModule.data.chunks = [];
            CommonModule.data.blobSize = 0;
            CommonModule.data.uploadBtn.removeEventListener('click', CommonModule.uploadHandler);

            // Initialize common configurations.
            var commonConfig = {
                // When the stream is captured from the microphone/webcam.
                onMediaCaptured: function(stream) {
                    // Make audio stream available at a higher level by making it a property of the common module.
                    CommonModule.data.stream = stream;

                    CommonModule.startRecording(CommonModule.data.recType, CommonModule.data.stream);
                },

                // Revert button to "Record Again" when recording is stopped.
                onMediaStopped: function(btnLabel) {
                    CommonModule.data.startStopBtn.textContent = btnLabel;
                    CommonModule.data.startStopBtn.disabled = false;
                    CommonModule.data.startStopBtn.classList.replace('btn-danger', 'btn-outline-danger');
                },

                // Handle recording errors.
                onMediaCapturingFailed: function(error) {
                    AbstractModule.handleGumErrors(error, commonConfig);
                }
            };

            // Capture audio stream from microphone.
            captureAudio(commonConfig);
        } else { // If button is displaying "Stop Recording".
            // First of all clears the countdownTicker.
            window.clearInterval(CommonModule.data.countdownTicker);

            // Disable "Record Again" button for 1s to allow background processing (closing streams).
            window.setTimeout(function() {
                CommonModule.data.startStopBtn.disabled = false;
            }, 1000);

            // Stop recording.
            CommonModule.stopRecording(CommonModule.data.stream);

            // Change button to offer to record again.
            CommonModule.data.startStopBtn.textContent = recordagain;
            CommonModule.data.startStopBtn.classList.replace('btn-danger', 'btn-outline-danger');
        }
    });
};
