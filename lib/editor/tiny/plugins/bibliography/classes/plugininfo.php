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

namespace tiny_bibliography;

use context;
use editor_tiny\editor;
use editor_tiny\plugin;
use editor_tiny\plugin_with_buttons;
use editor_tiny\plugin_with_configuration;
use editor_tiny\plugin_with_menuitems;

use function DI\string;

/**
 * Tiny media manager plugin.
 *
 * @package    tiny_bibliography
 * @copyright  2022, Stevani Andolo <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class plugininfo extends plugin implements plugin_with_buttons, plugin_with_menuitems, plugin_with_configuration {

    public static function get_available_buttons(): array {
        return [
            'tiny_bibliography/tiny_bibliography_image',
        ];
    }

    public static function get_available_menuitems(): array {
        return [
            'tiny_bibliography/tiny_bibliography_image',
        ];
    }

    public static function get_style_and_source() {
        global $CFG;

        $target = $CFG->dirroot . '/lib/editor/tiny/plugins/bibliography/amd/src/bibliography/styles';
        $targetDir = new \DirectoryIterator($target);

        $styles = [];
        foreach ($targetDir as $dir) {
            $styledotjs = $target .'/'. $dir->getFilename() .'/style.js';
            if (!$dir->isDot() && $dir->isDir() && file_exists($styledotjs)) {
                $styles[] = $dir->getFilename();
            }
        }

        $styleSources = [];
        foreach ($styles as $style) {
            $pluginStyle = self::add_prefix($style);
            $styleSources[$pluginStyle] = [];
            $sourceTarget = $target . '/' . $style .'/sources';
            if (file_exists($sourceTarget)) {
                $targetDir = new \DirectoryIterator($sourceTarget);
                $totalsourcefiles = 0;
                foreach ($targetDir as $file) {
                    if (!$file->isDot() && $file->isFile() && $file->getExtension() === 'js') {
                        $source = str_replace('.js', '', $file->getFilename());
                        array_push(
                            $styleSources[$pluginStyle],
                            self::add_prefix(
                                string: $source,
                                style: false
                            )
                        );
                        $totalsourcefiles++;
                    }
                }

                if ($totalsourcefiles < 1 && isset($styleSources[$pluginStyle])) {
                    // Unset the style because it has no sources.
                    unset($styleSources[$pluginStyle]);
                }
            } else {
                // Unset the style because it has no sources.
                unset($styleSources[$pluginStyle]);
            }
        }

        return $styleSources;
    }

    public static function get_style_default_source() {
        $defaultsources = [];
        $styles = array_keys(plugininfo::get_style_and_source());
        foreach ($styles as $style) {
            $style = self::remove_prefix($style);
            $defaultsources[$style] = self::remove_prefix(
                string: get_config(
                    plugin: 'tiny_bibliography',
                    name: $style . 'defaultsource',
                ),
                style: false,
            );
        }
        return $defaultsources;
    }

    public static function add_prefix(string $string, bool $style = true) {
        return ($style ? 'style:' : 'source:') . $string;
    }

    public static function remove_prefix(string $string, bool $style = true) {
        return str_replace($style ? 'style:' : 'source:', '', $string);
    }

    public static function get_plugin_configuration_for_context(
        context $context,
        array $options,
        array $fpoptions,
        ?editor $editor = null
    ): array {
        global $PAGE;

        $defaultstyle = self::remove_prefix(get_config(
            plugin: 'tiny_bibliography',
            name: 'defaultstyle',
        ));
        $defaultsource = self::get_style_default_source();

        $data = [
            'params' => self::get_style_and_source(),
            'default' => [
                'style' => $defaultstyle,
                'sources' => $defaultsource,
            ],
            'fpoptions' => $fpoptions
        ];
        $PAGE->requires->js_call_amd('tiny_bibliography/bibliography/ui_source_selector', 'init', [$defaultstyle, $defaultsource, $editor]);

        return [
            'data' => $data
        ];
    }
}
