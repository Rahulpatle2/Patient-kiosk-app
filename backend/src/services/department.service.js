// services/department.service.js
const departmentModel = require('../models/department.model');

exports.listDepartments = async () => {
  

  const departments = await departmentModel.getHospitalDepartments();

  if (departments.length === 0) {
    const err = new Error('No departments found for this hospital');
    err.statusCode = 404;
    throw err;
  }

  return departments;
};

exports.listDoctorsByDepartment = async (department) => {
  if(!department){
    const err = new Error("Invalid hospitalId or departmentId")
    err.statusCode = 400
    throw err;
  }

  const doctors = await departmentModel.getDoctorsByDepartment(department);

  if(doctors.length === 0) {
    const err = new Error('No doctors found for this department')
    err.statusCode = 404
  }

  return doctors
}