The Coding AI SHOULD NOT TOUCH THIS FILE

What needs to be fixed now

This temporary file, will be removed from git once development is done.

You do not change anything until discussed and approved. Only consult. Remember the instructions.md. 
-------------------------------------------------

1. commit and push all changes relating to issue 2 e2e tests. with link in message. Then close the issue with remark: e2e added  to project. See [commit number ??](link to commit)

2. tauri out of scope for this iteration. issue 3 
we'll get back to it. 

2. a. add following fixes to issue 3 (headlines only as usual), 

b. add fix headlines as checkbox bullets in todo with a beep instruction before each. 

3. fix and mark done as you progress. 
beep before each step
if there's something that will need my permission first run callme
before you do the instruction, so that I hear the call. 
no discussions. just do it all. 

4. features are all without 

-------------------
 1. Settings works perfectly except open in google sheets is not a link and doesn't open mock sheet. 
fix that for real link to drive 
opens in browser in real and mock. except that in mock has the fake html link run by local http server for mock files that we set up in the features. for real, opens the foodlog in the drive.   

2.  google privacy link should link to #intro in their site

3. I don't like the mock of the diary. I'm changing a bit the real feature and the mock feature: 

4. write prototype diaryEntry  
a. in features/screens/interaction 
   chage name from diary.feature to diaryEntry.feature. 

b.  on error, ai error text instead of food list

c.  each analyzed food record has checkbox button to accept.
    if there's a guess the checkbox is not ticked. 
    Checking it accepts the guess. 

    if there was no guess for the item the checkbox is ticked. 
    Unchecking it marks it as a guess. 

d. The buttons enabled after submit are: `Fix`, `Accept All`, `Save`, `Discard`

d1. accept all marks all as accepted. 
d2. Pressing Fix:
  disables buttons. Clears memory. Clears analyzed food records and totals
  keeps timestamp in memory. takes current listed timestamp and updates minutes ago from current time, so time on screen hh:mm continues showing same hour as first submit

   sends back to text entry, but with modified string from analysis
      eg. cucumber yogurt ->  (totX gr, totY cal): 1 med? Cucumber (x gr: y crb, z cal), 1 cup Goats? Yogurt (i gr: j crb, k cal)

d3. Save button pressed:  Append new record to sheet from current 
   takes current object with all info (including timestamp)
      and stores in sheet or mock sheet. 
      popup:  record recorded ok. 
      clear all form to initialized now. zero minutes ago. shows current time. 

d4. discard  - intializes clear form with time now and zero minutes before. 

b. in prototype.feature write @diaryEntry scenario write using mock data, by listing the intended input in a placeholder.  

5. unit test for each step of sequence with input data and output result. the mock code as follows: 
   Take from ai feature scenario and write the mock input text and output record. 

5.0 before input, textbox empty with short mock text in placeholder.  submit button disabled till text entered

5.1 submit not canned: anything not the canned text: 
error text ("AI error occured. Please contact support@foodlog.com")
  shows in place of food list

5.2  submit canned text: see ai mock feature. should return guess mode analyzed object. 
should be shown in suggested list through regular activity, 
should enable: [fix], [accept all] [save] [discard] buttons.  

pressing the buttons should do as defined for each:
  fix - sets meal text analyzed, clears records, sets minutesBefore, 
  save - to sheet and clears all
  accept - accepts all records. unmarks records. removes text question marks
  discard - clears
  submit - sends text to analysis returns record

Or end to end test with the mock data. in protoype mode. 

Make tests easily readable and short so human can grasp at a glance. 



6. commit and checkin as diary sequence update

