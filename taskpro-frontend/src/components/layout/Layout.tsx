"use client"

import type React from "react"
import { useState } from "react"
import { Outlet } from "react-router-dom"
import Header from "./Header"
import Sidebar from "./Sidebar"
import Footer from "./Footer"

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main content */}
        <main className="flex-1 lg:ml-0 transition-all duration-300 ease-in-out">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Layout
