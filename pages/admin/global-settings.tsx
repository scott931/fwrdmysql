import React from 'react'
import dynamic from 'next/dynamic'

const GlobalSettingsPage = dynamic(() => import('../../src/pages/GlobalSettingsPage'), {
  ssr: false
})

export default function GlobalSettings() {
  return <GlobalSettingsPage />
}