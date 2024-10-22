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
 * Tiny media plugin embed helpers.
 *
 * This provides easy access to any classes without instantiating a new object.
 *
 * @module      tiny_media/embed/embedhelpers
 * @copyright   2024 Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Selectors from '../selectors';
import {getStrings, getString} from 'core/str';
import {component} from "../common";
import {
    getCurrentLanguage,
    getMoodleLang
} from 'editor_tiny/options';
import {createUrlParams} from '../helpers';

/**
 * Return template context for insert media.
 *
 * @param {object} props
 * @returns {object}
 */
export const insertMediaTemplateContext = (props) => {
    return {
        mediaType: props.mediaType,
        showDropzone: props.canShowDropZone,
        showFilePicker: props.canShowFilePicker,
        fileType: 'audio/video',
    };
};

/**
 * Return template context for insert media.
 *
 * @param {object} props
 * @returns {object}
 */
export const insertMediaThumbnailTemplateContext = (props) => {
    return {
        elementid: props.editor.id,
        showDropzone: props.canShowDropZone,
        bodyTemplate: Selectors.EMBED.template.body.insertMediaBody,
        footerTemplate: Selectors.EMBED.template.footer.insertMediaFooter,
        fileType: 'image',
        selector: Selectors.EMBED.type,
    };
};

/**
 * Return selected media type and element.
 *
 * @param {editor} editor
 * @returns {Array}
 */
export const getSelectedMediaElement = (editor) => {
    let mediaType = null;
    let selectedMedia = null;
    const mediaElm = editor.selection.getNode();

    if (!mediaElm) {
        mediaType = null;
        selectedMedia = null;
    } else if (mediaElm.nodeName.toLowerCase() === 'video' || mediaElm.nodeName.toLowerCase() === 'audio') {
        mediaType = mediaElm.nodeName.toLowerCase();
        selectedMedia = mediaElm;
    } else if (mediaElm.querySelector('video')) {
        mediaType = 'video';
        selectedMedia = mediaElm.querySelector('video');
    } else if (mediaElm.querySelector('audio')) {
        mediaType = 'audio';
        selectedMedia = mediaElm.querySelector('audio');
    }

    return [mediaType, selectedMedia];
};

/**
 * This is used to format the media url (without file extension),
 * so it can be previewed from the following providers:
 * 1. YouTube.
 * 2. Vimeo.
 *
 * If the links are based on the checks the type will be "link",
 * otherwise it will be "null" and the url will be later checked in ::getFileMimeTypeFromUrl().
 *
 * @param {string} url
 * @param {object} props
 * @returns {Array} Array of formatted url and type.
 */
