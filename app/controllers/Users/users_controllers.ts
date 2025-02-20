import User from '../../models/user.js';
import type { HttpContext } from '@adonisjs/core/http'
export default class UsersController {
  /**
   * Get all users
   */
  public async index({ response }: HttpContext) {
    const users = await User.all()
    return response.json(users)
  }

  /**
   * Get a single user
   */
  public async show({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      return response.json(user)
    } catch (error) {
      return response.status(404).json({ message: 'User not found' })
    }
  }

  /**
   * Create a new user
   */
  public async store({ request, response }: HttpContext) {
    const { fullName, email, password, parameters } = request.only(['fullName', 'email', 'password', 'parameters'])

    try {
      const user = await User.create({ fullName, email, password, parameters })
      return response.status(201).json(user)
    } catch (error) {
      return response.status(400).json({ message: 'Error creating user', error })
    }
  }

  /**
   * Update a user
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      const { fullName, email, password, parameters } = request.only(['fullName', 'email', 'password', 'parameters'])

      user.merge({ fullName, email, password, parameters })
      await user.save()

      return response.json(user)
    } catch (error) {
      return response.status(404).json({ message: 'User not found' })
    }
  }

  /**
   * Delete a user
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      await user.delete()
      return response.status(204)
    } catch (error) {
      return response.status(404).json({ message: 'User not found' })
    }
  }
}
