import { useState } from 'react'
import { ArrowLeft, BookOpen, Check, Mail, ShieldCheck, Trash2 } from 'lucide-react'
import { initialsFrom } from './data/account'
import type { Account } from './data/account'

// Настройки профиля — отдельная страница, а не окно: полей много, и часть из них
// (смена почты, пароля, удаление аккаунта) требует спокойного чтения, а не спешки.
export function ProfileSettings({ account, postCount, collectionCount, onCancel, onSave, onDelete }: {
  account: Account
  postCount: number
  collectionCount: number
  onCancel: () => void
  onSave: (account: Account) => void
  onDelete: () => void
}) {
  const [name, setName] = useState(account.name)
  const [about, setAbout] = useState(account.about)
  const [email, setEmail] = useState(account.email)
  const [password, setPassword] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')
  const [publicProfile, setPublicProfile] = useState(account.publicProfile ?? true)
  const [publicPortfolio, setPublicPortfolio] = useState(account.publicPortfolio ?? false)
  const [language, setLanguage] = useState('Русский')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteWord, setDeleteWord] = useState('')

  const save = () => {
    if (!name.trim()) {
      setError('Имя или псевдоним не может быть пустым — оно показывается рядом с публикациями')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Проверьте адрес почты')
      return
    }
    if (password && password !== passwordAgain) {
      setError('Пароли не совпадают')
      return
    }
    if (password && password.length < 6) {
      setError('Пароль должен быть не короче шести знаков')
      return
    }
    setError('')
    setSaved(true)
    onSave({
      ...account,
      name: name.trim(),
      about: about.trim() || 'Расскажите о себе в настройках профиля.',
      email: email.trim(),
      initials: initialsFrom(name),
      publicProfile,
      publicPortfolio,
    })
  }

  return <section className="inner-page settings-page">
    <div className="breadcrumbs">
      <button onClick={onCancel}>Личный кабинет</button><span>/</span><span>Настройки профиля</span>
    </div>

    <div className="settings-head">
      <span className="profile-avatar settings-avatar">{initialsFrom(name)}</span>
      <div>
        <p className="kicker">Настройки</p>
        <h1>Профиль</h1>
        <p>Имя и описание видны рядом с вашими публикациями. Почта и пароль нужны только для входа и никому не показываются.</p>
      </div>
    </div>

    {error && <div className="auth-error settings-note"><ShieldCheck size={17} /> {error}</div>}
    {saved && !error && <div className="settings-saved"><Check size={17} /> Изменения сохранены</div>}

    <div className="settings-grid">
      <section className="settings-block">
        <h2>Как вас видят другие</h2>
        <label className="editor-field">Имя или псевдоним
          <span className="field-hint">Можно указать настоящее имя или любой псевдоним — национальность и место работы указывать не нужно.</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Алина Петрова" />
        </label>
        <label className="editor-field">О себе
          <span className="field-hint">Пара строк о том, что вы собираете и почему. Необязательно.</span>
          <textarea className="settings-about" value={about} onChange={(event) => setAbout(event.target.value)} placeholder="Собираю семейные истории и материалы о марийской культуре." />
        </label>
        <div className="avatar-note">
          <span className="profile-avatar settings-avatar-small">{initialsFrom(name)}</span>
          <p>Аватар собирается из первых букв имени. Загрузка своей картинки появится в рабочей версии.</p>
        </div>
      </section>

      <section className="settings-block">
        <h2>Вход в аккаунт</h2>
        <label className="editor-field">Электронная почта
          <span className="field-hint">На неё приходят уведомления и письмо для восстановления доступа.</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="editor-field">Новый пароль
          <span className="field-hint">Оставьте пустым, если менять не нужно.</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Не короче шести знаков" autoComplete="new-password" />
        </label>
        <label className="editor-field">Повторите новый пароль
          <input type="password" value={passwordAgain} onChange={(event) => setPasswordAgain(event.target.value)} autoComplete="new-password" />
        </label>
        <div className="notice"><Mail size={19} /><p>После смены почты на новый адрес придёт письмо для подтверждения. До подтверждения вход остаётся по старому адресу.</p></div>
      </section>

      <section className="settings-block">
        <h2>Приватность</h2>
        <button className={`toggle-row${publicProfile ? ' on' : ''}`} onClick={() => setPublicProfile(!publicProfile)} role="switch" aria-checked={publicProfile}>
          <span>
            <strong>Публичная страница профиля</strong>
            <small>{publicProfile ? 'Любой может открыть вашу страницу и увидеть публикации' : 'Страница профиля скрыта, публикации остаются доступными'}</small>
          </span>
          <span className="switch" aria-hidden="true"><i /></span>
        </button>
        <button className={`toggle-row${publicPortfolio ? ' on' : ''}`} onClick={() => setPublicPortfolio(!publicPortfolio)} role="switch" aria-checked={publicPortfolio}>
          <span>
            <strong>Публичное портфолио</strong>
            <small>{publicPortfolio ? 'Портфолио открыто по ссылке, в PDF добавляется QR-код' : 'Портфолио закрыто — его видите только вы'}</small>
          </span>
          <span className="switch" aria-hidden="true"><i /></span>
        </button>
        <label className="editor-field">Язык интерфейса
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option>Русский</option>
            <option>Марийский</option>
          </select>
        </label>
      </section>

      <section className="settings-block danger-block">
        <h2>Удаление аккаунта</h2>
        <div className="notice"><BookOpen size={19} /><p>Вместе с аккаунтом удалятся ваши черновики, коллекции и портфолио. Сейчас у вас {postCount} материалов и {collectionCount} коллекций.</p></div>
        {confirmDelete
          ? <div className="danger-zone">
              <p>Это действие необратимо. Чтобы подтвердить, введите слово <b>удалить</b> в поле ниже.</p>
              <input value={deleteWord} onChange={(event) => setDeleteWord(event.target.value)} placeholder="удалить" />
              <div className="danger-actions">
                <button
                  className="danger-button"
                  disabled={deleteWord.trim().toLocaleLowerCase() !== 'удалить'}
                  onClick={onDelete}
                ><Trash2 size={15} /> Удалить аккаунт навсегда</button>
                <button className="text-button" onClick={() => { setConfirmDelete(false); setDeleteWord('') }}>Отмена</button>
              </div>
            </div>
          : <button className="danger-link" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Удалить аккаунт</button>}
      </section>
    </div>

    <div className="editor-footer">
      <button className="back-button" onClick={onCancel}><ArrowLeft size={16} /> Вернуться в кабинет</button>
      <div className="editor-footer-actions">
        <button className="publish-button" onClick={save}>Сохранить изменения</button>
      </div>
    </div>
  </section>
}
