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
 * Tiny Record RTC Commonmodule values.
 *
 * @module      tiny_recordrtc/commonmodule
 * @copyright   2022 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import {component} from '../common';
import * as AbstractModule from './abstractmodule';

export const data = {
    // Unitialized variables to be used by the other modules.
    editorScope: null,
    alertWarning: null,
    alertDanger: null,
    player: null,
    playerDOM: null, // Used to manipulate DOM directly.
    startStopBtn: null,
    uploadBtn: null,
    countdownSeconds: null,
    countdownTicker: null,
    recType: null,
    stream: null,
    mediaRecorder: null,
    chunks: null,
    blobSize: null,
    maxUploadSize: null,
    audioData: null,
    modal: null
};

// Capture webcam/microphone stream.
export const captureUserMedia = (mediaConstraints, successCallback, errorCallback) => {
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
};

// Add chunks of audio/video to array when made available.
export const handleDataAvailable = (event) => {
    // Push recording slice to array.
    data.chunks.push(event.data);
    // Size of all recorded data so far.
    data.blobSize += event.data.size;

    // If total size of recording so far exceeds max upload limit, stop recording.
    // An extra condition exists to avoid displaying alert twice.
    if (data.blobSize >= data.maxUploadSize) {
        if (!localStorage.getItem('alerted')) {
            localStorage.setItem('alerted', 'true');

            data.startStopBtn.click();
            AbstractModule.showAlert('nearingmaxsize');
        } else {
            localStorage.removeItem('alerted');
        }

        data.chunks.pop();
    }
};

// Handle recording end.
export const handleStop = async() => {
    const [
        attachrecording
    ] = await Promise.all([
        getString('attachrecording', component)
    ]);

    // Set source of audio player.
    var blob = new Blob(data.chunks, {type: data.mediaRecorder.mimeType});
    data.player.srcObject = null;
    data.player.src = URL.createObjectURL(blob);

    // Show audio player with controls enabled, and unmute.
    data.player.muted = false;
    data.player.controls = true;
    data.player.parentElement.parentElement.classList.remove('hide');

    // Show upload button.
    data.uploadBtn.parentElement.parentElement.classList.remove('hide');
    data.uploadBtn.textContent = attachrecording;
    data.uploadBtn.disabled = false;

    // Handle when upload button is clicked.
    data.uploadBtn.addEventListener('click', uploadHandler);
};

// Handle when upload button is clicked.
export const uploadHandler = async() => {
    const [
        uploadfailed,
        uploadfailed404,
        uploadaborted
    ] = await Promise.all([
        getString('uploadfailed', component),
        getString('uploadfailed404', component),
        getString('uploadaborted', component)
    ]);

    // Trigger error if no recording has been made.
    if (data.chunks.length === 0) {
        AbstractModule.showAlert('norecordingfound');
    } else {
        data.uploadBtn.disabled = true;

        // Upload recording to server.
        uploadToServer(data.recType, function(progress, fileURLOrError) {
            if (progress === 'ended') { // Insert annotation in text.
                data.uploadBtn.disabled = false;
                insertAnnotation(data.recType, fileURLOrError);
            } else if (progress === 'upload-failed') { // Show error message in upload button.
                data.uploadBtn.disabled = false;
                data.uploadBtn.textContent = `${uploadfailed} ${fileURLOrError}`;
            } else if (progress === 'upload-failed-404') { // 404 error = File too large in Moodle.
                data.uploadBtn.disabled = false;
                data.uploadBtn.textContent = uploadfailed404;
            } else if (progress === 'upload-aborted') {
                data.uploadBtn.disabled = false;
                data.uploadBtn.textContent = `${uploadaborted} ${fileURLOrError}`;
            } else {
                data.uploadBtn.textContent = progress;
            }
        });
    }
};

// Get everything set up to start recording.
export const startRecording = async(type, stream) => {
    const [
        stoprecording
    ] = await Promise.all([
        getString('stoprecording', component)
    ]);

    // The options for the recording codecs and bitrates.
    var options = selectRecOptions(type);
    data.mediaRecorder = new MediaRecorder(stream, options);

    // Initialize MediaRecorder events and start recording.
    data.mediaRecorder.ondataavailable = handleDataAvailable;
    data.mediaRecorder.onstop = handleStop;
    data.mediaRecorder.start(1000); // Capture in 1s chunks. Must be set to work with Firefox.

    // Mute audio, distracting while recording.
    data.player.muted = true;

    // Set recording timer to the time specified in the settings.
    if (type === 'audio') {
        data.countdownSeconds = data.editorScope.audiotimelimit;
    } else if (type === 'video') {
        data.countdownSeconds = data.editorScope.videotimelimit;
    } else {
        // Default timer.
        data.countdownSeconds = data.editorScope.defaulttimelimit;
    }
    data.countdownSeconds++;
    var timerText = stoprecording;
    timerText += ' (<span id="minutes"></span>:<span id="seconds"></span>)';
    data.startStopBtn.innerHTML = timerText;
    setTime();
    data.countdownTicker = setInterval(setTime, 1000);

    // Make button clickable again, to allow stopping recording.
    data.startStopBtn.disabled = false;
};

