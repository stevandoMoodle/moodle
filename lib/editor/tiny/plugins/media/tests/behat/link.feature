@editor @editor_tiny @tiny_media @javascript @tiny_media_embed
Feature: Use the TinyMCE editor to upload a media link
  In order to work with media links
  As a user
  I need to be able to upload and manipulate media links

  Scenario: Clicking on the media button in the TinyMCE editor opens the dialog
    Given I log in as "admin"
    And I open my profile in edit mode
    When I click on the "Multimedia" button for the "Description" TinyMCE editor
    Then "Insert media" "dialogue" should exist

  # The following scenario covers:
  # 1. Add video using external link to a video file.
  # 2. Preview inserted video.
  # 3. Add custom thumbnail using the "Add via URL" input.
  # 5. Preivew embedded video in tiny.
  Scenario: Insert video from external link with custom thumbnail into TinyMCE editor
    Given I log in as "admin"
    And I open my profile in edit mode
    And I click on the "Multimedia" button for the "Description" TinyMCE editor
    Then "Insert media" "dialogue" should exist
    # Add video link using "Add via URL" input.
    And I set the field "Add via URL" to "https://media.geeksforgeeks.org/wp-content/uploads/20190616234019/Canvas.move_.mp4"
    When I click on "Add" "button" in the "Insert media" "dialogue"
    # Preview inserted video.
    Then "Media details" "dialogue" should exist
    And "tiny-insert-media" "region" should not exist in the "Media details" "dialogue"
    And "tiny-media-details-body" "region" should exist in the "Media details" "dialogue"
    And the field "Media title" in the "Media details" "dialogue" matches value "Canvas.move_"
    And "Add custom thumbnail" "button" should exist in the "Media details" "dialogue"
    And the field "Original size" in the "Media details" "dialogue" matches value "1"
    # Add custom thumbnail.
    And I click on "Add custom thumbnail" "button" in the "Media details" "dialogue"
    Then "Insert media thumbnail" "dialogue" should exist
    And "tiny-insert-media" "region" should exist
    And I set the field "Add via URL" to "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSouyQgYFwklkCFVWZZGwiZ1H9KxsHzS_HnPg&s"
    And "Add" "button" should exist in the "Insert media thumbnail" "dialogue"
    And I click on "Add" "button" in the "Insert media thumbnail" "dialogue"
    Then "Media thumbnail" "dialogue" should exist
    And "tiny-media-thumbnail-preview-footer" "region" should exist
    And "Next" "button" should exist in the "Media thumbnail" "dialogue"
    And I click on "Next" "button" in the "Media thumbnail" "dialogue"
    Then "Media details" "dialogue" should exist
    And I click on "Autoplay" "checkbox" in the "Media details" "dialogue"
    And I click on "Muted" "checkbox" in the "Media details" "dialogue"
    And I click on "Loop" "checkbox" in the "Media details" "dialogue"
    # Embed media into tiny and preview it by selecting it from tiny.
    And I click on "Save" "button"
    Then I select the "video" element in position "1" of the "Description" TinyMCE editor
    And I click on the "Multimedia" button for the "Description" TinyMCE editor
    Then "Media details" "dialogue" should exist
    And "tiny-insert-media" "region" should not exist in the "Media details" "dialogue"
    And "tiny-media-details-body" "region" should exist in the "Media details" "dialogue"
    And the field "Media title" in the "Media details" "dialogue" matches value "Canvas.move_"
    And "Add custom thumbnail" "button" should not exist in the "Media details" "dialogue"
    And "Change thumbnail" "button" should exist in the "Media details" "dialogue"
    And "Delete thumbnail" "button" should exist in the "Media details" "dialogue"
    And the field "Autoplay" in the "Media details" "dialogue" matches value "1"
    And the field "Muted" in the "Media details" "dialogue" matches value "1"
    And the field "Loop" in the "Media details" "dialogue" matches value "1"

  # The following scenario covers:
  # 1. Add audio using external link to an audio file.
  # 2. Preview inserted audio.
  # 3. Preview embedded audio in tiny.
  Scenario: Insert audio from external link into TinyMCE editor
    Given I log in as "admin"
    And I open my profile in edit mode
    And I click on the "Multimedia" button for the "Description" TinyMCE editor
    Then "Insert media" "dialogue" should exist
    # Add audio link using "Add via URL" input.
    And I set the field "Add via URL" to "https://media.geeksforgeeks.org/wp-content/uploads/20220913101124/audiosample.ogg"
    When I click on "Add" "button" in the "Insert media" "dialogue"
    # Preview inserted audio.
    Then "Media details" "dialogue" should exist
    And "tiny-insert-media" "region" should not exist in the "Media details" "dialogue"
    And "tiny-media-details-body" "region" should exist in the "Media details" "dialogue"
    And the field "Media title" in the "Media details" "dialogue" matches value "audiosample"
    And I click on "Autoplay" "checkbox" in the "Media details" "dialogue"
    And I click on "Muted" "checkbox" in the "Media details" "dialogue"
    And I click on "Loop" "checkbox" in the "Media details" "dialogue"
    # Embed media into tiny and preview it by selecting it from tiny.
    And I click on "Save" "button"
    Then I select the "audio" element in position "1" of the "Description" TinyMCE editor
    And I click on the "Multimedia" button for the "Description" TinyMCE editor
    Then "Media details" "dialogue" should exist
    And "tiny-insert-media" "region" should not exist in the "Media details" "dialogue"
    And "tiny-media-details-body" "region" should exist in the "Media details" "dialogue"
    And the field "Media title" in the "Media details" "dialogue" matches value "audiosample"
    And the field "Autoplay" in the "Media details" "dialogue" matches value "1"
    And the field "Muted" in the "Media details" "dialogue" matches value "1"
    And the field "Loop" in the "Media details" "dialogue" matches value "1"

  # The following scenario covers:
  # 1. Add YouTube link.
  # 2. Embed YouTube link as video.
  # 3. Preview embedded YouTube video link from tiny.
  # 4. Embed YouTube link as an audio.
  # 5. Preview embedded YouTube audio link from tiny.
  Scenario: Insert YouTube link into TinyMCE editor
    Given I log in as "admin"
    And I open my profile in edit mode
    And I click on the "Multimedia" button for the "Description" TinyMCE editor
    Then "Insert media" "dialogue" should exist
    # Add audio link using "Add via URL" input.
    And I set the field "Add via URL" to "https://www.youtube.com/watch?v=-fPTdIruJUU"
    And I click on "Add" "button" in the "Insert media" "dialogue"
    # Select how the link is embedded.
    Then "Select media type" "dialogue" should exist
    And "Audio" "button" should exist in the "Select media type" "dialogue"
    And "Video" "button" should exist in the "Select media type" "dialogue"
    And I click on "Video" "button" in the "Select media type" "dialogue"
    # Preview inserted link.
    Then "Media details" "dialogue" should exist
    And "tiny-insert-media" "region" should not exist in the "Media details" "dialogue"
    And "tiny-media-details-body" "region" should exist in the "Media details" "dialogue"
    And the field "Media title" in the "Media details" "dialogue" matches value ""
    And "Add custom thumbnail" "button" should exist in the "Media details" "dialogue"
    And I click on "Autoplay" "checkbox" in the "Media details" "dialogue"
    And I click on "Loop" "checkbox" in the "Media details" "dialogue"
    # Add custom thumbnail for link.
    And I click on "Add custom thumbnail" "button" in the "Media details" "dialogue"
    Then "Insert media thumbnail" "dialogue" should exist
    And "tiny-insert-media" "region" should exist
    And I set the field "Add via URL" to "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSouyQgYFwklkCFVWZZGwiZ1H9KxsHzS_HnPg&s"
    And "Add" "button" should exist in the "Insert media thumbnail" "dialogue"
    And I click on "Add" "button" in the "Insert media thumbnail" "dialogue"
    Then "Media thumbnail" "dialogue" should exist
    And "tiny-media-thumbnail-preview-footer" "region" should exist
    And "Next" "button" should exist in the "Media thumbnail" "dialogue"
    And I click on "Next" "button" in the "Media thumbnail" "dialogue"
    Then "Media details" "dialogue" should exist
    And "Add custom thumbnail" "button" should not exist in the "Media details" "dialogue"
    And "Change thumbnail" "button" should exist in the "Media details" "dialogue"
    And "Delete thumbnail" "button" should exist in the "Media details" "dialogue"
    # Embed link as video into tiny and preview it by selecting it from tiny.
    And I click on "Save" "button"
    Then I select the "video" element in position "1" of the "Description" TinyMCE editor
    And I click on the "Multimedia" button for the "Description" TinyMCE editor
    Then "Media details" "dialogue" should exist
    And "Select media type" "dialogue" should not exist in the "Media details" "dialogue"
    And the field "Media title" in the "Media details" "dialogue" matches value "youtube.com/watch?v=-fPTdIruJUU"
    And the field "Autoplay" in the "Media details" "dialogue" matches value "1"
    And the field "Muted" in the "Media details" "dialogue" matches value "1"
    And the field "Loop" in the "Media details" "dialogue" matches value "1"
    And I set the field "Media title" in the "Media details" "dialogue" to "Moodle video"
    And I click on "Save" "button" in the "Media details" "dialogue"
    Then I select the "video" element in position "1" of the "Description" TinyMCE editor
    And I click on the "Multimedia" button for the "Description" TinyMCE editor
    Then "Media details" "dialogue" should exist
    And the field "Media title" in the "Media details" "dialogue" matches value "Moodle video"
    # Delete previewed link.
    And I click on "Delete media" "button" in the "Media details" "dialogue"
    Then "Delete media" "dialogue" should exist
    And "Delete" "button" should exist in the "Delete media" "dialogue"
    And I click on "Delete" "button" in the "Delete media" "dialogue"
    Then "Insert media" "dialogue" should exist
    And "tiny-insert-media" "region" should exist in the "Insert media" "dialogue"
    # Let's add the same YouTube link.
    And I set the field "Add via URL" to "https://www.youtube.com/watch?v=-fPTdIruJUU"
    And I click on "Add" "button" in the "Insert media" "dialogue"
    # Select media modal is displayed due to inserting a new link.
    Then "Select media type" "dialogue" should exist
    And "Audio" "button" should exist in the "Select media type" "dialogue"
    And "Video" "button" should exist in the "Select media type" "dialogue"
    # Let's save the link as an audio.
    And I click on "Audio" "button" in the "Select media type" "dialogue"
    Then "Media details" "dialogue" should exist
    And "tiny-insert-media" "region" should not exist in the "Media details" "dialogue"
    And "tiny-media-details-body" "region" should exist in the "Media details" "dialogue"
    And the field "Media title" in the "Media details" "dialogue" matches value ""
    And "Add custom thumbnail" "button" should not exist in the "Media details" "dialogue"
    And "Change thumbnail" "button" should not exist in the "Media details" "dialogue"
    And "Delete thumbnail" "button" should not exist in the "Media details" "dialogue"
    # Controls are reset on new link insert.
    And the field "Autoplay" in the "Media details" "dialogue" matches value "0"
    And the field "Muted" in the "Media details" "dialogue" matches value "0"
    And the field "Loop" in the "Media details" "dialogue" matches value "0"
    And "Original size" "radio" should not exist in the "Media details" "dialogue"
    And "Custom size" "radio" should not exist in the "Media details" "dialogue"
    And I click on "Save" "button" in the "Media details" "dialogue"
