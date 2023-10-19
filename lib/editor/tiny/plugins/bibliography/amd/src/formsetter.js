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

import * as Article from './sources/article_in_journal';
import * as Book from './sources/book';
import * as Helper from './helper';

export default class {

    /**
     * Sets bio's style.
     *
     * @param {string} data
     */
    setStyle(data = null) {
        this.style = data;
    }

    /**
     * Sets bio's source.
     *
     * @param {string} data
     */
    setSource(data = null) {
        const text = this.allsources[data];
        const VIP = this.elementId('book-source').classList; // Volume, issue & pages.
        const city = this.elementId('fitem_id_city_bio').classList;
        switch (data) {
            case 'Book':
                VIP.add('hide');
                this.elementId('id_volume').value = '';
                this.volume = null;
                this.elementId('id_issue').value = '';
                this.issue = null;
                this.elementId('id_pages').value = '';
                this.pages = null;
                city.remove('hide');
              break;
            case 'Article in journal':
                VIP.remove('hide');
                city.add('hide');
                this.elementId('id_city_bio').value = '';
                this.city = null;
              break;
            default:
                VIP.remove('hide');
                this.elementId('id_volume').value = '';
                this.volume = null;
                this.elementId('id_issue').value = '';
                this.issue = null;
                this.elementId('id_pages').value = '';
                this.pages = null;
                city.add('hide');
        }
        this.elementId('id_publisher_label').textContent = `${text} *`;
        this.elementId('id_publisher').placeholder = text;
        this.source = data;
    }

    /**
     * Sets bio's pure author.
     *
     * @param {string} data
     */
    setAuthor(data = null) {
        this.pureauthor = data;
    }

    /**
     * Sets generated author's name.
     *
     * @param {string} names
     */
    setGeneratedAuthorNames(names = null) {
        if (this.author !== '') {
            this.author += ', ' + names;
        } else {
            this.author = names;
        }
    }

    /**
     * Sets bio's title.
     *
     * @param {string} data
     */
    setTitle(data = null) {
        this.title = data;
    }

    /**
     * Sets bio's title based on source type.
     */
    setTitleBasedOnSource() {
        let title = this.title;
        switch (this.source) {
            case 'Article in journal':
                title = Article.setTitle(title);
                break;
            default:
        }
        this.title = title;
    }

    /**
     * Sets bio's city.
     *
     * @param {string} data
     */
    setCitybio(data = null) {
        this.city = data;
        this.purecity = data;
    }

    /**
     * Sets bio's city based on source type.
     */
    setCitybioBasedOnSource() {
        let city = this.city;
        switch (this.source) {
            case 'Book':
                city = Book.setCity(city);
                break;
            default:
                city = '';
        }
        this.city = city;
    }

    /**
     * Sets bio's publisher.
     *
     * @param {string} data
     */
    setPublisher(data = null) {
        this.publisher = data;
    }

    /**
     * Sets bio's publisher based on source type.
     */
    setPublisherBasedOnSource() {
        let publisher = this.publisher;
        switch (this.source) {
            case 'Article in journal':
                publisher = Article.setPublisher(publisher);
                break;
            default:
        }
        this.publisher = publisher;
    }

    /**
     * Sets bio's year.
     *
     * @param {string} data
     */
    setYear(data = null) {
        this.year = data;
    }

    /**
     * Sets bio's volume.
     *
     * @param {string} data
     * @param {boolean} reform
     */
    setVolume(data = null, reform = false) {
        this.volume = Article.setVolume(data, reform, this);
    }

    /**
     * Sets bio's issue.
     *
     * @param {string} data
     * @param {boolean} reform
     */
    setIssue(data = null, reform = false) {
        this.issue = Article.setIssue(data, reform, this);
    }

    /**
     * Sets bio's pages.
     *
     * @param {string} data
     * @param {boolean} reform
     */
    setPages(data = null, reform = false) {
        this.pages = Article.setPages(data, reform, this);
    }

    /**
     * Sets custom authors' names.
     *
     * @param {event} event
     */
    setCustomAuthorNames(event) {
        // Generates custom author name.
        const customauthorname = event.target.closest('[data-action="custom-authors"]');
        if (customauthorname) {
            Helper.elementId('full-an-holder').classList.add('hide');
            Helper.elementId('custom-an-holder').classList.remove('hide');
            Helper.elementId('other-than-author').classList.add('hide');
            Helper.elementId('fitem_id_author').classList.add('hide');
        }

        // Cancel custom author name.
        const cancelcustom = event.target.closest('[data-action="cancel-custom-authors"]');
        if (cancelcustom) {
            Helper.elementId('full-an-holder').classList.remove('hide');
            Helper.elementId('custom-an-holder').classList.add('hide');
            Helper.elementId('other-than-author').classList.remove('hide');
            Helper.elementId('fitem_id_author').classList.remove('hide');
        }

        // Process custom author name.
        const okcustom = event.target.closest('[data-action="ok-custom-authors"]');
        if (okcustom) {
            const fullname = this.generateAuthorName(
                Helper.elementId('id_author_firstname').value,
                Helper.elementId('id_author_middlename').value,
                Helper.elementId('id_author_surename').value
            ).originated.trim();

            let orivalue = Helper.elementId('id_author').value;
            if (orivalue === '') {
                orivalue = fullname;
            } else {
                orivalue += '; ' + fullname;
            }

            Helper.elementId('id_author').value = orivalue;
            this.pureauthor = orivalue;

            // Clear the inputs.
            Helper.elementId('id_author_firstname').value = '';
            Helper.elementId('id_author_middlename').value = '';
            Helper.elementId('id_author_surename').value = '';
            Helper.elementId('full-an-holder').classList.remove('hide');
            Helper.elementId('custom-an-holder').classList.add('hide');

            // Show the other-than-author and fitem_id_author IDs.
            Helper.elementId('other-than-author').classList.remove('hide');
            Helper.elementId('fitem_id_author').classList.remove('hide');
        }
    }
}
