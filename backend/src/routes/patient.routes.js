const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

router.post('/send-otp', patientController.sendOtp);
router.post('/verify-otp', patientController.verifyOtp);
router.post('/register', patientController.registerPatient);
router.post('/search-patient', patientController.searchPatient);


module.exports = router;