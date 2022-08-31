<?php
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
 * Tiny media plugin.
 *
 * @package    tiny_mediamanager
 * @copyright  2022 Andrew Lyons <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace tiny_mediamanager;

use context;
use editor_tiny\editor;
use editor_tiny\plugin;
use editor_tiny\plugin_with_buttons;
use editor_tiny\plugin_with_configuration;
use editor_tiny\plugin_with_menuitems;

/**
 * Tiny media manager plugin.
 *
 * @package    tiny_mediamanager
 * @copyright  2022, Stevani Andolo <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class plugininfo extends plugin implements plugin_with_buttons, plugin_with_menuitems, plugin_with_configuration {

    public static function get_available_buttons(): array {
        return [
            'tiny_mediamanager/tiny_mediamanager_image',
        ];
    }

    public static function get_available_menuitems(): array {
        return [
            'tiny_mediamanager/tiny_mediamanager_image',
        ];
    }

    public static function get_plugin_configuration_for_context(
        context $context,
        array $options,
        array $fpoptions,
        ?editor $editor = null
    ): array {
        global $CFG, $USER;
        require_once($CFG->dirroot . '/repository/lib.php');  // Load constants.
        // exit($CFG->dirroot . '/accesslib.php');

        // Disabled if:
        // - Not logged in or guest.
        // - Files are not allowed.
        // - Only URL are supported.
        $disabled = !isloggedin() || isguestuser() ||
                (!isset($options['maxfiles']) || $options['maxfiles'] == 0) ||
                (isset($options['return_types']) && !($options['return_types'] & ~FILE_EXTERNAL));

        $params = array('disabled' => $disabled, 'area' => array(), 'usercontext' => null);

        if (!$disabled) {
            // $params['usercontext'] = context_user::instance($USER->id)->id;
            foreach (array('itemid', 'context', 'areamaxbytes', 'maxbytes', 'subdirs', 'return_types',
                           'removeorphaneddrafts') as $key) {
                if (isset($options[$key])) {
                    if ($key === 'context' && is_object($options[$key])) {
                        // Just context id is enough.
                        $params['area'][$key] = $options[$key]->id;
                    } else {
                        $params['area'][$key] = $options[$key];
                    }
                }
            }
        }

        $data = [
            'params' => $params,
            'fpoptions' => $fpoptions
        ];

        return [
            'data' => $data
        ];
    }
}
