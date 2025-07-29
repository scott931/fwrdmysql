import React from 'react'
import dynamic from 'next/dynamic'
import Layout from '../src/components/layout/Layout'

const CommunityPage = dynamic(() => import('../src/pages/CommunityPage'), {
  ssr: false
})

export default function Community() {
  return (
    <Layout>
      <CommunityPage />
    </Layout>
  )
}