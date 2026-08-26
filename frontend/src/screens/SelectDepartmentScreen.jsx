import { StyleSheet, Text, View, Pressable, Image, TextInput, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePatient } from '../context/PatientContext.js'
import { getDepartments } from '../api/departmentApi.js'

// ─── Progress Steps ───────────────────────────────────────────
const STEPS = [
  { id: 1, labelKey: 'registration_progress.mobile_number',        icon: require('../assets/iPhone 14.png'),                    subLabel: '+91 9123456789' },
  { id: 2, labelKey: 'registration_progress.verification',         icon: require('../assets/Instagram Verification Badge.png'), subLabelKey: 'registration_progress.verified_successfully' },
  { id: 3, labelKey: 'registration_progress.patient_information',  icon: require('../assets/Person.png'),                       subLabelKey: 'registration_progress.details_saved' },
  { id: 4, labelKey: 'registration_progress.department_selection', icon: require('../assets/Department.png'),                   subLabelKey: 'registration_progress.select_your_department' },
  { id: 6, labelKey: 'registration_progress.doctor_selection',     icon: require('../assets/Medical Doctor.png'),               subLabelKey: 'registration_progress.choose_your_doctor' },
  { id: 5, labelKey: 'registration_progress.confirmation',         icon: require('../assets/Task Completed.png'),               subLabelKey: 'registration_progress.review_and_confirm' },
]

const CURRENT_STEP = 4

