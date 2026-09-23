import { useState } from 'react'
import { ArrowLeft, BookOpen, FileText, Image, Paperclip, Plus, Send, Sparkles, Trash2, Video, X } from 'lucide-react'
import { SearchSelect } from './SearchSelect'
import { TOPICS, PEOPLES } from './data/content'
import type { UserPost } from './data/account'

export const MATERIAL_TYPES = [
  'Устная история',
  'Аудиоистория',
  'Семейный архив',
  'Фотографии',
  'Видеозапись',
  'Документы',
  'Исследование',
  'Полевая запись',
]

// Редактор живёт на отдельной странице, а не в модальном окне: сказку или быличку
// в окно размером с диалог не напишешь, а тексты здесь бывают длинные.
export function EditorPage({ post, regionNames, onCancel, onSaveDraft, onPublish }: {
  post: UserPost
  regionNames: string[]
  onCancel: () => void
  onSaveDraft: (post: UserPost) => void
  onPublish: (post: UserPost) => void
}) {
  const isNew = !post.id
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState(post.title)
  const [lead, setLead] = useState(post.lead ?? '')
  const [summary, setSummary] = useState(post.summary ?? '')
  const [body, setBody] = useState(post.body ?? '')
  const [collected, setCollected] = useState(post.collected ?? '')
  const [source, setSource] = useState(post.source ?? '')
  const [people, setPeople] = useState(post.people)
  const [region, setRegion] = useState(post.region)
  const [topic, setTopic] = useState(TOPICS.find((item) => item.slug === post.topic)?.title ?? TOPICS[0].title)
  const [type, setType] = useState(post.type)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [rights, setRights] = useState(false)
  const [age, setAge] = useState(false)
  const [error, setError] = useState('')

  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return
    setGalleryFiles((current) => [...current, ...Array.from(files)].slice(0, 10))
  }

  const addAttachmentFiles = (files: FileList | null) => {
    if (!files) return
    setAttachmentFiles((current) => [...current, ...Array.from(files)])
  }

  const collect = (): UserPost => {
    const topicSlug = TOPICS.find((item) => item.title === topic)?.slug ?? post.topic
    return {
      ...post,
      title: title.trim() || 'Без названия',
      lead: lead.trim(),
      summary: summary.trim(),
      body: body.trim(),
      collected: collected.trim(),
      source: source.trim(),
      people,
      region,
      type,
      topic: topicSlug,
      image: topicSlug,
    }
  }

  const saveDraft = () => {
    if (!title.trim()) {
      setError('Дайте черновику название — иначе его не найти в списке')
      return
    }
    onSaveDraft({ ...collect(), status: 'Черновик', date: 'не отправлен' })
  }

  const publish = () => {
    if (!title.trim()) {
      setError('У материала должно быть название')
      setStep(1)
      return
    }
    if (!body.trim()) {
      setError('Добавьте основной текст — это то, что будут читать')
      setStep(1)
      return
    }
    if (!rights || !age) {
      setError('Отметьте оба пункта — без них публикация невозможна')
      setStep(3)
      return
    }
    onPublish(collect())
  }

  const charCount = body.trim().length

  return <section className="inner-page editor-page">
    <div className="breadcrumbs">
      <button onClick={onCancel}>Личный кабинет</button><span>/</span>
      <span>{isNew ? 'Новый материал' : post.status === 'Черновик' ? 'Черновик' : 'Редактирование'}</span>
    </div>

    <div className="editor-head">
      <div>
        <p className="kicker">{isNew ? 'Новая публикация' : 'Правка материала'}</p>
        <h1>{isNew ? 'Добавьте историю' : title || 'Без названия'}</h1>
      </div>
      <div className="editor-head-actions">
        <button className="outline-button" onClick={saveDraft}>Сохранить черновик</button>
        <button className="publish-button" onClick={publish}><Send size={16} /> Отправить на проверку</button>
      </div>
    </div>

    <div className="editor-steps">
      <button className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}><b>1</b> Материал</button>
      <button className={step === 2 ? 'active' : ''} onClick={() => setStep(2)}><b>2</b> Контекст</button>
      <button className={step === 3 ? 'active' : ''} onClick={() => setStep(3)}><b>3</b> Публикация</button>
    </div>

    {error && <div className="auth-error editor-error"><Sparkles size={17} /> {error}</div>}

    {step === 1 && <div className="editor-layout">
      <div className="editor-main">
        <label className="editor-field">Название
          <input className="editor-title-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, История старого дома" />
        </label>

        <label className="editor-field">Цитата-врезка
          <span className="field-hint">Одна фраза, с которой начнётся публикация. Обычно это слова рассказчика.</span>
          <textarea className="editor-lead" value={lead} onChange={(event) => setLead(event.target.value)} placeholder="«Когда печь затопят, бабушка садилась у окна и тихо начинала петь»" />
        </label>

        <label className="editor-field">Краткое описание
          <span className="field-hint">Две-три строки для карточки материала в каталоге.</span>
          <textarea className="editor-summary" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Коротко расскажите, что увидит или услышит человек" />
        </label>

        <label className="editor-field">Основной текст
          <span className="field-hint">Сама история: рассказ, сказка, быль, расшифровка разговора. Пустая строка разделяет абзацы.</span>
          <textarea className="editor-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Здесь пишется вся история целиком. Места хватит на длинный рассказ." />
          <span className="field-counter">{charCount > 0 ? `${charCount} знаков` : 'пока пусто'}</span>
        </label>

        <label className="editor-field">Как собирался материал
          <span className="field-hint">Кто рассказывал, когда и где записано, что осталось за кадром. Этот раздел идёт под основным текстом.</span>
          <textarea className="editor-collected" value={collected} onChange={(event) => setCollected(event.target.value)} placeholder="Мы записывали разговоры на телефон, затем вместе переслушивали их..." />
        </label>

        <label className="editor-field">Источник
          <span className="field-hint">Семейный архив, интервью, книга, музейный фонд.</span>
          <textarea className="editor-source" value={source} onChange={(event) => setSource(event.target.value)} placeholder="Личная беседа с Валентиной Кузнецовой, 2025 год. Семейный архив автора." />
        </label>
      </div>

      <aside className="editor-side">
        <div className="gallery-editor">
          <div className="gallery-editor-header">
            <div>
              <strong>Фотографии</strong>
              <span>{galleryFiles.length === 0
                ? 'Добавьте три: общий план, деталь и место'
                : galleryFiles.length < 3
                  ? `Добавлено ${galleryFiles.length} из 3`
                  : 'Три фотографии добавлены'}</span>
            </div>
            <label className="add-media-button"><Plus size={16} /> Добавить<input type="file" accept="image/*,video/*" multiple onChange={(event) => addGalleryFiles(event.target.files)} /></label>
          </div>
          {galleryFiles.length > 0 ? (
            <div className="gallery-strip">
              {galleryFiles.map((file, index) => (
                <div className="gallery-file" key={`${file.name}-${index}`}>
                  {file.type.startsWith('image/')
                    ? <img src={URL.createObjectURL(file)} alt={file.name} />
                    : <div className="video-placeholder"><Video size={24} /><span>{file.name}</span></div>}
                  <button onClick={() => setGalleryFiles((current) => current.filter((_, i) => i !== index))} aria-label={`Удалить ${file.name}`}><X size={14} /></button>
                  <small>{index + 1}</small>
                </div>
              ))}
            </div>
          ) : (
            <label className="gallery-empty"><Image size={26} /><strong>Здесь появится галерея</strong><span>Раскладка подстроится под число фотографий</span><input type="file" accept="image/*,video/*" multiple onChange={(event) => addGalleryFiles(event.target.files)} /></label>
          )}
        </div>

        <div className="attachments-editor">
          <div className="attachments-header">
            <div><strong>Аудио и документы</strong><span>Покажутся внизу публикации</span></div>
            <label className="attachment-add"><Paperclip size={16} /> Прикрепить<input type="file" accept="audio/*,.pdf,.doc,.docx,.txt,.odt" multiple onChange={(event) => addAttachmentFiles(event.target.files)} /></label>
          </div>
          {attachmentFiles.length > 0 && <div className="attachment-list">
            {attachmentFiles.map((file, index) => (
              <div className="attachment-row" key={`${file.name}-${index}`}>
                <FileText size={17} /><span title={file.name}>{file.name}</span>
                <small>{(file.size / 1024 / 1024).toFixed(1)} МБ</small>
                <button onClick={() => setAttachmentFiles((current) => current.filter((_, i) => i !== index))} aria-label={`Удалить ${file.name}`}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>}
        </div>
      </aside>
    </div>}

    {step === 2 && <div className="editor-context">
      <div className="form-grid">
        <SearchSelect label="Связанный народ" placeholder="Введите народ" options={PEOPLES.map((item) => item.name)} value={people} onPick={setPeople} />
        <SearchSelect label="Регион" placeholder="Введите регион" options={regionNames} value={region} onPick={setRegion} />
        <SearchSelect label="Тема" placeholder="Введите тему" options={TOPICS.map((item) => item.title)} value={topic} onPick={setTopic} />
        <SearchSelect label="Формат" placeholder="Введите формат" options={MATERIAL_TYPES} value={type} onPick={setType} />
        <SearchSelect label="Язык" placeholder="Введите язык" options={['Русский', 'Марийский', 'Татарский', 'Чувашский', 'Удмуртский', 'Башкирский']} />
        <SearchSelect label="Населённый пункт" placeholder="Введите название" options={['Йошкар-Ола', 'Сернур', 'Морки', 'Казань', 'Арск', 'Глазов', 'Белорецк']} />
      </div>
      <div className="notice"><BookOpen size={20} /><p>Народ и регион — независимые признаки: материал может относиться сразу к нескольким. Точные координаты частных домов округляются автоматически.</p></div>
    </div>}

    {step === 3 && <div className="editor-publish">
      <div className="notice"><BookOpen size={20} /><p>После технической проверки файлов материал будет опубликован. Автоматическая система проверяет публикацию на нарушения, а не на историческую достоверность.</p></div>
      <label className="check"><input type="checkbox" checked={rights} onChange={() => setRights(!rights)} /> <span>Я являюсь автором материалов либо имею разрешение на их размещение. Я разрешаю платформе хранить, обрабатывать, публично показывать и предоставлять материал для скачивания в течение срока его публикации.</span></label>
      <label className="check"><input type="checkbox" checked={age} onChange={() => setAge(!age)} /> <span>Я подтверждаю, что мне исполнилось 14 лет.</span></label>
    </div>}

    <div className="editor-footer">
      <button className="back-button" onClick={onCancel}><ArrowLeft size={16} /> Вернуться в кабинет</button>
      <div className="editor-footer-actions">
        {step > 1 && <button className="outline-button" onClick={() => setStep(step - 1)}>Назад</button>}
        {step < 3
          ? <button className="dark-button" onClick={() => setStep(step + 1)}>Продолжить</button>
          : <button className="publish-button" onClick={publish}><Send size={16} /> Отправить на проверку</button>}
      </div>
    </div>
  </section>
}
