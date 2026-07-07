import {
  toDateInput,
  formatDate,
  formatDateShort,
  isToday,
  isPast,
  cn,
  statusColors,
  priorityColors,
} from '@/lib/utils'

describe('Utils', () => {
  describe('toDateInput', () => {
    it('returns undefined for null', () => {
      expect(toDateInput(null)).toBeUndefined()
    })

    it('returns undefined for undefined', () => {
      expect(toDateInput(undefined)).toBeUndefined()
    })

    it('formats Date object to input string', () => {
      const date = new Date('2024-03-15T12:00:00Z')
      expect(toDateInput(date)).toBe('2024-03-15')
    })

    it('formats date string to input string', () => {
      expect(toDateInput('2024-03-15')).toBe('2024-03-15')
    })
  })

  describe('formatDate', () => {
    it('formats date to readable string', () => {
      const date = new Date('2024-03-15')
      expect(formatDate(date)).toBe('Mar 15, 2024')
    })

    it('formats date string to readable string', () => {
      expect(formatDate('2024-01-01')).toBe('Jan 1, 2024')
    })
  })

  describe('formatDateShort', () => {
    it('formats date to short string', () => {
      const date = new Date('2024-03-15')
      expect(formatDateShort(date)).toBe('Mar 15')
    })
  })

  describe('isToday', () => {
    it('returns true for today', () => {
      expect(isToday(new Date())).toBe(true)
    })

    it('returns false for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isToday(yesterday)).toBe(false)
    })
  })

  describe('isPast', () => {
    it('returns true for past dates', () => {
      expect(isPast(new Date('2020-01-01'))).toBe(true)
    })

    it('returns false for future dates', () => {
      expect(isPast(new Date('2030-01-01'))).toBe(false)
    })
  })

  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })

    it('filters out falsy values', () => {
      expect(cn('a', null, undefined, false, 'b')).toBe('a b')
    })
  })

  describe('statusColors', () => {
    it('has colors for all statuses', () => {
      expect(statusColors).toHaveProperty('Applied')
      expect(statusColors).toHaveProperty('Interview')
      expect(statusColors).toHaveProperty('Offer')
      expect(statusColors).toHaveProperty('Rejected')
    })
  })

  describe('priorityColors', () => {
    it('has colors for all priorities', () => {
      expect(priorityColors).toHaveProperty('low')
      expect(priorityColors).toHaveProperty('medium')
      expect(priorityColors).toHaveProperty('high')
    })
  })
})
