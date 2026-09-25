import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Compass,
  Download,
  FileText,
  Filter,
  FolderHeart,
  Globe2,
  Heart,
  Image,
  Languages,
  ListFilter,
  Map,
  MapPin,
  Menu,
  Paperclip,
  Play,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  Video,
  X,
  LogOut,
  Eye,
  EyeOff,
  Pencil,
  Star,
} from 'lucide-react'
import { MATERIALS, PEOPLES, TOPICS, countForPeople, countForRegion, countForTopic, materialBySlug, materialsFor, peopleByName, topicBySlug } from './data/content'
import type { Material } from './data/content'
import { SearchSelect } from './SearchSelect'
import { EditorPage } from './Editor'
import { ProfileSettings } from './ProfileSettings'
import { Globe } from './Globe'
import { PeoplePicker } from './PeoplePicker'
import type { PeopleRow } from './PeoplePicker'
import { RUSSIA, materialsAtPlace, pathToPlace, placeById } from './data/geo'
import type { Place } from './data/geo'
import { AddToCollectionModal, AuthModal, CollectionModal, SuccessNote } from './AccountModals'
import { COLLECTION_COVERS, DEMO_ACCOUNT, DEMO_COLLECTIONS, DEMO_POSTS, EMPTY_POST, FEATURED_COLLECTION, PUBLIC_COLLECTIONS } from './data/account'
import type { Account, UserCollection, UserPost } from './data/account'

type Region = {
  id: string
  name: string
  materials: number
  peoples: { name: string; count: number; tone: string }[]
  description: string
  x: string
  y: string
}

const regions: Region[] = [
  {
    id: 'mari-el',
    name: 'Республика Марий Эл',
    materials: 432,
    peoples: [
      { name: 'Марийцы', count: 250, tone: 'mari' },
      { name: 'Русские', count: 93, tone: 'russian' },
      { name: 'Татары', count: 51, tone: 'tatar' },
      { name: 'Чуваши', count: 24, tone: 'chuvash' },
    ],
    description: 'Семейные архивы, песни, орнаменты и истории жителей Поволжья.',
    x: '41%',
    y: '57%',
  },
  {
    id: 'tatarstan',
    name: 'Республика Татарстан',
    materials: 189,
    peoples: [
      { name: 'Татары', count: 106, tone: 'tatar' },
      { name: 'Русские', count: 49, tone: 'russian' },
      { name: 'Чуваши', count: 18, tone: 'chuvash' },
    ],
    description: 'Материалы о городских и сельских традициях, ремесле и семейной памяти.',
    x: '36%',
    y: '61%',
  },
  {
    id: 'udmurtia',
    name: 'Удмуртская Республика',
    materials: 121,
    peoples: [
      { name: 'Удмурты', count: 75, tone: 'udmurt' },
      { name: 'Русские', count: 31, tone: 'russian' },
      { name: 'Татары', count: 15, tone: 'tatar' },
    ],
    description: 'Архивные фотографии, музыкальная традиция и деревенские истории.',
    x: '46%',
    y: '54%',
  },
  {
    id: 'bashkortostan',
    name: 'Республика Башкортостан',
    materials: 97,
    peoples: [
      { name: 'Башкиры', count: 52, tone: 'bashkir' },
      { name: 'Татары', count: 27, tone: 'tatar' },
      { name: 'Русские', count: 18, tone: 'russian' },
    ],
    description: 'Пилотная подборка устных историй и семейных документов.',
    x: '51%',
    y: '64%',
  },
]

const routes = new Set(['home', 'map', 'peoples', 'people', 'region', 'topic', 'material', 'collections', 'collection', 'profile', 'editor', 'settings'])

type Location = {
  route: string
  people: string | null
  topic: string | null
  material: string | null
  region: string | null
  collection: string | null
  // Путь по карте: пустой массив — планета, дальше ['ru'], ['ru','mari-el'] и глубже.
  place: string[]
}

const HOME: Location = { route: 'home', people: null, topic: null, material: null, region: null, collection: null, place: [] }

// Адрес хранится в хеше сегментами: #people/tatar, #topic/tatar/language, #material/<слаг>.
// Благодаря этому у каждого материала есть своя ссылка, а обновление страницы не сбрасывает экран.
function parseHash(): Location {
  const segments = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [route, first, second, third] = segments
  if (!route || !routes.has(route)) return HOME
  if (route === 'people') return {
    ...HOME,
    route,
    people: PEOPLES.find((item) => item.slug === first)?.name ?? null,
    region: regions.find((item) => item.id === second)?.id ?? null,
  }
  if (route === 'topic') return {
    ...HOME,
    route,
    people: PEOPLES.find((item) => item.slug === first)?.name ?? null,
    topic: TOPICS.find((item) => item.slug === second)?.slug ?? null,
    region: regions.find((item) => item.id === third)?.id ?? null,
  }
  if (route === 'material') {
    const material = MATERIALS.find((item) => item.slug === first)
    if (!material) return HOME
    return { ...HOME, route, people: material.people, topic: material.topic, material: material.slug }
  }
  // Страница региона теперь одна — уровень карты. Старый адрес переводим на неё.
  if (route === 'region') return { ...HOME, route: 'map', place: ['ru', first ?? 'mari-el'] }
  if (route === 'map') return { ...HOME, route, place: segments.slice(1) }
  if (route === 'collection') return { ...HOME, route, collection: first ?? null }
  if (route === 'editor') return { ...HOME, route, material: first ?? null }
  return { ...HOME, route }
}

function shortRegion(name: string) {
  return name.replace('Республика ', '').replace('Удмуртская Республика', 'Удмуртия')
}

function regionInPrepositional(name: string) {
  return name
    .replace('Удмуртская Республика', 'Удмуртской Республике')
    .replace('Республика', 'Республике')
}

function placeKindLabel(place: Place) {
  if (place.kind === 'country') return 'Страна'
  if (place.kind === 'region') return 'Регион'
  if (place.kind === 'district') return 'Район'
  return 'Населённый пункт'
}

function materialsWord(count: number) {
  const tail = count % 100 >= 11 && count % 100 <= 14 ? 0 : count % 10
  if (tail === 1) return `${count} материал`
  if (tail >= 2 && tail <= 4) return `${count} материала`
  return `${count} материалов`
}

function locationToHash(location: Location) {
  if (location.route === 'people') return [
    'people',
    PEOPLES.find((item) => item.name === location.people)?.slug ?? '',
    location.region,
  ].filter(Boolean).join('/')
  if (location.route === 'topic') return [
    'topic',
    PEOPLES.find((item) => item.name === location.people)?.slug ?? 'all',
    location.topic ?? '',
    location.region,
  ].filter(Boolean).join('/')
  if (location.route === 'material') return `material/${location.material ?? ''}`
  if (location.route === 'region') return `region/${location.region ?? ''}`
  if (location.route === 'map') return ['map', ...location.place].join('/')
  if (location.route === 'collection') return `collection/${location.collection ?? ''}`
  if (location.route === 'editor') return location.material ? `editor/${location.material}` : 'editor'
  return location.route
}

