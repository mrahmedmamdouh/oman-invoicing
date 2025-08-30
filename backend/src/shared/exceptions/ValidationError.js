const { AppError } = require('./AppError');

class ValidationError extends AppError {
  constructor(message, errors = [], field = null) {
    super(message, 400, 'خطأ في التحقق من صحة البيانات');
    this.name = 'ValidationError';
    this.errors = errors;
    this.field = field;
  }

  static fromExpressValidator(validationResult) {
    const errors = validationResult.array().map(error => ({
      field: error.param || error.path,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return new ValidationError('Validation failed', errors);
  }

  static fieldRequired(field, fieldNameAr = null) {
    return new ValidationError(
      `${field} is required`,
      [{ field, message: `${field} is required`, messageAr: `${fieldNameAr || field} مطلوب` }],
      field
    );
  }

  static invalidFormat(field, format, fieldNameAr = null) {
    return new ValidationError(
      `${field} has invalid format`,
      [{ 
        field, 
        message: `${field} must be in ${format} format`, 
        messageAr: `${fieldNameAr || field} يجب أن يكون بتنسيق ${format}` 
      }],
      field
    );
  }

  static outOfRange(field, min, max, fieldNameAr = null) {
    return new ValidationError(
      `${field} is out of range`,
      [{ 
        field, 
        message: `${field} must be between ${min} and ${max}`, 
        messageAr: `${fieldNameAr || field} يجب أن يكون بين ${min} و ${max}` 
      }],
      field
    );
  }
}

module.exports = ValidationError;
