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
 * Tiny media plugin embed upload class.
 *
 * This handles the embed upload using url, drag-drop and repositories.
 *
 * @module      tiny_media/embed/embedinsert
 * @copyright   2024 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {prefetchStrings} from 'core/prefetch';
import {getStrings, getString} from 'core/str';
import {component} from "../common";
import {
    setPropertiesFromData,
    startMediaLoading,
    stopMediaLoading,
    showElements,
} from '../helpers';
import Selectors from "../selectors";
import Dropzone from 'core/dropzone';
import uploadFile from 'editor_tiny/uploader';
import {EmbedHandler} from './embedhandler';
import {
    formatMediaUrl,
    mediaDetailsTemplateContext,
    getFileMimeTypeFromUrl,
} from './embedhelpers';
import {EmbedPreview} from './embedpreview';
import EmbedModal from '../embedmodal';
import Templates from 'core/templates';

prefetchStrings(component, [
    'insertmedia',
    'addmediafilesdrop',
    'uploading',
    'loadingmedia',
]);

export class EmbedInsert {

    constructor(data) {
        setPropertiesFromData(this, data); // Creates dynamic properties based on "data" param.
    }

    /**
     * Init the dropzone and lang strings.
     */
    init = async() => {
        const langStringKeys = [
            'insertmedia',
            'addmediafilesdrop',
            'uploading',
            'loadingmedia',
        ];
        const langStringValues = await getStrings([...langStringKeys].map((key) => ({key, component})));
        this.langStrings = Object.fromEntries(langStringKeys.map((key, index) => [key, langStringValues[index]]));
        this.currentModal.setTitle(this.langStrings.insertmedia);

        // Let's init the dropzone if canShowDropZone is true and mediaType is null.
        if (this.canShowDropZone && !this.mediaType) {
            const dropZoneEle = document.querySelector(Selectors.EMBED.elements.dropzoneContainer);
            const dropZone = new Dropzone(
                dropZoneEle,
                'audio/*,video/*',
                files => {
                    this.handleUploadedFile(files);
                }
            );

            dropZone.setLabel(this.langStrings.addmediafilesdrop);
            dropZone.init();
        }
    };

    /**
     * Loads and displays a preview media based on the provided URL, and handles media loading events.
     *
     * @param {string} url - The URL of the media to load and display.
     */
    loadMediaPreview = async(url) => {
        this.originalUrl = url;
        const [formattedUrl, type, title] = await formatMediaUrl(url, this);

        this.mediaSource = formattedUrl;
        if (title) {
            this.fetchedMediaLinkTitle = title;
        }

        // Get media mime type.
        const mediaType = type ?? await getFileMimeTypeFromUrl(this.mediaSource);

        // Check if mediaType is not "link" and is acceptable.
        if (!Selectors.EMBED.mediaTypes.includes(mediaType)) {
            // Display warning message if the mediaType is not acceptable.
            const urlWarningLabelEle = this.root.querySelector(Selectors.EMBED.elements.urlWarning);
            urlWarningLabelEle.innerHTML = await getString('onlymediafilesdesc', component);
            showElements(Selectors.EMBED.elements.urlWarning, this.root);

            // Stop the spinner.
            stopMediaLoading(this.root, Selectors.EMBED.type);
            return; // End it here if the mimetype is not acceptable.
        }

        // Else, continue checking if new upload and mediaType is "link" or
        // a new inserted link and the new mediaType is "link".
        if ((!this.isUpdating || this.newMediaLink) && mediaType === 'link') {
            // Create media type selector modal prop.
            this.mediaTypeSelectorModal = await EmbedModal.create({
                large: false,
                title: getString('medialinktypeselector', component),
                templateContext: {elementid: this.editor.getElement().id},
                body: await Templates.render(`${component}/embed/link_media_type_selector`),
            });

            // Create media type selector root prop.
            this.mediaTypeSelectorRoot = this.mediaTypeSelectorModal.getRoot()[0];

            // Register the media type selector root events.
            this.registerMediaTypeSelectorEvents(this.mediaTypeSelectorRoot);

            // Stop the spinner.
            stopMediaLoading(this.root, Selectors.EMBED.type);
        } else {
            // Process the media preview.
            this.processMediaPreview(mediaType);
        }
    };

