import { createContext, useContext, useState } from 'react';

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [mobile, setMobile] = useState(null);
  const [patientDetails, setPatientDetails] = useState([])
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState(null);
  const [department, setDepartment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [tokenNo, setTokenNo] = useState(null);
  const [encounterId, setEncounterId] = useState(null)
 
  const resetPatientFlow = () => {
    setMobile(null);
    setPatientId(null);
    setPatientName(null);
    setDepartment(null);
    setDoctor(null);
    setTokenNo(null);
    setEncounterId(null)
    setPatientDetails([])
  };

  return (
    <PatientContext.Provider
      value={{
        mobile, setMobile,
        patientId, setPatientId,
        patientName, setPatientName,
        department, setDepartment,
        doctor, setDoctor,
        tokenNo, setTokenNo,
        patientDetails,setPatientDetails,
        encounterId,setEncounterId,
        resetPatientFlow,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};


export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};