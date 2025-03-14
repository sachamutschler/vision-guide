import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { logger } from '#utils/logger'

const LOG_ID = 'PARAMETERS_CONTROLLER' 

/**
 * Controller for managing user parameters.
 */
export default class ParametersController {
  /**
   * Retrieve the parameters of a user given in the params.
   * @param params - ID of the user
   * @param response - HTTP response object
   */
  public async getParameters({ params, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Fetching parameters for user ID: ${params.id}`)
      const user = await User.findOrFail(params.id)
      return response.ok(user.parameters)
    } catch (error) {
      logger.error(`${LOG_ID} - User not found: ${params.id}`)
      return response.status(404).json({ message: 'User not found' })
    }
  }

  /**
   * Update the user parameters.
   * @param params - ID of the user
   * @param request - HTTP request object
   * @param response - HTTP response object
   */
  public async updateParameters({ params, request, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Updating parameters for user ID: ${params.id}`)
      const user = await User.findOrFail(params.id)
      const newParameters = request.input('parameters', {})

      if (typeof newParameters !== 'object' || Array.isArray(newParameters)) {
        logger.warn(`${LOG_ID} - Invalid parameters format for user ID: ${params.id}`)
        return response.badRequest({ message: 'Invalid parameters format' })
      }

      user.parameters = { ...user.parameters, ...newParameters }
      await user.save()

      logger.info(`${LOG_ID} - Parameters updated successfully for user ID: ${params.id}`)
      return response.ok(user.parameters)
    } catch (error) {
      logger.error(`${LOG_ID} - Failed to update parameters for user ID: ${params.id} - ${error.message}`)
      return response.status(400).json({ message: 'Failed to update parameters', error: error.message })
    }
  }

  /**
   * Delete a parameter from the user's parameters.
   * @param params - ID of the user
   * @param request - HTTP request object
   * @param response - HTTP response object
   */
  public async deleteParameter({ params, request, response }: HttpContext) {
    try {
      logger.info(`${LOG_ID} - Deleting parameter for user ID: ${params.id}`)
      const user = await User.findOrFail(params.id)
      const keyToDelete = request.input('key')

      if (!keyToDelete) {
        logger.warn(`${LOG_ID} - Parameter key is missing for user ID: ${params.id}`)
        return response.badRequest({ message: 'Parameter key is required' })
      }

      if (!(keyToDelete in user.parameters)) {
        logger.warn(`${LOG_ID} - Key '${keyToDelete}' not found for user ID: ${params.id}`)
        return response.notFound({ message: `Key '${keyToDelete}' not found in parameters` })
      }

      delete user.parameters[keyToDelete]
      await user.save()

      logger.info(`${LOG_ID} - Parameter '${keyToDelete}' deleted successfully for user ID: ${params.id}`)
      return response.ok({ message: `Parameter '${keyToDelete}' deleted successfully`, parameters: user.parameters })
    } catch (error) {
      logger.error(`${LOG_ID} - Failed to delete parameter for user ID: ${params.id} - ${error.message}`)
      return response.status(400).json({ message: 'Failed to delete parameter', error: error.message })
    }
  }
}
