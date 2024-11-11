import React, { useState } from 'react';
import { X, Users } from 'lucide-react';

interface Member {
  _id: { $oid: string };
  memberId: string;
  fullname: string;
  phone: string;
  email: string;
  membershipStatus: string;
}

interface NoticeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  selectedMembers: Member[];
  onSelectRecipients: () => void;
}

const NoticeForm: React.FC<NoticeFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  selectedMembers,
  onSelectRecipients 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    channel: 'both',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        recipients: selectedMembers.map(m => m.memberId)
      });
      setFormData({ title: '', message: '', channel: 'both' });
      onClose();
    } catch (error) {
      console.error('Error sending notice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">New Notice</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Send via</label>
            <select
              name="channel"
              value={formData.channel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="email">Email only</option>
              <option value="sms">SMS only</option>
              <option value="both">Both Email and SMS</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Recipients ({selectedMembers.length})</label>
              <button
                type="button"
                onClick={onSelectRecipients}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Users className="w-4 h-4 mr-1" />
                Select Recipients
              </button>
            </div>
            <div className="mt-1 p-2 border border-gray-300 rounded-md max-h-32 overflow-y-auto">
              {selectedMembers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">No recipients selected</p>
              ) : (
                selectedMembers.map((member) => (
                  <div key={member.memberId} className="flex items-center justify-between py-1">
                    <span className="text-sm">{member.fullname}</span>
                    <span className="text-xs text-gray-500">{member.email}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedMembers.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeForm;