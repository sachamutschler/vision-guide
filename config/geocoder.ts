import NodeGeocoder from 'node-geocoder'
import fetch from 'node-fetch'

const options = {
  provider: 'opendatafrance' as 'opendatafrance',
  fetch: fetch,
}

const geocoder = NodeGeocoder(options)
export default geocoder
