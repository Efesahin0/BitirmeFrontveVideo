import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions // Ekran boyutunu almak için
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import Layout from "../components/Layout";
import { useSelector, useDispatch } from "react-redux";
import { setUserDetails, clearUser } from "../redux/userSlice";
import apiService from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Switch } from "react-native";
//import { useWater } from "../hooks/useWater";


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, userDetails } = useSelector((state) => state.user);

const [reminderEnabled, setReminderEnabledState] = useState(false);
const [reminderLoading, setReminderLoading] = useState(false);
  const [illnesses, setIllnesses] = useState({
    belFitigi: false,
    dizSakatligi: false,
    yuksekTansiyon: false,
  });

  const [goal, setGoal] = useState("Kilo Alma");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const [goalModal, setGoalModal] = useState(false);
  const [illnessModal, setIllnessModal] = useState(false);

  useEffect(() => {
    loadUserData();
    loadUserDetails();
  }, [user, userDetails]);

  useEffect(() => {
  (async () => {
    const s = await getWaterReminderSettings();
    setReminderEnabledState(!!s.enabled);
  })();
}, []);
  const loadUserData = async () => {
    try {
      if (user) {
        setUserData(user);
        return;
      }
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const parsedUser = JSON.parse(userString);
        setUserData(parsedUser);
      }
    } catch (error) {
      console.error("Kullanıcı bilgileri yüklenirken hata:", error);
    }
  };

  const loadUserDetails = async () => {
    try {
      if (userDetails) {
        setHeight(userDetails.height?.toString() || "");
        setWeight(userDetails.weight?.toString() || "");
        setGoal(userDetails.goal || "Kilo Alma");

        if (userDetails.injuries) {
          const injuriesArray = Array.isArray(userDetails.injuries)
            ? userDetails.injuries
            : [];

          setIllnesses({
            belFitigi: injuriesArray.includes("Bel Fıtığı"),
            dizSakatligi: injuriesArray.includes("Diz Sakatlığı"),
            yuksekTansiyon: injuriesArray.includes("Yüksek Tansiyon"),
          });
        }
        return;
      }

      const response = await apiService.getUserDetails();
      if (response.success && response.data) {
        dispatch(setUserDetails(response.data));

        setHeight(response.data.height?.toString() || "");
        setWeight(response.data.weight?.toString() || "");
        setGoal(response.data.goal || "Kilo Alma");

        if (response.data.injuries) {
          const arr = Array.isArray(response.data.injuries)
            ? response.data.injuries
            : [];

          setIllnesses({
            belFitigi: arr.includes("Bel Fıtığı"),
            dizSakatligi: arr.includes("Diz Sakatlığı"),
            yuksekTansiyon: arr.includes("Yüksek Tansiyon"),
          });
        }
      }
    } catch (err) {
      console.error("User details hatası:", err);
    }
  };

  const toggleIllness = (key) =>
    setIllnesses((prev) => ({ ...prev, [key]: !prev[key] }));

  const getHealthStatus = () => {
    const { belFitigi, dizSakatligi, yuksekTansiyon } = illnesses;
    const list = [];
    if (belFitigi) list.push("Bel Fıtığı");
    if (dizSakatligi) list.push("Diz Sakatlığı");
    if (yuksekTansiyon) list.push("Yüksek Tansiyon");
    return list.length ? list.join(", ") : "Herhangi bir sorun yok";
  };

  const getInjuriesArray = () => {
    const arr = [];
    if (illnesses.belFitigi) arr.push("Bel Fıtığı");
    if (illnesses.dizSakatligi) arr.push("Diz Sakatlığı");
    if (illnesses.yuksekTansiyon) arr.push("Yüksek Tansiyon");
    return arr;
  };

  const handleSaveProfile = async () => {
    if (!height || !weight)
      return Alert.alert("Hata", "Boy ve kilo girmeniz gerekli.");

    if (!goal) return Alert.alert("Hata", "Lütfen bir fitness hedefi seçin.");

    setIsLoading(true);

    try {
      const detailsData = {
        height: parseInt(height),
        weight: parseFloat(weight),
        injuries: getInjuriesArray(),
        goal: goal.trim(),
      };

      const response = await apiService.updateUserDetails(detailsData);
      if (response.success) {
        dispatch(setUserDetails(response.data));
        Alert.alert("Başarılı", "Profiliniz güncellendi!");
      }
    } catch (err) {
      console.error("Profil kaydetme hatası:", err);
      Alert.alert("Hata", "Kaydedilirken bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await apiService.logout();
          dispatch(clearUser());
        },
      },
    ]);
  };

  return (
    <Layout>
      {/* 🔥🔥🔥 ÖNEMLİ: flex: 1 vererek ScrollView'un tüm ekranı kaplamasını sağladık.
         Böylece içerik taşarsa kaydırma çalışır. 
      */}
      <View style={{ flex: 1 }}> 
        <ScrollView 
            contentContainerStyle={styles.scrollContainer} 
            showsVerticalScrollIndicator={false}
            bounces={true} // iOS'te esneme efekti
        >
          
          {/* 👤 ÜST PROFİL KARTI */}
          <View style={styles.headerContainer}>
              <LinearGradient
                  colors={["rgba(214, 185, 130, 0.2)", "rgba(0,0,0,0)"]}
                  style={styles.profileImageWrapper}
              >
                  <Image
                      style={styles.profileImage}
                      source={require("../../assets/images/profiletabicon.png")}
                  />
              </LinearGradient>
              
              <Text style={styles.name}>
                  {userData?.firstName} {userData?.lastName}
              </Text>
              <Text style={styles.email}>{userData?.email}</Text>
              
              <View style={styles.badgeContainer}>
                  <LinearGradient colors={["#333", "#111"]} style={styles.badge}>
                      <Text style={styles.badgeText}>Üye</Text>
                  </LinearGradient>
              </View>
          </View>

          {/* 📏 BOY & KİLO KARTI */}
          <View style={styles.sectionContainer}>
               <View style={styles.sectionHeader}>
                   <Ionicons name="body-outline" size={20} color="#D6B982" />
                   <Text style={styles.sectionTitle}>Fiziksel Bilgiler</Text>
               </View>
               
               <LinearGradient colors={["#222", "#151515"]} style={styles.card}>
                   <View style={styles.inputRow}>
                       <View style={styles.inputWrapper}>
                           <Text style={styles.inputLabel}>BOY (CM)</Text>
                           <View style={styles.inputBox}>
                               <Ionicons name="resize-outline" size={18} color="#666" />
                               <TextInput
                                  value={height}
                                  onChangeText={setHeight}
                                  keyboardType="numeric"
                                  style={styles.input}
                                  placeholder="180"
                                  placeholderTextColor="#444"
                               />
                           </View>
                       </View>
                       
                       <View style={styles.divider} />

                       <View style={styles.inputWrapper}>
                           <Text style={styles.inputLabel}>KİLO (KG)</Text>
                           <View style={styles.inputBox}>
                               <Ionicons name="scale-outline" size={18} color="#666" />
                               <TextInput
                                  value={weight}
                                  onChangeText={setWeight}
                                  keyboardType="numeric"
                                  style={styles.input}
                                  placeholder="80"
                                  placeholderTextColor="#444"
                               />
                           </View>
                       </View>
                   </View>
               </LinearGradient>
          </View>

          {/* 🎯 HEDEF KARTI */}
          <View style={styles.sectionContainer}>
               <View style={styles.sectionHeader}>
                   <Ionicons name="trophy-outline" size={20} color="#D6B982" />
                   <Text style={styles.sectionTitle}>Fitness Hedefi</Text>
               </View>

               <Pressable onPress={() => setGoalModal(true)}>
                  <LinearGradient colors={["#222", "#151515"]} style={styles.clickableCard}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                           <View style={styles.iconBox}>
                               <Ionicons name="flag" size={24} color="#D6B982" />
                           </View>
                           <View style={{marginLeft: 15}}>
                               <Text style={styles.cardLabel}>Güncel Hedef</Text>
                               <Text style={styles.cardValue}>{goal}</Text>
                           </View>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#444" />
                  </LinearGradient>
               </Pressable>
          </View>

          {/* 🏥 SAĞLIK DURUMU KARTI */}
          <View style={styles.sectionContainer}>
               <View style={styles.sectionHeader}>
                   <Ionicons name="medkit-outline" size={20} color="#D6B982" />
                   <Text style={styles.sectionTitle}>Sağlık Durumu</Text>
               </View>

               <Pressable onPress={() => setIllnessModal(true)}>
                  <LinearGradient colors={["#222", "#151515"]} style={styles.clickableCard}>
                       <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                           <View style={[styles.iconBox, {backgroundColor: "rgba(255, 80, 80, 0.1)"}]}>
                               <Ionicons name="pulse" size={24} color="#ff5555" />
                           </View>
                           <View style={{marginLeft: 15, flex: 1}}>
                               <Text style={styles.cardLabel}>Rahatsızlıklar</Text>
                               <Text style={styles.cardValue} numberOfLines={1}>{getHealthStatus()}</Text>
                           </View>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#444" />
                  </LinearGradient>
               </Pressable>
          </View>

          {/* 💾 BUTONLAR */}
          <View style={styles.buttonContainer}>
              <Pressable
                  style={[styles.goldButton, isLoading && {opacity: 0.7}]}
                  onPress={handleSaveProfile}
                  disabled={isLoading}
              >
                  {isLoading ? (
                      <ActivityIndicator color="#000" />
                  ) : (
                      <>
                          <Ionicons name="save-outline" size={20} color="#000" style={{marginRight: 8}} />
                          <Text style={styles.goldButtonText}>DEĞİŞİKLİKLERİ KAYDET</Text>
                      </>
                  )}
              </Pressable>

              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="#ff5555" style={{marginRight: 8}} />
                  <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
              </Pressable>
          </View>

        </ScrollView>
      </View>

      {/* 🔹 HEDEF MODAL */}
      <Modal visible={goalModal} transparent animationType="fade">
         <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Hedefini Seç</Text>
                
                {["Kilo Alma", "Kilo Verme", "Kilo Koruma"].map((item) => {
                    const isSelected = goal === item;
                    return (
                        <Pressable
                            key={item}
                            style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                            onPress={() => { setGoal(item); setGoalModal(false); }}
                        >
                            <Text style={[styles.modalOptionText, isSelected && {color: "#000"}]}>{item}</Text>
                            {isSelected && <Ionicons name="checkmark-circle" size={24} color="#000" />}
                        </Pressable>
                    )
                })}
                
                <Pressable style={styles.modalCancel} onPress={() => setGoalModal(false)}>
                    <Text style={styles.modalCancelText}>İptal</Text>
                </Pressable>
            </View>
         </BlurView>
      </Modal>

      {/* 🔹 SAĞLIK MODAL */}
      <Modal visible={illnessModal} transparent animationType="fade">
         <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sağlık Durumu</Text>
                <Text style={styles.modalSubtitle}>Varsa rahatsızlıklarını işaretle:</Text>

                {[
                    { key: "belFitigi", label: "Bel Fıtığı" },
                    { key: "dizSakatligi", label: "Diz Sakatlığı" },
                    { key: "yuksekTansiyon", label: "Yüksek Tansiyon" },
                ].map((item) => {
                    const isSelected = illnesses[item.key];
                    return (
                        <Pressable
                            key={item.key}
                            style={[styles.modalOption, isSelected && styles.modalOptionSelectedGold]}
                            onPress={() => toggleIllness(item.key)}
                        >
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Ionicons 
                                    name={isSelected ? "checkbox" : "square-outline"} 
                                    size={24} 
                                    color={isSelected ? "#000" : "#666"} 
                                    style={{marginRight: 10}}
                                />
                                <Text style={[styles.modalOptionText, isSelected && {color: "#000"}]}>{item.label}</Text>
                            </View>
                        </Pressable>
                    )
                })}

                <Pressable style={styles.goldButtonModal} onPress={() => setIllnessModal(false)}>
                    <Text style={styles.goldButtonText}>TAMAMLA</Text>
                </Pressable>
            </View>
         </BlurView>
      </Modal>

    </Layout>
  );
};

