import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import WelcomeScreen from '../screens/WelcomeScreen'
import VerifyMobileScreen from '../screens/VerifyMobileScreen'
import VerifyOTPScreen from '../screens/VerifyOTPScreen'
import PatientInfoScreen from '../screens/PatientInfoScreen'
import SelectDepartmentScreen from '../screens/SelectDepartmentScreen'
import SelectDoctorScreen from '../screens/SelectDoctorScreen'
import AppointmentConfirmedScreen from '../screens/AppointmentConfirmedScreen'
import PatientLookupScreen from '../screens/PatientLookupScreen'
import PatientProfileScreen from '../screens/PatientProfileScreen'
import ComingSoonScreen from '../screens/ComingSoonScreen'

const Stack = createStackNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="VerifyMobile" component={VerifyMobileScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="PatientInfo" component={PatientInfoScreen} />
        <Stack.Screen name="SelectDepartment" component={SelectDepartmentScreen} />
        <Stack.Screen name="SelectDoctor" component={SelectDoctorScreen} />
        <Stack.Screen name="AppointmentConfirmed" component={AppointmentConfirmedScreen} />
        <Stack.Screen name="PatientLookupScreen" component={PatientLookupScreen}/>
        <Stack.Screen name="PatientProfile" component={PatientProfileScreen} />
        <Stack.Screen name="ComingSoonScreen" component={ComingSoonScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}