import { test } from '@japa/runner'
import sinon from 'sinon'
import FaqsController from '../../app/controllers/faqs_controller.js'
import Faq from '../../app/models/faq.js'
import {logger} from '#utils/logger'
import { createFaqValidator, updateFaqValidator } from '#validators/faq'

test.group('Faq Controller Unit Tests', (group) => {
  let sandbox: sinon.SinonSandbox

  group.setup(() => {
    sandbox = sinon.createSandbox()
  })
  group.each.setup(()=>{
    sandbox.stub(logger,'info')
    sandbox.stub(logger,'warn')
    sandbox.stub(logger,'error')
  })

  group.teardown(() => {
    sandbox.restore()
  })
  group.each.teardown(() => {
    sandbox.restore()
  })

  /**
   * Test: Get all published FAQs
   */
  test('should return all published FAQs', async ({ assert }) => {
    sandbox.stub(Faq, 'query').returns({
      where: sinon.stub().returns([{ id: 1, question: 'What is Adonis?', answer: 'A Node.js framework', isPublished: true }]),
    } as any)

    const controller = new FaqsController()
    const fakeResponse = { ok: sinon.spy() }

    await controller.index({ response: fakeResponse } as any)

    assert.isTrue(fakeResponse.ok.calledOnce)
    assert.deepEqual(fakeResponse.ok.firstCall.args[0], [
      { id: 1, question: 'What is Adonis?', answer: 'A Node.js framework', isPublished: true },
    ])
  })

  /**
   * Test: Get all hidden FAQs
   */
  test('should return all hidden FAQs', async ({ assert }) => {
    sandbox.stub(Faq, 'query').returns({
      where: sinon.stub().returns([{ id: 2, question: 'Hidden FAQ?', answer: 'This is hidden', isPublished: false }]),
    } as any)

    const controller = new FaqsController()
    const fakeResponse = { ok: sinon.spy() }

    await controller.hidden({ response: fakeResponse } as any)

    assert.isTrue(fakeResponse.ok.calledOnce)
    assert.deepEqual(fakeResponse.ok.firstCall.args[0], [
      { id: 2, question: 'Hidden FAQ?', answer: 'This is hidden', isPublished: false },
    ])
  })

  /**
   * Test: Store a new FAQ
   */
  test('should create a new FAQ', async ({ assert }) => {
    const faqData = { question: 'New FAQ?', answer: 'This is a new FAQ', isPublished: true }
    const createdFaq = { id: 3, ...faqData }

    sandbox.stub(createFaqValidator, 'validate').resolves(faqData)
    sandbox.stub(Faq, 'create').resolves(createdFaq as Faq)

    const controller = new FaqsController()
    const fakeRequest = { all: sinon.stub().returns(faqData) }
    const fakeResponse = { created: sinon.spy() }

    await controller.store({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.created.calledOnce)
    assert.deepEqual(fakeResponse.created.firstCall.args[0], createdFaq)
  })

  /**
   * Test: Store a new FAQ (Validation Fails)
   */
  test('should return validation error when storing an FAQ', async ({ assert }) => {
    sandbox.stub(createFaqValidator, 'validate').rejects(new Error('Validation failed'))

    const controller = new FaqsController()
    const fakeRequest = { all: sinon.stub().returns({}) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.store({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(400))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Validation failed', error: 'Validation failed' })
  })

  /**new Error('Validation failed')
   * Test: Get a single FAQ
   */
  test('should return a single FAQ', async ({ assert }) => {
    const faq = { id: 1, question: 'What is Adonis?', answer: 'A Node.js framework', isPublished: true }

    sandbox.stub(Faq, 'findOrFail').resolves(faq as Faq)

    const controller = new FaqsController()
    const fakeResponse = { ok: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.show({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.ok.calledOnce)
    assert.deepEqual(fakeResponse.ok.firstCall.args[0], faq)
  })

  /**
   * Test: Update an FAQ
   */
  test('should update an FAQ', async ({ assert }) => {
    const faq = {
      id: 1,
      question: 'What is Adonis?',
      answer: 'A Node.js framework',
      isPublished: true,
      merge: sinon.stub().callsFake(function (this: any, newData) {
        Object.assign(this, newData) // Ensure properties are actually updated
      }),
      save: sinon.stub().resolves(),
    }

    sandbox.stub(Faq, 'findOrFail').resolves(faq as unknown as Faq)

    // Define the update payload
    const updateData = {
      question: 'Updated FAQ question?',
      answer: 'Updated FAQ answer.',
      isPublished: true
    }

    // Call the actual validator to ensure correctness
    const validatedData = await updateFaqValidator.validate(updateData)

    const controller = new FaqsController()
    const fakeRequest = { only: sinon.stub().returns(updateData) }
    const fakeResponse = { ok: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.update({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    // Ensure `merge()` was called once with validated data
    assert.isTrue(faq.merge.calledOnceWith(validatedData))

    // Ensure `save()` was called once
    assert.isTrue(faq.save.calledOnce)

    // Ensure response was returned correctly
    assert.isTrue(fakeResponse.ok.calledOnce)

    // ✅ Fix: Ensure `faq` actually contains the updated values before asserting
    assert.deepEqual(faq.question, validatedData.question)
    assert.deepEqual(faq.answer, validatedData.answer)
    assert.deepEqual(faq.isPublished, validatedData.isPublished)

    // ✅ Ensure the response contains the updated data
    assert.deepInclude(fakeResponse.ok.firstCall.args[0], {
      question: validatedData.question,
      answer: validatedData.answer,
      isPublished: validatedData.isPublished,
    })
  })


  /**
   * Test: Delete an FAQ
   */
  test('should delete an FAQ', async ({ assert }) => {
    const faq: Partial<Faq> = { id: 1, delete: sinon.stub().resolves() }

    sandbox.stub(Faq, 'findOrFail').resolves(faq as Faq)

    const controller = new FaqsController()
    const fakeResponse = { noContent: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.destroy({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.noContent.calledOnce)
  })

  /**
   * Test: Delete an FAQ (Not Found)
   */
  test('should return 404 when deleting a non-existent FAQ', async ({ assert }) => {
    const notFoundError = new Error('FAQ not found');

    // Ensure previous stubs are cleared before creating a new one
    if ((Faq.findOrFail as sinon.SinonStub).restore) {
      (Faq.findOrFail as sinon.SinonStub).restore();
    }

    sandbox.stub(Faq, 'findOrFail').rejects(notFoundError);

    const controller = new FaqsController();
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const fakeParams = { id: 99 };

    await controller.destroy({ params: fakeParams, response: fakeResponse } as any);

    assert.isTrue(fakeResponse.status.calledOnceWith(404));
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: notFoundError.message });
  });
  /**
   * Test: Error when fetching all published FAQs
   * 🔹 Covers lines 19-21
   */
  test('should return 500 when failing to fetch published FAQs', async ({ assert }) => {
    sandbox.stub(Faq, 'query').throws(new Error('Database error'))

    const controller = new FaqsController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.index({ response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(500))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Failed to fetch FAQs' })
  })

  /**
   * Test: Error when fetching all hidden FAQs
   * 🔹 Covers lines 34-36
   */
  test('should return 500 when failing to fetch hidden FAQs', async ({ assert }) => {
    sandbox.stub(Faq, 'query').throws(new Error('Database error'))

    const controller = new FaqsController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.hidden({ response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(500))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Failed to fetch hidden FAQs' })
  })

  /**
   * Test: Error when updating a non-existent FAQ
   * 🔹 Covers lines 70-72
   */
  test('should return 404 when failing to update a non-existent FAQ', async ({ assert }) => {
    sandbox.stub(Faq, 'findOrFail').rejects(new Error('FAQ not found'))

    const controller = new FaqsController()
    const fakeRequest = { only: sinon.stub().returns({ question: 'Updated FAQ?' }) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.update({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'FAQ not found' })
  })

  /**
   * Test: Error when deleting a non-existent FAQ
   * 🔹 Covers lines 93-95
   */
  test('should return 404 when failing to delete a non-existent FAQ', async ({ assert }) => {
    sandbox.stub(Faq, 'findOrFail').rejects(new Error('FAQ not found'))

    const controller = new FaqsController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.show({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'FAQ not found' })
  })
})
