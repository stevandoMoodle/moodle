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

/*
 * @package    tiny_bibliography
 * @copyright  2023 Stevani Andolo  <stevani@hotmail.com.au>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Templates from 'core/templates';
import {get_string as getString} from 'core/str';
import {component} from './common';
import * as Helper from './helper';

/**
 * Generates bibliography list and display them in the modal.
 *
 * @param {object} $this
 */
export const generateBioAndDisplayInModal = ($this) => {
    let biolist = $this.editor.dom.select('[class="id-bibliography-holder"]');
    if (biolist.length > 0) {
        let nodes = Helper.elementId('bibliography-info-list-holder'),
        index = 1;
        nodes.innerHTML = '';
        biolist[0].childNodes.forEach(async node => {
            let newnode;
            if (node.nodeName === 'P' && node.textContent.trim() !== '') {
                // Reset all info to pure text.
                let textcontent = node.firstChild.innerHTML.replaceAll('""', '"');
                textcontent = textcontent.replaceAll('vol. ', '');
                textcontent = textcontent.replaceAll('no. ', '');
                textcontent = textcontent.replaceAll('pp. ', '');
                textcontent = textcontent.replace(/(<([^>]+)>)/gi, '');

                newnode = await $this.getBioListWithButtons({
                    id: node.getAttribute('class'),
                    index: index++,
                    dataobject: `{${textcontent}}`,
                    bio: node.innerHTML.trim(),
                    heading: false
                });
            } else if (node.nodeName === 'H3' && node.textContent.trim() !== '') {
                newnode = await $this.getBioListWithButtons({
                    id: node.getAttribute('class'),
                    bio: node.innerHTML.trim(),
                    heading: true
                });
            }

            if (newnode) {
                nodes.innerHTML += newnode;
            }
        });
    }
};

/**
 * Cite in a bibliography.
 *
 * @param {object} $this
 * @param {event} event
 */
export const citeThis = async($this, event) => {
    const citethis = event.target.closest('[data-action="citethis"]');
    if (citethis) {
        const list = $this.editor.dom.select(`[class="${citethis.dataset.id}"]`),
        index = citethis.dataset.index;
        if (list) {
            $this.editor.insertContent(
                await Templates.render('tiny_bibliography/bibliography_citation', {
                    index: index
                })
            );
            $this.modal.hide();
        }
    }
};

/**
 * Delete a citation.
 *
 * @param {object} $this
 * @param {event} event
 */
export const deleteBibliography = ($this, event) => {
    const deletebio = event.target.closest('[data-action="deletebio"]');
    if (deletebio) {
        const list = $this.editor.dom.select(`[class="${deletebio.dataset.id}"]`);
        const index = parseInt(deletebio.dataset.index);
        if (list) {
            const refno = $this.editor.dom.select(`[class="cited-bibliography"]`);
            refno.forEach(ref => {
                const text = Helper.getInTextRefNumber(ref);
                if (parseInt(text) === index) {
                    // Delete citation(s) if data-index is the same as current text of it.
                    ref.remove();
                }
            });

            // Reorder citations.
            reorderCitation($this, index, false);

            // Delete found bibliography list.
            list[0].remove();

            // Reorder the bibliography list.
            reorderBibliography($this);

            // Close the modal.
            $this.modal.hide();
        }
    }
};

/**
 * Edit bibliography list.
 *
 * @param {object} $this
 * @param {event} event
 */
export const editBibliography = async($this, event) => {
    const editbio = event.target.closest('[data-action="editbio"]');
    if (editbio) {
        const data = JSON.parse(editbio.dataset.object);

        // Set required bio property values.
        $this.style = data.style;
        $this.source = data.source;
        $this.pureauthor = data.pureauthor;
        $this.title = data.title;

        if ($this.checkSource('Book')) {
            $this.city = data.purecity;
            $this.purecity = data.purecity;
        }

        $this.publisher = data.publisher;
        $this.year = data.year;

        if ($this.checkSource('Article in journal')) {
            $this.volume = data.volume;
            $this.issue = data.issue;
            $this.pages = data.pages;
        }

        $this.create = false;
        $this.updateid = editbio.dataset.id;
        $this.updateindex = editbio.dataset.index;

        // Set bio data to the form.
        Helper.elementId('id_sourcestyle').value = data.style;
        Helper.elementId('id_typeofsource').value = data.source;
        Helper.elementId('id_author').value = data.pureauthor;
        Helper.elementId('id_title').value = data.title;

        const VIP = Helper.elementId('book-source').classList; // Volume, issue & pages.
        const city = Helper.elementId('fitem_id_city_bio').classList;
        if ($this.checkSource('Book')) {
            VIP.add('hide');
            city.remove('hide');
            Helper.elementId('id_city_bio').value = data.purecity;
        }

        Helper.elementId('id_publisher').value = data.publisher;
        Helper.elementId('id_year').value = data.year;

        if ($this.checkSource('Article in journal')) {
            VIP.remove('hide');
            city.add('hide');
            Helper.elementId('id_volume').value = data.volume;
            Helper.elementId('id_issue').value = data.issue;
            Helper.elementId('id_pages').value = data.pages;
        }

        Helper.elementId('id-generate-label').textContent = await getString('update', component);
        Helper.elementId('bio-form').click();
    }
};

