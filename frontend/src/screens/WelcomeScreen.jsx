import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ImageBackground,
  Dimensions,
  TouchableOpacity
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../constants/colors";
import { useTranslation } from 'react-i18next'

export default function WelcomeScreen({ navigation }) {
  const [dateTime, setDateTime] = useState("");
  const { i18n, t } = useTranslation()
  const { width, height } = Dimensions.get("window");
  
  // DATE AND TIME
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const date = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      setDateTime(`${time} | ${date}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper so the active language label is always highlighted correctly
  const langColor = (code) =>
    i18n.language === code ? "#00A4A4" : "#485260";

  return (
    <ImageBackground
      source={require("../assets/welcome-screen-background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../assets/livway-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={[styles.secureBadge, styles.secureBorder]}>
          <Image
            source={require("../assets/secure-icon.png")}
            style={styles.secureIcon}
            resizeMode="contain"
          />
          <Text style={styles.secureText}>{t('common.secure_badge')}</Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        <Text style={styles.heading}>
          {t('welcome.title')}{'\n'} {t('welcome.hospital_name')}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "30%",
            border: 2,
            gap: 12,
            borderColor: '#000000'
          }}
        >
          <View
            style={{
              flex: 1,
              height: 1,
              width: 25,
              backgroundColor: "#00A4A4",
              // marginRight: 10,
            }}
          />

          <Text style={styles.subheading}>
            {t('welcome.subtitle')}
          </Text>

          <View
            style={{
              flex: 1,
              height: 1,
              width: 25,
              backgroundColor: "#00A4A4",
              // marginLeft: 10,
            }}
          />
        </View>
        {/* 3 CARDS */}
        <View style={styles.cardsRow}>
          {/* Card 1 - Register */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate("VerifyMobile")}
          >
            <Image
              source={require("../assets/register-patient-icon.png")}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardHeading}>{t('welcome.register_new_patient')}</Text>
            <Text style={styles.cardSubheading}>{t('welcome.register_new_patient_sub')}</Text>
            <Image
              source={require("../assets/Forward Button.png")}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </Pressable>

          {/* Card 2 - Existing */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: "#0A8598" },
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate('PatientLookupScreen')}
          >
            <Image
              source={require("../assets/existing-patient-icon.png")}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardHeading}>{t('welcome.existing_patient')}</Text>
            <Text style={styles.cardSubheading}>{t('welcome.existing_patient_sub')}</Text>
            <Image
              source={require("../assets/Forward Button.png")}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </Pressable>

          {/* Card 3 - Scan QR */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate("ComingSoonScreen")}
          >
            <Image
              source={require("../assets/scan-qr-icon.png")}
              style={[styles.cardIcon]}
              resizeMode="contain"
            />
            <Text style={styles.cardHeading}>{t('welcome.scan_qr')}</Text>
            <Text style={styles.cardSubheading}>{t('welcome.scan_qr_sub')}</Text>
            <Image
              source={require("../assets/Forward Button.png")}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        {/* Date Time */}
        <View
          style={[
            styles.footerLeft,
            {
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 17,
              paddingVertical: 14,
              borderRadius: 10,
            },
          ]}
        >
          <Image
            source={require("../assets/Clock.png")}
            style={styles.footerIcon}
            resizeMode="contain"
          />
          <Text style={[styles.footerText, { color: "#434343" }]}>
            {dateTime}
          </Text>
        </View>

        {/* Languages */}
        <View
          style={[
            styles.footerCenter,
            {
              backgroundColor: "#ffffff",
              elevation: 20,
              paddingHorizontal: 17,
              paddingVertical: 14,
              borderRadius: 10,
            },
          ]}
        >
          <View style={{ flex: 1, flexDirection: "row", gap: 8 }}>
            <Image
              source={require("../assets/Globe.png")}
              style={styles.footerIcon}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={() => i18n.changeLanguage('en')}>
              <Text
                style={[
                  styles.footerText,
                  styles.footerBoldText,
                  { color: langColor('en'), padding: 0 },
                ]}
              >
                {t('common.english')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity onPress={() => i18n.changeLanguage('hi')}>
            <Text
              style={[
                styles.footerText,
                styles.footerBoldText,
                { color: langColor('hi') },
              ]}
            >
              {t('common.hindi')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity onPress={() => i18n.changeLanguage('mr')}>
            <Text
              style={[
                styles.footerText,
                styles.footerBoldText,
                { color: langColor('mr') },
              ]}
            >
              {t('common.marathi')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Need Help */}
        <View
          style={[
            styles.footerRight,
            {
              backgroundColor: "#ffffff",
              paddingHorizontal: 17,
              paddingVertical: 9,
              borderRadius: 10,
            },
          ]}
        >
          <Image
            source={require("../assets/headset-icon.png")}
            style={{ width: 35, height: 35 }}
            resizeMode="cover"
          />
          <View>
            <Text style={[styles.footerText, { color: "#000000" }]}>
              {t('common.need_help')}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "500" }}>
              {t('common.tap_for_assistance')}
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: " 100%",
    height: "100%",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 0,
    // borderBottomWidth: 1,
    // borderBottomColor: "#73737326",
  },
  logo: {
    width: 160,
    height: 100,
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingRight: 27,
    paddingBottom: 10,
    paddingLeft: 27,
    gap: 8,
  },
  secureIcon: {
    width: 20,
    height: 20,
  },
  secureText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#00A4A4",
  },

  secureBorder: {
    borderColor: "#00A4A4",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 27,
  },

  // BODY
  body: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: "center",
  },
  heading: {
    fontSize: 60,
    fontWeight: "700",
    color: "#1E363F",
    width: "50%",
    lineHeight: "120%",
    letterSpacing: 0,
    textAlign: "center",
  },
  subheading: {
    fontSize: 21,
    fontWeight: "500",
    color: "#737373",
    textAlign: "center",
    marginTop: 0,
  },

  // CARDS
  cardsRow: {
    flexDirection: "row",
    gap: 30, // 40 tha
    marginTop: 20, // 60 tha
  },
  card: {
    width: 260, // 280 tha
    height: 300, // 280 tha
    backgroundColor: "#00A4A4",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 16, // ye add karo
    paddingVertical: 20,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  cardIcon: {
    width: 120,
    height: 120,
  },
  cardHeading: {
    fontSize: 38, // 48 tha
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  cardSubheading: {
    fontSize: 22, // 36 tha
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },

  // FOOTER
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 0,
    marginBottom: 5,
    // borderTopWidth: 1,
    // borderTopColor: "#73737326",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerCenter: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -86,
    gap: 30,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerIcon: {
    width: 24,
    height: 24,
    padding: 0
  },
  footerText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#485260",
  },
  footerBoldText: {
    fontWeight: 600,
    paddingHorizontal: 12,
  },
  footerDivider: {
    fontSize: 24,
    color: "#73737366",
  },
});