export const formatMediaUrl = async(url, props) => {
    let params = {};
    let media = null;

    // Check if selectedMedia prop has value.
    if (props.selectedMedia) {
        media = props.selectedMedia;

        // Create object of params.
        params = {
            controls: hasAudioVideoAttr(media, 'controls') ? '1' : '0',
            autoplay: hasAudioVideoAttr(media, 'autoplay') ? '1' : '0',
            loop: hasAudioVideoAttr(media, 'loop'),
        };
    }

    let urlParams = '';
    const [isYoutube, youtubeType] = isYoutubeUrl(url);
    if (isYoutube) {
        let fetchUrl = await fetch(`https://www.youtube.com/oembed?url=${url}&format=json`);
        let youtubeData = JSON.parse(await fetchUrl.text());

        // YouTube regex.
        const youtubeRegex = /(youtu.*be.*|y2u.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm.exec(url);
        // Get youtube site.
        const site = youtubeRegex[1];
        // It will equal to video id or "playlist" type.
        const idOrType = youtubeRegex[3];
        // Playlist check regex.
        const playlistCheckRegex = /[?&]list=([^#?&]*)/;

        // Only applies if selectedMedia prop has value.
        if (props.selectedMedia) {
            // YouTube mute param is "mute".
            params.mute = hasAudioVideoAttr(media, 'muted');
        }

        // Check if it's YouTube playlist.
        let isYoutubePlaylist = false;
        if (idOrType === 'playlist' || playlistCheckRegex.test(url)) {
            isYoutubePlaylist = true;
        }

        const isShort = ['youtu.be', 'y2u.be'].includes(site);
        const isNoCookie = (youtubeType === 'youtube-nocookie.com');

        if (isYoutubePlaylist) {
            params.list = /[&?]list=([^&]+)/i.exec(url)[1];
            urlParams = createUrlParams(params);
            urlParams = urlParams === '' ? '' : `?${urlParams}`;

            if (isNoCookie) {
                url = `https://www.youtube-nocookie.com/embed/videoseries${urlParams}`;
            } else {
                url = `https://${(isShort) ? 'youtube.com' : site}/embed/videoseries${urlParams}`;
            }
        } else {
            urlParams = createUrlParams(params);
            urlParams = urlParams === '' ? '' : `?${urlParams}`;

            if (isNoCookie) {
                url = `https://www.youtube-nocookie.com/embed/${idOrType + urlParams}`;
            } else {
                url = `https://${(isShort) ? 'youtube.com' : site}/embed/${idOrType + urlParams}`;
            }
        }

        return [url, 'link', youtubeData.title];
    } else if (url.includes('https://vimeo.com/')) {
        // Only applies if selectedMedia prop has value.
        if (props.selectedMedia) {
            // Vimeo mute param is "muted".
            params.muted = hasAudioVideoAttr(media, 'muted');
        }

        urlParams = createUrlParams(params);
        urlParams = urlParams === '' ? '' : `?${urlParams}`;

        // Get vimeo video id.
        const vimeoVideoIdRegExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
        const vimeoVideoId = url.match(vimeoVideoIdRegExp)[5];
        // Get vimeo video data.
        const fetchUrl = await fetch(`https://vimeo.com/api/v2/video/${vimeoVideoId}.json`);
        const vimeoData = JSON.parse(await fetchUrl.text())[0];

        return [
            // Vimeo original link: https://vimeo.com/012345?params.
            url.replaceAll('vimeo.com', 'player.vimeo.com/video') + urlParams,
            // Vimeo embed link: https://player.vimeo.com/video/012345?params.
            'link',
            vimeoData.title,
        ];
    }

    // Return original url and "null" as the type.
    return [url, null, null];
};

/**
 * Check if url is YouTube url.
 *
 * @param {string} url
 * @returns {Array}
 */
export const isYoutubeUrl = (url) => {
    let isYoutube = false;
    let type = null;
    const youtubeTypes = [
        'youtube.com',
        'youtube-nocookie.com',
        'youtu.be',
        'y2u.be'
    ];

    for (let i = 0; i < youtubeTypes.length; i++) {
        if (url.includes(youtubeTypes[i])) {
            isYoutube = true;
            type = youtubeTypes[i];
            break;
        }
    }

    return [isYoutube, type];
};

/**
 * Return template context for media details.
 *
 * @param {object} props
 * @returns {object}
 */
export const mediaDetailsTemplateContext = async(props) => {
    const context = {
        bodyTemplate: Selectors.EMBED.template.body.mediaDetailsBody,
        footerTemplate: Selectors.EMBED.template.footer.mediaDetailsFooter,
        isVideo: (props.mediaType === 'video'),
        isAudio: (props.mediaType === 'audio'),
        isLink: (props.mediaType === 'link'),
        canHaveThumbnail: (props.mediaType === 'video' || props.mediaTagType === 'video'),
        isUpdating: props.isUpdating,
        isNewFileOrLinkUpload: (props.newMediaLink || props.newFileUpload),
        selector: Selectors.EMBED.type,
    };

    // Props for link mediaType to form a select element for audio and video.
    if (context.isLink) {
        context.linkMediaType = [
            {
                label: await getString('audio', component),
                value: 'audio',
                selected: (props.mediaTagType === 'audio') ? 'selected' : '',
            },
            {
                label: await getString('video', component),
                value: 'video',
                selected: (props.mediaTagType === 'video') ? 'selected' : '',
            }
        ];
    }

    return {...context, ...props};
};

/**
 * Get help strings.
 *
 * @returns {object}
 */
export const getHelpStrings = async() => {
    const [
        customsize,
        linkcustomsize,
    ] = await getStrings([
        'customsize_help',
        'linkcustomsize_help',
    ].map((key) => ({
        key,
        component,
    })));

    return {
        customsize,
        linkcustomsize,
    };
};

/**
 * Get current moodle languages.
 *
 * @param {editor} editor
 * @returns {object}
 */
export const prepareMoodleLang = (editor) => {
    const moodleLangs = getMoodleLang(editor);
    const currentLanguage = getCurrentLanguage(editor);

    const installed = Object.entries(moodleLangs.installed).map(([lang, code]) => ({
        lang,
        code,
        "default": lang === currentLanguage,
    }));

    const available = Object.entries(moodleLangs.available).map(([lang, code]) => ({
        lang,
        code,
        "default": lang === currentLanguage,
    }));

    return {
        installed,
        available,
    };
};

/**
 * Return moodle lang.
 *
 * @param {string} subtitleLang
 * @param {editor} editor
 * @returns {object|null}
 */
export const getMoodleLangObj = (subtitleLang, editor) => {
    const {available} = getMoodleLang(editor);

    if (available[subtitleLang]) {
        return {
            lang: subtitleLang,
            code: available[subtitleLang],
        };
    }

    return null;
};

/**
 * Get media data from the inserted media.
 *
 * @param {object} props
 * @returns {object}
 */
export const getEmbeddedMediaDetails = (props) => {
    const tracks = {
        subtitles: [],
        captions: [],
        descriptions: [],
        chapters: [],
        metadata: []
    };

    const mediaMetadata = props.root.querySelectorAll(Selectors.EMBED.elements.mediaMetadataTabPane);
    mediaMetadata.forEach(metaData => {
        const trackElements = metaData.querySelectorAll(Selectors.EMBED.elements.track);
        trackElements.forEach(track => {
            tracks[metaData.dataset.trackKind].push({
                src: track.querySelector(Selectors.EMBED.elements.url).value,
                srclang: track.querySelector(Selectors.EMBED.elements.trackLang).value,
                label: track.querySelector(Selectors.EMBED.elements.trackLabel).value,
                defaultTrack: track.querySelector(Selectors.EMBED.elements.trackDefault).checked,
            });
        });
    });

    const querySelector = (element) => props.root.querySelector(element);
    const mediaDataProps = {};
    mediaDataProps.media = {
        type: props.mediaType,
        sources: props.media,
        poster: props.media.poster ?? null,
        title: querySelector(Selectors.EMBED.elements.title).value,
        width: querySelector(Selectors.EMBED.elements.width).value,
        height: querySelector(Selectors.EMBED.elements.height).value,
        autoplay: querySelector(Selectors.EMBED.elements.mediaAutoplay).checked,
        loop: querySelector(Selectors.EMBED.elements.mediaLoop).checked,
        muted: querySelector(Selectors.EMBED.elements.mediaMute).checked,
        controls: querySelector(Selectors.EMBED.elements.mediaControl).checked,
        tracks,
    };
    mediaDataProps.link = false;
    return mediaDataProps;
};

/**
 * Check for video/audio attributes.
 *
 * @param {HTMLElement} elem
 * @param {string} attr Attribute name
 * @returns {boolean}
 */
export const hasAudioVideoAttr = (elem, attr) => {
    // As explained in MDL-64175, some OS (like Ubuntu), are removing the value for these attributes.
    // So in order to check if attr="true", we need to check if the attribute exists and if the value is empty or true.
    return (elem.hasAttribute(attr) && (elem.getAttribute(attr) || elem.getAttribute(attr) === ''));
};

/**
 * Return file mime type from the url.
 *
 * It will check for file extension at end of the url,
 * and if it has no file extension it will return null as no mimetype.
 *
 * @param {string} url
 * @returns {string}
 */
export const getFileMimeTypeFromUrl = async(url) => {
    let fetchedMimeType = null;
    let fileName = null;
    const uri = url.split('/');
    if (uri.length > 0) {
        fileName = uri[uri.length - 1];
    }

    const mimeTypes = Selectors.MEDIA_MIME_TYPES;
    for (const property in mimeTypes) {
        // Let's check if last uri has dot like "filename.type".
        if (fileName && fileName.includes('.')) {
            let fileExtension = fileName.split('.');
            fileExtension = fileExtension[fileExtension.length - 1].toLowerCase();
            if (fileExtension.includes('?') && (fileExtension.split('?')[0] === property)) {
                fetchedMimeType = mimeTypes[property];
            } else if (fileExtension === property) {
                fetchedMimeType = mimeTypes[property];
                break;
            }
        } else {
            // Let's mark this as a "link".
            fetchedMimeType = 'link';
            break;
        }
    }
    return fetchedMimeType;
};