export let selectRecOptions = (recType) => {
    var types, options;

    if (recType === 'audio') {
        types = [
            'audio/webm;codecs=opus',
            'audio/ogg;codecs=opus'
        ];
        options = {
            audioBitsPerSecond: parseInt(data.editorScope.audiobitrate)
        };
    } else {
        types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=h264,opus',
            'video/webm;codecs=vp8,opus'
        ];
        options = {
            audioBitsPerSecond: parseInt(data.editorScope.audiobitrate),
            videoBitsPerSecond: parseInt(data.editorScope.videobitrate)
        };
    }

    var compatTypes = types.filter(function(type) {
        return MediaRecorder.isTypeSupported(type);
    });

    if (compatTypes.length !== 0) {
        options.mimeType = compatTypes[0];
    }

    return options;
};

// Upload recorded audio/video to server.
export const uploadToServer = (type, callback) => {
    const xhr = new XMLHttpRequest();

    // Get src media of audio/video tag.
    xhr.open('GET', data.player.src, true);
    xhr.responseType = 'blob';

    xhr.addEventListener('load', () => {
        if (xhr.status === 200) { // If src media was successfully retrieved.
            // blob is now the media that the audio/video tag's src pointed to.
            const blob = xhr.response;

            // Generate filename with random ID and file extension.
            let fileName = (Math.random() * 1000).toString().replace('.', '');
            fileName += (type === 'audio') ? '-audio.ogg'
                                           : '-video.webm';

            // Create FormData to send to PHP filepicker-upload script.
            let formData = new FormData(),
                filepickerOptions = data.editorScope.filepickeroptions.link,
                repositoryKeys = Object.keys(filepickerOptions.repositories);

            formData.append('repo_upload_file', blob, fileName);
            formData.append('itemid', filepickerOptions.itemid);

            for (let i = 0; i < repositoryKeys.length; i++) {
                if (filepickerOptions.repositories[repositoryKeys[i]].type === 'upload') {
                    formData.append('repo_id', filepickerOptions.repositories[repositoryKeys[i]].id);
                    break;
                }
            }

            formData.append('env', filepickerOptions.env);
            formData.append('sesskey', M.cfg.sesskey);
            formData.append('client_id', filepickerOptions.client_id);
            formData.append('savepath', '/');
            formData.append('ctx_id', filepickerOptions.context.id);

            // Pass FormData to PHP script using XHR.
            const uploadEndpoint = `${M.cfg.wwwroot}/repository/repository_ajax.php?action=upload`;
            makeXmlhttprequest(uploadEndpoint, formData,
                function(progress, responseText) {
                    if (progress === 'upload-ended') {
                        callback('ended', JSON.parse(responseText).url);
                    } else {
                        callback(progress);
                    }
                }
            );
        }
    });

    xhr.send();
};

// Handle XHR sending/receiving/status.
export const makeXmlhttprequest = async(url, data, callback) => {
    const [
        uploadprogress
    ] = await Promise.all([
        getString('uploadprogress', component)
    ]);

    var xhr = new window.XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if ((xhr.readyState === 4) && (xhr.status === 200)) { // When request is finished and successful.
            callback('upload-ended', xhr.responseText);
        } else if (xhr.status === 404) { // When request returns 404 Not Found.
            callback('upload-failed-404');
        }
    };

    xhr.upload.addEventListener('progress', (e) => {
        callback(`${Math.round(e.loaded / e.total * 100)}% ${uploadprogress}`);
    });

    xhr.upload.addEventListener('error', (error) => {
        callback('upload-failed', error);
    });

    xhr.upload.addEventListener('abort', (error) => {
        callback('upload-aborted', error);
    });

    // POST FormData to PHP script that handles uploading/saving.
    xhr.open('POST', url, true);
    xhr.send(data);
};

// Get everything set up to stop recording.
export const stopRecording = (stream) => {
    // Stop recording stream.
    data.mediaRecorder.stop();

    // Stop each individual MediaTrack.
    var tracks = stream.getTracks();
    for (var i = 0; i < tracks.length; i++) {
        tracks[i].stop();
    }
};

// Makes 1min and 2s display as 1:02 on timer instead of 1:2, for example.
export const pad = (val) => {
    var valString = val + "";

    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
};

// Functionality to make recording timer count down.
// Also makes recording stop when time limit is hit.
export const setTime = () => {
    data.countdownSeconds--;

    document.querySelector('span#seconds').textContent = pad(
        data.countdownSeconds % 60
    );
    document.querySelector('span#minutes').textContent = pad(
        parseInt(data.countdownSeconds / 60, 10)
    );

    if (data.countdownSeconds === 0) {
        data.startStopBtn.click();
    }
};

// Generates link to recorded annotation to be inserted.
export const createAnnotation = (type, recordingurl) => {
    var html = '';
    if (type == 'audio') {
        html = "<audio controls='true'>";
    } else { // Must be video.
        html = "<video controls='true'>";
    }

    html += `<source src='${recordingurl}'>${recordingurl}`;

    if (type == 'audio') {
        html += "</audio>";
    } else { // Must be video.
        html += "</video>";
    }

    return html;
};

// Inserts link to annotation in editor text area.
export const insertAnnotation = async(type, recordingurl) => {
    const [
        attachrecording
    ] = await Promise.all([
        getString('attachrecording', component)
    ]);

    var annotation = createAnnotation(type, recordingurl);

    // Insert annotation link.
    // If user pressed "Cancel", just go back to main recording screen.
    if (!annotation) {
        data.uploadBtn.textContent = attachrecording;
    } else {
        data.audioData = annotation;
        data.editorScope.editor.insertContent(annotation);
        data.editorScope.currentModal.destroy();
    }
};
