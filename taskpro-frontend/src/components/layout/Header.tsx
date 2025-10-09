"use client"

import type React from "react"
import { useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import type { RootState } from "../../store/store"
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import { BellIcon as BellSolidIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import { useAuth } from "../../hooks/useAuth"

interface HeaderProps {
  toggleSidebar?: () => void
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { t, i18n } = useTranslation()
  const { logout } = useAuth()  // Hook appelé à l'intérieur du composant
  const { user } = useSelector((state: RootState) => state.auth)
  const { unreadCount } = useSelector((state: RootState) => state.notifications)

  // State for dropdowns
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "New task assigned",
      message: 'You have been assigned to "Update user interface"',
      time: "2 min ago",
      read: false,
      type: "task",
    },
    {
      id: 2,
      title: "Project deadline approaching",
      message: "TaskPro Mobile App deadline is in 3 days",
      time: "1 hour ago",
      read: false,
      type: "deadline",
    },
    {
      id: 3,
      title: "Team member joined",
      message: "Sarah Johnson joined your team",
      time: "3 hours ago",
      read: true,
      type: "team",
    },
  ]

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng)
    setLanguageMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
  }

  const handleNotificationClick = (notificationId: number) => {
    // Mark as read and navigate
    console.log("Notification clicked:", notificationId)
    setNotificationsOpen(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
        {toggleSidebar && (
              <button
            onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}

            {/* Logo */}
            <RouterLink to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <span className="hidden sm:block text-xl font-bold text-gray-900">TaskPro</span>
            </RouterLink>

            {/* Search bar */}
            <div className="hidden md:block relative">
              <div className={`relative transition-all duration-200 ${searchFocused ? "w-80" : "w-64"}`}>
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("common.search") || "Search projects, tasks, teams..."}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Quick actions */}
            <button className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <PlusIcon className="h-4 w-4" />
              <span className="text-sm font-medium">New Task</span>
            </button>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <GlobeAltIcon className="h-5 w-5" />
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => handleLanguageChange("en")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span className="text-lg">🇺🇸</span>
                    <span>English</span>
                    {i18n.language === "en" && <CheckCircleIcon className="h-4 w-4 text-indigo-600 ml-auto" />}
                  </button>
                  <button
                    onClick={() => handleLanguageChange("fr")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span className="text-lg">🇫🇷</span>
                    <span>Français</span>
                    {i18n.language === "fr" && <CheckCircleIcon className="h-4 w-4 text-indigo-600 ml-auto" />}
                  </button>
                </div>
              )}
            </div>

          {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {unreadCount > 0 ? (
                  <BellSolidIcon className="h-5 w-5 text-indigo-600" />
                ) : (
                  <BellIcon className="h-5 w-5" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700">Mark all as read</button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? "bg-indigo-50" : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              !notification.read ? "bg-indigo-600" : "bg-gray-300"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <RouterLink
                      to="/notifications"
                      className="block text-center text-sm text-indigo-600 hover:text-indigo-700"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      View all notifications
                    </RouterLink>
                  </div>
                </div>
              )}
            </div>

          {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              {user?.profileImage ? (
                    <img
                      src={user.profileImage || "/placeholder.svg"}
                  alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                    <span className="text-white text-sm font-medium">{user?.firstName?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>

                  <RouterLink
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>{t("navigation.profile") || "Profile"}</span>
                  </RouterLink>

                  <RouterLink
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                    <span>{t("navigation.settings") || "Settings"}</span>
                  </RouterLink>

                  <div className="border-t border-gray-200 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>{t("auth.logout") || "Sign out"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t("common.search") || "Search..."}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Click outside handlers */}
      {(userMenuOpen || notificationsOpen || languageMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false)
            setNotificationsOpen(false)
            setLanguageMenuOpen(false)
          }}
        />
      )}
    </header>
  )
}

export default Header
