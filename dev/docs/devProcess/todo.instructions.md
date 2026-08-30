/# Filename: todo.instructions.md
/# Version: 0.2.1

# Todo.md Instructions

- Give `# Batch <month> <day> <hh:mm>` header if none
- Write only headlines, in bulleted checkboxes  - [ ]
- Explicitly write `- beep.ps1` on a line before each step so you don't forget to beep before the step. 
- Use `callme.ps1` BEFORE a step that will need the user's attention or permission. 
- Mark step with `[>]` before you begin a step. Only one step can be marked as started. 
- Once done: 
    - Mark status: `[v]` = OK, `[V]` = already done, `[?]` = need user, `[!]` = skipped
- Unless explicitely stated, stop and discuss with the developer if a discussion was requested. Mark with `[?]` only after user agreed the discussion is finished, and only then continue on. 
- write `- callme.ps1` and execute it when batch done. 
- and ask what next. 
