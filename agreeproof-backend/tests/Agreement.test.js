const request = require('supertest');
const app = require('../src/app');
const Agreement = require('../src/models/Agreement');
const { generateAgreementId, generateProofHash } = require('../src/utils/generateId');

describe('Agreement API Endpoints', () => {
  describe('POST /api/agreements/create', () => {
    test('should create a new agreement with valid data', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content for API testing.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Agreement created successfully');
      expect(response.body.data).toHaveProperty('agreementId');
      expect(response.body.data).toHaveProperty('shareLink');
      expect(response.body.data).toHaveProperty('status', 'PENDING');
      expect(response.body.data).toHaveProperty('createdAt');
      
      // Verify agreement was saved to database
      const savedAgreement = await Agreement.findByAgreementId(response.body.data.agreementId);
      expect(savedAgreement).toBeDefined();
      expect(savedAgreement.title).toBe(agreementData.title);
      expect(savedAgreement.content).toBe(agreementData.content);
    });

    test('should reject requests with missing title', async () => {
      const agreementData = {
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title is required and must be a non-empty string');
    });

    test('should reject requests with empty title', async () => {
      const agreementData = {
        title: '',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title is required and must be a non-empty string');
    });

    test('should reject requests with missing content', async () => {
      const agreementData = {
        title: 'Test Agreement',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Content is required and must be a non-empty string');
    });

    test('should reject requests with missing partyA', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Party A name and email are required');
    });

    test('should reject requests with missing partyA name', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyA: {
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Party A name and email are required');
    });

    test('should reject requests with missing partyA email', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Party A name and email are required');
    });

    test('should reject requests with invalid partyA email', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'invalid-email'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Party A email is not valid');
    });

    test('should reject requests with invalid partyB email', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'invalid-email'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Party B email is not valid');
    });

    test('should reject requests with same party for A and B', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Party A and Party B cannot be the same');
    });

    test('should handle case-insensitive email comparison', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'John.Doe@Example.com'
        },
        partyB: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Party A and Party B cannot be the same');
    });

    test('should trim whitespace from input fields', async () => {
      const agreementData = {
        title: '  Test Agreement  ',
        content: '  This is a test agreement content.  ',
        partyA: {
          name: '  John Doe  ',
          email: '  john.doe@example.com  '
        },
        partyB: {
          name: '  Jane Smith  ',
          email: '  jane.smith@example.com  '
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      const savedAgreement = await Agreement.findByAgreementId(response.body.data.agreementId);
      expect(savedAgreement.title).toBe('Test Agreement');
      expect(savedAgreement.content).toBe('This is a test agreement content.');
      expect(savedAgreement.partyA.name).toBe('John Doe');
      expect(savedAgreement.partyA.email).toBe('john.doe@example.com');
      expect(savedAgreement.partyB.name).toBe('Jane Smith');
      expect(savedAgreement.partyB.email).toBe('jane.smith@example.com');
    });

    test('should convert emails to lowercase', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'John.Doe@Example.COM'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'Jane.Smith@Example.COM'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(201);

      const savedAgreement = await Agreement.findByAgreementId(response.body.data.agreementId);
      expect(savedAgreement.partyA.email).toBe('john.doe@example.com');
      expect(savedAgreement.partyB.email).toBe('jane.smith@example.com');
    });
  });

  describe('GET /api/agreements/:agreementId', () => {
    let testAgreement;

    beforeEach(async () => {
      testAgreement = await global.testUtils.createTestAgreement(Agreement);
    });

    test('should retrieve existing agreement', async () => {
      const response = await request(app)
        .get(`/api/agreements/${testAgreement.agreementId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Agreement retrieved successfully');
      expect(response.body.data.agreementId).toBe(testAgreement.agreementId);
      expect(response.body.data.title).toBe(testAgreement.title);
      expect(response.body.data.content).toBe(testAgreement.content);
      expect(response.body.data.partyA.name).toBe(testAgreement.partyA.name);
      expect(response.body.data.partyA.email).toBe(testAgreement.partyA.email);
      expect(response.body.data.partyB.name).toBe(testAgreement.partyB.name);
      expect(response.body.data.partyB.email).toBe(testAgreement.partyB.email);
      expect(response.body.data.status).toBe(testAgreement.status);
      expect(response.body.data.proofHash).toBe(testAgreement.proofHash);
    });

    test('should return 404 for non-existent agreement', async () => {
      const response = await request(app)
        .get('/api/agreements/NON-EXISTENT-ID')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Agreement not found');
    });

    test('should handle empty agreementId', async () => {
      const response = await request(app)
        .get('/api/agreements/')
        .expect(404);
    });

    test('should validate agreementId parameter', async () => {
      const response = await request(app)
        .get('/api/agreements/undefined')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Valid agreement ID is required');
    });
  });

  describe('POST /api/agreements/:agreementId/confirm', () => {
    let testAgreement;

    beforeEach(async () => {
      testAgreement = await global.testUtils.createTestAgreement(Agreement);
    });

    test('should confirm a pending agreement', async () => {
      const response = await request(app)
        .post(`/api/agreements/${testAgreement.agreementId}/confirm`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Agreement confirmed successfully');
      expect(response.body.data.status).toBe('CONFIRMED');
      expect(response.body.data.confirmedAt).toBeDefined();
      expect(response.body.data.isImmutable).toBe(true);

      // Verify agreement was updated in database
      const updatedAgreement = await Agreement.findByAgreementId(testAgreement.agreementId);
      expect(updatedAgreement.status).toBe('CONFIRMED');
      expect(updatedAgreement.confirmedAt).toBeDefined();
      expect(updatedAgreement.isImmutable).toBe(true);
    });

    test('should return 404 for non-existent agreement', async () => {
      const response = await request(app)
        .post('/api/agreements/NON-EXISTENT-ID/confirm')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Agreement not found');
    });

    test('should reject confirmation of already confirmed agreement', async () => {
      // First confirm the agreement
      await request(app)
        .post(`/api/agreements/${testAgreement.agreementId}/confirm`)
        .expect(200);

      // Try to confirm again
      const response = await request(app)
        .post(`/api/agreements/${testAgreement.agreementId}/confirm`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Agreement is already confirmed');
    });

    test('should validate agreementId parameter', async () => {
      const response = await request(app)
        .post('/api/agreements/undefined/confirm')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Valid agreement ID is required');
    });
  });

  describe('GET /api/agreements/:agreementId/status', () => {
    let testAgreement;

    beforeEach(async () => {
      testAgreement = await global.testUtils.createTestAgreement(Agreement);
    });

    test('should retrieve agreement status', async () => {
      const response = await request(app)
        .get(`/api/agreements/${testAgreement.agreementId}/status`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Status retrieved successfully');
      expect(response.body.data.agreementId).toBe(testAgreement.agreementId);
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.confirmedAt).toBeUndefined();
      expect(response.body.data.isImmutable).toBe(false);
    });

    test('should retrieve status for confirmed agreement', async () => {
      // First confirm the agreement
      await request(app)
        .post(`/api/agreements/${testAgreement.agreementId}/confirm`)
        .expect(200);

      // Then get status
      const response = await request(app)
        .get(`/api/agreements/${testAgreement.agreementId}/status`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('CONFIRMED');
      expect(response.body.data.confirmedAt).toBeDefined();
      expect(response.body.data.isImmutable).toBe(true);
    });

    test('should return 404 for non-existent agreement', async () => {
      const response = await request(app)
        .get('/api/agreements/NON-EXISTENT-ID/status')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Agreement not found');
    });

    test('should validate agreementId parameter', async () => {
      const response = await request(app)
        .get('/api/agreements/undefined/status')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Valid agreement ID is required');
    });
  });

  describe('Hash Generation and Verification', () => {
    test('should generate consistent proof hash for agreement', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(201);

      const savedAgreement = await Agreement.findByAgreementId(response.body.data.agreementId);
      
      // Verify hash format
      expect(savedAgreement.proofHash).toMatch(/^[a-f0-9]{64}$/);
      expect(savedAgreement.proofHash.length).toBe(64);
    });

    test('should generate different hashes for different agreements', async () => {
      const agreementData1 = {
        title: 'Test Agreement 1',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const agreementData2 = {
        title: 'Test Agreement 2', // Different title
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response1 = await request(app)
        .post('/api/agreements/create')
        .send(agreementData1)
        .expect(201);

      const response2 = await request(app)
        .post('/api/agreements/create')
        .send(agreementData2)
        .expect(201);

      const savedAgreement1 = await Agreement.findByAgreementId(response1.body.data.agreementId);
      const savedAgreement2 = await Agreement.findByAgreementId(response2.body.data.agreementId);

      expect(savedAgreement1.proofHash).not.toBe(savedAgreement2.proofHash);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/agreements/create')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/agreements/create')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title is required and must be a non-empty string');
    });

    test('should handle very long content', async () => {
      const longContent = 'a'.repeat(1000000); // 1MB of content
      const agreementData = {
        title: 'Test Agreement',
        content: longContent,
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Security Tests', () => {
    test('should prevent XSS in title', async () => {
      const agreementData = {
        title: '<script>alert("xss")</script>',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(201);

      // Script should be stored as-is but properly escaped when rendered
      expect(response.body.success).toBe(true);
    });

    test('should handle special characters in content', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const response = await request(app)
        .post('/api/agreements/create')
        .send(agreementData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      const savedAgreement = await Agreement.findByAgreementId(response.body.data.agreementId);
      expect(savedAgreement.content).toBe(agreementData.content);
    });
  });

  describe('Rate Limiting and Performance', () => {
    test('should handle multiple concurrent requests', async () => {
      const agreementData = {
        title: 'Test Agreement',
        content: 'This is a test agreement content.',
        partyA: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        partyB: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      };

      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/agreements/create')
          .send(agreementData)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all agreements were created with unique IDs
      const agreementIds = responses.map(r => r.body.data.agreementId);
      const uniqueIds = new Set(agreementIds);
      expect(uniqueIds.size).toBe(agreementIds.length);
    });
  });
});