'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState({
    env: {},
    location: '',
    userAgent: '',
    timestamp: '',
  });

  useEffect(() => {
    setDebugInfo({
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      },
      location: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Debug Information
        </h1>
        
        <div className="grid gap-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-2">
              <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
              <p><strong>Location:</strong> {debugInfo.location}</p>
              <p><strong>User Agent:</strong> {debugInfo.userAgent}</p>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(debugInfo.env, null, 2)}
            </pre>
          </div>

          {/* Test Components */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Component Tests</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">✅ This debug page is rendering correctly</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">✅ Tailwind CSS is working</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                <p className="text-purple-800">✅ Next.js client-side rendering is working</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Go to Homepage
              </a>
              <br />
              <a href="/products" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                View Products
              </a>
              <br />
              <a href="/cart" className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                View Cart
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
