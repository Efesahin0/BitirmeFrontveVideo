import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import Layout from "../components/Layout";
import ApiService from "../services/api";
import { useDispatch } from "react-redux";
import { setAuth, setUser, setToken } from "../redux/userSlice";

const SignupPage = ({ navigation }) => {
  const dispatch = useDispatch();

  // State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  const [loading, setLoading] = useState(false); // UX için local loading state

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen zorunlu alanları doldurun.");
      return;
    }

    setLoading(true);

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phoneNumber ? phoneNumber.replace(/\s+/g, "") : null,
      // DD/MM/YYYY -> YYYY-MM-DD format dönüşümü
      dateOfBirth: dateOfBirth
        ? dateOfBirth.split(/[-/.]/).reverse().join("-")
        : null,
    };

    try {
      const registerResponse = await ApiService.register(userData);

      if (registerResponse.success) {
        // Kullanıcıyı bilgilendirmeden hemen login deniyoruz (daha akıcı)
        const loginResponse = await ApiService.login({
          email: userData.email,
          password: userData.password,
        });

        if (loginResponse.success) {
          dispatch(setAuth(true));
          dispatch(setUser(loginResponse.data.user));
          dispatch(setToken(loginResponse.data.token));
          Alert.alert("Hoş Geldiniz", `Aramıza katıldığın için teşekkürler ${loginResponse.data.user.firstName}!`);
        } else {
          Alert.alert("Giriş Hatası", "Kayıt oldunuz ancak giriş yapılamadı. Lütfen giriş sayfasını kullanın.");
          navigation.navigate("Login");
        }
      } else {
        Alert.alert("Kayıt Hatası", registerResponse.message || "Kayıt sırasında hata oluştu.");
      }
    } catch (error) {
      Alert.alert("Sunucu Hatası", error.message || "Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            
            {/* 🖼️ HEADER LOGO */}
            <View style={styles.headerContainer}>
                <Image
                    style={styles.logo}
                    source={require("../../assets/images/logo.png")}
                />
                <Text style={styles.pageTitle}>HESAP OLUŞTUR</Text>
                <Text style={styles.pageSubtitle}>Fitness yolculuğuna bugün başla</Text>
            </View>

            {/* 📝 FORM CARD */}
            <View style={styles.cardContainer}>
                <BlurView intensity={30} tint="dark" style={styles.blurCard}>
                    
                    {/* AD & SOYAD (Yan Yana) */}
                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.inputLabel}>AD</Text>
                            <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]} style={styles.inputGradient}>
                                <Ionicons name="person-outline" size={18} color="#D6B982" style={{marginRight:8}}/>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Adın"
                                    placeholderTextColor="#666"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </LinearGradient>
                        </View>

                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>SOYAD</Text>
                            <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]} style={styles.inputGradient}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Soyadın"
                                    placeholderTextColor="#666"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </LinearGradient>
                        </View>
                    </View>

                    {/* E-MAIL */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>E-MAIL</Text>
                        <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]} style={styles.inputGradient}>
                            <Ionicons name="mail-outline" size={18} color="#D6B982" style={{marginRight:10}}/>
                            <TextInput
                                style={styles.input}
                                placeholder="ornek@email.com"
                                placeholderTextColor="#666"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </LinearGradient>
                    </View>

                    {/* PASSWORD */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>ŞİFRE</Text>
                        <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]} style={styles.inputGradient}>
                            <Ionicons name="lock-closed-outline" size={18} color="#D6B982" style={{marginRight:10}}/>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#666"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </LinearGradient>
                    </View>

                    {/* TELEFON & DOĞUM TARİHİ */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>TELEFON (Opsiyonel)</Text>
                        <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]} style={styles.inputGradient}>
                            <Ionicons name="call-outline" size={18} color="#D6B982" style={{marginRight:10}}/>
                            <TextInput
                                style={styles.input}
                                placeholder="5XX XXX XX XX"
                                placeholderTextColor="#666"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                            />
                        </LinearGradient>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>DOĞUM TARİHİ (GG.AA.YYYY)</Text>
                        <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]} style={styles.inputGradient}>
                            <Ionicons name="calendar-outline" size={18} color="#D6B982" style={{marginRight:10}}/>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 01.01.1995"
                                placeholderTextColor="#666"
                                value={dateOfBirth}
                                onChangeText={setDateOfBirth}
                                keyboardType="numeric"
                            />
                        </LinearGradient>
                    </View>

                    {/* REGISTER BUTTON */}
                    <Pressable
                        onPress={handleRegister}
                        disabled={loading}
                        style={({ pressed }) => [
                            styles.registerButton,
                            pressed && { opacity: 0.9 },
                            loading && { opacity: 0.7 }
                        ]}
                    >
                        <LinearGradient
                            colors={["#D6B982", "#b39666"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.registerButtonText}>KAYIT OL</Text>
                            )}
                        </LinearGradient>
                    </Pressable>

                    {/* LOGIN LINK */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Zaten hesabın var mı?</Text>
                        <Pressable onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.loginLink}>Giriş Yap</Text>
                        </Pressable>
                    </View>

                </BlurView>
            </View>

            <View style={{height: 40}} /> 
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Layout>
  );
};

export default SignupPage;

// 🎨 PREMIUM STYLES
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  
  // HEADER
  headerContainer: {
      alignItems: 'center',
      marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "cover",
    marginBottom: 0,
  },
  pageTitle: {
      color: "#D6B982",
      fontSize: 24,
      fontWeight: "900",
      letterSpacing: 1,
  },
  pageSubtitle: {
      color: "#888",
      fontSize: 12,
  },

  // CARD
  cardContainer: {
      width: "90%",
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: "rgba(214, 185, 130, 0.2)",
  },
  blurCard: {
      padding: 20,
      backgroundColor: "rgba(0,0,0,0.4)",
  },

  // FORM INPUTS
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between'
  },
  inputWrapper: {
      marginBottom: 15
  },
  inputLabel: {
      color: "#D6B982",
      fontSize: 10,
      fontWeight: "700",
      marginBottom: 6,
      marginLeft: 4,
      letterSpacing: 0.5
  },
  inputGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 15,
      height: 50,
      borderWidth: 1,
      borderColor: "#333"
  },
  input: {
      flex: 1,
      color: "#fff",
      fontSize: 14,
      height: '100%'
  },

  // BUTTONS
  registerButton: {
      marginTop: 10,
      borderRadius: 14,
      shadowColor: "#D6B982",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5
  },
  buttonGradient: {
      height: 55,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center'
  },
  registerButtonText: {
      color: "#000",
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: 1
  },

  // FOOTER
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
      alignItems: 'center'
  },
  footerText: {
      color: "#888",
      fontSize: 13,
      marginRight: 5
  },
  loginLink: {
      color: "#D6B982",
      fontSize: 13,
      fontWeight: "700",
      textDecorationLine: 'underline'
  }
});