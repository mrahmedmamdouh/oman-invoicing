const forge = require('node-forge');

class DigitalSignatureService {
  constructor(certificateRepository) {
    this.certificateRepository = certificateRepository;
  }

  async signInvoice(invoice) {
    try {
      // Get signing certificate (Oman PKI)
      const certificate = await this.getCertificate();
      
      // Create invoice hash
      const invoiceData = this.createInvoiceDigest(invoice);
      
      // Sign the hash
      const signature = this.createDigitalSignature(invoiceData, certificate.privateKey);
      
      return {
        id: uuidv4(),
        invoiceId: invoice.id,
        certificateId: certificate.id,
        signatureValue: signature,
        signatureMethod: 'RSA-SHA256',
        timestamp: new Date(),
        signerName: certificate.subjectName,
        signerRole: certificate.role,
        isValid: true,
        pkiProvider: 'Oman_PKI'
      };
    } catch (error) {
      throw new Error(`Digital signature failed: ${error.message}`);
    }
  }

  createInvoiceDigest(invoice) {
    const digestData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString(),
      customerId: invoice.customerId,
      totalAmount: invoice.totalAmount,
      vatAmount: invoice.vatAmount,
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    };
    
    const dataString = JSON.stringify(digestData);
    const md = forge.md.sha256.create();
    md.update(dataString, 'utf8');
    
    return md.digest().toHex();
  }

  createDigitalSignature(digest, privateKey) {
    const md = forge.md.sha256.create();
    md.update(digest, 'utf8');
    
    const signature = privateKey.sign(md);
    return forge.util.encode64(signature);
  }

  async getCertificate() {
    // In a real implementation, this would retrieve the certificate from
    // Oman PKI infrastructure or local certificate store
    const certificate = await this.certificateRepository.findActive();
    
    if (!certificate) {
      throw new Error('No valid signing certificate found');
    }
    
    return certificate;
  }

  async verifySignature(invoice, signature) {
    try {
      const certificate = await this.certificateRepository.findById(signature.certificateId);
      const digest = this.createInvoiceDigest(invoice);
      
      const md = forge.md.sha256.create();
      md.update(digest, 'utf8');
      
      const decodedSignature = forge.util.decode64(signature.signatureValue);
      const isValid = certificate.publicKey.verify(md.digest().bytes(), decodedSignature);
      
      return {
        isValid,
        certificateStatus: await this.checkCertificateStatus(certificate),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async checkCertificateStatus(certificate) {
    // Check certificate revocation status with Oman PKI
    // This would integrate with OCSP (Online Certificate Status Protocol)
    return 'valid'; // Simplified implementation
  }
}

module.exports = {
  InvoiceService,
  TaxService,
  PeppolService,
  DigitalSignatureService
};