import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as schema from './schema'

const databasePath = resolve(process.cwd(), 'data', 'ethnosfera.db')
mkdirSync(dirname(databasePath), { recursive: true })

export const client = createClient({ url: pathToFileURL(databasePath).href })
export const db = drizzle(client, { schema })
