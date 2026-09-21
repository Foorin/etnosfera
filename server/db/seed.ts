import { db } from './client'
import { migrate } from './migrate'
import { peoples, regionPeoples, regions, stories, topics } from './schema'

await migrate()

await db.insert(regions).values([
  { id: 'mari-el', slug: 'mari-el', name: 'Республика Марий Эл', description: 'Семейные архивы, песни, орнаменты и истории жителей Поволжья.', mapX: '41%', mapY: '57%' },
  { id: 'tatarstan', slug: 'tatarstan', name: 'Республика Татарстан', description: 'Материалы о городских и сельских традициях, ремесле и семейной памяти.', mapX: '36%', mapY: '61%' },
  { id: 'udmurtia', slug: 'udmurtia', name: 'Удмуртская Республика', description: 'Архивные фотографии, музыкальная традиция и деревенские истории.', mapX: '46%', mapY: '54%' },
  { id: 'bashkortostan', slug: 'bashkortostan', name: 'Республика Башкортостан', description: 'Пилотная подборка устных историй и семейных документов.', mapX: '51%', mapY: '64%' },
]).onConflictDoNothing()

await db.insert(peoples).values([
  { id: 'mari', slug: 'mari', name: 'Марийцы', selfName: 'марий', tone: 'mari' },
  { id: 'tatars', slug: 'tatars', name: 'Татары', selfName: 'tatarlar', tone: 'tatar' },
  { id: 'chuvash', slug: 'chuvash', name: 'Чуваши', selfName: 'чăваш', tone: 'chuvash' },
  { id: 'russians', slug: 'russians', name: 'Русские', selfName: 'русские', tone: 'russian' },
  { id: 'udmurts', slug: 'udmurts', name: 'Удмурты', selfName: 'удмурт', tone: 'udmurt' },
  { id: 'bashkirs', slug: 'bashkirs', name: 'Башкиры', selfName: 'башкорт', tone: 'bashkir' },
]).onConflictDoNothing()

await db.insert(regionPeoples).values([
  { regionId: 'mari-el', peopleId: 'mari', materialCount: 250 }, { regionId: 'mari-el', peopleId: 'russians', materialCount: 93 }, { regionId: 'mari-el', peopleId: 'tatars', materialCount: 51 }, { regionId: 'mari-el', peopleId: 'chuvash', materialCount: 24 },
  { regionId: 'tatarstan', peopleId: 'tatars', materialCount: 106 }, { regionId: 'tatarstan', peopleId: 'russians', materialCount: 49 }, { regionId: 'tatarstan', peopleId: 'chuvash', materialCount: 18 }, { regionId: 'tatarstan', peopleId: 'mari', materialCount: 16 },
  { regionId: 'udmurtia', peopleId: 'udmurts', materialCount: 75 }, { regionId: 'udmurtia', peopleId: 'russians', materialCount: 31 }, { regionId: 'udmurtia', peopleId: 'tatars', materialCount: 15 },
  { regionId: 'bashkortostan', peopleId: 'bashkirs', materialCount: 52 }, { regionId: 'bashkortostan', peopleId: 'tatars', materialCount: 27 }, { regionId: 'bashkortostan', peopleId: 'russians', materialCount: 18 },
]).onConflictDoNothing()

await db.insert(topics).values([
  { id: 'family', slug: 'family-memory', name: 'Семейная память' }, { id: 'music', slug: 'music', name: 'Музыка и песни' }, { id: 'craft', slug: 'craft', name: 'Ремёсла и орнаменты' }, { id: 'history', slug: 'history', name: 'Люди и события' },
]).onConflictDoNothing()

await db.insert(stories).values([
  { id: 'mari-songs', slug: 'mari-songs', title: 'Песни, которые пели у печи', excerpt: 'Аудиозаписи и воспоминания о песнях, передававшихся в семье.', content: 'Записи были сделаны зимой 2025 года во время семейной беседы.', peopleId: 'mari', regionId: 'mari-el', topicId: 'music', type: 'Аудиоистория', author: 'Алина П.', image: 'song', createdAt: '2026-04-12' },
  { id: 'chuvash-towel', slug: 'chuvash-towel', title: 'Орнамент на полотенце бабушки', excerpt: 'Фотографии и расшифровка семейного орнамента.', content: 'В полотенце сохранился узор, который бабушка использовала в праздничных вещах.', peopleId: 'chuvash', regionId: 'mari-el', topicId: 'craft', type: 'Семейный архив', author: 'Михаил Н.', image: 'pattern', createdAt: '2026-04-09' },
  { id: 'old-yoshkar-ola', slug: 'old-yoshkar-ola', title: 'Улицы старого Йошкар-Олы', excerpt: 'Семейная подборка городских фотографий.', content: 'На снимках собраны городские улицы и история одной семьи.', peopleId: 'russians', regionId: 'mari-el', topicId: 'history', type: 'Фотографии', author: 'Анна С.', image: 'city', createdAt: '2026-04-07' },
  { id: 'tatar-family', slug: 'tatar-family', title: 'Семейные письма из Сернура', excerpt: 'Письма и фотографии татарской семьи из Марий Эл.', content: 'Домашний архив семьи с расшифровками писем.', peopleId: 'tatars', regionId: 'mari-el', topicId: 'family', type: 'Документы', author: 'Ринат К.', image: 'pattern', createdAt: '2026-04-05' },
  { id: 'tatar-kazan', slug: 'tatar-kazan', title: 'Мелодии нашего двора', excerpt: 'Воспоминания о музыкальной традиции в Казани.', content: 'Интервью с несколькими поколениями одной семьи.', peopleId: 'tatars', regionId: 'tatarstan', topicId: 'music', type: 'Аудиоистория', author: 'Лейсан А.', image: 'song', createdAt: '2026-04-03' },
  { id: 'udmurt-house', slug: 'udmurt-house', title: 'Дом, в котором звучали песни', excerpt: 'Устная история семьи из Удмуртии.', content: 'Фрагменты разговора, фотографии и семейная хронология.', peopleId: 'udmurts', regionId: 'udmurtia', topicId: 'family', type: 'Устная история', author: 'Дарья В.', image: 'city', createdAt: '2026-04-01' },
  { id: 'bashkir-honey', slug: 'bashkir-honey', title: 'Пасека моего деда', excerpt: 'Семейный рассказ о традиции бортничества.', content: 'Фотографии, заметки и интервью из Башкортостана.', peopleId: 'bashkirs', regionId: 'bashkortostan', topicId: 'history', type: 'Фотографии', author: 'Ильнар С.', image: 'song', createdAt: '2026-03-29' },
]).onConflictDoNothing()

console.log('SQLite database is ready: data/ethnosfera.db')
