filename: ai.feature
version: 0.1.2

Feature: AI analysis and summary
  As the app user
  I enter partial meal information
  and wish the AI to assist me analyze, suggest, and summarize my meal entry
  
  @ai.analysis
  Scenario: AI analyzes meal information
    Given the user provides partial meal data
    When the user submits the meal
    Then the AI breaks down the meal entries into individual items
    And the AI looks at past patterns in the Foodlog sheet
    And the AI provides a suggested qty, size, and nutritional information for each item
    And formats each entry as json:
    { 
      "item": "cucumber",
      "stt": "guess", # or "set"
      { "details": {"qty": 1, "sz": "med"}},
      { "data": {"wgt": 200, "crb": 6, "cal": 28}},
      { "info": {"wgt": 100, "crb": 3, "cal": 14}}
    }
    
  @ai.summarize
  Scenario: AI summarizes meal information
    Given the user received a meal analysis
    When the user accepts the analysis
    Then the AI should provide a text summary of the meal entry 
    And the timestamp will take from the user's timezone and entry
    And the format will be comma separated, with no headers, just the values:
    | Header    | value                                                  |
    | Timestamp | `yyyy-mm-dd hh:mm DDD: `                               |
    | Totals    | [{total.carbs}, {total.calories}]                      |
    | Item      | {qty} {sz} {item}                                      |
    | Item Data | ({wgt}/100gr: {crb}/{info.crb}gr, {cal}/{info.cal}cal) |
    