import React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const InstructorPage = dynamic(() => import('../../src/pages/InstructorPage'), {
  ssr: false
})

export default function Instructor() {
  const router = useRouter()
  const { instructorId } = router.query

  return <InstructorPage />
}