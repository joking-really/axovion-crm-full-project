'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="flex gap-6">
          <div className="w-48 space-y-1">
            {['general', 'team', 'billing', 'integrations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2 rounded-lg capitalize ${
                  activeTab === tab
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white p-6 rounded-lg shadow">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">General Settings</h2>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Timezone
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>UTC</option>
                    <option>Asia/Karachi</option>
                    <option>Asia/Dubai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Language
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>English</option>
                    <option>Urdu</option>
                  </select>
                </div>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Team Members</h2>
                <p className="text-gray-500">Team management coming soon...</p>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Billing</h2>
                <p className="text-gray-500">Billing management coming soon...</p>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Integrations</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Twilio</h3>
                      <p className="text-sm text-gray-500">Voice & SMS</p>
                    </div>
                    <span className="text-green-600 text-sm font-medium">
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">WhatsApp Business</h3>
                      <p className="text-sm text-gray-500">Messaging</p>
                    </div>
                    <span className="text-green-600 text-sm font-medium">
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Stripe</h3>
                      <p className="text-sm text-gray-500">Payments</p>
                    </div>
                    <span className="text-green-600 text-sm font-medium">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
