import React from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { 
  UserCircleIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector } from '../../store/hooks';

const UserMenu: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-center space-x-2">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {getInitials(user?.firstName, user?.lastName)}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 hidden md:block">
            {user?.firstName || 'User'}
          </span>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
      </MenuButton>

      <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
        <div className="p-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        
        <div className="py-1">
          <MenuItem>
            {({ active }) => (
              <Link
                to="/profile"
                className={`flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                }`}
              >
                <UserCircleIcon className="w-4 h-4 mr-3" />
                Profile
              </Link>
            )}
          </MenuItem>
          
          <MenuItem>
            {({ active }) => (
              <Link
                to="/settings"
                className={`flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                }`}
              >
                <CogIcon className="w-4 h-4 mr-3" />
                Settings
              </Link>
            )}
          </MenuItem>
        </div>
        
        <div className="py-1 border-t border-gray-100">
          <MenuItem>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                }`}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                Sign out
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
};

export default UserMenu;