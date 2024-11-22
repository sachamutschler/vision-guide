import type { HttpContext } from '@adonisjs/core/http'
import { createFaqValidator, updateFaqValidator } from '#validators/faq';
import Faq from '../models/faq.js';

export default class FaqsController {
  public async index({ response }: HttpContext) {
    console.log("[faqs_controller] Treating the find All request")
    const faqs = await Faq.query().where('isPublished', true);
    return response.ok(faqs);
  }
  public async hidden({ response }: HttpContext) {
    console.log("[faqs_controller] Treating the find All hidden request")
    const faqs = await Faq.query().where('isPublished', false);
    return response.ok(faqs);
  }

  public async store({ request, response }: HttpContext) {
    console.log("[faqs_controller] Treating the create request")
    const data = request.all()
    const payload = await createFaqValidator.validate(data);
    const faq = await Faq.create(payload);
    return response.created(faq);
  }

  public async show({ params, response }: HttpContext) {
    console.log("[faqs_controller] Treating the find by id request")
    const faq = await Faq.findOrFail(params.id);
    return response.ok(faq);
  }

  public async update({params, request, response }: HttpContext) {
    console.log("[faqs_controller] Treating the update request")
    const faq = await Faq.findOrFail(params.id);
    const data = request.only(['question', 'answer', 'isPublished']);
    const payload = await updateFaqValidator.validate( data);
    faq.merge(payload);
    await faq.save();
    return response.ok(faq);
  }

  public async destroy({ params, response }: HttpContext) {
    console.log("[faqs_controller] Treating the delete request")
    const faq = await Faq.findOrFail(params.id);
    await faq.delete();
    return response.noContent();
  }
}
