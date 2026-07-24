# Developer Instructions: OAuth Setup & Lemon Squeezy Integration

## 1. Google OAuth 2.0 Setup

To enable user login and Google Sheets integration, configure a Google Cloud project and generate an OAuth Client ID.

### Steps for the Developer:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **Foodlog**.
3. Navigate to **APIs & Services** > **Library** and enable:
   * **Google Sheets API**
   * **Google Drive API** (for locating or creating the food log sheet)
4. Go to **APIs & Services** > **OAuth consent screen**:
   * Select **External**.
   * Fill in app name (`Foodlog`), support email, and developer contact.
   * Add required scopes: `https://www.googleapis.com/auth/spreadsheets`, `https://www.googleapis.com/auth/drive.file`.
5. Go to **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**:
   * Application type: **Web application**.
   * Name: `Foodlog Web Client`.
   * **Authorized JavaScript origins:** Add your development URL (`http://localhost:5173`) and production domain (e.g., your Cloudflare Pages URL).
   * **Authorized redirect URIs:** Add your authentication redirect endpoints if applicable.
6. Copy the generated **Client ID** and replace `YOUR_GOOGLE_OAUTH_CLIENT_ID` in `src/App.jsx`.

---

## 2. Lemon Squeezy Integration (Donateware)

To accept optional "Pay What You Want" donations as specified in the project requirements, configure a product and checkout link via Lemon Squeezy.

### Steps for the Developer:
1. Create or log into your account on [Lemon Squeezy](https://www.lemonsqueezy.com/).
2. Set up a **Store** configured for global tax compliance and payouts.
3. Create a new **Product**:
   * Name: `Foodlog Support` or `Voluntary Donation`.
   * Price Type: **Pay what you want** (with an optional minimum amount if desired).
4. Publish the product and generate a **Checkout URL**.
5. In `src/App.jsx` (within the settings view), update the anchor tag href with your official Lemon Squeezy checkout link:
   ```jsx
   <a href="[https://your-store.lemonsqueezy.com/checkout/buy/your-product-id](https://your-store.lemonsqueezy.com/checkout/buy/your-product-id)" target="_blank" rel="noopener noreferrer" className="block text-center bg-zinc-800 text-white py-2 rounded">
     Donate via Lemon Squeezy
   </a>
