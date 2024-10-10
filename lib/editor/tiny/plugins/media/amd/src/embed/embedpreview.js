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
 * Tiny media plugin embed preview and details class.
 *
 * This handles the embed file/url preview before embedding them into tiny editor.
 *
 * @module      tiny_media/embed/embedpreview
 * @copyright   2024 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Selectors from '../selectors';
import {component} from '../common';
import {getString} from 'core/str';
import {
    sourceTypeChecked,
    getFileName,
    setPropertiesFromData,
    showElements,
    stopMediaLoading,
    hideElements,
} from '../helpers';
import {EmbedHandler} from './embedhandler';
import {MediaBase} from '../mediabase';
import Notification from 'core/notification';
import EmbedModal from '../embedmodal';
import {
    getEmbeddedMediaDetails,
    insertMediaThumbnailTemplateContext,
} from './embedhelpers';

export class EmbedPreview extends MediaBase {

    selectorType = Selectors.EMBED.type;

    isEmbedPreviewDeleted = false;

    constructor(data) {
        super();
        setPropertiesFromData(this, data); // Creates dynamic properties based on "data" param.
    }

    /**
     * Init the media details preview.
     */
    init = async() => {
        this.currentModal.setTitle(getString('mediadetails', component));
        sourceTypeChecked({
            source: this.mediaSource,
            root: this.root,
            urlSelector: Selectors.EMBED.elements.fromUrl,
            fileNameSelector: Selectors.EMBED.elements.fileNameLabel,
        });
        this.setMediaSourceAndPoster();
        this.registerMediaDetailsEventListeners(this.currentModal);
    };

    /**
     * Sets media source and thumbnail for the video.
     */
    setMediaSourceAndPoster = () => {
        const box = this.root.querySelector(Selectors.EMBED.elements.previewBox);
        const preview = this.root.querySelector(Selectors.EMBED.elements.preview);
        preview.src = this.mediaSource;

        // Let's keep track of the original link.
        const mediaPreviewTag = this.root.querySelector(Selectors.EMBED.elements.mediaPreviewTag);
        mediaPreviewTag.setAttribute('data-original-url', this.originalUrl);

        // Getting and setting up media title/name.
        if (['video', 'audio'].includes(this.mediaType)) {
            let fileName = getFileName(this.root); // Get original filename.
            if (this.isUpdating) {
                if (!this.isEmbedPreviewDeleted) {
                    fileName = this.mediaTitle; // Title from the selected media.
                }
            }

            // Set the media name/title.
            this.root.querySelector(Selectors.EMBED.elements.title).value = fileName;
        }

        // Handle error when loading the media.
        preview.addEventListener('error', async() => {
            // Show warning notification.
            const urlWarningLabelEle = this.root.querySelector(Selectors.EMBED.elements.urlWarning);
            urlWarningLabelEle.innerHTML = await getString('medianotavailabledesc', component, this.mediaSource);
            showElements(Selectors.EMBED.elements.urlWarning, this.root);

            // Stop the spinner.
            stopMediaLoading(this.root, Selectors.EMBED.type);

            // Reset the upload form.
            (new EmbedHandler(this)).resetUploadForm();
            return;
        });

        if (this.mediaType === 'video') {
            if (mediaPreviewTag) { // Check if video html exists.
                if (this.media.poster) {
                    mediaPreviewTag.poster = this.media.poster;
                }

                // Handle media metadata loading event.
                mediaPreviewTag.addEventListener('loadedmetadata', () => {
                    // Stop the loader and display back the body template when the media is loaded.
                    this.showBodyTemplate();

                    const videoHeight = mediaPreviewTag.videoHeight;
                    const videoWidth = mediaPreviewTag.videoWidth;
                    const widthProportion = (videoWidth - videoHeight);
                    const isLandscape = widthProportion > 0;

                    // Store dimensions of the raw video.
                    this.mediaDimensions = {
                        width: videoWidth,
                        height: videoHeight,
                    };

                    // Set the media preview based on the media dimensions.
                    if (isLandscape) {
                        mediaPreviewTag.width = box.offsetWidth;
                    } else {
                        mediaPreviewTag.height = box.offsetHeight;
                    }

                    const height = this.root.querySelector(Selectors.EMBED.elements.height);
                    const width = this.root.querySelector(Selectors.EMBED.elements.width);

                    if (height.value === '' && width.value === '') {
                        height.value = videoHeight;
                        width.value = videoWidth;
                    }

                    // Size checking and adjustment.
                    if (videoHeight === parseInt(height.value) && videoWidth === parseInt(width.value)) {
                        this.currentWidth = this.mediaDimensions.width;
                        this.currentHeight = this.mediaDimensions.height;
                        this.sizeChecked('original');
                    } else {
                        this.currentWidth = parseInt(width.value);
                        this.currentHeight = parseInt(height.value);
                        this.sizeChecked('custom');
                    }
                });

                // Load the video html tag to load the media.
                mediaPreviewTag.load();
            }
        } else if (this.mediaType === 'audio') {
            if (mediaPreviewTag) { // Check if audio html exists.

                // Handle media metadata loading event.
                mediaPreviewTag.addEventListener('loadedmetadata', () => {
                    // Stop the loader and display back the body template when the media is loaded.
                    this.showBodyTemplate();
                });

                mediaPreviewTag.load();
            }
        } else {
            // Stop the loader and display back the body template when the media is loaded.
            this.showBodyTemplate();

            if (this.media.poster) {
                mediaPreviewTag.setAttribute('data-poster', this.media.poster);
            }

            // Store dimensions of the raw video.
            this.mediaDimensions = {
                width: null,
                height: null,
            };

            const height = this.root.querySelector(Selectors.EMBED.elements.height);
            const width = this.root.querySelector(Selectors.EMBED.elements.width);
            if (height && width) {
                if (height.value === '' && width.value === '') {
                    this.currentWidth = this.mediaDimensions.width;
                    this.currentHeight = this.mediaDimensions.height;
                    this.sizeChecked('original');
                } else {
                    this.currentWidth = parseInt(width.value);
                    this.currentHeight = parseInt(height.value);
                    this.sizeChecked('custom');
                }
            }

            // Set iframe width/height = box width/height.
            preview.width = box.offsetWidth;
            preview.height = box.offsetHeight;
        }
    };

