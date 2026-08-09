### Filename instructions.md
File version 0.1.1

## 1. AI and developer interaction and methodology

1.1  Method: BDD, TDD, E2E testing

1.2 One feature at a time, not all cucumbers upfront

1.3 A discussion means the AI supplies its response in parts, with at most 10 lines of text each time, completing all topics discussed before asking if the user wishes to proceed.  

1.4 If the user brings up a concern during a discussion, that concern must be discussed separately until it is addressed to the user's satisfaction, after which the AI may ask if the user wishes to proceed. 

1.5  User approval is needed before any changes made to files, unless a direct request for that was given by the user. 

1.6 When the user requests a sequence of actions or more than one file to be changed, the AI must list the steps it will attempt to take without consent, along with marked checkboxes. The user will unmark steps that they want the AI to stop and ask before modifying code.  

1.7 "Consult the user" means calling out (beeping three times) asking for the human user's input, suggesting paths to proceed, and waiting for the user's response.  

## 2. Feature guided HumandAI Team development

Note: The term HumandAI Team is intentional as a trademark phrase, and not a spelling mistake. 

The Coding AI (Claude Code in this case) will assist the human user in the following order:  

### 2.1 Specs Doc
Create the requirement specifications document [This has been done].

### 2.2 Feature development

    For each feature:

        a. Discuss the AI's plan for the feature.  
        
        b. Once user replies to discussion ask for user approval to proceed.

        c. (After user approved) Create the feature Gherkin file.  

        d. Follow up with a discussion. 

        e. If from the user's response to the AI's discussion it seems everything topic has been covered, the AI requests to proceed, and waits for the user's approval. 

### 2.3 Feature implementation:
    
    - Before each of the following discuss, and then ask to proceed.   
    - After each of the following 

    a. create code that fails with not implemented yet
        (Or Ui elements that say Not Implemented yet)  

    b.  Create unit test(s) for the code  
        Run the test and see that fails (as expected)  

    c.  Create the actual code for the feature  
        Run unit test(s) and see that passed  

    d. Run the feature test (Gherkin) and see that it is implemented. 

### 2.4 Feature Gherkin writing instructions

The Gherkin files written with the assistance of Claude code should be

- Short, clear, and direct.
- Written with specific specifications and not generic ones, 
- Strictly follow the Requirement specifications document. 

Pre-discussion: Each Gherkin file should be discussed and approved by the developer before writing or changing it. (See section )

Discuss with the user after each file touched. 

## 3. Versions

Each file starts with a remarked header:  Filename: {filename}  Version: {version}
and a short description of the file's use

Any change to the file changes the iteration number. 

The current major and minor version are as listed in the config. 

The user (human developer) decides this, but before checking in and pushing consult with the user. 