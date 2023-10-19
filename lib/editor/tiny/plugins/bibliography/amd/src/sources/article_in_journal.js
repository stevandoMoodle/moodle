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

/**
 * Set title based on the Article in journal.
 *
 * @param {string} title
 * @returns {string}
 */
export const setTitle = (title) => {
    return `"${title}"`;
};

/**
 * Set title based on the Article in journal.
 *
 * @param {string} publisher
 * @returns {string}
 */
export const setPublisher = (publisher) => {
    return `<i>${publisher}</i>`;
};

/**
 * Sets bio's volume.
 *
 * @param {string} data
 * @param {boolean} reform
 * @param {object} $this
 * @return {string}
 */
export const setVolume = (data = null, reform = false, $this) => {
    if (!reform) {
        return data;
    } else {
        return $this.volume ? `vol. ${$this.volume}` : null;
    }
};

/**
 * Sets bio's issue.
 *
 * @param {string} data
 * @param {boolean} reform
 * @param {object} $this
 * @return {string}
 */
export const setIssue = (data = null, reform = false, $this) => {
    if (!reform) {
        return data;
    } else {
        return $this.issue ? `no. ${$this.issue}` : null;
    }
};

/**
 * Sets bio's pages.
 *
 * @param {string} data
 * @param {boolean} reform
 * @param {object} $this
 * @return {string}
 */
export const setPages = (data = null, reform = false, $this) => {
    if (!reform) {
        return data;
    } else {
        return $this.pages ? `pp. ${$this.pages}` : null;
    }
};
