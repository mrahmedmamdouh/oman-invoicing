const xml2js = require('xml2js');
const { v4: uuidv4 } = require('uuid');

class PeppolService {
  constructor(peppolGateway) {
    this.peppolGateway = peppolGateway;
    this.xmlBuilder = new xml2js.Builder({
      rootName: 'Invoice',
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
  }

  async submitInvoice(invoice, customer) {
    try {
      // Transform invoice to UBL 2.1 format (PEPPOL standard)
      const ublInvoice = this.transformToUBL(invoice, customer);
      
      // Convert to XML
      const xmlInvoice = this.xmlBuilder.buildObject(ublInvoice);
      
      // Submit to PEPPOL network
      const response = await this.peppolGateway.sendDocument({
        senderId: invoice.taxRegistrationNumber,
        receiverId: customer.peppolId,
        documentType: 'Invoice',
        content: xmlInvoice
      });

      return response.messageId;
    } catch (error) {
      throw new Error(`PEPPOL submission failed: ${error.message}`);
    }
  }

  transformToUBL(invoice, customer) {
    const ublInvoice = {
      ': {
        xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
      },
      'cbc:UBLVersionID': '2.1',
      'cbc:CustomizationID': 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
      'cbc:ProfileID': 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
      'cbc:ID': invoice.invoiceNumber,
      'cbc:IssueDate': invoice.issueDate.toISOString().split('T')[0],
      'cbc:DueDate': invoice.dueDate?.toISOString().split('T')[0],
      'cbc:InvoiceTypeCode': '380', // Commercial Invoice
      'cbc:DocumentCurrencyCode': invoice.currency,
      
      // Supplier (AccountingSupplierParty)
      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PartyName': {
            'cbc:Name': invoice.supplierName || 'Your Company Name'
          },
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': invoice.taxRegistrationNumber,
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        }
      },

      // Customer (AccountingCustomerParty)
      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyName': {
            'cbc:Name': customer.name
          },
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': customer.taxRegistrationNumber,
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        }
      },

      // Invoice Lines
      'cac:InvoiceLine': invoice.items.map((item, index) => ({
        'cbc:ID': index + 1,
        'cbc:InvoicedQuantity': {
          ': { unitCode: item.unit.toUpperCase() },
          '_': item.quantity
        },
        'cbc:LineExtensionAmount': {
          ': { currencyID: invoice.currency },
          '_': item.total.toFixed(2)
        },
        'cac:Item': {
          'cbc:Name': item.description
        },
        'cac:Price': {
          'cbc:PriceAmount': {
            ': { currencyID: invoice.currency },
            '_': item.unitPrice.toFixed(2)
          }
        },
        'cac:ClassifiedTaxCategory': {
          'cbc:ID': 'S', // Standard rate
          'cbc:Percent': (item.vatRate * 100).toFixed(2),
          'cac:TaxScheme': {
            'cbc:ID': 'VAT'
          }
        }
      })),

      // Tax Total
      'cac:TaxTotal': {
        'cbc:TaxAmount': {
          ': { currencyID: invoice.currency },
          '_': invoice.vatAmount.toFixed(2)
        },
        'cac:TaxSubtotal': {
          'cbc:TaxableAmount': {
            ': { currencyID: invoice.currency },
            '_': invoice.subtotal.toFixed(2)
          },
          'cbc:TaxAmount': {
            ': { currencyID: invoice.currency },
            '_': invoice.vatAmount.toFixed(2)
          },
          'cac:TaxCategory': {
            'cbc:ID': 'S',
            'cbc:Percent': (invoice.vatRate * 100).toFixed(2),
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        }
      },

      // Monetary Total
      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': {
          ': { currencyID: invoice.currency },
          '_': invoice.subtotal.toFixed(2)
        },
        'cbc:TaxExclusiveAmount': {
          ': { currencyID: invoice.currency },
          '_': invoice.subtotal.toFixed(2)
        },
        'cbc:TaxInclusiveAmount': {
          ': { currencyID: invoice.currency },
          '_': invoice.totalAmount.toFixed(2)
        },
        'cbc:PayableAmount': {
          ': { currencyID: invoice.currency },
          '_': invoice.totalAmount.toFixed(2)
        }
      }
    };

    return ublInvoice;
  }

  async getDeliveryStatus(messageId) {
    try {
      return await this.peppolGateway.getDeliveryStatus(messageId);
    } catch (error) {
      throw new Error(`Failed to get PEPPOL delivery status: ${error.message}`);
    }
  }

  async validatePeppolId(peppolId) {
    try {
      return await this.peppolGateway.validateParticipant(peppolId);
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }
}