function App() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(regions[0])
  const [selectedPeople, setSelectedPeople] = useState('Все народы')
  const [availableRegions, setAvailableRegions] = useState<Region[]>(regions)
  // Материал, открытый в редакторе. Пустой id означает создание нового.
  const [draft, setDraft] = useState<UserPost | null>(null)
  // Кабинет смоделирован: аккаунт и созданное живут в памяти вкладки и исчезают при обновлении страницы.
  const [account, setAccount] = useState<Account | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isCollectionOpen, setIsCollectionOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<UserCollection | null>(null)
  const [peoplePicker, setPeoplePicker] = useState<{ title: string; rows: PeopleRow[]; region: Region | null } | null>(null)
  const [collectingMaterial, setCollectingMaterial] = useState<Material | null>(null)
  const [successNote, setSuccessNote] = useState<{ title: string; text: string } | null>(null)
  const [myPosts, setMyPosts] = useState<UserPost[]>([])
  const [myCollections, setMyCollections] = useState<UserCollection[]>([])
  const [profileTab, setProfileTab] = useState<'portfolio' | 'posts' | 'collections'>('portfolio')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [language, setLanguage] = useState('RU')
  const [location, setLocation] = useState<Location>(parseHash)

  const route = location.route
  const selectedEthnos = location.people ?? 'Марийцы'
  const availablePublications = MATERIALS
  // Свои коллекции идут первыми, чтобы только что созданная перекрывала одноимённую демонстрационную.
  const allCollections = [...myCollections, ...PUBLIC_COLLECTIONS]
    .filter((collection, index, list) => list.findIndex((item) => item.id === collection.id) === index)
  // Фильтр по региону живёт в адресе, а не в состоянии: иначе он терялся бы при переходе в тему и при F5.
  const ethnosRegionFilter = location.region
    ? availableRegions.find((region) => region.id === location.region) ?? null
    : null

  const selectRegion = (region: Region) => {
    setSelectedRegion(region)
    setSelectedPeople('Все народы')
    // На странице региона выбор в боковом списке должен менять и адрес, иначе ссылка перестанет совпадать с экраном.
    if (location.route === 'map' && location.place[1]) go({ ...HOME, route: 'map', place: ['ru', region.id] })
  }

  useEffect(() => {
    const syncRoute = () => {
      const next = parseHash()
      setLocation(next)
      if (next.region) {
        const target = availableRegions.find((region) => region.id === next.region)
        if (target) setSelectedRegion(target)
      }
    }
    syncRoute()
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [availableRegions])

  useEffect(() => {
    fetch('/api/regions')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((loadedRegions) => {
        if (Array.isArray(loadedRegions) && loadedRegions.length > 0) setAvailableRegions(loadedRegions)
      })
      .catch(() => {
        // The static demo data keeps the interface usable before the local API starts.
      })
  }, [])

  const go = (next: Location) => {
    setLocation(next)
    setIsMenuOpen(false)
    window.location.hash = locationToHash(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigate = (nextRoute: string) => {
    if (nextRoute === 'region') return go({ ...HOME, route: 'map', place: ['ru', selectedRegion.id] })
    go({ ...HOME, route: nextRoute })
  }

  const openEthnos = (name: string, region: Region | null = null) => {
    go({ ...HOME, route: 'people', people: name, region: region?.id ?? null })
  }

  const openTopic = (peopleName: string | null, topicSlug: string, regionId: string | null = null) => {
    go({ ...HOME, route: 'topic', people: peopleName, topic: topicSlug, region: regionId })
  }

  const goPlace = (place: string[]) => {
    go({ ...HOME, route: 'map', place })
  }

  const openCollection = (collection: UserCollection) => {
    go({ ...HOME, route: 'collection', collection: collection.id })
  }

  const openMaterial = (material: Material) => {
    go({ ...HOME, route: 'material', people: material.people, topic: material.topic, material: material.slug })
  }

  const setEthnosRegion = (region: Region) => {
    setSelectedRegion(region)
    go({ ...location, region: region.id })
  }

  const signIn = (nextAccount: Account) => {
    setAccount(nextAccount)
    setIsAuthOpen(false)
    // Новому автору кабинет показывается пустым, демо-аккаунту — с уже накопленными работами.
    setMyPosts(nextAccount.isNew ? [] : DEMO_POSTS)
    setMyCollections(nextAccount.isNew ? [] : DEMO_COLLECTIONS)
    setProfileTab('portfolio')
    go({ ...HOME, route: 'profile' })
  }

  const saveAccount = (updated: Account) => {
    setAccount(updated)
  }

  const deleteAccount = () => {
    setAccount(null)
    setMyPosts([])
    setMyCollections([])
    navigate('home')
    setSuccessNote({
      title: 'Аккаунт удалён',
      text: 'Профиль, черновики, коллекции и портфолио удалены. Опубликованные материалы остаются на сайте без привязки к автору.',
    })
  }

  const signOut = () => {
    setAccount(null)
    setMyPosts([])
    setMyCollections([])
    navigate('home')
  }

  // Публиковать и открывать кабинет может только вошедший — иначе сначала предлагаем войти.
  const withAccount = (action: () => void) => {
    if (!account) {
      setIsAuthOpen(true)
      return
    }
    action()
  }

  const publishPost = (edited: UserPost) => {
    const published: UserPost = {
      ...edited,
      id: edited.id || `post-${Date.now()}`,
      status: 'На проверке',
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    }
    setMyPosts((current) => current.some((post) => post.id === published.id)
      ? current.map((post) => post.id === published.id ? published : post)
      : [published, ...current])
    setDraft(null)
    setProfileTab('posts')
    go({ ...HOME, route: 'profile' })
    setSuccessNote({
      title: 'Материал отправлен',
      text: 'Материал ушёл на проверку — он виден в разделе «Мои публикации» со статусом «На проверке». Как только проверка завершится, статус сменится на «Опубликован».',
    })
  }

  const createCollection = (collection: UserCollection) => {
    setMyCollections((current) => [collection, ...current])
    setIsCollectionOpen(false)
    setProfileTab('collections')
    setSuccessNote({
      title: 'Коллекция создана',
      text: `Подборка «${collection.name}» появилась в кабинете. Добавляйте в неё материалы кнопкой «Добавить в коллекцию» на странице любой публикации.`,
    })
  }

  const openEditor = (post: UserPost) => {
    setDraft(post)
    go({ ...HOME, route: 'editor', material: post.id || null })
  }

  const saveDraft = (updated: UserPost) => {
    const saved = updated.id ? updated : { ...updated, id: `post-${Date.now()}` }
    setMyPosts((current) => current.some((post) => post.id === saved.id)
      ? current.map((post) => post.id === saved.id ? saved : post)
      : [saved, ...current])
    setDraft(null)
    setProfileTab('posts')
    go({ ...HOME, route: 'profile' })
  }

  const toggleInCollection = (collectionId: string, slug: string) => {
    setMyCollections((current) => current.map((collection) => {
      if (collection.id !== collectionId) return collection
      const items = collection.items.includes(slug)
        ? collection.items.filter((item) => item !== slug)
        : [...collection.items, slug]
      return { ...collection, items, count: items.length }
    }))
  }

  const createCollectionWith = (name: string, slug: string) => {
    setMyCollections((current) => [{
      id: `coll-${Date.now()}`,
      name,
      description: 'Описание пока не добавлено',
      count: 1,
      access: 'Приватная',
      cover: COLLECTION_COVERS[current.length % COLLECTION_COVERS.length],
      author: account?.name ?? 'Автор',
      authorInitials: account?.initials ?? 'ЭС',
      items: [slug],
    }, ...current])
  }

  const saveCollection = (collection: UserCollection) => {
    setMyCollections((current) => current.map((item) => item.id === collection.id ? collection : item))
    setEditingCollection(null)
  }

  const deleteCollection = (id: string) => {
    const removed = myCollections.find((collection) => collection.id === id)
    setMyCollections((current) => current.filter((collection) => collection.id !== id))
    setEditingCollection(null)
    setProfileTab('collections')
    // После удаления возвращаемся в кабинет: страницы этой коллекции больше нет.
    go({ ...HOME, route: 'profile' })
    if (removed) setSuccessNote({ title: 'Коллекция удалена', text: `Подборка «${removed.name}» удалена. Материалы, которые в ней были, остались на сайте.` })
  }

  const saveCollectionToMine = (collection: UserCollection) => {
    const already = myCollections.find((item) => item.savedFrom && item.name === collection.name)
    if (already) {
      setSuccessNote({ title: 'Уже сохранено', text: `Подборка «${collection.name}» уже лежит у вас в кабинете.` })
      return
    }
    setMyCollections((current) => [{
      ...collection,
      id: `coll-${Date.now()}`,
      access: 'Приватная',
      savedFrom: collection.author,
    }, ...current])
    setProfileTab('collections')
    setSuccessNote({
      title: 'Подборка сохранена',
      text: `«${collection.name}» добавлена в ваш кабинет. Автор оригинала — ${collection.author}, состав подборки сохранён целиком.`,
    })
  }

  const togglePortfolio = (id: string) => {
    setMyPosts((current) => current.map((post) => post.id === id
      ? { ...post, inPortfolio: !post.inPortfolio }
      : post))
  }

  const togglePostVisibility = (id: string) => {
    setMyPosts((current) => current.map((post) => post.id === id
      ? { ...post, status: post.status === 'Скрыт' ? 'Опубликован' : post.status === 'Опубликован' ? 'Скрыт' : post.status }
      : post))
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); navigate('home') }} aria-label="ЭтноСфера, на главную">
          <span className="brand-mark"><i /><i /><i /><i /></span>
          <span>этносфера</span>
        </a>
        <nav className={isMenuOpen ? 'nav open' : 'nav'}>
          <button className={route === 'home' ? 'active' : ''} onClick={() => navigate('home')}>Карта</button>
          <button className={route === 'peoples' || route === 'people' ? 'active' : ''} onClick={() => navigate('peoples')}>Народы</button>
          <button className={route === 'collections' ? 'active' : ''} onClick={() => navigate('collections')}>Коллекции</button>
          <button className={route === 'profile' ? 'active' : ''} onClick={() => withAccount(() => navigate('profile'))}>Моё портфолио</button>
        </nav>
        <div className="header-actions">
          <button className="language" onClick={() => setLanguage(language === 'RU' ? 'МАР' : 'RU')} aria-label="Сменить язык">
            <Languages size={16} /> {language}
          </button>
          <button className="publish-button" onClick={() => withAccount(() => openEditor({ ...EMPTY_POST }))}>
            <Upload size={16} /> Добавить материал
          </button>
          {account
            ? <button className="account-avatar" onClick={() => navigate('profile')} aria-label={`Личный кабинет: ${account.name}`} title={account.name}>
                {account.initials}
              </button>
            : <button className="signin-button" onClick={() => setIsAuthOpen(true)}>Войти</button>}
          <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Открыть меню">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {route === 'home' ? <>
      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Цифровой атлас культурной памяти</div>
          <h1>Эти голоса звучат <em>по всему миру.</em></h1>
          <p>Народы России живут не только в России. Начните с планеты и дойдите до отдельного села — до историй, языков и традиций, которые сохранили люди.</p>
          <label className="search-box">
            <Search size={20} />
            <input placeholder="Найти народ, место, историю или слово" />
            <kbd>Enter</kbd>
          </label>
          <div className="hero-meta">
            <span><b>1 248</b> материалов</span>
            <span><b>34</b> народа</span>
            <span><b>19</b> регионов</span>
          </div>
        </div>
        <div className="hero-art" aria-label="Орнамент, вдохновленный народными традициями">
          <div className="sun-disc"><span>этно<br />сфера</span></div>
          <div className="arch arch-one" />
          <div className="arch arch-two" />
          <div className="star star-one" />
          <div className="star star-two" />
          <div className="hero-note"><MapPin size={16} /> Начните с места, которое знаете</div>
        </div>
      </section>

      <section className="atlas-section" id="atlas">
        <div className="section-heading">
          <div>
            <p className="kicker">От планеты до села</p>
            <h2>Выберите точку на карте мира</h2>
          </div>
          <button className="text-button">Весь каталог <ArrowRight size={17} /></button>
        </div>

        <div className="atlas-layout">
          <div className="map-shell">
            <div className="map-toolbar">
              <span><Globe2 size={16} /> Все регионы</span>
              <button><Filter size={15} /> Фильтры</button>
            </div>
            <Globe ids={[]} onGo={goPlace} />
          </div>

          {/* Панель описывает то, что отмечено на глобусе, — страну, а не один регион. */}
          <aside className="region-panel">
            <div className="panel-topline"><span>Отмечено на планете</span><Compass size={18} /></div>
            <h3>Россия</h3>
            <p>{RUSSIA.description}</p>
            <div className="region-stat"><b>{MATERIALS.length}</b><span>публикаций<br />по всей стране</span></div>
            <div className="people-list">
              <span className="list-label">Регионы с материалами</span>
              {RUSSIA.children!.map((region) => (
                <button className="people-row" onClick={() => goPlace(['ru', region.id])} key={region.id}>
                  <i className={`tone-${region.tone ?? 'mari'}`} />
                  <span>{shortRegion(region.name)}</span>
                  <b>{countForRegion(region.regionName ?? '')}</b>
                  <ArrowRight size={15} />
                </button>
              ))}
            </div>
            <button className="outline-button" onClick={() => goPlace(['ru'])}>Открыть карту России <ArrowRight size={16} /></button>
          </aside>
        </div>
      </section>

      <section className="peoples-section" id="peoples">
        <div className="section-heading compact">
          <div>
            <p className="kicker">Народы России</p>
            <h2>Каждая культура - отдельный мир</h2>
          </div>
          <div className="slider-controls"><button>←</button><button>→</button></div>
        </div>
        <div className="people-cards">
          <article className="people-card mari-card">
            <span className="pattern-label">МАРИЙЦЫ · МАРИЙ</span>
            <div className="card-ornament mari-ornament"><i /><i /><i /><i /><i /></div>
            <h3>Марийцы</h3>
            <p>Язык, лесная культура, семейные истории и звучание мари.</p>
            <button onClick={() => openEthnos('Марийцы')}>Открыть страницу <ArrowRight size={16} /></button>
          </article>
          <article className="people-card tatar-card">
            <span className="pattern-label">ТАТАРЫ · TATARLAR</span>
            <div className="card-ornament tatar-ornament"><i /><i /><i /><i /><i /></div>
            <h3>Татары</h3>
            <p>Городские и сельские традиции, музыка, словесность и мастерство.</p>
            <button onClick={() => openEthnos('Татары')}>Открыть страницу <ArrowRight size={16} /></button>
          </article>
          <article className="people-card chuvash-card">
            <span className="pattern-label">ЧУВАШИ · ЧĂВАШ</span>
            <div className="card-ornament chuvash-ornament"><i /><i /><i /><i /><i /></div>
            <h3>Чуваши</h3>
            <p>Узоры, обряды, песни и память поколений в одном пространстве.</p>
            <button onClick={() => openEthnos('Чуваши')}>Открыть страницу <ArrowRight size={16} /></button>
          </article>
        </div>
      </section>

      <section className="stories-section" id="collections">
        <div className="section-heading">
          <div>
            <p className="kicker">Новые материалы</p>
            <h2>{selectedPeople === 'Все народы' ? 'Истории, сохранённые людьми' : `Материалы: ${selectedPeople}`}</h2>
          </div>
          <button className="text-button">Смотреть все <ArrowRight size={17} /></button>
        </div>
        <div className="publication-grid">
          {(selectedPeople === 'Все народы'
            // На главной показываем по одному материалу от каждого народа, иначе витрина выглядит однообразно.
            ? PEOPLES.map((people) => availablePublications.find((item) => item.people === people.name)).filter((item): item is Material => Boolean(item))
            : availablePublications.filter((item) => item.people === selectedPeople).slice(0, 6))
            .map((item) => (
              <article className="publication-card clickable-card" key={item.slug} onClick={() => openMaterial(item)}>
                <div className={`publication-image image-${item.image}`}>
                  <span className={`ethnos-tag tag-${peopleByName(item.people)?.tone ?? 'mari'}`}>{item.people} · {peopleByName(item.people)?.selfName ?? ''}</span>
                  <span className="media-tag"><Image size={14} /> {item.type}</span>
                </div>
                <div className="publication-body">
                  <p>{item.region}</p>
                  <h3>{item.title}</h3>
                  <div className="publication-footer"><span>{item.author}</span><button aria-label="Открыть материал"><ArrowRight size={18} /></button></div>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="themes-section" id="themes">
        <div className="theme-copy">
          <p className="kicker">Исследуйте по-своему</p>
          <h2>Найдите нить, за которой хочется идти</h2>
          <p>Выбирайте тему, слушайте голоса, собирайте материалы в личные коллекции и создавайте своё портфолио.</p>
          <button className="dark-button" onClick={() => navigate('peoples')}>Все темы <ArrowRight size={17} /></button>
        </div>
        <div className="theme-grid">
          {TOPICS.slice(0, 4).map((topic) => (
            <button className={`theme-tile ${topic.tone}`} key={topic.slug} onClick={() => openTopic(null, topic.slug)}>
              <span>{materialsWord(countForTopic(topic.slug))}</span>
              <strong>{topic.title}</strong>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
      </section>

      <section className="contribute-section">
        <div className="contribute-visual"><span>?</span><i /><i /><i /></div>
        <div>
          <p className="kicker">Ваша память важна</p>
          <h2>Одна фотография может сохранить целую историю.</h2>
          <p>Загрузите семейный снимок, запись разговора или найденный документ. Укажите место, народ и источник - и ваша история станет частью живого атласа.</p>
          <div className="contribute-actions">
            <button className="publish-button" onClick={() => withAccount(() => openEditor({ ...EMPTY_POST }))}><Upload size={16} /> Добавить материал</button>
            <a href="#collections">Как это работает <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      </> : route === 'map' ? <section className="inner-page map-page">
        <div className="breadcrumbs">
          <button onClick={() => navigate('home')}>Земля</button>
          {pathToPlace(location.place.slice(1)).map((step, index) => {
            const isLast = index === location.place.length - 1
            return <span key={step.id} className="crumb-step">
              <span>/</span>
              {isLast
                ? <span>{step.name}</span>
                : <button onClick={() => goPlace(location.place.slice(0, index + 1))}>{step.name}</button>}
            </span>
          })}
        </div>

        {(() => {
          const place = placeById(location.place.slice(1))
          const region = place.kind === 'region' ? availableRegions.find((item) => item.id === place.id) : null
          const rows: PeopleRow[] = place.kind === 'country'
            ? PEOPLES.map((people) => ({ name: people.name, tone: people.tone, group: people.group, count: countForPeople(people.name) }))
            : region?.peoples.map((person) => ({
                name: person.name,
                tone: person.tone,
                group: peopleByName(person.name)?.group,
                count: countForPeople(person.name, region.name),
              })) ?? []
          // В панель помещается пять строк; остальные ищутся в отдельном окне.
          const shown = rows.slice(0, 5)
          const hidden = rows.length - shown.length

          // У населённого пункта карты нет, и узкая колонка рядом с пустотой выглядит
          // странно — там заголовок идёт во всю ширину.
          if (place.kind === 'settlement') return <div className="map-head">
            <div>
              <p className="kicker">{placeKindLabel(place)}</p>
              <h1>{place.name}</h1>
              <p className="map-side-text">{place.description ?? 'Материалы, записанные в этом месте.'}</p>
            </div>
            <div className="map-head-side">
              <div className="map-side-stat">
                <b>{materialsAtPlace(place).length}</b>
                <span>материалов<br />в этом месте</span>
              </div>
              <button className="outline-button" onClick={() => goPlace(location.place.slice(0, -1))}>
                <ArrowLeft size={15} /> На уровень выше
              </button>
            </div>
          </div>

          return <div className="map-layout">
            <div className="map-holder">
              <Globe ids={location.place} onGo={goPlace} />
            </div>

            <aside className="region-panel map-panel">
              <div className="panel-topline"><span>{placeKindLabel(place)}</span><Compass size={18} /></div>
              <h3>{place.name}</h3>
              <p>{place.description ?? 'Выберите место на карте, чтобы посмотреть, что здесь записано.'}</p>
              <div className="region-stat"><b>{materialsAtPlace(place).length}</b><span>материалов<br />в этом месте</span></div>

              {rows.length > 0 && <div className="people-list">
                <span className="list-label">{place.kind === 'country' ? 'Народы страны' : 'Народы региона'}</span>
                {shown.map((row) => (
                  <button className="people-row" onClick={() => openEthnos(row.name, region ?? null)} key={row.name}>
                    <i className={`tone-${row.tone}`} />
                    <span>{row.name}</span>
                    <b>{row.count}</b>
                    <ArrowRight size={15} />
                  </button>
                ))}
                {hidden > 0 && <button className="text-button picker-open" onClick={() => setPeoplePicker({
                  title: place.kind === 'country' ? 'Народы России' : `Народы: ${shortRegion(place.name)}`,
                  rows,
                  region: region ?? null,
                })}>
                  Другие народы {place.kind === 'country' ? 'страны' : 'в этом регионе'} ({hidden}) <ArrowRight size={15} />
                </button>}
              </div>}

              {location.place.length > 1 && <button className="outline-button" onClick={() => goPlace(location.place.slice(0, -1))}>
                <ArrowLeft size={15} /> На уровень выше
              </button>}
            </aside>
          </div>
        })()}

        {(() => {
          const place = placeById(location.place.slice(1))
          const all = materialsAtPlace(place)
          const items = place.kind === 'country'
            // По стране берём по паре материалов от каждого региона — иначе в списке
            // окажутся восемь подряд из одной республики.
            ? RUSSIA.children!.flatMap((region) => all.filter((item) => item.region === region.regionName).slice(0, 2))
            : all.slice(0, 8)
          if (items.length === 0) return null
          return <>
            <div className="region-subheading materials-heading">
              <div>
                <p className="kicker">Что здесь записано</p>
                <h2>{place.kind === 'country' ? 'Материалы со всей страны' : 'Материалы места'}</h2>
              </div>
              {all.length > items.length && <span className="materials-more">Показаны {items.length} из {all.length}</span>}
            </div>
            <div className="compact-publications">{items.map((item) => <button key={item.slug} onClick={() => openMaterial(item)}>
              <span className={`compact-image image-${item.image}`} />
              <span><small>{item.people} · {topicBySlug(item.topic).title}</small><strong>{item.title}</strong><em>{item.author} · {item.place}</em></span>
              <ArrowRight size={17} />
            </button>)}</div>
          </>
        })()}
      </section> : route === 'settings' && account ? <ProfileSettings
        account={account}
        postCount={myPosts.length}
        collectionCount={myCollections.length}
        onCancel={() => navigate('profile')}
        onSave={saveAccount}
        onDelete={deleteAccount}
      /> : route === 'editor' && account ? <EditorPage
        post={draft ?? myPosts.find((post) => post.id === location.material) ?? { ...EMPTY_POST }}
        regionNames={availableRegions.map((region) => region.name)}
        onCancel={() => { setDraft(null); navigate('profile') }}
        onSaveDraft={saveDraft}
        onPublish={publishPost}
      /> : route === 'profile' && !account ? <section className="inner-page profile-page">
        <div className="page-intro">
          <p className="kicker">Личный кабинет</p>
          <h1>Войдите, чтобы продолжить</h1>
          <p>В кабинете хранятся ваши публикации, черновики, коллекции и портфолио. Карта, народы и материалы доступны и без входа.</p>
        </div>
        <div className="empty-note">
          <Sparkles size={18} />
          <span>Это демонстрационная версия: подойдёт любая почта и любой пароль.</span>
          <button className="outline-button" onClick={() => setIsAuthOpen(true)}>Войти в кабинет</button>
        </div>
      </section> : route === 'profile' && account ? <ProfilePage
        account={account}
        posts={myPosts}
        collections={myCollections}
        tab={profileTab}
        onTab={setProfileTab}
        onOpenPublish={() => openEditor({ ...EMPTY_POST })}
        onCreateCollection={() => setIsCollectionOpen(true)}
        onTogglePost={togglePostVisibility}
        onEditPost={openEditor}
        onTogglePortfolio={togglePortfolio}
        onOpenMaterial={openMaterial}
        onOpenCollection={openCollection}
        onEditCollection={setEditingCollection}
        onOpenSettings={() => navigate('settings')}
        onSignOut={signOut}
      /> : <CorePages route={route} location={location} selectedRegion={selectedRegion} selectedEthnos={selectedEthnos} ethnosRegionFilter={ethnosRegionFilter} availableRegions={availableRegions} availablePublications={availablePublications} onNavigate={navigate} onSelectRegion={selectRegion} onOpenEthnos={openEthnos} onOpenTopic={openTopic} onOpenMaterial={openMaterial} onSetEthnosRegion={setEthnosRegion} onClearEthnosRegion={() => go({ ...location, region: null })} onCreateCollection={() => withAccount(() => setIsCollectionOpen(true))} collections={allCollections} onOpenCollection={openCollection} myCollections={myCollections} onSaveToCollection={(material) => withAccount(() => setCollectingMaterial(material))} onSaveCollection={(collection) => withAccount(() => saveCollectionToMine(collection))} onEditCollection={setEditingCollection} isMine={(collection) => myCollections.some((item) => item.id === collection.id)} />}

      <footer>
        <div className="brand footer-brand"><span className="brand-mark"><i /><i /><i /><i /></span><span>этносфера</span></div>
        <p>Цифровой атлас народов России. Пространство памяти, языка и живых историй.</p>
        <span>Проект находится в разработке</span>
      </footer>

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} onSignIn={signIn} />}
      {isCollectionOpen && account && <CollectionModal account={account} onClose={() => setIsCollectionOpen(false)} onCreate={createCollection} />}
      {editingCollection && account && <CollectionModal
        account={account}
        collection={editingCollection}
        onClose={() => setEditingCollection(null)}
        onCreate={saveCollection}
        onDelete={deleteCollection}
      />}
      {collectingMaterial && account && <AddToCollectionModal
        account={account}
        title={collectingMaterial.title}
        collections={myCollections}
        inside={myCollections.filter((collection) => collection.items.includes(collectingMaterial.slug)).map((collection) => collection.id)}
        onClose={() => setCollectingMaterial(null)}
        onToggle={(collectionId) => toggleInCollection(collectionId, collectingMaterial.slug)}
        onCreate={(name) => createCollectionWith(name, collectingMaterial.slug)}
      />}
      {peoplePicker && <PeoplePicker
        title={peoplePicker.title}
        rows={peoplePicker.rows}
        onPick={(name) => { openEthnos(name, peoplePicker.region); setPeoplePicker(null) }}
        onClose={() => setPeoplePicker(null)}
      />}
      {successNote && <SuccessNote title={successNote.title} text={successNote.text} onClose={() => { setSuccessNote(null); navigate('profile') }} />}
    </main>
  )
}

function RegionFilter({
  region,
  availableRegions,
  onSelect,
  onClear,
}: {
  region: Region | null
  availableRegions: Region[]
  onSelect: (region: Region) => void
  onClear: () => void
}) {
  const [query, setQuery] = useState(region?.name ?? 'Россия')
  const [isOpen, setIsOpen] = useState(false)
  const matches = availableRegions.filter((item) => item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))

  useEffect(() => {
    setQuery(region?.name ?? 'Россия')
  }, [region])

  const closeWithoutSelection = () => {
    window.setTimeout(() => {
      setIsOpen(false)
      setQuery(region?.name ?? 'Россия')
    }, 160)
  }

  return <div className="region-filter-control">
    <Search size={15} />
    <input
      value={query}
      onFocus={() => {
        setIsOpen(true)
        if (!region) setQuery('')
      }}
      onChange={(event) => {
        setQuery(event.target.value)
        setIsOpen(true)
      }}
      onBlur={closeWithoutSelection}
      aria-label="Фильтр по региону"
      aria-expanded={isOpen}
      aria-autocomplete="list"
    />
    {region ? <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={onClear} aria-label="Снять фильтр по региону"><X size={14} /></button> : <ChevronDown size={16} />}
    {isOpen && <div className="region-filter-options" role="listbox">
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { onClear(); setIsOpen(false) }}>Россия</button>
      {matches.map((item) => <button type="button" key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { onSelect(item); setIsOpen(false) }}>{item.name}</button>)}
      {matches.length === 0 && <span>Регион не найден</span>}
    </div>}
  </div>
}

