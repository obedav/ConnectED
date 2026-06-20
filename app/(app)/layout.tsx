import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastProvider } from '@/components/ui/ToastProvider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F4F1EE]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="page-enter flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>
      <BottomNav />
      <ToastProvider />
    </div>
  )
}
