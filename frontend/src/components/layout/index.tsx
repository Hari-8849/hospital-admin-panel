import React from 'react'
import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { useAuth } from '@/contexts/AuthContext'

export function Layout() {
  const { user } = useAuth()

  return (
    <>
      <Helmet>
        <title>Hospital Management System</title>
      </Helmet>

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}