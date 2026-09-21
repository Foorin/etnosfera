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
} from 'lucide-react'

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

const publications = [
  {
    title: 'Песни, которые пели у печи',
    people: 'Марийцы',
    selfName: 'марий',
    region: 'Республика Марий Эл',
    type: 'Аудиоистория',
    author: 'Алина П.',
    color: 'mari',
    image: 'song',
  },
  {
    title: 'Орнамент на полотенце бабушки',
    people: 'Чуваши',
    selfName: 'чăваш',
    region: 'Республика Марий Эл',
    type: 'Семейный архив',
    author: 'Михаил Н.',
    color: 'chuvash',
    image: 'pattern',
  },
  {
    title: 'Улицы старого Йошкар-Олы',
    people: 'Русские',
    selfName: 'русские',
    region: 'Республика Марий Эл',
    type: 'Фотографии',
    author: 'Анна С.',
    color: 'russian',
    image: 'city',
  },
]

const themes = [
  ['Язык и слово', '162 материала', 'language'],
  ['Семейная память', '238 материалов', 'family'],
  ['Музыка и песни', '86 материалов', 'music'],
  ['Ремёсла и орнаменты', '115 материалов', 'craft'],
]

const routes = new Set(['home', 'peoples', 'people', 'region', 'material', 'collections', 'profile'])

function getRouteFromHash() {
  const route = window.location.hash.replace('#', '')
  return routes.has(route) ? route : 'home'
}

