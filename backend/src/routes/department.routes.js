const express = require('express')
const router = express.Router()
const departmentController = require('../controllers/department.controller.js')

router.get('/departments',departmentController.getDepartments)
router.get('/:department/doctors', departmentController.getDoctors)

module.exports = router