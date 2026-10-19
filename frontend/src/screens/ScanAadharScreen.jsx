import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";

// ─── Config ───────────────────────────────────────────────────
const AADHAAR_API_URL = "http://localhost:8000/id"; // TODO: move to your config / .env
const REQUEST_TIMEOUT_MS = 20000;
const MAX_ATTEMPTS = 3;
const CAMERA_FACING = "back"; // change to "front" if the kiosk tablet scans with the front camera
const FRAME_SIZE = 300;

// Route name - change here if your navigator uses a different one
const ROUTES = { patientInfo: "PatientInfoScreen" };

// TEMPORARY icon (internet image). Replace with require("../assets/scan-qr-icon.png")
const QR_ICON = {
  uri: "https://img.icons8.com/ios-filled/200/ffffff/qr-code.png",
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

// ─── Helpers ──────────────────────────────────────────────────
const formatAadhaar = (digits) => digits.replace(/(\d{4})(?=\d)/g, "$1 ");

const titleCase = (str) =>
  (str || "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

// "04-06-2012" (DD-MM-YYYY) -> "2012-06-04" (YYYY-MM-DD). Returns "" if not a full date.
const dobToIso = (dob) => {
  const parts = (dob || "").split(/[-/]/);
  if (parts.length !== 3) return "";
  const [dd, mm, yyyy] = parts;
  if (yyyy.length !== 4) return "";
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

const mapGender = (g) =>
  ({ M: "Male", F: "Female", T: "Other" }[(g || "").toUpperCase()] || "");

const splitName = (fullName) => {
  const tokens = (fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: titleCase(tokens[0] || ""),
    middleName: titleCase(tokens.slice(1, -1).join(" ")),
    lastName: titleCase(tokens.length > 1 ? tokens[tokens.length - 1] : ""),
  };
};

// API json -> shape that PatientInfoScreen expects in route.params.prefill
const buildPrefill = (data) => ({
  ...splitName(data.name),
  gender: mapGender(data.gender),
  dob: dobToIso(data.dob), // "YYYY-MM-DD" (string, so navigation params stay serializable)
  houseNo: titleCase([data.house, data.street].filter(Boolean).join(", ")),
  landmark: titleCase([data.landmark, data.location].filter(Boolean).join(", ")),
  city: titleCase(data.district || data.vtc),
  state: titleCase(data.state),
});

// ─── Screen ───────────────────────────────────────────────────
export default function ScanAadharScreen({ navigation }) {
  const { i18n, t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();

  const [dateTime, setDateTime] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState(""); // digits only, max 12
  const [scanData, setScanData] = useState(null); // json returned by /id
  const [cameraOpen, setCameraOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | verifying
  const [failure, setFailure] = useState(null); // null | mismatch | read | permission
  const [attempts, setAttempts] = useState(0);

  const scannedRef = useRef(false);
  const laserY = useRef(new Animated.Value(0)).current;

  const isComplete = aadhaarNumber.length === 12;
  const attemptsLeft = attempts < MAX_ATTEMPTS;

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

  // SCANNING LASER ANIMATION (runs while the camera overlay is open)
  useEffect(() => {
    if (!cameraOpen) return;
    laserY.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserY, {
          toValue: FRAME_SIZE - 4,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(laserY, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [cameraOpen, laserY]);

  // Clear the Aadhaar number + scanned data whenever the user leaves this screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        setAadhaarNumber("");
        setScanData(null);
        setCameraOpen(false);
        setStatus("idle");
        setFailure(null);
        setAttempts(0);
        scannedRef.current = false;
      };
    }, [])
  );

  // ─── Handlers ───────────────────────────────────────────────
  const handleKey = (key) => {
    if (key === "clear") return setAadhaarNumber("");
    if (key === "back") return setAadhaarNumber((p) => p.slice(0, -1));
    setAadhaarNumber((p) => (p.length < 12 ? p + key : p));
  };

  const openScanner = async () => {
    if (!isComplete) return;
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setFailure("permission");
        return;
      }
    }
    scannedRef.current = false;
    setStatus("idle");
    setCameraOpen(true);
  };

  const closeCamera = () => {
    setCameraOpen(false);
    setStatus("idle");
    scannedRef.current = false;
  };

  const handleFailure = (type) => {
    setCameraOpen(false);
    setStatus("idle");
    setScanData(null); // don't keep personal data around after a failed check
    setFailure(type);
    setAttempts((a) => a + 1);
    scannedRef.current = false;
  };

  const handleBarcodeScanned = async ({ data }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setStatus("verifying");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(AADHAAR_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_data: data }),
        signal: controller.signal,
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.detail || "API error");

      setScanData(json);

      // Validation: last 4 digits typed by user vs last 4 digits in the QR data
      const typedLast4 = aadhaarNumber.slice(-4);
      if (String(json.aadhaar_last_4_digit) === typedLast4) {
        setCameraOpen(false);
        setStatus("idle");
        navigation.navigate(ROUTES.patientInfo, { prefill: buildPrefill(json) });
      } else {
        handleFailure("mismatch");
      }
    } catch (e) {
      handleFailure("read");
    } finally {
      clearTimeout(timer);
    }
  };

  const langColor = (code) =>
    i18n.language === code ? "#00A4A4" : "#485260";

  const failureMessage = () => {
    if (failure === "permission") return t("scanAadhaar.permission_denied");
    if (failure === "mismatch" || !attemptsLeft) return t("scanAadhaar.fail_counter");
    return t("scanAadhaar.fail_read");
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require("../assets/welcome-screen-background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← {t("scanAadhaar.back")}</Text>
          </Pressable>
          <Image
            source={require("../assets/livway-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
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
        <Text style={styles.heading}>{t("scanAadhaar.title")}</Text>
        <View style={styles.subheadingRow}>
          <View style={styles.subheadingLine} />
          <Text style={styles.subheading}>{t("scanAadhaar.subtitle")}</Text>
          <View style={styles.subheadingLine} />
        </View>

        <View style={styles.panelsRow}>
          {/* STEP 1 - Aadhaar number */}
          <View style={styles.inputPanel}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepLabel}>{t("scanAadhaar.step1_label")}</Text>
            </View>

            <View style={[styles.inputBox, isComplete && styles.inputBoxDone]}>
              <Text
                style={[
                  styles.inputText,
                  !aadhaarNumber && styles.inputPlaceholder,
                ]}
              >
                {aadhaarNumber
                  ? formatAadhaar(aadhaarNumber)
                  : t("scanAadhaar.step1_placeholder")}
              </Text>
            </View>
            <Text style={styles.countText}>
              {t("scanAadhaar.digits_count", { count: aadhaarNumber.length })}
            </Text>

            <View style={styles.keypad}>
              {KEYS.map((key) => (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.key,
                    (key === "clear" || key === "back") && styles.keyAction,
                    pressed && styles.keyPressed,
                  ]}
                  onPress={() => handleKey(key)}
                >
                  <Text
                    style={[
                      styles.keyText,
                      (key === "clear" || key === "back") && styles.keyActionText,
                    ]}
                  >
                    {key === "clear"
                      ? t("scanAadhaar.clear")
                      : key === "back"
                      ? "⌫"
                      : key}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* STEP 2 - Scan QR */}
          <View style={styles.scanColumn}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepLabel}>{t("scanAadhaar.step2_label")}</Text>
            </View>

            <Pressable
              disabled={!isComplete}
              style={({ pressed }) => [
                styles.card,
                !isComplete && styles.cardDisabled,
                pressed && styles.cardPressed,
              ]}
              onPress={openScanner}
            >
              <Image
                source={QR_ICON}
                style={styles.cardIcon}
                resizeMode="contain"
              />
              <Text style={styles.cardHeading}>{t("scanAadhaar.scan_qr")}</Text>
              <Text style={styles.cardSubheading}>
                {t("scanAadhaar.scan_qr_sub")}
              </Text>
              <Image
                source={require("../assets/Forward Button.png")}
                style={styles.forwardIcon}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
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

        <View
          style={[styles.footerRight, styles.footerPill, { paddingVertical: 9 }]}
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

      {/* CAMERA + SCANNING ANIMATION OVERLAY */}
      {cameraOpen && (
        <View style={styles.overlay}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing={CAMERA_FACING}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={status === "idle" ? handleBarcodeScanned : undefined}
          />
          <View style={styles.cameraContent} pointerEvents="box-none">
            <Text style={styles.cameraHint}>{t("scanAadhaar.camera_hint")}</Text>

            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <Animated.View
                style={[styles.laser, { transform: [{ translateY: laserY }] }]}
              />
            </View>

            {status === "verifying" ? (
              <View style={styles.verifyRow}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.verifyText}>{t("scanAadhaar.verifying")}</Text>
              </View>
            ) : (
              <Pressable style={styles.cancelButton} onPress={closeCamera}>
                <Text style={styles.cancelText}>{t("scanAadhaar.cancel")}</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* FAILURE MESSAGE OVERLAY */}
      {failure && (
        <View style={[styles.overlay, styles.failureBackdrop]}>
          <View style={styles.failureCard}>
            <View style={styles.failureIcon}>
              <Text style={styles.failureIconText}>!</Text>
            </View>
            <Text style={styles.failureTitle}>{t("scanAadhaar.fail_title")}</Text>
            <Text style={styles.failureMessage}>{failureMessage()}</Text>

            {failure !== "permission" && attemptsLeft ? (
              <Pressable
                style={[styles.failureButton, { backgroundColor: "#00A4A4" }]}
                onPress={() => setFailure(null)}
              >
                <Text style={styles.failureButtonText}>
                  {t("scanAadhaar.try_again")}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[
                styles.failureButton,
                { backgroundColor: failure === "permission" ? "#00A4A4" : "#1E363F" },
              ]}
              onPress={() =>
                failure === "permission" ? setFailure(null) : navigation.popToTop()
              }
            >
              <Text style={styles.failureButtonText}>
                {failure === "permission"
                  ? t("scanAadhaar.try_again")
                  : t("scanAadhaar.go_to_start")}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%" },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 20 },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    elevation: 4,
  },
  backText: { fontSize: 16, fontWeight: "600", color: "#1E363F" },
  logo: { width: 160, height: 100 },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 27,
    gap: 8,
  },
  secureIcon: { width: 20, height: 20 },
  secureText: { fontSize: 15, fontWeight: "500", color: "#00A4A4" },
  secureBorder: {
    borderColor: "#00A4A4",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 27,
  },

  // BODY
  body: { flex: 1, alignItems: "center" },
  heading: {
    fontSize: 40,
    fontWeight: "700",
    color: "#1E363F",
    textAlign: "center",
  },
  subheadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 4,
  },
  subheadingLine: { height: 1, width: 25, backgroundColor: "#00A4A4" },
  subheading: {
    fontSize: 19,
    fontWeight: "500",
    color: "#737373",
    textAlign: "center",
  },
  panelsRow: {
    flexDirection: "row",
    gap: 40,
    marginTop: 16,
    alignItems: "flex-start",
  },

  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#00A4A4",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  stepLabel: { fontSize: 20, fontWeight: "700", color: "#1E363F" },

  // INPUT PANEL
  inputPanel: {
    width: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    elevation: 6,
  },
  inputBox: {
    height: 56,
    borderWidth: 1.5,
    borderColor: "#73737340",
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  inputBoxDone: { borderColor: "#00A4A4" },
  inputText: {
    fontSize: 26,
    fontWeight: "600",
    color: "#001532",
    letterSpacing: 2,
  },
  inputPlaceholder: { color: "#B5B5B5" },
  countText: {
    fontSize: 13,
    color: "#737373",
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 10,
  },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  key: {
    width: "31.5%",
    height: 56,
    borderRadius: 10,
    backgroundColor: "#F2FAFA",
    borderWidth: 1,
    borderColor: "#00A4A433",
    alignItems: "center",
    justifyContent: "center",
  },
  keyAction: { backgroundColor: "#E8EEF0" },
  keyPressed: { opacity: 0.6, transform: [{ scale: 0.96 }] },
  keyText: { fontSize: 24, fontWeight: "600", color: "#1E363F" },
  keyActionText: { fontSize: 18 },

  // SCAN CARD
  scanColumn: { alignItems: "flex-start" },
  card: {
    width: 340,
    height: 330,
    backgroundColor: "#0A8598",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  cardDisabled: { opacity: 0.45 },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  cardIcon: { width: 110, height: 110 },
  cardHeading: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  cardSubheading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  forwardIcon: { width: 56, height: 56 },

  // FOOTER
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  footerPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 17,
    paddingVertical: 14,
    borderRadius: 10,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerCenter: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -86,
    gap: 30,
  },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerIcon: { width: 24, height: 24, padding: 0 },
  footerText: { fontSize: 18, fontWeight: "500", color: "#485260" },
  footerBoldText: { fontWeight: "600", paddingHorizontal: 12 },
  footerDivider: { fontSize: 24, color: "#73737366" },

  // OVERLAYS
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, backgroundColor: "#000" },
  cameraContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  cameraHint: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  frame: { width: FRAME_SIZE, height: FRAME_SIZE },
  corner: {
    position: "absolute",
    width: 44,
    height: 44,
    borderColor: "#00E0E0",
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 14 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 14 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 14 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 14 },
  laser: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#00E0E0",
    elevation: 6,
  },
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  verifyText: { color: "#FFFFFF", fontSize: 20, fontWeight: "600" },
  cancelButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  cancelText: { fontSize: 20, fontWeight: "700", color: "#1E363F" },

  failureBackdrop: { backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  failureCard: {
    width: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 14,
  },
  failureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  failureIconText: { fontSize: 36, fontWeight: "800", color: "#E53E3E" },
  failureTitle: { fontSize: 28, fontWeight: "700", color: "#1E363F" },
  failureMessage: {
    fontSize: 20,
    fontWeight: "500",
    color: "#485260",
    textAlign: "center",
    marginBottom: 6,
  },
  failureButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  failureButtonText: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
});