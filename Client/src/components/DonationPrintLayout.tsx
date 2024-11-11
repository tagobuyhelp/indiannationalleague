import React from 'react';

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

interface DonationPrintLayoutProps {
  donations: Donation[];
  type: 'single' | 'list';
}

const DonationPrintLayout: React.FC<DonationPrintLayoutProps> = ({ donations, type }) => {
  const today = new Date().toLocaleDateString();
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  if (type === 'single' && donations.length === 1) {
    const donation = donations[0];
    return (
      <div className="p-8 print-section">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Donation Receipt</h1>
            <p className="text-gray-600">Generated on {today}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-8 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Transaction ID</p>
                <p>{donation.transactionId}</p>
              </div>
              <div>
                <p className="font-semibold">Date</p>
                <p>{new Date(donation.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-semibold">Donor Name</p>
                <p>
                  {donation.donorName}
                  {donation.isAnonymous && <span className="text-gray-500"> (Anonymous)</span>}
                </p>
              </div>
              <div>
                <p className="font-semibold">Contact</p>
                <p>{donation.donorPhone}</p>
                <p className="text-sm text-gray-500">{donation.donorEmail}</p>
              </div>
              <div>
                <p className="font-semibold">Status</p>
                <p className="capitalize">{donation.paymentStatus}</p>
              </div>
              <div>
                <p className="font-semibold">Amount</p>
                <p className="text-xl font-bold">₹{donation.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Thank you for your generous donation!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 print-section">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Donations Report</h1>
        <p className="text-gray-600">Generated on {today}</p>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-2">Transaction ID</th>
            <th className="text-left py-2">Donor</th>
            <th className="text-left py-2">Contact</th>
            <th className="text-left py-2">Amount</th>
            <th className="text-left py-2">Status</th>
            <th className="text-left py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation) => (
            <tr key={donation._id}>
              <td className="py-2">{donation.transactionId}</td>
              <td className="py-2">
                {donation.donorName}
                {donation.isAnonymous && <span className="text-gray-500"> (Anonymous)</span>}
              </td>
              <td className="py-2">
                <div>{donation.donorPhone}</div>
                <div className="text-sm text-gray-500">{donation.donorEmail}</div>
              </td>
              <td className="py-2">₹{donation.amount.toFixed(2)}</td>
              <td className="py-2 capitalize">{donation.paymentStatus}</td>
              <td className="py-2">
                {new Date(donation.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-sm text-gray-600">
        <p>Total Donations: {donations.length}</p>
        <p>Total Amount: ₹{totalAmount.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default DonationPrintLayout;