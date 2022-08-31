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
 * Tiny Record RTC - record video command.
 *
 * @module      tiny_recordrtc/recordVideoCommands
 * @copyright   2022, Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import {Loader} from './loader';
import {getButtonImage as getVideoIcon} from 'editor_tiny/utils';
import {
    videoButtonName,
    component
} from './common';

const isVideo = (node) => node.nodeName.toLowerCase() === 'video';

export const videoSetup = async() => {
    const [
        videoButtonTitle,
        buttonImage,
    ] = await Promise.all([
        getString('videobuttontitle', component),
        getVideoIcon('video', component),
    ]);

    return (editor) => {
        const loader = new Loader(editor);
        let icon = 'video';
        editor.ui.registry.addIcon(icon, buttonImage.html);

        // Register the Menu Button as a toggle.
        // This means that when highlighted over an existing Media Image element it will show as toggled on.
        editor.ui.registry.addToggleButton(videoButtonName, {
            icon,
            tooltip: videoButtonTitle,
            onAction: () => {
                loader.displayVideoDialogue();
            },
            onSetup: api => {
                return editor.selection.selectorChangedWithUnbind(
                    'video:not([data-mce-object]):not([data-mce-placeholder])',
                    api.setActive
                ).unbind;
            }
        });

        editor.ui.registry.addMenuItem(videoButtonName, {
            icon,
            tooltip: videoButtonTitle,
            onAction: () => loader.displayVideoDialogue()
        });

        editor.ui.registry.addContextMenu(videoButtonName, {
            update: isVideo,
        });

        editor.ui.registry.addContextToolbar(videoButtonName, {
            predicate: isVideo,
            items: videoButtonName,
            position: 'node',
            scope: 'node'
        });
    };
};