export default ProfilePage;

// 🎨 PREMİUM STİLLER
const styles = StyleSheet.create({
  scrollContainer: { 
    paddingBottom: 150, // Alt kısımda daha fazla boşluk bıraktım
    alignItems: "center" 
  },
  
  // HEADER
  headerContainer: { alignItems: "center", marginTop: 30, marginBottom: 30 },
  profileImageWrapper: {
      padding: 5,
      borderRadius: 75,
      borderWidth: 1,
      borderColor: "rgba(214, 185, 130, 0.3)",
      marginBottom: 15
  },
  profileImage: { width: 110, height: 110, borderRadius: 55 },
  name: { color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: 0.5 },
  email: { color: "#888", fontSize: 14, marginTop: 2 },
  badgeContainer: { marginTop: 10 },
  badge: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: "#333" },
  badgeText: { color: "#D6B982", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },

  // SECTIONS
  sectionContainer: { width: "90%", marginBottom: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, paddingLeft: 5 },
  sectionTitle: { color: "#D6B982", fontSize: 14, fontWeight: "700", marginLeft: 8, textTransform: "uppercase" },
  
  card: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#2a2a2a" },
  clickableCard: { 
      borderRadius: 16, 
      padding: 15, 
      borderWidth: 1, 
      borderColor: "#2a2a2a",
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  
  // INPUTS
  inputRow: { flexDirection: "row", justifyContent: "space-between" },
  inputWrapper: { flex: 1, alignItems: "center" },
  divider: { width: 1, height: "100%", backgroundColor: "#333", marginHorizontal: 10 },
  inputLabel: { color: "#666", fontSize: 10, fontWeight: "bold", marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center' },
  input: { 
      color: "#fff", 
      fontSize: 22, 
      fontWeight: "bold", 
      marginLeft: 8, 
      borderBottomWidth: 1, 
      borderBottomColor: "#444",
      paddingVertical: 2,
      minWidth: 50,
      textAlign: 'center'
  },

  // CARD CONTENT
  iconBox: { width: 45, height: 45, borderRadius: 25, backgroundColor: "rgba(214, 185, 130, 0.1)", alignItems: 'center', justifyContent: 'center' },
  cardLabel: { color: "#888", fontSize: 12 },
  cardValue: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 2 },

  // BUTTONS
  buttonContainer: { width: "90%", marginTop: 10, gap: 15 },
  goldButton: {
      backgroundColor: "#D6B982",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 16,
      shadowColor: "#D6B982",
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 10,
  },
  goldButtonText: { color: "#000", fontWeight: "800", fontSize: 14, letterSpacing: 0.5 },
  
  logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 15,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#333",
      backgroundColor: "rgba(255, 68, 68, 0.05)"
  },
  logoutButtonText: { color: "#ff5555", fontWeight: "600", fontSize: 14 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "#1c1c1c", borderRadius: 24, padding: 25, borderWidth: 1, borderColor: "#333" },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 5 },
  modalSubtitle: { color: "#666", textAlign: "center", marginBottom: 20, fontSize: 13 },
  
  modalOption: { backgroundColor: "#2a2a2a", padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalOptionSelected: { backgroundColor: "#D6B982" },
  modalOptionSelectedGold: { backgroundColor: "#D6B982" },
  modalOptionText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  
  goldButtonModal: { backgroundColor: "#D6B982", paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  modalCancel: { marginTop: 15, alignItems: 'center', padding: 10 },
  modalCancelText: { color: "#666", fontWeight: "600" }
});