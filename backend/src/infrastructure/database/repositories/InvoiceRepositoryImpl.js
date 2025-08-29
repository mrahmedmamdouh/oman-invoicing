const InvoiceRepository = require('../../domain/repositories/InvoiceRepository');
const { Invoice } = require('../../domain/entities/Invoice');
const { db } = require('../../config/database');

class InvoiceRepositoryImpl extends InvoiceRepository {
  async save(invoice) {
    const trx = await db.transaction();
    
    try {
      let savedInvoice;
      
      if (invoice.id) {
        // Update existing invoice
        await trx('invoices')
          .where('id', invoice.id)
          .update({
            customer_id: invoice.customerId,
            issue_date: invoice.issueDate,
            issue_date_hijri: invoice.issueDateHijri,
            due_date: invoice.dueDate,
            due_date_hijri: invoice.dueDateHijri,
            status: invoice.status,
            currency: invoice.currency,
            subtotal: invoice.subtotal,
            vat_amount: invoice.vatAmount,
            vat_rate: invoice.vatRate,
            corporate_tax_amount: invoice.corporateTaxAmount,
            corporate_tax_rate: invoice.corporateTaxRate,
            total_amount: invoice.totalAmount,
            tax_registration_number: invoice.taxRegistrationNumber,
            commercial_registration_number: invoice.commercialRegistrationNumber,
            qr_code: invoice.qrCode,
            digital_signature_id: invoice.digitalSignature?.id,
            peppol_id: invoice.peppolId,
            updated_at: new Date()
          });

        // Delete existing items
        await trx('invoice_items').where('invoice_id', invoice.id).del();
      } else {
        // Insert new invoice
        const [insertedInvoice] = await trx('invoices')
          .insert({
            id: invoice.id,
            invoice_number: invoice.invoiceNumber,
            customer_id: invoice.customerId,
            issue_date: invoice.issueDate,
            issue_date_hijri: invoice.issueDateHijri,
            due_date: invoice.dueDate,
            due_date_hijri: invoice.dueDateHijri,
            status: invoice.status,
            currency: invoice.currency,
            subtotal: invoice.subtotal,
            vat_amount: invoice.vatAmount,
            vat_rate: invoice.vatRate,
            corporate_tax_amount: invoice.corporateTaxAmount,
            corporate_tax_rate: invoice.corporateTaxRate,
            total_amount: invoice.totalAmount,
            tax_registration_number: invoice.taxRegistrationNumber,
            commercial_registration_number: invoice.commercialRegistrationNumber,
            qr_code: invoice.qrCode,
            peppol_id: invoice.peppolId,
            retention_until: invoice.retentionUntil,
            created_by: invoice.createdBy,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning('*');
        
        savedInvoice = insertedInvoice;
      }

      // Insert invoice items
      if (invoice.items && invoice.items.length > 0) {
        const itemsToInsert = invoice.items.map(item => ({
          id: item.id,
          invoice_id: invoice.id,
          description: item.description,
          description_ar: item.descriptionAr,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total,
          taxable: item.taxable,
          vat_rate: item.vatRate,
          product_code: item.productCode,
          unit: item.unit,
          sort_order: item.sortOrder || 0
        }));

        await trx('invoice_items').insert(itemsToInsert);
      }

      await trx.commit();
      
      return await this.findById(invoice.id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async findById(id) {
    const invoiceData = await db('invoices as i')
      .leftJoin('customers as c', 'i.customer_id', 'c.id')
      .leftJoin('digital_signatures as ds', 'i.digital_signature_id', 'ds.id')
      .where('i.id', id)
      .select(
        'i.*',
        'c.name as customer_name',
        'c.name_ar as customer_name_ar',
        'c.email as customer_email',
        'c.phone as customer_phone',
        'c.tax_registration_number as customer_tax_number',
        'ds.signature_value',
        'ds.certificate_id'
      )
      .first();

    if (!invoiceData) {
      return null;
    }

    const items = await db('invoice_items')
      .where('invoice_id', id)
      .orderBy('sort_order');

    return this.mapToEntity(invoiceData, items);
  }

  async findByInvoiceNumber(invoiceNumber) {
    const invoiceData = await db('invoices')
      .where('invoice_number', invoiceNumber)
      .first();

    if (!invoiceData) {
      return null;
    }

    return await this.findById(invoiceData.id);
  }

  async findAll(filters = {}, pagination = {}) {
    let query = db('invoices as i')
      .leftJoin('customers as c', 'i.customer_id', 'c.id')
      .select(
        'i.*',
        'c.name as customer_name',
        'c.name_ar as customer_name_ar'
      );

    // Apply filters
    if (filters.status) {
      query = query.where('i.status', filters.status);
    }

    if (filters.customerId) {
      query = query.where('i.customer_id', filters.customerId);
    }

    if (filters.dateFrom) {
      query = query.where('i.issue_date', '>=', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.where('i.issue_date', '<=', filters.dateTo);
    }

    if (filters.search) {
      query = query.where(builder => {
        builder.where('i.invoice_number', 'ilike', `%${filters.search}%`)
               .orWhere('c.name', 'ilike', `%${filters.search}%`)
               .orWhere('c.name_ar', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.createdBy) {
      query = query.where('i.created_by', filters.createdBy);
    }

    // Count total records
    const [{ count: totalCount }] = await query.clone().count('* as count');

    // Apply pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    const invoices = await query
      .orderBy('i.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: invoices.map(invoice => this.mapToEntity(invoice)),
      pagination: {
        current: page,
        pageSize: limit,
        total: parseInt(totalCount)
      }
    };
  }

  async findOverdue(currentDate) {
    return await db('invoices as i')
      .leftJoin('customers as c', 'i.customer_id', 'c.id')
      .where('i.due_date', '<', currentDate)
      .whereIn('i.status', ['sent'])
      .select('i.*', 'c.name as customer_name');
  }

  async getStatistics(dateRange = {}) {
    let query = db('invoices');

    if (dateRange.dateFrom) {
      query = query.where('issue_date', '>=', dateRange.dateFrom);
    }

    if (dateRange.dateTo) {
      query = query.where('issue_date', '<=', dateRange.dateTo);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_invoices'),
        db.raw('SUM(CASE WHEN status = \'paid\' THEN total_amount ELSE 0 END) as paid_amount'),
        db.raw('SUM(CASE WHEN status = \'sent\' THEN total_amount ELSE 0 END) as pending_amount'),
        db.raw('SUM(CASE WHEN status = \'sent\' AND due_date < NOW() THEN total_amount ELSE 0 END) as overdue_amount'),
        db.raw('SUM(total_amount) as total_amount'),
        db.raw('SUM(vat_amount) as total_vat'),
        db.raw('AVG(total_amount) as avg_invoice_amount')
      )
      .first();

    const statusBreakdown = await query.clone()
      .select('status')
      .count('* as count')
      .groupBy('status');

    return {
      ...stats,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {})
    };
  }

  async delete(id) {
    const trx = await db.transaction();
    
    try {
      await trx('invoice_items').where('invoice_id', id).del();
      await trx('invoices').where('id', id).del();
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  mapToEntity(invoiceData, items = []) {
    return new Invoice({
      id: invoiceData.id,
      invoiceNumber: invoiceData.invoice_number,
      customerId: invoiceData.customer_id,
      issueDate: invoiceData.issue_date,
      issueDateHijri: invoiceData.issue_date_hijri,
      dueDate: invoiceData.due_date,
      dueDateHijri: invoiceData.due_date_hijri,
      status: invoiceData.status,
      currency: invoiceData.currency,
      subtotal: parseFloat(invoiceData.subtotal || 0),
      vatAmount: parseFloat(invoiceData.vat_amount || 0),
      vatRate: parseFloat(invoiceData.vat_rate || 0),
      corporateTaxAmount: parseFloat(invoiceData.corporate_tax_amount || 0),
      corporateTaxRate: parseFloat(invoiceData.corporate_tax_rate || 0),
      totalAmount: parseFloat(invoiceData.total_amount || 0),
      taxRegistrationNumber: invoiceData.tax_registration_number,
      commercialRegistrationNumber: invoiceData.commercial_registration_number,
      qrCode: invoiceData.qr_code,
      peppolId: invoiceData.peppol_id,
      retentionUntil: invoiceData.retention_until,
      createdBy: invoiceData.created_by,
      createdAt: invoiceData.created_at,
      updatedAt: invoiceData.updated_at,
      items: items.map(item => ({
        id: item.id,
        description: item.description,
        descriptionAr: item.description_ar,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unit_price),
        total: parseFloat(item.total),
        taxable: item.taxable,
        vatRate: parseFloat(item.vat_rate || 0),
        productCode: item.product_code,
        unit: item.unit,
        sortOrder: item.sort_order
      })),
      customer: invoiceData.customer_name ? {
        id: invoiceData.customer_id,
        name: invoiceData.customer_name,
        nameAr: invoiceData.customer_name_ar,
        email: invoiceData.customer_email,
        phone: invoiceData.customer_phone,
        taxRegistrationNumber: invoiceData.customer_tax_number
      } : null,
      digitalSignature: invoiceData.signature_value ? {
        signatureValue: invoiceData.signature_value,
        certificateId: invoiceData.certificate_id
      } : null
    });
  }
}

module.exports = InvoiceRepositoryImpl;

