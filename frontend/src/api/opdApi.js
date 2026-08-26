import api from './axiosInstance.js'

export const registerToDoctor = (patientId, doctor, department) => 
    api.post('/opdencounter/book', {patientId, doctor, department})