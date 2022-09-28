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
 * Tiny Media configuration.
 *
 * @module      tiny_media/configuration
 * @copyright   2022 Huong Nguyen <huongnv13@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {imageButtonName, videoButtonName, mediaManagerButtonName} from './common';
import uploadFile from 'editor_tiny/uploader';
import {
    addContextmenuItem,
    addMenubarItem,
    addQuickbarsToolbarItem,
    addToolbarButtons,
} from 'editor_tiny/utils';

export const configure = (instanceConfig) => {
    const quickInsert = addQuickbarsToolbarItem(
        // Remove the quickimage entirely.
        instanceConfig.quickbars_insert_toolbar?.replace(/quickimage ?/, ''),
        imageButtonName
    );

    // Update the instance configuration to add the Media menu option to the menus and toolbars and upload_handler.
    return {
        contextmenu: addContextmenuItem(instanceConfig.contextmenu, imageButtonName, videoButtonName, mediaManagerButtonName),
        toolbar: addToolbarButtons(instanceConfig.toolbar, 'content', [imageButtonName, videoButtonName, mediaManagerButtonName]),
        menu: addMenubarItem(
            addMenubarItem(instanceConfig.menu, 'insert', `${imageButtonName} ${videoButtonName}`),
            'tools',
            mediaManagerButtonName
        ),

        // eslint-disable-next-line camelcase
        quickbars_insert_toolbar: quickInsert,

        // eslint-disable-next-line camelcase
        images_upload_handler: (blobInfo, progress) => uploadFile(
            window.tinymce.activeEditor,
            blobInfo.blob(),
            'SomeFileName',
            progress
        )
    };
};
