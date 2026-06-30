const express = require('express');
const authController = require('../controllers/authController');
const programController = require('../controllers/programController');
const userController = require('../controllers/userController');
const clientController = require('../controllers/clientController');
const uploadController = require('../controllers/uploadController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Auth routes
router.post('/auth/register', authController.register); // Disabled for public
router.post('/auth/check-email', authController.checkEmail);
router.post('/auth/login', authController.login);
router.post('/auth/set-password', authMiddleware, authController.setPassword);

// Admin routes
router.post('/admin/users', authMiddleware, adminMiddleware, authController.createUser);
router.get('/admin/users', authMiddleware, adminMiddleware, userController.getAllUsers);
router.get('/admin/users/:id', authMiddleware, adminMiddleware, userController.getAdminUserDetail);
router.put('/admin/users/:id', authMiddleware, adminMiddleware, userController.updateAdminUser);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, userController.deleteAdminUser);
router.get('/admin/programs', authMiddleware, adminMiddleware, programController.getAdminPrograms);
router.get('/admin/programs/:id', authMiddleware, adminMiddleware, programController.getAdminProgramDetail);
router.post('/admin/programs', authMiddleware, adminMiddleware, programController.createProgram);
router.put('/admin/programs/:id', authMiddleware, adminMiddleware, programController.updateProgram);
router.post('/admin/programs/:id/duplicate', authMiddleware, adminMiddleware, programController.duplicateProgram);
router.delete('/admin/programs/:id', authMiddleware, adminMiddleware, programController.deleteProgram);
router.get('/admin/assignments', authMiddleware, adminMiddleware, programController.getAssignments);
router.post('/admin/assignments', authMiddleware, adminMiddleware, programController.createAssignment);
router.get('/admin/assignments/:id', authMiddleware, adminMiddleware, programController.getAdminAssignmentDetail);
router.post('/admin/uploads/program-image', authMiddleware, adminMiddleware, uploadController.uploadProgramImage);

// Client routes
router.get('/client/homepage', authMiddleware, clientController.getHomepage);
router.get('/client/calendar', authMiddleware, clientController.getCalendar);
router.get('/client/progress', authMiddleware, clientController.getProgress);
router.put('/client/profile', authMiddleware, clientController.updateProfile);
router.get('/client/sessions/:id', authMiddleware, clientController.getSession);
router.post('/client/checkins', authMiddleware, clientController.saveDailyCheckin);
router.post('/client/sessions/:id/complete', authMiddleware, clientController.completeSession);

module.exports = router;
