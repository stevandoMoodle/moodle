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
    $enabledstyles = [];
    foreach (array_keys($styles) as $style) {
        $isstyleinstalled1 = get_config($component, plugininfo::remove_prefix($style));
        if (is_string($isstyleinstalled1) && $isstyleinstalled1 === '1') {
            if ($sourcelang = get_string($style, $component)) {
                $enabledstyles[plugininfo::remove_prefix(string: $style)] = $sourcelang;
            }
        }

        if ($sourcelang = get_string($style, $component)) {
            $options[plugininfo::remove_prefix(string: $style)] = $sourcelang;
        }
    }
    ksort($options);

    $stylewithconfig = array_keys((array) get_config($component));
    if (($key = array_search('version', $stylewithconfig)) !== false) {
        unset($stylewithconfig[$key]);
    }

    $styleinplugin = array_keys($options);
    foreach ($stylewithconfig as $style) {
        if (strpos($style, 'default') !== false) {
            $identifiedstyle = explode('default', $style)[0];
            if (!empty($identifiedstyle) && !in_array($identifiedstyle, $styleinplugin)) {
                unset_config($style, $component);
            }
        } else if (!in_array($style, $styleinplugin)) {
            unset_config($style, $component);
        }
    }

    if (count($options) > 0) {
        $settings->add(
            new admin_setting_heading(
                name: 'tiny_bibliography/settings',
                heading: get_string('setting:general', $component),
                information: '',
            )
        );

        if (count($enabledstyles) < 1) {
            $settings->add(
                new admin_setting_description(
                    'tiny_bibliography_status/' . str_replace(':', '_', $style) . $key,
                    get_string('setting:default_style', $component),
                    get_string('setting:no_enabled_styles', $component),
                )
            );
        }

        $settings->add(
            new admin_setting_configselect(
                "tiny_bibliography/defaultstyle",
                get_string('setting:default_style', $component),
                null,
                'ieee',
                $enabledstyles
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
            $isstyleinstalled = get_config($component, $style);
            $ucstyle = strtoupper($style);

            $settings->add(
                new admin_setting_heading(
                    name: 'tiny_bibliography/settings' . $style . $key,
                    heading: get_string('setting:default_source', $component, $ucstyle),
                    information: '',
                )
            );

            if (count($options) > 0) {
                $settings->add(
                    new admin_setting_configcheckbox(
                        'tiny_bibliography/' . $style,
                        get_string('setting:enable_style', $component),
                        null,
                        1,
                    )
                );

                $settings->add(
                    new admin_setting_configselect(
                        'tiny_bibliography/' . $style . $key,
                        get_string('setting:default', $component, $ucstyle),
                        null,
                        $default,
                        $options,
                    )
                );

                if (is_bool($isstyleinstalled) && !$isstyleinstalled) {
                    $settings->add(
                        new admin_setting_description(
                            'tiny_bibliography_status/' . $style . $key,
                            get_string('setting:style_status', $component),
                            get_string('setting:not_installed', $component),
                        )
                    );
                } else {
                    $settings->add(
                        new admin_setting_description(
                            'tiny_bibliography_status/' . $style . $key,
                            get_string('setting:style_status', $component),
                            get_string('setting:installed', $component),
                        )
                    );
                }
            } else {
                \core\notification::add(
                    message: get_string('setting:no_resources', $component, $ucstyle),
                    level: \core\notification::WARNING
                );
            }
        }

        $currentstyle = get_config($component, 'defaultstyle');
        $PAGE->requires->js_call_amd('tiny_bibliography/bibliography/ui_source_selector', 'init', [$styles, $currentstyle]);
    } else {
        \core\notification::add(
            message: get_string('setting:no_styles', $component, $ucstyle),
            level: \core\notification::WARNING
        );
    }
}
