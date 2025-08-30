const { AppError } = require('./AppError');

class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = null) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    
    const messageAr = id
      ? `${resource} برقم ${id} غير موجود`
      : `${resource} غير موجود`;

    super(message, 404, messageAr);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.resourceId = id;
  }
}

module.exports = NotFoundError;
