import { useState } from 'react'
import { BookOpen, Check, FolderHeart, Mail, Plus, Send, ShieldCheck, Trash2, X } from 'lucide-react'
import {
  ACCESS_OPTIONS,
  COLLECTION_COVERS,
  DEMO_ACCOUNT,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  initialsFrom,
} from './data/account'
import type { Account, CollectionAccess, UserCollection } from './data/account'

// Вход и регистрация смоделированы: пароль никуда не уходит и нигде не хранится.
export function AuthModal({ onClose, onSignIn }: { onClose: () => void; onSignIn: (account: Account) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [agreements, setAgreements] = useState([false, false, false, false])
  const [error, setError] = useState('')

  const allAgreed = agreements.every(Boolean)

  const toggleAgreement = (index: number) => {
    setAgreements((current) => current.map((value, position) => (position === index ? !value : value)))
  }

  const submit = () => {
    if (!email.trim() || !password.trim()) {
      setError('Заполните почту и пароль')
      return
    }
    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Укажите имя или псевдоним — оно будет видно рядом с публикациями')
        return
      }
      if (!allAgreed) {
        setError('Для регистрации нужно подтвердить все четыре пункта')
        return
      }
      onSignIn({
        name: name.trim(),
        email: email.trim(),
        initials: initialsFrom(name),
        about: 'Расскажите о себе в настройках профиля.',
        isNew: true,
      })
      return
    }
    // Демонстрация: подойдёт любая пара, но у демо-аккаунта уже есть материалы и коллекции.
    onSignIn(email.trim().toLocaleLowerCase() === DEMO_EMAIL
      ? DEMO_ACCOUNT
      : { ...DEMO_ACCOUNT, email: email.trim() })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="publish-modal auth-modal" role="dialog" aria-modal="true" aria-label="Вход в личный кабинет" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><p className="kicker">Личный кабинет</p><h2>{mode === 'signin' ? 'Вход' : 'Регистрация'}</h2></div>
          <button onClick={onClose} aria-label="Закрыть"><X size={22} /></button>
        </div>

        <div className="auth-switch">
          <button className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError('') }}>Вход</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError('') }}>Регистрация</button>
        </div>

        <div className="modal-content">
          {mode === 'signup' && (
            <label>Имя или псевдоним<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Как вас подписывать рядом с материалами" /></label>
          )}
          <label>Электронная почта<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.ru" autoComplete="username" /></label>
          <label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите пароль" autoComplete="current-password" /></label>

          {mode === 'signup' && (
            <div className="agreements">
              <label className="check"><input type="checkbox" checked={agreements[0]} onChange={() => toggleAgreement(0)} /> <span>Мне исполнилось 14 лет</span></label>
              <label className="check"><input type="checkbox" checked={agreements[1]} onChange={() => toggleAgreement(1)} /> <span>Я согласен с правилами публикации</span></label>
              <label className="check"><input type="checkbox" checked={agreements[2]} onChange={() => toggleAgreement(2)} /> <span>Я согласен с пользовательским соглашением</span></label>
              <label className="check"><input type="checkbox" checked={agreements[3]} onChange={() => toggleAgreement(3)} /> <span>Я согласен на обработку персональных данных</span></label>
            </div>
          )}

          {error && <div className="auth-error"><ShieldCheck size={17} /> {error}</div>}

          {mode === 'signin' && (
            <div className="notice demo-note">
              <BookOpen size={20} />
              <p>Это демонстрация: подойдёт любая почта и любой пароль. Чтобы увидеть кабинет с готовыми материалами, войдите как <b>{DEMO_EMAIL}</b> с паролем <b>{DEMO_PASSWORD}</b>.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {mode === 'signin' && <button className="back-button" onClick={() => setError('Восстановление пароля появится в рабочей версии')}><Mail size={16} /> Забыли пароль?</button>}
          <button className="publish-button" onClick={submit}>
            {mode === 'signin' ? 'Войти' : <><Check size={16} /> Зарегистрироваться</>}
          </button>
        </div>
      </section>
    </div>
  )
}

