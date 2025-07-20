import React from 'react'
import dynamic from 'next/dynamic'

const AdminPage = dynamic(() => import('../src/pages/AdminPage'), {
  ssr: false
})

export default function Admin() {
  return <AdminPage />
}