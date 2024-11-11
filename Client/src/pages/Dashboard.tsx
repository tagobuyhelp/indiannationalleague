import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import AddMemberModal from '../components/AddMemberModal';
import { API_BASE_URL } from '../config/api';

interface DashboardMetrics {
  totalMembers: number;
  totalRevenue: number;
  totalTransactions: number;
  totalDonations: number;
  memberGrowth: number;
  revenueGrowth: number;
  transactionGrowth: number;
  donationGrowth: number;
}

interface Transaction {
  _id: string;
  memberId: string;
  transactionId: string;
  transactionType: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
}

interface Member {
  _id: string;
  createdAt: string;
}

interface Donation {
  _id: string;
  amount: number;
  createdAt: string;
  paymentStatus: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMembers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    totalDonations: 0,
    memberGrowth: 0,
    revenueGrowth: 0,
    transactionGrowth: 0,
    donationGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllMetrics();
  }, [selectedPeriod]);

  const getDateRange = () => {
    const now = new Date();
    const periodDays = parseInt(selectedPeriod);
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    if (selectedPeriod === 'this-year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
      previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
    } else if (selectedPeriod === 'previous-year') {
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      previousStartDate = new Date(now.getFullYear() - 2, 0, 1);
      previousEndDate = new Date(now.getFullYear() - 2, 11, 31);
    } else {
      startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
      previousStartDate = new Date(startDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));
      previousEndDate = startDate;
    }

    return { startDate, previousStartDate, previousEndDate };
  };

  const fetchAllMetrics = async () => {
    try {
      setIsLoading(true);
      const [membersResponse, transactionsResponse, donationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/member`),
        fetch(`${API_BASE_URL}/transaction`),
        fetch(`${API_BASE_URL}/donations`)
      ]);

      if (!membersResponse.ok || !transactionsResponse.ok || !donationsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const membersData = await membersResponse.json();
      const transactionsData = await transactionsResponse.json();
      const donationsData = await donationsResponse.json();

      calculateMetrics(
        membersData.message.data,
        transactionsData.data.transactions,
        donationsData.data
      );
      setError(null);
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (members: Member[], transactions: Transaction[], donations: Donation[]) => {
    const { startDate, previousStartDate, previousEndDate } = getDateRange();

    // Current period calculations
    const currentMembers = members.filter(m => new Date(m.createdAt) >= startDate);
    const currentTransactions = transactions.filter(t => 
      new Date(t.createdAt) >= startDate && t.paymentStatus === 'completed'
    );
    const currentDonations = donations.filter(d => 
      new Date(d.createdAt) >= startDate && d.paymentStatus === 'completed'
    );

    // Previous period calculations
    const previousMembers = members.filter(m => 
      new Date(m.createdAt) >= previousStartDate && new Date(m.createdAt) <= previousEndDate
    );
    const previousTransactions = transactions.filter(t => 
      new Date(t.createdAt) >= previousStartDate && 
      new Date(t.createdAt) <= previousEndDate && 
      t.paymentStatus === 'completed'
    );
    const previousDonations = donations.filter(d => 
      new Date(d.createdAt) >= previousStartDate && 
      new Date(d.createdAt) <= previousEndDate && 
      d.paymentStatus === 'completed'
    );

    // Calculate current metrics
    const currentRevenue = currentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const currentDonationsAmount = currentDonations.reduce((sum, d) => sum + d.amount, 0);

    // Calculate previous metrics
    const previousRevenue = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
    const previousDonationsAmount = previousDonations.reduce((sum, d) => sum + d.amount, 0);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    setMetrics({
      totalMembers: currentMembers.length,
      totalRevenue: currentRevenue + currentDonationsAmount,
      totalTransactions: currentTransactions.length,
      totalDonations: currentDonations.length,
      memberGrowth: calculateGrowth(currentMembers.length, previousMembers.length),
      revenueGrowth: calculateGrowth(
        currentRevenue + currentDonationsAmount,
        previousRevenue + previousDonationsAmount
      ),
      transactionGrowth: calculateGrowth(currentTransactions.length, previousTransactions.length),
      donationGrowth: calculateGrowth(currentDonations.length, previousDonations.length)
    });
  };

  const handleAddMember = (data: any) => {
    console.log('New member data:', data);
    setIsAddMemberModalOpen(false);
  };

  const handleNewTransaction = () => {
    navigate('/transactions');
  };

  const handleGenerateReport = () => {
    const csvContent = [
      'Metric,Value,Growth',
      `Total Members,${metrics.totalMembers},${metrics.memberGrowth}%`,
      `Total Revenue,₹${metrics.totalRevenue},${metrics.revenueGrowth}%`,
      `Total Transactions,${metrics.totalTransactions},${metrics.transactionGrowth}%`,
      `Total Donations,${metrics.totalDonations},${metrics.donationGrowth}%`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendNewsletter = () => {
    navigate('/notices');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-600">{error}</div>;
  }

  const stats = [
    { 
      icon: Users, 
      title: 'Total Members', 
      value: metrics.totalMembers.toLocaleString(), 
      change: `${metrics.memberGrowth >= 0 ? '+' : ''}${metrics.memberGrowth.toFixed(1)}% from previous period` 
    },
    { 
      icon: DollarSign, 
      title: 'Total Revenue', 
      value: `₹${metrics.totalRevenue.toLocaleString()}`, 
      change: `${metrics.revenueGrowth >= 0 ? '+' : ''}${metrics.revenueGrowth.toFixed(1)}% from previous period` 
    },
    { 
      icon: ShoppingCart, 
      title: 'Total Transactions', 
      value: metrics.totalTransactions.toLocaleString(), 
      change: `${metrics.transactionGrowth >= 0 ? '+' : ''}${metrics.transactionGrowth.toFixed(1)}% from previous period` 
    },
    { 
      icon: TrendingUp, 
      title: 'Total Donations', 
      value: metrics.totalDonations.toLocaleString(), 
      change: `${metrics.donationGrowth >= 0 ? '+' : ''}${metrics.donationGrowth.toFixed(1)}% from previous period` 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <select 
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="this-year">This Year</option>
            <option value="previous-year">Previous Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                  <div>
                    <p className="font-medium">New member registered</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <p className="font-medium">Add Member</p>
              <p className="text-sm text-gray-500">Register new member</p>
            </button>
            <button
              onClick={handleNewTransaction}
              className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <p className="font-medium">New Transaction</p>
              <p className="text-sm text-gray-500">Record payment</p>
            </button>
            <button
              onClick={handleGenerateReport}
              className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <p className="font-medium">Generate Report</p>
              <p className="text-sm text-gray-500">Download statistics</p>
            </button>
            <button
              onClick={handleSendNewsletter}
              className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <p className="font-medium">Send Newsletter</p>
              <p className="text-sm text-gray-500">Compose update</p>
            </button>
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, change }: { icon: any, title: string, value: string, change: string }) => (
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
    <p className={`mt-2 text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
  </div>
);

export default Dashboard;