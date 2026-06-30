import { LUNAR_DATA, LUNAR_DATA_RANGE, getLeapMonth, getLunarMonthDays, getLunarYearDays } from '../lunar-data/lunar-data.js'
import type { DateInput } from '../date/date.js'
import { toDate, toDateStrict } from '../date/date.js'

export interface LunarDate {
  /** 年（农历） */
  year: number
  /** 月（农历，1-12） */
  month: number
  /** 是否闰月 */
  isLeapMonth: boolean
  /** 日（农历，1-30） */
  day: number
  /** 干支年（甲子年 / 乙丑年...） */
  ganzhiYear: string
  /** 生肖 */
  zodiac: string
  /** 中文日期（例：二零二四年正月初一） */
  chinese: string
  /** 简化日期（例：2024-正月初一） */
  shortChinese: string
}

const HEAVENLY = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const EARTHLY = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const LUNAR_MONTH = [
  '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'
]
const LUNAR_DAY = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
]

const BASE_DATE = new Date(1900, 0, 31)

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((a.getTime() - b.getTime()) / msPerDay)
}

function ganzhiYear(year: number): string {
  return HEAVENLY[(year - 4) % 10] + EARTHLY[(year - 4) % 12]
}

function zodiac(year: number): string {
  return ZODIAC[(year - 4) % 12]
}

function toChinese(lunar: Omit<LunarDate, 'ganzhiYear' | 'zodiac' | 'chinese' | 'shortChinese'>): string {
  const monthText = (lunar.isLeapMonth ? '闰' : '') + LUNAR_MONTH[lunar.month - 1] + '月'
  const dayText = LUNAR_DAY[lunar.day - 1]
  return `${monthText}${dayText}`
}

/** 公历 → 农历 */
export function solarToLunar(input: DateInput): LunarDate {
  const date = toDateStrict(input)
  if (
    date.getFullYear() < LUNAR_DATA_RANGE.start ||
    date.getFullYear() > LUNAR_DATA_RANGE.end + 1
  ) {
    throw new Error(`Date out of lunar range (${LUNAR_DATA_RANGE.start}-${LUNAR_DATA_RANGE.end})`)
  }

  let offset = daysBetween(date, BASE_DATE)
  let year = LUNAR_DATA_RANGE.start
  let yearDays = 0

  while (offset > 0) {
    yearDays = getLunarYearDays(year)
    if (offset < yearDays) break
    offset -= yearDays
    year++
  }

  const leapMonth = getLeapMonth(year)
  let month = 1
  let isLeap = false

  while (offset > 0) {
    const monthDays = month === leapMonth && !isLeap
      ? getLunarMonthDays(year, month, true)
      : getLunarMonthDays(year, month, false)

    if (offset < monthDays) break
    offset -= monthDays

    if (month === leapMonth && !isLeap) {
      isLeap = true
    } else {
      month++
      isLeap = false
    }
  }

  const day = offset + 1

  const lunar: LunarDate = {
    year,
    month,
    isLeapMonth: isLeap,
    day,
    ganzhiYear: ganzhiYear(year),
    zodiac: zodiac(year),
    chinese: '',
    shortChinese: '',
  }

  lunar.chinese = toChinese({
    year: lunar.year,
    month: lunar.month,
    isLeapMonth: lunar.isLeapMonth,
    day: lunar.day,
  })
  lunar.shortChinese = `${lunar.year}-${lunar.chinese}`

  return lunar
}

/** 农历 → 公历 */
export function lunarToSolar(lunar: LunarDate): Date {
  if (lunar.year < LUNAR_DATA_RANGE.start || lunar.year > LUNAR_DATA_RANGE.end) {
    throw new Error(`Lunar year out of range (${LUNAR_DATA_RANGE.start}-${LUNAR_DATA_RANGE.end})`)
  }

  let offset = 0
  for (let y = LUNAR_DATA_RANGE.start; y < lunar.year; y++) {
    offset += getLunarYearDays(y)
  }

  const leapMonth = getLeapMonth(lunar.year)
  for (let m = 1; m < lunar.month; m++) {
    if (m === leapMonth) {
      offset += getLunarMonthDays(lunar.year, m, true)
    }
    offset += getLunarMonthDays(lunar.year, m, false)
  }

  if (lunar.isLeapMonth) {
    if (lunar.month !== leapMonth) {
      throw new Error('Invalid leap month')
    }
    offset += getLunarMonthDays(lunar.year, lunar.month, false)
  }

  offset += lunar.day - 1

  const result = new Date(BASE_DATE)
  result.setDate(BASE_DATE.getDate() + offset)
  return result
}

/** 当前日期的农历 */
export function todayLunar(): LunarDate {
  return solarToLunar(new Date())
}

/** 格式化农历日期 */
export function formatLunar(date: LunarDate, pattern = 'YYYY年 MM DD'): string {
  return pattern
    .replace(/YYYY/g, date.year.toString())
    .replace(/MM/g, (date.isLeapMonth ? '闰' : '') + LUNAR_MONTH[date.month - 1] + '月')
    .replace(/DD/g, LUNAR_DAY[date.day - 1])
}

const FESTIVALS: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵节',
  '5-5': '端午节',
  '7-7': '七夕',
  '7-15': '中元节',
  '8-15': '中秋节',
  '9-9': '重阳节',
  '12-8': '腊八节',
  '12-23': '小年',
  '12-30': '除夕',
}

/** 节日判断（春节 / 元宵 / 端午 / 中秋等） */
export function getLunarFestival(date: LunarDate): string | undefined {
  const key = `${date.month}-${date.day}`
  return FESTIVALS[key]
}
