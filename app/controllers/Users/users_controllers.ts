import User from '../../models/user.js';
import type { HttpContext } from '@adonisjs/core/http'
import { logger } from '#utils/logger'
import {deviceSchema} from '#validators/device'
import Device from "#models/device";
import vine from '@vinejs/vine'

const LOG_ID = 'USERS_CONTROLLER'

export default class UsersController {
  /**
   * Get all users.
   * @returns {JSON} List of all users.
   */
  public async index({ response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Fetching all users`)
      const users = await User.all()
      return response.json(users)
    } catch (error) {
      logger.error(`${LOG_ID} - Failed to fetch users: ${error.message}`)
      return response.status(500).json({ message: 'Failed to fetch users' })
    }
  }

  /**
   * Get a single user by ID.
   * @param {number} params.id - User ID.
   * @returns {JSON} User data or 404 error.
   */
  public async show({ params, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Fetching user with ID: ${params.id}`)
      const user = await User.findOrFail(params.id)
      return response.json(user)
    } catch (error) {
      logger.warn(`${LOG_ID} - User not found with ID: ${params.id}`)
      return response.status(404).json({ message: 'User not found' })
    }
  }

  /**
   * Create a new user.
   * @param {Object} request.body - User data.
   * @returns {JSON} Created user or error message.
   */
  public async store({ request, response }: HttpContext) {
    const { fullName, email, password, parameters } = request.only(['fullName', 'email', 'password', 'parameters'])

    try {
      logger.info(`${LOG_ID} - Creating a new user with email: ${email}`)
      const user = await User.create({ fullName, email, password, parameters })
      return response.status(201).json(user)
    } catch (error) {
      logger.error(`${LOG_ID} - Error creating user: ${error.message}`)
      return response.status(400).json({ message: 'Error creating user', error: error.message })
    }
  }

  /**
   * Update an existing user.
   * @param {number} params.id - User ID.
   * @param {Object} request.body - Updated user data.
   * @returns {JSON} Updated user or error message.
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Updating user with ID: ${params.id}`)
      const user = await User.findOrFail(params.id)
      const { fullName, email, password, parameters } = request.only(['fullName', 'email', 'password', 'parameters'])

      user.merge({ fullName, email, password, parameters })
      await user.save()

      return response.json(user)
    } catch (error) {
      logger.warn(`${LOG_ID} - Failed to update user. User not found with ID: ${params.id}`)
      return response.status(404).json({ message: 'User not found' })
    }
  }

  /**
   * Delete a user.
   * @param {number} params.id - User ID.
   * @returns {204} No Content or 404 error.
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Deleting user with ID: ${params.id}`)
      const user = await User.findOrFail(params.id)
      await user.delete()
      return response.status(204).send({})
    } catch (error) {
      logger.warn(`${LOG_ID} - Failed to delete user. User not found with ID: ${params.id}`)
      return response.status(404).json({ message: 'User not found' })
    }
  }

  /**
   *  Associates a device with the authenticated user
   */
  async associateDevice({ auth, request, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Associating device with user`)

      if (!auth.user) {
        throw new Error('User not authenticated')
      }

      const validator = vine.compile(deviceSchema)
      const payload = await validator.validate(request.body())

      const device = await Device.create({
        name: payload.name,
        type: payload.type,
        serial_number: payload.serial_number,
        userId: auth.user.id
      })

      return response.created(device)
    } catch (error) {
      logger.error(`${LOG_ID} - Device association failed: ${error.message}`)
      return response.status(400).json({ message: 'Error associating device', error: error.message })
    }
  }

  /**
   * Gets all devices for the authenticated user
   */
  async getUserDevices({ auth, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Fetching user devices`)

      if (!auth.user) {
        throw new Error('User not authenticated')
      }

      const user = await User.query()
        .where('id', auth.user.id)
        .preload('devices')
        .firstOrFail()

      return response.ok(user.devices)
    } catch (error) {
      logger.error(`${LOG_ID} - Fetching user devices failed: ${error.message}`)
      return response.status(500).json({ message: 'Error retrieving user devices', error: error.message })
    }
  }
}
