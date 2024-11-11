import React, { useState, useEffect } from 'react';
import { Download, Search, Printer } from 'lucide-react';
import MembershipRow from '../components/MembershipRow';
import MembershipPrintLayout from '../components/MembershipPrintLayout';
import { API_BASE_URL } from '../config/api';

interface Transaction {
  _id: string;
  memberId: string;
  transactionId: string;
  transactionType: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface Membership {
  _id: string;
  memberId: string;
  email: string;
  phone: string;
  transaction: Transaction;
  type: string;
  fee: number;
  validity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface MembershipResponse {
  statusCode: number;
  data: {
    memberships: Membership[];
    total: number;
    page: number;
    pages: number;
  };
  message: string;
  success: boolean;
}

const Memberships = () => {
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/memberships`);
      if (!response.ok) {
        throw new Error('Failed to fetch memberships');
      }
      const data: MembershipResponse = await response.json();
      setMemberships(data.data.memberships);
      setError(null);
    } catch (err) {
      setError('Failed to fetch memberships');
      console.error('Error fetching memberships:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintList = () => {
    setSelectedMembership(null);
    window.print();
  };

  const handlePrintSingle = (membership: Membership) => {
    setSelectedMembership(membership);
    window.print();
  };

  const handleExport = () => {
    const csvData = filteredMemberships.map(membership => {
      const validityDate = new Date(membership.createdAt);
      validityDate.setFullYear(validityDate.getFullYear() + membership.validity);
      
      return {
        'Member ID': membership.memberId,
        'Email': membership.email,
        'Phone': membership.phone,
        'Type': membership.type,
        'Fee': `₹${membership.fee.toFixed(2)}`,
        'Validity (years)': membership.validity,
        'Status': membership.status,
        'Start Date': new Date(membership.createdAt).toLocaleDateString(),
        'Expiry Date': validityDate.toLocaleDateString(),
        'Transaction ID': membership.transaction.transactionId
      };
    });

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `memberships_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = membership.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.phone.includes(searchTerm);
    const matchesStatus = !statusFilter || membership.status === statusFilter;
    const matchesType = !typeFilter || membership.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Memberships</h1>
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

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search memberships..."
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
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
                <select 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">All Types</option>
                  <option value="general">General</option>
                  <option value="active">Active</option>
                  <option value="membershipFees">Membership Fees</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMemberships.map((membership) => (
                  <MembershipRow 
                    key={membership._id} 
                    membership={membership}
                    onPrint={() => handlePrintSingle(membership)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredMemberships.length} of {memberships.length} memberships
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
        <MembershipPrintLayout
          memberships={selectedMembership ? [selectedMembership] : filteredMemberships}
          type={selectedMembership ? 'single' : 'list'}
        />
      </div>
    </>
  );
};

export default Memberships;