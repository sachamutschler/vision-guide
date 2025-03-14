import { test } from '@japa/runner'
import sinon from 'sinon'
import ParametersController from '../../app/controllers/Users/parameters_controller.js'
import User from '#models/user'
import { logger } from '#utils/logger'

test.group('ParametersController Unit Tests', (group) => {
  let sandbox: sinon.SinonSandbox

  group.setup(() => {
    sandbox = sinon.createSandbox()
  })

  group.each.setup(() => {
    sandbox.stub(logger, 'info')
    sandbox.stub(logger, 'warn')
    sandbox.stub(logger, 'error')
  })

  group.teardown(() => {
    sandbox.restore()
  })

  group.each.teardown(() => {
    sandbox.restore()
  })

  /**
   * ✅ Test: Get User Parameters (Success)
   */
  test('should return user parameters', async ({ assert }) => {
    const user = { id: 1, parameters: { theme: 'dark', notifications: true } }

    sandbox.stub(User, 'findOrFail').resolves(user as unknown as User)

    const controller = new ParametersController()
    const fakeResponse = { ok: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.getParameters({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.ok.calledOnce)
    assert.deepEqual(fakeResponse.ok.firstCall.args[0], user.parameters)
  })

  /**
   * ✅ Test: Update User Parameters (Success)
   */
  test('should update user parameters', async ({ assert }) => {
    const user = { id: 1, parameters: { theme: 'light' }, save: sinon.stub().resolves() }

    sandbox.stub(User, 'findOrFail').resolves(user as unknown as User)

    const controller = new ParametersController()
    const fakeRequest = { input: sinon.stub().withArgs('parameters', {}).returns({ theme: 'dark' }) }
    const fakeResponse = { ok: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.updateParameters({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.deepEqual(user.parameters, { theme: 'dark' })
    assert.isTrue(user.save.calledOnce)
    assert.isTrue(fakeResponse.ok.calledOnce)
    assert.deepEqual(fakeResponse.ok.firstCall.args[0], user.parameters)
  })

  /**
   * ✅ Test: Delete a User Parameter (Success)
   */
  test('should delete a parameter from user parameters', async ({ assert }) => {
    const user = {
      id: 1,
      parameters: { notifications: true, theme: 'dark' },
      save: sinon.stub().resolves(),
    }

    sandbox.stub(User, 'findOrFail').resolves(user as unknown as User)

    const controller = new ParametersController()
    const fakeRequest = { input: sinon.stub().withArgs('key').returns('theme') }
    const fakeResponse = { ok: sinon.spy() } // ✅ Correct response type
    const fakeParams = { id: 1 }

    await controller.deleteParameter({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isFalse('theme' in user.parameters) // ✅ Check if 'theme' was deleted
    assert.isTrue(user.save.calledOnce) // ✅ Ensure user.save() was called
    assert.isTrue(fakeResponse.ok.calledOnce) // ✅ Ensure response.ok() was called

    // ✅ Verify response content
    assert.deepEqual(fakeResponse.ok.firstCall.args[0], {
      message: "Parameter 'theme' deleted successfully",
      parameters: { notifications: true }, // 'theme' should be gone
    })
  })


  /**
   * ❌ Test: Get Parameters (User Not Found)
   */
  test('should return 404 when user is not found', async ({ assert }) => {
    sandbox.stub(User, 'findOrFail').rejects(new Error('User not found'))

    const controller = new ParametersController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.getParameters({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'User not found' })
  })

  /**
   * ❌ Test: Update Parameters (User Not Found)
   */
  test('should return 404 when updating parameters for non-existent user', async ({ assert }) => {
    sandbox.stub(User, 'findOrFail').rejects(new Error('User not found'))

    const controller = new ParametersController()
    const fakeRequest = { input: sinon.stub().returns({ theme: 'dark' }) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.updateParameters({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(400))
  })

  /**
   * ❌ Test: Update Parameters (Invalid Format)
   */
  test('should return 400 when parameters format is invalid', async ({ assert }) => {
    const user = { id: 1, parameters: { theme: 'light' }, save: sinon.stub().resolves() }

    sandbox.stub(User, 'findOrFail').resolves(user as unknown as User)

    const controller = new ParametersController()
    const fakeRequest = { input: sinon.stub().withArgs('parameters', {}).returns('invalid_string') }
    const fakeResponse = { badRequest: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.updateParameters({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.badRequest.calledOnce)
  })

  /**
   * ❌ Test: Delete Parameter (User Not Found)
   */
  test('should return 404 when deleting parameter for non-existent user', async ({ assert }) => {
    sandbox.stub(User, 'findOrFail').rejects(new Error('User not found'))

    const controller = new ParametersController()
    const fakeRequest = { input: sinon.stub().withArgs('key').returns('theme') }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.deleteParameter({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(400))
  })

  /**
   * ❌ Test: Delete Parameter (Key Not Found)
   */
  test("should return 404 when key doesn't exist in parameters", async ({ assert }) => {
    const user = { id: 1, parameters: { notifications: true }, save: sinon.stub().resolves() }

    sandbox.stub(User, 'findOrFail').resolves(user as unknown as User)

    const controller = new ParametersController()
    const fakeRequest = { input: sinon.stub().withArgs('key').returns('theme') }
    const fakeResponse = { notFound: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.deleteParameter({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.notFound.calledOnce)
  })
  /**
   * ❌ Test: Delete Parameter (Missing Key in Request)
   */
  test('should return 400 when parameter key is missing in request', async ({ assert }) => {
    const user = { id: 1, parameters: { notifications: true }, save: sinon.stub().resolves() }

    sandbox.stub(User, 'findOrFail').resolves(user as unknown as User)

    const controller = new ParametersController()
    const fakeRequest = { input: sinon.stub().withArgs('key').returns(undefined) }
    const fakeResponse = { badRequest: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.deleteParameter({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.badRequest.calledOnce)
    assert.deepEqual(fakeResponse.badRequest.firstCall.args[0], { message: 'Parameter key is required' })
  })
})
