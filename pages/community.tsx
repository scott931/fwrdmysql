import React from 'react'
import dynamic from 'next/dynamic'

const CommunityPage = dynamic(() => import('../src/pages/CommunityPage'), {
  ssr: false
})

export default function Community() {
  return <CommunityPage />
}