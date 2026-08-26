const opdEncounterService = require('../services/opdEncounter.service');

exports.registerToDoctor = async (req, res, next) => {
  try {
    
    const { patientId, doctor, department } = req.body;

    const encounter = await opdEncounterService.registerPatientToDoctor({
      patientId,
      doctor,
      department
    });

    res.status(201).json({ success: true, data: encounter });
  } catch (err) {
    next(err);
  }
};