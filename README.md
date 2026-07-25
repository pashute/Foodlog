# Foodlog

### File: README.md — Version 1.2.0

Log your meals easily

Foodlog is a lightweight, privacy-focused food logging web application that is completely free with no ads, and is fully open source. If you like it, you may voluntarily donate to support development. It stores information in your own Foodlog Google-sheet, which only you have access to, and for AI conversation uses your own Gemini API key (which is free to obtain), and processes your information exclusively through the Gemini Flash Lite model, meaning Google Gemini's standard privacy policies apply.

If you have any questions, problems, or feature requests, please reach out to the developer, Pashute, by opening an issue on [GitHub Issues](https://github.com/pashute/Foodlog/issues).

---

## How to Use It
1. Open the app and log in using your Google account to grant permission for Google Sheets tracking.
   
2. Select your time offset (e.g., `[NOW]` or a few minutes ago) if you are logging past meals.
   
3. Type the food description into the input box and submit it. The AI will ask you for more details to estimate the amount of carbs (in grams) which you may wish to supply, or simply log the text as is.

4. You food is logged in a Foodlog sheet in your Google drive. 

- A link to your Foodlog sheet is available in the app. 

---

## Settings
Access the settings view by clicking the settings/login button in the top right corner. Here you can configure:
* **Gemini API Key:** Enter your personal Gemini API key to power the parsing of your food notes.
* **Google Sheet ID:** Link the specific Google Sheet where your food logs will be recorded.
* **Donations:** Use the Lemon Squeezy link in the settings panel if you would like to make a voluntary contribution ([link-to-be-given-here]).

---

## Installation & Running Instructions

### Local Development
1. Clone the repository:
   ```bash
   git clone [https://github.com/pashute/Foodlog.git](https://github.com/pashute/Foodlog.git)
   cd Foodlog
