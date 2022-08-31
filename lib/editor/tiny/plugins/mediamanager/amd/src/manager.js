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
 * Tiny Media Manager plugin class for Moodle.
 *
 * @module      tiny_mediamanager/manager
 * @copyright   2022, Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import * as Modal from 'core/modal_factory';
import * as ModalEvents from 'core/modal_events';
import {getData} from './options';

export const MediaManager = class {

    editor = null;
    area = null;
    CAN_RECEIVE_FOCUS_SELECTOR = '.fp-navbar a:not([disabled])';
    FILE_MANAGER_SELECTOR = '#fitem_id_files_filemanager';

    constructor(editor) {
        this.editor = editor;
        const data = getData(editor);
        this.area = data.params.area;
        this.area.itemid = data.fpoptions.image.itemid;
    }

    displayDialogue() {
        const iframe = document.createElement('iframe');
        // We set the height here because otherwise it is really small. That might not look
        // very nice on mobile "devices, but we considered that enough for now.
        iframe.style.cssText = `
            height: 650px;
            border: none;
            width: 100%;
        `;
        iframe.setAttribute('src', this._getIframeURL());

        // Focus on the first focusable element of the file manager after it is fully loaded.
        iframe.addEventListener('load', function() {
            // The file manager component is loaded asynchronously after the page is loaded.
            // We check for the presence of .fm-loaded every 200 ms to determine if the file manager is loaded yet.
            var intervalId = setInterval(function() {
                if (document.querySelector('.fm-loaded')) {
                    var firstFocusableElement = document.querySelector(this.CAN_RECEIVE_FOCUS_SELECTOR);
                    if (firstFocusableElement) {
                        firstFocusableElement.focus();
                    }
                    clearInterval(intervalId);
                }
            }, 200);
        }, this, iframe);

        Modal.create({
            type: Modal.types.DEFAULT,
            large: true,
            title: getString('mediamanagerproperties', 'tiny_mediamanager'),
            body: iframe
        }).then(modal => {
            modal.getRoot().on(ModalEvents.hidden, () => {
                modal.destroy();
            });
            modal.show();
            document.querySelector('.modal-lg').style.cssText = `max-width: 850px`;
            return modal;
        }).catch();
    }

    _getIframeURL = () => {
        const args = new URLSearchParams({
            elementid: this.editor.getElement().id,
            ...this.area
        });
        return M.cfg.wwwroot + '/lib/editor/tiny/plugins/mediamanager/manage.php?' + args.toString();
    };
};
