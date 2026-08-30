scratch file with discussion details. 
please add to gitignore

1. for the new expo.auth.session across all platforms
   do i need a separate index.html than the one i now have?
Answer: 
Yes. you don't have one. 
New: `/auth` with `index.html`
Register callback in `console.cloud.google.com`. 
- ai and sheets access
- dev: limited to listed user(s)
- publish when going public to allow all google users

1.1 callback and client keys needed 
Web site / web app: 
  auth.web.clientKey.  for browser (expo-auth-session in web build)
  auth.web.redirect:  https://pashute.github.io/foodlog/auth/

Desktop app: 
    auth.desktop.clientKey // for Tauri
    auth.web.redirect:  foodlog://auth/

Android: 
    auth.android.clientKey // for EAS APK
    auth.phone.redirect:    com.foodlog://auth/

iOS:
    auth.ios.clientKey    // for EAS IPA  (future)
    auth.phone.redirect:    com.foodlog://auth/  // only one for both phone platforms. 

2. for the new secure and regular storage through Cloudfare  (for all platforms instead of separate tauri / eas / expo )
    What needs to be done?
Answer: 
Secure (encrypted KV):
POST/GET  /token/store   /token/get      Google refresh token
POST/GET  /key/store     /key/get        Gemini API key
POST/GET  /sheet/store   /sheet/get      Google Sheet ID

Non-secure (plain KV, separate namespace):
POST/GET  /config/store  /config/get     { theme, ...future config }
    

2. can i get the amount of people who donated?  

4. is the drive.file permission enough to allow creation of the Foodlogs folder and moving a newly created foodlog Google sheet into that folder (if accessing the folder and the file in it failed?)

Will it recognize the creator of the sheet as the Foodlog app? 
In other words If I have Foodlog1  and Foodlog2 apps and I logged in as user1@gmail.com  with permission to create and created it. 
Then logged into Foodlog2 as user1 - will i have access since the user1 created it, or is the Foodlog1 the accessor, TOGETHER with the logged in user  (because it will let me access THE USER's sheet in THE USER's drive). ?


