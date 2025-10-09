"use client"

import type React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import type { RootState } from "../../store/store"
import {
  HomeIcon,
  FolderIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CheckCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
  BellIcon,
  TagIcon,
} from "@heroicons/react/24/outline"
import {
  HomeIcon as HomeSolidIcon,
  FolderIcon as FolderSolidIcon,
  UsersIcon as UsersSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  Cog6ToothIcon as CogSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  CalendarIcon as CalendarSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  BellIcon as BellSolidIcon,
  TagIcon as TagSolidIcon,
} from "@heroicons/react/24/solid"
import clsx from "clsx"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  {
    name: "dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    iconSolid: HomeSolidIcon,
    badge: null,
  },
  {
    name: "projects",
    href: "/projects",
    icon: FolderIcon,
    iconSolid: FolderSolidIcon,
    badge: null,
  },
  {
    name: "tasks",
    href: "/tasks",
    icon: CheckCircleIcon,
    iconSolid: CheckCircleSolidIcon,
    badge: "12",
  },
  {
    name: "calendar",
    href: "/calendar",
    icon: CalendarIcon,
    iconSolid: CalendarSolidIcon,
    badge: null,
  },
  {
    name: "teams",
    href: "/teams",
    icon: UsersIcon,
    iconSolid: UsersSolidIcon,
    badge: null,
  },
  {
    name: "documents",
    href: "/documents",
    icon: DocumentTextIcon,
    iconSolid: DocumentTextSolidIcon,
    badge: null,
  },
  {
    name: "analytics",
    href: "/analytics",
    icon: ChartBarIcon,
    iconSolid: ChartBarSolidIcon,
    badge: null,
  },
]

const quickActions = [
  { name: "notifications", href: "/notifications", icon: BellIcon, iconSolid: BellSolidIcon, badge: "3" },
  { name: "labels", href: "/labels", icon: TagIcon, iconSolid: TagSolidIcon, badge: null },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard"
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-30 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TaskPro</span>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage || "/placeholder.svg"}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium">{user?.firstName?.charAt(0) || "U"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const active = isActive(item.href)
                const Icon = active ? item.iconSolid : item.icon

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={clsx(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      active
                        ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700"
                        : "text-gray-700 hover:text-indigo-700 hover:bg-gray-50",
                    )}
                  >
                    <Icon
                      className={clsx(
                        "mr-3 h-5 w-5 transition-colors",
                        active ? "text-indigo-700" : "text-gray-400 group-hover:text-indigo-700",
                      )}
                    />
                    <span className="flex-1">{t(`navigation.${item.name}`) || item.name}</span>
                    {item.badge && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {t("navigation.quickActions") || "Quick Actions"}
              </h3>
              <div className="space-y-1">
                {quickActions.map((item) => {
                  const active = isActive(item.href)
                  const Icon = active ? item.iconSolid : item.icon

                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={clsx(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700 hover:text-indigo-700 hover:bg-gray-50",
                      )}
                    >
                      <Icon
                        className={clsx(
                          "mr-3 h-5 w-5 transition-colors",
                          active ? "text-indigo-700" : "text-gray-400 group-hover:text-indigo-700",
                        )}
                      />
                      <span className="flex-1">{t(`navigation.${item.name}`) || item.name}</span>
                      {item.badge && (
                        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Settings at bottom */}
          <div className="p-4 border-t border-gray-200">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={clsx(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                isActive("/settings")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:text-indigo-700 hover:bg-gray-50",
              )}
            >
              {isActive("/settings") ? (
                <CogSolidIcon className="mr-3 h-5 w-5 text-indigo-700" />
              ) : (
                <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-700 transition-colors" />
              )}
              <span>{t("navigation.settings") || "Settings"}</span>
            </NavLink>

            {/* Version info */}
            <div className="mt-4 px-3">
              <p className="text-xs text-gray-500">TaskPro v2.1.0</p>
              <p className="text-xs text-gray-400">© 2024 TaskPro Inc.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
