import React from 'react';

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

interface TransactionPrintLayoutProps {
  transactions: Transaction[];
  type: 'list' | 'single';
}

const TransactionPrintLayout: React.FC<TransactionPrintLayoutProps> = ({ transactions, type }) => {
  const today = new Date().toLocaleDateString();
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-8 print-section">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">
          {type === 'single' ? 'Transaction Details' : 'Transactions Report'}
        </h1>
        <p className="text-gray-600">Generated on {today}</p>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="py-3 text-left">Transaction ID</th>
            <th className="py-3 text-left">Member ID</th>
            <th className="py-3 text-left">Type</th>
            <th className="py-3 text-left">Amount</th>
            <th className="py-3 text-left">Status</th>
            <th className="py-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id} className="border-b border-gray-200">
              <td className="py-4">
                <div className="font-medium">{transaction.transactionId}</div>
              </td>
              <td className="py-4">{transaction.memberId}</td>
              <td className="py-4 capitalize">{transaction.transactionType}</td>
              <td className="py-4">₹{transaction.amount.toFixed(2)}</td>
              <td className="py-4 capitalize">{transaction.paymentStatus}</td>
              <td className="py-4">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-sm text-gray-600">
        <p>Total Transactions: {transactions.length}</p>
        <p>Total Amount: ₹{totalAmount.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default TransactionPrintLayout;