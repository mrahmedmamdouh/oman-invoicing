class CustomerDTO {
  constructor(customer) {
    this.id = customer.id;
    this.name = customer.name;
    this.nameAr = customer.nameAr;
    this.email = customer.email;
    this.phone = customer.phone;
    this.taxRegistrationNumber = customer.taxRegistrationNumber;
    this.commercialRegistrationNumber = customer.commercialRegistrationNumber;
    this.peppolId = customer.peppolId;
    this.customerType = customer.customerType;
    
    this.address = {
      street: customer.address?.street,
      streetAr: customer.address?.streetAr,
      city: customer.address?.city,
      cityAr: customer.address?.cityAr,
      state: customer.address?.state,
      stateAr: customer.address?.stateAr,
      postalCode: customer.address?.postalCode,
      country: customer.address?.country,
      countryAr: customer.address?.countryAr
    };
    
    this.creditLimit = customer.creditLimit;
    this.paymentTerms = customer.paymentTerms;
    this.currency = customer.currency;
    this.isActive = customer.isActive;
    
    this.createdAt = customer.createdAt;
    this.updatedAt = customer.updatedAt;
  }

  static fromEntity(customer) {
    return new CustomerDTO(customer);
  }

  static fromEntities(customers) {
    return customers.map(customer => new CustomerDTO(customer));
  }
}

module.exports = CustomerDTO;
