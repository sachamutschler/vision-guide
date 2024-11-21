import vine from '@vinejs/vine';


export const createFaqValidator = vine.compile(
  vine.object({
    question: vine.string().trim().minLength(10).maxLength(255),
    answer: vine.string().trim().escape().minLength(10),
    isPublished: vine.boolean().optional(),
  })
);

export const updateFaqValidator = vine.compile(
  vine.object({
    question: vine.string().trim().minLength(10).maxLength(255).optional(),
    answer: vine.string().trim().escape().minLength(10).optional(),
    isPublished: vine.boolean().optional()
  })
);
