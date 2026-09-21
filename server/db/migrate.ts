import { client } from './client'

export async function migrate() {
  await client.batch([
    'CREATE TABLE IF NOT EXISTS regions (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT NOT NULL, map_x TEXT NOT NULL, map_y TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS peoples (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, self_name TEXT NOT NULL, tone TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS region_peoples (region_id TEXT NOT NULL, people_id TEXT NOT NULL, material_count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (region_id, people_id))',
    'CREATE TABLE IF NOT EXISTS topics (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS stories (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, excerpt TEXT NOT NULL, content TEXT NOT NULL, people_id TEXT NOT NULL, region_id TEXT NOT NULL, topic_id TEXT NOT NULL, type TEXT NOT NULL, author TEXT NOT NULL, image TEXT NOT NULL, created_at TEXT NOT NULL)'
  ])
}