function CorePages({
  route,
  location,
  selectedRegion,
  selectedEthnos,
  ethnosRegionFilter,
  availableRegions,
  availablePublications,
  onNavigate,
  onSelectRegion,
  onOpenEthnos,
  onOpenTopic,
  onOpenMaterial,
  onSetEthnosRegion,
  onClearEthnosRegion,
  onCreateCollection,
  collections,
  onOpenCollection,
  myCollections,
  onSaveToCollection,
  onSaveCollection,
  onEditCollection,
  isMine,
}: {
  route: string
  location: Location
  selectedRegion: Region
  selectedEthnos: string
  ethnosRegionFilter: Region | null
  availableRegions: Region[]
  availablePublications: Material[]
  onNavigate: (route: string) => void
  onSelectRegion: (region: Region) => void
  onOpenEthnos: (name: string, region?: Region | null) => void
  onOpenTopic: (peopleName: string | null, topicSlug: string, regionId?: string | null) => void
  onOpenMaterial: (material: Material) => void
  onSetEthnosRegion: (region: Region) => void
  onClearEthnosRegion: () => void
  onCreateCollection: () => void
  collections: UserCollection[]
  onOpenCollection: (collection: UserCollection) => void
  myCollections: UserCollection[]
  onSaveToCollection: (material: Material) => void
  onSaveCollection: (collection: UserCollection) => void
  onEditCollection: (collection: UserCollection) => void
  isMine: (collection: UserCollection) => boolean
}) {
  if (route === 'peoples') {
    return <section className="inner-page directory-page">
      <div className="page-intro">
        <p className="kicker">Каталог народов</p>
        <h1>Народы России</h1>
        <p>Открывайте культуры через голоса людей, семейные архивы, язык, музыку и вещи, которые хранят память.</p>
      </div>
      <div className="directory-layout">
        <aside className="directory-filter">
          <span className="filter-title"><ListFilter size={16} /> Найти в каталоге</span>
          <SearchSelect label="Регион" placeholder="Введите регион" options={['Все регионы', 'Республика Марий Эл', 'Республика Татарстан', 'Удмуртская Республика', 'Республика Башкортостан']} />
          <SearchSelect label="Языковая группа" placeholder="Введите группу" options={['Все группы', 'Финно-угорские языки', 'Тюркские языки', 'Славянские языки']} />
          <div className="filter-note"><Sparkles size={17} /> Выберите народ, чтобы увидеть материалы из всех регионов России.</div>
        </aside>
        <div className="ethnos-directory">
          {PEOPLES.map((people) => <button className="directory-card" key={people.slug} onClick={() => onOpenEthnos(people.name)}>
            <span className={`directory-pattern pattern-${people.tone}`}><i /><i /><i /><i /></span>
            <div><small>{people.selfName}</small><h2>{people.name}</h2><p>{people.group}</p></div>
            <span className="directory-count">{materialsWord(countForPeople(people.name))}</span><ArrowRight size={18} />
          </button>)}
        </div>
      </div>
    </section>
  }

  if (route === 'people') {
    const ethnos = peopleByName(selectedEthnos)
      ?? { selfName: 'народ', tone: 'mari', count: '0', description: 'Материалы выбранного народа.', regions: 'Россия' }

    const materialCount = countForPeople(selectedEthnos, ethnosRegionFilter?.name ?? null)

    return <section className="inner-page ethnos-page">
      <div className="breadcrumbs">
        <button onClick={() => onNavigate('peoples')}>Народы</button><span>/</span>
        {ethnosRegionFilter
          ? <><button onClick={onClearEthnosRegion}>{selectedEthnos}</button><span>/</span><span>{shortRegion(ethnosRegionFilter.name)}</span></>
          : <span>{selectedEthnos}</span>}
      </div>
      <div className={`ethnos-hero ethnos-${ethnos.tone}`}>
        <div className="ethnos-hero-pattern"><i /><i /><i /><i /><i /></div>
        <div className="ethnos-hero-copy"><span>{selectedEthnos.toUpperCase()} · {ethnos.selfName.toUpperCase()}</span><h1>{selectedEthnos}</h1><p>{ethnosRegionFilter ? `Истории народа «${selectedEthnos}», связанные с регионом «${ethnosRegionFilter.name}».` : ethnos.description}</p></div>
        <div className="ethnos-stats"><b>{materialCount}</b><span>материалов</span><small><MapPin size={14} /> {ethnosRegionFilter ? ethnosRegionFilter.name : ethnos.regions}</small></div>
      </div>
      <div className="ethnos-filterbar"><span>Регион:</span><RegionFilter region={ethnosRegionFilter} availableRegions={availableRegions} onSelect={onSetEthnosRegion} onClear={onClearEthnosRegion} /></div>
      <div className="ethnos-topic-heading"><div><p className="kicker">Выберите тему</p><h2>С чего начнём знакомство?</h2></div><p>{ethnosRegionFilter ? `Тема покажет истории о ${selectedEthnos.toLowerCase()} в регионе «${ethnosRegionFilter.name}».` : `Тема покажет все публикации о ${selectedEthnos.toLowerCase()} из разных регионов.`}</p></div>
      <div className="ethnos-topic-grid">{TOPICS.map((topic) => <button className={topic.tone} key={topic.slug} onClick={() => onOpenTopic(selectedEthnos, topic.slug, ethnosRegionFilter?.id ?? null)}><span>{topic.description}<i className="topic-count">{materialsWord(countForTopic(topic.slug, selectedEthnos, ethnosRegionFilter?.name ?? null))}</i></span><strong>{topic.title}</strong><ArrowRight size={19} /></button>)}</div>
      <div className="ethnos-bottom"><div><p className="kicker">На карте</p><h2>Где живут эти истории</h2><p>{ethnos.regions}</p></div><button className="outline-button" onClick={() => onNavigate('region')}><Map size={16} /> Смотреть регионы на карте</button></div>
    </section>
  }

  if (route === 'topic') {
    const topic = topicBySlug(location.topic ?? TOPICS[0].slug)
    const peopleName = location.people
    const regionName = ethnosRegionFilter?.name ?? null
    const items = materialsFor(peopleName, topic.slug, regionName)
    const everywhere = materialsFor(peopleName, topic.slug).length

    return <section className="inner-page topic-page">
      <div className="breadcrumbs">
        <button onClick={() => onNavigate('peoples')}>Народы</button>
        {peopleName && <><span>/</span><button onClick={() => onOpenEthnos(peopleName, ethnosRegionFilter)}>{peopleName}</button></>}
        {ethnosRegionFilter && <><span>/</span><button onClick={() => peopleName ? onOpenEthnos(peopleName, ethnosRegionFilter) : onNavigate('region')}>{shortRegion(ethnosRegionFilter.name)}</button></>}
        <span>/</span><span>{topic.title}</span>
      </div>
      <div className={`topic-hero ${topic.tone}`}>
        <div><span>{peopleName ? peopleName.toUpperCase() : 'ВСЕ НАРОДЫ'}{regionName ? ` · ${regionName.toUpperCase()}` : ''}</span><h1>{topic.title}</h1><p>{topic.description}</p></div>
        <div className="topic-hero-stat"><b>{items.length}</b><span>{items.length === 1 ? 'материал' : 'материалов'}<br />{regionName ? 'в этом регионе' : 'в этой теме'}</span></div>
      </div>
      <div className="ethnos-filterbar">
        <span>Регион:</span>
        <RegionFilter region={ethnosRegionFilter} availableRegions={availableRegions} onSelect={onSetEthnosRegion} onClear={onClearEthnosRegion} />
        <span className="filter-hint">{regionName
          ? `${materialsWord(items.length)} в этом регионе из ${everywhere} у народа «${peopleName}»`
          : 'Выберите регион, чтобы увидеть истории этого народа в конкретной республике'}</span>
      </div>
      <div className="region-subheading materials-heading">
        <div><p className="kicker">Материалы темы</p><h2>{peopleName ? `${topic.title}: ${peopleName.toLowerCase()}` : 'Из разных культур'}</h2></div>
        {peopleName && <button className="text-button" onClick={() => onOpenTopic(null, topic.slug)}>Все народы <ArrowRight size={17} /></button>}
      </div>
      {items.length > 0
        ? <div className="compact-publications">{items.map((item) => <button key={item.slug} onClick={() => onOpenMaterial(item)}><span className={`compact-image image-${item.image}`} /><span><small>{item.people} · {item.type}</small><strong>{item.title}</strong><em>{item.author} · {item.region}</em></span><ArrowRight size={17} /></button>)}</div>
        : <div className="empty-note">
            <Sparkles size={18} />
            <span>{regionName ? `В регионе «${regionName}» по этой теме пока нет материалов.` : 'В этой теме пока нет опубликованных материалов. Вы можете стать первым автором.'}</span>
            {regionName && everywhere > 0 && <button className="outline-button" onClick={() => onOpenTopic(peopleName, topic.slug, null)}>Смотреть во всех регионах ({everywhere})</button>}
          </div>}
    </section>
  }

  if (route === 'material') {
    const material = MATERIALS.find((item) => item.slug === location.material) ?? MATERIALS[0]
    const materialEthnos = peopleByName(material.people) ?? { selfName: 'народ', tone: 'mari' }
    const topic = topicBySlug(material.topic)
    const materialRegion = availableRegions.find((region) => region.name === material.region) ?? null
    const photoCount = Math.min(Math.max(material.photos ?? 3, 1), 3)
    const savedInCollection = myCollections.some((collection) => collection.items.includes(material.slug))
    // «Читайте дальше» держится того же региона, иначе из материала о Марий Эл уводило бы в другой край.
    const related = materialsFor(material.people, null, material.region).filter((item) => item.slug !== material.slug).slice(0, 3)

    return <section className="inner-page material-page">
      <div className="breadcrumbs">
        <button onClick={() => onNavigate('peoples')}>Народы</button><span>/</span>
        <button onClick={() => onOpenEthnos(material.people, materialRegion)}>{material.people}</button><span>/</span>
        {materialRegion && <><button onClick={() => onOpenEthnos(material.people, materialRegion)}>{shortRegion(materialRegion.name)}</button><span>/</span></>}
        <button onClick={() => onOpenTopic(material.people, topic.slug, materialRegion?.id ?? null)}>{topic.title}</button><span>/</span>
        <span>{material.title}</span>
      </div>
      <div className="material-head">
        <div><div className="material-tags"><span className={`ethnos-tag tag-${materialEthnos.tone}`}>{material.people} · {materialEthnos.selfName}</span><span className="soft-tag"><MapPin size={12} /> {material.region}</span><span className="soft-tag">{topic.title}</span></div><h1>{material.title}</h1><p>{material.intro}</p>
          <button
            className={`save-material${savedInCollection ? ' saved' : ''}`}
            onClick={() => onSaveToCollection(material)}
            aria-pressed={savedInCollection}
          >
            <Heart size={17} fill={savedInCollection ? 'currentColor' : 'none'} />
            {savedInCollection ? 'Материал в коллекции' : 'Сохранить в коллекцию'}
          </button>
        </div>
        <div className="author-box"><span className="avatar">{material.authorInitials}</span><div><small>Опубликовал</small><strong>{material.author}</strong><span>{material.date}</span></div></div>
      </div>
      <div className={`material-gallery photos-${photoCount}`}>
        {['photo-main', 'photo-detail', 'photo-landscape'].slice(0, photoCount).map((shape, index) => (
          <div className={`material-photo ${shape}${index === 0 ? ` image-${material.image}` : ''}`} key={shape}><span>0{index + 1}</span></div>
        ))}
      </div>
      <div className="material-layout">
        <article className="material-story"><p className="lead">{material.lead}</p><p>{material.intro}</p><h2>Как собирался материал</h2><p>{material.collected}</p><div className="quote-note"><BookOpen size={19} /><span>Источник: {material.source}</span></div></article>
        <aside className="material-aside">
          {material.audio
            ? <div className="audio-card"><span className="audio-label">Аудиозапись</span><button><Play size={18} fill="currentColor" /></button><strong>{material.audio.title}</strong><small>{material.audio.duration}</small><div className="wave" /></div>
            : <div className="files-card"><span className="audio-label">Прикреплённые файлы</span><span className="file-row"><FileText size={16} /> Расшифровка.docx <small>830 КБ</small></span><span className="file-row"><FileText size={16} /> Опись материалов.pdf <small>1,4 МБ</small></span></div>}
          <div className="material-meta"><span><MapPin size={16} /> {material.place}</span><span><Languages size={16} /> {material.languages}</span><span><FileText size={16} /> {material.type}</span></div>
          <button className="download-button"><Download size={16} /> Скачать материалы</button>
        </aside>
      </div>
      {related.length > 0 && <div className="material-related">
        <div className="region-subheading"><div><p className="kicker">Читайте дальше</p><h2>Ещё о народе «{material.people}» в {regionInPrepositional(material.region)}</h2></div><button className="text-button" onClick={() => onOpenEthnos(material.people, materialRegion)}>Все темы <ArrowRight size={17} /></button></div>
        <div className="compact-publications">{related.map((item) => <button key={item.slug} onClick={() => onOpenMaterial(item)}><span className={`compact-image image-${item.image}`} /><span><small>{topicBySlug(item.topic).title} · {item.type}</small><strong>{item.title}</strong><em>{item.author}</em></span><ArrowRight size={17} /></button>)}</div>
      </div>}
    </section>
  }

  if (route === 'collection') {
    const collection = collections.find((item) => item.id === location.collection)
    if (!collection) return <section className="inner-page collection-page">
      <div className="breadcrumbs"><button onClick={() => onNavigate('collections')}>Коллекции</button><span>/</span><span>Не найдена</span></div>
      <div className="empty-note"><Sparkles size={18} /><span>Такой коллекции нет. Возможно, ссылка устарела или подборку удалили.</span></div>
    </section>

    const items = collection.items.map(materialBySlug)

    return <section className="inner-page collection-page single-collection">
      <div className="breadcrumbs"><button onClick={() => onNavigate('collections')}>Коллекции</button><span>/</span><span>{collection.name}</span></div>
      <div className="collection-hero">
        <div className={`collection-hero-cover ${collection.cover}`}><i /><i /><i /></div>
        <div className="collection-hero-copy">
          <p className="kicker">Подборка</p>
          <h1>{collection.name}</h1>
          <p>{collection.description}</p>
          <div className="collection-hero-meta">
            <span className="collection-by"><span className="avatar">{collection.authorInitials}</span> {collection.author}</span>
            <span className={`access-tag access-${collection.access === 'Публичная' ? 'public' : collection.access === 'По ссылке' ? 'link' : 'private'}`}>{collection.access}</span>
            <span className="collection-count">{materialsWord(items.length)}</span>
          </div>
          <div className="collection-hero-actions">
            {isMine(collection)
              ? <button className="dark-button" onClick={() => onEditCollection(collection)}><Pencil size={16} /> Настройки подборки</button>
              : <button className="dark-button" onClick={() => onSaveCollection(collection)}><FolderHeart size={16} /> Сохранить подборку</button>}
            <button className="outline-button"><Download size={16} /> Скачать материалы</button>
          </div>
        </div>
      </div>

      {collection.access === 'Приватная' && <div className="empty-note private-note">
        <Sparkles size={18} />
        <span>Коллекция приватная: её видите только вы. Смените доступ, чтобы поделиться ссылкой.</span>
      </div>}

      <div className="region-subheading materials-heading"><div><p className="kicker">Состав подборки</p><h2>Что внутри</h2></div></div>
      {items.length > 0
        ? <div className="compact-publications">{items.map((item) => <button key={item.slug} onClick={() => onOpenMaterial(item)}><span className={`compact-image image-${item.image}`} /><span><small>{item.people} · {topicBySlug(item.topic).title}</small><strong>{item.title}</strong><em>{item.author} · {shortRegion(item.region)}</em></span><ArrowRight size={17} /></button>)}</div>
        : <div className="empty-note"><Sparkles size={18} /><span>В подборке пока нет материалов. Добавляйте их кнопкой «Добавить в коллекцию» на странице любой публикации.</span></div>}
    </section>
  }

  if (route === 'collections') {
    return <section className="inner-page collection-page">
      <div className="page-intro split-intro"><div><p className="kicker">Подборки пользователей</p><h1>Коллекции</h1><p>Сохраняйте чужие публикации в личные тематические подборки или открывайте свои находки для всех.</p></div><button className="publish-button" onClick={onCreateCollection}><FolderHeart size={16} /> Создать коллекцию</button></div>
      <div className="collection-feature"><div className="collection-art"><span>{FEATURED_COLLECTION.count}</span><i /><i /><i /></div><div><p className="kicker">Коллекция недели</p><h2>{FEATURED_COLLECTION.name}</h2><p>{FEATURED_COLLECTION.description}</p><div className="collection-by"><span className="avatar">{FEATURED_COLLECTION.authorInitials}</span> Собрала {FEATURED_COLLECTION.author} · {materialsWord(FEATURED_COLLECTION.count)}</div><button className="dark-button" onClick={() => onOpenCollection(FEATURED_COLLECTION)}>Открыть коллекцию <ArrowRight size={17} /></button></div></div>
      <div className="section-heading collection-title"><div><p className="kicker">Открытые подборки</p><h2>Собрано людьми</h2></div></div>
      <div className="collection-grid">{collections.filter((item) => item.id !== FEATURED_COLLECTION.id && item.access !== 'Приватная').map((collection) => <article className="collection-card clickable-card" key={collection.id} onClick={() => onOpenCollection(collection)}><div className={`collection-cover ${collection.cover}`}><i /><i /><i /></div><p>{collection.description}</p><h3>{collection.name}</h3><div><span>{materialsWord(collection.count)}</span><button aria-label={`Открыть коллекцию «${collection.name}»`}><ArrowRight size={17} /></button></div></article>)}</div>
    </section>
  }

  return null
}

