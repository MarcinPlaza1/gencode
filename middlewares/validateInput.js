const Joi = require('joi');

const validateInput = (req, res, next) => {
  const schema = Joi.object({
    prompt: Joi.string().min(1).max(500).required().messages({
      'string.empty': 'Prompt nie może być pusty.',
      'string.min': 'Prompt musi zawierać co najmniej {#limit} znak.',
      'string.max': 'Prompt może zawierać maksymalnie {#limit} znaków.',
      'any.required': 'Prompt jest wymagany.'
    }),
    language: Joi.string().valid('Python', 'JavaScript', 'Java', 'C#', 'C++', 'Ruby', 'Go', 'Rust', 'PHP', 'TypeScript', 'Swift', 'Kotlin', 'R', 'Scala', 'Perl').required().messages({
      'any.only': 'Wybrany język programowania nie jest obsługiwany.',
      'any.required': 'Język programowania jest wymagany.'
    }),
    style: Joi.string().optional(),
    framework: Joi.string().optional(),
    detailLevel: Joi.string().optional(),
    context: Joi.string().optional(),
    requirements: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({ error: errorMessages });
  }
  
  next();
};

module.exports = validateInput;
