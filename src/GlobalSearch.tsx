import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpen, MapPin, Search, UsersRound, X } from 'lucide-react'
import { searchEverything } from './search'
import type { SearchHit } from './search'
import type { Material } from './data/content'
import type { Place } from './data/geo'

// Поле поиска на главной раньше было декоративным, хотя подсказка «Enter» обещала действие.
export function GlobalSearch({ onOpenMaterial, onOpenPeople, onOpenPlace, onOpenTopic }: {
  onOpenMaterial: (material: Material) => void
  onOpenPeople: (name: string) => void
  onOpenPlace: (place: Place, path: string[]) => void
  onOpenTopic: (slug: string) => void
}) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [active, setActive] = useState(0)
  const box = useRef<HTMLDivElement | null>(null)

  const hits = searchEverything(query)
  const show = isOpen && query.trim().length >= 2

  useEffect(() => { setActive(0) }, [query])

  // Клик мимо закрывает подсказки: иначе список висит поверх страницы.
  useEffect(() => {
    const away = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])

  const pick = (hit: SearchHit) => {
    setIsOpen(false)
    setQuery('')
    if (hit.kind === 'material') onOpenMaterial(hit.material)
    if (hit.kind === 'people') onOpenPeople(hit.name)
    if (hit.kind === 'place') onOpenPlace(hit.place, hit.path)
    if (hit.kind === 'topic') onOpenTopic(hit.slug)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => Math.min(hits.length - 1, current + 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(0, current - 1))
    }
    if (event.key === 'Enter' && hits[active]) {
      event.preventDefault()
      pick(hits[active])
    }
    if (event.key === 'Escape') setIsOpen(false)
  }

  const icon = (hit: SearchHit) => {
    if (hit.kind === 'people') return <UsersRound size={16} />
    if (hit.kind === 'place') return <MapPin size={16} />
    if (hit.kind === 'topic') return <BookOpen size={16} />
    return <ArrowRight size={16} />
  }

  return (
    <div className="search-wrap" ref={box}>
      <label className="search-box">
        <Search size={20} />
        <input
          value={query}
          onChange={(event) => { setQuery(event.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Найти народ, место, историю или слово"
          aria-label="Поиск по атласу"
          aria-expanded={show}
          aria-autocomplete="list"
        />
        {query
          ? <button type="button" className="search-clear" onClick={() => { setQuery(''); setIsOpen(false) }} aria-label="Очистить поиск"><X size={15} /></button>
          : <kbd>Enter</kbd>}
      </label>

      {show && <div className="search-results" role="listbox">
        {hits.length > 0
          ? hits.map((hit, index) => (
              <button
                key={`${hit.kind}-${hit.title}-${index}`}
                className={`search-hit${index === active ? ' active' : ''}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(hit)}
                role="option"
                aria-selected={index === active}
              >
                <span className={`hit-icon hit-${hit.kind}`}>{icon(hit)}</span>
                <span className="hit-body">
                  <strong>{hit.title}</strong>
                  <small>{hit.note}</small>
                </span>
              </button>
            ))
          : <p className="search-empty">Ничего не нашлось. Попробуйте короче — например, «мари» вместо «марийский».</p>}
      </div>}
    </div>
  )
}
