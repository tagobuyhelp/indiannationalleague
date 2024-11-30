import React, { useState, useEffect } from 'react';
import { Plus, Printer } from 'lucide-react';
import MemberCard from '../components/MemberCard';
import SearchFilter from '../components/SearchFilter';
import AddMemberModal from '../components/AddMemberModal';
import MemberEditModal from '../components/MemberEditModal';
import PrintLayout from '../components/PrintLayout';
import { memberService, Member, CreateMemberPayload } from '../services/api';

const Members = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState<{
    country?: string;
    state?: string;
    district?: string;
    parliamentConstituency?: string;
  }>({});
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchMembers();
  }, [currentPage, limit]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await memberService.getMembers();
      setMembers(response.message.data);
      setTotalMembers(response.message.total);
      setTotalPages(Math.ceil(response.message.total / limit));
      setError(null);
    } catch (err) {
      setError('Failed to fetch members');
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (data: CreateMemberPayload) => {
    try {
      await memberService.createMember(data);
      fetchMembers();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member. Please try again.');
    }
  };

  const handleUpdateMember = async (memberId: string, data: Partial<CreateMemberPayload>) => {
    try {
      await memberService.updateMember(memberId, data);
      fetchMembers();
      setEditMember(null);
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member. Please try again.');
    }
  };

  const handleDeleteMember = async (member: Member) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await memberService.deleteMember(member._id);
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Failed to delete member. Please try again.');
      }
    }
  };

  const handleCheckMembership = async (email: string, phone: string) => {
    try {
      const result = await memberService.checkMembership(email, phone);
      alert(result.data || result.message || 'Membership check completed');
      fetchMembers();
    } catch (error) {
      console.error('Error checking membership:', error);
      alert(error instanceof Error ? error.message : 'Failed to check membership status');
    }
  };

  const handlePrintList = () => {
    setSelectedMember(null);
    window.print();
  };

  const handlePrintMember = (member: Member) => {
    setSelectedMember(member);
    window.print();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm) ||
                         (member.memberId && member.memberId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         member.aadhaar.includes(searchTerm);
    const matchesStatus = !statusFilter || member.membershipStatus === statusFilter;
    const matchesType = !typeFilter || member.membershipType === typeFilter;
    const matchesLocation = Object.entries(locationFilter).every(([key, value]) => {
      if (!value) return true;
      if (key === 'parliamentConstituency') {
        return member.parliamentConstituency === value;
      }
      return member[key as keyof Member] === value;
    });
    
    return matchesSearch && matchesStatus && matchesType && matchesLocation;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <div className="flex space-x-3">
            <button 
              onClick={handlePrintList}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 border border-gray-300 hover:bg-gray-50"
            >
              <Printer className="w-5 h-5" />
              <span>Print List</span>
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <SearchFilter
            onSearch={setSearchTerm}
            onFilterStatus={setStatusFilter}
            onFilterType={setTypeFilter}
            onFilterLocation={setLocationFilter}
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhaar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <MemberCard 
                    key={member._id}
                    member={member}
                    onPrint={handlePrintMember}
                    onEdit={(member) => setEditMember(member)}
                    onDelete={handleDeleteMember}
                    onCheckMembership={handleCheckMembership}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalMembers)} of {totalMembers} members
                </div>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddMember}
        />

        {editMember && (
          <MemberEditModal
            isOpen={true}
            member={editMember}
            onClose={() => setEditMember(null)}
            onUpdate={handleUpdateMember}
          />
        )}
      </div>

      <div className="hidden print:block">
        <PrintLayout 
          members={selectedMember ? [selectedMember] : filteredMembers} 
          type={selectedMember ? 'single' : 'list'} 
        />
      </div>
    </>
  );
};

export default Members;