// Одно окно и для создания, и для правки: поля те же, отличаются только заголовок,
// подпись кнопки и наличие удаления.
export function CollectionModal({ account, collection, onClose, onCreate, onDelete }: {
  account: Account
  collection?: UserCollection | null
  onClose: () => void
  onCreate: (collection: UserCollection) => void
  onDelete?: (id: string) => void
}) {
  const isEdit = Boolean(collection)
  const [name, setName] = useState(collection?.name ?? '')
  const [description, setDescription] = useState(collection && collection.description !== 'Описание пока не добавлено' ? collection.description : '')
  const [access, setAccess] = useState<CollectionAccess>(collection?.access ?? 'Приватная')
  const [cover, setCover] = useState(collection?.cover ?? COLLECTION_COVERS[0])
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const submit = () => {
    if (!name.trim()) {
      setError('У коллекции должно быть название')
      return
    }
    onCreate({
      ...(collection ?? {
        id: `coll-${Date.now()}`,
        count: 0,
        author: account.name,
        authorInitials: account.initials,
        items: [],
      }),
      name: name.trim(),
      description: description.trim() || 'Описание пока не добавлено',
      access,
      cover,
    } as UserCollection)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="publish-modal" role="dialog" aria-modal="true" aria-label="Создать коллекцию" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><p className="kicker">{isEdit ? 'Правка подборки' : 'Новая подборка'}</p><h2>{isEdit ? 'Настройки коллекции' : 'Создать коллекцию'}</h2></div>
          <button onClick={onClose} aria-label="Закрыть"><X size={22} /></button>
        </div>

        <div className="modal-content">
          <label>Название<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Голоса моей деревни" /></label>
          <label>Описание<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="О чём эта подборка и для кого вы её собираете" /></label>

          <div className="cover-picker">
            <span className="side-label">Обложка</span>
            <div className="cover-options">
              {COLLECTION_COVERS.map((option) => (
                <button
                  key={option}
                  className={`collection-cover ${option}${cover === option ? ' selected' : ''}`}
                  onClick={() => setCover(option)}
                  aria-label={`Обложка ${option}`}
                  aria-pressed={cover === option}
                ><i /><i /><i /></button>
              ))}
            </div>
          </div>

          <div className="access-picker">
            <span className="side-label">Доступ</span>
            <div className="access-options">
              {ACCESS_OPTIONS.map((option) => (
                <button key={option} className={access === option ? 'active' : ''} onClick={() => setAccess(option)} aria-pressed={access === option}>{option}</button>
              ))}
            </div>
            <p className="filter-hint">{access === 'Приватная'
              ? 'Коллекцию видите только вы.'
              : access === 'По ссылке'
                ? 'Коллекцию откроет любой, у кого есть ссылка.'
                : 'Коллекция появится в общем разделе «Коллекции».'}</p>
          </div>

          {error && <div className="auth-error"><ShieldCheck size={17} /> {error}</div>}

          {isEdit && onDelete && collection && (
            <div className="danger-zone">
              {confirmDelete
                ? <>
                    <p>Удалить коллекцию «{collection.name}» вместе с её составом? Сами материалы останутся на сайте, исчезнет только подборка.</p>
                    <div className="danger-actions">
                      <button className="danger-button" onClick={() => onDelete(collection.id)}><Trash2 size={15} /> Да, удалить</button>
                      <button className="text-button" onClick={() => setConfirmDelete(false)}>Отмена</button>
                    </div>
                  </>
                : <button className="danger-link" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Удалить коллекцию</button>}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="publish-button" onClick={submit}><FolderHeart size={16} /> {isEdit ? 'Сохранить' : 'Создать коллекцию'}</button>
        </div>
      </section>
    </div>
  )
}

export function SuccessNote({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="publish-modal success-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><p className="kicker">Готово</p><h2>{title}</h2></div>
          <button onClick={onClose} aria-label="Закрыть"><X size={22} /></button>
        </div>
        <div className="modal-content">
          <div className="notice"><Send size={20} /><p>{text}</p></div>
        </div>
        <div className="modal-footer">
          <button className="publish-button" onClick={onClose}>Перейти в кабинет</button>
        </div>
      </section>
    </div>
  )
}

// Выбор коллекции для материала. Здесь же можно завести новую — чтобы не гонять
// человека в кабинет и обратно посреди чтения.
export function AddToCollectionModal({ account, title, collections, inside, onClose, onToggle, onCreate }: {
  account: Account
  title: string
  collections: UserCollection[]
  inside: string[]
  onClose: () => void
  onToggle: (collectionId: string) => void
  onCreate: (name: string) => void
}) {
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const create = () => {
    if (!newName.trim()) {
      setError('Введите название коллекции')
      return
    }
    onCreate(newName.trim())
    setNewName('')
    setError('')
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="publish-modal" role="dialog" aria-modal="true" aria-label="Добавить в коллекцию" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><p className="kicker">Сохранить материал</p><h2>Добавить в коллекцию</h2></div>
          <button onClick={onClose} aria-label="Закрыть"><X size={22} /></button>
        </div>

        <div className="modal-content">
          <p className="collect-target">«{title}»</p>

          {collections.length > 0
            ? <div className="collect-list">
                {collections.map((collection) => {
                  const isInside = inside.includes(collection.id)
                  return <button
                    className={`collect-row${isInside ? ' inside' : ''}`}
                    key={collection.id}
                    onClick={() => onToggle(collection.id)}
                    aria-pressed={isInside}
                  >
                    <span className={`collect-cover collection-cover ${collection.cover}`}><i /><i /><i /></span>
                    <span className="collect-body">
                      <strong>{collection.name}</strong>
                      <small>{collection.items.length} материалов · {collection.access.toLocaleLowerCase()}</small>
                    </span>
                    <span className="collect-mark">{isInside ? <Check size={17} /> : <Plus size={17} />}</span>
                  </button>
                })}
              </div>
            : <div className="notice"><FolderHeart size={20} /><p>У вас пока нет коллекций. Создайте первую — материал сразу попадёт в неё.</p></div>}

          <div className="collect-new">
            <span className="side-label">Новая коллекция</span>
            <div className="collect-new-row">
              <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Например, Голоса моей деревни" />
              <button className="outline-button" onClick={create}><Plus size={15} /> Создать</button>
            </div>
            <p className="filter-hint">Коллекцию собирает {account.name}. Доступ по умолчанию — приватный, сменить его можно в кабинете.</p>
          </div>

          {error && <div className="auth-error"><ShieldCheck size={17} /> {error}</div>}
        </div>

        <div className="modal-footer">
          <button className="publish-button" onClick={onClose}>Готово</button>
        </div>
      </section>
    </div>
  )
}
