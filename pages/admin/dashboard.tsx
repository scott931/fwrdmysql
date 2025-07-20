import React from 'react'
import dynamic from 'next/dynamic'

const AdminDashboardPage = dynamic(() => import('../../src/pages/AdminDashboardPage'), {
  ssr: false
})

export default function Dashboard() {
  return <AdminDashboardPage />
}