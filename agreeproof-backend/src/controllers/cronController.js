const cron = require('node-cron');
const emailService = require('../config/email');
const EnhancedAgreement = require('../models/EnhancedAgreement');

// Store active cron jobs
const activeJobs = new Map();

/**
 * Start all scheduled tasks
 */
const startAllTasks = () => {
  console.log('🕐 Starting scheduled tasks...');
  
  // Daily reminder check at 9:00 AM
  const dailyReminderJob = cron.schedule('0 9 * * *', async () => {
    console.log('📧 Running daily reminder check...');
    await sendDailyReminders();
  }, {
    scheduled: false,
    timezone: 'Asia/Kolkata'
  });

  // Weekly overdue check every Monday at 10:00 AM
  const weeklyOverdueJob = cron.schedule('0 10 * * 1', async () => {
    console.log('⚠️ Running weekly overdue check...');
    await checkOverdueAgreements();
  }, {
    scheduled: false,
    timezone: 'Asia/Kolkata'
  });

  // System cleanup every Sunday at 2:00 AM
  const cleanupJob = cron.schedule('0 2 * * 0', async () => {
    console.log('🧹 Running system cleanup...');
    await performSystemCleanup();
  }, {
    scheduled: false,
    timezone: 'Asia/Kolkata'
  });

  // Email health check every 6 hours
  const healthCheckJob = cron.schedule('0 */6 * * *', async () => {
    console.log('🏥 Running email health check...');
    await performHealthCheck();
  }, {
    scheduled: false,
    timezone: 'Asia/Kolkata'
  });

  // Store jobs
  activeJobs.set('dailyReminder', dailyReminderJob);
  activeJobs.set('weeklyOverdue', weeklyOverdueJob);
  activeJobs.set('cleanup', cleanupJob);
  activeJobs.set('healthCheck', healthCheckJob);

  // Start all jobs
  activeJobs.forEach((job, name) => {
    job.start();
    console.log(`✅ Started cron job: ${name}`);
  });

  console.log(`🎯 ${activeJobs.size} scheduled tasks started successfully`);
};

/**
 * Stop all scheduled tasks
 */
const stopAllTasks = () => {
  console.log('🛑 Stopping all scheduled tasks...');
  
  activeJobs.forEach((job, name) => {
    job.stop();
    console.log(`⏹️ Stopped cron job: ${name}`);
  });
  
  activeJobs.clear();
  console.log('✅ All scheduled tasks stopped');
};

/**
 * Send daily reminders for due and upcoming payments
 */
const sendDailyReminders = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Find agreements that need reminders
    const agreementsNeedingReminders = await EnhancedAgreement.find({
      status: { $in: ['pending', 'partial'] },
      'payment.reminders.enabled': true,
      $or: [
        // Due today or overdue
        { 'payment.dueDate': { $lte: today } },
        // Due tomorrow
        { 'payment.dueDate': { $gte: today, $lte: tomorrow } },
        // Due next week (for weekly reminders)
        { 
          'payment.dueDate': { $gte: tomorrow, $lte: nextWeek },
          'payment.reminders.frequency': 'weekly'
        }
      ]
    }).populate('createdBy', 'name email');

    console.log(`📊 Found ${agreementsNeedingReminders.length} agreements needing reminders`);

    let sentCount = 0;
    let failedCount = 0;

    for (const agreement of agreementsNeedingReminders) {
      try {
        await emailService.sendAgreementReminder(agreement);
        sentCount++;
        
        // Update last reminder sent
        agreement.payment.reminders.lastSent = new Date();
        await agreement.save();
        
        console.log(`✅ Reminder sent for agreement ${agreement.agreementId}`);
      } catch (error) {
        failedCount++;
        console.error(`❌ Failed to send reminder for ${agreement.agreementId}:`, error);
      }
    }

    console.log(`📈 Daily reminder summary: ${sentCount} sent, ${failedCount} failed`);
    
    return {
      total: agreementsNeedingReminders.length,
      sent: sentCount,
      failed: failedCount
    };
  } catch (error) {
    console.error('❌ Error in daily reminder task:', error);
    throw error;
  }
};

/**
 * Check for overdue agreements and send notifications
 */
const checkOverdueAgreements = async () => {
  try {
    const today = new Date();
    
    // Find overdue agreements
    const overdueAgreements = await EnhancedAgreement.find({
      status: { $in: ['pending', 'partial'] },
      'payment.dueDate': { $lt: today }
    }).populate('createdBy', 'name email');

    console.log(`⚠️ Found ${overdueAgreements.length} overdue agreements`);

    let notifiedCount = 0;
    let failedCount = 0;

    for (const agreement of overdueAgreements) {
      try {
        await emailService.sendOverdueNotification(agreement);
        notifiedCount++;
        console.log(`🚨 Overdue notification sent for agreement ${agreement.agreementId}`);
      } catch (error) {
        failedCount++;
        console.error(`❌ Failed to send overdue notification for ${agreement.agreementId}:`, error);
      }
    }

    console.log(`📈 Overdue check summary: ${notifiedCount} notified, ${failedCount} failed`);
    
    return {
      total: overdueAgreements.length,
      notified: notifiedCount,
      failed: failedCount
    };
  } catch (error) {
    console.error('❌ Error in overdue check task:', error);
    throw error;
  }
};

