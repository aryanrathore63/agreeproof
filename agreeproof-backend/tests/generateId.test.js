const {
  generateAgreementId,
  generateSignatureHash,
  generateProofHash,
  validateEmail
} = require('../src/utils/generateId');

describe('generateId Utility Functions', () => {
  describe('generateAgreementId', () => {
    test('should generate a valid agreement ID format', () => {
      const id = generateAgreementId();
      
      // Should match format: AGP-YYYYMMDD-XXXXXX
      expect(id).toMatch(/^AGP-\d{8}-[A-F0-9]{6}$/);
    });

    test('should generate unique IDs', () => {
      const id1 = generateAgreementId();
      const id2 = generateAgreementId();
      const id3 = generateAgreementId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    test('should include current date in ID', () => {
      const id = generateAgreementId();
      const today = new Date();
      const dateStr = today.getFullYear().toString() +
                      (today.getMonth() + 1).toString().padStart(2, '0') +
                      today.getDate().toString().padStart(2, '0');
      
      expect(id).toContain(`AGP-${dateStr}-`);
    });

    test('should generate IDs with correct length', () => {
      const id = generateAgreementId();
      expect(id.length).toBe(19); // AGP-YYYYMMDD-XXXXXX
    });
  });

  describe('generateSignatureHash', () => {
    test('should generate consistent SHA256 hash for same inputs', () => {
      const agreementId = 'AGP-20240114-ABC123';
      const email = 'test@example.com';
      const timestamp = '2024-01-14T10:30:00.000Z';
      
      const hash1 = generateSignatureHash(agreementId, email, timestamp);
      const hash2 = generateSignatureHash(agreementId, email, timestamp);
      
      expect(hash1).toBe(hash2);
    });

    test('should generate different hashes for different inputs', () => {
      const agreementId = 'AGP-20240114-ABC123';
      const email1 = 'test1@example.com';
      const email2 = 'test2@example.com';
      const timestamp = '2024-01-14T10:30:00.000Z';
      
      const hash1 = generateSignatureHash(agreementId, email1, timestamp);
      const hash2 = generateSignatureHash(agreementId, email2, timestamp);
      
      expect(hash1).not.toBe(hash2);
    });

    test('should generate 64-character hexadecimal hash', () => {
      const hash = generateSignatureHash('AGP-20240114-ABC123', 'test@example.com', '2024-01-14T10:30:00.000Z');
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(hash.length).toBe(64);
    });

    test('should handle empty strings', () => {
      const hash = generateSignatureHash('', '', '');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('generateProofHash', () => {
    test('should generate consistent SHA256 hash for same agreement data', () => {
      const agreementData = {
        agreementId: 'AGP-20240114-ABC123',
        title: 'Test Agreement',
        content: 'This is test content',
        partyA: 'partyA@example.com',
        partyB: 'partyB@example.com',
        timestamp: '2024-01-14T10:30:00.000Z'
      };
      
      const hash1 = generateProofHash(
        agreementData.agreementId,
        agreementData.title,
        agreementData.content,
        agreementData.partyA,
        agreementData.partyB,
        agreementData.timestamp
      );
      
      const hash2 = generateProofHash(
        agreementData.agreementId,
        agreementData.title,
        agreementData.content,
        agreementData.partyA,
        agreementData.partyB,
        agreementData.timestamp
      );
      
      expect(hash1).toBe(hash2);
    });

    test('should generate different hashes for different agreement data', () => {
      const baseData = {
        agreementId: 'AGP-20240114-ABC123',
        title: 'Test Agreement',
        content: 'This is test content',
        partyA: 'partyA@example.com',
        partyB: 'partyB@example.com',
        timestamp: '2024-01-14T10:30:00.000Z'
      };
      
      const hash1 = generateProofHash(
        baseData.agreementId,
        baseData.title,
        baseData.content,
        baseData.partyA,
        baseData.partyB,
        baseData.timestamp
      );
      
      const hash2 = generateProofHash(
        baseData.agreementId,
        'Modified Title', // Different title
        baseData.content,
        baseData.partyA,
        baseData.partyB,
        baseData.timestamp
      );
      
      expect(hash1).not.toBe(hash2);
    });

    test('should generate 64-character hexadecimal hash', () => {
      const hash = generateProofHash(
        'AGP-20240114-ABC123',
        'Test Agreement',
        'Test content',
        'partyA@example.com',
        'partyB@example.com',
        '2024-01-14T10:30:00.000Z'
      );
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(hash.length).toBe(64);
    });

    test('should be case sensitive', () => {
      const hash1 = generateProofHash(
        'AGP-20240114-ABC123',
        'Test Agreement',
        'Test content',
        'PARTYA@example.com',
        'partyB@example.com',
        '2024-01-14T10:30:00.000Z'
      );
      
      const hash2 = generateProofHash(
        'AGP-20240114-ABC123',
        'Test Agreement',
        'Test content',
        'partya@example.com', // Lowercase
        'partyB@example.com',
        '2024-01-14T10:30:00.000Z'
      );
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validateEmail', () => {
    test('should validate valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'firstname.lastname@company.com',
        'email@subdomain.example.com'
      ];
      
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com',
        'test@example.',
        'test@example..com',
        'test space@example.com',
        'test@exa mple.com'
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    test('should handle edge cases', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
      expect(validateEmail(123)).toBe(false);
      expect(validateEmail([])).toBe(false);
      expect(validateEmail({})).toBe(false);
    });

    test('should reject emails with multiple @ symbols', () => {
      expect(validateEmail('test@@example.com')).toBe(false);
      expect(validateEmail('test@exa@mple.com')).toBe(false);
    });

    test('should reject emails without domain extension', () => {
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('test@localhost')).toBe(false);
    });
  });

  describe('Hash Security Properties', () => {
    test('should generate different hashes for similar but different inputs', () => {
      const baseData = {
        agreementId: 'AGP-20240114-ABC123',
        title: 'Test Agreement',
        content: 'This is test content',
        partyA: 'partyA@example.com',
        partyB: 'partyB@example.com',
        timestamp: '2024-01-14T10:30:00.000Z'
      };
      
      // Test single character changes
      const hash1 = generateProofHash(
        baseData.agreementId,
        baseData.title,
        baseData.content,
        baseData.partyA,
        baseData.partyB,
        baseData.timestamp
      );
      
      const hash2 = generateProofHash(
        baseData.agreementId,
        baseData.title + 's', // Add one character
        baseData.content,
        baseData.partyA,
        baseData.partyB,
        baseData.timestamp
      );
      
      expect(hash1).not.toBe(hash2);
      
      // Verify avalanche effect - small change should produce completely different hash
      let matchingChars = 0;
      for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] === hash2[i]) matchingChars++;
      }
      
      // Should have very few matching characters due to avalanche effect
      expect(matchingChars).toBeLessThan(10);
    });
  });
});