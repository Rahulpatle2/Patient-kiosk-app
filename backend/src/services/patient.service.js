const patientModel = require('../models/patient.model');


exports.registerPatient = async (patientData) => {
  const existing = await patientModel.findByMobile(patientData.mobile, patientData.PtFName);

  if (existing) {
    return existing
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