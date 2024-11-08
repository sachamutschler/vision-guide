import type { HttpContext } from '@adonisjs/core/http'
/* ====== VALIDATORS ====== */
import { geocoderEntry, reverseGeocoderEntry } from '#validators/localisation'

/* ====== CONFIG ====== */
import geocoder from '#config/geocoder'

/* ====== UTILS ====== */
import { addLegacyProperties } from '#utils/geocoder'

export default class LocationController {
  async getCoordinates({ request, response }: HttpContext) {
    const address = await request.validateUsing(geocoderEntry)

    try {
      const res = await geocoder.geocode(address)

      if (res.length === 0) {
        return response.status(404).json({ message: 'Address not found' })
      }

      return response.json({
        latitude: res[0].latitude,
        longitude: res[0].longitude,
        formattedAddress: res[0].formattedAddress,
      })
    } catch (error) {
      console.error('Geocoding Error:', error)
      return response.status(500).json({ message: 'Error retrieving coordinates' })
    }
  }

  async reverseGeocode({ request, response }: HttpContext) {
    const { latitude, longitude } = await request.validateUsing(reverseGeocoderEntry)

    try {
      const res = await geocoder.reverse({ lat: latitude, lon: longitude })

      if (res.length === 0) {
        return response.status(404).json({ message: 'Location not found' })
      }

      const splitAdress = {
        streetNumber: res[0].streetNumber || '',
        streetName: res[0].streetName || '',
        city: res[0].city || '',
        country: res[0].country || '',
      }

      const { address, location } = addLegacyProperties(splitAdress)

      return response.json({
        address: address,
        location: location,
        city: res[0].city,
        country: res[0].country,
      })
    } catch (error) {
      console.error('Reverse Geocoding Error:', error)
      return response.status(500).json({ message: 'Error retrieving address' })
    }
  }
}
