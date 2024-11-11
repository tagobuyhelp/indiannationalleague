import React, { useState, useEffect } from 'react';
import { Download, ArrowUp, ArrowDown, Search, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import TransactionRow from '../components/TransactionRow';
import TransactionPrintLayout from '../components/TransactionPrintLayout';
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

interface TransactionResponse {
  statusCode: number;
  data: {
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
  };
  message: string;
  success: boolean;
}

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      let url = `${API_BASE_URL}/transaction?page=${currentPage}&limit=${limit}&sort=createdAt&order=desc`;
      
      if (statusFilter) {
        url += `&paymentStatus=${statusFilter}`;
      }
      if (typeFilter) {
        url += `&transactionType=${typeFilter}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data: TransactionResponse = await response.json();
      setTransactions(data.data.transactions);
      setTotalPages(data.data.pages);
      setTotalTransactions(data.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintList = () => {
    setSelectedTransaction(null);
    window.print();
  };

  const handlePrintTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    window.print();
  };

  const handleExport = () => {
    const csvData = filteredTransactions.map(transaction => ({
      'Transaction ID': transaction.transactionId,
      'Member ID': transaction.memberId,
      'Type': transaction.transactionType,
      'Amount': `₹${transaction.amount.toFixed(2)}`,
      'Status': transaction.paymentStatus,
      'Created Date': new Date(transaction.createdAt).toLocaleDateString(),
      'Updated Date': new Date(transaction.updatedAt).toLocaleDateString()
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
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedAmount = filteredTransactions
    .filter(t => t.paymentStatus === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = totalAmount - completedAmount;

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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
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
            <h3 className="text-gray-500 text-sm mb-2">Total Volume</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
              <span className="text-green-500 flex items-center text-sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                12.5%
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Completed Transactions</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{completedAmount.toFixed(2)}</p>
              <span className="text-green-500 flex items-center text-sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                8.2%
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Pending Transactions</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{pendingAmount.toFixed(2)}</p>
              <span className="text-red-500 flex items-center text-sm">
                <ArrowDown className="w-4 h-4 mr-1" />
                3.1%
              </span>
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
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64"
                />
              </div>
              <div className="flex space-x-3">
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">All Types</option>
                  <option value="donation">Donation</option>
                  <option value="membershipFees">Membership Fees</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction._id}
                    transaction={transaction}
                    onPrint={handlePrintTransaction}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalTransactions)} of {totalTransactions} transactions
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded-lg text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <TransactionPrintLayout
          transactions={selectedTransaction ? [selectedTransaction] : filteredTransactions}
          type={selectedTransaction ? 'single' : 'list'}
        />
      </div>
    </>
  );
};

export default Transactions;