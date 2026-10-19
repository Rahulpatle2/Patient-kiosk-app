import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// ---------------------------------------------------------------------------
// TEMPORARY ICONS (internet images). Replace with local assets when ready, e.g.
//   const SCAN_ICON = require("../assets/scan-aadhaar-icon.png");
// <Image source={...}> accepts both a require() result and { uri }.
// ---------------------------------------------------------------------------
const SCAN_ICON = {
  uri: "https://img.icons8.com/ios-filled/200/ffffff/identification-documents.png",
};
const MANUAL_ICON = {
  uri: "https://img.icons8.com/ios-filled/200/ffffff/edit.png",
};

// Route names - change here if your navigator uses different names
const ROUTES = {
  scanAadhaar: "ScanAadharScreen",
  fillManually: "PatientInfoScreen",
};

export default function FormFillOptionsScreen({ navigation }) {
  const [dateTime, setDateTime] = useState("");
  const { i18n, t } = useTranslation();

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
          <Text style={styles.secureText}>{t("common.secure_badge")}</Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        <Text style={styles.heading}>{t("formFillOptions.title")}</Text>

        <View style={styles.subheadingRow}>
          <View style={styles.subheadingLine} />
          <Text style={styles.subheading}>{t("formFillOptions.subtitle")}</Text>
          <View style={styles.subheadingLine} />
        </View>

        {/* 2 CARDS */}
        <View style={styles.cardsRow}>
          {/* Card 1 - Scan Aadhaar */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: "#00A4A4" },
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate('ScanAadhar')}
          >
            <Image
              source={SCAN_ICON}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardHeading}>
              {t("formFillOptions.scan_aadhaar")}
            </Text>
            <Text style={styles.cardSubheading}>
              {t("formFillOptions.scan_aadhaar_sub")}
            </Text>
            <Image
              source={require("../assets/Forward Button.png")}
              style={styles.forwardIcon}
              resizeMode="contain"
            />
          </Pressable>

          {/* Card 2 - Fill Manually */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: "#1E363F" },
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate("PatientInfo")}
          >
            <Image
              source={MANUAL_ICON}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardHeading}>
              {t("formFillOptions.fill_manually")}
            </Text>
            <Text style={styles.cardSubheading}>
              {t("formFillOptions.fill_manually_sub")}
            </Text>
            <Image
              source={require("../assets/Forward Button.png")}
              style={styles.forwardIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        {/* Date Time */}
        <View style={[styles.footerLeft, styles.footerPill]}>
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
        <View style={[styles.footerCenter, styles.footerPill, { elevation: 20 }]}>
          <View style={{ flex: 1, flexDirection: "row", gap: 8 }}>
            <Image
              source={require("../assets/Globe.png")}
              style={styles.footerIcon}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={() => i18n.changeLanguage("en")}>
              <Text
                style={[
                  styles.footerText,
                  styles.footerBoldText,
                  { color: langColor("en"), padding: 0 },
                ]}
              >
                {t("common.english")}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity onPress={() => i18n.changeLanguage("hi")}>
            <Text
              style={[
                styles.footerText,
                styles.footerBoldText,
                { color: langColor("hi") },
              ]}
            >
              {t("common.hindi")}
            </Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity onPress={() => i18n.changeLanguage("mr")}>
            <Text
              style={[
                styles.footerText,
                styles.footerBoldText,
                { color: langColor("mr") },
              ]}
            >
              {t("common.marathi")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Need Help */}
        <View
          style={[
            styles.footerRight,
            styles.footerPill,
            { paddingVertical: 9 },
          ]}
        >
          <Image
            source={require("../assets/headset-icon.png")}
            style={{ width: 35, height: 35 }}
            resizeMode="cover"
          />
          <View>
            <Text style={[styles.footerText, { color: "#000000" }]}>
              {t("common.need_help")}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "500" }}>
              {t("common.tap_for_assistance")}
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
    width: "100%",
    height: "100%",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  logo: {
    width: 160,
    height: 100,
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 27,
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
    alignItems: "center",
  },
  heading: {
    fontSize: 52,
    fontWeight: "700",
    color: "#1E363F",
    width: "60%",
    lineHeight: 64,
    textAlign: "center",
  },
  subheadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },
  subheadingLine: {
    height: 1,
    width: 25,
    backgroundColor: "#00A4A4",
  },
  subheading: {
    fontSize: 21,
    fontWeight: "500",
    color: "#737373",
    textAlign: "center",
  },

  // CARDS
  cardsRow: {
    flexDirection: "row",
    gap: 40,
    marginTop: 30,
  },
  card: {
    width: 340,
    height: 340,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
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
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  cardSubheading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  forwardIcon: {
    width: 60,
    height: 60,
  },

  // FOOTER
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 0,
    marginBottom: 5,
  },
  footerPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 17,
    paddingVertical: 14,
    borderRadius: 10,
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
    padding: 0,
  },
  footerText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#485260",
  },
  footerBoldText: {
    fontWeight: "600",
    paddingHorizontal: 12,
  },
  footerDivider: {
    fontSize: 24,
    color: "#73737366",
  },
});