function ProfilePage({
  account,
  posts,
  collections,
  tab,
  onTab,
  onOpenPublish,
  onCreateCollection,
  onTogglePost,
  onEditPost,
  onTogglePortfolio,
  onOpenMaterial,
  onOpenCollection,
  onEditCollection,
  onOpenSettings,
  onSignOut,
}: {
  account: Account
  posts: UserPost[]
  collections: UserCollection[]
  tab: 'portfolio' | 'posts' | 'collections'
  onTab: (tab: 'portfolio' | 'posts' | 'collections') => void
  onOpenPublish: () => void
  onCreateCollection: () => void
  onTogglePost: (id: string) => void
  onEditPost: (post: UserPost) => void
  onTogglePortfolio: (id: string) => void
  onOpenMaterial: (material: Material) => void
  onOpenCollection: (collection: UserCollection) => void
  onEditCollection: (collection: UserCollection) => void
  onOpenSettings: () => void
  onSignOut: () => void
}) {
  const published = posts.filter((post) => post.status === 'Опубликован' && post.inPortfolio)
  const publishedCount = posts.filter((post) => post.status === 'Опубликован').length

  return <section className="inner-page profile-page">
    <div className="profile-cover"><span className="profile-pattern"><i /><i /><i /><i /></span></div>
    <div className="profile-summary">
      <span className="profile-avatar">{account.initials}</span>
      <div><p className="kicker">Личный кабинет</p><h1>{account.name}</h1><p>{account.about}</p><span className="profile-email">{account.email}</span></div>
      <div className="profile-actions">
        <button className="outline-button" onClick={onOpenSettings}><UserRound size={16} /> Редактировать профиль</button>
        <button className="text-button" onClick={onSignOut}><LogOut size={15} /> Выйти</button>
      </div>
    </div>

    <div className="profile-tabs">
      <button className={tab === 'portfolio' ? 'active' : ''} onClick={() => onTab('portfolio')}>Портфолио</button>
      <button className={tab === 'posts' ? 'active' : ''} onClick={() => onTab('posts')}>Мои публикации <span>{posts.length}</span></button>
      <button className={tab === 'collections' ? 'active' : ''} onClick={() => onTab('collections')}>Коллекции <span>{collections.length}</span></button>
    </div>

    {tab === 'portfolio' && (published.length > 0
      ? <div className="portfolio-layout">
          <div>
            <div className="section-heading compact"><div><p className="kicker">Избранные работы</p><h2>Моё портфолио</h2></div><button className="download-button"><Download size={16} /> Скачать PDF</button></div>
            <div className="portfolio-list">{published.map((post, index) => <button key={post.id} onClick={() => post.materialSlug && onOpenMaterial(materialBySlug(post.materialSlug))}><b>0{index + 1}</b><span><strong>{post.title}</strong><small>{topicBySlug(post.topic).title} · {post.type}</small></span><em>{post.people}</em><ArrowRight size={17} /></button>)}</div>
          </div>
          <aside className="portfolio-side">
            <span className="side-label">В портфолио</span><b>{published.length}</b><span>опубликованных<br />материалов</span>
            <hr />
            <span className="side-label">Темы</span>
            <p>{[...new Set(published.map((post) => topicBySlug(post.topic).title))].join(', ')}</p>
            <hr />
            <span className="side-label">Доступ</span>
            <p>{account.publicPortfolio
              ? 'Портфолио открыто по ссылке. Закрыть его можно в настройках профиля.'
              : 'Портфолио закрыто. Включите публичную версию в настройках, чтобы делиться ссылкой.'}</p>
          </aside>
        </div>
      : <div className="empty-note">
          <Sparkles size={18} />
          <span>{publishedCount > 0
            ? 'Портфолио вы собираете сами: отметьте звёздочкой работы в разделе «Мои публикации», и они появятся здесь.'
            : 'В портфолио попадают ваши опубликованные работы. Как только появится первая публикация, отметьте её звёздочкой.'}</span>
          <button className="outline-button" onClick={() => publishedCount > 0 ? onTab('posts') : onOpenPublish()}>
            {publishedCount > 0 ? <>К публикациям</> : <><Upload size={15} /> Добавить материал</>}
          </button>
        </div>)}

    {tab === 'posts' && <>
      <div className="section-heading compact">
        <div><p className="kicker">Все работы</p><h2>Мои публикации</h2></div>
        <button className="publish-button" onClick={onOpenPublish}><Upload size={16} /> Добавить материал</button>
      </div>
      {posts.length > 0
        ? <div className="my-posts">{posts.map((post) => <article
            className="my-post clickable-card"
            key={post.id}
            onClick={() => post.materialSlug ? onOpenMaterial(materialBySlug(post.materialSlug)) : onEditPost(post)}
          >
            <span className={`compact-image image-${post.image}`} />
            <div className="my-post-body">
              <small>{topicBySlug(post.topic).title} · {post.people} · {shortRegion(post.region)}</small>
              <strong>{post.title}</strong>
              <em>{post.date}</em>
            </div>
            <span className={`status-tag status-${post.status === 'Опубликован' ? 'live' : post.status === 'Черновик' ? 'draft' : post.status === 'Скрыт' ? 'hidden' : 'review'}`}>{post.status}</span>
            <div className="my-post-actions" onClick={(event) => event.stopPropagation()}>
              {post.status === 'Опубликован' && (
                <button
                  className={post.inPortfolio ? 'starred' : ''}
                  onClick={() => onTogglePortfolio(post.id)}
                  aria-label={post.inPortfolio ? 'Убрать из портфолио' : 'Добавить в портфолио'}
                  aria-pressed={!!post.inPortfolio}
                ><Star size={16} fill={post.inPortfolio ? 'currentColor' : 'none'} /></button>
              )}
              <button onClick={() => onEditPost(post)} aria-label="Редактировать"><Pencil size={16} /></button>
              {(post.status === 'Опубликован' || post.status === 'Скрыт') && (
                <button onClick={() => onTogglePost(post.id)} aria-label={post.status === 'Скрыт' ? 'Показать' : 'Скрыть'}>
                  {post.status === 'Скрыт' ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              )}
              {post.materialSlug && <button onClick={() => onOpenMaterial(materialBySlug(post.materialSlug!))} aria-label="Открыть материал"><ArrowRight size={16} /></button>}
            </div>
          </article>)}</div>
        : <div className="empty-note">
            <Sparkles size={18} />
            <span>Вы пока ничего не публиковали. Начните с семейной фотографии, записи разговора или найденного документа.</span>
            <button className="outline-button" onClick={onOpenPublish}><Upload size={15} /> Добавить материал</button>
          </div>}
    </>}

    {tab === 'collections' && <>
      <div className="section-heading compact">
        <div><p className="kicker">Мои подборки</p><h2>Коллекции</h2></div>
        <button className="publish-button" onClick={onCreateCollection}><FolderHeart size={16} /> Создать коллекцию</button>
      </div>
      {collections.length > 0
        ? <div className="collection-grid">{collections.map((collection) => <article className="collection-card clickable-card" key={collection.id} onClick={() => onOpenCollection(collection)}>
            <div className={`collection-cover ${collection.cover}`}><i /><i /><i /></div>
            <p>{collection.description}</p>
            <h3>{collection.name}</h3>
            <button
              className="collection-settings"
              onClick={(event) => { event.stopPropagation(); onEditCollection(collection) }}
              aria-label={`Настройки коллекции «${collection.name}»`}
            ><Pencil size={15} /></button>
            <div><span>{materialsWord(collection.count)}</span>{collection.savedFrom
              ? <span className="access-tag access-saved">сохранено у {collection.savedFrom.split(' ')[0]}</span>
              : <span className={`access-tag access-${collection.access === 'Публичная' ? 'public' : collection.access === 'По ссылке' ? 'link' : 'private'}`}>{collection.access}</span>}</div>
          </article>)}</div>
        : <div className="empty-note">
            <Sparkles size={18} />
            <span>Коллекция — это подборка материалов, в том числе чужих. Создайте первую, чтобы собирать в неё находки.</span>
            <button className="outline-button" onClick={onCreateCollection}><FolderHeart size={15} /> Создать коллекцию</button>
          </div>}
    </>}
  </section>
}

export default App
