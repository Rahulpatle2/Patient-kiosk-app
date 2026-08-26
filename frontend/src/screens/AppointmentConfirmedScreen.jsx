import { StyleSheet, Text, View, Pressable, Image, ScrollView } from 'react-native'
import React from 'react'

// Fallback Doctor Image
const DEFAULT_DOCTOR_IMAGE = 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'

// ─── Progress Steps ───────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Mobile Number',        icon: require('../assets/iPhone 14.png'),                    subLabel: '+91 98765 43210' },
  { id: 2, label: 'Verification',         icon: require('../assets/Instagram Verification Badge.png'), subLabel: 'Verified Successfully' },
  { id: 3, label: 'Patient Information',  icon: require('../assets/Person.png'),                       subLabel: 'Details Saved' },
  { id: 4, label: 'Department Selection', icon: require('../assets/Department (1).png'),               subLabel: 'Department Selected' },
  { id: 5, label: 'Doctor Selection',     icon: require('../assets/Doctor Male.png'),                  subLabel: 'Doctor Selected' },
  { id: 6, label: 'Confirmation',         icon: require('../assets/Task Completed (1).png'),           subLabel: 'Review & Confirm' },
]

const CURRENT_STEP = 6

export default function AppointmentConfirmedScreen({ navigation, route }) {
  const { department, doctor, bookingDetails, bookingData } = route.params || {}

  // ─── Extract Booking Details from API Response ──────────────
  const opdInfo = bookingDetails?.data || bookingDetails || bookingData?.data || bookingData || {}

  // Token Number (e.g. Token #1 ya formatted Token)
  const tokenNumber = opdInfo?.tokenNo ? `T-${opdInfo.tokenNo}` : 'T-01'

  // Current Date/Time Formatting
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const appointmentTime = `${formattedDate}\n${today.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`

  // Doctor & Department Info
  const doctorName = opdInfo?.doctor || doctor?.PractName || doctor?.name || 'Doctor'
  const doctorDept = opdInfo?.department || (typeof department === 'object' ? department?.name || department?.Department : department) || 'General'
  const doctorQual = doctor?.degree || doctor?.qualification || doctor?.Designation || 'Consultant'
  const doctorImage = doctor?.photo ? { uri: doctor.photo } : (typeof doctor?.photo === 'number' ? doctor.photo : { uri: DEFAULT_DOCTOR_IMAGE })

  // ─── Handlers ─────────────────────────────────────────────
  const handleFinish = () => {
    navigation.navigate('Welcome')
  }

  const handlePrint = () => {
    console.log('Print Slip for Encounter:', opdInfo?.opEncounterId)
  }

  const handleWhatsApp = () => {
    console.log('Send on WhatsApp')
  }

  const handleSMS = () => {
    console.log('Send on SMS')
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

          {/* Need Help */}
          <View style={styles.needHelpSidebar}>
            <Image source={require('../assets/headset-icon.png')} style={styles.needHelpSidebarIcon} resizeMode="contain" />
            <View>
              <Text style={styles.needHelpSidebarText}>Need Help?</Text>
              <Text style={styles.needHelpSidebarSub}>Tap for Assistance</Text>
            </View>
          </View>  
        </View>

        {/* ── MAIN CONTENT ── */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentInner}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Confirmed Heading ── */}
          <View style={styles.confirmedHeading}>
            <Image source={require('../assets/Checkmark.png')} style={styles.confirmedIcon} resizeMode="contain" />
            <View>
              <Text style={styles.confirmedTitle}>Appointment Confirmed</Text>
              <Text style={styles.confirmedSubtitle}>Thank you. Your appointment has been successfully booked</Text>
            </View>
          </View>

          {/* ── Info + QR Row ── */}
          <View style={styles.infoQrRow}>

            {/* Left — Token + Time + Doctor */}
            <View style={styles.infoCards}>

              {/* Token Number */}
              <View style={styles.infoCard}>
                <Image source={require('../assets/token-icon.png')} style={styles.infoCardIcon} resizeMode="contain" />
                <View>
                  <Text style={styles.infoCardLabel}>Your Token Number</Text>
                  <Text style={styles.tokenNumber}>{tokenNumber}</Text>
                  <Text style={styles.infoCardSub}>Status: {opdInfo?.status || 'Waiting'}</Text>
                </View>
              </View>

              {/* Appointment Time */}
              <View style={styles.infoCard}>
                <Image source={require('../assets/appointment-time-icon.png')} style={styles.infoCardIcon} resizeMode="contain" />
                <View>
                  <Text style={styles.infoCardLabel}>Appointment Time</Text>
                  <Text style={styles.infoCardValue}>{appointmentTime}</Text>
                </View>
              </View>

              {/* Doctor */}
              <View style={styles.infoCard}>
                <Image source={doctorImage} style={styles.doctorPhoto} resizeMode="cover" />
                <View>
                  <Text style={styles.infoCardLabel}>Doctor</Text>
                  <Text style={styles.doctorName}>{doctorName}</Text>
                  <Text style={styles.doctorSpecialty}>{doctorDept}</Text>
                  <Text style={styles.doctorQual}>{doctorQual}</Text>
                </View>
              </View>

            </View>

            {/* Right — QR + What's Next */}
            <View style={styles.rightCol}>

              {/* QR Code */}
              <View style={styles.qrBox}>
                <Text style={styles.qrTitle}>Show this QR code at the reception</Text>
                <Image style={{ width: 150, height: 150 }} source={require('../assets/Qr Code (1).png')} resizeMode="contain" />
              </View>

              {/* What's Next */}
              <View style={styles.whatsNextBox}>
                <View style={styles.whatsNextHeader}>
                  <Image source={require('../assets/whatsnext-icon.png')} style={styles.whatsNextIcon} resizeMode="contain" />
                  <Text style={styles.whatsNextTitle}>What's Next ?</Text>
                </View>
                <Text style={styles.whatsNextText}>
                  Please report to {doctorDept} Department {'\n'}
                  15 minutes before your appointment time.
                </Text>
              </View>

            </View>

          </View>

          {/* ── Action Buttons ── */}
          <View style={styles.actionsRow}>

            <Pressable style={styles.actionBtn} onPress={handlePrint}>
              <Image source={require('../assets/print-icon.png')} style={styles.actionIcon} resizeMode="contain" />
              <View>
                <Text style={styles.actionText}>Print Slip</Text>
                <Text style={styles.actionSub}>Get your appointment slip</Text>
              </View>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={handleWhatsApp}>
              <Image source={require('../assets/whatsapp-icon.png')} style={styles.actionIcon} resizeMode="contain" />
              <View>
                <Text style={styles.actionText}>Send on WhatsApp</Text>
                <Text style={styles.actionSub}>Get details on your phone</Text>
              </View>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={handleSMS}>
              <Image source={require('../assets/sms-icon.png')} style={styles.actionIcon} resizeMode="contain" />
              <View>
                <Text style={styles.actionText}>Send on SMS</Text>
                <Text style={styles.actionSub}>Get details on your phone</Text>
              </View>
            </Pressable>

          </View>

          {/* ── Bottom Row ── */}
          <View style={styles.bottomRow}>
            <Pressable onPress={() => navigation.navigate('Welcome')}>
              <Text style={styles.cancelText}>✕ Cancel Registration</Text>
            </Pressable>

            <Pressable style={styles.finishButton} onPress={handleFinish}>
              <Image source={require('../assets/Task Completed.png')} style={styles.finishIcon} resizeMode="contain" />
              <Text style={styles.finishButtonText}>Finish — Return to Home</Text>
            </Pressable>
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

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 2 },
  headerLeft: { width: '20%' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 150, height: 50 },
  logo: { width: 500, height: 80 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#00A4A4', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  secureIcon: { width: 20, height: 20 },
  secureText: { fontSize: 16, fontWeight: '500', color: '#485260' },

  // Body
  body: { flex: 1, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 0, gap: 16 },

  // Sidebar
  sidebar: { width: 'auto', paddingVertical: 20, paddingHorizontal: 16, backgroundColor: '#F9FFFF', borderRadius: 16, borderWidth: 1, borderColor: '#00A4A420', gap: 30 },
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
  needHelpSidebar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#73737326', borderRadius: 10, padding: 12, backgroundColor: '#ffffff' },
  needHelpSidebarIcon: { width: 40, height: 40 },
  needHelpSidebarText: { fontSize: 18, fontWeight: '700', color: '#001532' },
  needHelpSidebarSub:  { fontSize: 16, color: '#737373' },

  // Main Content
  mainContent: { flex: 1, paddingHorizontal: 60 },
  mainContentInner: { gap: 20, paddingBottom: 20 },

  // Confirmed Heading
  confirmedHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  confirmedIcon:    { width: 40, height: 40 },
  confirmedTitle:   { fontSize: 28, fontWeight: '700', color: '#001532' },
  confirmedSubtitle:{ fontSize: 14, fontWeight: '400', color: '#485260' },

  // Info + QR Row
  infoQrRow: { flexDirection: 'row', gap: 16 },

  // Info Cards
  infoCards: { flex: 1, gap: 12, width: '50%', paddingRight: 80 },
  infoCard: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#73737326',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FFFF',
  },
  infoCardIcon:  { width: 40, height: 40 },
  infoCardLabel: { fontSize: 13, fontWeight: '500', color: '#737373' },
  infoCardValue: { fontSize: 16, fontWeight: '700', color: '#001532' },
  infoCardSub:   { fontSize: 12, color: '#737373' },
  tokenNumber:   { fontSize: 24, fontWeight: '700', color: '#00A4A4' },
  doctorPhoto:   { width: 50, height: 50, borderRadius: 25 },
  doctorName:    { fontSize: 18, fontWeight: '700', color: '#001532' },
  doctorSpecialty:{ fontSize: 14, fontWeight: '600', color: '#00A4A4' },
  doctorQual:    { fontSize: 12, color: '#737373' },

  // Right Column
  rightCol: { flex: 1, width: 280, gap: 16 },

  // QR Box
  qrBox: { borderWidth: 1, borderColor: '#73737326', borderRadius: 12, padding: 16, alignItems: 'center', gap: 12, backgroundColor: '#F9FFFF' },
  qrTitle: { fontSize: 13, fontWeight: '500', color: '#485260', textAlign: 'center' },

  // What's Next
  whatsNextBox: { borderWidth: 1, borderColor: '#00A4A440', borderRadius: 12, padding: 16, backgroundColor: '#F9FFFF', gap: 8 },
  whatsNextHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whatsNextIcon:   { width: 20, height: 20 },
  whatsNextTitle:  { fontSize: 15, fontWeight: '700', color: '#001532' },
  whatsNextText:   { fontSize: 13, fontWeight: '400', color: '#485260', lineHeight: 20 },

  // Action Buttons
  actionsRow: { flexDirection: 'row', gap: 16 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#73737326',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FFFF',
  },
  actionIcon: { width: 32, height: 32 },
  actionText: { fontSize: 14, fontWeight: '700', color: '#001532' },
  actionSub:  { fontSize: 12, color: '#737373' },

  // Bottom Row
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '500', color: '#A11D1D' },
  finishButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#00A4A4', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32 },
  finishIcon:   { width: 20, height: 20 },
  finishButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 0 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  footerLangActive: { flexDirection: 'row', alignItems: 'center', columnGap: 6 },
  footerIcon: { width: 24, height: 24 },
  footerText: { fontSize: 19, fontWeight: '700', color: '#000000' },
  footerDivider: { fontSize: 24, color: '#73737366' },
  needHelpBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffffff', paddingHorizontal: 17, paddingVertical: 9, borderRadius: 10 },
  needHelpIcon: { width: 35, height: 35 },
  needHelpSub: { fontSize: 12, fontWeight: '500' },
})