import React from 'react';
import { Member } from '../services/api';
import { API_BASE_URL } from '../config/api';

interface PrintLayoutProps {
  members: Member[];
  type: 'list' | 'single';
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ members, type }) => {
  const today = new Date().toLocaleDateString();

  if (type === 'single' && members.length === 1) {
    const member = members[0];
    return (
      <div className="p-8 print-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Member Profile</h1>
            <p className="text-gray-600">Generated on {today}</p>
          </div>

          <div className="flex items-start space-x-8 mb-8">
            {member.photo && (
              <div className="w-48 h-48 rounded-lg overflow-hidden">
                <img
                  src={member.photo.startsWith('http') ? member.photo : `${API_BASE_URL}/${member.photo}`}
                  alt={member.fullname}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Name:</span> {member.fullname}</p>
                  <p><span className="text-gray-600">Member ID:</span> {member.memberId}</p>
                  <p><span className="text-gray-600">Email:</span> {member.email}</p>
                  <p><span className="text-gray-600">Phone:</span> {member.phone}</p>
                  <p><span className="text-gray-600">Aadhaar:</span> {member.aadhaar}</p>
                  <p><span className="text-gray-600">DOB:</span> {new Date(member.dob).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Membership Details</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Type:</span> {member.membershipType}</p>
                  <p><span className="text-gray-600">Status:</span> {member.membershipStatus}</p>
                  <p><span className="text-gray-600">Joined:</span> {new Date(member.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Address Information</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Address:</span> {member.address}</p>
                <p><span className="text-gray-600">PIN Code:</span> {member.pinCode}</p>
                <p><span className="text-gray-600">District:</span> {member.district}</p>
                <p><span className="text-gray-600">State:</span> {member.state}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Constituency Information</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Parliament:</span> {member.parliamentConstituency}</p>
                <p><span className="text-gray-600">Assembly:</span> {member.assemblyConstituency}</p>
                <p><span className="text-gray-600">Panchayat:</span> {member.panchayat}</p>
              </div>
            </div>
          </div>

          {member.idCard && (
            <div className="mt-8">
              <h3 className="font-semibold mb-2">ID Card</h3>
              <img
                src={member.idCard.startsWith('http') ? member.idCard : `${API_BASE_URL}/${member.idCard}`}
                alt="Member ID Card"
                className="max-w-md mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view with pagination for better printing of large datasets
  const itemsPerPage = 25;
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => {
    const start = i * itemsPerPage;
    const pageMembers = members.slice(start, start + itemsPerPage);
    
    return (
      <div key={i} className={i > 0 ? 'break-before-page' : ''}>
        {i === 0 && (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Members Report</h1>
            <p className="text-gray-600">Generated on {today}</p>
            <p className="text-sm mt-2">Page {i + 1} of {totalPages}</p>
          </div>
        )}

        {i > 0 && (
          <div className="mb-4 text-right text-sm text-gray-600">
            Page {i + 1} of {totalPages}
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-2 text-left">Member ID</th>
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Contact</th>
              <th className="py-2 text-left">Location</th>
              <th className="py-2 text-left">Membership</th>
              <th className="py-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pageMembers.map((member) => (
              <tr key={member._id}>
                <td className="py-2">{member.memberId}</td>
                <td className="py-2">{member.fullname}</td>
                <td className="py-2">
                  <div>{member.email}</div>
                  <div>{member.phone}</div>
                </td>
                <td className="py-2">
                  <div>{member.district}</div>
                  <div className="text-gray-600">{member.state}</div>
                </td>
                <td className="py-2">
                  <div className="capitalize">{member.membershipType}</div>
                  <div className={`text-sm ${
                    member.membershipStatus === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {member.membershipStatus}
                  </div>
                </td>
                <td className="py-2">
                  {new Date(member.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {i === totalPages - 1 && (
          <div className="mt-8 text-sm text-gray-600">
            <p>Total Members: {members.length}</p>
          </div>
        )}
      </div>
    );
  });

  return <div className="p-8 print-section">{pages}</div>;
};

export default PrintLayout;