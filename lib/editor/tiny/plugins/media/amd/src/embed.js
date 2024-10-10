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
 * Tiny Media plugin Embed class for Moodle.
 *
 * @module      tiny_media/embed
 * @copyright   2022 Huong Nguyen <huongnv13@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import EmbedModal from './embedmodal';
import {getEmbedPermissions} from './options';
import {getFilePicker} from 'editor_tiny/options';
import {EmbedHandler} from './embed/embedhandler';
import {
    insertMediaTemplateContext,
    getSelectedMediaElement,
} from './embed/embedhelpers';
import {EmbedInsert} from './embed/embedinsert';
import {startMediaLoading} from './helpers';
import Selectors from "./selectors";

export default class MediaEmbed {
    editor = null;
    canShowFilePicker = false;
    canShowFilePickerTrack = false;
    canShowDropZone = false;

    constructor(editor) {
        const permissions = getEmbedPermissions(editor);
        const options = getFilePicker(editor, 'media');

        // Indicates whether the file picker can be shown.
        this.canShowFilePicker = permissions.filepicker
            && (typeof options !== 'undefined')
            && Object.keys(options.repositories).length > 0;
        this.canShowFilePickerTrack = permissions.filepicker && (typeof getFilePicker(editor, 'subtitle') !== 'undefined');
        this.canShowDropZone = Object.values(options.repositories).some(repository => repository.type === 'upload');
        this.editor = editor;
    }

    async displayDialogue() {
        const [mediaType, selectedMedia] = getSelectedMediaElement(this.editor);
        this.mediaType = mediaType;
        this.selectedMedia = selectedMedia;
        this.currentModal = await EmbedModal.create({
            large: true,
            templateContext: {elementid: this.editor.getElement().id},
        });
        this.root = this.currentModal.getRoot()[0];

        if (this.selectedMedia) {
            // Preview the selected media.
            this.isUpdating = true;
            this.loadSelectedMedia();
        } else {
            const embedHandler = new EmbedHandler(this);
            embedHandler.loadTemplatePromise(insertMediaTemplateContext(this));
            embedHandler.registerEventListeners(this.currentModal);
        }
    }

    loadSelectedMedia = () => {
        // Start the spinner.
        startMediaLoading(this.root, Selectors.EMBED.type);

        let mediaSource = null;
        if (this.mediaType === 'link') {
            // Main source used for the preview.
            mediaSource = this.selectedMedia.href;
        } else {
            // Main source used for the preview.
            mediaSource = this.selectedMedia.querySelector('source').src;

            // If the selected media has more than one sources, it has main source and alternative sources.
            const sources = this.selectedMedia.querySelectorAll('source');
            if (sources.length > 1) {
                let allSources = [];
                Object.keys(sources).forEach(function(source) {
                    allSources.push(sources[source].src);
                });
                this.allSources = allSources; // Used to later check if the embedded media has alternative sources.
            }
        }

        if (this.selectedMedia.classList.contains('media-link')) { // This means a link was embedded as audio/video.
            // Let's record the media tag type for later usage.
            this.mediaTagType = this.mediaType;

            // Let's override the mediaType prop to "link", so it can later be previewed.
            this.mediaType = 'link';
        }

        // Load media preview.
        const embedInsert = new EmbedInsert(this);
        embedInsert.init();
        embedInsert.loadMediaPreview(mediaSource);
        (new EmbedHandler(this)).registerEventListeners(this.currentModal);
    };
}
