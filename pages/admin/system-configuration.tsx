import React from 'react'
import dynamic from 'next/dynamic'

const SystemConfigurationPage = dynamic(() => import('../../src/pages/SystemConfigurationPage'), {
  ssr: false
})

export default function SystemConfiguration() {
  return <SystemConfigurationPage />
}