import {
  signUpSchema,
  signInSchema,
  applicationSchema,
  reminderSchema,
  noteSchema,
  tagSchema,
} from '@/lib/validations'

describe('Validations', () => {
  describe('signUpSchema', () => {
    it('validates valid sign up data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }
      expect(signUpSchema.safeParse(data).success).toBe(true)
    })

    it('rejects short name', () => {
      const data = { name: 'J', email: 'john@example.com', password: 'password123' }
      expect(signUpSchema.safeParse(data).success).toBe(false)
    })

    it('rejects invalid email', () => {
      const data = { name: 'John', email: 'not-an-email', password: 'password123' }
      expect(signUpSchema.safeParse(data).success).toBe(false)
    })

    it('rejects short password', () => {
      const data = { name: 'John', email: 'john@example.com', password: '12345' }
      expect(signUpSchema.safeParse(data).success).toBe(false)
    })
  })

  describe('signInSchema', () => {
    it('validates valid sign in data', () => {
      const data = { email: 'john@example.com', password: 'password' }
      expect(signInSchema.safeParse(data).success).toBe(true)
    })

    it('rejects empty password', () => {
      const data = { email: 'john@example.com', password: '' }
      expect(signInSchema.safeParse(data).success).toBe(false)
    })
  })

  describe('applicationSchema', () => {
    it('validates valid application data', () => {
      const data = {
        companyName: 'Acme Corp',
        role: 'Software Engineer',
        location: 'Remote',
        status: 'Applied',
        priority: 'medium',
        source: 'LinkedIn',
      }
      expect(applicationSchema.safeParse(data).success).toBe(true)
    })

    it('validates with optional fields', () => {
      const data = {
        companyName: 'Acme Corp',
        role: 'Software Engineer',
        location: 'Remote',
        status: 'Interview',
        priority: 'high',
        source: 'Referral',
        jobUrl: 'https://example.com/job',
        salaryRange: '$100k-$150k',
        notes: 'Great opportunity',
      }
      expect(applicationSchema.safeParse(data).success).toBe(true)
    })

    it('rejects missing required fields', () => {
      const data = { status: 'Applied', priority: 'medium', source: 'LinkedIn' }
      expect(applicationSchema.safeParse(data).success).toBe(false)
    })

    it('rejects invalid status', () => {
      const data = {
        companyName: 'Acme Corp',
        role: 'Engineer',
        location: 'Remote',
        status: 'Invalid',
        priority: 'medium',
        source: 'LinkedIn',
      }
      expect(applicationSchema.safeParse(data).success).toBe(false)
    })

    it('rejects invalid priority', () => {
      const data = {
        companyName: 'Acme Corp',
        role: 'Engineer',
        location: 'Remote',
        status: 'Applied',
        priority: 'urgent',
        source: 'LinkedIn',
      }
      expect(applicationSchema.safeParse(data).success).toBe(false)
    })
  })

  describe('reminderSchema', () => {
    it('validates valid reminder data', () => {
      const data = { followUpDate: '2024-03-20', applicationId: '123' }
      expect(reminderSchema.safeParse(data).success).toBe(true)
    })

    it('rejects missing date', () => {
      const data = { followUpDate: '', applicationId: '123' }
      expect(reminderSchema.safeParse(data).success).toBe(false)
    })
  })

  describe('noteSchema', () => {
    it('validates valid note data', () => {
      const data = { content: 'Follow up next week', applicationId: '123' }
      expect(noteSchema.safeParse(data).success).toBe(true)
    })

    it('rejects empty content', () => {
      const data = { content: '', applicationId: '123' }
      expect(noteSchema.safeParse(data).success).toBe(false)
    })
  })

  describe('tagSchema', () => {
    it('validates valid tag data', () => {
      const data = { name: 'Remote' }
      expect(tagSchema.safeParse(data).success).toBe(true)
    })

    it('validates with optional color', () => {
      const data = { name: 'Remote', color: '#ff0000' }
      expect(tagSchema.safeParse(data).success).toBe(true)
    })

    it('rejects empty name', () => {
      const data = { name: '' }
      expect(tagSchema.safeParse(data).success).toBe(false)
    })
  })
})
