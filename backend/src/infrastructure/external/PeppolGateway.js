const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const forge = require('node-forge');
const logger = require('../../shared/utils/logger');

class PeppolGateway {
  constructor() {
    this.gatewayURL = process.env.PEPPOL_GATEWAY_URL;
    this.participantId = process.env.PEPPOL_PARTICIPANT_ID;
    this.certificatePath = process.env.PEPPOL_CERTIFICATE_PATH;
    this.certificatePassword = process.env.PEPPOL_CERTIFICATE_PASSWORD;
    
    this.xmlBuilder = new xml2js.Builder({
      rootName: 'Invoice',
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
  }

  async sendDocument(documentData) {
    try {
      // Convert to UBL XML
      const ublXML = await this.createUBLDocument(documentData);
      
      // Sign document
      const signedDocument = await this.signDocument(ublXML);
      
      // Submit to PEPPOL network
      const response = await this.submitToPeppol(signedDocument, documentData);
      
      logger.info('Document sent via PEPPOL', {
        messageId: response.messageId,
        senderId: documentData.senderId,
        receiverId: documentData.receiverId
      });

      return {
        messageId: response.messageId,
        timestamp: new Date(),
        status: 'sent',
        peppolReference: response.referenceId
      };
    } catch (error) {
      logger.error('PEPPOL submission failed', {
        senderId: documentData.senderId,
        receiverId: documentData.receiverId,
        error: error.message
      });
      throw error;
    }
  }

  async createUBLDocument(documentData) {
    const { invoice, customer } = documentData;
    
    const ublDocument = {
      '': {
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
      'cbc:InvoiceTypeCode': '380',
      'cbc:DocumentCurrencyCode': invoice.currency,
      
      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PartyName': {
            'cbc:Name': process.env.COMPANY_NAME
          },
          'cac:PostalAddress': {
            'cbc:CountrySubentity': 'Muscat',
            'cac:Country': {
              'cbc:IdentificationCode': 'OM'
            }
          },
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': invoice.taxRegistrationNumber,
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        }
      },
      
      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyName': {
            'cbc:Name': customer.name
          },
          'cac:PartyTaxScheme': customer.taxRegistrationNumber ? {
            'cbc:CompanyID': customer.taxRegistrationNumber,
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          } : undefined
        }
      },
      
      'cac:InvoiceLine': invoice.items.map((item, index) => ({
        'cbc:ID': index + 1,
        'cbc:InvoicedQuantity': {
          '': { unitCode: item.unit.toUpperCase() },
          '_': item.quantity
        },
        'cbc:LineExtensionAmount': {
          '': { currencyID: invoice.currency },
          '_': item.total.toFixed(3)
        },
        'cac:Item': {
          'cbc:Name': item.description
        },
        'cac:Price': {
          'cbc:PriceAmount': {
            '': { currencyID: invoice.currency },
            '_': item.unitPrice.toFixed(3)
          }
        },
        'cac:ClassifiedTaxCategory': {
          'cbc:ID': item.taxable ? 'S' : 'Z',
          'cbc:Percent': (item.vatRate * 100).toFixed(2),
          'cac:TaxScheme': {
            'cbc:ID': 'VAT'
          }
        }
      })),
      
      'cac:TaxTotal': {
        'cbc:TaxAmount': {
          '': { currencyID: invoice.currency },
          '_': invoice.vatAmount.toFixed(3)
        },
        'cac:TaxSubtotal': {
          'cbc:TaxableAmount': {
            '': { currencyID: invoice.currency },
            '_': invoice.subtotal.toFixed(3)
          },
          'cbc:TaxAmount': {
            '': { currencyID: invoice.currency },
            '_': invoice.vatAmount.toFixed(3)
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
      
      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': {
          '': { currencyID: invoice.currency },
          '_': invoice.subtotal.toFixed(3)
        },
        'cbc:TaxExclusiveAmount': {
          '': { currencyID: invoice.currency },
          '_': invoice.subtotal.toFixed(3)
        },
        'cbc:TaxInclusiveAmount': {
          '': { currencyID: invoice.currency },
          '_': invoice.totalAmount.toFixed(3)
        },
        'cbc:PayableAmount': {
          '': { currencyID: invoice.currency },
          '_': invoice.totalAmount.toFixed(3)
        }
      }
    };

    return this.xmlBuilder.buildObject(ublDocument);
  }
  

  async signDocument(xmlDocument) {
    if (!this.certificatePath) {
      return xmlDocument; // Return unsigned if no certificate
    }

    try {
      // Load certificate
      const p12Buffer = await fs.readFile(this.certificatePath);
      const p12 = forge.pkcs12.pkcs12FromAsn1(
        forge.asn1.fromDer(p12Buffer.toString('binary')), 
        this.certificatePassword
      );
      
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      
      const cert = certBags[forge.pki.oids.certBag][0];
      const key = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
      
      // Create signature
      const md = forge.md.sha256.create();
      md.update(xmlDocument, 'utf8');
      
      const signature = key.key.sign(md);
      const signatureValue = forge.util.encode64(signature);
      
      // Add signature to XML (simplified - full implementation would use XML-DSig)
      const signedXml = xmlDocument.replace(
        '</Invoice>',
        `<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
          <ds:SignedInfo>
            <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
          </ds:SignedInfo>
          <ds:SignatureValue>${signatureValue}</ds:SignatureValue>
        </ds:Signature></Invoice>`
      );
      
      return signedXml;
    } catch (error) {
      logger.error('Document signing failed', { error: error.message });
      return xmlDocument; // Return unsigned on error
    }
  }

  async submitToPeppol(document, documentData) {
    const submitData = {
      senderId: this.participantId,
      receiverId: documentData.receiverId,
      documentType: documentData.documentType,
      document: document,
      timestamp: new Date().toISOString()
    };

    const response = await axios.post(`${this.gatewayURL}/submit`, submitData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PEPPOL_API_TOKEN}`
      },
      timeout: 30000
    });

    return response.data;
  }

  async getDeliveryStatus(messageId) {
    try {
      const response = await axios.get(
        `${this.gatewayURL}/messages/${messageId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.PEPPOL_API_TOKEN}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get PEPPOL delivery status', {
        messageId,
        error: error.message
      });
      throw error;
    }
  }

  async validateParticipant(participantId) {
    try {
      const response = await axios.get(
        `${this.gatewayURL}/participants/${participantId}/validate`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.PEPPOL_API_TOKEN}`
          }
        }
      );
      
      return {
        isValid: response.data.valid,
        capabilities: response.data.capabilities,
        lastSeen: response.data.lastSeen
      };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }
}

module.exports = PeppolGateway;