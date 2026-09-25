import { MATERIALS } from './content'

export type PlaceKind = 'country' | 'region' | 'district' | 'settlement'

export type Place = {
  id: string
  name: string
  kind: PlaceKind
  // Долгота и широта — по ним ставится метка на карте и поворачивается глобус.
  coords: [number, number]
  description?: string
  // Как связать место с материалами: регион сопоставляется по полю region,
  // район и село — по вхождению в поле place.
  regionName?: string
  // Цвет метки региона — тот же, что у титульного народа, чтобы карта и каталог совпадали.
  tone?: string
  placeMatch?: string[]
  children?: Place[]
}

export const RUSSIA: Place = {
  id: 'ru',
  name: 'Россия',
  kind: 'country',
  coords: [99, 62],
  description: 'Материалы о народах России: языки, песни, ремёсла и семейная память.',
  children: [
    {
      id: 'mari-el',
      name: 'Республика Марий Эл',
      kind: 'region',
      coords: [47.9, 56.6],
      regionName: 'Республика Марий Эл',
      tone: 'mari',
      description: 'Первый регион наполнения: марийцы, русские, татары и чуваши Поволжья.',
      children: [
        { id: 'yoshkar-ola', name: 'Йошкар-Ола', kind: 'settlement', coords: [47.89, 56.63], placeMatch: ['Йошкар-Ола'] },
        { id: 'medvedevo', name: 'Медведево', kind: 'settlement', coords: [47.77, 56.63], placeMatch: ['Медведев'] },
        { id: 'verh-ushnur', name: 'Верх-Ушнур', kind: 'settlement', coords: [47.95, 56.45], placeMatch: ['Верх-Ушнур'], description: 'Село в Советском районе, где записаны семейные песни.' },
        { id: 'suslonger', name: 'Суслонгер', kind: 'settlement', coords: [48.22, 56.16], placeMatch: ['Суслонгер'] },
        { id: 'zvenigovo', name: 'Звенигово', kind: 'settlement', coords: [48.01, 55.97], placeMatch: ['Звенигов'] },
        { id: 'morki', name: 'Морки', kind: 'settlement', coords: [48.98, 56.45], placeMatch: ['Морки'] },
        { id: 'kuzhener', name: 'Куженер', kind: 'settlement', coords: [48.93, 56.77], placeMatch: ['Куженер'] },
        { id: 'sernur', name: 'Сернур', kind: 'settlement', coords: [49.16, 56.94], placeMatch: ['Сернур'] },
        { id: 'paranga', name: 'Параньга', kind: 'settlement', coords: [49.23, 56.70], placeMatch: ['Параньг'] },
        { id: 'shoy-shudumar', name: 'Шой-Шудумарь', kind: 'settlement', coords: [48.55, 56.85], placeMatch: ['Шой-Шудумарь'] },
        { id: 'mari-turek', name: 'Мари-Турек', kind: 'settlement', coords: [49.62, 56.77], placeMatch: ['Мари-Турек'] },
        { id: 'kosolapovo', name: 'Косолапово', kind: 'settlement', coords: [50.25, 56.35], placeMatch: ['Косолапово'] },
        { id: 'kozmodemyansk', name: 'Козьмодемьянск', kind: 'settlement', coords: [46.56, 56.34], placeMatch: ['Козьмодемьянск', 'Горномарийск'] },
        { id: 'yurino', name: 'Юрино', kind: 'settlement', coords: [46.30, 56.29], placeMatch: ['Юрин'] },
      ],
    },
    {
      id: 'tatarstan',
      name: 'Республика Татарстан',
      kind: 'region',
      coords: [49.1, 55.8],
      regionName: 'Республика Татарстан',
      tone: 'tatar',
      children: [
        { id: 'kazan', name: 'Казань', kind: 'settlement', coords: [49.12, 55.79], placeMatch: ['Казань'] },
        { id: 'arsk', name: 'Арск', kind: 'settlement', coords: [49.88, 56.09], placeMatch: ['Арск', 'Ташкичу'] },
        { id: 'baltasi', name: 'Балтаси', kind: 'settlement', coords: [50.20, 56.35], placeMatch: ['Балтасин'] },
        { id: 'chelny', name: 'Набережные Челны', kind: 'settlement', coords: [52.40, 55.74], placeMatch: ['Набережные Челны'] },
        { id: 'chistopol', name: 'Чистополь', kind: 'settlement', coords: [50.63, 55.37], placeMatch: ['Чистопол'] },
        { id: 'aksubaevo', name: 'Аксубаево', kind: 'settlement', coords: [50.84, 54.84], placeMatch: ['Аксубаев'] },
        { id: 'nurlat', name: 'Нурлат', kind: 'settlement', coords: [50.81, 54.43], placeMatch: ['Нурлат'] },
      ],
    },
    {
      id: 'udmurtia',
      name: 'Удмуртская Республика',
      kind: 'region',
      coords: [53.0, 57.0],
      regionName: 'Удмуртская Республика',
      tone: 'udmurt',
      children: [
        { id: 'glazov', name: 'Глазов', kind: 'settlement', coords: [52.66, 58.14], placeMatch: ['Глазов'] },
        { id: 'yukamenskoe', name: 'Юкаменское', kind: 'settlement', coords: [52.24, 58.13], placeMatch: ['Юкаменск'] },
        { id: 'igra', name: 'Игра', kind: 'settlement', coords: [53.05, 57.55], placeMatch: ['Игра', 'Игринск'] },
        { id: 'sharkan', name: 'Шаркан', kind: 'settlement', coords: [53.86, 57.30], placeMatch: ['Шаркан'] },
        { id: 'yakshur-bodya', name: 'Якшур-Бодья', kind: 'settlement', coords: [53.16, 57.13], placeMatch: ['Якшур-Бодь'] },
        { id: 'mozhga', name: 'Можга', kind: 'settlement', coords: [52.22, 56.44], placeMatch: ['Можга'] },
      ],
    },
    {
      id: 'bashkortostan',
      name: 'Республика Башкортостан',
      kind: 'region',
      coords: [56.0, 54.2],
      regionName: 'Республика Башкортостан',
      tone: 'bashkir',
      children: [
        { id: 'uchaly', name: 'Учалы', kind: 'settlement', coords: [59.37, 54.31], placeMatch: ['Учалин'] },
        { id: 'beloretsk', name: 'Белорецк', kind: 'settlement', coords: [58.40, 53.97], placeMatch: ['Белорецк'] },
        { id: 'askarovo', name: 'Аскарово', kind: 'settlement', coords: [58.52, 53.55], placeMatch: ['Абзелилов'] },
        { id: 'burzyan', name: 'Старосубхангулово', kind: 'settlement', coords: [57.50, 53.10], placeMatch: ['Бурзян'] },
        { id: 'baimak', name: 'Баймак', kind: 'settlement', coords: [58.31, 52.59], placeMatch: ['Баймак'] },
      ],
    },
  ],
}

