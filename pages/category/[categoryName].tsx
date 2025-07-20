import React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const CategoryPage = dynamic(() => import('../../src/pages/CategoryPage'), {
  ssr: false
})

export default function Category() {
  const router = useRouter()
  const { categoryName } = router.query

  return <CategoryPage />
}