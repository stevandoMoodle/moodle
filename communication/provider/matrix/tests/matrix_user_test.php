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

namespace communication_matrix;

use core_communication\communication;
use core_communication\communication_test_helper_trait;
use core_communication\communication_room_base;
use core_communication\communication_settings_data;
use communication_matrix\matrix_test_helper_trait;
use communication_matrix\matrix_user_manager;

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__ . '/matrix_test_helper_trait.php');
require_once(__DIR__ . '/../../../tests/communication_test_helper_trait.php');

/**
 * Class matrix_user_test to test the matrix events endpoint.
 *
 * @package    communication_matrix
 * @category   test
 * @copyright  2023 Stevani Andolo <stevani.andolo@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @coversDefaultClass \communication_matrix\matrix_user
 */
class matrix_user_test extends \advanced_testcase {

    use matrix_test_helper_trait;
    use communication_test_helper_trait;

    /**
     * @var communication_room_base|matrix_room_manager $matrixroommanager Matrix room manager object
     */
    protected communication_room_base|matrix_room_manager $matrixroommanager;

    /**
     * @var communication $communication The communication object
     */
    protected communication $communication;

    /**
     * @var communication_settings_data $communicationdata The communication settings data object
     */
    protected communication_settings_data $communicationdata;

    public function setUp(): void {
        parent::setUp();
        $this->resetAfterTest();
        $this->initialise_mock_server();
    }

    /**
     * Test create members.
     *
     * @return void
     * @covers ::create_members
     * @covers ::init
     */
    public function test_create_members(): void {
        // Run matrix post install task.
        $this->run_post_install_task();

        $course = $this->get_course();
        $userid = $this->get_user()->id;

        // Run room operation task.
        $this->runAdhocTasks('\core_communication\task\communication_room_operations');

        // Create user to matrix
        $communication = new communication($course->id, 'core_course', 'coursecommunication');
        $matrixuser = new matrix_user($communication);
        $matrixuser->create_members([$userid]);

        $matrixrooms = new matrix_rooms($communication->communicationsettings->get_communication_instance_id());
        $eventmanager = new matrix_events_manager($matrixrooms->roomid);

        // Get created matrixuserid from moodle.
        $elementserver = matrix_user_manager::set_matrix_home_server($eventmanager->matrixhomeserverurl);
        $matrixuserid = matrix_user_manager::get_matrixid_from_moodle($userid, $eventmanager->matrixhomeserverurl);
        $this->assertNotNull($matrixuserid);
        $this->assertEquals("@sampleun:{$elementserver}", $matrixuserid);

        // Add api call to get user data and test against set data.
        $matrixuserdata = $this->get_matrix_user_data($matrixrooms->roomid, $matrixuserid);
        $this->assertNotEmpty($matrixuserdata);
        $this->assertEquals("Samplefn Sampleln", $matrixuserdata->displayname);
    }
}
