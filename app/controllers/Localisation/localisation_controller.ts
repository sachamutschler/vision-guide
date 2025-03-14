import type { HttpContext } from '@adonisjs/core/http'

/* ====== VALIDATORS ====== */
import { geocoderEntry, reverseGeocoderEntry } from '#validators/localisation'

/* ====== CONFIG ====== */
import geocoder from '#config/geocoder'

/* ====== UTILS ====== */
import { addLegacyProperties } from '#utils/geocoder'
import { logger } from '#utils/logger' // ${LOG_ID} Ajout du logger
const LOG_ID = 'FAQ_CONTROLLER'
export default class LocationController {
  /**
   * 🔹 Récupère les coordonnées (latitude, longitude) à partir d'une adresse
   * @param {HttpContext} request - Contient l'adresse à géocoder
   * @param {HttpContext} response - Retourne les coordonnées de l'adresse
   * @returns {object} { latitude, longitude, formattedAddress }
   */
  async getCoordinates({ request, response }: HttpContext) {
    try {
      const address = await request.validateUsing(geocoderEntry)
      logger.info(`${LOG_ID} Geocoding request for address: ${address}`)

      const res = await geocoder.geocode(address)

      if (res.length === 0) {
        logger.warn(`${LOG_ID} Address not found: ${address}`)
        return response.status(404).json({ message: 'Address not found' })
      }

      logger.info(`${LOG_ID} Address found: ${res[0].formattedAddress}`)
      return response.json({
        latitude: res[0].latitude,
        longitude: res[0].longitude,
        formattedAddress: res[0].formattedAddress,
      })
    } catch (error) {
      logger.error(`${LOG_ID} Geocoding Error: ${error.message}`)
      return response.status(500).json({ message: 'Error retrieving coordinates' })
    }
  }

  /**
   * 🔹 Récupère l'adresse complète à partir des coordonnées GPS
   * @param {HttpContext} request - Contient latitude et longitude
   * @param {HttpContext} response - Retourne l'adresse formatée
   * @returns {object} { address, location, city, country }
   */
  async reverseGeocode({ request, response }: HttpContext) {
    try {
      const { latitude, longitude } = await request.validateUsing(reverseGeocoderEntry)
      logger.info(`${LOG_ID} Reverse geocoding request for coordinates: ${latitude}, ${longitude}`)

      const res = await geocoder.reverse({ lat: latitude, lon: longitude })

      if (res.length === 0) {
        logger.warn(`${LOG_ID} Location not found for coordinates: ${latitude}, ${longitude}`)
        return response.status(404).json({ message: 'Location not found' })
      }

      const splitAddress = {
        streetNumber: res[0]?.streetNumber ?? 'N/A',
        streetName: res[0]?.streetName ?? 'Unknown Street',
        city: res[0]?.city ?? 'Unknown City',
        country: res[0]?.country ?? 'Unknown Country',
      }

      const { address, location } = addLegacyProperties(splitAddress)

      logger.info(`${LOG_ID} Location found: ${address}, ${splitAddress.city}, ${splitAddress.country}`)
      return response.json({
        address: address,
        location: location,
        city: splitAddress.city,
        country: splitAddress.country,
      })
    } catch (error) {
      logger.error(`${LOG_ID} Reverse Geocoding Error: ${error.message}`)
      return response.status(500).json({ message: 'Error retrieving address' })
    }
  }
}
