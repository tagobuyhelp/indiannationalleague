import React, { useState } from 'react';
import { MoreVertical, Printer, Eye, Trash2 } from 'lucide-react';

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

interface DonationRowProps {
  donation: Donation;
  onPrint: (donation: Donation) => void;
}

const DonationRow: React.FC<DonationRowProps> = ({ donation, onPrint }) => {
  const [showActions, setShowActions] = useState(false);
  const createdDate = new Date(donation.createdAt).toLocaleDateString();

  const handlePrintDonation = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint(donation);
  };

  const handleViewDonation = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('View donation:', donation._id);
  };

  const handleRemoveDonation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this donation?')) {
      console.log('Remove donation:', donation._id);
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {donation.transactionId}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {donation.donorName}
          {donation.isAnonymous && <span className="ml-2 text-gray-500">(Anonymous)</span>}
        </div>
        <div className="text-sm text-gray-500">{donation.donorEmail}</div>
        <div className="text-sm text-gray-500">{donation.donorPhone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{donation.amount.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          donation.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
          donation.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {donation.paymentStatus}
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
                  onClick={handlePrintDonation}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Printer className="w-4 h-4 mr-3" />
                  Print Receipt
                </button>
                <button
                  onClick={handleViewDonation}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Details
                </button>
                <button
                  onClick={handleRemoveDonation}
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

export default DonationRow;