import { StyleSheet, Text, View, Pressable, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function ComingSoonScreen({ navigation, route }) {
  const { i18n, t } = useTranslation()
  const featureName = route?.params?.title || 'This Feature'

  const langColor = (code) =>
    i18n.language === code ? '#00A4A4' : '#000000'

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
          <Text style={styles.secureText}>{t('common.secure_badge') || 'Secure • Private • Trusted'}</Text>
        </View>
      </View>

      {/* ── BODY ── */}
      <View style={styles.body}>
        <View style={styles.card}>
          
          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>UNDER DEVELOPMENT</Text>
          </View>

          {/* Big Coming Soon Text */}
          <Text style={styles.comingSoonTitle}>COMING SOON</Text>

          {/* Subtitle & Info */}
          <Text style={styles.subtitle}>
            We are working hard to bring <Text style={styles.highlight}>{featureName}</Text> to this kiosk very soon.
          </Text>

          <Text style={styles.helperText}>
            Please visit the reception counter for immediate assistance regarding this service.
          </Text>

          {/* Action Button */}
          <Pressable
            style={({ pressed }) => [
              styles.homeButton,
              pressed && styles.homeButtonPressed,
            ]}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.homeButtonText}>Return to Home</Text>
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
              <Text style={[styles.footerText, { color: langColor('en') }]}>{t('common.english') || 'English'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity onPress={() => i18n.changeLanguage('hi')}>
            <Text style={[styles.footerText, { color: langColor('hi') }]}>{t('common.hindi') || 'हिंदी'}</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity onPress={() => i18n.changeLanguage('mr')}>
            <Text style={[styles.footerText, { color: langColor('mr') }]}>{t('common.marathi') || 'मराठी'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.needHelpBox}>
          <Image
            source={require('../assets/headset-icon.png')}
            style={styles.needHelpIcon}
            resizeMode="cover"
          />
          <View>
            <Text style={[styles.footerText, { color: '#000000' }]}>{t('common.need_help') || 'Need Help?'}</Text>
            <Text style={styles.needHelpSub}>{t('common.tap_for_assistance') || 'Tap for assistance'}</Text>
          </View>
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 4,
  },
  headerLeft: { width: '20%' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 140, height: 48 },
  logo: { width: 450, height: 75 },
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
  secureText: { fontSize: 15, fontWeight: '500', color: '#485260' },

  // Body Content
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F9FFFF50',
  },
  card: {
    width: '65%',
    maxWidth: 680,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#00A4A425',
    paddingVertical: 48,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#00A4A4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  badge: {
    backgroundColor: '#00A4A415',
    borderWidth: 1,
    borderColor: '#00A4A4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A4A4',
    letterSpacing: 1.5,
  },
  comingSoonTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#001532',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#485260',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  highlight: {
    fontWeight: '700',
    color: '#00A4A4',
  },
  helperText: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: '#00A4A4',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonPressed: {
    opacity: 0.85,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#73737315',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  footerLangActive: { flexDirection: 'row', alignItems: 'center', columnGap: 6 },
  footerIcon: { width: 22, height: 22 },
  footerText: { fontSize: 17, fontWeight: '700', color: '#000000' },
  footerDivider: { fontSize: 20, color: '#73737366' },
  needHelpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#73737320',
  },
  needHelpIcon: { width: 30, height: 30 },
  needHelpSub: { fontSize: 11, fontWeight: '500', color: '#737373' },
})