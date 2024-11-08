import vine from '@vinejs/vine'

export const geocoderEntry = vine.compile(
  vine.object({
    address: vine.string(),
  })
)

export const reverseGeocoderEntry = vine.compile(
  vine.object({
    latitude: vine.number(),
    longitude: vine.number(),
  })
)
