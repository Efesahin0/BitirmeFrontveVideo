import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient"; // YENİ
import { Ionicons } from "@expo/vector-icons"; // YENİ
import { BlurView } from "expo-blur"; // YENİ

import { useDispatch, useSelector } from "react-redux";
import {
  setEmail,
  setPassword,
  setIsLoading,
  setAuth,
  setUser,
  setToken,
} from "../redux/userSlice";
import Layout from "../components/Layout";
import api from "../services/api";

const LoginPage = ({ navigation }) => {
  const { email, password, isLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    console.log("🚀 SIGN IN basıldı!");

    if (!email || !password) {
      Alert.alert("Hata", "Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    try {
      dispatch(setIsLoading(true));

      console.log("📡 Backend'e veri yollanıyor:", { email, password });
      const result = await api.login({ email, password });
      console.log("📥 Backend cevabı:", result);

      // 🔥 Kullanıcıyı login yap
      dispatch(setUser(result.data.user));
      dispatch(setToken(result.data.token));
      dispatch(setAuth(true));

      Alert.alert("Başarılı", `Hoş geldiniz, ${result.data.user.firstName}!`);
    } catch (error) {
      console.error("❌ Giriş Hatası:", error);
      Alert.alert("Hata", error?.message || "Giriş başarısız.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <Layout>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* 🖼️ LOGO ALANI */}
            <View style={styles.logoContainer}>
                <View style={styles.logoWrapper}>
                    <Image
                        style={styles.logo}
                        source={require("../../assets/images/logo.png")}
                    />
                </View>
                <Text style={styles.brandTitle}>GYM APP</Text>
                <Text style={styles.brandSubtitle}>Premium Fitness Deneyimi</Text>
            </View>

            {/* 🔐 LOGIN KARTI (Blur Effect) */}
            <View style={styles.cardContainer}>
                <BlurView intensity={30} tint="dark" style={styles.blurCard}>
                    <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
                    <Text style={styles.instructionText}>Devam etmek için giriş yapın</Text>

                    {/* E-MAIL INPUT */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>E-MAIL</Text>
                        <LinearGradient
                            colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                            style={styles.inputGradient}
                        >
                            <Ionicons name="mail-outline" size={20} color="#D6B982" style={{marginRight: 10}}/>
                            <TextInput
                                style={styles.input}
                                placeholder="ornek@email.com"
                                placeholderTextColor="#666"
                                onChangeText={(text) => dispatch(setEmail(text))}
                                value={email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </LinearGradient>
                    </View>

                    {/* PASSWORD INPUT */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>ŞİFRE</Text>
                        <LinearGradient
                            colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                            style={styles.inputGradient}
                        >
                            <Ionicons name="lock-closed-outline" size={20} color="#D6B982" style={{marginRight: 10}}/>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#666"
                                onChangeText={(text) => dispatch(setPassword(text))}
                                value={password}
                                secureTextEntry={true}
                            />
                        </LinearGradient>
                    </View>

                    {/* SIGN IN BUTTON */}
                    <Pressable
                        onPress={handleLogin}
                        disabled={isLoading}
                        style={({ pressed }) => [
                            styles.loginButton,
                            pressed && { opacity: 0.9 },
                            isLoading && { opacity: 0.7 }
                        ]}
                    >
                        <LinearGradient
                            colors={["#D6B982", "#b39666"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.loginButtonText}>GİRİŞ YAP</Text>
                            )}
                        </LinearGradient>
                    </Pressable>

                    {/* SIGN UP LINK */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Hesabın yok mu?</Text>
                        <Pressable onPress={() => navigation.navigate("Signup")}>
                            <Text style={styles.signupText}>Kayıt Ol</Text>
                        </Pressable>
                    </View>

                </BlurView>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Layout>
  );
};

export default LoginPage;

// 🎨 PREMİUM LUXURY STYLES
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  
  // LOGO SECTION
  logoContainer: {
      alignItems: 'center',
      marginBottom: 30,
  },
  logoWrapper: {
      shadowColor: "#D6B982",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      marginBottom: 10
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "cover",
  },
  brandTitle: {
      color: "#D6B982",
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: 2,
  },
  brandSubtitle: {
      color: "#888",
      fontSize: 12,
      letterSpacing: 1,
      textTransform: "uppercase"
  },

  // CARD SECTION
  cardContainer: {
      width: "90%",
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: "rgba(214, 185, 130, 0.2)",
  },
  blurCard: {
      padding: 25,
      backgroundColor: "rgba(0,0,0,0.4)",
  },
  welcomeText: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 5
  },
  instructionText: {
      color: "#666",
      fontSize: 14,
      textAlign: "center",
      marginBottom: 30
  },

  // INPUTS
  inputWrapper: {
      marginBottom: 20
  },
  inputLabel: {
      color: "#D6B982",
      fontSize: 11,
      fontWeight: "700",
      marginBottom: 8,
      marginLeft: 4,
      letterSpacing: 0.5
  },
  inputGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 15,
      height: 55,
      borderWidth: 1,
      borderColor: "#333"
  },
  input: {
      flex: 1,
      color: "#fff",
      fontSize: 16,
      height: '100%'
  },

  // BUTTONS
  loginButton: {
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
  loginButtonText: {
      color: "#000",
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: 1
  },

  // FOOTER
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 25,
      alignItems: 'center'
  },
  footerText: {
      color: "#888",
      fontSize: 14,
      marginRight: 5
  },
  signupText: {
      color: "#D6B982",
      fontSize: 14,
      fontWeight: "700",
      textDecorationLine: 'underline'
  }
});