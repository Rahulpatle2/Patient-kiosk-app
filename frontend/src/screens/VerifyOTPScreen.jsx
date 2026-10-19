import { StyleSheet, Text, View, Pressable, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { usePatient } from '../context/PatientContext'
import { sendOtp, verifyOtp } from '../api/patientApi'


const OTP_LENGTH = 6
const TIMER_SECONDS = 30

export default function VerifyOTPScreen({ navigation, route }) {

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(TIMER_SECONDS)
  const [canResend, setCanResend] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRefs = useRef([])
  const { i18n, t } = useTranslation()
  const { mobile } = usePatient()

  // ─── Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true)
      return
    }
    const interval = setInterval(() => {
      setTimer(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  // ─── Handlers ────────────────────────────────────────────────
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp]
    newOtp[index] = text
    setOtp(newOtp)
    setErrorMsg('')

    // Auto move to next box
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus()
    }

    // Auto verify when all filled
    if (newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleVerify = async (enteredOtp) => {
    setVerifying(true)
    setErrorMsg('')

    try {
      await verifyOtp(mobile, enteredOtp)
      navigation.navigate('PatientInfo')
      // navigation.navigate('FormFillOptions')
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0].focus()
    } finally {
      setVerifying(false)
    }
  }

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    try {
      await sendOtp(mobile)
      setOtp(['', '', '', '', '', ''])
      setTimer(TIMER_SECONDS)
      setCanResend(false)
      setErrorMsg('')
      inputRefs.current[0].focus()
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to resend OTP.')
    }
  }

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const maskedMobile = mobile ? `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}` : ''

  const langColor = (code) =>
    i18n.language === code ? '#00A4A4' : '#000000'

  // ─── Render ──────────────────────────────────────────────────
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

        {/* Left Side */}
        <View style={styles.leftSide}>

          {/* Heading */}
          <Text style={styles.heading}>{t('verify_otp.title')}</Text>
          <Text style={styles.subheading}>
            {t('verify_otp.subtitle')}{' '}
           </Text>
          <Text style={styles.highlight}>{maskedMobile}</Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                ]}
                value={digit}
                onChangeText={text => handleOtpChange(text.slice(-1), index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                editable={!verifying}
              />
            ))}
          </View>

          {/* Verifying indicator */}
          {verifying && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color="#00A4A4" />
              <Text style={styles.timerText}>Verifying...</Text>
            </View>
          )}

          {/* Error Message */}
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          {/* Timer */}
          {!verifying && (
            <Text style={styles.timerText}>
              {t('verify_otp.auto_submit')}{' '}
              <Text style={styles.timerHighlight}>{formatTimer(timer)}</Text>
            </Text>
          )}

          {/* Resend OTP */}
          <View style={styles.actionsRow}>

            <View
              style={[styles.actionButton, !canResend && styles.actionDisabled]}
              
            >
             <View style={{flexDirection:'row', alignItems:'center', columnGap:12}}>
               <Image
                source={require('../assets/message.png')}
                style={styles.actionIcon}
                resizeMode="contain"
              />
              <View>
                <Text style={[styles.actionText, !canResend && styles.actionTextDisabled]}>
                  {t('verify_otp.didnt_receive')}
                </Text>
                <Text style={[styles.actionSubText, !canResend && styles.actionTextDisabled]}>
                  {canResend ? t('verify_otp.resend_otp') : `${t('verify_otp.resend_otp')} ${formatTimer(timer)}`}
                </Text>
              </View>
             </View>
             {/* divider */}
             <View style={{width:1, height:'80%',backgroundColor:'#737373'}}/>

              <Pressable style={{flexDirection:'row', alignItems:'center',gap:7}} onPress={handleResend}>
                 <Text style={{color:'#00A4A4', fontWeight:'700'}}>{t('verify_otp.resend_otp')}</Text>
                 <Image style={{width:18, height:18}} source={require('../assets/Restart.png')} />
              </Pressable>
            </View>

            <View style={[styles.actionButton, {justifyContent:'space-between'}]}>
              <View style={{flexDirection:'row', alignItems:'center', columnGap:12}}>
                <Image
                source={require('../assets/circle-call.png')}
                style={styles.actionIcon}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.actionText}>{t('verify_otp.having_trouble')}</Text>
                <Text style={styles.actionSubText}>{t('verify_otp.get_call_otp')}</Text>
              </View>
              </View>

              <Pressable style={{borderColor:'#00A4A4', borderWidth:1, flexDirection:'row', alignItems:'center', borderRadius:10, paddingHorizontal:10, paddingVertical:5, columnGap:5}}>
                <Image style={{width:18, height:18}} source={require('../assets/Call-2.png')}/>
                <Text style={{color:'#00A4A4', fontWeight:'500'}}>{t('verify_otp.get_call_otp')}</Text>
              </Pressable>
            </View>

          </View>

        </View>

        {/* Right Side */}
        <View style={styles.rightSide}>
          <Image
            source={require('../assets/verify-otp-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
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

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

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
    alignItems:'center',
    gap: 10,
    paddingRight: 40,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#001532',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '400',
    color: '#485260',
  },
  highlight: {
    color: '#00A4A4',
    fontWeight: '600',
    fontSize:18
  },

  // OTP Boxes
  otpRow: {
    flexDirection: 'row',
    gap: 16,
  },
  otpBox: {
    width: 72,
    height: 72,
    borderWidth: 1,
    borderColor: '#73737340',
    outlineColor:'#00A4A4',
    borderRadius: 12,
    paddingLeft:25,
    fontSize: 32,
    fontWeight: '700',
    color: '#001532',
    backgroundColor: '#F9FFFF',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
  },
  otpBoxFilled: {
    borderColor: '#00A4A4',
    // outlineColor:'#00A4A4',
    backgroundColor: '#ffffff',
  },

  // Error text
  errorText: {
    color: '#E53E3E',
    fontSize: 15,
    fontWeight: '500',
  },

  // Timer
  timerText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#485260',
  },
  timerHighlight: {
    color: '#00A4A4',
    fontWeight: '700',
  },

  // Action Buttons
  actionsRow: {
    flexDirection: 'column',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: '#73737326',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FFFF',
  },
  actionDisabled: {
    opacity: 0.4,
  },
  actionIcon: {
    width: 28,
    height: 28,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001532',
  },
  actionSubText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#00A4A4',
  },
  actionTextDisabled: {
    color: '#737373',
  },

  // Right Side
  rightSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '90%',
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