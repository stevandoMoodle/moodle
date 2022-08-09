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
 * Tiny H5P Content configuration.
 *
 * @module      tiny_h5p/commands
 * @copyright   2022 Andrew Lyons <andrew@nicols.co.uk>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {
    displayFilepicker,
    getPluginConfiguration,
} from 'editor_tiny/utils';
import {component} from './common';

import {getList} from 'core/normalise';
import {renderForPromise} from 'core/templates';
import Modal from 'tiny_h5p/modal';
import ModalEvents from 'core/modal_events';
import ModalFactory from 'core/modal_factory';

export const handleAction = (editor) => {
    openingSelection = editor.selection.getNode();
    displayDialogue(editor);
};

let openingSelection = null;

/**
 * Get the template context for the dialogue.
 *
 * @param {Editor} editor
 * @param {object} data
 * @returns {object} data
 */
const getTemplateContext = (editor, data) => {
    const config = getPluginConfiguration(editor, 'h5p');

    // TODO Tidy these up and simplify.
    const permissions = {
        canUpload: config.permissions?.upload ?? false,
        canEmbed: config.permissions?.embed ?? false,
    };

    permissions.canUploadAndEmbed = permissions.canUpload && permissions.canEmbed;

    // TODO Fill these - these are just placeholders.
    const showOptions = {};
    const optionDownloadButton = true;
    const optionEmbedButton = true;
    const optionCopyrightButton = true;
    const fileURL = data?.url ?? '';

    return Object.assign({}, {
        elementid: editor.id,
        canUpload: permissions.canUpload,
        canEmbed: permissions.canEmbed,
        canUploadAndEmbed: permissions.canUploadAndEmbed,
        showOptions: showOptions,
        fileURL: fileURL,
        optionDownloadButton: optionDownloadButton,
        optionEmbedButton: optionEmbedButton,
        optionCopyrightButton: optionCopyrightButton,
    }, data);
};

/**
 * Get the URL from the submitted form.
 *
 * @param {FormNode} form
 * @param {string} submittedUrl
 * @param {object} config
 * @returns {URL|null}
 */
const getUrlFromSubmission = (form, submittedUrl, config) => {
    if (!submittedUrl) {
        return null;
    }

    // Generate a URL Object for the submitted URL.
    const url = new URL(submittedUrl);

    if (config.permissions?.upload) {
        if (form.querySelector('[name="download"]').checked) {
            url.searchParams.append('export', 1);
        }
    }

    if (config.permissions?.embed) {
        if (form.querySelector('[name="embed"]').checked) {
            url.searchParams.append('embed', 1);
        }
    }
    if (form.querySelector('[name="copyright"]').checked) {
        url.searchParams.append('copyright', 1);
    }

    return url;
};

const handleDialogueSubmission = async (editor, modal, data) => {
    const config = getPluginConfiguration(editor, 'h5p');

    const form = getList(modal.getRoot())[0].querySelector('form');
    if (!form) {
        // The form couldn't be found, which is weird.
        // This should not happen.
        // Display the dialogue again
        displayDialogue(editor, Object.assign({}, data));
        return;
    }

    // Get the URL from the submitted form.
    const submittedUrl = form.querySelector('input[name="url"]').value;
    const url = getUrlFromSubmission(form, submittedUrl, config);

    if (!url) {
        // The URL is invalid.
        // Fill it in and represent the dialogue with an error.
        displayDialogue(editor, Object.assign({}, data, {
            url: submittedUrl,
            invalidUrl: true,
        }));
        return;
    }


    const content = await renderForPromise(`${component}/content`, {
        url: url.toString(),
    });

    const currentPlaceholder = openingSelection.closest('.h5p-placeholder');
    if (currentPlaceholder) {
        const newPlaceholder = document.createElement('div');
        newPlaceholder.innerHTML = content.html;
        currentPlaceholder.replaceWith(...newPlaceholder.childNodes);
    } else {
        // TODO - Make this work better.
        editor.selection.setContent(content.html);
    }
};

const getCurrentH5PData = (currentH5P) => {
    const data = {};
    let url;
    try {
        url = new URL(currentH5P.textContent);
    } catch (error) {
        return data;
    }

    if (url.searchParams.has('export')) {
        data.download = true;
        url.searchParams.delete('export');
    }

    if (url.searchParams.has('embed')) {
        data.embed = true;
        url.searchParams.delete('embed');
    }

    if (url.searchParams.has('copyright')) {
        data.copyright = true;
        url.searchParams.delete('copyright');
    }

    data.url = url.toString();

    return data;
};

const displayDialogue = async (editor, data = {}) => {
    const selection = editor.selection.getNode();
    const currentH5P = selection.closest('.h5p-placeholder');
    if (currentH5P) {
        Object.assign(data, getCurrentH5PData(currentH5P));
    }

    const modal = await ModalFactory.create({
        type: Modal.TYPE,
        templateContext: getTemplateContext(editor, data),
        large: true,
    });
    modal.show();

    const $root = modal.getRoot();
    const root = $root[0];
    $root.on(ModalEvents.save, (event, modal) => {
        handleDialogueSubmission(editor, modal, data);
    });

    root.addEventListener('click', (e) => {
        const filepickerButton = e.target.closest('[data-target="filepicker"]');
        if (filepickerButton) {
            displayFilepicker(editor, 'h5p').then((params) => {
                if (params.url !== '') {
                    const input = root.querySelector('form input[name="url"]');
                    input.value = params.url;
                }
                return params;
            })
                .catch();
        }
    });
};