    /**
     * Stop the loader and display back the body template.
     */
    showBodyTemplate = () => {
        stopMediaLoading(this.root, Selectors.EMBED.type);
        showElements(Selectors.EMBED.elements.mediaDetailsBody, this.root);
    };

    /**
     * Deletes the media after confirming with the user and loads the insert media page.
     */
    deleteMedia = () => {
        Notification.deleteCancelPromise(
            getString('deletemedia', component),
            getString('deletemediawarning', component),
        ).then(() => {
            // Marked the preview was deleted.
            this.isEmbedPreviewDeleted = true;

            // Reset media upload form.
            (new EmbedHandler(this)).resetUploadForm();

            // Delete any selected media mediaData.
            delete this.mediaData;
            return;
        }).catch(error => {
            window.console.log(error);
        });
    };

    /**
     * Delete embedded media thumbnail.
     */
    deleteEmbeddedThumbnail = () => {
        Notification.deleteCancelPromise(
            getString('deleteembeddedthumbnail', component),
            getString('deleteembeddedthumbnailwarning', component),
        ).then(async() => {
            const mediaPreviewTag = this.root.querySelector(Selectors.EMBED.elements.mediaPreviewTag);
            if (this.mediaType === 'link') {
                mediaPreviewTag.removeAttribute('data-poster');
            } else {
                mediaPreviewTag.removeAttribute('poster');
            }

            const deleteCustomThumbnail = this.root.querySelector(Selectors.EMBED.actions.deleteCustomThumbnail);
            deleteCustomThumbnail.remove();

            const uploadCustomThumbnail = this.root.querySelector(Selectors.EMBED.actions.uploadCustomThumbnail);
            uploadCustomThumbnail.textContent = await getString('uploadthumbnail', component);
            return;
        }).catch(error => {
            window.console.log(error);
        });
    };

    /**
     * Shows the insert thumbnail dialogue.
     */
    showUploadThumbnail = async() => {
        const uploadThumbnailModal = await EmbedModal.create({
            large: true,
            templateContext: {elementid: this.editor.getElement().id},
        });
        const root = uploadThumbnailModal.getRoot()[0];

        // Get selected media metadata.
        const mediaData = getEmbeddedMediaDetails(this);
        mediaData.isUpdating = this.isUpdating;

        const embedHandler = new EmbedHandler(this);
        embedHandler.loadInsertThumbnailTemplatePromise(
            insertMediaThumbnailTemplateContext(this), // Get template context for creating media thumbnail.
            {root, uploadThumbnailModal}, // Required root elements.
            await embedHandler.getMediaTemplateContext(mediaData) // Get current media data.
        );
    };

