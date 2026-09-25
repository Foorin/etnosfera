import { useState } from 'react'
import { ArrowRight, Search, X } from 'lucide-react'

export type PeopleRow = { name: string; tone: string; count: number; group?: string }

// Окно выбора народа: в панели рядом с картой помещается лишь несколько строк,
// а искать нужный народ перебором по списку неудобно.
export function PeoplePicker({ title, rows, onPick, onClose }: {
  title: string
  rows: PeopleRow[]
  onPick: (name: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLocaleLowerCase()
  const matches = needle
    ? rows.filter((row) => row.name.toLocaleLowerCase().includes(needle) || (row.group ?? '').toLocaleLowerCase().includes(needle))
    : rows

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="publish-modal people-picker" role="dialog" aria-modal="true" aria-label="Выбрать народ" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><p className="kicker">Народы</p><h2>{title}</h2></div>
          <button onClick={onClose} aria-label="Закрыть"><X size={22} /></button>
        </div>

        <div className="modal-content">
          <label className="picker-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Начните вводить название народа"
              aria-label="Поиск народа"
              autoFocus
            />
            {query && <button onClick={() => setQuery('')} aria-label="Очистить"><X size={14} /></button>}
          </label>

          {matches.length > 0
            ? <div className="picker-list">
                {matches.map((row) => (
                  <button key={row.name} onClick={() => onPick(row.name)}>
                    <i className={`tone-${row.tone}`} />
                    <span>
                      <strong>{row.name}</strong>
                      {row.group && <small>{row.group}</small>}
                    </span>
                    <b>{row.count}</b>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            : <p className="picker-empty">Ничего не нашлось. Попробуйте другое написание — например, «мари» вместо «марийцы».</p>}
        </div>
      </section>
    </div>
  )
}
