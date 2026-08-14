# Filename: phonePanel.feature  Version 0.1.0
# Web-only phone-shaped frame around the app (screens/layout/phonePanel)

Feature: screens/layout/phonePanel

  @phonePanel.web
  Scenario: Web build is framed like a phone
    Given the app is running on the web platform
    Then the app content is wrapped in a fixed-size phone-shaped panel
    And the panel has rounded corners and a border like a device frame
    And the page background behind the panel is dark

  @phonePanel.native
  Scenario: Native builds are not framed
    Given the app is running on Android or iOS
    Then the app content fills the screen with no phone panel wrapper
