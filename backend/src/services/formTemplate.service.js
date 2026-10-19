const formTemplateModel = require('../models/formTemplate.model.js')

exports.getDoctorFormTemplate = async(templatename) =>{
    const rows = await formTemplateModel.getDoctorFormTemplate(templatename)
    // console.log("hello")
    // console.log(rows)

    const map = {};
    for (const r of rows) {
      const f = (map[r.ControlName] ||= {
        id: r.ControlName, label: '', seq: 9999, type: 'label', options: []
      });

      // Label ke alawa jo type mile wahi input type hai
      if (r.ControlType !== 'Label') f.type = r.ControlType.toLowerCase();

      if (r.PropertyName === 'DisplayName') {
        f.label = r.PropertyValue.replace(/:\s*$/, '');
      } else if (r.PropertyName === 'DisplaySeq') {
        f.seq = Math.min(f.seq, Number(r.PropertyValue));  
      } else if (r.PropertyName.startsWith('ListItem')) {
        f.options.push(r.PropertyValue);                  
      }
    }

    const fields = Object.values(map).sort((a, b) => a.seq - b.seq);

    return fields
}

exports.saveDoctorForm = async(patientId,encounterId,values) =>{
  if(!patientId || !encounterId || !values){
    const err = new Error('not found');
    err.statusCode = 404;
    throw err;
  }

  const data = await formTemplateModel.saveDoctorForm(patientId,encounterId,values)
  
  return data
}