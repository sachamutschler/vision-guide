/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import AuthController from '#controllers/Users/auth_controller'
import UsersController from '#controllers/Users/users_controllers'
import LocalisationController from '#controllers/Localisation/localisation_controller'
import DevicesController from '#controllers/devices_controller'
import './faq.routes.ts';
import './parameters.routes.js';


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

router.post('/register', [AuthController, 'register']).as('auth.register')
router.post('/login', [AuthController, 'login']).as('auth.login')
router.delete('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())
router.get('/me', [AuthController, 'me']).as('auth.me').use(middleware.auth())
router.post('/geocode', [LocalisationController, 'getCoordinates'])
router.post('/reverse-geocode', [LocalisationController, 'reverseGeocode'])

router.group(() => {
  router.group(()=>{
    router.get('', [DevicesController, 'index']).as('devices.index')
    router.get('/:id', [DevicesController, 'show']).as('devices.show')
    router.post('', [DevicesController, 'store']).as('devices.store')
    router.put('/:id', [DevicesController, 'update']).as('devices.update')
    router.delete('/:id', [DevicesController, 'destroy']).as('devices.destroy')
  }).prefix('/devices')


  router.group(() => {
    router.get('', [UsersController, 'index']).as('users.index')
    router.get('/:id', [UsersController, 'show']).as('users.show')
    router.post('', [UsersController, 'store']).as('users.store')
    router.put('/:id', [UsersController, 'update']).as('users.update')
    router.delete('/:id', [UsersController, 'destroy']).as('users.destroy')
  }).prefix('/users')


}).prefix('/api')
