import React, { useState, useEffect, useCallback } from 'react';

const MODEL_NAME = "gemini-1.5-flash-lite"; // Updated to current available model
const CLIENT_ID = "YOUR_GOOGLE_OAUTH_CLIENT_ID";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('main');
  const [apiKey, setApiKey] = useState(localStorage.getItem('foodlog_api_key') || '');
  const [sheetId, setSheetId] = useState(localStorage.getItem('foodlog_sheet_id') || '');
  const [input, setInput] = useState('');
  const [minutesOffset, setMinutesOffset] = useState(0);
  const [output, setOutput] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          const profile = JSON.parse(atob(response.credential.split('.')[1]));
          setUser({ name: profile.name, email: profile.email });
        }
      });
    };
    document.body.appendChild(script);
  }, []);

  const handleLogin = () => window.google.accounts.id.prompt();

  return (
    <div className="min-h-screen bg-zinc-50 p-4 font-sans text-zinc-900 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Foodlog</h1>
          <p className="text-xs text-zinc-500">Version 1.03</p>
        </div>
        <button onClick={() => setView(view === 'main' ? 'settings' : 'main')} className="text-sm border px-3 py-1 rounded">
          {user ? user.name : "Login"}
        </button>
      </header>

      {view === 'settings' ? (
        <div className="space-y-4">
          <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Gemini API Key" className="w-full p-2 border rounded" />
          <a href="https://lemonsqueezy.com/checkout/..." className="block text-center bg-zinc-800 text-white py-2 rounded">Donate via Lemon Squeezy</a>
          <button onClick={() => setView('main')} className="w-full bg-blue-600 text-white py-2 rounded">Go to App</button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex gap-2 items-center mb-4">
            <button onClick={() => setMinutesOffset(prev => prev + 15)} className="bg-zinc-100 px-2 py-1 rounded text-sm">
              {minutesOffset === 0 ? '[NOW]' : `${minutesOffset} min ago`}
            </button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-24 p-3 border rounded-xl mb-4" />
          <button onClick={() => {}} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">&gt;</button>
        </div>
      )}
    </div>
  );
}
