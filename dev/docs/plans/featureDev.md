  # Filename: featureDev.md
  # Version 0.2.1

## 1. Requirements
- Human to write requirement specs document. 
- Use internal AI assistance. 
- Don't let AI rewrite. 


## 2. Feature Development (per feature)

- Discuss the AI's plan first, unless the human-developer explicitly requested NQA (no questions asked) override. 
- Features define positive behavior only — failures belong in unit tests
- After user's closing remarks: give an ultra-short summary and ask if the discussion is complete
- Only the user closes a discussion — never infer; always confirm before moving on
- After approval: write the feature Gherkin file
- Discuss the Gherkin; when all topics are covered, request to proceed and wait for approval

## 3. Feature Implementation
- Discuss and ask before each step (unless batch mode is explicitly requested)
- Beep once after each step

**Steps:**
- **a.** Write step code calling future elements; stub elements fail with "Not implemented yet"
- **b.** Write unit tests; run them and confirm they fail as expected
- **c.** Implement the real feature code
- **d.** Run unit tests — all pass
- **e.** Run the Gherkin feature test — passes

**Unit test rules:**
- Verify module/component file exists
- Test error handling and graceful failure with simple and complex data — stubs must fail
- Summarize data-combination tests in a terse table, highlighting only failures and why

## 4. Gherkin
