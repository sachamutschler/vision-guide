import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registrationValidator } from '#validators/auth'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registrationValidator)

    const user = await User.create(data)
    const token = await User.accessTokens.create(user)

    return response.created({
      message: 'User registered successfully',
      user,
      token,
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

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

  async logout({ auth }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return { message: 'User logged out successfully' }
  }

  async me({ auth }: HttpContext) {
    return auth.user
  }
}