function App() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(regions[0])
  const [selectedPeople, setSelectedPeople] = useState('Все народы')
  const [availableRegions, setAvailableRegions] = useState<Region[]>(regions)
  const [availablePublications, setAvailablePublications] = useState(publications)
  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [language, setLanguage] = useState('RU')
  const [route, setRoute] = useState(getRouteFromHash)
  const [selectedEthnos, setSelectedEthnos] = useState('Марийцы')
  const [ethnosRegionFilter, setEthnosRegionFilter] = useState<Region | null>(null)

  const selectRegion = (region: Region) => {
    setSelectedRegion(region)
    setSelectedPeople('Все народы')
  }

  useEffect(() => {
    const syncRoute = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/regions').then((response) => response.ok ? response.json() : Promise.reject()),
      fetch('/api/stories').then((response) => response.ok ? response.json() : Promise.reject()),
    ]).then(([loadedRegions, loadedStories]) => {
      if (Array.isArray(loadedRegions) && loadedRegions.length > 0) setAvailableRegions(loadedRegions)
      if (Array.isArray(loadedStories) && loadedStories.length > 0) setAvailablePublications(loadedStories)
    }).catch(() => {
      // The static demo data keeps the interface usable before the local API starts.
    })
  }, [])

  const navigate = (nextRoute: string) => {
    setRoute(nextRoute)
    window.location.hash = nextRoute
    setIsMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEthnos = (name: string, region: Region | null = null) => {
    setSelectedEthnos(name)
    setEthnosRegionFilter(region)
    navigate('people')
  }

  const setEthnosRegion = (region: Region) => {
    setSelectedRegion(region)
    setEthnosRegionFilter(region)
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
          <button className={route === 'profile' ? 'active' : ''} onClick={() => navigate('profile')}>Моё портфолио</button>
        </nav>
        <div className="header-actions">
          <button className="language" onClick={() => setLanguage(language === 'RU' ? 'МАР' : 'RU')} aria-label="Сменить язык">
            <Languages size={16} /> {language}
          </button>
          <button className="publish-button" onClick={() => setIsPublishOpen(true)}>
            <Upload size={16} /> Добавить материал
          </button>
          <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Открыть меню">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {route === 'home' ? <>
      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Цифровой атлас культурной памяти</div>
          <h1>Россия звучит <em>многими голосами.</em></h1>
          <p>Исследуйте истории, языки и традиции народов России. Сохраняйте своё наследие так, чтобы его могли услышать другие.</p>
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
            <p className="kicker">География материалов</p>
            <h2>Откройте Россию через живые истории</h2>
          </div>
          <button className="text-button">Весь каталог <ArrowRight size={17} /></button>
        </div>

        <div className="atlas-layout">
          <div className="map-shell">
            <div className="map-toolbar">
              <span><Globe2 size={16} /> Все регионы</span>
              <button><Filter size={15} /> Фильтры</button>
            </div>
            <div className="russia-map" aria-label="Схематическая карта России">
              <div className="map-label label-west">Европейская часть</div>
              <div className="map-label label-east">Сибирь и Дальний Восток</div>
              <div className="map-curve curve-a" />
              <div className="map-curve curve-b" />
              <div className="map-curve curve-c" />
              {availableRegions.map((region) => (
                <button
                  className={`map-point ${region.id === selectedRegion.id ? 'active' : ''}`}
                  key={region.id}
                  style={{ left: region.x, top: region.y }}
                  onClick={() => selectRegion(region)}
                  aria-label={region.name}
                >
                  <span className="point-pulse" />
                  <span className="point-core" />
                  <small>{region.name.replace('Республика ', '')}</small>
                </button>
              ))}
              <div className="map-legend"><span className="legend-dot" /> Материалы на карте</div>
            </div>
          </div>

          <aside className="region-panel">
            <div className="panel-topline"><span>Выбрано на карте</span><Compass size={18} /></div>
            <h3>{selectedRegion.name}</h3>
            <p>{selectedRegion.description}</p>
            <div className="region-stat"><b>{selectedRegion.materials}</b><span>публикации<br />в регионе</span></div>
            <div className="people-list">
              <span className="list-label">Представленные народы</span>
              {selectedRegion.peoples.map((person) => (
                <button
                  className={`people-row ${selectedPeople === person.name ? 'selected' : ''}`}
                  onClick={() => openEthnos(person.name, selectedRegion)}
                  key={person.name}
                >
                  <i className={`tone-${person.tone}`} />
                  <span>{person.name}</span>
                  <b>{person.count}</b>
                  <ArrowRight size={15} />
                </button>
              ))}
            </div>
            <button className="outline-button" onClick={() => navigate('region')}>Страница региона <ArrowRight size={16} /></button>
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
          {availablePublications
            .filter((item) => selectedPeople === 'Все народы' || item.people === selectedPeople)
            .map((item) => (
              <article className="publication-card clickable-card" key={item.title} onClick={() => navigate('material')}>
                <div className={`publication-image image-${item.image}`}>
                  <span className={`ethnos-tag tag-${item.color}`}>{item.people} · {item.selfName}</span>
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
          <button className="dark-button">Все темы <ArrowRight size={17} /></button>
        </div>
        <div className="theme-grid">
          {themes.map(([name, count, theme]) => (
            <button className={`theme-tile tile-${theme}`} key={name}>
              <span>{count}</span>
              <strong>{name}</strong>
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
            <button className="publish-button" onClick={() => setIsPublishOpen(true)}><Upload size={16} /> Добавить материал</button>
            <a href="#collections">Как это работает <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      </> : <CorePages route={route} selectedRegion={selectedRegion} selectedEthnos={selectedEthnos} ethnosRegionFilter={ethnosRegionFilter} availableRegions={availableRegions} availablePublications={availablePublications} onNavigate={navigate} onSelectRegion={selectRegion} onOpenEthnos={openEthnos} onSetEthnosRegion={setEthnosRegion} onClearEthnosRegion={() => setEthnosRegionFilter(null)} />}

      <footer>
        <div className="brand footer-brand"><span className="brand-mark"><i /><i /><i /><i /></span><span>этносфера</span></div>
        <p>Цифровой атлас народов России. Пространство памяти, языка и живых историй.</p>
        <span>Проект находится в разработке</span>
      </footer>

      {isPublishOpen && <PublishModal onClose={() => setIsPublishOpen(false)} />}
    </main>
  )
}

function SearchSelect({
  label,
  options,
  placeholder = 'Начните вводить',
  className = '',
}: {
  label: string
  options: string[]
  placeholder?: string
  className?: string
}) {
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const matches = options.filter((option) => option.toLocaleLowerCase().includes(query.toLocaleLowerCase()))

  const choose = (option: string) => {
    setValue(option)
    setQuery(option)
    setIsOpen(false)
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
  selectedRegion,
  selectedEthnos,
  ethnosRegionFilter,
  availableRegions,
  availablePublications,
  onNavigate,
  onSelectRegion,
  onOpenEthnos,
  onSetEthnosRegion,
  onClearEthnosRegion,
}: {
  route: string
  selectedRegion: Region
  selectedEthnos: string
  ethnosRegionFilter: Region | null
  availableRegions: Region[]
  availablePublications: typeof publications
  onNavigate: (route: string) => void
  onSelectRegion: (region: Region) => void
  onOpenEthnos: (name: string, region?: Region | null) => void
  onSetEthnosRegion: (region: Region) => void
  onClearEthnosRegion: () => void
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
          {[
            ['Марийцы', 'марий', 'Финно-угорская группа', '432 материала', 'mari'],
            ['Татары', 'tatarlar', 'Тюркская группа', '318 материалов', 'tatar'],
            ['Чуваши', 'чăваш', 'Тюркская группа', '215 материалов', 'chuvash'],
            ['Удмурты', 'удмурт', 'Финно-угорская группа', '121 материал', 'udmurt'],
            ['Башкиры', 'башкорт', 'Тюркская группа', '97 материалов', 'bashkir'],
            ['Русские', 'русские', 'Славянская группа', '184 материала', 'russian'],
          ].map(([name, selfName, group, count, tone]) => <button className="directory-card" key={name} onClick={() => onOpenEthnos(name)}>
            <span className={`directory-pattern pattern-${tone}`}><i /><i /><i /><i /></span>
            <div><small>{selfName}</small><h2>{name}</h2><p>{group}</p></div>
            <span className="directory-count">{count}</span><ArrowRight size={18} />
          </button>)}
        </div>
      </div>
    </section>
  }

  if (route === 'people') {
    const ethnos = {
      Марийцы: { selfName: 'марий', tone: 'mari', count: '432', description: 'Материалы о языке, песнях, семейной памяти, ремёслах и повседневной культуре народа мари.', regions: 'Республика Марий Эл, Татарстан, Башкортостан, Кировская область' },
      Татары: { selfName: 'tatarlar', tone: 'tatar', count: '318', description: 'Материалы о языке, городских и сельских традициях, музыке, кухне и семейной истории татар.', regions: 'Республика Татарстан, Республика Марий Эл, Башкортостан, Удмуртия' },
      Чуваши: { selfName: 'чăваш', tone: 'chuvash', count: '215', description: 'Материалы об орнаментах, обрядах, песнях, ремёслах и истории чувашских семей.', regions: 'Чувашская Республика, Республика Марий Эл, Татарстан' },
      Удмурты: { selfName: 'удмурт', tone: 'udmurt', count: '121', description: 'Песни, архивные фотографии, семейные рассказы и традиции удмуртской культуры.', regions: 'Удмуртская Республика, Татарстан, Пермский край' },
      Башкиры: { selfName: 'башкорт', tone: 'bashkir', count: '97', description: 'Истории о башкирском языке, музыке, природопользовании и семейных архивах.', regions: 'Республика Башкортостан, Республика Татарстан, Оренбургская область' },
      Русские: { selfName: 'русские', tone: 'russian', count: '184', description: 'Документы, фотографии, устные истории и локальные традиции русских семей.', regions: 'Все регионы России' },
    }[selectedEthnos] ?? { selfName: 'народ', tone: 'mari', count: '0', description: 'Материалы выбранного народа.', regions: 'Россия' }

    const topicCards = [
      ['Язык и слово', 'Слова, диалекты, тексты и переводы', 'topic-language'],
      ['Песни и музыка', 'Записи, мелодии, исполнители', 'topic-music'],
      ['Семейная память', 'Интервью, фото и домашние архивы', 'topic-family'],
      ['Фольклор', 'Сказки, предания и обряды', 'topic-folklore'],
      ['Ремёсла и орнаменты', 'Узоры, вещи и мастерские', 'topic-craft'],
      ['Кухня и быт', 'Рецепты, предметы и повседневность', 'topic-home'],
      ['Природа и места', 'Маршруты, растения и ландшафты', 'topic-nature'],
      ['Люди и события', 'Биографии и история сообществ', 'topic-people'],
    ]

    const materialCount = ethnosRegionFilter
      ? ethnosRegionFilter.peoples.find((person) => person.name === selectedEthnos)?.count ?? 0
      : ethnos.count

    return <section className="inner-page ethnos-page">
      <div className="breadcrumbs"><button onClick={() => onNavigate('peoples')}>Народы</button><span>/</span><span>{selectedEthnos}</span></div>
      <div className={`ethnos-hero ethnos-${ethnos.tone}`}>
        <div className="ethnos-hero-pattern"><i /><i /><i /><i /><i /></div>
        <div className="ethnos-hero-copy"><span>{selectedEthnos.toUpperCase()} · {ethnos.selfName.toUpperCase()}</span><h1>{selectedEthnos}</h1><p>{ethnosRegionFilter ? `Истории народа «${selectedEthnos}», связанные с регионом «${ethnosRegionFilter.name}».` : ethnos.description}</p></div>
        <div className="ethnos-stats"><b>{materialCount}</b><span>материалов</span><small><MapPin size={14} /> {ethnosRegionFilter ? ethnosRegionFilter.name : ethnos.regions}</small></div>
      </div>
      <div className="ethnos-filterbar"><span>Регион:</span><RegionFilter region={ethnosRegionFilter} availableRegions={availableRegions} onSelect={onSetEthnosRegion} onClear={onClearEthnosRegion} /></div>
      <div className="ethnos-topic-heading"><div><p className="kicker">Выберите тему</p><h2>С чего начнём знакомство?</h2></div><p>{ethnosRegionFilter ? `Тема покажет истории о ${selectedEthnos.toLowerCase()} в регионе «${ethnosRegionFilter.name}».` : `Тема покажет все публикации о ${selectedEthnos.toLowerCase()} из разных регионов.`}</p></div>
      <div className="ethnos-topic-grid">{topicCards.map(([title, description, tone]) => <button className={tone} key={title} onClick={() => onNavigate('material')}><span>{description}</span><strong>{title}</strong><ArrowRight size={19} /></button>)}</div>
      <div className="ethnos-bottom"><div><p className="kicker">На карте</p><h2>Где живут эти истории</h2><p>{ethnos.regions}</p></div><button className="outline-button" onClick={() => onNavigate('region')}><Map size={16} /> Смотреть регионы на карте</button></div>
    </section>
  }

  if (route === 'region') {
    return <section className="inner-page region-page">
      <div className="breadcrumbs"><button onClick={() => onNavigate('home')}>Карта</button><span>/</span><span>{selectedRegion.name}</span></div>
      <div className="region-hero">
        <div><p className="kicker">География материалов</p><h1>{selectedRegion.name}</h1><p>{selectedRegion.description}</p></div>
        <div className="region-hero-stat"><b>{selectedRegion.materials}</b><span>историй, опубликованных<br />в этом регионе</span></div>
      </div>
      <div className="region-content">
        <aside className="region-switcher"><span>Регионы на карте</span>{availableRegions.map((region) => <button className={region.id === selectedRegion.id ? 'selected' : ''} onClick={() => onSelectRegion(region)} key={region.id}><MapPin size={15} />{region.name.replace('Республика ', '')}</button>)}</aside>
        <div>
          <div className="region-subheading"><div><p className="kicker">Культуры региона</p><h2>Про кого рассказывает этот регион</h2></div><button className="text-button" onClick={() => onNavigate('peoples')}>Все народы <ArrowRight size={17} /></button></div>
          <div className="region-people-grid">{selectedRegion.peoples.map((person) => <button onClick={() => onOpenEthnos(person.name, selectedRegion)} key={person.name}><i className={`tone-${person.tone}`} /><span>{person.name}</span><b>{person.count}</b><ArrowRight size={16} /></button>)}</div>
          <div className="region-subheading materials-heading"><div><p className="kicker">Новое в регионе</p><h2>Истории жителей</h2></div><button className="filter-pill"><Filter size={15} /> Фильтры</button></div>
          <div className="compact-publications">{availablePublications.filter((item) => item.region === selectedRegion.name).map((item) => <button key={item.title} onClick={() => onNavigate('material')}><span className={`compact-image image-${item.image}`} /><span><small>{item.people} · {item.type}</small><strong>{item.title}</strong><em>{item.author}</em></span><ArrowRight size={17} /></button>)}</div>
        </div>
      </div>
    </section>
  }

  if (route === 'material') {
    const materialEthnos = {
      Марийцы: { selfName: 'марий', tone: 'mari' },
      Татары: { selfName: 'tatarlar', tone: 'tatar' },
      Чуваши: { selfName: 'чăваш', tone: 'chuvash' },
      Удмурты: { selfName: 'удмурт', tone: 'udmurt' },
      Башкиры: { selfName: 'башкорт', tone: 'bashkir' },
      Русские: { selfName: 'русские', tone: 'russian' },
    }[selectedEthnos] ?? { selfName: 'народ', tone: 'mari' }
    const materialRegion = ethnosRegionFilter?.name ?? 'Республика Марий Эл'

    return <section className="inner-page material-page">
      <div className="breadcrumbs"><button onClick={() => onNavigate('home')}>ЭтноСфера</button><span>/</span><button onClick={() => onNavigate('region')}>Республика Марий Эл</button><span>/</span><span>Публикация</span></div>
      <div className="material-head">
        <div><div className="material-tags"><span className={`ethnos-tag tag-${materialEthnos.tone}`}>{selectedEthnos} · {materialEthnos.selfName}</span><span className="soft-tag"><MapPin size={12} /> {materialRegion}</span><span className="soft-tag">Семейная память</span></div><h1>Песни, которые пели у печи</h1><p>Аудиозаписи и воспоминания о песнях, которые в семье Кузнецовых передавали от поколения к поколению.</p></div>
        <div className="author-box"><span className="avatar">АП</span><div><small>Опубликовала</small><strong>Алина П.</strong><span>12 апреля 2026</span></div><button aria-label="Сохранить"><Heart size={18} /></button></div>
      </div>
      <div className="material-gallery"><div className="material-photo photo-main"><span>01</span></div><div className="material-photo photo-detail"><span>02</span></div><div className="material-photo photo-landscape"><span>03</span></div></div>
      <div className="material-layout">
        <article className="material-story"><p className="lead">«Когда печь затопят, бабушка садилась у окна и тихо начинала петь. Мы не всегда понимали слова, но знали, что это важно».</p><p>Эти записи были сделаны зимой 2025 года в Верх-Ушнуре. Я попросила бабушку вспомнить песни, которые она слышала в детстве. Часть из них исполнялась на марийском языке, часть - на русском, и в этом смешении хорошо слышна история нашей семьи.</p><h2>Как собирался материал</h2><p>Мы записывали разговоры на телефон, затем вместе переслушивали их и подписывали старые фотографии. Самой ценной стала короткая песня о дороге домой: бабушка вспомнила только два куплета, но узнала мотив на старой кассете.</p><div className="quote-note"><BookOpen size={19} /><span>Источник: личная беседа с Валентиной Кузнецовой, 2025 год. Семейный архив автора.</span></div></article>
        <aside className="material-aside"><div className="audio-card"><span className="audio-label">Аудиозапись</span><button><Play size={18} fill="currentColor" /></button><strong>Колыбельная, фрагмент</strong><small>02:38 · марийский язык</small><div className="wave" /></div><div className="material-meta"><span><MapPin size={16} /> Верх-Ушнур, {materialRegion}</span><span><Languages size={16} /> Марийский, русский</span><span><FileText size={16} /> Устная история</span></div><button className="download-button"><Download size={16} /> Скачать материалы</button></aside>
      </div>
    </section>
  }

  if (route === 'collections') {
    return <section className="inner-page collection-page">
      <div className="page-intro split-intro"><div><p className="kicker">Подборки пользователей</p><h1>Коллекции</h1><p>Сохраняйте чужие публикации в личные тематические подборки или открывайте свои находки для всех.</p></div><button className="publish-button"><FolderHeart size={16} /> Создать коллекцию</button></div>
      <div className="collection-feature"><div className="collection-art"><span>12</span><i /><i /><i /></div><div><p className="kicker">Коллекция недели</p><h2>Память о доме</h2><p>Семейные фотографии, письма и голоса из разных уголков Марий Эл. Подборка, которую собирают участники из пяти населённых пунктов.</p><div className="collection-by"><span className="avatar">МС</span> Собрала Мария С. · 12 материалов</div><button className="dark-button">Открыть коллекцию <ArrowRight size={17} /></button></div></div>
      <div className="section-heading collection-title"><div><p className="kicker">Открытые подборки</p><h2>Собрано людьми</h2></div><button className="text-button">Все коллекции <ArrowRight size={17} /></button></div>
      <div className="collection-grid">{[['Голоса детства', 'Аудио и устные истории', '18 материалов', 'coll-voice'], ['Узоры Поволжья', 'Орнаменты и ремёсла', '24 материала', 'coll-pattern'], ['Дороги семьи', 'Люди и населённые пункты', '9 материалов', 'coll-roads']].map(([name, description, count, tone]) => <article className="collection-card" key={name}><div className={`collection-cover ${tone}`}><i /><i /><i /></div><p>{description}</p><h3>{name}</h3><div><span>{count}</span><button onClick={() => onNavigate('material')}><ArrowRight size={17} /></button></div></article>)}</div>
    </section>
  }

  return <section className="inner-page profile-page">
    <div className="profile-cover"><span className="profile-pattern"><i /><i /><i /><i /></span></div>
    <div className="profile-summary"><span className="profile-avatar">АП</span><div><p className="kicker">Личный кабинет</p><h1>Алина Петрова</h1><p>Собираю семейные истории и материалы о марийской культуре.</p></div><button className="outline-button"><UserRound size={16} /> Редактировать профиль</button></div>
    <div className="profile-tabs"><button className="active">Портфолио</button><button>Мои публикации <span>7</span></button><button>Коллекции <span>3</span></button></div>
    <div className="portfolio-layout"><div><div className="section-heading compact"><div><p className="kicker">Избранные работы</p><h2>Моё портфолио</h2></div><button className="download-button"><Download size={16} /> Скачать PDF</button></div><div className="portfolio-list">{[['Песни, которые пели у печи', 'Устная история · Аудио', 'Марийцы'], ['Орнамент на полотенце бабушки', 'Семейный архив · Фото', 'Чуваши'], ['История старого дома', 'Исследовательская работа · Текст', 'Русские']].map(([title, kind, people], index) => <button key={title} onClick={() => onNavigate('material')}><b>0{index + 1}</b><span><strong>{title}</strong><small>{kind}</small></span><em>{people}</em><ArrowRight size={17} /></button>)}</div></div><aside className="portfolio-side"><span className="side-label">В портфолио</span><b>7</b><span>опубликованных<br />материалов</span><hr /><span className="side-label">Темы</span><p>Семейная память<br />Музыка и песни<br />Язык и слово</p></aside></div>
  </section>
}

function PublishModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])

  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return
    setGalleryFiles((current) => [...current, ...Array.from(files)].slice(0, 10))
  }

  const addAttachmentFiles = (files: FileList | null) => {
    if (!files) return
    setAttachmentFiles((current) => [...current, ...Array.from(files)])
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="publish-modal" role="dialog" aria-modal="true" aria-label="Добавить материал" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><p className="kicker">Новая публикация</p><h2>Добавьте историю</h2></div>
          <button onClick={onClose} aria-label="Закрыть"><X size={22} /></button>
        </div>
        <div className="stepper"><span className={step >= 1 ? 'done' : ''}>1. Материал</span><i /><span className={step >= 2 ? 'done' : ''}>2. Контекст</span><i /><span className={step >= 3 ? 'done' : ''}>3. Публикация</span></div>
        {step === 1 && <div className="modal-content">
          <label>Название<input placeholder="Например, История старого дома" /></label>
          <div className="gallery-editor">
            <div className="gallery-editor-header">
              <div><strong>Фото и видео</strong><span>До 10 файлов для галереи</span></div>
              <label className="add-media-button"><Plus size={16} /> Добавить фото<input type="file" accept="image/*,video/*" multiple onChange={(event) => addGalleryFiles(event.target.files)} /></label>
            </div>
            {galleryFiles.length > 0 ? (
              <div className="gallery-strip">
                {galleryFiles.map((file, index) => (
                  <div className="gallery-file" key={`${file.name}-${index}`}>
                    {file.type.startsWith('image/') ? <img src={URL.createObjectURL(file)} alt={file.name} /> : <div className="video-placeholder"><Video size={24} /><span>{file.name}</span></div>}
                    <button onClick={() => setGalleryFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Удалить ${file.name}`}><X size={14} /></button>
                    <small>{index + 1}</small>
                  </div>
                ))}
              </div>
            ) : (
              <label className="gallery-empty"><Image size={26} /><strong>Здесь появится ваша галерея</strong><span>Перетащите файлы или добавьте их кнопкой справа</span><input type="file" accept="image/*,video/*" multiple onChange={(event) => addGalleryFiles(event.target.files)} /></label>
            )}
          </div>
          <label>Краткое описание<textarea placeholder="Коротко расскажите, что увидит или услышит человек" /></label>
          <div className="attachments-editor">
            <div className="attachments-header"><div><strong>Аудио и документы</strong><span>Файлы будут показаны внизу публикации</span></div><label className="attachment-add"><Paperclip size={16} /> Прикрепить<input type="file" accept="audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.odt,.ods,.odp" multiple onChange={(event) => addAttachmentFiles(event.target.files)} /></label></div>
            {attachmentFiles.length > 0 && <div className="attachment-list">
              {attachmentFiles.map((file, index) => <div className="attachment-row" key={`${file.name}-${index}`}><FileText size={17} /><span title={file.name}>{file.name}</span><small>{(file.size / 1024 / 1024).toFixed(1)} МБ</small><button onClick={() => setAttachmentFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Удалить ${file.name}`}><Trash2 size={15} /></button></div>)}
            </div>}
          </div>
        </div>}
        {step === 2 && <div className="modal-content form-grid">
          <SearchSelect label="Связанный народ" placeholder="Введите народ" options={['Марийцы', 'Татары', 'Чуваши', 'Русские', 'Удмурты', 'Башкиры']} />
          <SearchSelect label="Регион" placeholder="Введите регион" options={['Республика Марий Эл', 'Республика Татарстан', 'Удмуртская Республика', 'Республика Башкортостан']} />
          <SearchSelect label="Язык" placeholder="Введите язык" options={['Русский', 'Марийский', 'Татарский', 'Чувашский', 'Удмуртский', 'Башкирский']} />
          <SearchSelect label="Тема" placeholder="Введите тему" options={['Семейная память', 'Музыка и песни', 'Ремёсла и орнаменты', 'Язык и слово', 'Фольклор', 'Природа и этноботаника']} />
          <label className="full-width">Источник<textarea placeholder="Семейный архив, интервью, книга, музейный фонд..." /></label>
        </div>}
        {step === 3 && <div className="modal-content">
          <div className="notice"><BookOpen size={20} /><p>После технической проверки файл будет опубликован. Автоматическая система проверит публикацию на нарушения, а не на историческую достоверность.</p></div>
          <label className="check"><input type="checkbox" /> <span>Я являюсь автором материалов либо имею разрешение на их публикацию и скачивание.</span></label>
          <label className="check"><input type="checkbox" /> <span>Я подтверждаю, что мне исполнилось 14 лет.</span></label>
        </div>}
        <div className="modal-footer">
          {step > 1 && <button className="back-button" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {step === 2 ? 'К материалу' : 'К контексту'}</button>}
          <button className="publish-button" onClick={() => step < 3 ? setStep(step + 1) : onClose()}>{step < 3 ? 'Продолжить' : <><Send size={16} /> Опубликовать</>}</button>
        </div>
      </section>
    </div>
  )
}

export default App
