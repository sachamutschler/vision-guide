import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.create({ email, password })
    const token = await User.accessTokens.create(user)

    return response.created({
      message: 'User registered successfully',
      user,
      token,
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      return response.ok({
        message: 'User logged in successfully',
        user,
        token,
      })
    } catch {
      return response.unauthorized({
        message: 'Invalid credentials',
      })
    }
  }
}
