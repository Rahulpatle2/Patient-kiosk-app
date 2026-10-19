import {getDoctorForm} from './src/api/additionalFormApi.js'
const toTemplateName = (name = '') =>
  'opd_additional_' +
  name
    .trim()
    .toLowerCase()
    .replace(/^dr\.?\s+/, '')            // "Dr." prefix hatao (agar template name mein dr_ chahiye to ye line hata do)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

const result = await getDoctorForm("opd_additional_rahul_patle")
console.log(toTemplateName("Dr. Rahul Patle"))
console.log(toTemplateName("rahul Patle"))
console.log(toTemplateName("Dr. Kiran Ghabhane"))
console.log(result )