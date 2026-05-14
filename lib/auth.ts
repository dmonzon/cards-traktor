import { hash, compare } from 'bcryptjs'
import { prisma } from './db'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  })
}
