interface SplitAddress {
  streetNumber: string
  streetName: string
  city: string
  country: string
}

/**
 * Set location address and location fields.
 * @param {boolean} legacyResults - True to return the full address.
 * @param {SplitAddress} address - The address object.
 * @returns {Address} - The address object with legacy properties.
 */
function addLegacyProperties(address: SplitAddress): {
  address: string
  location: string
} {
  const newLocation = { ...address }

  const newAdress = {
    address: '',
    location: '',
  }

  newAdress.address = `${newLocation.streetNumber} ${newLocation.streetName}`
  newAdress.location = `${newLocation.city}, ${newLocation.country}`

  return newAdress
}

export { addLegacyProperties }
