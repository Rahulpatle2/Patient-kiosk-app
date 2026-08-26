import api from './axiosInstance.js'

export const getDepartments = () => 
    api.get('/department/departments');

export const getDoctorsByDepartment = (department) => 
   api.get(`/department/${encodeURIComponent(department)}/doctors`)
