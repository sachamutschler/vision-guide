import type { HttpContext } from '@adonisjs/core/http'
import { createFaqValidator, updateFaqValidator } from '#validators/faq'
import Faq from '../models/faq.js'
import { logger } from '#utils/logger'

const LOG_ID = 'FAQ_CONTROLLER'

export default class FaqsController {
  /**
   * GET all published FAQs
   * Calls `Faq.query().where('isPublished', true)`
   */
  public async index({ response }: HttpContext) {
    logger.info(`${LOG_ID} - Received GET request for all published FAQs`)
    try {
      const faqs = await Faq.query().where('isPublished', true)
      response.ok(faqs)
    } catch (error) {
      logger.error(`${LOG_ID} - Error fetching FAQs: ${error.message}`)
      response.status(500).json({ message: 'Failed to fetch FAQs' })
    }
  }

  /**
   * GET all hidden FAQs
   * Calls `Faq.query().where('isPublished', false)`
   */
  public async hidden({ response }: HttpContext) {
    logger.info(`${LOG_ID} - Received GET request for all hidden FAQs`)
    try {
      const faqs = await Faq.query().where('isPublished', false)
      response.ok(faqs)
    } catch (error) {
      logger.error(`${LOG_ID} - Error fetching hidden FAQs: ${error.message}`)
      response.status(500).json({ message: 'Failed to fetch hidden FAQs' })
    }
  }

  /**
   * POST create a new FAQ
   * Calls `createFaqValidator.validate()` and `Faq.create()`
   */
  public async store({ request, response }: HttpContext) {
    logger.info(`${LOG_ID} - Received POST request to create a new FAQ`)

    try {
      const data = request.all()
      const payload = await createFaqValidator.validate(data)
      const faq = await Faq.create(payload)

      logger.info(`${LOG_ID} - FAQ created successfully with ID ${faq.id}`)
      response.created(faq)
    } catch (error) {
      logger.error(`${LOG_ID} - Error creating FAQ: ${error.message}`)
      response.status(400).json({ message: 'Validation failed', error: error.message })
    }
  }

  /**
   * GET one FAQ by ID
   * Calls `Faq.findOrFail(id)`
   */
  public async show({ params, response }: HttpContext) {
    logger.info(`${LOG_ID} - Received GET request for FAQ with ID ${params.id}`)

    try {
      const faq = await Faq.findOrFail(params.id)
      response.ok(faq)
    } catch (error) {
      logger.warn(`${LOG_ID} - FAQ not found with ID ${params.id}`)
      response.status(404).json({ message: 'FAQ not found' })
    }
  }

  /**
   * PUT update an existing FAQ by ID
   * Calls `updateFaqValidator.validate()` and updates the FAQ
   */
  public async update({ params, request, response }: HttpContext) {
    logger.info(`${LOG_ID} - Received PUT request to update FAQ with ID ${params.id}`)

    try {
      const faq = await Faq.findOrFail(params.id)
      const data = request.only(['question', 'answer', 'isPublished'])
      const payload = await updateFaqValidator.validate(data)

      faq.merge(payload)
      await faq.save()

      logger.info(`${LOG_ID} - FAQ updated successfully with ID ${params.id}`)
      response.ok(faq)
    } catch (error) {
      logger.warn(`${LOG_ID} - Error updating FAQ with ID ${params.id}: ${error.message}`)
      response.status(404).json({ message: 'FAQ not found' })
    }
  }

  /**
   * DELETE one FAQ by ID
   * Calls `Faq.findOrFail(id)` and deletes it
   */
  public async destroy({ params, response }: HttpContext) {
    logger.info(`${LOG_ID} - Received DELETE request for FAQ with ID ${params.id}`)

    try {
      const faq = await Faq.findOrFail(params.id)
      await faq.delete()

      logger.info(`${LOG_ID} - FAQ deleted successfully with ID ${params.id}`)
      response.noContent()
    } catch (error) {
      logger.warn(`${LOG_ID} - FAQ not found for deletion with ID ${params.id}`)
      response.status(404).json({ message: 'FAQ not found' })
    }
  }
}
