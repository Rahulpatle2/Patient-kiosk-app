import { StyleSheet, Text, View, Pressable, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePatient } from '../context/PatientContext.js'
import { sendOtp } from '../api/patientApi.js'

export default function VerifyMobileScreen({ navigation }) {

  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { i18n, t } = useTranslation()
  const { setMobile: setContextMobile } = usePatient()

  console.log(mobile)

  // ─── Handlers ───────────────────────────────────────────────
  const handlePress = (num) => {
    if (mobile.length < 10) {
      setMobile(prev => prev + num)
      setErrorMsg('') 
    }
  }

  const handleDelete = () => {
    setMobile(prev => prev.slice(0, -1))
  }

  const handleSendOTP = async () => {
    if (mobile.length !== 10) return

    setLoading(true)
    setErrorMsg('')

    try {
      await sendOtp(mobile)
      setContextMobile(mobile) 
      navigation.navigate('VerifyOTP')
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const langColor = (code) =>
    i18n.language === code ? '#00A4A4' : '#000000'

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'X', '0', '⌫']

  // ─── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>

        {/* Back Button */}
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/back-arrow.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {/* Logo */}
        <Image
          source={require('../assets/balaji-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Secure Badge */}
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

        {/* Left Side */}
        <View style={styles.leftSide}>

          {/* Heading */}
          <View>
            <Text style={styles.heading}>
              {t('verify_mobile.title_line1')}{' '}
              <Text style={styles.headingHighlight}>{t('verify_mobile.title_highlight')}</Text>
            </Text>
            <Text style={styles.subheading}>
              {t('verify_mobile.subtitle')}
            </Text>
          </View>

          {/* Input + Numpad */}
          <View style={{ width: 500, rowGap: 19 }}>

            {/* Input Box */}
            <View style={styles.inputBox}>

              {/* Country Code */}
              <Text style={styles.countryCode}>+91</Text>

              {/* Divider */}
              <View style={styles.inputDivider} />

              {/* Number Input */}
              <View style={{ width: 230 }}>
                <Text>{t('verify_mobile.placeholder')}</Text>
                <TextInput
                  value={mobile}
                  style={styles.inputBoxNum}
                  placeholder="9876543210"
                  placeholderTextColor="#737373"
                />
              </View>

              {/* Call Icon */}
              <Image
                source={require('../assets/Call.png')}
                style={styles.callIcon}
                resizeMode="contain"
              />

            </View>

            {/* Error Message */}
            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}

            {/* Number Pad */}
            <View style={styles.numpad}>
              {keys.map((key) => (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.key,
                    key === 'X' && styles.keyDisabled,
                    pressed && styles.keyPressed,
                  ]}
                  onPress={() => {
                    if (key === '⌫') handleDelete()
                    else if (key === 'X') {}
                    else handlePress(key)
                  }}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </Pressable>
              ))}
            </View>

          </View>

        </View>

        {/* Right Side */}
        <View style={styles.rightSide}>

          {/* Illustration */}
          <Image
            source={require('../assets/verify-mobile-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />

          {/* Send OTP Button */}
          <Pressable
            style={({ pressed }) => [
              styles.sendOTPButton,
              (mobile.length !== 10 || loading) && styles.sendOTPDisabled,
              pressed && styles.sendOTPPressed,
            ]}
            onPress={handleSendOTP}
            disabled={mobile.length !== 10 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendOTPText}>{t('verify_mobile.send_otp')}</Text>
            )}
          </Pressable>

        </View>

      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>

        {/* Languages */}
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

      </View>

    </View>
  )
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // Container
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 2,
  },
  headerLeft: {
    width: '20%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 150,
    height: 50,
  },
  logo: {
    width: 500,
    height: 80,
  },
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
  secureIcon: {
    width: 20,
    height: 20,
  },
  secureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#485260',
  },

  // ── Body ──
  body: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 150,
    paddingVertical: 1,
  },

  // Left Side
  leftSide: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
    paddingRight: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#001532',
    marginBottom: 8,
  },
  headingHighlight: {
    color: '#00A4A4',
  },
  subheading: {
    fontSize: 20,
    fontWeight: '400',
    color: '#485260',
    marginBottom: 24,
  },

  // Input Box
  inputBox: {
    borderWidth: 1,
    borderColor: '#00A4A4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: 428,
    flexDirection: 'row',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
  },
  inputDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#737373',
  },
  countryCode: {
    fontSize: 32,
    fontWeight: '700',
  },
  inputBoxNum: {
    fontSize: 30,
    fontWeight: '500',
    letterSpacing: '20%',
    color: '#000000',
  },
  callIcon: {
    width: 45,
    height: 35,
  },

  // Error text
  errorText: {
    color: '#E53E3E',
    fontSize: 15,
    fontWeight: '500',
  },

  // Numpad
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    columnGap: 20,
    marginBottom: 20,
  },
  key: {
    width: 128,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#73737326',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.24)',
  },
  keyDisabled: {
    backgroundColor: '#73737326',
  },
  keyPressed: {
    backgroundColor: '#00A4A420',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#001532',
    userSelect: 'none',
  },

  // Right Side
  rightSide: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '90%',
  },

  // Send OTP Button
  sendOTPButton: {
    position: 'absolute',
    bottom: 5,
    right: 50,
    backgroundColor: '#00A4A4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: 360,
  },
  sendOTPDisabled: {
    backgroundColor: '#73737340',
  },
  sendOTPPressed: {
    opacity: 0.8,
  },
  sendOTPText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Footer ──
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  footerLangActive: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  footerIcon: {
    width: 24,
    height: 24,
  },
  footerText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
  },
  footerDivider: {
    fontSize: 24,
    color: '#73737366',
  },
  needHelpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 10,
  },
  needHelpIcon: {
    width: 35,
    height: 35,
  },
  needHelpSub: {
    fontSize: 12,
    fontWeight: '500',
  },

})