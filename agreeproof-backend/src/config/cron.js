const cron = require('node-cron');
const EnhancedAgreement = require('../models/EnhancedAgreement');
const { emailService } = require('./email');

/**
 * Cron Job Scheduler for AgreeProof
 * Handles automated reminders and system maintenance tasks
 */

class CronScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Initialize all cron jobs
  initialize() {
    if (this.isRunning) {
      console.log('⏰ Cron scheduler already running');
      return;
    }

    console.log('🚀 Initializing cron scheduler...');
    
    // Schedule agreement reminders (runs daily at 9 AM)
    this.scheduleAgreementReminders();
    
    // Schedule overdue agreement checks (runs daily at 10 AM)
    this.scheduleOverdueChecks();
    
    // Schedule system cleanup (runs weekly on Sunday at 2 AM)
    this.scheduleSystemCleanup();
    
    // Schedule email service health check (runs every 6 hours)
    this.scheduleEmailHealthCheck();
    
    this.isRunning = true;
    console.log('✅ Cron scheduler initialized successfully');
  }

  // Schedule agreement reminders
  scheduleAgreementReminders() {
    const job = cron.schedule('0 9 * * *', async () => {
      console.log('📅 Running agreement reminder job...');
      await this.sendAgreementReminders();
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set('agreementReminders', job);
    job.start();
    console.log('⏰ Agreement reminders scheduled for daily 9 AM');
  }

  // Schedule overdue agreement checks
  scheduleOverdueChecks() {
    const job = cron.schedule('0 10 * * *', async () => {
      console.log('🔍 Running overdue agreement check job...');
      await this.checkOverdueAgreements();
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set('overdueChecks', job);
    job.start();
    console.log('⏰ Overdue checks scheduled for daily 10 AM');
  }

  // Schedule system cleanup
  scheduleSystemCleanup() {
    const job = cron.schedule('0 2 * * 0', async () => {
      console.log('🧹 Running system cleanup job...');
      await this.performSystemCleanup();
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set('systemCleanup', job);
    job.start();
    console.log('⏰ System cleanup scheduled for weekly Sunday 2 AM');
  }

  // Schedule email health check
  scheduleEmailHealthCheck() {
    const job = cron.schedule('0 */6 * * *', async () => {
      console.log('📧 Running email health check...');
      await this.checkEmailHealth();
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set('emailHealthCheck', job);
    job.start();
    console.log('⏰ Email health check scheduled for every 6 hours');
  }

  // Send agreement reminders
  async sendAgreementReminders() {
    try {
      const today = new Date();
      const reminderDate = new Date(today);
      reminderDate.setDate(today.getDate() + 3); // 3 days from now

      // Find agreements that need reminders
      const agreementsNeedingReminders = await EnhancedAgreement.find({
        status: 'CONFIRMED',
        dueDate: {
          $gte: today,
          $lte: reminderDate
        },
        'reminderSettings.enabled': true,
        'reminderSettings.lastSent': { 
          $lt: new Date(today.getTime() - 24 * 60 * 60 * 1000) // Not sent in last 24 hours
        }
      }).populate('createdBy', 'email');

      console.log(`Found ${agreementsNeedingReminders.length} agreements needing reminders`);

      for (const agreement of agreementsNeedingReminders) {
        try {
          // Calculate days remaining
          const daysRemaining = Math.ceil((new Date(agreement.dueDate) - today) / (1000 * 60 * 60 * 24));
          
          // Send reminder email
          await emailService.sendAgreementReminder(agreement);
          
          // Update last sent timestamp
          agreement.reminderSettings.lastSent = new Date();
          await agreement.save();
          
          console.log(`✅ Reminder sent for agreement ${agreement.agreementId} (${daysRemaining} days remaining)`);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Failed to send reminder for agreement ${agreement.agreementId}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error in agreement reminder job:', error);
    }
  }

  // Check overdue agreements
  async checkOverdueAgreements() {
    try {
      const today = new Date();
      
      // Find confirmed agreements that are overdue
      const overdueAgreements = await EnhancedAgreement.find({
        status: 'CONFIRMED',
        dueDate: { $lt: today }
      }).populate('createdBy', 'email');

      console.log(`Found ${overdueAgreements.length} overdue agreements`);

      for (const agreement of overdueAgreements) {
        try {
          // Update status to overdue
          agreement.status = 'OVERDUE';
          await agreement.save();
          
          console.log(`⚠️ Agreement ${agreement.agreementId} marked as overdue`);
          
          // Send overdue notification (optional - can be enabled based on preferences)
          if (agreement.reminderSettings.enabled) {
            await emailService.sendEmail(
              agreement.partyB.contact,
              'agreementReminder',
              {
                partyBName: agreement.partyB.name,
                title: agreement.title,
                agreementId: agreement.agreementId,
                amount: agreement.amount,
                dueDate: agreement.dueDate,
                paymentType: agreement.paymentType,
                daysRemaining: 0,
                content: agreement.content,
                viewLink: `${process.env.FRONTEND_URL}/a/${agreement.agreementId}`
              }
            );
          }
          
        } catch (error) {
          console.error(`❌ Failed to process overdue agreement ${agreement.agreementId}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error in overdue check job:', error);
    }
  }

  // Perform system cleanup
  async performSystemCleanup() {
    try {
      console.log('🧹 Starting system cleanup...');
      
      // Clean up old mock data if using mock database
      const { isUsingMock, mockDB } = require('./db');
      if (isUsingMock()) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        // Remove old mock agreements
        const oldAgreements = mockDB.agreements.filter(
          agreement => new Date(agreement.createdAt) < thirtyDaysAgo
        );
        
        mockDB.agreements = mockDB.agreements.filter(
          agreement => new Date(agreement.createdAt) >= thirtyDaysAgo
        );
        
        console.log(`🗑️ Cleaned up ${oldAgreements.length} old mock agreements`);
      }
      
      // Log system stats
      const totalAgreements = await EnhancedAgreement.countDocuments();
      const pendingAgreements = await EnhancedAgreement.countDocuments({ status: 'PENDING' });
      const confirmedAgreements = await EnhancedAgreement.countDocuments({ status: 'CONFIRMED' });
      const paidAgreements = await EnhancedAgreement.countDocuments({ status: 'PAID' });
      const overdueAgreements = await EnhancedAgreement.countDocuments({ status: 'OVERDUE' });
      
      console.log('📊 System Statistics:');
      console.log(`   Total Agreements: ${totalAgreements}`);
      console.log(`   Pending: ${pendingAgreements}`);
      console.log(`   Confirmed: ${confirmedAgreements}`);
      console.log(`   Paid: ${paidAgreements}`);
      console.log(`   Overdue: ${overdueAgreements}`);
      
      console.log('✅ System cleanup completed');
      
    } catch (error) {
      console.error('❌ Error in system cleanup job:', error);
    }
  }

  // Check email service health
  async checkEmailHealth() {
    try {
      const result = await emailService.testEmail();
      
      if (result.success) {
        console.log(`✅ Email service healthy (${result.service})`);
      } else {
        console.error(`❌ Email service unhealthy: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Error in email health check:', error);
    }
  }

  // Stop all cron jobs
  stop() {
    console.log('🛑 Stopping cron scheduler...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ Cron scheduler stopped');
  }

  // Get job status
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      jobs: []
    };
    
    this.jobs.forEach((job, name) => {
      status.jobs.push({
        name,
        running: job.running || false,
        nextDate: job.nextDate()?.toISOString() || null
      });
    });
    
    return status;
  }

  // Manually trigger a job (for testing)
  async triggerJob(jobName) {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job '${jobName}' not found`);
    }
    
    console.log(`🔄 Manually triggering job: ${jobName}`);
    
    switch (jobName) {
      case 'agreementReminders':
        await this.sendAgreementReminders();
        break;
      case 'overdueChecks':
        await this.checkOverdueAgreements();
        break;
      case 'systemCleanup':
        await this.performSystemCleanup();
        break;
      case 'emailHealthCheck':
        await this.checkEmailHealth();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
    
    console.log(`✅ Job '${jobName}' completed`);
  }
}

// Create and export scheduler instance
const cronScheduler = new CronScheduler();

// Auto-start scheduler in production
if (process.env.NODE_ENV === 'production') {
  cronScheduler.initialize();
}

module.exports = {
  cronScheduler,
  CronScheduler
};