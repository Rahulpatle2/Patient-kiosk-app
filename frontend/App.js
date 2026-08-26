import React from 'react'
import './i18n';
import AppNavigator from './src/navigation/AppNavigator'
import {PatientProvider} from './src/context/PatientContext.js'

export default function App() {
  return (
    <PatientProvider>
       <AppNavigator />
    </PatientProvider>
  )
}