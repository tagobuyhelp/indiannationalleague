import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, CreditCard, Heart, Menu, X, Bell, UserCog } from 'lucide-react';
import UserMenu from './UserMenu';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/members', icon: Users, label: 'Members' },
    { path: '/memberships', icon: CreditCard, label: 'Memberships' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/donations', icon: Heart, label: 'Donations' },
    { path: '/notices', icon: Bell, label: 'Notices' },
    { path: '/users', icon: UserCog, label: 'Users' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-800 w-64 flex flex-col">
          <div className="flex items-center justify-between mb-6 px-2">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="space-y-2 flex-grow">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors ${
                    isActive ? 'bg-gray-700 text-white' : ''
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Menu */}
          <div className="px-4 py-4 border-t border-gray-700">
            <UserMenu />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`p-4 md:ml-64`}>
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
        </div>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;