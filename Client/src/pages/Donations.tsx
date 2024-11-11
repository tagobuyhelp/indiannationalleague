import React, { useState, useEffect } from 'react';
import { Download, Search, Printer } from 'lucide-react';
import DonationRow from '../components/DonationRow';
import DonationPrintLayout from '../components/DonationPrintLayout';
import { API_BASE_URL } from '../config/api';

interface Donation {
  _id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  paymentStatus: string;
  transactionId: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DonationResponse {
  statusCode: number;
  data: Donation[];
  message: string;
  success: boolean;
}

const Donations = () => {
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/donations`);
      if (!response.ok) {
        throw new Error('Failed to fetch donations');
      }
      const data: DonationResponse = await response.json();
      setDonations(data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch donations');
      console.error('Error fetching donations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donorPhone.includes(searchTerm) ||
                         donation.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || donation.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
  const completedAmount = filteredDonations
    .filter(d => d.paymentStatus === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);
  const pendingAmount = totalAmount - completedAmount;

  const handlePrintList = () => {
    setSelectedDonation(null);
    window.print();
  };

  const handlePrintSingle = (donation: Donation) => {
    setSelectedDonation(donation);
    window.print();
  };

  const handleExport = () => {
    const csvData = filteredDonations.map(donation => ({
      'Transaction ID': donation.transactionId,
      'Donor Name': donation.isAnonymous ? 'Anonymous' : donation.donorName,
      'Email': donation.donorEmail,
      'Phone': donation.donorPhone,
      'Amount': `₹${donation.amount.toFixed(2)}`,
      'Status': donation.paymentStatus,
      'Date': new Date(donation.createdAt).toLocaleDateString(),
      'Anonymous': donation.isAnonymous ? 'Yes' : 'No'
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-600">{error}</div>;
  }

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
          <div className="flex space-x-3">
            <button
              onClick={handlePrintList}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 border border-gray-300 hover:bg-gray-50"
            >
              <Printer className="w-5 h-5" />
              <span>Print List</span>
            </button>
            <button 
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Total Donations</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Completed</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{completedAmount.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Pending</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search donations..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64"
                />
              </div>
              <div className="flex space-x-3">
                <select 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <DonationRow 
                    key={donation._id} 
                    donation={donation}
                    onPrint={() => handlePrintSingle(donation)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredDonations.length} of {donations.length} donations
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm" disabled>Previous</button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm" disabled>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <DonationPrintLayout
          donations={selectedDonation ? [selectedDonation] : filteredDonations}
          type={selectedDonation ? 'single' : 'list'}
        />
      </div>
    </>
  );
};

export default Donations;