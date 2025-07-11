import bcrypt from 'bcryptjs'

// Password utility functions
export const passwordService = {
  // Hash a password
  async hash(password: string, saltRounds: number = 10): Promise<string> {
    try {
      return await bcrypt.hash(password, saltRounds)
    } catch (error) {
      console.error('Password hashing error:', error)
      throw new Error('Failed to hash password')
    }
  },

  // Verify password against hash
  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  },

  // Generate a random password
  generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    
    return password
  },

  // Validate password strength
  validateStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('Password should be at least 8 characters long')
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include at least one uppercase letter')
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include at least one lowercase letter')
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('Include at least one number')
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include at least one special character')
    }

    return {
      isValid: score >= 3, // Require at least 3 out of 5 criteria
      score,
      feedback
    }
  }
} 