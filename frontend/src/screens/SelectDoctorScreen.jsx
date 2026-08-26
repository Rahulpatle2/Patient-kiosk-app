import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Image, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native'
import CalendarPicker from '../components/CalendarPicker'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getDoctorsByDepartment } from '../api/departmentApi.js'
import { registerToDoctor } from '../api/opdApi.js'
import { usePatient } from '../context/PatientContext.js'

const DEFAULT_DOCTOR_IMAGE = 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'

const STEPS = [
  { id: 1, labelKey: 'registration_progress.mobile_number',        icon: require('../assets/iPhone 14.png'),                    subLabel: '+91 98765 43210' },
  { id: 2, labelKey: 'registration_progress.verification',         icon: require('../assets/Instagram Verification Badge.png'), subLabelKey: 'registration_progress.verified_successfully' },
  { id: 3, labelKey: 'registration_progress.patient_information',  icon: require('../assets/Person.png'),                       subLabelKey: 'registration_progress.please_provide_details' },
  { id: 4, labelKey: 'registration_progress.department_selection', icon: require('../assets/Department (1).png'),               subLabelKey: 'registration_progress.select_your_department' },
  { id: 5, labelKey: 'registration_progress.doctor_selection',     icon: require('../assets/Doctor Male.png'),                  subLabelKey: 'registration_progress.choose_your_doctor' },
  { id: 6, labelKey: 'registration_progress.confirmation',         icon: require('../assets/Task Completed.png'),               subLabelKey: 'registration_progress.review_and_confirm' },
]

const CURRENT_STEP = 5

