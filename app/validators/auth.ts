import vine from '@vinejs/vine'

const passwordValidator = vine.string().minLength(8)
export const registrationValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: passwordValidator,
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: passwordValidator,
  })
)
