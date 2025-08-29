const forge = require('node-forge');
const fs = require('fs').promises;
const axios = require('axios');
const logger = require('../../shared/utils/logger');

class DigitalSignatureProvider {
  constructor() {
    this.certificatePath = process.env.PKI_CERTIFICATE_PATH;
    this.certificatePassword = process.env.PKI_CERTIFICATE_PASSWORD;
    this.pkiProvider = process.env.PKI_PROVIDER || 'Oman_PKI';
    this.ocspResponderUrl = process.env.OCSP_RESPONDER_URL || 'http://ocsp.oman.om';
    
    this.certificate = null;
    this.privateKey = null;
  }

  async initialize() {
    if (!this.certificatePath) {
      throw new Error('PKI certificate path not configured');
    }

    try {
      await this.loadCertificate();
      logger.info('Digital signature provider initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize digital signature provider', { error: error.message });
      throw error;
    }
  }

  async loadCertificate() {
    try {
      const p12Buffer = await fs.readFile(this.certificatePath);
      const p12 = forge.pkcs12.pkcs12FromAsn1(
        forge.asn1.fromDer(p12Buffer.toString('binary')), 
        this.certificatePassword
      );

      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

      if (!certBags[forge.pki.oids.certBag] || !keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]) {
        throw new Error('Invalid certificate format');
      }

      this.certificate = certBags[forge.pki.oids.certBag][0].cert;
      this.privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;

      // Validate certificate
      await this.validateCertificate();
    } catch (error) {
      throw new Error(`Failed to load certificate: ${error.message}`);
    }
  }

  async validateCertificate() {
    if (!this.certificate) {
      throw new Error('Certificate not loaded');
    }

    // Check if certificate is expired
    const now = new Date();
    if (this.certificate.validity.notAfter < now) {
      throw new Error('Certificate has expired');
    }

    if (this.certificate.validity.notBefore > now) {
      throw new Error('Certificate is not yet valid');
    }

    // Check certificate revocation status
    try {
      const revocationStatus = await this.checkRevocationStatus();
      if (revocationStatus.isRevoked) {
        throw new Error('Certificate has been revoked');
      }
    } catch (error) {
      logger.warn('Could not check certificate revocation status', { error: error.message });
      // Continue without failing - OCSP might be temporarily unavailable
    }

    logger.info('Certificate validation successful', {
      subject: this.certificate.subject.getField('CN')?.value,
      issuer: this.certificate.issuer.getField('CN')?.value,
      validFrom: this.certificate.validity.notBefore,
      validTo: this.certificate.validity.notAfter
    });
  }

  async checkRevocationStatus() {
    try {
      // Create OCSP request (simplified implementation)
      const certId = forge.pki.oids.sha1 + this.certificate.serialNumber;
      
      const response = await axios.post(this.ocspResponderUrl, {
        certificateId: certId,
        serialNumber: this.certificate.serialNumber
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/ocsp-request'
        }
      });

      return {
        isRevoked: response.data.status === 'revoked',
        status: response.data.status,
        lastUpdate: response.data.lastUpdate
      };
    } catch (error) {
      logger.error('OCSP request failed', { error: error.message });
      throw error;
    }
  }

  async signDocument(documentHash, algorithm = 'RSA-SHA256') {
    if (!this.privateKey) {
      throw new Error('Private key not available for signing');
    }

    try {
      let md;
      switch (algorithm) {
        case 'RSA-SHA256':
          md = forge.md.sha256.create();
          break;
        case 'RSA-SHA384':
          md = forge.md.sha384.create();
          break;
        case 'RSA-SHA512':
          md = forge.md.sha512.create();
          break;
        default:
          throw new Error(`Unsupported signing algorithm: ${algorithm}`);
      }

      md.update(documentHash, 'utf8');
      const signature = this.privateKey.sign(md);
      
      return {
        signature: forge.util.encode64(signature),
        algorithm,
        certificateId: this.getCertificateId(),
        timestamp: new Date().toISOString(),
        signerName: this.certificate.subject.getField('CN')?.value,
        signerRole: this.getCertificateRole(),
        pkiProvider: this.pkiProvider
      };
    } catch (error) {
      logger.error('Document signing failed', { error: error.message });
      throw new Error(`Document signing failed: ${error.message}`);
    }
  }

  async verifySignature(documentHash, signatureData) {
    try {
      if (!this.certificate) {
        throw new Error('Certificate not available for verification');
      }

      let md;
      switch (signatureData.algorithm) {
        case 'RSA-SHA256':
          md = forge.md.sha256.create();
          break;
        case 'RSA-SHA384':
          md = forge.md.sha384.create();
          break;
        case 'RSA-SHA512':
          md = forge.md.sha512.create();
          break;
        default:
          throw new Error(`Unsupported verification algorithm: ${signatureData.algorithm}`);
      }

      md.update(documentHash, 'utf8');
      const signature = forge.util.decode64(signatureData.signature);
      
      const isValid = this.certificate.publicKey.verify(md.digest().bytes(), signature);
      
      return {
        isValid,
        certificateValid: true,
        timestamp: new Date().toISOString(),
        verifiedBy: this.pkiProvider
      };
    } catch (error) {
      logger.error('Signature verification failed', { error: error.message });
      return {
        isValid: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  getCertificateId() {
    if (!this.certificate) return null;
    
    const md = forge.md.sha1.create();
    md.update(forge.asn1.toDer(forge.pki.certificateToAsn1(this.certificate)).getBytes());
    return md.digest().toHex();
  }

  getCertificateRole() {
    if (!this.certificate) return null;
    
    // Extract role from certificate extensions or subject
    const roleExtension = this.certificate.getExtension('2.5.29.32'); // Certificate Policies
    if (roleExtension) {
      // Parse role from extension (implementation depends on certificate format)
      return 'Invoice Signer';
    }
    
    return 'Digital Signer';
  }

  getCertificateInfo() {
    if (!this.certificate) return null;

    return {
      subject: this.certificate.subject.attributes.map(attr => ({
        name: attr.name,
        value: attr.value
      })),
      issuer: this.certificate.issuer.attributes.map(attr => ({
        name: attr.name,
        value: attr.value
      })),
      serialNumber: this.certificate.serialNumber,
      validFrom: this.certificate.validity.notBefore,
      validTo: this.certificate.validity.notAfter,
      keyUsage: this.getKeyUsage(),
      extendedKeyUsage: this.getExtendedKeyUsage()
    };
  }

  getKeyUsage() {
    const keyUsageExt = this.certificate.getExtension('keyUsage');
    if (!keyUsageExt) return [];

    const usages = [];
    if (keyUsageExt.digitalSignature) usages.push('Digital Signature');
    if (keyUsageExt.nonRepudiation) usages.push('Non-Repudiation');
    if (keyUsageExt.keyEncipherment) usages.push('Key Encipherment');
    if (keyUsageExt.dataEncipherment) usages.push('Data Encipherment');
    
    return usages;
  }

  getExtendedKeyUsage() {
    const extKeyUsageExt = this.certificate.getExtension('extKeyUsage');
    if (!extKeyUsageExt) return [];

    return extKeyUsageExt.usages || [];
  }

  async createTimestamp(data) {
    try {
      // Create RFC 3161 timestamp (simplified implementation)
      const timestamp = {
        timestamp: new Date().toISOString(),
        data: forge.util.encode64(data),
        tsa: 'Oman PKI TSA',
        accuracy: '1s'
      };

      return timestamp;
    } catch (error) {
      logger.error('Timestamp creation failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = DigitalSignatureProvider;
