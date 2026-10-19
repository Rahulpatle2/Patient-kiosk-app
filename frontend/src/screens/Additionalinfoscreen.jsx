import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import CalendarPicker from '../components/CalendarPicker'
import { usePatient } from '../context/PatientContext.js'
import { getDoctorForm, submitDoctorForm } from '../api/additionalFormApi.js'

// ─── Helpers ────────────────────────────────────────────────
// "Dr. Rahul Patle" -> "opd_additional_rahul_patle"
const toTemplateName = (name = '') =>
  'opd_additional_' +
  name
    .trim()
    .toLowerCase()
    .replace(/^dr\.?\s+/, '')            // "Dr." prefix hatao (agar template name mein dr_ chahiye to ye line hata do)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

// Local date, yyyy-mm-dd (toISOString IST mein ek din peeche kar sakta hai)
const toYMD = (d) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const DATE_TYPES = ['datet', 'daten', 'datag']
const SELECT_TYPES = ['combo', 'dropdown']
const MULTILINE_TYPES = ['richt', 'exrich']
const INPUT_TYPES = ['textb', 'check', 'radio', ...DATE_TYPES, ...SELECT_TYPES, ...MULTILINE_TYPES]
const FULL_WIDTH_TYPES = [...MULTILINE_TYPES, 'label']

