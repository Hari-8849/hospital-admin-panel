import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Pill,
  TestTube,
  CreditCard,
  Video,
  Settings,
  Building,
  LogOut,
  Stethoscope,
  PhoneCall
} from 'lucide-react'
import { clsx } from 'clsx'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/auth'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.LAB_TECHNICIAN, UserRole.BILLING_STAFF, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
    roles: [UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    roles: [UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PATIENT, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    name: 'Medical Records',
    href: '/medical-records',
    icon: FileText,
    roles: [UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    name: 'Pharmacy',
    href: '/pharmacy',
    icon: Pill,
    roles: [UserRole.PHARMACIST, UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    name: 'Laboratory',
    href: '/laboratory',
    icon: TestTube,
    roles: [UserRole.LAB_TECHNICIAN, UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    roles: [UserRole.BILLING_STAFF, UserRole.RECEPTIONIST, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    name: 'Telemedicine',
    href: '/telemedicine',
    icon: Video,
    roles: [UserRole.DOCTOR, UserRole.PATIENT, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Settings,
    roles: [UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN],
    subItems: [
      {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        name: 'Tenants',
        href: '/admin/tenants',
        icon: Building,
      },
      {
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role as UserRole)
  )

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">HMS</h1>
            <p className="text-xs text-gray-500">Hospital Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href
          const hasSubItems = item.subItems && item.subItems.length > 0

          if (hasSubItems) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  className={clsx(
                    'w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
                {isActive && (
                  <div className="ml-4 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = location.pathname === subItem.href
                      return (
                        <NavLink
                          key={subItem.href}
                          to={subItem.href}
                          className={({ isActive: active }) =>
                            clsx(
                              'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              active
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )
                          }
                        >
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.name}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive: active }) =>
                clsx(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User info */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}