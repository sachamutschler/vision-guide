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
import LocalisationController from '#controllers/Localisation/localisation_controller'
import './faq.routes.ts';

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
