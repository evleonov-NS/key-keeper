import { AppLayout } from './components/layout/app-layout'
import { initTheme } from './utils/theme'

const initialTheme = initTheme()

export default function App() {
  return (
    <AppLayout initialTheme={initialTheme}>
      <section className="fade-in rounded-card border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Добро пожаловать
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Локальный менеджер лицензий и ключей. Offline, с шифрованием
          мастер-паролем. Каркас приложения готов — дальше подключим данные и
          безопасность.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Активные', value: '—', tone: 'text-green-600 dark:text-green-400' },
            { label: 'Истекают', value: '—', tone: 'text-amber-600 dark:text-amber-400' },
            { label: 'Просрочены', value: '—', tone: 'text-red-600 dark:text-red-400' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-surface px-4 py-3"
            >
              <p className="text-xs text-muted">{card.label}</p>
              <p className={`mt-1 text-xl font-semibold ${card.tone}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  )
}
