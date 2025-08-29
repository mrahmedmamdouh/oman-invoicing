class Customer {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.nameAr = data.nameAr; // Arabic name
    this.email = data.email;
    this.phone = data.phone;
    this.taxRegistrationNumber = data.taxRegistrationNumber;
    this.commercialRegistrationNumber = data.commercialRegistrationNumber;
    this.peppolId = data.peppolId;
    
    // Address
    this.address = {
      street: data.address?.street || '',
      streetAr: data.address?.streetAr || '', // Arabic street
      city: data.address?.city || '',
      cityAr: data.address?.cityAr || '', // Arabic city
      state: data.address?.state || '',
      stateAr: data.address?.stateAr || '', // Arabic state/governorate
      postalCode: data.address?.postalCode || '',
      country: data.address?.country || 'OM', // Oman
      countryAr: data.address?.countryAr || 'عُمان'
    };
    
    this.customerType = data.customerType || 'individual'; // individual, business
    this.creditLimit = data.creditLimit || 0;
    this.paymentTerms = data.paymentTerms || 30; // days
    this.currency = data.currency || 'OMR';
    this.isActive = data.isActive !== false;
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = [];

    if (!this.name) {
      errors.push('Customer name is required');
    }

    if (!this.email) {
      errors.push('Email is required');
    }

    if (this.customerType === 'business' && !this.commercialRegistrationNumber) {
      errors.push('Commercial Registration Number is required for business customers');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
