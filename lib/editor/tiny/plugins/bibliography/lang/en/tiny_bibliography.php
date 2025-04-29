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
 * Strings for component 'tiny_bibliography', language 'en'.
 *
 * @package    tiny_bibliography
 * @copyright  2022, Stevani Andolo <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
$string['pluginname'] = 'Bibliography';
$string['citation'] = 'Citation';

$string['command:add_bibliography'] = 'Add bibliography';
$string['command:bibliography_list'] = 'Bibliography list';

$string['alert:oops'] = 'Oops!';
$string['alert:style_not_available'] = '<b><i>{$a}</b></i> style is not available yet';

$string['style:ieee'] = 'IEEE';
$string['style:apa'] = 'APA';
$string['style:harvard'] = 'HARVARD';

$string['source:book'] = 'Book';
$string['source:book_translated'] = 'Book translated';
$string['source:book_with_chapter_title'] = 'Book with chapter title';
$string['source:website'] = 'Website';

$string['label:style'] = 'Style';
$string['label:source'] = 'Source';
$string['label:all_fields'] = 'Show all fields';

$string['button:reset'] = 'Reset';
$string['button:delete'] = 'Delete';
$string['button:delete_bibliography'] = 'Delete bibliography';
$string['button:save'] = 'Save as new';
$string['button:edit'] = 'Edit';
$string['button:ok'] = 'Ok';
$string['button:cancel'] = 'Cancel';
$string['button:generate'] = 'Generate';
$string['button:generate_list'] = 'Generate list';
$string['button:update'] = 'Update';
$string['button:back'] = 'Back';
$string['button:add_bibliography'] = 'Add bibliography';

$string['field:pageTitle'] = 'Page title';
$string['field:websiteTitle'] = 'Website title';
$string['field:webAddress'] = 'Web address';
$string['field:monthAccessed'] = 'Month accessed';
$string['field:dateAccessed'] = 'Date accessed';
$string['field:yearAccessed'] = 'Year accessed';
$string['field:chapter'] = 'Chapter';
$string['field:section'] = 'Section';
$string['field:chapterTitle'] = 'Chapter title';
$string['field:publishedTitle'] = 'Published title';
$string['field:shortTitle'] = 'Short title';
$string['field:editor'] = 'Editor';
$string['field:url'] = 'URL';
$string['field:year'] = 'Year';
$string['field:month'] = 'Month';
$string['field:day'] = 'Day';
$string['field:title'] = 'Title';
$string['field:bookTitle'] = 'Book title';
$string['field:city'] = 'City';
$string['field:publisher'] = 'Publisher';
$string['field:journalName'] = 'Journal name';
$string['field:volume'] = 'Volume';
$string['field:issue'] = 'Issue';
$string['field:pages'] = 'Pages';
$string['field:translator'] = 'Translator';
$string['field:edition'] = 'Edition';
$string['field:comments'] = 'Comments';
$string['field:author'] = 'Author';
$string['field:sure_name'] = 'Sure name';
$string['field:first_name'] = 'First name';
$string['field:middle_name'] = 'Middle name';
$string['field:stateProvince'] = 'State / Province';
$string['field:country'] = 'Country';
$string['field:numberOfVolumes'] = 'Number of volumes';
$string['field:state'] = 'State (only U.S.)';
$string['field:translatedTo'] = 'Translated to';
$string['field:place'] = 'Place of publication';
$string['field:required'] = 'You need to fill all the default fields or if you enable "All fields" are the ones with *';
$string['field:subTitle'] = 'Sub title';
$string['field:isFirstEdition'] = 'Is it first edition?';

$string['content:no_bibliography'] = 'No bibliography!';

