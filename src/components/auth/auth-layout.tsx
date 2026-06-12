import type { ReactNode } from 'react'
import { KeyRound } from 'lucide-react'
import { AppFooter } from '../layout/app-footer'

type AuthLayoutProps = {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-card">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>

        <div className="fade-in rounded-card border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
          {children}
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
