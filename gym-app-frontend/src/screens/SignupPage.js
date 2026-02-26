import { StyleSheet, Text, View, Image, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { CustomButton, CustomTextInput } from "../components";
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

const handleRegister = async () => {
  if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
    Alert.alert("Eksik Bilgi", "Lütfen zorunlu alanları doldurun.");
    return;
  }

  // Backend'in beklediği alan adları ve formatlar
  const userData = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    password: password.trim(),

    // --- PHONE FORMAT FIX ---
    phone: phoneNumber ? phoneNumber.replace(/\s+/g, "") : null,

    // --- DATE FORMAT FIX (DD/MM/YYYY → YYYY-MM-DD) ---
    dateOfBirth: dateOfBirth
      ? dateOfBirth.split(/[-/.]/).reverse().join("-")
      : null,
  };

  try {
    const registerResponse = await ApiService.register(userData);

    if (registerResponse.success) {
      Alert.alert("Kayıt Başarılı", "Hesabınız oluşturuldu, giriş yapılıyor...");

      const loginResponse = await ApiService.login({
        email: userData.email,
        password: userData.password,
      });

      if (loginResponse.success) {
        dispatch(setAuth(true));
        dispatch(setUser(loginResponse.data.user));
        dispatch(setToken(loginResponse.data.token));

        Alert.alert("Giriş Başarılı", `Hoş geldiniz, ${loginResponse.data.user.firstName}!`);
      } else {
        Alert.alert("Giriş Hatası", loginResponse.message || "Giriş başarısız oldu.");
      }
    } else {
      Alert.alert("Kayıt Hatası", registerResponse.message || "Kayıt sırasında hata oluştu.");
    }
  } catch (error) {
    Alert.alert("Sunucu Hatası", error.message || "Sunucuya bağlanılamadı.");
  }
};


  return (
    <Layout>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          
          <View style={styles.loginBox}>
            
            <Image
              style={styles.image}
              source={require("../../assets/images/logo.png")}
            />
            <Text style={styles.signUp}>SIGN UP</Text>

            <View style={styles.TextInputContainer}>
              <CustomTextInput title="First Name" handleonChangeText={setFirstName} handleValue={firstName} />
              <CustomTextInput title="Last Name" handleonChangeText={setLastName} handleValue={lastName} />
              <CustomTextInput title="E-mail" handleonChangeText={setEmail} handleValue={email} />
              <CustomTextInput title="Password" isSecureText={true} handleonChangeText={setPassword} handleValue={password} />
              <CustomTextInput title="Phone (Optional)" handleonChangeText={setPhoneNumber} handleValue={phoneNumber} />
              <CustomTextInput title="Date of Birth (Optional)" handleonChangeText={setDateOfBirth} handleValue={dateOfBirth} />
            </View>

            <View style={styles.signupOptions}>
              <CustomButton
                buttonText="SIGN UP"
                setWidth="65%"
                handleOnPress={handleRegister}
                buttonColor="#D6B982"         // Gold
                pressedButtonColor="#C0A673" // Darker gold
                textColor="#000"
              />

              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.link}>Sign In</Text>
                </Text>
              </Pressable>
            </View>

          </View>
        </View>
      </SafeAreaView>
    </Layout>
  );
};

export default SignupPage;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginBox: {
    width: "85%",
    backgroundColor: "rgba(15, 15, 15, 0.7)",
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: "center",
    borderColor: "rgba(214,185,130,0.15)",
    borderWidth: 1,
    shadowColor: "#D6B982",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  image: {
    width: 110,
    height: 110,
    marginBottom: 10,
    resizeMode: "contain",
  },
  signUp: {
    color: "#D6B982",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 0,
    textAlign: "center",
  },
  TextInputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  signupOptions: {
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },
  linkText: {
    color: "white",
    fontWeight: "400",
    fontSize: 14,
    marginTop: 8,
  },
  link: {
    color: "#D6B982",
    fontWeight: "600",
  },
});
