const formTemplateService = require('../services/formTemplate.service.js');

exports.getDoctorFormTemplate = async (req, res, next) => {
  try {
    const { templatename } = req.params;       
    const fields = await formTemplateService.getDoctorFormTemplate(templatename);
    res.status(200).json({ success: true, data: fields });  
    console.log("kaisa") 
  } catch (error) {
    next(error);
    console.log("kaisa nhi chala")
  }
};

exports.saveDoctorsForm = async (req, res, next) => {
  try {
    const { patientId, encounterId, values, userStamp } = req.body;

    if (!patientId || !encounterId || !values || typeof values !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'patientId, encounterId and values are required',
      });
    }

    const saved = await formTemplateService.saveDoctorForm(
      patientId, encounterId, values, userStamp
    );
    res.status(201).json({ success: true, data: { saved }, message: 'form saved successfully' });
    console.log("accha")
  } catch (error) {
    next(error);
    console.log("kaisa nahi chala 2")
  }
};