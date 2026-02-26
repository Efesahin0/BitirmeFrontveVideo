import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Loading,
  CustomTextInput,
  CustomButton,
} from "../components";
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

      // 🔥 Doğru: Kullanıcıyı login yap
      dispatch(setUser(result.data.user));
      dispatch(setToken(result.data.token));
      dispatch(setAuth(true)); // 🔥 BURASI ÇOK ÖNEMLİ

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
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.outerContainer}>
          <Image
            style={styles.logo}
            source={require("../../assets/images/logo.png")}
          />

          <View style={styles.loginBox}>
            <Text style={styles.welcome}>WELCOME TO GYM APP</Text>

            <CustomTextInput
              title="E-mail"
              isSecureText={false}
              handleonChangeText={(text) => dispatch(setEmail(text))}
              handleValue={email}
              handlePlaceholder="Enter your e-mail"
            />

            <CustomTextInput
              title="Password"
              isSecureText={true}
              handleonChangeText={(text) => dispatch(setPassword(text))}
              handleValue={password}
              handlePlaceholder="Enter your password"
            />

            <View style={styles.buttonContainer}>
              <CustomButton
                buttonText="SIGN IN"
                setWidth="100%"
                handleOnPress={handleLogin}
                buttonColor="#D6B982"
                pressedButtonColor="#C0A673"
              />

              <CustomButton
                buttonText="SIGN UP"
                setWidth="100%"
                handleOnPress={() => navigation.navigate("Signup")}
                buttonColor="transparent"
                pressedButtonColor="rgba(214,185,130,0.2)"
                textColor="#D6B982"
                borderColor="#D6B982"
              />
            </View>
          </View>

          {isLoading && (
            <Loading changeIsLoading={() => dispatch(setIsLoading(false))} />
          )}
        </View>
      </SafeAreaView>
    </Layout>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  outerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 35,
    resizeMode: "contain",
  },
  loginBox: {
    width: "85%",
    backgroundColor: "rgba(15, 15, 15, 0.7)",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(214,185,130,0.15)",
    shadowColor: "#D6B982",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  welcome: {
    color: "#D6B982",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30,
    letterSpacing: 1,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 25,
    gap: 12,
  },
});