export default function SelectDepartmentScreen({ navigation }) {

  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  const { t }             = useTranslation()
  const { setDepartment } = usePatient()
  console.log('all departments',departments)
  // ─── Fetch Departments ────────────────────────────────────
  const fetchDepartments = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getDepartments()
      console.log("ss",response)
      console.log("ssss",response.data)
      
      setDepartments(prev => response.data.data)
    } catch (err) {
      setError('Failed to load departments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  // ─── Filter by search ─────────────────────────────────────
  const filtered = departments.filter(dept =>
    dept.specialty?.toLowerCase().includes(search.toLowerCase())
  ) || " "

  // ─── Handlers ─────────────────────────────────────────────
  const handleNext = () => {
    if (selected) {
      setDepartment(selected)
      navigation.navigate('SelectDoctor', { department: selected })
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
                      {t(step.labelKey)}
                    </Text>
                    <Text style={styles.stepSubLabel}>
                      {step.subLabelKey ? t(step.subLabelKey) : step.subLabel}
                    </Text>
                  </View>

                  {index < STEPS.length - 1 && (
                    <View style={[
                      styles.connector,
                      isCompleted && styles.connectorCompleted,
                    ]} />
                  )}

                </View>
              )
            })}
          </View>

          {/* Need Help */}
          <View style={styles.needHelpBox}>
            <Image
              source={require('../assets/headset-icon.png')}
              style={styles.needHelpIcon}
              resizeMode="cover"
            />
            <View>
              <Text style={[styles.footerText, { color: '#000000' }]}>{t('common.need_help')}</Text>
              <Text style={styles.needHelpSub}>{t('common.tap_for_assistance')}</Text>
            </View>
          </View>

          {/* Bottom Note */}
          <View style={styles.sidebarNote}>
            <Image style={styles.sidebarNoteIcon} source={require('../assets/Light.png')} resizeMode="contain" />
            <Text style={styles.sidebarNoteText}>{t('patient_info.footer_tag')}</Text>
          </View>

        </View>

        {/* ── MAIN CONTENT ── */}
        <View style={styles.mainContent}>

          {/* Title + Search */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.pageTitle}>{t('select_department.title')}</Text>
              <Text style={styles.pageSubtitle}>{t('select_department.subtitle')}</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Image style={{ width: 28, height: 28 }} source={require('../assets/Search.png')} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('select_department.search_placeholder')}
                placeholderTextColor="#737373"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          {/* ── Loading State ── */}
          {loading && (
            <View style={styles.centerState}>
              <Text style={styles.loadingText}>Loading departments...</Text>
            </View>
          )}

         

          {/* ── Department Cards Grid ── */}
          {!loading && !error && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.grid}
            >
              {filtered?.map((dept, index) => {
                const isSelected = selected?.specialty === dept.specialty
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.deptCard,
                      isSelected && styles.deptCardSelected,
                    ]}
                    onPress={() => setSelected(dept)}
                  >
                    {/* Icon — URL se aayega */}
                    <View style={styles.deptIconCircle}>
                      <Image
                        source={{ uri: dept.icon }}
                        style={styles.deptIcon}
                        resizeMode="contain"
                      />
                    </View>

                    {/* Name */}
                    <Text style={[
                      styles.deptName,
                      isSelected && styles.deptNameSelected,
                    ]}>
                      {dept.specialty}
                    </Text>

                    <View style={styles.deptCardDivider} />

                    {/* Waiting Time */}
                    <View style={styles.waitingRow}>
                      <View style={styles.waitingIcon}>
                        <Image style={{ width: 18, height: 18 }} source={require('../assets/Clock.png')} />
                      </View>
                      <Text style={[
                        styles.waitingText,
                        isSelected && styles.waitingTextSelected,
                      ]}>
                        10-15 min wait
                      </Text>
                    </View>

                  </Pressable>
                )
              })}
            </ScrollView>
          )}

          {/* ── Bottom Row ── */}
          <View style={styles.bottomRow}>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>✕ {t('common.cancel_registration')}</Text>
            </Pressable>

            <Text style={styles.noteText}>ℹ️ {t('select_department.wait_time_note')}</Text>

            <Pressable
              style={[
                styles.nextButton,
                !selected && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!selected}
            >
              <Text style={styles.nextButtonText}>{t('common.next')}</Text>
            </Pressable>
          </View>

        </View>

      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer} />

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
  sidebarNote: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sidebarNoteIcon: { height: 18, width: 18 },
  sidebarNoteText: { fontSize: 11, color: '#485260' },

  // Need Help
  needHelpBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffffff', borderColor: '#bab1b194', borderWidth: 0.5, paddingHorizontal: 17, paddingVertical: 9, borderRadius: 10 },
  needHelpIcon: { width: 35, height: 35 },
  needHelpSub: { fontSize: 12, fontWeight: '500' },
  footerText: { fontSize: 19, fontWeight: '700', color: '#000000' },

  // ── Main Content ──
  mainContent: { flex: 1, flexDirection: 'column', gap: 12, paddingHorizontal: 50 },

  // Top Row
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle:    { fontSize: 30, fontWeight: '500', color: '#001532' },
  pageSubtitle: { fontSize: 14, fontWeight: '600', color: '#485260ad' },

  // Search Bar
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#73737340', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 8, backgroundColor: '#F9FFFF', width: 250 },
  searchInput: { flex: 1, fontSize: 14, color: '#001532', outlineStyle: 'none' },

  // Loading / Error
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 16, color: '#737373', fontWeight: '500' },
  errorBox: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFBBBB', borderRadius: 8, padding: 16, alignItems: 'center', gap: 8 },
  errorText: { fontSize: 14, color: '#A11D1D', fontWeight: '500' },
  retryText: { fontSize: 13, color: '#00A4A4', fontWeight: '700' },

  // Department Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 20, rowGap: 30 },
  deptCard: { width: '21%', borderWidth: 1, borderColor: '#73737326', borderRadius: 12, padding: 16, paddingHorizontal: 10, alignItems: 'center', gap: 8, backgroundColor: '#ffffff', boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' },
  deptCardSelected: { backgroundColor: '#00A4A4', borderColor: '#00A4A4' },
  deptCardDivider: { width: '80%', height: 0.9, backgroundColor: '#c5bdbd' },
  deptIconCircle: { borderColor: '#0fe6e6', borderWidth: 0.1, backgroundColor: '#F9FFFF', borderRadius: 50, padding: 18 },
  deptIcon: { width: 48, height: 48 },
  deptName: { fontSize: 16, fontWeight: '700', color: '#001532', textAlign: 'center' },
  deptNameSelected: { color: '#ffffff' },
  deptSpecialty: { fontSize: 12, fontWeight: '400', color: '#737373', textAlign: 'center' },
  deptSpecialtySelected: { color: '#ffffffcc' },
  waitingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  waitingIcon: { fontSize: 12 },
  waitingText: { fontSize: 14, fontWeight: '600', color: '#00A4A4' },
  waitingTextSelected: { color: '#ffffff' },

  // Bottom Row
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  cancelText: { fontSize: 14, fontWeight: '500', color: '#A11D1D' },
  noteText: { fontSize: 12, fontWeight: '400', color: '#737373' },
  nextButton: { backgroundColor: '#00A4A4', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 48 },
  nextButtonDisabled: { backgroundColor: '#73737340' },
  nextButtonText: { fontSize: 18, fontWeight: '700', color: '#ffffff' },

  // ── Footer ──
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 20 },

})