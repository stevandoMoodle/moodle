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
 * Atto text editor manage files plugin form.
 *
 * @package   tiny_mediamanager
 * @copyright 2022, Stevani Andolo <stevani@hotmail.com.au>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir."/formslib.php");

/**
 * Form allowing to edit files in one draft area.
 *
 * No buttons are necessary since the draft area files are saved immediately using AJAX.
 */
class tiny_mediamanager_manage_form extends moodleform {

    function definition() {
        global $PAGE, $USER;
        $mform = $this->_form;

        $mform->setDisableShortforms(true);

        $itemid = $this->_customdata['draftitemid'];
        $elementid = $this->_customdata['elementid'];
        $options = $this->_customdata['options'];
        $files = $this->_customdata['files'];
        $removeorphaneddrafts = $this->_customdata['removeorphaneddrafts'] ?? false;

        $mform->addElement('header', 'filemanagerhdr', get_string('filemanager', 'tiny_mediamanager'));

        $mform->addElement('hidden', 'itemid');
        $mform->setType('itemid', PARAM_INT);
        $mform->addElement('hidden', 'maxbytes');
        $mform->setType('maxbytes', PARAM_INT);
        $mform->addElement('hidden', 'subdirs');
        $mform->setType('subdirs', PARAM_INT);
        $mform->addElement('hidden', 'accepted_types');
        $mform->setType('accepted_types', PARAM_RAW);
        $mform->addElement('hidden', 'return_types');
        $mform->setType('return_types', PARAM_INT);
        $mform->addElement('hidden', 'context');
        $mform->setType('context', PARAM_INT);
        $mform->addElement('hidden', 'areamaxbytes');
        $mform->setType('areamaxbytes', PARAM_INT);
        $mform->addElement('hidden', 'elementid');
        $mform->setType('elementid', PARAM_TEXT);

        $mform->addElement('filemanager', 'files_filemanager', '', null, $options);

        // Let the user know that any drafts not referenced in the text will be removed automatically.
        if ($removeorphaneddrafts) {
            $mform->addElement('static', '', '',
                html_writer::tag('div', get_string('unusedfilesremovalnotice', 'tiny_mediamanager')));
        }

        $mform->addElement('header', 'missingfileshdr', get_string('missingfiles', 'tiny_mediamanager'));
        $mform->addElement('static', '', '',
            html_writer::tag('div',
                html_writer::tag('div', get_string('hasmissingfiles', 'tiny_mediamanager')) .
                html_writer::tag('div', '', array('class' => 'missing-files')
            ),
            array('class' => 'file-status'))
        );

        $mform->addElement('header', 'deletefileshdr', get_string('unusedfilesheader', 'tiny_mediamanager'));
        $mform->addElement('static', '', '',
            html_writer::tag('div', get_string('unusedfilesdesc', 'tiny_mediamanager')));

        foreach ($files as $hash => $file) {
            $mform->addElement('checkbox', 'deletefile[' . $hash . ']', '', $file, array('data-filename' => $file));
            $mform->setType('deletefile[' . $hash . ']', PARAM_INT);
        }

        $mform->addElement('submit', 'delete', get_string('deleteselected', 'tiny_mediamanager'));

        // $PAGE->requires->js_call_amd('tiny_mediamanager/usedfiles', 'init', [
        //     'files' => array_flip($files),
        //     'usercontext' => context_user::instance($USER->id)->id,
        //     'itemid' => $itemid,
        //     'elementid' => $elementid,
        // ]);

        $this->set_data(array(
            'files_filemanager' => $itemid,
            'itemid' => $itemid,
            'elementid' => $elementid,
            'subdirs' => $options['subdirs'],
            'maxbytes' => $options['maxbytes'],
            'areamaxbytes' => $options['areamaxbytes'],
            'accepted_types' => $options['accepted_types'],
            'return_types' => $options['return_types'],
            'context' => $options['context']->id,
        ));
    }
}
