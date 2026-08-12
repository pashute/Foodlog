### Filename instructions.md
File version 0.1.4

AI should not touch this file without explicit permission and may change only one section at a time before asking again for permission !!

## 0. Beeping

- 0.1 Every batch of actions starts with a beep.
- 0.2 Beep by running a PowerShell **script file** (not an inline command):
  - `& "./dev/testing/beep.ps1"` — a single beep. Use to start a batch.
  - beep twice when finished successfully.
  - `& "./dev/testing/callme.ps1"` — three stepped beeps. Use if you need the user, BEFORE the action that will prompt the user for permission.
- 0.3 Use `callme.ps1` also if an error occurred.


## 1. AI and developer interaction and methodology

1.1  Method: BDD, TDD, E2E testing  

1.2 One feature at a time, not all cucumbers upfront

1.3 Discussions

1.3.1 A discussion means the AI supplies its response in parts, with at most 10 lines of text each time, completing all topics discussed before asking if the user wishes to proceed.  

1.3.2 A discussion means that the AI is attentive, wanting to know how the user responded, with subtext:  What KINDS of changes should the AI make to its responses.  There should be no guessing here. If there is a possibility that things can be done differently ask the user-developer what they think. 

1.4 If the user brings up a concern during a discussion, that concern must be discussed separately until it is addressed to the user's satisfaction, after which the AI may ask if the user wishes to proceed back on track. 

1.5  User approval is needed before any changes are made to files, unless a direct request for that was given by the user. 

1.6 Action sequences:

1.6.1 When the user requests a sequence of actions or more than one file to be changed, the AI must list the steps it will attempt to take without consent, along with marked checkboxes. The user will unmark steps that they want the AI to stop and ask before modifying code.  

1.6.2 If the sequence is very long and includes complex steps the AI should break it down into batches of smaller sequences, request from the user a place write them down in a temporary file, and deal with a todo list in memory of only one small batch. 

1.7 "Consult the user" means calling out (beeping three times) asking for the human user's input, suggesting paths to proceed, and waiting for the user's response.  

1.8 "

## 2. Feature guided HumandAI Team development

Note: The term HumandAI Team is intentional as a trademark phrase, and not a spelling mistake. 

The Coding AI (Claude Code in this case) will assist the human user in the following order:  

### 2.1 Specs Doc
Create the requirement specifications document [This has been done].

### 2.2 Feature development

    For each feature:

        a. Discuss the AI's plan for the feature.  
        
        Note: Features are not unit tests. They only define positively and do not check failures, unless that is explicitly part of the feature. Failures will be checked and dealt with in the unit tests. 
        
        b. Once the user replies to a discussion with closing remarks, the AI can give an extremely short summary of the discussion according to the nuances learned from the user, and may ask if the discussion was completed?  
        
        c. Only if the human user closes the discussion is it considered complete and the AI may then move on to the next item. The AI should never infer this but ask explicitly or confirm it with the user, before moving on.

        c. (After user approved) Create the feature Gherkin file.  

        d. Follow up with a discussion. 

        e. If from the user's response to the AI's discussion it seems every topic discussed by both sides has been covered, the AI requests to proceed, and waits for the user's approval. 

### 2.3 Feature implementation:
    
    - Before each of the following discuss, and then ask to proceed.   
    - After each of the following 

    a. create code that fails with not implemented yet
        (Or Ui elements that say Not Implemented yet)  

    b.  Create unit tests for the code.
        Run the tests and see that they fails (as expected)  

        Unit test Notes:   
        - 1. Unit tests should check the existence of the module file or component.  
        - 2. Unit tests should test for error handling and graceful failure, and try with combinations of data that should fail, or complex combinations of data.  
        - 3. Unit tests should try to combine testing of data combinations into a table summarizing what was tested extremely tersely and emphasizing only what failed and why. 

    c.  Create the actual code for the feature.
        Run the unit tests and see that they all passed.

    d. Run the feature test (Gherkin) and see that it is implemented. 

### 2.4 Feature Gherkin writing instructions

2.4.1 concise: The Gherkin files written with the assistance of Claude code should be

- Short, clear, and direct.
- Written with specific specifications and not generic ones, 
- Strictly follow the Requirement specifications document. 

2.4.2 Discussions

Pre-discussion: Each Gherkin file should be discussed and approved by the developer before writing or changing it. (See section )

Discuss with the user after each feature file was touched. 

2.4.3 Missing dependencies. 

When a feature is developed and it depends on other features not developed yet, it should be written with Not Implemented Yet and expected to fail.  

When implementing the feature, a unit test setup calling the dependency should also fail as expected. 
The rest of the unit test will abort due to this. 

Once the new depended-on feature was completed it should be called by the caller. The feature test and the unit test setup with all its sub-tests should be run and should now succeed.

## 3. Versions

The version number is {major}.{minor}.{iteration}

Each file starts with a remarked header on three lines:  Filename: {filename}  
Version: {version}
and a short description of the file's use

The Markdown and yaml files should have: 
   # Filename: {filename}
   # Version: {version}
   # {description}

.js files should have 
// Filename: {filename}
// Version: {version}
// {description}

html files should have under the <html5> tags
<!DOCTYPE html>
<html lang="en">
<!-- 
  Filename: {filename}
  Version: {version}
  Description: {description}
-->
<head>  etc...

Any change to the file changes the iteration number. 

The current major and minor version are as listed in the config. 

The user (human developer) decides this, but before checking in and pushing consult with the user. 