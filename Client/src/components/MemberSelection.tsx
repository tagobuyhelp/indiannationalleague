import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface Member {
  _id: string;
  memberId: string;
  fullname: string;
  phone: string;
  email: string;
  membershipStatus: string;
}

interface MemberResponse {
  statusCode: number;
  data: string;
  message: {
    total: number;
    page: number;
    limit: number;
    data: Member[];
  };
  success: boolean;
}

interface MemberSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (members: Member[]) => void;
  selectedMembers: Member[];
}

const MemberSelection: React.FC<MemberSelectionProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedMembers 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/member`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data: MemberResponse = await response.json();
      setMembers(data.message.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch members');
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMember = (member: Member) => {
    const isSelected = selectedMembers.some(m => m.memberId === member.memberId);
    if (isSelected) {
      onSelect(selectedMembers.filter(m => m.memberId !== member.memberId));
    } else {
      onSelect([...selectedMembers, member]);
    }
  };

  const handleSelectAll = () => {
    onSelect(members);
  };

  const handleClearAll = () => {
    onSelect([]);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm) ||
                         (member.memberId && member.memberId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || member.membershipStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select Recipients</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              />
            </div>
            <div className="flex space-x-3 ml-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              {selectedMembers.length} members selected
            </div>
            <div className="space-x-3">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No members found</div>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelected = selectedMembers.some(m => m.memberId === member.memberId);
                    return (
                      <div
                        key={member.memberId || member._id}
                        onClick={() => handleToggleMember(member)}
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <div>
                            <div className="font-medium">{member.fullname}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          member.membershipStatus === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.membershipStatus}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              disabled={selectedMembers.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSelection;