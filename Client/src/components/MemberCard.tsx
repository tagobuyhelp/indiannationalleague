import React, { useState } from 'react';
import { MoreVertical, Printer, Eye, Trash2, CreditCard, CheckCircle } from 'lucide-react';
import { Member, memberService } from '../services/api';
import { API_BASE_URL } from '../config/api';

interface MemberCardProps {
  member: Member;
  onPrint: (member: Member) => void;
  onGenerateId: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onCheckMembership?: (email: string, phone: string) => Promise<void>;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  onPrint, 
  onGenerateId,
  onEdit,
  onDelete,
  onCheckMembership 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const createdDate = new Date(member.createdAt).toLocaleDateString();
  const dob = new Date(member.dob).toLocaleDateString();

  const handlePrintMember = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPrint(member);
    setShowActions(false);
  };

  const handleViewMember = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(member);
    setShowActions(false);
  };

  const handleRemoveMember = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(member);
    setShowActions(false);
  };

  const handleGenerateId = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGenerating(true);
    try {
      const result = await memberService.generateIdCard(member._id);
      alert(result.message || 'ID card generated successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error generating ID card:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate ID card');
    } finally {
      setIsGenerating(false);
      setShowActions(false);
    }
  };

  const handleDownloadId = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (member.idCard) {
      try {
        await memberService.downloadIdCard(member.idCard);
      } catch (error) {
        console.error('Error downloading ID card:', error);
        alert('Failed to download ID card. Please try again.');
      }
    } else {
      alert('ID card not available. Please generate one first.');
    }
    setShowActions(false);
  };

  const handleCheckMembership = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsChecking(true);
    try {
      if (onCheckMembership) {
        await onCheckMembership(member.email, member.phone);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      alert(error instanceof Error ? error.message : 'Failed to check membership status');
    } finally {
      setIsChecking(false);
      setShowActions(false);
    }
  };

  const toggleActions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(!showActions);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
            {member.photo && (
              <img 
                src={member.photo.startsWith('http') ? member.photo : `${API_BASE_URL}/${member.photo}`}
                alt={member.fullname}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{member.fullname}</div>
            <div className="text-sm text-gray-500">{member.phone}</div>
            <div className="text-sm text-gray-500">{member.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {member.memberId ? (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {member.memberId}
          </div>
        ) : (
          <button
            onClick={handleCheckMembership}
            disabled={isChecking}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            {isChecking ? 'Checking...' : 'Check Membership'}
          </button>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {member.aadhaar}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>DOB: {dob}</div>
        <div>{member.address}</div>
        <div>{member.district}, {member.state} - {member.pinCode}</div>
        <div className="text-xs text-gray-400">
          Parliament: {member.parliamentConstituency}
        </div>
        <div className="text-xs text-gray-400">
          Assembly: {member.assemblyConstituency}
        </div>
        <div className="text-xs text-gray-400">
          Panchayat: {member.panchayat}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          member.membershipStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {member.membershipStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
        {member.membershipType}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{createdDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
        <div className="relative">
          <button 
            onClick={toggleActions}
            className="text-gray-400 hover:text-gray-500"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showActions && (
            <div 
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            >
              <div className="py-1" role="menu">
                <button
                  onClick={handleGenerateId}
                  disabled={isGenerating}
                  className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 mr-3" />
                  {isGenerating ? 'Generating...' : 'Generate ID Card'}
                </button>
                {member.idCard && (
                  <button
                    onClick={handleDownloadId}
                    className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left"
                  >
                    <CreditCard className="w-4 h-4 mr-3" />
                    Download ID Card
                  </button>
                )}
                <button
                  onClick={handlePrintMember}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Printer className="w-4 h-4 mr-3" />
                  Print Member
                </button>
                <button
                  onClick={handleViewMember}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View/Update
                </button>
                <button
                  onClick={handleRemoveMember}
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

export default MemberCard;