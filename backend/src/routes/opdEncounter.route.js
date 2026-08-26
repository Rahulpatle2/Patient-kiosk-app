const express = require('express');
const router = express.Router();
const opdEncounterController = require('../controllers/opdEncounter.controller');

router.post('/book', opdEncounterController.registerToDoctor);

module.exports = router;