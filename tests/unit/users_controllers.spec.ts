import { test } from '@japa/runner'
import sinon from 'sinon'
import UsersController from '../../app/controllers/Users/users_controllers.js'
import User from '../../app/models/user.js'
import { logger } from '#utils/logger'
import Device from "#models/device";
import vine from '@vinejs/vine'
test.group('UsersController Unit Tests', (group) => {
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

  /** ✅ Test: Get all users */
  test('should return all users', async ({ assert }) => {
    const users = [{ id: 1, fullName: 'John Doe', email: 'john@example.com' }]

    sandbox.stub(User, 'all').resolves(users as User[])

    const controller = new UsersController()
    const fakeResponse = { json: sinon.spy() }

    await controller.index({ response: fakeResponse } as any)

    assert.isTrue(fakeResponse.json.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], users)
  })

  /** ✅ Test: Get all users (Error) */
  test('should return 500 if fetching users fails', async ({ assert }) => {
    sandbox.stub(User, 'all').throws(new Error('Database error'))

    const controller = new UsersController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.index({ response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(500))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Failed to fetch users' })
  })

  /** ✅ Test: Get a single user */
  test('should return a single user', async ({ assert }) => {
    const user = { id: 1, fullName: 'John Doe', email: 'john@example.com' }

    sandbox.stub(User, 'findOrFail').resolves(user as User)

    const controller = new UsersController()
    const fakeResponse = { json: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.show({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.json.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], user)
  })

  /** ✅ Test: Get a single user (Not Found) */
  test('should return 404 if user not found', async ({ assert }) => {
    sandbox.stub(User, 'findOrFail').rejects(new Error('User not found'))

    const controller = new UsersController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.show({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'User not found' })
  })

  /** ✅ Test: Create a new user */
  test('should create a new user', async ({ assert }) => {
    const userData = { fullName: 'Alice Doe', email: 'alice@example.com', password: 'password123' }
    const createdUser = { id: 2, ...userData }

    sandbox.stub(User, 'create').resolves(createdUser as User)

    const controller = new UsersController()
    const fakeRequest = { only: sinon.stub().returns(userData) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.store({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(201))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], createdUser)
  })

  /** ✅ Test: Create a user (Failure) */
  test('should return 400 if user creation fails', async ({ assert }) => {
    sandbox.stub(User, 'create').throws(new Error('Database error'))

    const controller = new UsersController()
    const fakeRequest = { only: sinon.stub().returns({}) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.store({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(400))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Error creating user', error: 'Database error' })
  })

  /** ✅ Test: Update a user */
  test('should update a user', async ({ assert }) => {
    const user = {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      parameters: {},
      password: 'old_password',
      save: sinon.stub().resolves(), // ✅ Ensure `save()` is stubbed
      merge: sinon.stub().callsFake(function (this: any, newData) {
        Object.assign(this, newData)
      }),
    }

    sandbox.stub(User, 'findOrFail').resolves(user as unknown as User)

    const controller = new UsersController()
    const fakeRequest = { only: sinon.stub().returns({ fullName: 'Updated Name' }) }

    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.update({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(user.merge.calledOnce)

    assert.isTrue(user.merge.calledWithMatch({ fullName: 'Updated Name' }))

    assert.isTrue(user.save.calledOnce)

    assert.isTrue(fakeResponse.json.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], user)

    assert.equal(user.fullName, 'Updated Name')
  })



  /** ✅ Test: Update user (Not Found) */
  test('should return 404 if updating a non-existent user', async ({ assert }) => {
    sandbox.stub(User, 'findOrFail').rejects(new Error('User not found'))

    const controller = new UsersController()
    const fakeRequest = { only: sinon.stub().returns({ fullName: 'Updated Name' }) }

    // ✅ Ensure `status` allows chaining (return `this`)
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.update({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'User not found' })
  })


  /** ✅ Test: Delete a user */
  test('should delete a user', async ({ assert }) => {
    const user = { id: 1, delete: sinon.stub().resolves() }

    sandbox.stub(User, 'findOrFail').resolves(user as unknown as User)

    const controller = new UsersController()
    const fakeResponse = { status: sinon.stub().returnsThis(), send: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.destroy({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(user.delete.calledOnce)
    assert.isTrue(fakeResponse.status.calledOnceWith(204))
  })

  /** ✅ Test: Delete user (Not Found) */
  test('should return 404 if deleting a non-existent user', async ({ assert }) => {
    sandbox.stub(User, 'findOrFail').rejects(new Error('User not found'))

    const controller = new UsersController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.destroy({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'User not found' })
  })
  /** ✅ Test: Associate device with authenticated user */
  test('should associate a device with the authenticated user', async ({ assert }) => {
    const devicePayload = {
      name: 'iPhone',
      type: 'smartphone',
      serial_number: 'ABC123XYZ'
    }

    const authUser = { id: 1 }

    const fakeRequest = {
      body: sinon.stub().resolves(devicePayload)
    }

    const fakeResponse = { created: sinon.spy() }

    sandbox.stub(vine, 'compile').returns({
      validate: sinon.stub().resolves(devicePayload)
    } as any)

    const fakeDevice = { id: 1, ...devicePayload, userId: authUser.id }
    sandbox.stub(Device, 'create').resolves(fakeDevice as any)

    const controller = new UsersController()

    await controller.associateDevice({ auth: { user: authUser }, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.created.calledOnceWith(fakeDevice))
  })

  /** ❌ Test: Associate device without authentication */
  test('should return 400 if user is not authenticated when associating a device', async ({ assert }) => {
    const controller = new UsersController()
    const fakeRequest = { body: sinon.stub().resolves({}) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.associateDevice({ auth: { user: null }, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(400))
    assert.match(fakeResponse.json.firstCall.args[0].message, /Error associating device/)
  })

  /** ✅ Test: Get devices for authenticated user */
  test('should return devices for authenticated user', async ({ assert }) => {
    const authUser = { id: 1 }
    const devices = [
      { id: 1, name: 'Laptop' },
      { id: 2, name: 'Tablet' }
    ]

    const fakeUserWithDevices = { devices }

    sandbox.stub(User, 'query').returns({
      where: sinon.stub().returnsThis(),
      preload: sinon.stub().returnsThis(),
      firstOrFail: sinon.stub().resolves(fakeUserWithDevices)
    } as any)

    const fakeResponse = { ok: sinon.spy() }
    const controller = new UsersController()

    await controller.getUserDevices({ auth: { user: authUser }, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.ok.calledOnceWith(devices))
  })

  /** ❌ Test: Get devices without authentication */
  test('should return 500 if user is not authenticated when fetching devices', async ({ assert }) => {
    const controller = new UsersController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.getUserDevices({ auth: { user: null }, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(500))
    assert.match(fakeResponse.json.firstCall.args[0].message, /Error retrieving user devices/)
  })
})
