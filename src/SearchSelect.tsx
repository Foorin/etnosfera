import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

// Общий выпадающий список с поиском: используется и в редакторе материала, и в фильтрах каталога.
export function SearchSelect({
  label,
  options,
  placeholder = 'Начните вводить',
  className = '',
  value: initialValue = '',
  onPick,
}: {
  label: string
  options: string[]
  placeholder?: string
  className?: string
  value?: string
  onPick?: (option: string) => void
}) {
  const [value, setValue] = useState(initialValue)
  const [query, setQuery] = useState(initialValue)
  const [isOpen, setIsOpen] = useState(false)
  const matches = options.filter((option) => option.toLocaleLowerCase().includes(query.toLocaleLowerCase()))

  const choose = (option: string) => {
    setValue(option)
    setQuery(option)
    setIsOpen(false)
    onPick?.(option)
  }

  return <label className={`search-select ${className}`}>
    <span>{label}</span>
    <div className="search-select-control">
      <Search size={15} />
      <input
        value={query}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          setValue('')
          setIsOpen(true)
        }}
        onBlur={() => window.setTimeout(() => {
          setIsOpen(false)
          setQuery(value)
        }, 160)}
        aria-label={label}
        aria-expanded={isOpen}
        aria-autocomplete="list"
      />
      <ChevronDown size={16} />
      {isOpen && <div className="search-select-options" role="listbox">
        {matches.length > 0 ? matches.map((option) => <button type="button" key={option} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>{option}</button>) : <span>Ничего не найдено</span>}
      </div>}
    </div>
  </label>
}
