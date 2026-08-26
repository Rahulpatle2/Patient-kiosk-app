const db = require('../config/db');

exports.findByMobile = async (mobile) => {
  const [rows] = await db.query('SELECT * FROM registration WHERE mobile = ?', [mobile]);
  return rows[0];
};

exports.findByMrnAndMobile = async (mrn, mobile) => {
  const [rows] = await db.query(
    'SELECT * FROM registration WHERE PatientID = ? AND mobile = ?',
    [mrn, mobile]
  );
  return rows[0] || null; 
};

exports.create = async (patientData) => {
  const { PtFName, PtMName, PtSName, Address, city, Phone, mobile, Gender, DOB, email} = patientData;
  const [result] = await db.query(
    'INSERT INTO registration (PtFName, PtMName, PtSName, Address, city, Phone, mobile, Gender, DOB, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [PtFName, PtMName, PtSName, Address, city, Phone, mobile, Gender, DOB, email]
  );
  return { id: result.insertId, ...patientData };
};