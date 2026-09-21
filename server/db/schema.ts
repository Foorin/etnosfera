import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const regions = sqliteTable('regions', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  mapX: text('map_x').notNull(),
  mapY: text('map_y').notNull(),
}, (table) => [uniqueIndex('regions_slug_unique').on(table.slug)])

export const peoples = sqliteTable('peoples', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  selfName: text('self_name').notNull(),
  tone: text('tone').notNull(),
}, (table) => [uniqueIndex('peoples_slug_unique').on(table.slug)])

export const regionPeoples = sqliteTable('region_peoples', {
  regionId: text('region_id').notNull(),
  peopleId: text('people_id').notNull(),
  materialCount: integer('material_count').notNull().default(0),
})

export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
}, (table) => [uniqueIndex('topics_slug_unique').on(table.slug)])

export const stories = sqliteTable('stories', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  peopleId: text('people_id').notNull(),
  regionId: text('region_id').notNull(),
  topicId: text('topic_id').notNull(),
  type: text('type').notNull(),
  author: text('author').notNull(),
  image: text('image').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [uniqueIndex('stories_slug_unique').on(table.slug)])