export function materialsAtPlace(place: Place) {
  if (place.kind === 'country') return MATERIALS
  if (place.regionName) return MATERIALS.filter((material) => material.region === place.regionName)
  if (place.placeMatch) {
    return MATERIALS.filter((material) => place.placeMatch!.some((needle) => material.place.includes(needle)))
  }
  return []
}

export function countAtPlace(place: Place) {
  return materialsAtPlace(place).length
}

// Путь от России до указанного места: нужен для хлебных крошек и для разбора адреса.
export function pathToPlace(ids: string[]): Place[] {
  const path: Place[] = [RUSSIA]
  let current = RUSSIA
  for (const id of ids) {
    const next = current.children?.find((child) => child.id === id)
    if (!next) break
    path.push(next)
    current = next
  }
  return path
}

export function placeById(ids: string[]) {
  const path = pathToPlace(ids)
  return path[path.length - 1]
}

// Упрощённые русла главных рек Поволжья и Предуралья: заданы опорными точками,
// поэтому рисуются той же проекцией, что и метки, и стоят на своих местах на любом уровне.
export type RiverLine = { name: string; width: number; points: [number, number][] }

export const RIVERS: RiverLine[] = [
  {
    name: 'Волга',
    width: 3.4,
    points: [
      [43.9, 56.33], [45.05, 56.12], [46.1, 56.18], [46.56, 56.34], [47.25, 56.13],
      [47.95, 55.98], [48.6, 55.72], [49.12, 55.78], [49.6, 55.38], [50.1, 54.9],
      [49.4, 54.2], [48.6, 53.6], [48.4, 52.8],
    ],
  },
  {
    name: 'Кама',
    width: 2.8,
    points: [
      [56.25, 58.0], [55.2, 57.6], [54.1, 56.95], [53.2, 56.3], [52.4, 55.72],
      [51.5, 55.55], [50.6, 55.4], [50.1, 54.9],
    ],
  },
  {
    name: 'Вятка',
    width: 2.2,
    points: [
      [49.65, 58.6], [49.9, 57.9], [50.15, 57.2], [50.35, 56.5], [50.9, 56.05], [51.5, 55.55],
    ],
  },
  {
    name: 'Белая',
    width: 2.2,
    points: [
      [57.9, 53.3], [57.0, 53.9], [56.2, 54.45], [56.0, 54.74], [55.3, 55.3],
      [54.5, 55.7], [53.8, 55.9], [53.2, 56.3],
    ],
  },
  {
    name: 'Чепца',
    width: 1.8,
    points: [[53.9, 57.95], [53.0, 58.05], [52.66, 58.14], [51.5, 58.4], [50.4, 58.55], [49.65, 58.6]],
  },
  {
    name: 'Малая Кокшага',
    width: 1.6,
    points: [[47.72, 57.1], [47.86, 56.75], [47.89, 56.63], [47.95, 56.3], [47.95, 55.98]],
  },
  {
    name: 'Ветлуга',
    width: 1.8,
    points: [[46.3, 58.2], [46.2, 57.5], [46.4, 56.9], [46.6, 56.4], [46.56, 56.34]],
  },
  // Притоки: без них на карте отдельной республики оставалась одна-две линии.
  { name: 'Уфа', width: 1.6, points: [[58.9, 55.9], [58.0, 55.6], [57.0, 55.2], [56.3, 54.9], [56.0, 54.74]] },
  { name: 'Дёма', width: 1.3, points: [[54.6, 53.1], [55.0, 53.6], [55.5, 54.2], [56.0, 54.74]] },
  { name: 'Большая Кокшага', width: 1.3, points: [[47.1, 57.0], [47.3, 56.5], [47.5, 56.2], [47.6, 55.99]] },
  { name: 'Илеть', width: 1.3, points: [[49.0, 56.6], [48.7, 56.3], [48.4, 56.0], [48.3, 55.9]] },
  { name: 'Свияга', width: 1.5, points: [[48.0, 54.3], [48.3, 54.9], [48.5, 55.4], [48.6, 55.75]] },
  { name: 'Казанка', width: 1.3, points: [[50.2, 55.95], [49.7, 55.9], [49.3, 55.83], [49.12, 55.79]] },
  { name: 'Иж', width: 1.4, points: [[53.3, 57.2], [53.2, 56.85], [53.3, 56.3], [53.5, 55.9], [53.2, 56.3]] },
  { name: 'Кильмезь', width: 1.3, points: [[52.2, 56.9], [51.4, 56.8], [50.8, 56.6], [50.35, 56.5]] },
]

