# Filename oauth.feature  Version 0.1.0

Feature: infrastructure/oauth

  Scenario: Default logged-out state
    Then isLoggedIn is false
