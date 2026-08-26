const opdEncounterModel = require('../models/opdEncounter.model');

exports.registerPatientToDoctor = async ({ patientId, doctor, department }) => {
  if (!patientId || !doctor || !department) {
    const err = new Error('Patient ID, doctor and department are required');
    err.statusCode = 400;
    throw err;
  }

  
  const tokenNo = await opdEncounterModel.getNextTokenNo(doctor);

  const encounter = await opdEncounterModel.createEncounter({
    patientId,
    doctor,
    department,
    tokenNo
  });

  return encounter;
};