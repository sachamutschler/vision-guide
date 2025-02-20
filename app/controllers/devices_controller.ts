import type { HttpContext } from '@adonisjs/core/http'
import Device from '../models/device.js';

export default class DevicesController {
  /**
   * Get all devices
   */
  public async index({ response }: HttpContext) {
    const devices = await Device.all()
    return response.json(devices)
  }

  /**
   * Get a single device
   */
  public async show({ params, response }: HttpContext) {
    try {
      const device = await Device.findOrFail(params.id)
      return response.json(device)
    } catch (error) {
      return response.status(404).json({ message: 'Device not found' })
    }
  }

  /**
   * Create a new device
   */
  public async store({ request, response }: HttpContext) {
    const { name, type, serial_number } = request.only(['name', 'type', 'serial_number'])

    try {
      const device = await Device.create({ name, type, serial_number })
      return response.status(201).json(device)
    } catch (error) {
      return response.status(400).json({ message: 'Error creating device', error })
    }
  }

  /**
   * Update a device
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const device = await Device.findOrFail(params.id)
      const { name, type, serial_number } = request.only(['name', 'type', 'serial_number'])

      device.merge({ name, type, serial_number })
      await device.save()

      return response.json(device)
    } catch (error) {
      return response.status(404).json({ message: 'Device not found' })
    }
  }

  /**
   * Delete a device
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const device = await Device.findOrFail(params.id)
      await device.delete()
      return response.status(204)
    } catch (error) {
      return response.status(404).json({ message: 'Device not found' })
    }
  }
}
