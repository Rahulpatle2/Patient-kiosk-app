// controllers/department.controller.js
const departmentService = require('../services/department.service');

// select department 

exports.getDepartments = async (req, res, next) => {
  try {
    
    const departments = await departmentService.listDepartments();
    res.status(200).json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
};

exports.getDoctors = async (req, res, next) => {
  try {
  
    const {department} = req.params
  
    const doctors = await departmentService.listDoctorsByDepartment( department)
    res.status(200).json({ success: true, data: doctors})
    console.log("chala")
  } catch (err) {
    next(err)
  }
}


