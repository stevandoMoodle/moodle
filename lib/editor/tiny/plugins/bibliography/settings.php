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
 * Settings that allow turning on and off bibliography features
 *
 * @package    tiny_bibliography
 * @copyright  2024, Stevani Andolo <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

// Needed for constants.
require_once($CFG->dirroot . '/lib/editor/tiny/plugins/bibliography/classes/plugininfo.php');

use tiny_bibliography\plugininfo;

$component = 'tiny_bibliography';
$ADMIN->add('editortiny', new admin_category($component, get_string('pluginname', $component)));

if ($ADMIN->fulltree) {
    global $PAGE;

    $options = [];
    $styles = plugininfo::get_style_and_source();
    foreach (array_keys($styles) as $style) {
        if ($sourcelang = get_string($style, $component)) {
            $options[plugininfo::remove_prefix(string: $style)] = $sourcelang;
        }
    }
    ksort($options);

    if (count($options) > 0) {
        $settings->add(
            new admin_setting_heading(
                name: 'tiny_bibliography/settings',
                heading: get_string('settings:general', $component),
                information: '',
            )
        );

        $settings->add(
            new admin_setting_configselect(
                "tiny_bibliography/defaultstyle",
                get_string('style:default_style', $component),
                null,
                'ieee',
                $options
            )
        );

        $key = 'defaultsource';
        foreach (array_keys($styles) as $style) {
            $options = [];
            foreach ($styles[$style] as $source) {
                if ($sourcelang = get_string($source, $component)) {
                    $options[plugininfo::remove_prefix(
                        string: $source,
                        style: false,
                    )] = $sourcelang;
                }
            }
            ksort($options);
            $default = array_keys($options)[0];

            $style = plugininfo::remove_prefix(string: $style);
            $ucstyle = strtoupper($style);
            $settings->add(
                new admin_setting_heading(
                    name: 'tiny_bibliography/settings' . $style . $key,
                    heading: get_string('settings:default_source', $component, $ucstyle),
                    information: ''
                )
            );

            if (count($options) > 0) {
                $settings->add(
                    new admin_setting_configcheckbox(
                        'tiny_bibliography/' . $style,
                        get_string('style:enable', $component),
                        null,
                        1
                    )
                );

                $settings->add(
                    new admin_setting_configselect(
                        'tiny_bibliography/' . $style . $key,
                        get_string('source:default', $component, $ucstyle),
                        null,
                        $default,
                        $options
                    )
                );
            } else {
                \core\notification::add(
                    message: get_string('style:no_resources', $component, $ucstyle),
                    level: \core\notification::WARNING
                );
            }
        }

        $currentstyle = get_config($component, 'defaultstyle');
        $PAGE->requires->js_call_amd('tiny_bibliography/bibliography/ui_source_selector', 'init', [$styles, $currentstyle]);
    } else {
        \core\notification::add(
            message: get_string('no_styles', $component, $ucstyle),
            level: \core\notification::WARNING
        );
    }
}
