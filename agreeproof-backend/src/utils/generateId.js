const crypto = require('crypto');

/**
 * Generate a unique agreement ID
 * Format: AGP-YYYYMMDD-RANDOM(6)
 * @returns {string} Unique agreement ID
 */
const generateAgreementId = () => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
                  (date.getMonth() + 1).toString().padStart(2, '0') +
                  date.getDate().toString().padStart(2, '0');
  
  // Generate 6 character random string
  const randomBytes = crypto.randomBytes(3);
  const randomStr = randomBytes.toString('hex').toUpperCase();
  
  return `AGP-${dateStr}-${randomStr}`;
};

/**
 * Generate a unique signature hash for verification
 * @param {string} agreementId - The agreement ID
 * @param {string} email - The signer's email
 * @param {string} timestamp - The timestamp of signing
 * @returns {string} SHA-256 hash
 */
const generateSignatureHash = (agreementId, email, timestamp) => {
  const data = `${agreementId}:${email}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate SHA256 proof hash for agreement verification
 * @param {string} agreementId - The agreement ID
 * @param {string} title - The agreement title
 * @param {string} content - The agreement content
 * @param {string} partyA - Party A email
 * @param {string} partyB - Party B email
 * @param {string} timestamp - Creation timestamp
 * @returns {string} SHA-256 hash
 */
const generateProofHash = (agreementId, title, content, partyA, partyB, timestamp) => {
  const data = `${agreementId}:${title}:${content}:${partyA}:${partyB}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const validateEmail = (email) => {
  // Handle non-string inputs
  if (typeof email !== 'string') {
    return false;
  }
  
  // More strict email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // First check basic format
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Additional checks for edge cases
  // Reject consecutive dots in domain
  if (email.includes('..')) {
    return false;
  }
  
  // Reject domain starting with dot
  if (email.includes('@.')) {
    return false;
  }
  
  // Reject domain ending with dot
  if (email.endsWith('.')) {
    return false;
  }
  
  return true;
};

module.exports = {
  generateAgreementId,
  generateSignatureHash,
  generateProofHash,
  validateEmail
};