$string['setting:default_style'] = 'Default style';
$string['setting:enable_style'] = 'Enable';
$string['setting:default'] = '{$a} default source';
$string['setting:no_styles'] = 'You do not have any styles yet.<br>If you think you have created any styles, please check the string lang.';
$string['setting:no_resources'] = '{$a} style has no sources yet.<br>If you think you have created sources for {$a}, please check the string lang.';
$string['setting:general'] = 'Style default setting';
$string['setting:default_source'] = '<b><i>{$a}</b></i> - Default source setting';
$string['setting:no_enabled_styles'] = '<i class="text-danger">No enabled styles</i><br><span>Please enable at least one style.</span>';
$string['setting:style_status'] = 'Status';
$string['setting:not_installed'] = '<i class="text-danger">Not installed</i><br><span>Please press "Save changes" button to install this style.</span>';
$string['setting:installed'] = '<span class="text-success">Installed</span>';

$string['modal_title:insert'] = 'Insert bibliography';
$string['modal_title:citation'] = 'Insert citation';
$string['modal_title:bibliography'] = 'Bibliography';
$string['modal_title:update'] = 'Update bibliography';
$string['modal_title:default_style_not_enabled'] = 'Default style not available';
$string['modal_title:used_style_not_available'] = 'Used style not available';
$string['modal_title:used_style_not_selected'] = 'Used style not being selected';

$string['modal_warning:used_style_not_available'] = '
    Your existing bibliography is using <b><i>"{$a}"</i></b> style that is not available!
    <br><br>If you wish to continue adding more bibliography of the same used style, please contact your site administration to enable <b><i>"{$a}"</i></b> style.
    Otherwise, you can remove the existing bibliography and start creating new ones with the available styles.
';
$string['modal_warning:default_style_not_enabled'] = '
    Your current default style is <b><i>"{$a}"</i></b> but is not available.
    <br>If you wish to crate a bibliography, please contact your site administrator to enable <b><i>"{$a}"</i></b> style.
';
$string['modal_warning:used_style_not_selected'] = '
    Your existing bibliography is using <b><i>"{$a}"</i></b> style.<br>Therefore, you cannot use other styles that can break your existing bibliography.
    <br><br>Style selection has been set back to <b><i>"{$a}"</i></b>.
';
$string['modal_warning:no_selected_citation'] = 'You have not selected a citation to view.';

$string['option:yes'] = 'Yes';
$string['option:no'] = 'No';

// $string['edit'] = 'Edit';
// $string['update'] = 'Update';
// $string['delete'] = 'Delete';
// $string['yes'] = 'Yes';
// $string['no'] = 'No';
// $string['preparing'] = 'Preparing bibliography';


// $string['source:report'] = 'Report';
// $string['source:default_desc'] = 'Please select your default source for {$a}';
// $string['source_desc'] = 'Please select your default bibliography source.';
// $string['style_desc'] = 'Please select your default bibliography style.';
// $string['source:soundrecording'] = 'Sound Recording';
// $string['source:booksection'] = 'Book Section';
// $string['source:electronicsource'] = 'Electronic Source';
// $string['source:articleinjournal'] = 'Article In Journal';
// $string['source:documentfromwebsite'] = 'Document From Website';
// $string['source:conferenceproceedings'] = 'Conference Proceedings';
// $string['field:nameofwebsite'] = 'Name of website';
// $string['field:producername'] = 'Producer name';
// $string['field:nameofwebpage'] = 'Name of web page';
// $string['field:standardNumber'] = 'Standard number';
// $string['field:composer'] = 'Composer';
// $string['field:bookauthor'] = 'Book author';
// $string['field:productioncompany'] = 'Production company';
// $string['field:yearaccessed'] = 'Year accessed';
// $string['field:monthaccessed'] = 'Month accessed';
// $string['field:dayaccessed'] = 'Day Accessed';
// $string['field:conferencepublicationname'] = 'Conference publication name';
// $string['citethis'] = 'Cite this';
// $string['biblioform'] = 'Bibliography Form';
// $string['bibliolist'] = 'Bibliography List';
// $string['unmatchedstyle'] = 'Your existing bibliography\'s style is "{$a}" and is not listed in style selections.';
