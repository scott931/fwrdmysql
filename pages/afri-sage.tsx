import React from 'react'
import dynamic from 'next/dynamic'

const AfrisagePage = dynamic(() => import('../src/pages/AfrisagePage'), {
  ssr: false
})

export default function AfriSage() {
  return <AfrisagePage />
}