import { StyleSheet, Text, View, Pressable, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import { usePatient } from '../context/PatientContext.js'
import { searchPatient } from '../api/patientApi.js'

// ─── Progress Steps ───────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Mobile Number',       icon: require('../assets/iPhone 14.png'),          subLabel: '+91 98765 43210' },
  { id: 2, label: 'Patient Lookup',      icon: require('../assets/Search-active.png'),       subLabel: 'Provide lookup details' },
  { id: 3, label: 'Patient Profile',     icon: require('../assets/Profile-icon-inactive.png'), subLabel: 'Patient Profile' },
  { id: 4, label: 'Department Selection',icon: require('../assets/Department.png'),          subLabel: 'Select your department' },
  { id: 5, label: 'Confirmation',        icon: require('../assets/Task Completed.png'),      subLabel: 'Review & Confirm' },
]

const CURRENT_STEP = 2

export default function PatientLookupScreen({ navigation }) {

  const [mrn, setMrn]       = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // ─── Context ──────────────────────────────────────────────
  const { mobile, setMobile, setPatientDetails, setPatientId } = usePatient()
  console.log(mobile)
  console.log(mrn)
  // ─── Handler ──────────────────────────────────────────────
  const handleSave = async () => {

   
    if (!mrn || !mobile) {
  setError('Please enter both MRN Number and Registered Mobile Number')
  return
}

    setLoading(true)
    setError('')

    try {
      const response = await searchPatient(mrn, mobile)
      console.log(response)
      console.log("This is my res data ",response.data)
      const patient = response.data
      console.log(patient)

      // Context mein store karo
      setPatientDetails(patient)
      setPatientId(patient.PatientID)
      

      // Patient profile screen pe navigate karo
      navigation.navigate('PatientProfile', { patient })

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Patient not found. Please check details and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/back-arrow.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <Image
          source={require('../assets/balaji-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.secureBadge}>
          <Image
            source={require('../assets/secure-icon.png')}
            style={styles.secureIcon}
            resizeMode="contain"
          />
          <Text style={styles.secureText}>Secure • Private • Trusted</Text>
        </View>
      </View>

      {/* ── BODY ── */}
      <View style={styles.body}>

        {/* ── SIDEBAR ── */}
        <View style={styles.sidebar}>
          <View style={{ rowGap: 10 }}>
            <Text style={styles.sidebarTitle}>Registration Progress</Text>
            {STEPS.map((step, index) => {
              const isCompleted = step.id < CURRENT_STEP
              const isCurrent   = step.id === CURRENT_STEP
              return (
                <View key={step.id} style={styles.stepRow}>

                  <View style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isCurrent   && styles.stepCircleCurrent,
                  ]}>
                    {isCompleted
                      ? <Text style={styles.stepCheck}>✓</Text>
                      : <Text style={[styles.stepNumber, isCurrent && { color: '#ffffff' }]}>
                          {step.id}
                        </Text>
                    }
                  </View>

                  <Image style={styles.stepIcon} source={step.icon} resizeMode="contain" />

                  <View>
                    <Text style={[
                      styles.stepLabel,
                      isCompleted && styles.stepLabelCompleted,
                      isCurrent   && styles.stepLabelCurrent,
                    ]}>
                      {step.label}
                    </Text>
                    <Text style={styles.stepSubLabel}>{step.subLabel}</Text>
                  </View>

                  {index < STEPS.length - 1 && (
                    <View style={[styles.connector, isCompleted && styles.connectorCompleted]} />
                  )}

                </View>
              )
            })}
          </View>

          {/* Bottom Note */}
          <View style={styles.sidebarNote}>
            <Image style={styles.sidebarNoteIcon} source={require('../assets/Light.png')} resizeMode="contain" />
            <Text style={styles.sidebarNoteText}>Secure • Fast • Paperless Registration</Text>
          </View>
        </View>

        {/* ── FORM AREA ── */}
        <View style={styles.formArea}>

          <Text style={styles.formTitle}>Patient Information</Text>
          <Text style={styles.formSubtitle}>
            Please provide accurate details for seamless registration.
          </Text>

          <View style={styles.formContent}>

            {/* MRN Number */}
            <View style={styles.fieldWrapper}>
              <View style={styles.fieldHeader}>
                <Image
                  source={require('../assets/Person.png')}
                  style={styles.fieldIcon}
                  resizeMode="contain"
                />
                <Text style={styles.fieldLabel}>MRN Number</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter Patient MRN Number"
                placeholderTextColor="#737373"
                value={mrn}
                onChangeText={(text) => {
                  setMrn(text)
                  setError('')
                }}
                keyboardType="default"
              />
            </View>

           
            {/* Registered Mobile Number */}
            <View style={styles.fieldWrapper}>
              <View style={styles.fieldHeader}>
                <Image
                  source={require('../assets/Call.png')}
                  style={styles.fieldIcon}
                  resizeMode="contain"
                />
                <Text style={styles.fieldLabel}>Registered Mobile Number</Text>
              </View>
              <View style={styles.mobileInputRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <View style={styles.mobileDivider} />
                <TextInput
                  style={styles.mobileInput}
                  placeholder="9123456789"
                  placeholderTextColor="#737373"
                  value={mobile || ''}
                  onChangeText={(text) => {
                    setMobile(text)
                    setError('')
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️  {error}</Text>
              </View>
            ) : null}

            {/* Save Button */}
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
                loading && { opacity: 0.6 },
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Searching...' : 'Save & Continue →'}
              </Text>
            </Pressable>

          </View>

        </View>

        {/* ── RIGHT SIDE ── */}
        <View style={styles.rightSide}>
          <Image
            source={require('../assets/registration-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <View style={styles.safetyNote}>
            <Image
              source={require('../assets/secure-icon.png')}
              style={styles.safetyIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.safetyTitle}>Your Data is safe with us</Text>
              <Text style={styles.safetyText}>We comply with national data protection standards.</Text>
            </View>
          </View>
        </View>

      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.footerLangActive}>
            <Image
              source={require('../assets/Globe.png')}
              style={styles.footerIcon}
              resizeMode="contain"
            />
            <Text style={[styles.footerText, { color: '#00A4A4' }]}>English</Text>
          </View>
          <Text style={styles.footerDivider}>|</Text>
          <Text style={styles.footerText}>हिंदी</Text>
          <Text style={styles.footerDivider}>|</Text>
          <Text style={styles.footerText}>मराठी</Text>
        </View>

        <View style={styles.needHelpBox}>
          <Image
            source={require('../assets/headset-icon.png')}
            style={styles.needHelpIcon}
            resizeMode="cover"
          />
          <View>
            <Text style={[styles.footerText, { color: '#000000' }]}>Need Help?</Text>
            <Text style={styles.needHelpSub}>Tap for assistance</Text>
          </View>
        </View>
      </View>

    </View>
  )
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#ffffff' },

  // ── Header ──
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 2 },
  headerLeft: { width: '20%' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 150, height: 50 },
  logo: { width: 500, height: 80 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#00A4A4', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  secureIcon: { width: 20, height: 20 },
  secureText: { fontSize: 16, fontWeight: '500', color: '#485260' },

  // ── Body ──
  body: { flex: 1, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5, gap: 16 },

  // ── Sidebar ──
  sidebar: { width: 'auto', paddingVertical: 20, paddingHorizontal: 16, backgroundColor: '#F9FFFF', borderRadius: 16, borderWidth: 1, borderColor: '#00A4A420', gap: 15 },
  sidebarTitle: { fontSize: 14, fontWeight: '700', color: '#001532', marginBottom: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, position: 'relative', paddingVertical: 6 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#73737340', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  stepCircleCompleted: { backgroundColor: '#00A4A4', borderColor: '#00A4A4' },
  stepCircleCurrent:   { backgroundColor: '#00A4A4', borderColor: '#00A4A4' },
  stepNumber: { fontSize: 12, fontWeight: '600', color: '#737373' },
  stepCheck:  { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  stepIcon:   { width: 29, height: 29 },
  stepLabel:  { fontSize: 15, fontWeight: '500', color: '#737373' },
  stepLabelCompleted: { color: '#00A4A4', fontWeight: '600' },
  stepLabelCurrent:   { color: '#001532', fontWeight: '700' },
  stepSubLabel: { fontSize: 12, color: '#737373' },
  connector: { position: 'absolute', left: 13, top: 34, width: 0.5, height: 40, backgroundColor: '#73737340' },
  connectorCompleted: { backgroundColor: '#00A4A4' },

  // Sidebar Note
  sidebarNote: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sidebarNoteIcon: { height: 18, width: 18 },
  sidebarNoteText: { fontSize: 11, color: '#485260' },

  // ── Form Area ──
  formArea: { flex: 1, paddingHorizontal: 10 },
  formTitle:    { fontSize: 24, fontWeight: '700', color: '#001532', marginBottom: 4 },
  formSubtitle: { fontSize: 14, fontWeight: '400', color: '#485260', marginBottom: 24 },
  formContent:  { gap: 20, width: '50%' },

  // Field
  fieldWrapper: { gap: 8 },
  fieldHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldIcon:    { width: 22, height: 22 },
  fieldLabel:   { fontSize: 15, fontWeight: '600', color: '#001532' },

  // Input
  input: {
    borderWidth: 1,
    borderColor: '#73737340',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#001532',
    backgroundColor: '#ffffff',
  },

  // OR Divider
  orDivider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orLine:    { flex: 1, height: 1, backgroundColor: '#73737326' },
  orText:    { fontSize: 13, fontWeight: '600', color: '#737373' },

  // Mobile Input
  mobileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00A4A4',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  countryCode:     { justifyContent: 'center' },
  countryCodeText: { fontSize: 18, fontWeight: '700', color: '#001532' },
  mobileDivider:   { width: 1, height: 30, backgroundColor: '#737373' },
  mobileInput:     { flex: 1, fontSize: 18, fontWeight: '500', color: '#001532', outlineStyle: 'none' },

  // Error
  errorBox: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFBBBB', borderRadius: 8, padding: 12 },
  errorText: { fontSize: 13, color: '#A11D1D', fontWeight: '500' },

  // Save Button
  saveButton: { backgroundColor: '#00A4A4', borderRadius: 12, paddingVertical: 18, alignItems: 'center' },
  saveButtonPressed: { opacity: 0.8 },
  saveButtonText: { fontSize: 18, fontWeight: '700', color: '#ffffff' },

  // ── Right Side ──
  rightSide: { width: 500, justifyContent: 'center', alignItems: 'center', gap: 20 },
  illustration: { width: '100%', height: 320 },
  safetyNote: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#00A4A440', borderRadius: 12, padding: 16, backgroundColor: '#F9FFFF' },
  safetyIcon:  { width: 28, height: 28 },
  safetyTitle: { fontSize: 14, fontWeight: '700', color: '#001532' },
  safetyText:  { fontSize: 12, color: '#485260' },

  // ── Footer ──
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 20 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  footerLangActive: { flexDirection: 'row', alignItems: 'center', columnGap: 6 },
  footerIcon: { width: 24, height: 24 },
  footerText: { fontSize: 19, fontWeight: '700', color: '#000000' },
  footerDivider: { fontSize: 24, color: '#73737366' },
  needHelpBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffffff', paddingHorizontal: 17, paddingVertical: 9, borderRadius: 10 },
  needHelpIcon: { width: 35, height: 35 },
  needHelpSub: { fontSize: 12, fontWeight: '500' },
})