// Возвышенности: рисуются мягкими пятнами под реками, чтобы поле не было плоским.
export type ReliefArea = { name: string; kind: 'ridge' | 'forest'; points: [number, number][] }

export const RELIEF: ReliefArea[] = [
  {
    name: 'Уральские горы',
    kind: 'ridge',
    points: [
      [59.8, 52.0], [60.4, 53.5], [60.2, 55.0], [59.4, 56.5], [59.0, 58.0],
      [57.9, 58.0], [58.3, 56.4], [58.6, 55.0], [58.4, 53.4], [58.2, 52.0],
    ],
  },
  {
    name: 'Вятский Увал',
    kind: 'ridge',
    points: [[48.6, 58.4], [49.3, 57.6], [49.4, 56.6], [49.0, 55.9], [48.2, 56.1], [48.2, 57.0], [47.9, 58.2]],
  },
  {
    name: 'Марийская низменность',
    kind: 'forest',
    points: [[46.6, 56.6], [47.9, 56.9], [48.6, 56.6], [48.4, 56.0], [47.3, 55.9], [46.5, 56.1]],
  },
  {
    name: 'Прикамские леса',
    kind: 'forest',
    points: [[52.4, 57.6], [53.6, 57.4], [54.0, 56.8], [53.2, 56.2], [52.2, 56.5], [51.9, 57.1]],
  },
]
