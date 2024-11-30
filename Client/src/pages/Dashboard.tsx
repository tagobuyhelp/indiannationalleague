import React, { useState, useEffect } from 'react';
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import AddMemberModal from '../components/AddMemberModal';
import { API_BASE_URL } from '../config/api';

interface Member {
  _id: string;
  memberId: string;
  fullname: string;
  membershipType: string;
  state: string;
  createdAt: string;
}

interface Transaction {
  _id: string;
  amount: number;
  createdAt: string;
  paymentStatus: string;
}

interface Donation {
  _id: string;
  amount: number;
  createdAt: string;
  paymentStatus: string;
}

const Dashboard = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [membersRes, transactionsRes, donationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/member`),
        fetch(`${API_BASE_URL}/transaction`),
        fetch(`${API_BASE_URL}/donations`)
      ]);

      const membersData = await membersRes.json();
      const transactionsData = await transactionsRes.json();
      const donationsData = await donationsRes.json();

      setMembers(membersData.message.data || []);
      setTransactions(transactionsData.data.transactions || []);
      setDonations(donationsData.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMembershipStats = () => {
    const total = members.length;
    const active = members.filter(m => m.membershipType === 'active').length;
    const general = members.filter(m => m.membershipType === 'general').length;
    
    return {
      total,
      active,
      general,
      activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) : '0',
      generalPercentage: total > 0 ? ((general / total) * 100).toFixed(1) : '0'
    };
  };

  const calculateStateDistribution = () => {
    const distribution = members.reduce((acc: { [key: string]: number }, member) => {
      acc[member.state] = (acc[member.state] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getRecentActivity = () => {
    const allActivity = [
      ...members.map(m => ({
        type: 'member',
        date: new Date(m.createdAt),
        text: `New member registered: ${m.fullname}`
      })),
      ...transactions.filter(t => t.paymentStatus === 'completed').map(t => ({
        type: 'transaction',
        date: new Date(t.createdAt),
        text: `Payment received: ₹${t.amount}`
      })),
      ...donations.filter(d => d.paymentStatus === 'completed').map(d => ({
        type: 'donation',
        date: new Date(d.createdAt),
        text: `New donation: ₹${d.amount}`
      }))
    ];

    return allActivity
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  const membershipStats = calculateMembershipStats();
  const stateDistribution = calculateStateDistribution();
  const recentActivity = getRecentActivity();

  const stats = [
    { 
      icon: Users, 
      title: 'Total Members', 
      value: membershipStats.total.toLocaleString()
    },
    { 
      icon: DollarSign, 
      title: 'Total Revenue', 
      value: `₹${transactions.reduce((sum, t) => sum + (t.paymentStatus === 'completed' ? t.amount : 0), 0).toLocaleString()}`
    },
    { 
      icon: ShoppingCart, 
      title: 'Total Transactions', 
      value: transactions.filter(t => t.paymentStatus === 'completed').length.toLocaleString()
    },
    { 
      icon: TrendingUp, 
      title: 'Total Donations', 
      value: donations.filter(d => d.paymentStatus === 'completed').length.toLocaleString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-6">State-wise Distribution</h2>
          <div className="space-y-4">
            {stateDistribution.map(([state, count]) => (
              <div key={state}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{state}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(count / members.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Membership Overview</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Active Members</span>
                <span className="text-sm font-medium text-gray-900">{membershipStats.active}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${membershipStats.activePercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {membershipStats.activePercentage}% of total members
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">General Members</span>
                <span className="text-sm font-medium text-gray-900">{membershipStats.general}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${membershipStats.generalPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {membershipStats.generalPercentage}% of total members
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{membershipStats.total}</div>
                  <div className="text-sm text-gray-500">Total Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {membershipStats.activePercentage}%
                  </div>
                  <div className="text-sm text-gray-500">Active Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'member' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'transaction' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'member' ? <Users className="w-5 h-5" /> :
                   activity.type === 'transaction' ? <DollarSign className="w-5 h-5" /> :
                   <TrendingUp className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium">{activity.text}</p>
                  <p className="text-sm text-gray-500">
                    {activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await fetch(`${API_BASE_URL}/member/register`, {
              method: 'POST',
              body: data
            });
            setIsAddMemberModalOpen(false);
            fetchDashboardData();
          } catch (error) {
            console.error('Error adding member:', error);
          }
        }}
      />
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value }: { icon: any, title: string, value: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className="bg-blue-50 p-3 rounded-full">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
    </div>
  </div>
);

export default Dashboard;