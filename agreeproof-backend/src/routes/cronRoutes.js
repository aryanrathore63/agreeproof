const express = require('express');
const cronController = require('../controllers/cronController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/cron/status
 * @desc    Get status of all cron jobs
 * @access  Private (Admin only)
 */
router.get('/status', auth, cronController.getCronStatus);

/**
 * @route   POST /api/cron/start
 * @desc    Start all cron jobs
 * @access  Private (Admin only)
 */
router.post('/start', auth, cronController.startCronJobs);

/**
 * @route   POST /api/cron/stop
 * @desc    Stop all cron jobs
 * @access  Private (Admin only)
 */
router.post('/stop', auth, cronController.stopCronJobs);

/**
 * @route   POST /api/cron/trigger/reminders
 * @desc    Manually trigger daily reminders
 * @access  Private (Admin only)
 */
router.post('/trigger/reminders', auth, cronController.triggerDailyReminders);

/**
 * @route   POST /api/cron/trigger/overdue
 * @desc    Manually trigger overdue check
 * @access  Private (Admin only)
 */
router.post('/trigger/overdue', auth, cronController.triggerOverdueCheck);

/**
 * @route   GET /api/cron/email/health
 * @desc    Get email service health status
 * @access  Private (Admin only)
 */
router.get('/email/health', auth, cronController.getEmailHealth);

/**
 * @route   POST /api/cron/email/test
 * @desc    Send test email
 * @access  Private (Admin only)
 */
router.post('/email/test', auth, cronController.sendTestEmail);

module.exports = router;