/**
 * Reorder bibliography list.
 *
 * @param {object} $this
 */
export const reorderBibliography = ($this) => {
    let biolist = $this.editor.dom.select('[class="id-bibliography-holder"]');

    // Check if child nodes of biolist is equal to 1, delete the whole bibliograpy div.
    if (biolist[0].childNodes.length === 1) {
        biolist[0].remove();
    }

    if (biolist.length > 0) {
        let index = 0;
        biolist[0].childNodes.forEach(node => {
            if (node.nodeName === 'P' && node.textContent.trim() !== '') {
                // Reset all info to pure text.
                node.childNodes[2].removeAttribute('class');
                node.childNodes[2].classList.add(`id-refno-${index}`);
                node.childNodes[2].textContent = `[${index}]`;

                node.removeAttribute('class');
                node.classList.add(`id-bibliography-list-${index}`);
            }
            index++;
        });
    }
};

/**
 * Reorder all citations.
 *
 * @param {object} $this
 * @param {number} refnumber
 * @param {boolean} increase
 */
export const reorderCitation = ($this, refnumber, increase = false) => {
    const reflist = $this.editor.dom.select('[class="cited-bibliography"]');
    if (reflist.length > 0) {
        reflist.forEach(ref => {
            const content = parseInt(Helper.getInTextRefNumber(ref));
            if (content >= refnumber) {
                ref.textContent = `[${content - 1}]`;
                if (increase) {
                    ref.textContent = `[${content + 1}]`;
                }
            }
        });
    }
};

/**
 * Generates or updates the bibliography.
 *
 * @param {object} $this
 */
export const generateBibliography = async($this) => {
    $this.author = '';
    $this.splitAuthorName();

    if ($this.style !== null && $this.source !== null && $this.author !== '' && $this.title !== null &&
         $this.publisher !== null && $this.year !== null) {

        // Checks and reforms bio's info based on source type.
        checkAndReformBioInfo($this);

        // Reforms bio's title and publisher based on source type.
        $this.setTitleBasedOnSource();
        $this.setPublisherBasedOnSource();

        if ($this.create) {
            let biolist = $this.editor.dom.select('[class="id-bibliography-holder"]'),
            index = biolist.length;
            if (index > 0) {
                index = biolist[0].querySelectorAll('p').length;
            }

            $this.updateindex = index + 1;
            const info = await $this.getBioContent($this);
            let bibliography, textnodes;
            if (index > 0) {
                textnodes = $this.getTextNodes(biolist[0].lastChild);
                bibliography = info;
            } else {
                textnodes = $this.getTextNodes($this.editor.getBody().lastChild);
                bibliography = await Templates.render('tiny_bibliography/bibliography_header', {
                    info: info
                });
            }

            const currentelement = $this.editor.selection.getNode().getAttribute('class');
            if (currentelement && currentelement.includes('id-bibliography-list-')) {
                // Put the cursor to the end of the selected bio element.
                textnodes = $this.getTextNodes($this.editor.selection.getNode());
            }

            // Locate to insert a new bio.
            $this.editor.selection.setCursorLocation(
                textnodes[textnodes.length - 1],
                textnodes[textnodes.length - 1].textContent.length
            );

            // Insert new bio list.
            await $this.editor.insertContent(bibliography);

            // Check if cursor is currently located within the bio list element.
            if (currentelement && currentelement.includes('id-bibliography-list-')) {
                // Reorder citations.
                let refno = currentelement.split('-');
                refno = parseInt(refno[refno.length - 1]) + 1;

                // Reorder all citations.
                reorderCitation($this, refno, true);

                // Reorder bibliography list.
                reorderBibliography($this);
            }
        } else {
            const targetlist = $this.editor.dom.select(`[class="${$this.updateid}"]`)[0];
            targetlist.innerHTML = await $this.getBioContent($this);
            $this.create = true;
        }

        // Close the modal.
        $this.modal.hide();
    } else {
        alert('You need to provide all information');
    }
};

/**
 * Checks and reforms bio's data based on source type.
 *
 * @param {object} $this
 */
export const checkAndReformBioInfo = ($this) => {
    // Extra check based on "Book" source type.
    if ($this.checkSource('Book') && $this.city === null) {
        alert('You need to provide all information');
        return;
    } else {
        // Reforms bio's city based on source type.
        $this.setCitybioBasedOnSource();
    }

    // Extra check based on "Article in journal" source type.
    if ($this.checkSource('Article in journal') && ($this.volume === null || $this.issue === null ||
            $this.pages === null)) {
        alert('You need to provide all information');
        return;
    } else {
        // Reforms bio's volume, issue and pages.
        $this.setVolume(null, true);
        $this.setIssue(null, true);
        $this.setPages(null, true);
    }
};