/**
 * Perform system cleanup tasks
 */
const performSystemCleanup = async () => {
  try {
    console.log('🧹 Starting system cleanup...');
    
    // Example cleanup tasks:
    // 1. Remove old mock data (if needed)
    // 2. Archive very old completed agreements
    // 3. Clean up temporary files
    // 4. Update statistics
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Archive old completed agreements
    const archivedCount = await EnhancedAgreement.updateMany(
      {
        status: 'paid',
        'payment.paymentDate': { $lt: thirtyDaysAgo }
      },
      { $set: { archived: true } }
    );
    
    console.log(`📦 Archived ${archivedCount.modifiedCount} old completed agreements`);
    
    return {
      archived: archivedCount.modifiedCount,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('❌ Error in system cleanup task:', error);
    throw error;
  }
};

/**
 * Perform health check on email service
 */
const performHealthCheck = async () => {
  try {
    console.log('🏥 Starting email service health check...');
    
    const healthStatus = await emailService.getHealthStatus();
    
    if (healthStatus.status === 'healthy') {
      console.log('✅ Email service is healthy');
    } else {
      console.warn('⚠️ Email service has issues:', healthStatus);
    }
    
    return healthStatus;
  } catch (error) {
    console.error('❌ Error in health check task:', error);
    throw error;
  }
};

/**
 * Get status of all cron jobs
 */
exports.getCronStatus = (req, res) => {
  try {
    const jobStatus = Array.from(activeJobs.entries()).map(([name, job]) => ({
      name,
      running: job.running || false,
      scheduled: job.scheduled || false,
      nextExecution: job.nextDates ? job.nextDates().toString() : null
    }));

    res.status(200).json({
      success: true,
      data: {
        totalJobs: activeJobs.size,
        jobs: jobStatus,
        systemTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting cron status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cron job status'
    });
  }
};

/**
 * Start all cron jobs
 */
exports.startCronJobs = (req, res) => {
  try {
    if (activeJobs.size > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cron jobs are already running'
      });
    }

    startAllTasks();

    res.status(200).json({
      success: true,
      message: 'All cron jobs started successfully',
      data: {
        jobsStarted: activeJobs.size,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error starting cron jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start cron jobs'
    });
  }
};

/**
 * Stop all cron jobs
 */
exports.stopCronJobs = (req, res) => {
  try {
    if (activeJobs.size === 0) {
      return res.status(400).json({
        success: false,
        message: 'No cron jobs are currently running'
      });
    }

    const jobCount = activeJobs.size;
    stopAllTasks();

    res.status(200).json({
      success: true,
      message: 'All cron jobs stopped successfully',
      data: {
        jobsStopped: jobCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error stopping cron jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop cron jobs'
    });
  }
};

/**
 * Manually trigger daily reminders
 */
exports.triggerDailyReminders = async (req, res) => {
  try {
    console.log('🔄 Manually triggering daily reminders...');
    const result = await sendDailyReminders();
    
    res.status(200).json({
      success: true,
      message: 'Daily reminders triggered successfully',
      data: result
    });
  } catch (error) {
    console.error('Error triggering daily reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger daily reminders'
    });
  }
};

/**
 * Manually trigger overdue check
 */
exports.triggerOverdueCheck = async (req, res) => {
  try {
    console.log('🔄 Manually triggering overdue check...');
    const result = await checkOverdueAgreements();
    
    res.status(200).json({
      success: true,
      message: 'Overdue check triggered successfully',
      data: result
    });
  } catch (error) {
    console.error('Error triggering overdue check:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger overdue check'
    });
  }
};

/**
 * Get email service health status
 */
exports.getEmailHealth = async (req, res) => {
  try {
    const healthStatus = await emailService.getHealthStatus();
    
    res.status(200).json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    console.error('Error getting email health status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email health status'
    });
  }
};

/**
 * Send test email
 */
exports.sendTestEmail = async (req, res) => {
  try {
    const { to, type } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required'
      });
    }

    let result;
    switch (type) {
      case 'reminder':
        result = await emailService.sendTestEmail(to, 'reminder');
        break;
      case 'confirmation':
        result = await emailService.sendTestEmail(to, 'confirmation');
        break;
      case 'payment':
        result = await emailService.sendTestEmail(to, 'payment');
        break;
      default:
        result = await emailService.sendTestEmail(to, 'test');
    }

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
};

// Export functions for external use
exports.startAllTasks = startAllTasks;
exports.stopAllTasks = stopAllTasks;
exports.sendDailyReminders = sendDailyReminders;
exports.checkOverdueAgreements = checkOverdueAgreements;
exports.performSystemCleanup = performSystemCleanup;
exports.performHealthCheck = performHealthCheck;