import React, { useState } from 'react';
import { MoreVertical, Printer, Eye, Trash2 } from 'lucide-react';

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

interface TransactionRowProps {
  transaction: Transaction;
  onPrint: (transaction: Transaction) => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onPrint }) => {
  const [showActions, setShowActions] = useState(false);
  const createdDate = new Date(transaction.createdAt).toLocaleDateString();

  const handlePrintTransaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint(transaction);
  };

  const handleViewTransaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('View transaction:', transaction._id);
  };

  const handleRemoveTransaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this transaction?')) {
      console.log('Remove transaction:', transaction._id);
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {transaction.transactionId}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transaction.memberId}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
        {transaction.transactionType}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{transaction.amount.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          transaction.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
          transaction.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {transaction.paymentStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {createdDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
        <div className="relative">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-gray-500"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showActions && (
            <div 
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
              onClick={() => setShowActions(false)}
            >
              <div className="py-1" role="menu">
                <button
                  onClick={handlePrintTransaction}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Printer className="w-4 h-4 mr-3" />
                  Print Transaction
                </button>
                <button
                  onClick={handleViewTransaction}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Details
                </button>
                <button
                  onClick={handleRemoveTransaction}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TransactionRow;