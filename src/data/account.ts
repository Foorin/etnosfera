// Демонстрационный аккаунт. Ничего не сохраняется: всё живёт в памяти вкладки и сбрасывается при F5.

export type PostStatus = 'Черновик' | 'На проверке' | 'Опубликован' | 'Скрыт'

export type UserPost = {
  id: string
  title: string
  people: string
  topic: string
  region: string
  type: string
  status: PostStatus
  date: string
  image: string
  materialSlug?: string
  // Портфолио собирается вручную: по ТЗ автор сам выбирает, какие работы в нём показать.
  inPortfolio?: boolean
  // Тексты материала — те же части, что читатель видит на странице публикации.
  lead?: string
  summary?: string
  body?: string
  collected?: string
  source?: string
}

export const EMPTY_POST: UserPost = {
  id: '',
  title: '',
  people: 'Марийцы',
  topic: 'family',
  region: 'Республика Марий Эл',
  type: 'Устная история',
  status: 'Черновик',
  date: 'не отправлен',
  image: 'family',
  inPortfolio: false,
  lead: '',
  summary: '',
  body: '',
  collected: '',
  source: '',
}

export type CollectionAccess = 'Приватная' | 'По ссылке' | 'Публичная'

export type UserCollection = {
  id: string
  name: string
  description: string
  count: number
  access: CollectionAccess
  cover: string
  author: string
  authorInitials: string
  // Слаги материалов: сама коллекция ничего не дублирует, а ссылается на публикации.
  items: string[]
  // Имя автора оригинала, если подборка сохранена у другого человека.
  savedFrom?: string
}

export type Account = {
  name: string
  email: string
  initials: string
  about: string
  isNew: boolean
  // По ТЗ пользователь управляет публичностью профиля и портфолио; портфолио закрыто по умолчанию.
  publicProfile?: boolean
  publicPortfolio?: boolean
}

export const DEMO_EMAIL = 'alina@example.ru'
export const DEMO_PASSWORD = 'etnosfera'

export const DEMO_ACCOUNT: Account = {
  name: 'Алина Петрова',
  email: DEMO_EMAIL,
  initials: 'АП',
  about: 'Собираю семейные истории и материалы о марийской культуре.',
  isNew: false,
  publicProfile: true,
  publicPortfolio: false,
}

// У демо-автора уже есть работы — иначе кабинет выглядел бы пустым и путь было бы не показать.
export const DEMO_POSTS: UserPost[] = [
  {
    id: 'post-1',
    title: 'Песни, которые пели у печи',
    people: 'Марийцы',
    topic: 'music',
    region: 'Республика Марий Эл',
    type: 'Аудиоистория',
    status: 'Опубликован',
    date: '12 апреля 2026',
    image: 'song',
    inPortfolio: true,
    materialSlug: 'pesni-kotorye-peli-u-pechi',
  },
  {
    id: 'post-2',
    title: 'Команмелна: блины в три слоя',
    people: 'Марийцы',
    topic: 'home',
    region: 'Республика Марий Эл',
    type: 'Видеозапись',
    status: 'Опубликован',
    date: '14 февраля 2026',
    image: 'home',
    inPortfolio: true,
    materialSlug: 'komanmelna-bliny-v-tri-sloya',
  },
  {
    id: 'post-3',
    title: 'Слова, которых нет в словаре',
    people: 'Марийцы',
    topic: 'language',
    region: 'Республика Марий Эл',
    type: 'Устная история',
    status: 'Опубликован',
    date: '3 марта 2026',
    image: 'language',
    materialSlug: 'slova-kotoryh-net-v-slovare',
  },
  {
    id: 'post-4',
    title: 'Разговор с бабушкой о переезде',
    people: 'Марийцы',
    topic: 'people',
    region: 'Республика Марий Эл',
    type: 'Устная история',
    status: 'Черновик',
    date: 'не отправлен',
    image: 'people',
    lead: '«Мы уезжали в ноябре. Мать всю дорогу держала на коленях узел с посудой и не сказала ни слова».',
    summary: 'Запись разговора о переезде семьи из деревни в город в 1974 году.',
    body: 'Бабушка рассказывает о переезде так, будто это было вчера: помнит, во что была одета, сколько стоил билет и как пахло в вагоне. Я записала два часа разговора и пока расшифровала только первую половину.\n\nСамое неожиданное — она ни разу не назвала переезд бедой. Говорит: «Так было надо». А потом полчаса вспоминает дом, который оставили.',
    collected: '',
    source: '',
  },
  {
    id: 'post-5',
    title: 'Фотографии с сенокоса',
    people: 'Марийцы',
    topic: 'nature',
    region: 'Республика Марий Эл',
    type: 'Фотографии',
    status: 'Скрыт',
    date: '7 февраля 2026',
    image: 'nature',
  },
]

