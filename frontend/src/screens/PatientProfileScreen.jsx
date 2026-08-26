import { StyleSheet, Text, View, Pressable, Image, ScrollView } from 'react-native'
import React from 'react'
import { usePatient } from '../context/PatientContext'
import { registerToDoctor } from '../api/opdApi'

// ─── Progress Steps ───────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Mobile Number',       icon: require('../assets/iPhone 14.png'),                    subLabel: '+91 98765 43210' },
  { id: 2, label: 'Verification',        icon: require('../assets/Instagram Verification Badge.png'), subLabel: 'Verified Successfully' },
  { id: 3, label: 'Patient Lookup',      icon: require('../assets/Person.png'),                       subLabel: 'Profile Found' },
  { id: 4, label: 'Department Selection',icon: require('../assets/Department.png'),                   subLabel: 'Choose department' },
  { id: 5, label: 'Confirmation',        icon: require('../assets/Task Completed.png'),               subLabel: 'Review & Confirm' },
]

const CURRENT_STEP = 3

// ─── Helper — DOB se age calculate karna ───────────────────
const calculateAge = (dobString) => {
  if (!dobString) return '—'
  const dob = new Date(dobString)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return `${age} Years`
}

// ─── Helper — DOB ko readable format mein dikhana ──────────
const formatDob = (dobString) => {
  if (!dobString) return '—'
  const date = new Date(dobString)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PatientProfileScreen({ navigation }) {

  const { patientDetails, patientId } = usePatient()

  // agar kisi wajah se context mein data nahi mila
  if (!patientDetails) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 40, fontSize: 16 }}>No patient data found. Please go back and search again.</Text>
      </View>
    )
  }

  const p = patientDetails

  const fullName = [p.PtFName, p.PtMName, p.PtSName].filter(Boolean).join(' ')

  const handleConfirm = () => {
    navigation.navigate('SelectDepartment')
  }

  return (
    <View style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('../assets/back-arrow.png')} style={styles.backIcon} resizeMode="contain" />
          </Pressable>
        </View>
        <Image source={require('../assets/balaji-logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.secureBadge}>
          <Image source={require('../assets/secure-icon.png')} style={styles.secureIcon} resizeMode="contain" />
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
                      : <Text style={[styles.stepNumber, isCurrent && { color: '#ffffff' }]}>{step.id}</Text>
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

        {/* ── MAIN CONTENT ── */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentInner}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Patient Header ── */}
          <View style={styles.patientHeader}>
            <Image source={require('../assets/Person.png')} style={styles.avatar} resizeMode="cover" />
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{fullName}</Text>
              <Text style={styles.patientMeta}>MRN: {p.PatientID}  •  {calculateAge(p.DOB)}  •  {p.Gender}</Text>
            </View>
          </View>

          {/* ── 2 Column Row ── */}
          <View style={styles.twoCol}>

            {/* Left Column */}
            <View style={styles.leftCol}>

              {/* Personal & Medical Info */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Personal & Medical Information</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>DATE OF BIRTH</Text>
                    <Text style={styles.infoValue}>{formatDob(p.DOB)}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>GENDER</Text>
                    <Text style={styles.infoValue}>{p.Gender || '—'}</Text>
                  </View>
                </View>
              </View>

              {/* Contact Information */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Contact Information</Text>
                <View style={styles.contactList}>
                  <View style={styles.contactItem}>
                    <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
                    <Text style={styles.infoValue}>{p.email || '—'}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Text style={styles.infoLabel}>MOBILE NUMBER</Text>
                    <Text style={styles.infoValue}>+91 {p.mobile || '—'}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Text style={styles.infoLabel}>RESIDENTIAL ADDRESS</Text>
                    <Text style={styles.infoValue}>{p.Address || '—'}{p.City ? `, ${p.City}` : ''}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.confirmRow}>
                <View style={styles.confirmLeft}>
                  <Image source={require('../assets/secure-icon.png')} style={styles.confirmIcon} resizeMode="contain" />
                  <View>
                    <Text style={styles.confirmTitle}>Correct Patient Verified?</Text>
                    <Text style={styles.confirmSub}>Confirm details before proceeding to department selection.</Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmButtonPressed]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirm & Continue →</Text>
                </Pressable>
              </View>

            </View>

            {/* Right Column */}
            <View style={styles.rightCol}>
            </View>

          </View>

        </ScrollView>

      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.footerLangActive}>
            <Image source={require('../assets/Globe.png')} style={styles.footerIcon} resizeMode="contain" />
            <Text style={[styles.footerText, { color: '#00A4A4' }]}>English</Text>
          </View>
          <Text style={styles.footerDivider}>|</Text>
          <Text style={styles.footerText}>हिंदी</Text>
          <Text style={styles.footerDivider}>|</Text>
          <Text style={styles.footerText}>मराठी</Text>
        </View>
        <View style={styles.needHelpBox}>
          <Image source={require('../assets/headset-icon.png')} style={styles.needHelpIcon} resizeMode="cover" />
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

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 2 },
  headerLeft: { width: '20%' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 150, height: 50 },
  logo: { width: 500, height: 80 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#00A4A4', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  secureIcon: { width: 20, height: 20 },
  secureText: { fontSize: 16, fontWeight: '500', color: '#485260' },

  body: { flex: 1, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5, gap: 16 },

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
  quickFillBox: { gap: 10, borderWidth: 0.3, borderRadius: 8, borderColor: '#73737340', backgroundColor: '#ffffff', padding: 11 },
  quickFillTitle: { fontWeight: '600', color: '#00A4A4', fontSize: 13 },
  quickFillItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0.1, borderRadius: 3, borderColor: '#73737340', padding: 12 },
  quickFillIcon: { width: 28, height: 28 },
  quickFillItemText: { color: '#001532', fontSize: 13, fontWeight: '600' },
  quickFillItemSub: { color: '#737373', fontSize: 11 },
  sidebarNote: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sidebarNoteIcon: { height: 18, width: 18 },
  sidebarNoteText: { fontSize: 11, color: '#485260' },

  mainContent: { flex: 1 },
  mainContentInner: { gap: 16, paddingBottom: 20 },

  patientHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
  avatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#00A4A4' },
  patientInfo: { gap: 4 },
  patientName: { fontSize: 24, fontWeight: '700', color: '#001532' },
  patientMeta: { fontSize: 13, fontWeight: '500', color: '#737373' },

  twoCol:   { flexDirection: 'row', gap: 16 },
  leftCol:  { flex: 1, gap: 16 },
  rightCol: { flex: 1, gap: 16 },

  card: { borderWidth: 1, borderColor: '#73737326', borderRadius: 12, padding: 16, gap: 12, backgroundColor: '#F9FFFF' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#001532' },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { fontSize: 12, fontWeight: '600', color: '#00A4A4' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  infoItem: { width: '45%', gap: 2 },
  infoLabel: { fontSize: 10, fontWeight: '600', color: '#737373', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#001532' },

  contactList: { gap: 12 },
  contactItem: { gap: 2 },

  visitItem: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#73737326' },
  visitDate:  { width: 44, height: 44, backgroundColor: '#00A4A420', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  visitMonth: { fontSize: 9,  fontWeight: '700', color: '#00A4A4', textAlign: 'center' },
  visitDay:   { fontSize: 16, fontWeight: '700', color: '#001532', textAlign: 'center' },
  visitInfo:  { flex: 1, gap: 2 },
  visitTitle: { fontSize: 13, fontWeight: '700', color: '#001532' },
  visitSub:   { fontSize: 11, color: '#737373' },

  emergencyCard: { backgroundColor: '#003C44', borderRadius: 12, padding: 16, gap: 10 },
  emergencyTitle: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  emergencySub:   { fontSize: 11, color: '#ffffffaa' },
  emergencyInfo:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  emergencyLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emergencyAvatar:{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#00A4A4' },
  emergencyName:  { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  emergencyPhone: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#00A4A440', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  emergencyCallIcon: { width: 18, height: 18 },
  emergencyPhoneText:{ fontSize: 12, fontWeight: '600', color: '#ffffff' },

  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#00A4A440', borderRadius: 12, padding: 16, backgroundColor: '#F9FFFF' },
  confirmLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  confirmIcon: { width: 28, height: 28 },
  confirmTitle: { fontSize: 15, fontWeight: '700', color: '#001532' },
  confirmSub:   { fontSize: 12, color: '#485260',width:'80%' },
  confirmButton: { backgroundColor: '#00A4A4', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 28 },
  confirmButtonPressed: { opacity: 0.8 },
  confirmButtonText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },

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