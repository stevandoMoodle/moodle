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
 * Returns example for author.
 *
 * @returns {object}
 */
export const authorExample = () => {
    return {
        "intro": "<b>Author's surename, Author's initials; Author's surename, Author's initials</b>",
        "example": "Smith, John Wick; Smith, Michael"
    };
};

/**
 * Returns example for title.
 *
 * @returns {string}
 */
export const titleExample = () => {
    return "How to create a new bibliography";
};

/**
 * Returns example for city.
 *
 * @returns {string}
 */
export const cityExample = () => {
    return "Perth";
};

/**
 * Returns example for publisher.
 *
 * @returns {string}
 */
export const publisherExample = () => {
    return "IEEE";
};

/**
 * Returns example for year.
 *
 * @returns {string}
 */
export const yearExample = () => {
    return "2023";
};

/**
 * Returns example for volume.
 *
 * @returns {string}
 */
export const volumeExample = () => {
    return "III";
};

/**
 * Returns example for issue.
 *
 * @returns {string}
 */
export const issueExample = () => {
    return "12";
};

/**
 * Returns example for pages.
 *
 * @returns {string}
 */
export const pagesExample = () => {
    return "10-12";
};
