const CustomerRepository = require('../../../domain/repositories/CustomerRepository');
const { Customer } = require('../../../domain/entities/Customer');
const { db } = require('../../../config/database');

class CustomerRepositoryImpl extends CustomerRepository {
  async save(customer) {
    if (customer.id) {
      // Update existing customer
      await db('customers')
        .where('id', customer.id)
        .update({
          name: customer.name,
          name_ar: customer.nameAr,
          email: customer.email,
          phone: customer.phone,
          tax_registration_number: customer.taxRegistrationNumber,
          commercial_registration_number: customer.commercialRegistrationNumber,
          peppol_id: customer.peppolId,
          customer_type: customer.customerType,
          street: customer.address.street,
          street_ar: customer.address.streetAr,
          city: customer.address.city,
          city_ar: customer.address.cityAr,
          state: customer.address.state,
          state_ar: customer.address.stateAr,
          postal_code: customer.address.postalCode,
          country: customer.address.country,
          country_ar: customer.address.countryAr,
          credit_limit: customer.creditLimit,
          payment_terms: customer.paymentTerms,
          currency: customer.currency,
          is_active: customer.isActive,
          updated_at: new Date()
        });
    } else {
      // Insert new customer
      await db('customers').insert({
        id: customer.id,
        name: customer.name,
        name_ar: customer.nameAr,
        email: customer.email,
        phone: customer.phone,
        tax_registration_number: customer.taxRegistrationNumber,
        commercial_registration_number: customer.commercialRegistrationNumber,
        peppol_id: customer.peppolId,
        customer_type: customer.customerType,
        street: customer.address.street,
        street_ar: customer.address.streetAr,
        city: customer.address.city,
        city_ar: customer.address.cityAr,
        state: customer.address.state,
        state_ar: customer.address.stateAr,
        postal_code: customer.address.postalCode,
        country: customer.address.country,
        country_ar: customer.address.countryAr,
        credit_limit: customer.creditLimit,
        payment_terms: customer.paymentTerms,
        currency: customer.currency,
        is_active: customer.isActive,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return await this.findById(customer.id);
  }

  async findById(id) {
    const customerData = await db('customers')
      .where('id', id)
      .first();

    if (!customerData) {
      return null;
    }

    return this.mapToEntity(customerData);
  }

  async findByEmail(email) {
    const customerData = await db('customers')
      .where('email', email)
      .first();

    return customerData ? this.mapToEntity(customerData) : null;
  }

  async findByTaxNumber(taxNumber) {
    const customerData = await db('customers')
      .where('tax_registration_number', taxNumber)
      .first();

    return customerData ? this.mapToEntity(customerData) : null;
  }

  async findAll(filters = {}, pagination = {}) {
    let query = db('customers');

    if (filters.isActive !== undefined) {
      query = query.where('is_active', filters.isActive);
    }

    if (filters.customerType) {
      query = query.where('customer_type', filters.customerType);
    }

    if (filters.search) {
      query = query.where(builder => {
        builder.where('name', 'ilike', `%${filters.search}%`)
               .orWhere('name_ar', 'ilike', `%${filters.search}%`)
               .orWhere('email', 'ilike', `%${filters.search}%`);
      });
    }

    // Count total records
    const [{ count: totalCount }] = await query.clone().count('* as count');

    // Apply pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    const customers = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: customers.map(customer => this.mapToEntity(customer)),
      pagination: {
        current: page,
        pageSize: limit,
        total: parseInt(totalCount)
      }
    };
  }

  async search(query) {
    const customers = await db('customers')
      .where('name', 'ilike', `%${query}%`)
      .orWhere('name_ar', 'ilike', `%${query}%`)
      .orWhere('email', 'ilike', `%${query}%`)
      .where('is_active', true)
      .limit(10);

    return customers.map(customer => this.mapToEntity(customer));
  }

  async delete(id) {
    await db('customers')
      .where('id', id)
      .update({
        is_active: false,
        updated_at: new Date()
      });
  }

  mapToEntity(customerData) {
    return new Customer({
      id: customerData.id,
      name: customerData.name,
      nameAr: customerData.name_ar,
      email: customerData.email,
      phone: customerData.phone,
      taxRegistrationNumber: customerData.tax_registration_number,
      commercialRegistrationNumber: customerData.commercial_registration_number,
      peppolId: customerData.peppol_id,
      customerType: customerData.customer_type,
      address: {
        street: customerData.street,
        streetAr: customerData.street_ar,
        city: customerData.city,
        cityAr: customerData.city_ar,
        state: customerData.state,
        stateAr: customerData.state_ar,
        postalCode: customerData.postal_code,
        country: customerData.country,
        countryAr: customerData.country_ar
      },
      creditLimit: parseFloat(customerData.credit_limit || 0),
      paymentTerms: customerData.payment_terms,
      currency: customerData.currency,
      isActive: customerData.is_active,
      createdAt: customerData.created_at,
      updatedAt: customerData.updated_at
    });
  }
}

module.exports = CustomerRepositoryImpl;