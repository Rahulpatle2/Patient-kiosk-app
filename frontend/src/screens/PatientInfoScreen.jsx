import { StyleSheet, Text, View, Pressable, Image, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import CalendarPicker from '../components/CalendarPicker'
import LocationDropdown from '../components/LocationDropdown'
import { usePatient } from '../context/PatientContext.js'
import { registerPatient } from '../api/patientApi'

// ─── Progress Steps ───────────────────────────────────────────
const STEPS = [
  { id: 1, labelKey: 'registration_progress.mobile_number',        icon: require('../assets/iPhone 14.png'),                    subLabel: '+91 9123456789' },
  { id: 2, labelKey: 'registration_progress.verification',         icon: require('../assets/Instagram Verification Badge.png'), subLabelKey: 'registration_progress.verified_successfully' },
  { id: 3, labelKey: 'registration_progress.patient_information',  icon: require('../assets/Person.png'),                        subLabelKey: 'registration_progress.please_provide_details' },
  { id: 4, labelKey: 'registration_progress.department_selection', icon: require('../assets/Department.png'),                  subLabelKey: 'registration_progress.select_your_department' },
  { id: 5, labelKey: 'registration_progress.confirmation',         icon: require('../assets/Task Completed.png'),               subLabelKey: 'registration_progress.review_and_confirm' },
]

const CURRENT_STEP = 3

// ─── Form Fields Config ───────────────────────────────────────
const FORM_FIELDS = [
  {
    id: 1,
    nameKey: 'patient_info.full_name',
    icon: require('../assets/Person.png'),
    type: 'text',
    subFields: [
      { id: 1, key: 'firstName',  placeholderKey: 'patient_info.first_name' },
      { id: 2, key: 'middleName', placeholderKey: 'patient_info.middle_name' },
      { id: 3, key: 'lastName',   placeholderKey: 'patient_info.last_name' },
    ],
  },
  {
    id: 7,
    type: 'row',
    fields: [
      {
        id: 2,
        nameKey: 'patient_info.gender',
        icon: require('../assets/Gender.png'),
        type: 'select',
        options: [
          { id: 1, nameKey: 'patient_info.male',   name: 'Male',   icon: require('../assets/male.png'),      onSelectIcon: require('../assets/Male-select.png') },
          { id: 2, nameKey: 'patient_info.female', name: 'Female', icon: require('../assets/Female.png'),    onSelectIcon: require('../assets/Female-select.png') },
          { id: 3, nameKey: 'patient_info.other',  name: 'Other',  icon: require('../assets/Androgyne.png'), onSelectIcon: require('../assets/Androgyne-select.png') },
        ],
      },
      {
        id: 3,
        nameKey: 'patient_info.date_of_birth',
        icon: require('../assets/Birthday Date.png'),
        type: 'date',
      },
    ],
  },
  {
    id: 8,
    type: 'row',
    fields: [
      {
        id: 4,
        nameKey: 'patient_info.email',
        icon: require('../assets/Email.png'),
        type: 'text',
        subFields: [
          { id: 1, key: 'email', placeholderKey: 'patient_info.email_placeholder' },
        ],
      },
      {
        id: 6,
        nameKey: 'Contact',
        icon: require('../assets/Call-2.png'),
        type: 'contact-mobile', // Context se mobile number display hoga
      },
    ],
  },
  {
    id: 5,
    nameKey: 'Address',
    icon: require('../assets/Address.png'),
    type: 'text',
    subFields: [
      { id: 1, key: 'houseNo',  placeholderKey: 'patient_info.house_no' },
      { id: 2, key: 'landmark', placeholderKey: 'patient_info.landmark' },
    ],
  },
  {
    id: 10,
    nameKey: 'location',
    icon: require('../assets/Address.png'),
    type: 'location',
  },
]

// ─── Helper — Date object ko YYYY/MM/DD string mein convert karna (backend API ke liye) ──
const formatDateForBackend = (date) => {
  if (!date) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd}`
}

// ─── Helper — Date object ko UI par display karne ke liye ──
const formatDateForDisplay = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Main Component ───────────────────────────────────────────
export default function PatientInfoScreen({ navigation }) {

  const { i18n, t } = useTranslation()
  const [selectedStateCode, setSelectedStateCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDob, setSelectedDob] = useState(null)
  const { mobile, setPatientId, setPatientName } = usePatient()

  // ─── Form State ───────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    email: '',
    houseNo: '',
    landmark: '',
    city: '',
    state: '',
  })

  // ─── Handlers ─────────────────────────────────────────────
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleDateSelect = (date) => {
    setSelectedDob(date)
    setShowDatePicker(false)
  }

  const handleSave = async () => {
    if (!form.firstName || !form.gender || !selectedDob) {
      setErrorMsg('Please fill in name, gender and date of birth.')
      return
    }

    setSaving(true)
    setErrorMsg('')

    try {
      const combinedAddress = [form.houseNo, form.landmark]
        .filter(Boolean)
        .join(', ')

      const patientData = {
        PtFName: form.firstName,
        PtMName: form.middleName,
        PtSName: form.lastName,
        Address: combinedAddress,
        city: form.city,
        Phone: mobile,                             // Context wala mobile number
        mobile: mobile,                            // Context wala mobile number
        Gender: form.gender,
        DOB: formatDateForBackend(selectedDob),    // YYYY/MM/DD format
        email: form.email,
      }

      const response = await registerPatient(patientData)

      setPatientId(response.data.PatientID)
      setPatientName(`${form.firstName} ${form.middleName} ${form.lastName}`.trim())

      navigation.navigate('SelectDepartment')
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const langColor = (code) =>
    i18n.language === code ? '#00A4A4' : '#000000'

  // ─── Field Renderer ─────────────────────────────────────────
  const renderField = (field) => {

    if (field.type === 'row') {
      return (
        <View key={field.id} style={styles.fieldRow}>
          {field.fields.map((f) => (
            <View key={f.id} style={styles.fieldRowItem}>
              {renderField(f)}
            </View>
          ))}
        </View>
      )
    }

    if (field.type === 'text') {
      return (
        <View key={field.id} style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Image style={styles.sectionIcon} source={field.icon} resizeMode="contain" />
            <Text style={styles.sectionLabel}>{t(field.nameKey)}</Text>
          </View>
          <View style={[styles.inputRow, { flexWrap: 'wrap' }]}>
            {field.subFields.map((sub) => (
              <TextInput
                key={sub.id}
                style={styles.input}
                placeholder={t(sub.placeholderKey)}
                placeholderTextColor="#737373"
                value={form[sub.key]}
                onChangeText={(text) => handleChange(sub.key, text)}
              />
            ))}
          </View>
        </View>
      )
    }

    // ─── Contact Field (Display Mobile from Context) ────────────
    if (field.type === 'contact-mobile') {
      return (
        <View key={field.id} style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Image style={styles.sectionIcon} source={field.icon} resizeMode="contain" />
            <Text style={styles.sectionLabel}>{t(field.nameKey) || 'Contact'}</Text>
          </View>
          <View style={[styles.input, styles.readOnlyInput]}>
            <Text style={styles.readOnlyText}>+91 {mobile}</Text>
          </View>
        </View>
      )
    }

    // ─── Date of Birth Field ────────────────────────────────────
    if (field.type === 'date') {
      return (
        <View key={field.id} style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Image style={styles.sectionIcon} source={field.icon} resizeMode="contain" />
            <Text style={styles.sectionLabel}>{t(field.nameKey)}</Text>
          </View>

          <Pressable
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: selectedDob ? '#001532' : '#737373', fontSize: 14 }}>
              {selectedDob ? formatDateForDisplay(selectedDob) : t('patient_info.dob_placeholder')}
            </Text>
          </Pressable>

          <CalendarPicker
            visible={showDatePicker}
            initialDate={selectedDob}
            mode="dob"
            onClose={() => setShowDatePicker(false)}
            onSelect={handleDateSelect}
          />
        </View>
      )
    }

    if (field.type === 'select') {
      return (
        <View key={field.id} style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Image style={styles.sectionIcon} source={field.icon} resizeMode="contain" />
            <Text style={styles.sectionLabel}>{t(field.nameKey)}</Text>
          </View>
          <View style={styles.genderBox}>
            {field.options.map((option) => {
              const isSelected = form.gender === option.name
              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.genderOption,
                    isSelected && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleChange('gender', option.name)}
                >
                  <Image
                    style={styles.genderIcon}
                    source={isSelected ? option.onSelectIcon : option.icon}
                    resizeMode="contain"
                  />
                  <Text style={[
                    styles.genderText,
                    isSelected && styles.genderTextSelected,
                  ]}>
                    {t(option.nameKey)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      )
    }

   if (field.type === 'location') {
  return (
    <View key={field.id} style={[styles.formSection, { zIndex: 10 }]}>
      <View style={styles.sectionHeader}>
        <Image style={styles.sectionIcon} source={field.icon} resizeMode="contain" />
        <Text style={styles.sectionLabel}>{'location'}</Text>
      </View>

      <View style={[styles.inputRow, { zIndex: 10 }]}>
        {/* State Dropdown with Label */}
        <View style={styles.dropdownFieldWrapper}>
          <Text style={styles.subFieldLabel}>{t('patient_info.state') || 'State'}</Text>
          <LocationDropdown
            type="state"
            value={form.state}
            placeholder={t('patient_info.state')}
            onSelect={(state) => {
              setSelectedStateCode(state.code)
              handleChange('state', state.name)
              handleChange('city', '')
            }}
          />
        </View>

        {/* City Dropdown with Label */}
        <View style={styles.dropdownFieldWrapper}>
          <Text style={styles.subFieldLabel}>{t('patient_info.city') || 'City'}</Text>
          <LocationDropdown
            type="city"
            stateCode={selectedStateCode}
            value={form.city}
            placeholder={t('patient_info.city')}
            onSelect={(city) => handleChange('city', city.name)}
          />
        </View>
      </View>
    </View>
  )
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
                      isCurrent && styles.stepLabelCurrent,
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

          <View style={styles.sidebarNote}>
            <Image style={styles.sidebarNoteIcon} source={require('../assets/Light.png')} resizeMode="contain" />
            <Text style={styles.sidebarNoteText}>{t('patient_info.footer_tag')}</Text>
          </View>
        </View>

        {/* ── FORM AREA ── */}
        <View style={styles.formArea}>
          <Text style={styles.formTitle}>{t('patient_info.title')}</Text>
          <Text style={styles.formSubtitle}>
            {t('patient_info.subtitle')}
          </Text>

          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formGrid}
          >
            {FORM_FIELDS.map((field) => renderField(field))}
          </ScrollView>
        </View>

        {/* ── RIGHT SIDE ── */}
        <View style={styles.rightSide}>
          <View>
            <Image
              source={require('../assets/registration-illustration.png')}
              style={styles.illustration}
              resizeMode="contain"
            />

            <View style={{ borderColor: '#00A4A4', borderWidth: 0.3, borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Image style={{ width: 20, height: 20 }} source={require('../assets/Lock.png')} />
              </View>
              <View style={{ flex: 9 }}>
                <Text style={{ color: '#00A4A4', fontWeight: '500', fontSize: 16 }}>{t('patient_info.data_safe_title')}</Text>
                <Text style={{ fontWeight: '500' }}>{t('patient_info.data_safe_subtitle')}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>{t('common.save_and_continue')}</Text>
            )}
          </Pressable>
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
      </View>

    </View>
  )
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 2,
  },
  headerLeft: { width: '20%' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 150, height: 50 },
  logo: { width: 500, height: 80 },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#00A4A4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  secureIcon: { width: 20, height: 20 },
  secureText: { fontSize: 16, fontWeight: '500', color: '#485260' },

  body: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 5,
    gap: 16,
  },

  sidebar: {
    width: 'auto',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F9FFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00A4A420',
    gap: 15,
  },
  sidebarTitle: { fontSize: 14, fontWeight: '700', color: '#001532', marginBottom: 12 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    position: 'relative',
    paddingVertical: 6,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#73737340',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  stepCircleCompleted: { backgroundColor: '#00A4A4', borderColor: '#00A4A4' },
  stepCircleCurrent:   { backgroundColor: '#00A4A4', borderColor: '#00A4A4' },
  stepNumber: { fontSize: 12, fontWeight: '600', color: '#737373' },
  stepCheck:  { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  stepIcon:   { width: 29, height: 29 },
  stepLabel:  { fontSize: 15, fontWeight: '500', color: '#737373' },
  stepLabelCompleted: { color: '#00A4A4', fontWeight: '600' },
  stepLabelCurrent:   { color: '#001532', fontWeight: '700' },
  stepSubLabel: { fontSize: 12, color: '#737373' },
  connector: {
    position: 'absolute',
    left: 13,
    top: 34,
    width: 0.5,
    height: 40,
    backgroundColor: '#73737340',
  },
  connectorCompleted: { backgroundColor: '#00A4A4' },

  sidebarNote:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sidebarNoteIcon: { height: 18, width: 18 },
  sidebarNoteText: { fontSize: 11, color: '#485260' },

  formArea:    { flex: 1, paddingHorizontal: 10 },
  formTitle:   { fontSize: 24, fontWeight: '700', color: '#001532', marginBottom: 4 },
  formSubtitle:{ fontSize: 14, fontWeight: '400', color: '#485260', marginBottom: 16 },
  formGrid:    { gap: 10 },

  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },

  formSection:   { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionIcon:   { width: 22, height: 22 },
  sectionLabel:  { fontSize: 14, fontWeight: '600', color: '#001532' },

  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#73737340',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 14,
    color: '#001532',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },

  readOnlyInput: {
    backgroundColor: '#73737315',
  },
  readOnlyText: {
    fontSize: 14,
    color: '#485260',
    fontWeight: '600',
  },

  genderBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#73737340',
    borderRadius: 8,
    overflow: 'hidden',
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#73737340',
  },
  genderOptionSelected: { backgroundColor: '#00A4A4' },
  genderIcon: { width: 26, height: 26 },
  genderText: { fontSize: 15, fontWeight: '600', color: '#737373' },
  genderTextSelected: { color: '#ffffff', fontWeight: '700' },

  rightSide: {
    width: 280,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 80,
  },
  illustration: { width: '100%', height: 300 },
  saveButton: {
    backgroundColor: '#00A4A4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonPressed: { opacity: 0.8 },
  saveButtonDisabled: { backgroundColor: '#73737340' },
  saveButtonText: { fontSize: 18, fontWeight: '700', color: '#ffffff' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  footerLeft:       { flexDirection: 'row', alignItems: 'center', gap: 30 },
  footerLangActive: { flexDirection: 'row', alignItems: 'center', columnGap: 6 },
  footerIcon:       { width: 24, height: 24 },
  footerText:       { fontSize: 19, fontWeight: '700', color: '#000000' },
  footerDivider:    { fontSize: 24, color: '#73737366' },
  needHelpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 10,
  },
  needHelpIcon: { width: 35, height: 35 },
  needHelpSub:  { fontSize: 12, fontWeight: '500' },
  fieldRow: {
    flexDirection: 'row',
    gap: 16,
  },
  fieldRowItem: {
    flex: 1,
    justifyContent: 'center',
  },
  dropdownFieldWrapper: {
  flex: 1,
  gap: 4,
},
subFieldLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: '#485260',
  marginBottom: 2,
},
})