import type { AppProps } from 'next/app'
import { AuthProvider } from '../src/contexts/AuthContext'
import { PermissionProvider } from '../src/contexts/PermissionContext'
import DatabaseTest from '../src/components/ui/DatabaseTest'
import '../src/index.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PermissionProvider>
        <Component {...pageProps} />
        <DatabaseTest />
      </PermissionProvider>
    </AuthProvider>
  )
}