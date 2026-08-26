const patientModel = require('../models/patient.model');

exports.registerPatient = async (patientData) => {
  const existing = await patientModel.findByMobile(patientData.mobile);

  if (existing) {
    const err = new Error('User already exists. Please go to another counter.');
    err.statusCode = 409; // Conflict - industry standard status code isके liye
    throw err;
  }

  return await patientModel.create(patientData);
};

exports.searchPatient = async(mrn, mobile) => {
  const patient = await patientModel.findByMrnAndMobile(mrn, mobile);

  if(!patient){
    return null
  }
  return patient;
}