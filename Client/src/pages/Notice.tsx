import React, { useState, useEffect } from 'react';
import { Send, Users, Search, Download } from 'lucide-react';
import NoticeForm from '../components/NoticeForm';
import MemberSelection from '../components/MemberSelection';
import { API_BASE_URL } from '../config/api';

interface Member {
  _id: { $oid: string };
  memberId: string;
  fullname: string;
  phone: string;
  email: string;
  membershipStatus: string;
}

interface Notice {
  _id: string;
  title: string;
  description: string;
  recipients: string[];
  createdAt: string;
}

interface NoticeResponse {
  statusCode: number;
  data: {
    notices: Notice[];
    totalNotices: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

const Notice = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/notices`);
      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }
      const data: NoticeResponse = await response.json();
      setNotices(data.data.notices);
      setError(null);
    } catch (err) {
      setError('Failed to fetch notices');
      console.error('Error fetching notices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotice = async (data: {
    title: string;
    message: string;
    recipients: string[];
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.message,
          recipients: selectedMembers.map(m => m.email)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notice');
      }

      setIsFormOpen(false);
      setSelectedMembers([]);
      fetchNotices();
    } catch (error) {
      console.error('Error sending notice:', error);
      alert('Failed to send notice. Please try again.');
    }
  };

  const handleExport = () => {
    const csvData = notices.map(notice => ({
      'Title': notice.title,
      'Description': notice.description,
      'Recipients': notice.recipients.length,
      'Date': new Date(notice.createdAt).toLocaleDateString()
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notices_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-600">{error}</div>;
  }

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMembers([]);
  };

  const handleOpenMemberSelection = () => {
    setIsMemberSelectionOpen(true);
  };

  const handleCloseMemberSelection = () => {
    setIsMemberSelectionOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 border border-gray-300 hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
            <span>New Notice</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notices..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotices.map((notice) => (
                <tr key={notice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {notice.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {notice.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {notice.recipients.length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredNotices.length} of {notices.length} notices
            </div>
          </div>
        </div>
      </div>

      <NoticeForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSendNotice}
        selectedMembers={selectedMembers}
        onSelectRecipients={handleOpenMemberSelection}
      />

      <MemberSelection
        isOpen={isMemberSelectionOpen}
        onClose={handleCloseMemberSelection}
        onSelect={setSelectedMembers}
        selectedMembers={selectedMembers}
      />
    </div>
  );
};

export default Notice;