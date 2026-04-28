// lib/auth.js
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'

export function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}

export function authMiddleware(req) {
  const token = getTokenFromHeader(req)
  if (!token) {
    return { user: null, error: 'No token provided' }
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return { user: null, error: 'Invalid token' }
  }

  return { user: decoded, error: null }
}