// ─── Dropdown (Modal list) ──────────────────────────────────
function SelectField({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={[styles.inputText, !value && styles.placeholder]} numberOfLines={1}>
          {value ? value.trim() : placeholder}
        </Text>
        <Text style={styles.arrow}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.modalCard}>
            <ScrollView>
              {options.map((o, i) => {
                const active = value === o
                return (
                  <Pressable
                    key={`${o}-${i}`}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                    onPress={() => {
                      onChange(o)           // exact value save hogi, sirf display trim hota hai
                      setOpen(false)
                    }}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{o.trim()}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>
            {!!value && (
              <Pressable
                style={styles.clearRow}
                onPress={() => {
                  onChange('')
                  setOpen(false)
                }}
              >
                <Text style={styles.clearText}>✕ Clear</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

// ─── Screen ─────────────────────────────────────────────────
export default function AdditionalInfoScreen({ navigation, route }) {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()
  const { patientId, encounterId, department, doctor} = usePatient()
  const {  bookingDetails } = route.params || {}

  const doctorName = typeof doctor === 'string' ? doctor : doctor?.PractName
  const templateName = useMemo(() => toTemplateName(doctorName), [doctorName])

  const [fields, setFields] = useState([])
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [calendarFor, setCalendarFor] = useState(null)

  const columns = width >= 1200 ? 3 : width >= 800 ? 2 : 1
  const setValue = (id, v) => setValues((p) => ({ ...p, [id]: v }))

  // Save/skip ke baad agli screen
  const goNext = () =>
    navigation.replace('AppointmentConfirmed', {  bookingDetails })

  // ─── Load template ────────────────────────────────────────
  const loadTemplate = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getDoctorForm(templateName)
      const list = res?.data?.data || []
      if (list.length === 0) {
        goNext()                         // is doctor ka koi template nahi, seedha aage
        return
      }
      setFields(list)
    } catch (e) {
      console.error('Form template error:', e)
      setError(t('common.error_loading_data', { defaultValue: 'Could not load the form' }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setValues({})                        // form hamesha khali se shuru
    if (!doctorName) {
      goNext()
      return
    }
    loadTemplate()
  }, [templateName])

  // ─── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    const filled = Object.values(values).some((v) => v !== '' && v != null)
    if (!filled) {
      goNext()
      return
    }
    if (!patientId || !encounterId) {
      Alert.alert('Error', 'Visit details are missing. Please contact the front desk.')
      return
    }
    try {
      setSaving(true)
      await submitDoctorForm(patientId, encounterId, values)
      console.log("chal raha hai")
      goNext()
    } catch (e) {
      console.error('Save form error:', e)
      Alert.alert('Could not save', e?.response?.data?.message || 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Input renderer ───────────────────────────────────────
  const renderInput = (f) => {
    const v = values[f.id] ?? ''
    const choose = t('additional_info.select', { defaultValue: 'Select' })

    if (SELECT_TYPES.includes(f.type)) {
      return <SelectField value={v} options={f.options} onChange={(x) => setValue(f.id, x)} placeholder={choose} />
    }
    if (MULTILINE_TYPES.includes(f.type)) {
      return (
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          textAlignVertical="top"
          value={v}
          onChangeText={(x) => setValue(f.id, x)}
        />
      )
    }
    if (DATE_TYPES.includes(f.type)) {
      return (
        <Pressable style={styles.input} onPress={() => setCalendarFor(f.id)}>
          <Text style={[styles.inputText, !v && styles.placeholder]}>
            {v || t('additional_info.select_date', { defaultValue: 'Select date' })}
          </Text>
          <Text style={styles.arrow}>▾</Text>
        </Pressable>
      )
    }
    if (f.type === 'radio') {
      return (
        <View style={styles.chipRow}>
          {f.options.map((o, i) => {
            const active = v === o
            return (
              <Pressable
                key={`${o}-${i}`}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setValue(f.id, active ? '' : o)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.trim()}</Text>
              </Pressable>
            )
          })}
        </View>
      )
    }
    if (f.type === 'check') {
      const on = v === 'Yes'
      return (
        <Pressable style={styles.checkRow} onPress={() => setValue(f.id, on ? 'No' : 'Yes')}>
          <View style={[styles.checkBox, on && styles.checkBoxOn]}>
            {on && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.inputText}>{on ? 'Yes' : 'No'}</Text>
        </Pressable>
      )
    }
    // textb
    return <TextInput style={styles.input} value={v} onChangeText={(x) => setValue(f.id, x)} />
  }

  const visibleFields = fields.filter((f) => f.type === 'label' || INPUT_TYPES.includes(f.type))

  // ─── UI ───────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header (back button nahi: booking ho chuki hai, wapas jaakar dobara book na ho) */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Image source={require('../assets/balaji-logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.secureBadge}>
          <Image source={require('../assets/secure-icon.png')} style={styles.secureIcon} resizeMode="contain" />
          <Text style={styles.secureText}>{t('common.secure_badge')}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View>
          <Text style={styles.pageTitle}>
            {t('additional_info.title', { defaultValue: 'Additional information' })}
          </Text>
          <Text style={styles.pageSubtitle}>
            {t('additional_info.subtitle', {
              defaultValue: 'Answer the questions below for {{doctor}}. You can skip any you are unsure about.',
              doctor: doctorName,
            })}
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#00A4A4" />
            <Text style={styles.stateText}>{t('common.loading', { defaultValue: 'Loading...' })}</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.stateText, { color: '#e55252' }]}>{error}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable style={styles.secondaryButton} onPress={loadTemplate}>
                <Text style={styles.secondaryButtonText}>{t('common.retry', { defaultValue: 'Try again' })}</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={goNext}>
                <Text style={styles.primaryButtonText}>{t('common.skip', { defaultValue: 'Skip' })}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.grid} showsVerticalScrollIndicator>
              {visibleFields.map((f) => {
                const full = columns === 1 || FULL_WIDTH_TYPES.includes(f.type)
                const w = full ? '100%' : columns === 3 ? '32%' : '48.5%'
                return (
                  <View key={f.id} style={[styles.fieldBox, { width: w }]}>
                    <Text style={f.type === 'label' ? styles.heading : styles.label}>{f.label}</Text>
                    {f.type !== 'label' && renderInput(f)}
                  </View>
                )
              })}
            </ScrollView>

            <View style={styles.bottomRow}>
              <Pressable onPress={goNext} disabled={saving}>
                <Text style={styles.skipText}>{t('common.skip', { defaultValue: 'Skip' })}</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {t('additional_info.save', { defaultValue: 'Save and continue' })}
                  </Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* Ek hi calendar sabhi date fields ke liye */}
      <CalendarPicker
        visible={calendarFor !== null}
        onClose={() => setCalendarFor(null)}
        onSelect={(date) => {
          if (calendarFor) setValue(calendarFor, toYMD(date))
          setCalendarFor(null)
        }}
      />
    </View>
  )
}

// ─── Styles (SelectDoctorScreen ki theme ke saath match) ────
const TEAL = '#00A4A4'
const INK = '#001532'
const GREY = '#737373'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, paddingVertical: 0 },
  headerLeft: { width: '20%' },
  logo: { width: 300, height: 50 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: TEAL, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  secureIcon: { width: 16, height: 16 },
  secureText: { fontSize: 13, fontWeight: '500', color: '#485260' },

  body: { flex: 1, minHeight: 0, paddingHorizontal: 30, paddingVertical: 4, gap: 8 },
  pageTitle: { fontSize: 22, fontWeight: '500', color: INK },
  pageSubtitle: { fontSize: 14, fontWeight: '400', color: '#485260', marginTop: 0 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  stateText: { fontSize: 16, fontWeight: '500', color: GREY },

  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 8, paddingBottom: 8 },
  fieldBox: { gap: 3 },
  label: { fontSize: 13, fontWeight: '600', color: INK },
  heading: { fontSize: 16, fontWeight: '700', color: INK, marginTop: 2 },

  input: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#73737340',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F9FFFF',
    fontSize: 14,
    color: INK,
  },
  multiline: { minHeight: 64, alignItems: 'flex-start' },
  inputText: { flex: 1, fontSize: 14, color: INK },
  placeholder: { color: GREY },
  arrow: { fontSize: 12, color: GREY, marginLeft: 8 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderColor: '#73737340', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#ffffff' },
  chipActive: { backgroundColor: TEAL, borderColor: TEAL },
  chipText: { fontSize: 13, fontWeight: '500', color: INK },
  chipTextActive: { color: '#ffffff', fontWeight: '700' },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 38 },
  checkBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#73737366', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
  checkBoxOn: { backgroundColor: TEAL, borderColor: TEAL },
  checkMark: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: '#00153280', justifyContent: 'center', alignItems: 'center', padding: 40 },
  modalCard: { width: '60%', maxWidth: 520, maxHeight: '75%', backgroundColor: '#ffffff', borderRadius: 12, paddingVertical: 8 },
  optionRow: { paddingHorizontal: 20, paddingVertical: 16 },
  optionRowActive: { backgroundColor: '#00A4A415' },
  optionText: { fontSize: 17, color: INK },
  optionTextActive: { color: TEAL, fontWeight: '700' },
  clearRow: { paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#73737326' },
  clearText: { fontSize: 15, fontWeight: '500', color: '#A11D1D' },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, paddingBottom: 10 },
  skipText: { fontSize: 14, fontWeight: '500', color: GREY },
  primaryButton: { backgroundColor: TEAL, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 32, minWidth: 160, alignItems: 'center', justifyContent: 'center' },
  primaryButtonDisabled: { backgroundColor: '#73737340' },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  secondaryButton: { borderWidth: 1, borderColor: TEAL, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 28, alignItems: 'center' },
  secondaryButtonText: { fontSize: 16, fontWeight: '700', color: TEAL },
})