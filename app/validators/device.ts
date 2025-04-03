
import vine from '@vinejs/vine'

/**
 * Validation schema for device creation
 */
export const deviceSchema = vine.object({
  name: vine.string().trim().minLength(1),
  type: vine.number(),
  serial_number: vine.string().trim().minLength(1)
})
