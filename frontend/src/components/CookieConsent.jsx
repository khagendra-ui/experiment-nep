import React, { useEffect, useState } from 'react';

const COOKIE_KEY = 'nepsafe_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem(COOKIE_KEY);
    if (choice === null) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'true');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 bg-white border shadow-lg rounded-lg p-4 z-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-3 md:mb-0">
          <div className="font-semibold">We use cookies</div>
          <div className="text-sm text-gray-600">We use cookies to improve your experience. You can accept or decline non-essential cookies.</div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={decline}>Decline</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={accept}>Accept</button>
        </div>
      </div>
    </div>
  );
}
