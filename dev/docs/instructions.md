### Filename instructions.md
File version 0.1.7

AI may not change a thing in this file without explicit permission and may change only one section at a time before asking again for permission !!

AIs memory should contain according to this file the topics: 
- beep and callme: how and when. 
- version iteration increment 0.3.0 -> 0.3.1  
- dev listing:  issue and todo writing with beeps [>] and discussions
- dev implementing: feature, empty-element, feature wiring, failed test, element filled, testing success, checking feature success, tick ok.
- dev-step done:  [!] -problem so skipped. or [v] success  or [?] need discussion.

- fix-batch close: run e2e, commit and push, [close issue if instructed]\
- discuss or skip - if instructed. 

## 0. Beeping

In order for the developer to be alerted, the ai will use a beep, but not one which will bring up a permission-request alert, which the developer will not hear.  To overcome that:  

In claude settings the human developer gave `Permissions/allow` for: 
- "PowerShell(& \"c:\\dev\\myProjects\\Foodlog\\dev\\testing\\beep.ps1\")",
- "PowerShell(& \"c:\\dev\\myProjects\\Foodlog\\dev\\testing\\callme.ps1\")

`beep.ps1` - beeps once. `callme.ps1` - beeps 3 times in a stepped pattern. 

- 0.1 Every batch of actions starts with a beep, and every ai action inside the batch starts with a beep. 
- 0.2 Beep by running the PowerShell **script files** (not an inline [Console]::Beep command) so that the developer hears the beep and won't have to first give it permission to run. 

- 0.3  For alerts warnings and errors: 
- AI Code should use `callme.ps1` every time it need's the user's (the developer's) interaction or it wants the user's response.
- AI Code should use `callme.ps1` BEFORE an action that will prompt the user for permission. Otherwise the user will not hear the callme, and will see the permission request to run `callme` instead. 
- AI Code should Use `callme.ps1` if an error occurred. 
- Permission avoidance:  When AI code calls bash or powershell command, first check the local user's .claude\settings.json that no permission popup will be called by the system, and if there will be a permission request first run callme to alert the user. 

## 1. AI and developer interaction and methodology

1.1  Method: BDD, TDD, E2E testing  

1.2 One feature at a time, not all cucumbers upfront

1.3 Discussions

1.3.1 A discussion means the AI supplies its response in parts, with at most 10 lines of text each time, completing all topics discussed before asking if the user wishes to proceed.  

1.3.2 A discussion means that the AI is attentive, wanting to know how the user responded, with subtext:  What KINDS of changes should the AI make to its responses.  There should be no guessing here. If there is a possibility that things can be done differently ask the user-developer what they think. 

1.4 If the user brings up a concern during a discussion, that concern must be discussed separately until it is addressed to the user's satisfaction, after which the AI may ask if the user wishes to proceed back on track. 

1.5  User approval is needed before any changes are made to files, unless a direct request for that was given by the user. 

1.6 Action sequences:

1.6.1 NQA (no questions asked) 
When the user requests a sequence of actions or more than one file to be changed, the AI must list these steps that it will attempt to take without consent in the todo file. along with marked NQA checkboxes. The human user-developer will unmark steps that they want the AI to stop and ask before modifying code.  

1.6.2 Batches breakup
If the sequence is very long and includes complex steps the AI should break it down into batches of smaller sequences, and clearly mark next batches. Request from the user to remove the future batches to a temporary file, and deal only with a short todo list in memory, one batch at a time.

1.7 "Consult the user" means calling out (beeping three times) asking for the human user's input, suggesting paths to proceed, and waiting for the user's response.  

1.8 "

## 2. Feature guided HumandAI Team development

Note: The term HumandAI Team is intentional as a trademark phrase, and not a spelling mistake. 

The Coding AI (Claude Code in this case) will assist the human user in the following order:  

### 2.1 Specs Doc
Feature development and implementation:  see featureDev.md

2.4.2 Discussions

Discuss with the human user-developer after each feature file was touched. 

2.4.3 Missing dependencies. 

When a feature is developed and it depends on other features not developed yet, the missing feature should have a stub  Not Implemented Yet and expected to fail.  

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
i.e.  0.1.2 -> 0.1.3,   and 0.2.0 -> 0.2.1. 

The current major and minor version are as listed in the config. 

The user (human developer) decides which major and minor to use, and ai should not change those on its own, but may suggest it to the user in a discussion as appropriate values. 