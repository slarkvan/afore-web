import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}