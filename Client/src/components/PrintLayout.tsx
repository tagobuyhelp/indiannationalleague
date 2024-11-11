import React from 'react';
import { Member } from '../services/api';

interface PrintLayoutProps {
  members: Member[];
  type: 'list' | 'single';
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ members, type }) => {
  const today = new Date().toLocaleDateString();

  return (
    <div className="p-8 print-section">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">
          {type === 'single' ? 'Member Details' : 'Members Report'}
        </h1>
        <p className="text-gray-600">Generated on {today}</p>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="py-3 text-left">Name</th>
            <th className="py-3 text-left">Member ID</th>
            <th className="py-3 text-left">Aadhaar</th>
            <th className="py-3 text-left">Contact</th>
            <th className="py-3 text-left">Membership</th>
            <th className="py-3 text-left">Location</th>
            <th className="py-3 text-left">Joined</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member._id} className="border-b border-gray-200">
              <td className="py-4">{member.fullname}</td>
              <td className="py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {member._id}
                </span>
              </td>
              <td className="py-4">{member.aadhaar}</td>
              <td className="py-4">
                <span className="block">{member.email}</span>
                <span className="block text-gray-600">{member.phone}</span>
              </td>
              <td className="py-4">
                <span className="block capitalize">{member.membershipType}</span>
                <span className="block text-gray-600 capitalize">{member.membershipStatus}</span>
              </td>
              <td className="py-4">
                <span className="block">{member.district}</span>
                <span className="block text-gray-600">{member.state}</span>
              </td>
              <td className="py-4">
                {new Date(member.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-sm text-gray-600">
        <p>Total Members: {members.length}</p>
      </div>
    </div>
  );
};

export default PrintLayout;