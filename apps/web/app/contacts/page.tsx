'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { Users, Mail, Phone } from 'lucide-react';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchContacts = async () => {
      try {
        const res = await api.get('/contacts');
        setContacts(res.data);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [router]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await api.get(`/contacts/search?q=${search}`);
      setContacts(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
            Add Contact
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Search
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <div key={contact._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{contact.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      contact.status === 'customer' ? 'bg-green-100 text-green-700' :
                      contact.status === 'prospect' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
