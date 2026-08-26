const db = require('../config/db.js')

exports.getHospitalDepartments = async () => {
  const [rows] = await db.query(
    `SELECT DISTINCT sm.specialty, sm.icon, sm.status
     FROM practitioner p
     JOIN specialty_master sm ON p.department = sm.specialty
     `,
    
  );
  return rows;
};

exports.getDoctorsByDepartment = async (department) => {
  const [rows] = await db.query(
    `SELECT id, PractName, UserName, Designation, Department, OPDFirstVC, OPDRepeatVC, OPDDayLimit, IPVisitC, Admission, Appointment, Billing, Discharge, OPDRegistration, PractPage, Registration,LIS, Pharmacy, PrintSetup, Mobile, email, degree
     FROM practitioner
     WHERE Department = ? `,
    [department]
  );
  return rows;
};