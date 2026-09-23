import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

// Без этой обёртки любая ошибка в разметке гасит всё приложение и оставляет пустой фон —
// непонятно ни пользователю, ни тому, кто будет разбираться. Здесь ошибка хотя бы видна.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Сбой в интерфейсе:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <section className="inner-page crash-page">
        <div className="page-intro">
          <p className="kicker">Что-то пошло не так</p>
          <h1>Страница не отрисовалась</h1>
          <p>Это сбой в интерфейсе, а не ваши действия. Обновите страницу — обычно этого достаточно.</p>
        </div>
        <div className="crash-details">
          <strong>Техническая подробность</strong>
          <code>{this.state.error.message}</code>
        </div>
        <div className="crash-actions">
          <button className="publish-button" onClick={() => window.location.reload()}>Обновить страницу</button>
          <button className="outline-button" onClick={() => { window.location.hash = 'home'; window.location.reload() }}>На главную</button>
        </div>
      </section>
    )
  }
}
