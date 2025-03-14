import type { HttpContext } from '@adonisjs/core/http'
import Device from '../models/device.js'
import { logger } from '#utils/logger'

const LOG_ID = 'DEVICE_CONTROLLER'

export default class DevicesController {
  /**
   * GET all devices
   * Calls `Device.all()`
   */
  public async index({ response }: HttpContext) {
    logger.info(`${LOG_ID} - Received GET request for all devices`)

    try {
      const devices = await Device.all()
      response.json(devices)
    } catch (error) {
      logger.error(`${LOG_ID} - Error fetching devices: ${error.message}`)
      response.status(500).json({ message: 'Failed to retrieve devices' })
    }
  }

  /**
   * GET a single device by ID
   * Calls `Device.findOrFail(id)`
   */
  public async show({ params, response }: HttpContext) {
    logger.info(`${LOG_ID} - Received GET request for device ID: ${params.id}`)

    try {
      const device = await Device.findOrFail(params.id)
      response.json(device)
    } catch (error) {
      logger.warn(`${LOG_ID} - Device not found with ID: ${params.id}`)
      response.status(404).json({ message: 'Device not found' })
    }
  }

  /**
   * POST create a new device
   * Calls `Device.create()`
   */
  public async store({ request, response }: HttpContext) {
    logger.info(`${LOG_ID} - Received POST request to create a new device`)

    try {
      const { name, type, serial_number } = request.only(['name', 'type', 'serial_number'])
      const device = await Device.create({ name, type, serial_number })

      logger.info(`${LOG_ID} - Device created successfully with ID: ${device.id}`)
      response.status(201).json(device)
    } catch (error) {
      logger.error(`${LOG_ID} - Error creating device: ${error.message}`)
      response.status(400).json({ message: 'Error creating device', error: error.message })
    }
  }

  /**
   * PUT update an existing device by ID
   * Calls `Device.findOrFail(id)` and updates its properties
   */
  public async update({ params, request, response }: HttpContext) {
    logger.info(`${LOG_ID} - Received PUT request to update device ID: ${params.id}`)

    try {
      const device = await Device.findOrFail(params.id)
      const { name, type, serial_number } = request.only(['name', 'type', 'serial_number'])

      device.merge({ name, type, serial_number })
      await device.save()

      logger.info(`${LOG_ID} - Device updated successfully with ID: ${params.id}`)
      response.json(device)
    } catch (error) {
      logger.warn(`${LOG_ID} - Failed to update device. Device not found with ID: ${params.id}`)
      response.status(404).json({ message: 'Device not found' })
    }
  }

  /**
   * DELETE a device by ID
   * Calls `Device.findOrFail(id)` and deletes it
   */
  /**
   * DELETE a device by ID
   * Calls `Device.findOrFail(id)`, returns it, and then deletes it
   */
  public async destroy({ params, response }: HttpContext) {
    logger.info(`${LOG_ID} - Received DELETE request for device ID: ${params.id}`)

    try {
      const device = await Device.findOrFail(params.id)

      // Store the device data to return it
      const deviceData = device.toJSON()

      // Delete the device
      await device.delete()

      logger.info(`${LOG_ID} - Device deleted successfully with ID: ${params.id}`)

      // Return the deleted device data
      return response.status(200).json(deviceData)
    } catch (error) {
      logger.warn(`${LOG_ID} - Device not found for deletion with ID: ${params.id}`)
      return response.status(404).json({ message: 'Device not found' })
    }
  }
}
