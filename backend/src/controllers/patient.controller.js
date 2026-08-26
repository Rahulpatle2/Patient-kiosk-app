const { findByMrnAndMobile } = require('../models/patient.model');
const otpService = require('../services/otp.service');
const patientService = require('../services/patient.service');

exports.sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    const result = await otpService.sendOtp(mobile);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    const result = await otpService.verifyOtp(mobile, otp);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.registerPatient = async (req, res, next) => {
  try {
    const patient = await patientService.registerPatient(req.body);
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
};

exports.searchPatient = async (req, res, next) => {
  try {
    const {mrn, mobile} = req.body;
    const patient = await patientService.searchPatient(mrn, mobile)
    res.status(200).json(patient)
  } catch (error) {
    next(error)
  }
}