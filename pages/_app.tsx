import type { AppProps } from 'next/app'
import { AuthProvider } from '../src/contexts/AuthContext'
import { PermissionProvider } from '../src/contexts/PermissionContext'
import '../src/index.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PermissionProvider>
        <Component {...pageProps} />
      </PermissionProvider>
    </AuthProvider>
  )
}