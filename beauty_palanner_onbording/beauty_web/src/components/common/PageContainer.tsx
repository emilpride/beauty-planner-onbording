export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="container-page py-10 space-y-6">
      {children}
    </main>
  )
}
