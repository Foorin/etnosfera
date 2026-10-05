import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { geoOrthographic, geoMercator, geoConicEqualArea, geoPath, geoCentroid } from 'd3-geo'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json'
import { COUNTRIES, RELIEF, RIVERS, countAtPlace, pathToPlace } from './data/geo'
import type { Place } from './data/geo'

type Feature = { type: string; id?: string | number; properties: { name?: string }; geometry: unknown }

// Контуры стран из Natural Earth (общественное достояние), упрощённые до 110m —
// этого хватает для глобуса и держит вес в разумных пределах.
const world = worldData as unknown as { objects: { countries: unknown } }
const countries = (feature(world as never, world.objects.countries as never) as unknown as { features: Feature[] }).features
// Соответствие кода страны в контурах world-atlas и места в атласе: подсвечиваем
// все страны, где есть материалы, а не только Россию.
const BY_WORLD_ID = new Map(COUNTRIES.filter((country) => country.worldId).map((country) => [country.worldId!, country]))

const SIZE = 440

export function Globe({ ids, onGo, selected, onSelect }: {
  ids: string[]
  onGo: (ids: string[]) => void
  // На планете клик по стране не проваливает вглубь, а выбирает её — подробности
  // показываются в панели рядом. У плоской карты этих пропсов нет.
  selected?: string | null
  onSelect?: (place: Place) => void
}) {
  const isEarth = ids.length === 0
  const path = useMemo(() => pathToPlace(ids), [ids])
  const current = path[path.length - 1]

  const [rotation, setRotation] = useState<[number, number]>([-99, -30])
  const [spinning, setSpinning] = useState(true)
  const [hovered, setHovered] = useState<{ name: string; count: number | null } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<[number, number]>([0, 0])
  const drag = useRef<{ x: number; y: number; pan: [number, number] } | null>(null)
  const mapRef = useRef<SVGSVGElement | null>(null)
  const spin = useRef<{ x: number; y: number; rotation: [number, number]; moved: boolean } | null>(null)
  const justDragged = useRef(false)
  const [dragging, setDragging] = useState(false)
  const frame = useRef(0)
  const wheelRef = useRef<(event: WheelEvent) => void>(() => {})

  // Колесо слушаем на самом элементе (React вешает onWheel пассивно, и preventDefault
  // в нём не работает). Подписка живёт здесь, выше ветвления: если объявить её после
  // `if (isEarth) return`, при переходе планета ↔ карта у компонента меняется число
  // хуков и React падает с «Rendered more hooks than during the previous render».
  useEffect(() => {
    const element = mapRef.current
    if (!element) return
    const handler = (event: WheelEvent) => wheelRef.current(event)
    element.addEventListener('wheel', handler, { passive: false })
    return () => element.removeEventListener('wheel', handler)
  }, [isEarth])

  // При переходе на другой уровень масштаб и сдвиг сбрасываются: иначе новая карта
  // открывалась бы увеличенной и сдвинутой от прошлого разглядывания.
  useEffect(() => {
    setZoom(1)
    setPan([0, 0])
  }, [ids.join('/')])

  // Планета вращается сама, пока на неё не навели курсор: так видно, что это глобус,
  // а не картинка, но прицелиться в страну она не мешает.
  // Сняли выбор — планета снова оживает. Без этого она оставалась стоять,
  // потому что самовращение было выключено ещё при наведении курсора.
  useEffect(() => {
    if (!selected) setSpinning(true)
  }, [selected])

  useEffect(() => {
    // Пока страна выбрана, планета стоит: иначе выбранная страна уезжала бы
    // из-под курсора, пока её читают в панели. Крутить можно правой кнопкой.
    if (!isEarth || selected || !spinning || dragging) return
    let alive = true
    const tick = () => {
      if (!alive) return
      frame.current = window.setTimeout(() => {
        setRotation(([lambda, phi]) => [lambda + 0.25, phi])
        tick()
      }, 50)
    }
    tick()
    return () => { alive = false; window.clearTimeout(frame.current) }
  }, [isEarth, spinning, dragging, selected])

  if (isEarth) {
    const EARTH_W = SIZE * 1.6
    const projection = geoOrthographic()
      .scale((SIZE / 2 - 8) * zoom)
      .translate([EARTH_W / 2, SIZE / 2])
      .rotate(rotation)
    const draw = geoPath(projection)

    // Планету тоже приближаем колесом. Больше четырёхкратного орфографическая проекция
    // сильно искажает края, поэтому дальше не пускаем.
    wheelRef.current = (event: WheelEvent) => {
      event.preventDefault()
      setZoom((current) => Math.min(4, Math.max(1, current * (event.deltaY < 0 ? 1.15 : 1 / 1.15))))
    }

    // Планету можно крутить рукой: зажать и тянуть. Работает и пальцем на телефоне,
    // поэтому слушаем указатель, а не только мышь.
    const startSpin = (event: React.PointerEvent<SVGSVGElement>) => {
      // Мышью планету крутят правой кнопкой, левая остаётся за выбором страны —
      // так не нужно угадывать, клик это был или поворот. Пальцем на телефоне
      // кнопок нет, поэтому там крутит обычное касание.
      // Отметку о прошлом перетаскивании снимаем до проверки кнопки: иначе после
      // вращения правой кнопкой она оставалась поднятой и блокировала все клики левой.
      justDragged.current = false
      const byTouch = event.pointerType !== 'mouse'
      if (!byTouch && event.button !== 2) return
      spin.current = { x: event.clientX, y: event.clientY, rotation, moved: false }
      setDragging(true)
      setSpinning(false)
      try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* захват не обязателен */ }
    }

    const moveSpin = (event: React.PointerEvent<SVGSVGElement>) => {
      if (!spin.current) return
      const rect = event.currentTarget.getBoundingClientRect()
      const perPixel = 0.34 * (SIZE / (rect.width || SIZE))
      const shift = Math.hypot(event.clientX - spin.current.x, event.clientY - spin.current.y)
      if (shift > 4) spin.current.moved = true
      const [lambda, phi] = spin.current.rotation
      setRotation([
        lambda + (event.clientX - spin.current.x) * perPixel,
        Math.max(-82, Math.min(82, phi - (event.clientY - spin.current.y) * perPixel)),
      ])
    }

    const stopSpin = () => {
      // Клик приходит уже после pointerup, поэтому отметку о перетаскивании держим
      // до следующего нажатия — иначе поворот планеты считался бы выбором страны.
      if (spin.current?.moved) justDragged.current = true
      spin.current = null
      setDragging(false)
    }

    return <div className="globe-stage" onMouseLeave={() => {
      setHovered(null)
      // Возобновляем самовращение только если страна не выбрана.
      if (!spin.current && !selected) setSpinning(true)
    }}>
      <svg
        viewBox={`0 0 ${SIZE * 1.6} ${SIZE}`}
        className={`globe-svg${dragging ? ' dragging' : ''}`}
        role="img"
        aria-label="Планета: нажмите на страну, чтобы выбрать её; правая кнопка вращает"
        ref={mapRef}
        onPointerDown={startSpin}
        onPointerMove={moveSpin}
        onPointerUp={stopSpin}
        onPointerCancel={stopSpin}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <defs>
          <radialGradient id="globe-shade" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#2c6357" />
            <stop offset="100%" stopColor="#16352e" />
          </radialGradient>
        </defs>
        {/* Шар-основа растёт вместе с континентами, иначе при приближении они
            выползали бы за океан. */}
        <rect width={EARTH_W} height={SIZE} className="earth-bg" />
        <circle cx={EARTH_W / 2} cy={SIZE / 2} r={(SIZE / 2 - 8) * zoom} fill="url(#globe-shade)" />
        <path d={draw({ type: 'Graticule', coordinates: [] } as never) ?? ''} />
        {countries.map((country, index) => {
          const place = BY_WORLD_ID.get(String(country.id))
          const d = draw(country as never)
          if (!d) return null
          return <path
            key={country.id != null ? String(country.id) : `country-${index}`}
            d={d}
            className={`globe-country${place ? ' has-materials' : ''}${place && place.id === selected ? ' selected' : ''}`}
            onMouseEnter={() => {
              setSpinning(false)
              setHovered({ name: place?.name ?? country.properties.name ?? '', count: place ? countAtPlace(place) : null })
            }}
            onClick={() => {
              if (!place || justDragged.current) return
              // Выбор показывается в панели рядом; на карту уводит кнопка оттуда.
              if (onSelect) onSelect(place)
              else onGo([place.id])
            }}
          />
        })}
      </svg>

      <div className="map-zoom globe-zoom">
        <button onClick={() => setZoom((value) => Math.min(4, value * 1.3))} aria-label="Приблизить">+</button>
        <button onClick={() => setZoom((value) => Math.max(1, value / 1.3))} aria-label="Отдалить">−</button>
        {zoom > 1 && <button className="zoom-reset" onClick={() => setZoom(1)} aria-label="Сбросить масштаб">↺</button>}
      </div>

      <div className="globe-caption">
        {hovered
          ? <><strong>{hovered.name}</strong>{hovered.count !== null
              ? <span>{hovered.count} материалов · нажмите, чтобы открыть</span>
              : <span>материалов пока нет</span>}</>
          : selected
            ? <><strong>{COUNTRIES.find((country) => country.id === selected)?.name ?? 'Выбрано'}</strong><span>Планета остановлена. Крутить — правой кнопкой мыши</span></>
            : <><strong>Земля</strong><span>Нажмите на страну, чтобы выбрать. Крутить планету — правой кнопкой мыши</span></>}
      </div>
    </div>
  }

  // Ниже уровня планеты показываем плоскую карту: страну с её настоящим контуром,
  // а регион и район — сеткой с метками, потому что готовых границ такого уровня нет.
  // У населённого пункта детей нет — показываем его самого одной меткой,
  // иначе карта оказалась бы пустой.
  const children = current.children ?? []
  const pins = children.length > 0 ? children : [current]
  const isCountry = current.kind === 'country'
  const countryPlace = path[0]
  const countryFeature = countries.find((item) => String(item.id) === countryPlace.worldId)

  const W = SIZE * 1.6
  // Россия пересекает 180-й меридиан, и Меркатор растягивает её так, что карта уезжает вбок.
  // Коническая проекция с поворотом на 100° в.д. держит страну по центру без разрыва.
  // Коническая проекция с поворотом подобрана под Россию; для остальных стран берём Меркатор.
  const projection = isCountry && countryPlace.id === 'ru'
    ? geoConicEqualArea().rotate([-52, 0]).parallels([52, 62])
    : geoMercator()
  if (isCountry && countryPlace.id !== 'ru' && countryFeature) {
    // У стран СНГ меток одна-две, поэтому кадр задаёт контур страны, а не метки.
    projection.fitExtent([[26, 32], [W - 26, SIZE - 32]], countryFeature as never)
  } else if (isCountry) {
    // Все четыре республики — в Поволжье. Если вписать в кадр всю страну до Чукотки,
    // метки сливаются в одну точку. Поэтому открываем на той части, где есть материалы,
    // а контур страны уходит за края — отдалить можно колесом.
    const points = pins.map((pin) => pin.coords)
    const lons = points.map((point) => point[0])
    const lats = points.map((point) => point[1])
    const padLon = Math.max(6, (Math.max(...lons) - Math.min(...lons)) * 1.1)
    const padLat = Math.max(3, (Math.max(...lats) - Math.min(...lats)) * 1.1)
    projection.fitExtent([[40, 48], [W - 40, SIZE - 48]], {
      type: 'MultiPoint',
      coordinates: [
        ...points,
        [Math.min(...lons) - padLon, Math.min(...lats) - padLat],
        [Math.max(...lons) + padLon, Math.max(...lats) + padLat],
      ],
    } as never)
  } else {
    const points = pins.map((pin) => pin.coords)
    const lons = points.map((point) => point[0])
    const lats = points.map((point) => point[1])
    const pad = Math.max(0.3, (Math.max(...lons) - Math.min(...lons)) * 0.18)
    // Набор точек, а не многоугольник: у многоугольника важен порядок обхода,
    // и при обратномd3 считает его покрывающим всю планету — карта схлопывалась в точку.
    projection.fitExtent([[48, 54], [W - 48, SIZE - 54]], {
      type: 'MultiPoint',
      coordinates: [
        ...points,
        [Math.min(...lons) - pad, Math.min(...lats) - pad * 0.6],
        [Math.max(...lons) + pad, Math.max(...lats) + pad * 0.6],
      ],
    } as never)
  }
  const centre: [number, number] = [W / 2, SIZE / 2]
  const fitted = projection.translate()
  projection
    .scale(projection.scale() * zoom)
    .translate([
      centre[0] + (fitted[0] - centre[0]) * zoom + pan[0],
      centre[1] + (fitted[1] - centre[1]) * zoom + pan[1],
    ])
  const draw = geoPath(projection)

  // Соседние пункты (Йошкар-Ола и Медведево — восемь километров) дают подписи внахлёст.
  // Тем, у кого сосед ближе сорока точек, опускаем подпись под метку.
  const placed: { x: number; y: number }[] = []
  const labelBelow = pins.map((pin) => {
    const point = projection(pin.coords)
    if (!point) return false
    const clash = placed.some((other) => Math.hypot(other.x - point[0], other.y - point[1]) < 40)
    placed.push({ x: point[0], y: point[1] })
    return clash
  })

  // Колесо слушаем на самом элементе: React вешает onWheel пассивно, и preventDefault
  // в нём не срабатывает — страница уезжала вместе с приближением карты.
  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    const next = Math.min(8, Math.max(1, zoom * (event.deltaY < 0 ? 1.18 : 1 / 1.18)))
    if (next === zoom) return
    if (next === 1) {
      setZoom(1)
      setPan([0, 0])
      return
    }
    const target = event.currentTarget as SVGSVGElement
    const rect = target.getBoundingClientRect()
    // viewBox вписывается с сохранением пропорций, поэтому учитываем поля по краям.
    const unit = Math.min(rect.width / W, rect.height / SIZE)
    const cursorX = (event.clientX - rect.left - (rect.width - W * unit) / 2) / unit
    const cursorY = (event.clientY - rect.top - (rect.height - SIZE * unit) / 2) / unit
    const ratio = next / zoom
    const offsetX = cursorX - centre[0]
    const offsetY = cursorY - centre[1]
    setPan([
      offsetX - (offsetX - pan[0]) * ratio,
      offsetY - (offsetY - pan[1]) * ratio,
    ])
    setZoom(next)
  }

  // Актуальный обработчик держим в ссылке: сам слушатель подписывается выше,
  // до ветвления, иначе число хуков у планеты и у карты расходится.
  wheelRef.current = onWheel

  return <div className="globe-stage flat">
    <svg
      viewBox={`0 0 ${W} ${SIZE}`}
      className={`globe-svg map-svg${zoom > 1 ? ' zoomed' : ''}`}
      role="img"
      aria-label={`Карта: ${current.name}`}
      ref={mapRef}
      onMouseDown={(event) => { drag.current = { x: event.clientX, y: event.clientY, pan } }}
      onMouseMove={(event) => {
        if (!drag.current) return
        const scale = W / (event.currentTarget.getBoundingClientRect().width || W)
        setPan([
          drag.current.pan[0] + (event.clientX - drag.current.x) * scale,
          drag.current.pan[1] + (event.clientY - drag.current.y) * scale,
        ])
      }}
      onMouseUp={() => { drag.current = null }}
      onMouseLeave={() => { drag.current = null; setHovered(null) }}
    >
      <defs>
        {/* Сетка и виньетка — те же приёмы, что были на прежней схематичной карте,
            чтобы карта не выбивалась из оформления сайта. */}
        <pattern id="map-grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0V26" fill="none" stroke="#d9ded4" strokeWidth="1" />
        </pattern>
        <linearGradient id="map-land" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#e6ede2" />
          <stop offset="55%" stopColor="#dae4d5" />
          <stop offset="100%" stopColor="#cbdac6" />
        </linearGradient>
        <filter id="map-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#5f7a5c" floodOpacity="0.18" />
        </filter>
      </defs>

      <rect width={W} height={SIZE} className="map-bg" />
      <rect width={W} height={SIZE} fill="url(#map-grid)" opacity="0.5" />


      {isCountry && countryFeature && <>
        <path d={draw(countryFeature as never) ?? ''} className="map-country-shadow" filter="url(#map-shadow)" />
        <path d={draw(countryFeature as never) ?? ''} className="map-country" />
      </>}

      {/* Возвышенности и леса — под реками, как на обычной карте. */}
      <g className="map-relief">
        {RELIEF.map((area) => {
          const d = draw({ type: 'Polygon', coordinates: [[...area.points, area.points[0]]] } as never)
          return d ? <path key={area.name} d={d} className={`relief-${area.kind}`} /> : null
        })}
      </g>

      <g className="map-rivers">
        {RIVERS.map((river) => {
          const d = draw({ type: 'LineString', coordinates: river.points } as never)
          return d ? <path key={river.name} d={d} strokeWidth={river.width} /> : null
        })}
      </g>
      <rect width={W} height={SIZE} className="map-frame" pointerEvents="none" />

      {pins.map((child, index) => {
        const point = projection(child.coords)
        if (!point) return null
        const count = countAtPlace(child)
        return <g
          key={child.id}
          className={`map-pin${count > 0 ? '' : ' empty'}${child === current ? ' current' : ''}`}
          transform={`translate(${point[0]}, ${point[1]})`}
          onMouseEnter={() => setHovered({ name: child.name, count })}
          onMouseLeave={() => setHovered(null)}
          onClick={() => { if (child !== current) onGo([...ids, child.id]) }}
          role="button"
          aria-label={`${child.name}, ${count} материалов`}
        >
          <circle r={9} className="pin-halo" />
          <circle r={5} />
          <text y={labelBelow[index] ? 30 : -16}>{child.name.replace('Республика ', '')}</text>
          {count > 0 && <text y={labelBelow[index] ? 44 : 22} className="pin-count">{count}</text>}
        </g>
      })}
    </svg>

    <div className="map-zoom">
      <button onClick={() => setZoom((value) => Math.min(8, value * 1.4))} aria-label="Приблизить">+</button>
      <button onClick={() => setZoom((value) => {
        const next = Math.max(1, value / 1.4)
        if (next === 1) setPan([0, 0])
        return next
      })} aria-label="Отдалить">−</button>
      {(zoom > 1 || pan[0] !== 0 || pan[1] !== 0) && (
        <button className="zoom-reset" onClick={() => { setZoom(1); setPan([0, 0]) }} aria-label="Сбросить масштаб">↺</button>
      )}
    </div>

    {/* Название и описание места есть в панели справа, поэтому под картой
        показываем только то, чего там нет, — что сейчас под курсором. */}
    {hovered && <div className="globe-caption floating">
      <strong>{hovered.name}</strong>
      <span>{hovered.count ? `${hovered.count} материалов · нажмите, чтобы открыть` : 'материалов пока нет'}</span>
    </div>}
  </div>
}
