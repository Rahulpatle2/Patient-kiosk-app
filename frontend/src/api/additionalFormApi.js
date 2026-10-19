import api from './axiosInstance.js';

export const getDoctorForm = (templateName) =>
  api.get(`/formtemplate/${encodeURIComponent(templateName)}`);  //api is working 

export const submitDoctorForm = (patientId, encounterId, values, userStamp) =>
  api.post('/formtemplate/additional-info', { patientId, encounterId, values, userStamp });  