export default function SelectDoctorScreen({ navigation }) {
  const { department, patientId, setDoctor } = usePatient()
  
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { i18n, t } = useTranslation()

  console.log(department)
  console.log(department.specialty)
  console.log(doctors)

  // ─── Fetch Doctors List ─────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      // const targetDepartment = typeof department === 'object' ? department?.name || department?.id : department
      
      // if (!targetDepartment) {
      //   setLoading(false)
      //   return
      // }

      try {
        setLoading(true)
        setError(null)
        const response = await getDoctorsByDepartment(department.specialty)
        console.log(department.specialty)
        console.log("mera resposne",response)
        console.log(response?.data?.data)
        setDoctors(response?.data?.data)
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setError(t('common.error_loading_data') || 'Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [department])

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // ─── Doctor Card Select Handler ─────────────────────────────
  const handleSelectDoctor = (doctor) => {
    setSelected(doctor)
    if (setDoctor) {
      setDoctor(doctor)
    }
  }

  // ─── Confirm Booking & Register OPD ────────────────────────
 const handleBook = async () => {
  if (!selected) return

  // Doctor name aur clean Department string extract karein
  const doctorName = selected.PractName 
  console.log(doctorName)
  const deptName = department.specialty
  console.log(deptName)
  console.log(patientId)
  
  try {
    setBookingLoading(true)
    
    // API Call
    const response = await registerToDoctor(patientId, doctorName, deptName)

    if (response?.data?.success || response?.status === 200 || response?.status === 201) {
      navigation.navigate('AppointmentConfirmed', {
        department: deptName,
        doctor: selected,
        bookingDetails: response.data,
      })
    } else {
      Alert.alert('Booking Failed', response?.data?.message || 'Failed to complete registration')
    }
  } catch (err) {
    console.error('Error booking doctor:', err)
    Alert.alert('Error', err?.response?.data?.message || 'Server error while booking')
  } finally {
    setBookingLoading(false)
  }
}
  const langColor = (code) =>
    i18n.language === code ? '#00A4A4' : '#000000'

  const filteredDoctors = doctors.filter((doc) => {
    const query = search.toLowerCase()
    const name = (doc.PractName || '').toLowerCase()
    const dept = (doc.Department || '').toLowerCase()
    const designation = (doc.Designation || '').toLowerCase()
    return name.includes(query) || dept.includes(query) || designation.includes(query)
  })

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
          <Text style={styles.secureText}>{t('common.secure_badge')}</Text>
        </View>
      </View>

      {/* ── BODY ── */}
      <View style={styles.body}>

        {/* ── SIDEBAR ── */}
        <View style={styles.sidebar}>
          <View style={{ rowGap: 10 }}>
            <Text style={styles.sidebarTitle}>{t('registration_progress.title')}</Text>
            {STEPS.map((step, index) => {
              const isCompleted = step.id < CURRENT_STEP
              const isCurrent = step.id === CURRENT_STEP
              return (
                <View key={step.id} style={styles.stepRow}>
                  <View style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isCurrent && styles.stepCircleCurrent,
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
                      isCurrent && styles.stepLabelCurrent,
                    ]}>
                      {t(step.labelKey)}
                    </Text>
                    <Text style={styles.stepSubLabel}>
                      {step.subLabelKey ? t(step.subLabelKey) : step.subLabel}
                    </Text>
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
              <Text style={styles.needHelpSidebarText}>{t('common.need_help')}</Text>
              <Text style={styles.needHelpSidebarSub}>{t('common.tap_for_assistance')}</Text>
            </View>
          </View>
        </View>

        {/* ── MAIN CONTENT ── */}
        <View style={styles.mainContent}>

          {/* Title */}
          <View>
            <Text style={styles.pageTitle}>{t('select_doctor.title')}</Text>
            <Text style={styles.pageSubtitle}>{t('select_doctor.subtitle')}</Text>
          </View>

          {/* Filters Row */}
          <View style={styles.filtersRow}>

            {/* Date Filter */}
            <View>
              <Pressable style={styles.filterChip} onPress={() => setShowCalendar(true)}>
                <Image source={require('../assets/Calendar.png')} style={styles.filterIcon} resizeMode="contain" />
                <Text style={styles.filterText}>
                  {selectedDate ? formatDate(selectedDate) : 'Select Date'}
                </Text>
                <Text style={styles.filterArrow}>▾</Text>
              </Pressable>

              <CalendarPicker
                visible={showCalendar}
                onClose={() => setShowCalendar(false)}
                onSelect={(date) => setSelectedDate(date)}
              />
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
              <Image style={{ width: 16, height: 16 }} source={require('../assets/Search.png')} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('select_doctor.search_placeholder')}
                placeholderTextColor="#737373"
                value={search}
                onChangeText={setSearch}
              />
            </View>

          </View>

          {/* Doctor Cards Area */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#00A4A4" />
              <Text style={styles.stateText}>{t('common.loading') || 'Loading doctors...'}</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={[styles.stateText, { color: '#e55252' }]}>{error}</Text>
            </View>
          ) : filteredDoctors.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.stateText}>{t('select_doctor.no_doctors_found') || 'No doctors found'}</Text>
            </View>
          ) : (
           <ScrollView
  style={{ flex: 1 }}
  showsVerticalScrollIndicator={true}
  contentContainerStyle={styles.doctorGrid}
>
  {filteredDoctors.map((doctor) => {
    const isSelected = selected?.id === doctor.id
    return (
      <View
        key={doctor.id}
        style={[styles.doctorCard, isSelected && styles.doctorCardSelected]}
      >
        <Image
          source={{ uri: doctor.photo || DEFAULT_DOCTOR_IMAGE }}
          style={styles.doctorPhoto}
          resizeMode="cover"
        />
        <Text style={[styles.doctorName, isSelected && styles.textWhite]}>
          {doctor.PractName}
        </Text>
        <Text style={styles.doctorSpecialty}>
          {doctor.Designation || doctor.Department}
        </Text>
        <Text style={[styles.doctorQual, isSelected && styles.textWhiteLight]}>
          {doctor.degree || 'MBBS'}
        </Text>
        
        <View style={styles.availableBadge}>
          <Image source={require('../assets/Calendar (1).png')} style={styles.badgeIcon} resizeMode="contain" />
          <Text style={[styles.availableText, isSelected && { color: '#ffffff' }]}>
            {t('select_doctor.available_today') || 'Available'}
          </Text>
        </View>

        <View style={styles.slotRow}>
          <Image source={require('../assets/Clock.png')} style={styles.slotIcon} resizeMode="contain" />
          <Text style={[styles.slotLabel, isSelected && styles.textWhiteLight]}>
            {t('select_doctor.next_time_slot') || 'Next Slot'}
          </Text>
          <Text style={[styles.slotTime, isSelected && styles.textWhite]}>
            10:30 AM
          </Text>
        </View>

        <Pressable
          style={[styles.bookButton, isSelected && styles.bookButtonSelected]}
          onPress={() => handleSelectDoctor(doctor)}
        >
          <Text style={[styles.bookButtonText, isSelected && styles.bookButtonTextSelected]}>
            {isSelected ? `✓ ${t('select_doctor.selected') || 'Selected'}` : (t('select_doctor.book_appointment') || 'Select Doctor')}
          </Text>
        </Pressable>
      </View>
    )
  })}
</ScrollView>
          )}

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <Pressable onPress={() => navigation.navigate('Welcome')}>
              <Text style={styles.cancelText}>✕ {t('common.cancel_registration')}</Text>
            </Pressable>
            <Text style={styles.noteText}>ℹ️ {t('select_department.wait_time_note')}</Text>
           <Pressable
  style={[styles.nextButton, (!selected || bookingLoading) && styles.nextButtonDisabled]}
  onPress={handleBook}
  disabled={!selected || bookingLoading}
>
  {bookingLoading ? (
    <ActivityIndicator size="small" color="#ffffff" />
  ) : (
    <Text style={styles.nextButtonText}>{t('common.next')}</Text>
  )}
</Pressable>
          </View>

        </View>

      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.footerLangActive}>
            <Image source={require('../assets/Globe.png')} style={styles.footerIcon} resizeMode="contain" />
            <TouchableOpacity onPress={() => i18n.changeLanguage('en')}>
              <Text style={[styles.footerText, { color: langColor('en') }]}>{t('common.english')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity onPress={() => i18n.changeLanguage('hi')}>
            <Text style={[styles.footerText, { color: langColor('hi') }]}>{t('common.hindi')}</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity onPress={() => i18n.changeLanguage('mr')}>
            <Text style={[styles.footerText, { color: langColor('mr') }]}>{t('common.marathi')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.needHelpBox}>
          <Image source={require('../assets/headset-icon.png')} style={styles.needHelpIcon} resizeMode="cover" />
          <View>
            <Text style={[styles.footerText, { color: '#000000' }]}>{t('common.need_help')}</Text>
            <Text style={styles.needHelpSub}>{t('common.tap_for_assistance')}</Text>
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
  body: { flex: 1, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5, gap: 16 },

  // Sidebar
  sidebar: { width: 'auto', paddingVertical: 20, paddingHorizontal: 16, backgroundColor: '#F9FFFF', borderRadius: 16, borderWidth: 1, borderColor: '#00A4A420', gap: 15, justifyContent: 'space-between' },
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
  needHelpSidebarIcon: { width: 32, height: 32 },
  needHelpSidebarText: { fontSize: 14, fontWeight: '700', color: '#001532' },
  needHelpSidebarSub:  { fontSize: 12, color: '#737373' },

  // Main Content
  mainContent: { flex: 1, flexDirection: 'column', gap: 12 },
  pageTitle:    { fontSize: 30, fontWeight: '500', color: '#001532' },
  pageSubtitle: { fontSize: 18, fontWeight: '400', color: '#485260' },

  // Filters
  filtersRow: { flexDirection: 'row', alignItems:'flex-end' , gap:12, justifyContent:'flex-end'},
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 40, borderWidth: 0.3, borderColor: '#73737340', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F9FFFF' },
  filterIcon: { width: 20, height: 20 },
  filterText: { fontSize: 14, fontWeight: '500', color: '#8b8c8ebb' },
  filterArrow:{ fontSize: 12, color: '#737373' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#73737340',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F9FFFF',
    width: 220,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#001532',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  stateText: {
    fontSize: 16,
    color: '#737373',
    fontWeight: '500',
  },

  // Doctor Cards
  doctorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  doctorCard: {
    width: '22%',
    borderWidth: 1,
    borderColor: '#73737326',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  doctorCardSelected: { backgroundColor: '#00A4A4', borderColor: '#00A4A4' },
  doctorPhoto: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F0F0', marginBottom: 4 },
  doctorName: { fontSize: 15, fontWeight: '700', color: '#001532', textAlign: 'center' },
  doctorSpecialty: { fontSize: 13, fontWeight: '600', color: '#00A4A4', textAlign: 'center' },
  doctorQual: { fontSize: 11, fontWeight: '400', color: '#737373', textAlign: 'center' },
  textWhite: { color: '#ffffff' },
  textWhiteLight: { color: '#ffffffcc' },

  // Available Badge
  availableBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#00A4A420', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeIcon: { width: 14, height: 14 },
  availableText: { fontSize: 12, fontWeight: '600', color: '#00A4A4' },

  // Slot Row
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  slotIcon: { width: 14, height: 14 },
  slotLabel: { fontSize: 12, color: '#737373' },
  slotTime: { fontSize: 13, fontWeight: '700', color: '#001532' },

  // Book Button
  bookButton: { marginTop: 8, width: '100%', backgroundColor: '#00A4A4', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  bookButtonSelected: { backgroundColor: '#ffffff' },
  bookButtonText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  bookButtonTextSelected: { color: '#00A4A4' },

  // Bottom Row
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  cancelText: { fontSize: 14, fontWeight: '500', color: '#A11D1D' },
  noteText:   { fontSize: 12, fontWeight: '400', color: '#737373' },
  nextButton: { backgroundColor: '#00A4A4', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 48, minWidth: 140, alignItems: 'center', justifyContent: 'center' },
  nextButtonDisabled: { backgroundColor: '#73737340' },
  nextButtonText: { fontSize: 18, fontWeight: '700', color: '#ffffff' },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 20 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  footerLangActive: { flexDirection: 'row', alignItems: 'center', columnGap: 6 },
  footerIcon: { width: 24, height: 24 },
  footerText: { fontSize: 19, fontWeight: '700', color: '#000000' },
  footerDivider: { fontSize: 24, color: '#73737366' },
  needHelpBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffffff', paddingHorizontal: 17, paddingVertical: 9, borderRadius: 10 },
  needHelpIcon: { width: 35, height: 35 },
  needHelpSub: { fontSize: 12, fontWeight: '500' },

  mainContent: {
  flex: 1,
  flexDirection: 'column',
  gap: 12,
  overflow: 'hidden', // Scroll overflow ko constrain karta hai
},

doctorGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 16,
  paddingBottom: 24, // Aakhiri card ke neeche space ke liye
},
})