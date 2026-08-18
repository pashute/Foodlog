Filename:  temporary file. Not important what its called. 
Version:  temporary file. Not important version

The Coding AI SHOULD NOT TOUCH THIS FILE

What needs to be fixed now

This temporary file, will be removed from git once development is done.

This list is for the developer, NOT for the AI Coder. 
AI Coder gets its instructions in the chat and works with the todo.md file

- AI should put a beep.ps1 in the Todo.md before each step
- When starting work on Todo.md step mark step as [>]
- Complete step and mark:
  - marking:  [v] - success, [!] - skipped (problem),  [?] need developer

---------  end of todo header -----------

# BATCH Aug 18 10:00 morning
# oauth fixes and other skipped fixes
- [ ] app-entry.feature — add crashed-state detection: data in storage on app
      start before any login was initiated -> silent login attempt
  - [ ] complete "Continued login after crash" scenario accordingly
  - Note: no tests, to be manually tried after this batch
  
Tauri and oauth batch
- [ ] implement tauri with prototype
- [ ] implemenmt production oauth in tauri
- [ ] set up and instruct the human developer to do a production test 
       and discuss results.


---


---
    
### Final  

#### version
 - [ ]  Version: major.minor digits are 0.1  Fix in all src files and docs. NOT talking about the app version stored in the config.
 - [ ]  Remove unit test for version number. This is not a part of the functionality but rather a programming issue. 

#### manual oauth testing
- [ ] make list in issues.md of ## Visual oauth scenarios and steps that cannot be tested
- [ ] change each scenario of those 
    - either "to be tested manually"
    - or make them a unit test. 

NOTE: production OAUTH itself should not be tested. it is not part of our code. But rather Google's. We just test consequences after human - non automated login. 

All testing setup for production must communicate with human and request login manually befor futher testing. 
 
#### Final testing
- [ ] Run full test:unit + test:ui suites

- [ ] Commit and push: "prototype done and tested"


