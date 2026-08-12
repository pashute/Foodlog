# Filename setup.feature  Version 0.1.0

Feature: screens/interaction/setup

  @setup.aiKey.missing
  Scenario: No AI key provided
    Given no Gemini API key is stored
    Then the AI API Key status LED is red
    And the instructions row shows "Gemini API key needed. See instructions"
    # Import instructions: see src/infrastructure/ai/ai.js
