import React, { useState, useEffect } from 'react';
import { Plus, Printer, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import MemberCard from '../components/MemberCard';
import SearchFilter from '../components/SearchFilter';
import AddMemberModal from '../components/AddMemberModal';
import MemberEditModal from '../components/MemberEditModal';
import PrintLayout from '../components/PrintLayout';
import { memberService, Member, CreateMemberPayload } from '../services/api';
import { API_BASE_URL } from '../config/api';

const Members = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [limit, setLimit] = useState(10);
  const [locationFilters, setLocationFilters] = useState({
    state: '',
    district: '',
    parliamentConstituency: '',
    assemblyConstituency: '',
    panchayat: ''
  });

  useEffect(() => {
    fetchMembers();
  }, [currentPage, limit]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/member?page=${currentPage}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data.message.data);
      setTotalMembers(data.message.total);
      setTotalPages(Math.ceil(data.message.total / limit));
      setError(null);
    } catch (err) {
      setError('Failed to fetch members');
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationFilter = (field: string, value: string) => {
    setLocationFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
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
      const response = await fetch(`${API_BASE_URL}/member/check-memberships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        throw new Error('Failed to check membership');
      }

      const result = await response.json();
      alert(result.message || 'Membership check completed');
      fetchMembers();
    } catch (error) {
      console.error('Error checking membership:', error);
      alert('Failed to check membership. Please try again.');
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

  const handleGenerateId = async (member: Member) => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/generate-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId: member._id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ID card');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `id-card-${member._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating ID card:', error);
      alert('Failed to generate ID card. Please try again.');
    }
  };

  const handleGenerateAllIds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/generate-all-ids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberIds: members.map(m => m._id) }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ID cards');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'all-id-cards.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating ID cards:', error);
      alert('Failed to generate ID cards. Please try again.');
    }
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
    const matchesState = !locationFilters.state || member.state.toLowerCase() === locationFilters.state.toLowerCase();
    const matchesDistrict = !locationFilters.district || member.district.toLowerCase() === locationFilters.district.toLowerCase();
    const matchesParliament = !locationFilters.parliamentConstituency || 
                             member.parliamentConstituency.toLowerCase() === locationFilters.parliamentConstituency.toLowerCase();
    const matchesAssembly = !locationFilters.assemblyConstituency || 
                           member.assemblyConstituency.toLowerCase() === locationFilters.assemblyConstituency.toLowerCase();
    const matchesPanchayat = !locationFilters.panchayat || 
                            member.panchayat.toLowerCase() === locationFilters.panchayat.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType && matchesState && 
           matchesDistrict && matchesParliament && matchesAssembly && matchesPanchayat;
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
              onClick={handleGenerateAllIds}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2 border border-blue-200 hover:bg-blue-50"
            >
              <CreditCard className="w-5 h-5" />
              <span>Generate All IDs</span>
            </button>
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
            onFilterLocation={handleLocationFilter}
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
                    onGenerateId={handleGenerateId}
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