    /**
     * Process the media preview.
     * @param {string} mediaType
     */
    processMediaPreview = async(mediaType) => {
        // Set mediaType to newly fetched mime type.
        this.mediaType = (this.mediaType && mediaType !== 'link') ? this.mediaType : mediaType;

        // Let's combine the props.
        setPropertiesFromData(
            this,
            await (new EmbedHandler(this)).getMediaTemplateContext()
        );

        // Construct templateContext for embed preview.
        const templateContext = await mediaDetailsTemplateContext(this);

        if (this.mediaType === 'video' && this.isUpdating) {
            // Let's get selected video height & width and create props for them to be used in embedPreview.
            const media = templateContext.media;
            if (media.height !== '' && media.width !== '') {
                this.mediaHeight = media.height;
                this.mediaWidth = media.width;
            }
        }

        if (this.isUpdating && !this.newMediaLink) {
            // Will be used to set the media title if it's in update state.
            this.mediaTitle = templateContext.media.title;
        }

        // Load the media details and preview of the selected media.
        (new EmbedHandler(this)).loadMediaDetails(new EmbedPreview(this), templateContext);
    };

    /**
     * Updates the content of the loader icon.
     *
     * @param {HTMLElement} root - The root element containing the loader icon.
     * @param {object} langStrings - An object containing language strings.
     * @param {number|null} progress - The progress percentage (optional).
     * @returns {void}
     */
    updateLoaderIcon = (root, langStrings, progress = null) => {
        const loaderIconState = root.querySelector(Selectors.EMBED.elements.loaderIconContainer + ' div');
        loaderIconState.innerHTML = (progress !== null) ?
                               `${langStrings.uploading} ${Math.round(progress)}%` :
                               langStrings.loadingmedia;
    };

    /**
     * Handles media preview on file picker callback.
     *
     * @param {object} params Object of uploaded file
     */
    filePickerCallback = (params) => {
        if (params.url) {
            if (this.mediaTagType) {
                // Delete mediaTagType if it started with viewing embedded link,
                // otherwise it will break the media preview check.
                delete this.mediaTagType;

                // Set mediaType to "null" if it started with viewing embedded link,
                // otherwise it will not be consistent when checking in ::processMediaPreview().
                this.mediaType = null;
            }

            // Flag as new file upload.
            this.newFileUpload = true;

            // Load the media preview.
            this.loadMediaPreview(params.url);
        }
    };

    /**
     * Handles the uploaded file, initiates the upload process, and updates the UI during the upload.
     *
     * @param {FileList} files - The list of files to upload (usually from a file input field).
     * @returns {Promise<void>} A promise that resolves when the file is uploaded and processed.
     */
    handleUploadedFile = async(files) => {
        try {
            startMediaLoading(this.root, Selectors.EMBED.type);
            const fileURL = await uploadFile(this.editor, 'media', files[0], files[0].name, (progress) => {
                this.updateLoaderIcon(this.root, this.langStrings, progress);
            });

            // Set the loader icon content to "loading" after the file upload completes.
            this.updateLoaderIcon(this.root, this.langStrings);
            this.filePickerCallback({url: fileURL});
        } catch (error) {
            // Handle the error.
            const urlWarningLabelEle = this.root.querySelector(Selectors.EMBED.elements.urlWarning);
            urlWarningLabelEle.innerHTML = error.error !== undefined ? error.error : error;
            showElements(Selectors.EMBED.elements.urlWarning, this.root);
            stopMediaLoading(this.root, Selectors.EMBED.type);
        }
    };

    registerMediaTypeSelectorEvents = (root) => {
        const mediaLinkAsAudio = root.querySelector(Selectors.EMBED.actions.mediaLinkAsAudio);
        if (mediaLinkAsAudio) {
            mediaLinkAsAudio.addEventListener('click', () => {
                this.mediaTagType = 'audio';
                this.mediaTypeSelectorModal.destroy();
                startMediaLoading(this.root, Selectors.EMBED.type);
                this.processMediaPreview('link'); // Let's preview as "link".
            });
        }

        const mediaLinkAsVideo = root.querySelector(Selectors.EMBED.actions.mediaLinkAsVideo);
        if (mediaLinkAsVideo) {
            mediaLinkAsVideo.addEventListener('click', () => {
                this.mediaTagType = 'video';
                this.mediaTypeSelectorModal.destroy();
                startMediaLoading(this.root, Selectors.EMBED.type);
                this.processMediaPreview('link'); // Let's preview as "link".
            });
        }
    };
}
