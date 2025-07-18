import { ReactNode } from 'react'
import TopNavigation from './TopNavigation'
import BottomNavigation from './BottomNavigation'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <main className="pb-20 pt-16">
        {children}
      </main>
      <BottomNavigation />
    </div>
  )
}
