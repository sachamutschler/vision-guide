/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import {middleware} from '#start/kernel'
import AuthController from '#controllers/Users/auth_controller'
import UsersController from '#controllers/Users/users_controllers'
import LocalisationController from '#controllers/Localisation/localisation_controller'
import DevicesController from '#controllers/devices_controller'
import './faq.routes.ts'
import './parameters.routes.js'
import Swagger_controller from '#controllers/swagger_controller'

/**
 * @openapi
 * /:
 *   get:
 *     summary: Get a random motivational quote
 *     description: Returns a random quote for inspiration.
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: A motivational quote.
 */
router.get('/', async () => {
  const quotes = [
    'Turn the pain into power.',
    'Life may be full of pain but that is not an excuse to give up.',
    'There are no shortcuts - everything is reps, reps reps.',
    'Doing nothing is easy. That is why so many people do it.',
    'Work harder than you did yesterday.',
    'Be passionate. This is the only way to be among the best.',
    'If you dont find the time. If you dont do the work, you dont get the results.',
  ]
  return `Arnold Quote of the Day: ${quotes[Math.floor(Math.random() * quotes.length)]}`
})

/**
 * @openapi
 * /docs:
 *   get:
 *     summary: Swagger UI Documentation
 *     description: Displays the Swagger UI with interactive API documentation.
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: Swagger UI page.
 */
router.get('/docs', [Swagger_controller, 'show'])

/**
 * @openapi
 * /docs/spec:
 *   get:
 *     summary: Swagger JSON Spec
 *     description: Returns the raw Swagger JSON specification.
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: Swagger JSON spec.
 */
router.get('/docs/spec', [Swagger_controller, 'spec'])

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securepassword
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Validation error.
 */

router.get('/api-docs/swagger.json', '#controllers/swagger_controller.spec')


router.post('/register', [AuthController, 'register']).as('auth.register')

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates the user and returns an access token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securepassword
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *       401:
 *         description: Invalid credentials.
 */
router.post('/login', [AuthController, 'login']).as('auth.login')

/**
 * @openapi
 * /logout:
 *   delete:
 *     summary: Log out a user
 *     description: Logs out the authenticated user.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *       401:
 *         description: Unauthorized.
 */
