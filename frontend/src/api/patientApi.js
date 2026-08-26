import api from './axiosInstance.js'

export const sendOtp = (mobile) => 
    api.post('/patient/send-otp',{mobile});

export const verifyOtp = (mobile, otp) => 
    api.post('/patient/verify-otp',{mobile, otp})

export const registerPatient = (patientData) => 
    api.post('/patient/register', patientData);

export const searchPatient = (mrn, mobile) => 
    api.post('/patient/search-patient', {mrn, mobile})