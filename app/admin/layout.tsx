export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* 可在这里添加后台侧边栏或头部 */}
        {children}
      </div>
    )
  }
  