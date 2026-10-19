const express = require('express');
const app = express();
const patientRoutes = require('./routes/patient.routes.js');
const errorHandler = require('./middlewares/errorHandler.js');
const departmentRoutes = require('./routes/department.routes.js');
const cors = require('cors')
const opdEncounterRoutes = require('./routes/opdEncounter.route.js')
const formTemplateRoutes = require('./routes/formTemplate.routes.js')

app.use(express.json());
app.use(cors())
app.use('/api/patient', patientRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/opdencounter', opdEncounterRoutes);
app.use('/api/formtemplate',formTemplateRoutes)


app.use(errorHandler); // hamesha sabse last mein

module.exports = app;