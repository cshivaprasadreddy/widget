'use client';

import { useEffect } from 'react';

export default function TestWidget() {
  useEffect(() => {
    // Load the widget script
    const script = document.createElement('script');
    script.src = '/reviews-widget.js';
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', background: '#f3f3f3' }}>
      <h1>Google Reviews Widget Demo</h1>
      
      {/* Widget Usage */}
      <div 
        className="google-reviews-widget" 
        data-place-id="ChIJncDH9p6RyzsRcbwTEbh1MeA" 
        data-width="700px" 
        data-height="600px"
      ></div>
    </div>
  );
}
