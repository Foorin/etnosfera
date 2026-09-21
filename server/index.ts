import express from 'express'
import { and, desc, eq } from 'drizzle-orm'
import { db } from './db/client'
import { migrate } from './db/migrate'
import { peoples, regionPeoples, regions, stories, topics } from './db/schema'

const app = express()
app.use(express.json())

async function regionPayload(region: typeof regions.$inferSelect) {
  const memberships = await db.select({ name: peoples.name, count: regionPeoples.materialCount, tone: peoples.tone })
    .from(regionPeoples)
    .innerJoin(peoples, eq(regionPeoples.peopleId, peoples.id))
    .where(eq(regionPeoples.regionId, region.id))

  return {
    id: region.slug,
    slug: region.slug,
    name: region.name,
    materials: memberships.reduce((sum, item) => sum + item.count, 0),
    peoples: memberships.map((item) => ({ name: item.name, count: item.count, tone: item.tone })),
    description: region.description,
    x: region.mapX,
    y: region.mapY,
  }
}

app.get('/api/regions', async (_request, response) => {
  const allRegions = await db.select().from(regions)
  response.json(await Promise.all(allRegions.map(regionPayload)))
})

app.get('/api/regions/:slug', async (request, response) => {
  const region = await db.query.regions.findFirst({ where: eq(regions.slug, request.params.slug) })
  if (!region) return response.status(404).json({ error: 'Регион не найден' })
  response.json(await regionPayload(region))
})

app.get('/api/peoples', async (_request, response) => {
  response.json(await db.select().from(peoples))
})

app.get('/api/peoples/:slug', async (request, response) => {
  const people = await db.query.peoples.findFirst({ where: eq(peoples.slug, request.params.slug) })
  if (!people) return response.status(404).json({ error: 'Народ не найден' })

  const regionSlug = typeof request.query.region === 'string' ? request.query.region : undefined
  const memberships = await db.select({ slug: regions.slug, name: regions.name, count: regionPeoples.materialCount })
    .from(regionPeoples)
    .innerJoin(regions, eq(regionPeoples.regionId, regions.id))
    .where(eq(regionPeoples.peopleId, people.id))

  const selectedMembership = regionSlug ? memberships.find((item) => item.slug === regionSlug) : undefined
  response.json({
    ...people,
    materialCount: selectedMembership?.count ?? memberships.reduce((sum, item) => sum + item.count, 0),
    regions: memberships,
    selectedRegion: selectedMembership ?? null,
  })
})

app.get('/api/stories', async (request, response) => {
  const peopleSlug = typeof request.query.people === 'string' ? request.query.people : undefined
  const regionSlug = typeof request.query.region === 'string' ? request.query.region : undefined
  const topicSlug = typeof request.query.topic === 'string' ? request.query.topic : undefined
  const conditions = []
  if (peopleSlug) conditions.push(eq(peoples.slug, peopleSlug))
  if (regionSlug) conditions.push(eq(regions.slug, regionSlug))
  if (topicSlug) conditions.push(eq(topics.slug, topicSlug))

  const rows = await db.select({
    slug: stories.slug,
    title: stories.title,
    excerpt: stories.excerpt,
    type: stories.type,
    author: stories.author,
    image: stories.image,
    createdAt: stories.createdAt,
    people: peoples.name,
    selfName: peoples.selfName,
    color: peoples.tone,
    region: regions.name,
    regionSlug: regions.slug,
    topic: topics.name,
  }).from(stories)
    .innerJoin(peoples, eq(stories.peopleId, peoples.id))
    .innerJoin(regions, eq(stories.regionId, regions.id))
    .innerJoin(topics, eq(stories.topicId, topics.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(stories.createdAt))

  response.json(rows)
})

app.get('/api/stories/:slug', async (request, response) => {
  const row = await db.select({
    slug: stories.slug,
    title: stories.title,
    excerpt: stories.excerpt,
    content: stories.content,
    type: stories.type,
    author: stories.author,
    image: stories.image,
    createdAt: stories.createdAt,
    people: peoples.name,
    selfName: peoples.selfName,
    color: peoples.tone,
    region: regions.name,
    topic: topics.name,
  }).from(stories)
    .innerJoin(peoples, eq(stories.peopleId, peoples.id))
    .innerJoin(regions, eq(stories.regionId, regions.id))
    .innerJoin(topics, eq(stories.topicId, topics.id))
    .where(eq(stories.slug, request.params.slug))
    .get()
  if (!row) return response.status(404).json({ error: 'История не найдена' })
  response.json(row)
})

await migrate()
app.listen(8787, '127.0.0.1', () => console.log('EthnoSfera API: http://127.0.0.1:8787'))
