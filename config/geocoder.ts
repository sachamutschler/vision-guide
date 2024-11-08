import NodeGeocoder from 'node-geocoder'
import fetch from 'node-fetch'

const options = {
  provider: 'opendatafrance' as 'opendatafrance',
  fetch: fetch, // Use node-fetch here
  headers: {
    'User-Agent': 'YourAppName/1.0 (your-email@example.com)',
  },
}

const geocoder = NodeGeocoder(options)
export default geocoder