router.delete('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())

/**
 * @openapi
 * /me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile of the authenticated user.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me', [AuthController, 'me']).as('auth.me').use(middleware.auth())

/**
 * @openapi
 * /geocode:
 *   post:
 *     summary: Get coordinates for an address
 *     description: Returns latitude and longitude for a given address.
 *     tags:
 *       - Localisation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 example: "1600 Amphitheatre Parkway, Mountain View, CA"
 *     responses:
 *       200:
 *         description: Coordinates retrieved successfully.
 *       404:
 *         description: Address not found.
 */
router.post('/geocode', [LocalisationController, 'getCoordinates'])

/**
 * @openapi
 * /reverse-geocode:
 *   post:
 *     summary: Get address from coordinates
 *     description: Returns an address for given latitude and longitude.
 *     tags:
 *       - Localisation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 37.422
 *               longitude:
 *                 type: number
 *                 example: -122.084
 *     responses:
 *       200:
 *         description: Address retrieved successfully.
 *       404:
 *         description: Location not found.
 */
router.post('/reverse-geocode', [LocalisationController, 'reverseGeocode'])

/**
 * @openapi
 * /api/devices:
 *   get:
 *     summary: Get all devices
 *     description: Returns a list of all devices.
 *     tags:
 *       - Devices
 *     responses:
 *       200:
 *         description: A list of devices.
 */
router.group(() => {
  router.group(() => {
    router.get('', [DevicesController, 'index']).as('devices.index')
    /**
     * @openapi
     * /api/devices/{id}:
     *   get:
     *     summary: Get a device by ID
     *     description: Returns details of a device.
     *     tags:
     *       - Devices
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         description: Device details.
     *       404:
     *         description: Device not found.
     */
    router.get('/:id', [DevicesController, 'show']).as('devices.show')
    /**
     * @openapi
     * /api/devices:
     *   post:
     *     summary: Create a new device
     *     description: Creates a new device.
     *     tags:
     *       - Devices
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: "Smartphone"
     *               type:
     *                 type: string
     *                 example: "Mobile"
     *               serial_number:
     *                 type: string
     *                 example: "ABC123456"
     *     responses:
     *       201:
     *         description: Device created successfully.
     *       400:
     *         description: Error creating device.
     */
    router.post('', [DevicesController, 'store']).as('devices.store')
    /**
     * @openapi
     * /api/devices/{id}:
     *   put:
     *     summary: Update an existing device
     *     description: Updates device details.
     *     tags:
     *       - Devices
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: number
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: "Updated Smartphone"
     *               type:
     *                 type: string
     *                 example: "Mobile"
     *               serial_number:
     *                 type: string
     *                 example: "XYZ987654"
     *     responses:
     *       200:
     *         description: Device updated successfully.
     *       404:
     *         description: Device not found.
     */
    router.put('/:id', [DevicesController, 'update']).as('devices.update')
    /**
     * @openapi
     * /api/devices/{id}:
     *   delete:
     *     summary: Delete a device
     *     description: Deletes a device by ID.
     *     tags:
     *       - Devices
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: number
     *     responses:
     *       204:
     *         description: Device deleted successfully.
     *       404:
     *         description: Device not found.
     */
    router.delete('/:id', [DevicesController, 'destroy']).as('devices.destroy')
  }).prefix('/devices')

  router.group(() => {
    /**
     * @openapi
     * /api/users:
     *   get:
     *     summary: Get all users
     *     description: Returns a list of all users.
     *     tags:
     *       - Users
     *     responses:
     *       200:
     *         description: A list of users.
     */
    router.get('', [UsersController, 'index']).as('users.index')
    /**
     * @openapi
     * /api/users/{id}:
     *   get:
     *     summary: Get a user by ID
     *     description: Returns user details.
     *     tags:
     *       - Users
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         description: User details.
     *       404:
     *         description: User not found.
     */
    router.get('/:id', [UsersController, 'show']).as('users.show')
    /**
     * @openapi
     * /api/users:
     *   post:
     *     summary: Create a new user
     *     description: Creates a new user.
     *     tags:
     *       - Users
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               fullName:
     *                 type: string
     *                 example: "Alice Doe"
     *               email:
     *                 type: string
     *                 example: "alice@example.com"
     *               password:
     *                 type: string
     *                 example: "securepassword"
     *               parameters:
     *                 type: object
     *                 example: { "theme": "dark" }
     *     responses:
     *       201:
     *         description: User created successfully.
     *       400:
     *         description: Error creating user.
     */
    router.post('', [UsersController, 'store']).as('users.store')
    /**
     * @openapi
     * /api/users/{id}:
     *   put:
     *     summary: Update an existing user
     *     description: Updates user information.
     *     tags:
     *       - Users
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: number
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               fullName:
     *                 type: string
     *                 example: "Updated Name"
     *               email:
     *                 type: string
     *                 example: "updated@example.com"
     *               password:
     *                 type: string
     *                 example: "newpassword"
     *               parameters:
     *                 type: object
     *                 example: { "theme": "light" }
     *     responses:
     *       200:
     *         description: User updated successfully.
     *       404:
     *         description: User not found.
     */
    router.put('/:id', [UsersController, 'update']).as('users.update')
    /**
     * @openapi
     * /api/users/{id}:
     *   delete:
     *     summary: Delete a user
     *     description: Deletes a user by ID.
     *     tags:
     *       - Users
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: number
     *     responses:
     *       204:
     *         description: User deleted successfully.
     *       404:
     *         description: User not found.
     */
    router.delete('/:id', [UsersController, 'destroy']).as('users.destroy')
  }).prefix('/users')

  router.group(() => {
    /**
     * @openapi
     * /api/user/devices:
     *   post:
     *     summary: Associate a device with authenticated user
     *     description: Creates a new device and associates it with the currently authenticated user.
     *     tags:
     *       - User Devices
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: "My iPhone"
     *               type:
     *                 type: number
     *                 example: 1
     *               serial_number:
     *                 type: string
     *                 example: "ABC123XYZ"
     *     responses:
     *       201:
     *         description: Device created and associated successfully.
     *       400:
     *         description: Error associating device.
     *       401:
     *         description: User not authenticated.
     */
    router.post('', [UsersController, 'associateDevice'])
      .as('user.devices.associate')
      .use(middleware.auth())

    /**
     * @openapi
     * /api/user/devices:
     *   get:
     *     summary: Get all devices for authenticated user
     *     description: Returns a list of all devices associated with the currently authenticated user.
     *     tags:
     *       - User Devices
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of user's devices.
     *       401:
     *         description: User not authenticated.
     *       500:
     *         description: Error retrieving user devices.
     */
    router.get('', [UsersController, 'getUserDevices'])
      .as('user.devices.list')
      .use(middleware.auth())
  }).prefix('/user/devices')
}).prefix('/api')

export default router
