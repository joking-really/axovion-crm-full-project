'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import { MessageSquare, Users, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Conversations"
                value={stats?.totalConversations || 0}
                icon={<MessageSquare className="w-6 h-6" />}
                trend="+12%"
              />
              <StatCard
                title="Contacts"
                value={stats?.totalContacts || 0}
                icon={<Users className="w-6 h-6" />}
                trend="+5%"
              />
              <StatCard
                title="AI Interactions"
                value={stats?.aiInteractions || 0}
                icon={<TrendingUp className="w-6 h-6" />}
                trend="+23%"
              />
              <StatCard
                title="Avg Response Time"
                value={`${Math.round(stats?.avgResponseTime || 0)}s`}
                icon={<Clock className="w-6 h-6" />}
                trend="-8%"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <p className="text-gray-500">Activity feed coming soon...</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-primary-50 rounded-lg hover:bg-primary-100">
                    New Conversation
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-primary-50 rounded-lg hover:bg-primary-100">
                    Add Contact
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-primary-50 rounded-lg hover:bg-primary-100">
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
