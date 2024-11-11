import React from 'react';

interface Membership {
  _id: { $oid: string };
  memberId: string;
  email: string;
  phone: string;
  transaction: { $oid: string };
  type: string;
  fee: number;
  validity: number;
  status: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

interface MembershipPrintLayoutProps {
  memberships: Membership[];
  type: 'single' | 'list';
}

const MembershipPrintLayout: React.FC<MembershipPrintLayoutProps> = ({ memberships, type }) => {
  const getValidityDate = (membership: Membership) => {
    const startDate = new Date(membership.createdAt.$date);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + membership.validity);
    return {
      start: startDate.toLocaleDateString(),
      end: endDate.toLocaleDateString()
    };
  };

  if (type === 'single' && memberships.length === 1) {
    const membership = memberships[0];
    const validity = getValidityDate(membership);
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Membership Details</h1>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Member ID</p>
              <p>{membership.memberId}</p>
            </div>
            <div>
              <p className="font-semibold">Status</p>
              <p className="capitalize">{membership.status}</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p>{membership.email}</p>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <p>{membership.phone}</p>
            </div>
            <div>
              <p className="font-semibold">Type</p>
              <p className="capitalize">{membership.type}</p>
            </div>
            <div>
              <p className="font-semibold">Fee</p>
              <p>₹{membership.fee.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-semibold">Start Date</p>
              <p>{validity.start}</p>
            </div>
            <div>
              <p className="font-semibold">End Date</p>
              <p>{validity.end}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Memberships List</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-2">Member ID</th>
            <th className="text-left py-2">Contact</th>
            <th className="text-left py-2">Type</th>
            <th className="text-left py-2">Fee</th>
            <th className="text-left py-2">Validity</th>
            <th className="text-left py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {memberships.map((membership) => {
            const validity = getValidityDate(membership);
            return (
              <tr key={membership._id.$oid}>
                <td className="py-2">{membership.memberId}</td>
                <td className="py-2">
                  {membership.email}<br />
                  {membership.phone}
                </td>
                <td className="py-2 capitalize">{membership.type}</td>
                <td className="py-2">₹{membership.fee.toFixed(2)}</td>
                <td className="py-2">
                  {validity.start} to<br />
                  {validity.end}
                </td>
                <td className="py-2 capitalize">{membership.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MembershipPrintLayout;