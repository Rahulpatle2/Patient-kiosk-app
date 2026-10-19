const express = require('express')
const router = express.Router()
const templateController = require('../controllers/formTemplate.controller')


router.get('/:templatename',templateController.getDoctorFormTemplate)
router.post('/additional-info',templateController.saveDoctorsForm)

module.exports = router