    /**
     * Only registers event listeners for new loaded elements in embed preview modal.
     */
    registerMediaDetailsEventListeners = async() => {
        // Handle media autoplay and mute.
        const autoPlay = this.root.querySelector(Selectors.EMBED.elements.mediaAutoplay);
        const mute = this.root.querySelector(Selectors.EMBED.elements.mediaMute);
        if (autoPlay && mute && this.mediaType === 'link') {
            autoPlay.addEventListener('change', () => {
                if (autoPlay.checked) {
                    mute.checked = true;
                }
            });

            mute.addEventListener('change', () => {
                if (autoPlay.checked && !mute.checked) {
                    autoPlay.checked = false;
                }
            });
        }

        // Handle the original size when selected.
        const sizeOriginalEle = this.root.querySelector(Selectors.EMBED.elements.sizeOriginal);
        if (sizeOriginalEle) {
            sizeOriginalEle.addEventListener('change', () => {
                this.sizeChecked('original');
            });
        }

        // Handle the custom size when selected.
        const sizeCustomEle = this.root.querySelector(Selectors.EMBED.elements.sizeCustom);
        if (sizeCustomEle) {
            sizeCustomEle.addEventListener('change', () => {
                this.sizeChecked('custom');
            });
        }

        // Handle the custom with size when inputted.
        const widthEle = this.root.querySelector(Selectors.EMBED.elements.width);
        if (widthEle) {
            widthEle.addEventListener('input', () => {
                // Avoid empty value.
                widthEle.value = widthEle.value === "" ? 0 : Number(widthEle.value);
                this.autoAdjustSize();
            });
        }

        // Handle the custom height size when inputted.
        const heightEle = this.root.querySelector(Selectors.EMBED.elements.height);
        if (heightEle) {
            heightEle.addEventListener('input', () => {
                // Avoid empty value.
                heightEle.value = heightEle.value === "" ? 0 : Number(heightEle.value);
                this.autoAdjustSize(true);
            });
        }

        // Handle media preview delete.
        const deleteMedia = this.root.querySelector(Selectors.EMBED.actions.deleteMedia);
        if (deleteMedia) {
            deleteMedia.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteMedia();
            });
        }

        // Show subtitles and captions settings.
        const showSubtitleCaption = this.root.querySelector(Selectors.EMBED.actions.showSubtitleCaption);
        if (showSubtitleCaption) {
            showSubtitleCaption.addEventListener('click', (e) => {
                e.preventDefault();
                hideElements([
                    Selectors.EMBED.actions.showSubtitleCaption,
                    Selectors.EMBED.actions.cancelMediaDetails,
                    Selectors.EMBED.elements.mediaDetailsBody,
                ], this.root);
                showElements([
                    Selectors.EMBED.actions.backToMediaDetails,
                    Selectors.EMBED.elements.mediaSubtitleCaptionBody,
                ], this.root);
            });
        }

        // Back to media preview.
        const backToMediaDetails = this.root.querySelector(Selectors.EMBED.actions.backToMediaDetails);
        if (backToMediaDetails) {
            backToMediaDetails.addEventListener('click', () => {
                hideElements([
                    Selectors.EMBED.actions.backToMediaDetails,
                    Selectors.EMBED.elements.mediaSubtitleCaptionBody,
                ], this.root);
                showElements([
                    Selectors.EMBED.actions.showSubtitleCaption,
                    Selectors.EMBED.actions.cancelMediaDetails,
                    Selectors.EMBED.elements.mediaDetailsBody,
                ], this.root);
            });
        }

        const uploadCustomThumbnail = this.root.querySelector(Selectors.EMBED.actions.uploadCustomThumbnail);
        if (uploadCustomThumbnail) {
            uploadCustomThumbnail.addEventListener('click', () => {
                this.showUploadThumbnail();
            });
        }

        const deleteCustomThumbnail = this.root.querySelector(Selectors.EMBED.actions.deleteCustomThumbnail);
        if (deleteCustomThumbnail) {
            deleteCustomThumbnail.addEventListener('click', () => {
                this.deleteEmbeddedThumbnail();
            });
        }

        const mediaLinkEmbedType = this.root.querySelector(Selectors.EMBED.elements.mediaLinkEmbedType);
        if (mediaLinkEmbedType) {
            mediaLinkEmbedType.addEventListener('change', () => {
                const mediaType = mediaLinkEmbedType.value;
                this.mediaTagType = mediaType;
                if (mediaType === 'audio') {
                    hideElements([
                        Selectors.EMBED.elements.mediaSizeProperties,
                        Selectors.EMBED.elements.videoThumbnail,
                        Selectors.EMBED.actions.showSubtitleCaption,
                    ], this.root);
                } else {
                    showElements([
                        Selectors.EMBED.elements.mediaSizeProperties,
                        Selectors.EMBED.elements.videoThumbnail,
                        Selectors.EMBED.actions.showSubtitleCaption,
                    ], this.root);
                }
            });
        }
    };
}
