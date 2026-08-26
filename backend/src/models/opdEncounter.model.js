const db = require('../config/db');


exports.getNextTokenNo = async (doctor) => {
  const [rows] = await db.query(
    `SELECT MAX(TokenNo) as maxToken FROM opdencounter 
     WHERE Doctor = ? AND DATE(DateOfOPD) = CURDATE()`,
    [doctor]
  );
  return (rows[0].maxToken || 0) + 1;
};


exports.createEncounter = async ({ patientId, doctor, department, tokenNo }) => {
  const [result] = await db.query(
    `INSERT INTO opdencounter 
     (PatientID, DateOfOPD, Doctor, Department, DateStamp, UserStamp, Status, TokenNo, visitstatus, visittype)
     VALUES (?, NOW(), ?, ?, NOW(), 'kiosk', 'Waiting', ?, 'Waiting', 'Walk-in')`,
    [patientId, doctor, department, tokenNo]
  );

  return {
    opEncounterId: result.insertId,
    patientId,
    doctor,
    department,
    tokenNo,
    status: 'Waiting'
  };
};