const db = require('../config/db.js')

exports.getDoctorFormTemplate = async(templatename) => {
    const [rows] = await db.query(`SELECT ControlName, ControlType, PropertyName, PropertyValue From templatetable
WHERE TemplateName = ? AND (PropertyName IN ('DisplayName', 'DisplaySeq') OR PropertyName LIKE 'ListItem%')
ORDER BY TemplateId`, [templatename])

return rows;
}

exports.saveDoctorForm = async(patientId, encounterId, values) =>{
    const MODULE = 'OPD Visit', ENC_TYPE = 'OP', SUBMODULE = 'Additional Info';

    const entries =  Object.entries(values).filter(([, v]) => v !== '' && v != null);
    if (!entries.length) return res.json({ saved: 0 });

    const [rows] = await db.query(`INSERT INTO additional_info_tr_table
        (module, SubModule, PatientID, EncounterID, EncounterType,
         Field, LabelID, Data, DateStamp, UpdateStatus)
       VALUES ?`,[entries.map(([field, data]) => [
        MODULE, SUBMODULE, patientId, encounterId, ENC_TYPE,
        field, `Panel1.${field}.Text`, String(data), new Date(), 'N'
      ])])
    return rows
}