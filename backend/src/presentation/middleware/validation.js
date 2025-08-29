const { validationResult } = require('express-validator');
const { ValidationError } = require('../../shared/exceptions/AppError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    throw new ValidationError('Validation failed', validationErrors);
  }

  next();
};

module.exports = {
  handleValidationErrors
};
