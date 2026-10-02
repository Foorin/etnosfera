import { MATERIALS, PEOPLES, TOPICS, topicBySlug } from './data/content'
import { RUSSIA, countAtPlace } from './data/geo'
import type { Material } from './data/content'
import type { Place } from './data/geo'

export type SearchHit =
  | { kind: 'material'; material: Material; title: string; note: string }
  | { kind: 'people'; name: string; tone: string; title: string; note: string }
  | { kind: 'place'; place: Place; path: string[]; title: string; note: string }
  | { kind: 'topic'; slug: string; title: string; note: string }

// ТЗ (строка 418) требует, чтобы «мари» находило «Марийцы»: ищем по началу слова,
// а не по точному совпадению. Полноценная морфология для прототипа не нужна.
function matches(haystack: string, needle: string) {
  if (!haystack) return false
  const text = haystack.toLocaleLowerCase()
  if (text.includes(needle)) return true
  return text.split(/[\s,.;:()«»"'—-]+/).some((word) => word.startsWith(needle))
}

function flattenPlaces(place: Place, path: string[] = []): { place: Place; path: string[] }[] {
  const here = place.id === 'ru' ? [{ place, path: ['ru'] }] : [{ place, path }]
  const children = (place.children ?? []).flatMap((child) => flattenPlaces(child, [...(path.length ? path : ['ru']), child.id]))
  return [...here, ...children]
}

const ALL_PLACES = flattenPlaces(RUSSIA)

export function searchEverything(query: string, limit = 7): SearchHit[] {
  const needle = query.trim().toLocaleLowerCase()
  if (needle.length < 2) return []

  const peoples: SearchHit[] = PEOPLES
    .filter((people) => matches(people.name, needle) || matches(people.selfName, needle) || matches(people.group, needle))
    .map((people) => ({
      kind: 'people' as const,
      name: people.name,
      tone: people.tone,
      title: people.name,
      note: `${people.selfName} · ${people.group}`,
    }))

  const places: SearchHit[] = ALL_PLACES
    .filter(({ place }) => matches(place.name, needle))
    .map(({ place, path }) => ({
      kind: 'place' as const,
      place,
      path,
      title: place.name,
      note: `${place.kind === 'country' ? 'Страна' : place.kind === 'region' ? 'Регион' : 'Населённый пункт'} · ${countAtPlace(place)} материалов`,
    }))

  const topics: SearchHit[] = TOPICS
    .filter((topic) => matches(topic.title, needle) || matches(topic.description, needle))
    .map((topic) => ({ kind: 'topic' as const, slug: topic.slug, title: topic.title, note: topic.description }))

  const materials: SearchHit[] = MATERIALS
    .filter((material) =>
      matches(material.title, needle)
      || matches(material.lead, needle)
      || matches(material.intro, needle)
      || matches(material.author, needle)
      || matches(material.place, needle)
      || matches(material.languages, needle)
      || matches(material.source, needle))
    .map((material) => ({
      kind: 'material' as const,
      material,
      title: material.title,
      note: `${material.people} · ${topicBySlug(material.topic).title} · ${material.place}`,
    }))

  // Народы и места короче и понятнее, поэтому идут первыми; материалов обычно больше всего.
  return [...peoples, ...places, ...topics, ...materials].slice(0, limit)
}

export function countAllHits(query: string) {
  return searchEverything(query, Number.MAX_SAFE_INTEGER).length
}
