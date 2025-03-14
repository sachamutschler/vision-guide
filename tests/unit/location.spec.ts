import {test} from '@japa/runner'
import sinon from 'sinon'
import LocationController from '../../app/controllers/Localisation/localisation_controller.js'
import geocoder from '#config/geocoder'
import {addLegacyProperties} from '#utils/geocoder'
import {geocoderEntry, reverseGeocoderEntry} from '#validators/localisation'
import {logger} from '#utils/logger'

let sandbox: sinon.SinonSandbox

test.group('LocationController', (group) => {
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
   * Test: Geocode une adresse avec succès
   */
  test('should return coordinates for a valid address', async ({assert}) => {
    const address = '10 Downing Street, London'
    const geocodeResult = [{latitude: 51.5034, longitude: -0.1276, formattedAddress: '10 Downing St, London, UK'}]

    sandbox.stub(geocoderEntry, 'validate').resolves({address})
    sandbox.stub(geocoder, 'geocode').resolves(geocodeResult)

    const controller = new LocationController()
    const fakeRequest = {validateUsing: sinon.stub().resolves(address)}
    const fakeResponse = {json: sinon.spy()}

    await controller.getCoordinates({request: fakeRequest, response: fakeResponse} as any)

    assert.isTrue(fakeResponse.json.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], {
      latitude: 51.5034,
      longitude: -0.1276,
      formattedAddress: '10 Downing St, London, UK',
    })
  })

  /**
   * Test: Reverse Geocode fonctionne
   */
  test('should return address for valid coordinates', async ({assert}) => {
    const location = {latitude: 51.5034, longitude: -0.1276}
    const reverseGeocodeResult = [{
      streetNumber: '10',
      streetName: 'Downing Street',
      city: 'London',
      country: 'UK'
    }]

    sandbox.stub(reverseGeocoderEntry, 'validate').resolves(location)
    sandbox.stub(geocoder, 'reverse').resolves(reverseGeocodeResult)

    // ✅ Directly using the function instead of stubbing
    const splitAddress = {
      streetNumber: reverseGeocodeResult[0].streetNumber,
      streetName: reverseGeocodeResult[0].streetName,
      city: reverseGeocodeResult[0].city,
      country: reverseGeocodeResult[0].country
    }

    const {address, location: formattedLocation} = addLegacyProperties(splitAddress)

    const controller = new LocationController()
    const fakeRequest = {validateUsing: sinon.stub().resolves(location)}
    const fakeResponse = {json: sinon.spy()}

    await controller.reverseGeocode({request: fakeRequest, response: fakeResponse} as any)

    assert.isTrue(fakeResponse.json.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], {
      address: address,  // ✅ Directly using function output
      location: formattedLocation,
      city: reverseGeocodeResult[0].city,
      country: reverseGeocodeResult[0].country,
    })
  })

  /**
   * Test : Adresse non trouvée
   */
  test('should return 404 if address is not found', async ({assert}) => {
    const address = 'Unknown Place'
    sandbox.stub(geocoderEntry, 'validate').resolves({address})
    sandbox.stub(geocoder, 'geocode').resolves([])

    const controller = new LocationController()
    const fakeRequest = {validateUsing: sinon.stub().resolves(address)}
    const fakeResponse = {status: sinon.stub().returnsThis(), json: sinon.spy()}

    await controller.getCoordinates({request: fakeRequest, response: fakeResponse} as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], {message: 'Address not found'})
  })

  /**
   * Test: Reverse Geocode - Localisation non trouvée
   */
  test('should return 404 if reverse geocode location is not found', async ({assert}) => {
    const location = {latitude: 51.5034, longitude: -0.1276}
    sandbox.stub(reverseGeocoderEntry, 'validate').resolves(location)
    sandbox.stub(geocoder, 'reverse').resolves([])

    const controller = new LocationController()
    const fakeRequest = {validateUsing: sinon.stub().resolves(location)}
    const fakeResponse = {status: sinon.stub().returnsThis(), json: sinon.spy()}

    await controller.reverseGeocode({request: fakeRequest, response: fakeResponse} as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], {message: 'Location not found'})
  })

  /**
   * Test: Erreur lors de la récupération des coordonnées
   */
  test('should return 500 if geocode lookup fails', async ({assert}) => {
    const address = '10 Downing Street, London'
    sandbox.stub(geocoderEntry, 'validate').resolves({address})
    sandbox.stub(geocoder, 'geocode').throws(new Error('Geocoder service failure'))

    const controller = new LocationController()
    const fakeRequest = {validateUsing: sinon.stub().resolves(address)}
    const fakeResponse = {status: sinon.stub().returnsThis(), json: sinon.spy()}

    await controller.getCoordinates({request: fakeRequest, response: fakeResponse} as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(500))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], {message: 'Error retrieving coordinates'})
  })

  /**
   * Test: Erreur lors de la récupération de l'adresse
   */
  test('should return 500 if reverse geocode lookup fails', async ({assert}) => {
    const location = {latitude: 51.5034, longitude: -0.1276}
    sandbox.stub(reverseGeocoderEntry, 'validate').resolves(location)
    sandbox.stub(geocoder, 'reverse').throws(new Error('Geocoder service failure'))

    const controller = new LocationController()
    const fakeRequest = {validateUsing: sinon.stub().resolves(location)}
    const fakeResponse = {status: sinon.stub().returnsThis(), json: sinon.spy()}

    await controller.reverseGeocode({request: fakeRequest, response: fakeResponse} as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(500))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], {message: 'Error retrieving address'})
  })

  test('should handle missing address fields in reverse geocode response', async ({assert}) => {
    const location = {latitude: 51.5034, longitude: -0.1276}

    const reverseGeocodeResult = [
      {
        streetNumber: undefined,
        streetName: undefined,
        city: 'London',
        country: undefined
      }
    ]

    sandbox.stub(reverseGeocoderEntry, 'validate').resolves(location)
    sandbox.stub(geocoder, 'reverse').resolves(reverseGeocodeResult)

    const controller = new LocationController()
    const fakeRequest = {validateUsing: sinon.stub().resolves(location)}
    const fakeResponse = {json: sinon.spy()}

    await controller.reverseGeocode({request: fakeRequest, response: fakeResponse} as any)

    assert.isTrue(fakeResponse.json.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], {
      address: 'N/A Unknown Street',
      location: 'London, Unknown Country',
      city: 'London',
      country: 'Unknown Country'
    })
  })
  test('should handle missing city in reverse geocode response', async ({ assert }) => {
    const location = { latitude: 51.5034, longitude: -0.1276 }

    const reverseGeocodeResult = [
      {
        streetNumber: '10',
        streetName: 'Downing Street',
        city: undefined,
        country: 'UK'
      }
    ]

    sandbox.stub(reverseGeocoderEntry, 'validate').resolves(location)
    sandbox.stub(geocoder, 'reverse').resolves(reverseGeocodeResult)

    const controller = new LocationController()
    const fakeRequest = { validateUsing: sinon.stub().resolves(location) }
    const fakeResponse = { json: sinon.spy() }

    await controller.reverseGeocode({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.json.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], {
      address: '10 Downing Street',
      location: 'Unknown City, UK',
      city: 'Unknown City',
      country: 'UK'
    })
  })


})