export const DEMO_COLLECTIONS: UserCollection[] = [
  {
    id: 'golosa-detstva',
    name: 'Голоса детства',
    description: 'Аудиозаписи и устные истории, в которых слышно, как звучал дом: колыбельные, наигрыши, частушки и разговоры за столом.',
    count: 8,
    access: 'Публичная',
    cover: 'coll-voice',
    author: 'Алина Петрова',
    authorInitials: 'АП',
    items: [
      'garmonist-s-kozmodemyanskoy-pristani',
      'kugu-yumo-i-pervyy-dozhd',
      'garmon-na-svadbe-v-arske',
      'krezi-kotorye-poyut-vtroem',
      'chastushki-pod-balalayku',
      'melodii-nashego-dvora',
      'kuray-kotoryy-delayut-sami',
      'pesni-splavshchikov',
    ],
  },
  {
    id: 'uzory-povolzhya',
    name: 'Узоры Поволжья',
    description: 'Орнаменты, вышивка, кожа, войлок и серебро четырёх республик — подборка о том, как узор становится языком.',
    count: 8,
    access: 'По ссылке',
    cover: 'coll-pattern',
    author: 'Алина Петрова',
    authorInitials: 'АП',
    items: [
      'vyshivka-kotoruyu-chitayut',
      'ornament-na-polotence-babushki',
      'ichigi-sapogi-iz-cvetnoy-kozhi',
      'monisto-sobrannoe-za-tri-pokoleniya',
      'vojlok-kotoryy-katayut-vchetverom',
      'uzor-kotoryy-schitayut-nitkami',
      'kruzheva-i-derevyannye-kolodki',
      'serebro-v-zhenskom-ubore',
    ],
  },
  {
    id: 'dorogi-semyi',
    name: 'Дороги семьи',
    description: 'Переезды, письма и дороги: материалы о том, как семьи снимались с места и что увозили с собой.',
    count: 6,
    access: 'Приватная',
    cover: 'coll-roads',
    author: 'Алина Петрова',
    authorInitials: 'АП',
    items: [
      'pisma-iz-sernura',
      'istoriya-starogo-doma',
      'albom-perezhivshiy-pereezd',
      'kak-semya-pereehala-na-sever',
      'dorogi-mezhdu-dvumya-selami',
      'reka-po-kotoroy-splavlyali-les',
    ],
  },
]

// Коллекция недели из общего раздела — чужая, чтобы было видно: в подборку попадают материалы любых авторов.
export const FEATURED_COLLECTION: UserCollection = {
  id: 'pamyat-o-dome',
  name: 'Память о доме',
  description: 'Семейные фотографии, письма и голоса из разных уголков Поволжья. Подборка, которую собирают участники из пяти населённых пунктов.',
  count: 6,
  access: 'Публичная',
  cover: 'coll-voice',
  author: 'Мария Смирнова',
  authorInitials: 'МС',
  items: [
    'pech-i-vse-chto-v-ney-gotovili',
    'dom-na-dve-poloviny',
    'ulicy-starogo-yoshkar-oly',
    'pisma-iz-sernura',
    'albom-zavodskoy-dinastii',
    'sunduk-s-pridanym',
  ],
}

export const PUBLIC_COLLECTIONS: UserCollection[] = [FEATURED_COLLECTION, ...DEMO_COLLECTIONS]

export function collectionById(id: string) {
  return PUBLIC_COLLECTIONS.find((collection) => collection.id === id)
}

export const COLLECTION_COVERS = ['coll-voice', 'coll-pattern', 'coll-roads']

export const ACCESS_OPTIONS: CollectionAccess[] = ['Приватная', 'По ссылке', 'Публичная']

export function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ЭС'
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase()
  return (parts[0][0] + parts[1][0]).toLocaleUpperCase()
}
