import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registrationValidator } from '#validators/auth'
import { logger } from '#utils/logger' // ✅ Logging added

const LOG_ID = 'AUTH_CONTROLLER'

export default class AuthController {
  /**
   * 🔹 Registers a new user and returns an access token
   */
  async register({ request, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Registering new user`)
      const data = await request.validateUsing(registrationValidator)

      const user = await User.create(data)
      const token = await User.accessTokens.create(user)

      logger.info(`${LOG_ID} - User registered successfully: ${user.email}`)
      return response.created({
        message: 'User registered successfully',
        user,
        token,
      })
    } catch (error) {
      logger.error(`${LOG_ID} - Registration failed: ${error.message}`)
      return response.status(400).json({ message: 'Registration failed', error: error.message })
    }
  }

  /**
   * 🔹 Logs in an existing user and returns an access token
   */
  async login({ request, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - User login attempt`)
      const { email, password } = await request.validateUsing(loginValidator)

      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      logger.info(`${LOG_ID} - User logged in: ${email}`)
      return response.ok({
        message: 'User logged in successfully',
        user,
        token,
      })
    } catch {
      logger.warn(`${LOG_ID} - Invalid login attempt`)
      return response.unauthorized({
        message: 'Invalid credentials',
      })
    }
  }

  /**
   * 🔹 Logs out the authenticated user
   */
  async logout({ auth, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Logging out user`)
      const user = auth.user!
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)

      logger.info(`${LOG_ID} - User logged out: ${user.email}`)
      return response.ok({ message: 'User logged out successfully' })
    } catch (error) {
      logger.error(`${LOG_ID} - Logout failed: ${error.message}`)
      return response.status(500).json({ message: 'Logout failed', error: error.message })
    }
  }


  /**
   * 🔹 Returns the authenticated user
   */
  async me({ auth, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Fetching user profile`)

      if (!auth.user) {
        throw new Error('User not authenticated')
      }

      return response.ok(auth.user)
    } catch (error) {
      logger.error(`${LOG_ID} - Fetching user profile failed: ${error.message}`)
      return response.status(500).json({ message: 'Error retrieving user profile', error: error.message })
    }
  }
}
