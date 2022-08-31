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
 * Tiny Record RTC - record audio command.
 *
 * @module      tiny_recordrtc/recordAudioCommands
 * @copyright   2022, Stevani Andolo <stevani@hotmail.com.au>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import {Loader} from './loader';
import {getButtonImage} from 'editor_tiny/utils';
import {
    audioButtonName,
    component
} from './common';

const isAudio = (node) => node.nodeName.toLowerCase() === 'audio';

export const audioSetup = async() => {
    const [
        audioButtonTitle,
        audio,
    ] = await Promise.all([
        getString('audiobuttontitle', component),
        getButtonImage('audio', component),
    ]);

    return (editor) => {
        const loader = new Loader(editor);
        let icon = 'audio';
        editor.ui.registry.addIcon(icon, audio.html);

        // Register the Menu Button as a toggle.
        // This means that when highlighted over an existing Media Image element it will show as toggled on.
        editor.ui.registry.addToggleButton(audioButtonName, {
            icon,
            tooltip: audioButtonTitle,
            onAction: () => {
                loader.displayAudioDialogue();
            },
            onSetup: api => {
                return editor.selection.selectorChangedWithUnbind(
                    'audio:not([data-mce-object]):not([data-mce-placeholder])',
                    api.setActive
                ).unbind;
            }
        });

        editor.ui.registry.addMenuItem(audioButtonName, {
            icon,
            tooltip: audioButtonTitle,
            onAction: () => loader.displayAudioDialogue()
        });

        editor.ui.registry.addContextMenu(audioButtonName, {
            update: isAudio,
        });

        editor.ui.registry.addContextToolbar(audioButtonName, {
            predicate: isAudio,
            items: audioButtonName,
            position: 'node',
            scope: 'node'
        });
    };
};
