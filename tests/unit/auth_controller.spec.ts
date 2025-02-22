import { test } from '@japa/runner'
import sinon from 'sinon'
import AuthController from '../../app/controllers/Users/auth_controller.js'
import User from '#models/user'
import { logger } from '#utils/logger'
import { loginValidator, registrationValidator } from '#validators/auth'

let sandbox: sinon.SinonSandbox

test.group('AuthController', (group) => {
  group.setup(() => {
    sandbox = sinon.createSandbox()
  })

  group.each.setup(() => {
    sandbox.stub(logger, 'info')
    sandbox.stub(logger, 'warn')
    sandbox.stub(logger, 'error')
  })

  group.each.teardown(() => {
    sandbox.restore()
  })

  /**
   * ✅ Test: Successful User Registration
   */
  test('should register a new user', async ({ assert }) => {
    const userData = { email: 'test@example.com', password: 'securepassword' }
    const user = { ...userData, id: 1 }

    const fakeToken = {
      identifier: 'fake-identifier',
      tokenableId: 1,
      name: 'authToken',
      type: 'bearer',
      token: 'fake-token',
      abilities: ['*'],
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any

    sandbox.stub(registrationValidator, 'validate').resolves(userData)
    sandbox.stub(User, 'create').resolves(user as User)
    sandbox.stub(User.accessTokens, 'create').resolves(fakeToken)

    const controller = new AuthController()
    const fakeRequest = { validateUsing: sinon.stub().resolves(userData) }
    const fakeResponse = { created: sinon.spy() }

    await controller.register({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.created.calledOnce)

    const actualResponse = fakeResponse.created.firstCall.args[0]

    assert.equal(actualResponse.message, 'User registered successfully')
    assert.deepEqual(actualResponse.user, user)
    assert.equal(actualResponse.token.token, fakeToken.token)
  })


  /**
   * ❌ Test: Registration Validation Error
   */
  test('should return validation error during registration', async ({ assert }) => {
    const validationError = new Error('Validation failed')

    // ✅ Ensure `request.validateUsing` rejects with an error
    const fakeRequest = { validateUsing: sinon.stub().rejects(validationError) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    const controller = new AuthController()
    await controller.register({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(400))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Registration failed', error: 'Validation failed' })
  })

  /**
   * ✅ Test: Successful User Login
   */
  test('should log in a user successfully', async ({ assert }) => {
    const credentials = { email: 'test@example.com', password: 'securepassword' }
    const user = { id: 1, email: credentials.email }

    const fakeToken = {
      identifier: 'fake-identifier',
      tokenableId: 1,
      name: 'authToken',
      type: 'bearer',
      token: 'fake-token',
      abilities: ['*'],
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any // Use `as any` to prevent strict type errors in tests

    sandbox.stub(loginValidator, 'validate').resolves(credentials)
    sandbox.stub(User, 'verifyCredentials').resolves(user as User)
    sandbox.stub(User.accessTokens, 'create').resolves(fakeToken)

    const controller = new AuthController()
    const fakeRequest = { validateUsing: sinon.stub().resolves(credentials) }
    const fakeResponse = { ok: sinon.spy() }

    await controller.login({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.ok.calledOnce)

    const actualResponse = fakeResponse.ok.firstCall.args[0]

    assert.equal(actualResponse.message, 'User logged in successfully')
    assert.deepEqual(actualResponse.user, user)
    assert.equal(actualResponse.token.token, fakeToken.token) // Compare only the token value
  })


  /**
   * ❌ Test: Invalid Login Attempt
   */
  test('should return unauthorized error for invalid credentials', async ({ assert }) => {
    sandbox.stub(loginValidator, 'validate').resolves({ email: 'test@example.com', password: 'wrongpassword' })
    sandbox.stub(User, 'verifyCredentials').rejects(new Error('Invalid credentials'))

    const controller = new AuthController()
    const fakeRequest = { validateUsing: sinon.stub().resolves({}) }
    const fakeResponse = { unauthorized: sinon.spy() }

    await controller.login({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.unauthorized.calledOnce)
    assert.deepEqual(fakeResponse.unauthorized.firstCall.args[0], { message: 'Invalid credentials' })
  })

  /**
   * ✅ Test: Successful Logout
   */
  test('should log out a user successfully', async ({ assert }) => {
    const user = {
      email: 'test@example.com',
      currentAccessToken: { identifier: 'mock-token' }
    }

    sandbox.stub(User.accessTokens, 'delete').resolves()

    const controller = new AuthController()
    const fakeAuth = { user }
    const fakeResponse = { ok: sinon.spy(), status: sinon.stub().returnsThis(), json: sinon.spy() } // ✅ Ensure response is available

    await controller.logout({ auth: fakeAuth, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.ok.calledOnce)
    assert.deepEqual(fakeResponse.ok.firstCall.args[0], { message: 'User logged out successfully' })
  })


  test('should return 500 if logout fails', async ({ assert }) => {
    const user = {
      email: 'test@example.com',
      currentAccessToken: { identifier: 'mock-token' }
    }

    sandbox.stub(User.accessTokens, 'delete').rejects(new Error('Database error'))

    const controller = new AuthController()
    const fakeAuth = { user }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.logout({ auth: fakeAuth, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(500))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Logout failed', error: 'Database error' })
  })

  test('should return authenticated user', async ({ assert }) => {
    const user = { id: 1, email: 'test@example.com' }

    const controller = new AuthController()
    const fakeAuth = { user }
    const fakeResponse = { ok: sinon.spy() }

    await controller.me({ auth: fakeAuth, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.ok.calledOnce)
    assert.deepEqual(fakeResponse.ok.firstCall.args[0], user)
  })

  test('should return 500 if user profile retrieval fails', async ({ assert }) => {
    const controller = new AuthController()
    const fakeAuth = { user: undefined } // Simulate missing user
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() } // ✅ Ensure status and json exist

    await controller.me({ auth: fakeAuth, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(500))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Error retrieving user profile', error: 'User not authenticated' })
  })

})
