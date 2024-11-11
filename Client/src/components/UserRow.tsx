import React, { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface User {
  _id: { $oid: string };
  email: string;
  fullname: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

interface UserRowProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.createdAt.$date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.updatedAt.$date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-gray-500"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showActions && (
            <div 
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
              onClick={() => setShowActions(false)}
            >
              <div className="py-1" role="menu">
                <button
                  onClick={onEdit}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Pencil className="w-4 h-4 mr-3" />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserRow;