import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lidarr Artist Suggestions',
  description: 'Discover new artists based on your Lidarr library',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-xl font-bold text-blue-600">Lidarr Suggestions</a>
            <a href="/settings" className="text-gray-600 hover:text-gray-900">Settings</a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
