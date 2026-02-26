import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // YENİ
import { Ionicons } from "@expo/vector-icons"; // YENİ
import { BlurView } from "expo-blur"; // YENİ

import Layout from "../components/Layout";
import apiService from "../services/api";
import { useSelector, useDispatch } from "react-redux";
import { setUserDetails } from "../redux/userSlice";

// 📌 Sabit Veriler
const foodDatabase = [
  { name: "Tavuk Göğsü (100g)", calories: 165, protein: 31, carb: 0, fat: 3.6 },
  { name: "Yulaf (100g)", calories: 389, protein: 17, carb: 66, fat: 7 },
  { name: "Muz (1 adet)", calories: 89, protein: 1.1, carb: 23, fat: 0.3 },
  { name: "Yumurta (1 adet)", calories: 78, protein: 6, carb: 0.6, fat: 5.3 },
  { name: "Pirinç (100g)", calories: 360, protein: 7, carb: 80, fat: 0.5 },
  { name: "Kırmızı Et (100g)", calories: 250, protein: 26, carb: 0, fat: 15 },
  { name: "Badem (30g)", calories: 180, protein: 6, carb: 6, fat: 15 },
  { name: "Yoğurt (200g)", calories: 120, protein: 8, carb: 10, fat: 4 },
  { name: "Somon (100g)", calories: 208, protein: 20, carb: 0, fat: 13 },
  { name: "Elma (1 adet)", calories: 52, protein: 0.3, carb: 14, fat: 0.2 },
];

const DietPage = () => {
  const dispatch = useDispatch();
  const { userDetails } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("Önerilen");
  // Eğer goal yoksa varsayılan ata
  const goal = userDetails?.goal || "Kilo Verme"; 

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUserDetails = async () => {
      if (!userDetails) {
        try {
          const response = await apiService.getUserDetails();
          if (response.success && response.data) {
            dispatch(setUserDetails(response.data));
          }
        } catch (error) {
          console.warn("User details yüklenemedi:", error);
        }
      }
    };
    loadUserDetails();
  }, []);

  const [customFoods, setCustomFoods] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [foodModalVisible, setFoodModalVisible] = useState(false);

  // AI Asistan state'leri
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);
  const [aiPlanLoading, setAiPlanLoading] = useState(false);

  const dietPlans = {
    "Kilo Verme": {
      calories: 1800,
      protein: "150g",
      carb: "150g",
      fat: "50g",
      meals: [
        { title: "Kahvaltı", items: ["2 yumurta", "1 dilim tam buğday ekmeği"] },
        { title: "Öğle", items: ["150g tavuk göğsü", "Bol salata"] },
        { title: "Akşam", items: ["200g balık", "Sebze çorbası"] },
      ],
    },
    "Kilo Alma": {
      calories: 2800,
      protein: "160g",
      carb: "350g",
      fat: "90g",
      meals: [
        { title: "Kahvaltı", items: ["3 yumurta", "100g yulaf", "1 muz"] },
        { title: "Öğle", items: ["200g kırmızı et", "1 tabak pilav"] },
        { title: "Akşam", items: ["200g tavuk", "1 porsiyon makarna"] },
      ],
    },
    "Kilo Koruma": {
      calories: 2200,
      protein: "140g",
      carb: "200g",
      fat: "70g",
      meals: [
        { title: "Kahvaltı", items: ["2 yumurta", "1 bardak süt"] },
        { title: "Öğle", items: ["150g tavuk", "1 tabak bulgur"] },
        { title: "Akşam", items: ["150g balık", "Sebze çorbası"] },
      ],
    },
  };

  // goal verisi dietPlans içinde yoksa varsayılanı kullan
  const plan = dietPlans[goal] || dietPlans["Kilo Koruma"];

  const addFood = () => {
    if (!foodName || !calories) return;
    const newFood = {
      name: foodName,
      calories: parseFloat(calories),
      protein: parseFloat(protein) || 0,
      carb: parseFloat(carb) || 0,
      fat: parseFloat(fat) || 0,
    };
    setCustomFoods([...customFoods, newFood]);
    setFoodName("");
    setCalories("");
    setProtein("");
    setCarb("");
    setFat("");
  };

  const total = customFoods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carb: acc.carb + f.carb,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carb: 0, fat: 0 }
  );

  const selectFood = (item) => {
    setFoodName(item.name);
    setCalories(item.calories.toString());
    setProtein(item.protein.toString());
    setCarb(item.carb.toString());
    setFat(item.fat.toString());
    setFoodModalVisible(false);
  };

  // AI Fonksiyonları
  const askAI = async () => {
    if (!aiQuestion.trim()) {
      Alert.alert("Hata", "Lütfen bir soru girin");
      return;
    }
    setAiLoading(true);
    try {
      // Health Check log (isteğe bağlı)
      // await apiService.healthCheck();
      const response = await apiService.askNutritionQuestion(aiQuestion);
      if (response.success) {
        setAiAnswer(response.data.answer);
        setAiQuestion("");
      } else {
        Alert.alert("Hata", response.message || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("AI Error:", error);
      Alert.alert("Hata", "AI servisine ulaşılamadı.");
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIPlan = async () => {
    setAiPlanLoading(true);
    try {
      let currentUserDetails = userDetails;
      if (!currentUserDetails) {
         try {
             const resp = await apiService.getUserDetails();
             if(resp.success) currentUserDetails = resp.data;
         } catch(e) { console.log(e) }
      }

      const hasRequiredInfo = currentUserDetails && 
        (currentUserDetails.goal || currentUserDetails.height || currentUserDetails.weight);

      if (!hasRequiredInfo) {
        Alert.alert("Eksik Bilgi", "Lütfen profilinizi güncelleyin.");
        setAiPlanLoading(false);
        return;
      }

      const response = await apiService.generateAIPlan();
      if (response.success) {
        setAiPlan(response.data);
        Alert.alert("Harika!", "Beslenme planın hazır.");
      } else {
        Alert.alert("Hata", response.message || "Plan oluşturulamadı");
      }
    } catch (error) {
      Alert.alert("Hata", "Bağlantı hatası.");
    } finally {
      setAiPlanLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSpace} />

        <Text style={styles.mainTitle}>BESLENME</Text>
        <Text style={styles.subTitle}>Hedefine uygun planı seç veya oluştur.</Text>

        {/* 🟡 MODERN TAB MENU */}
        <View style={styles.tabContainer}>
          {["Önerilen", "Kendi", "AI"].map((t) => {
             const isActive = activeTab === t;
             return (
              <Pressable key={t} style={{flex: 1}} onPress={() => setActiveTab(t)}>
                  {isActive ? (
                      <LinearGradient
                        colors={["#D6B982", "#b39666"]}
                        style={styles.activeTabGradient}
                        start={{x:0, y:0}} end={{x:1, y:0}}
                      >
                         <Text style={styles.activeTabText}>{t === "AI" ? "AI ASİSTAN" : t.toUpperCase()}</Text>
                      </LinearGradient>
                  ) : (
                      <View style={styles.inactiveTab}>
                          <Text style={styles.inactiveTabText}>{t === "AI" ? "AI Asistan" : t}</Text>
                      </View>
                  )}
              </Pressable>
             )
          })}
        </View>

        {/* 🥗 1. TAB: ÖNERİLEN PLANLAR */}
        {activeTab === "Önerilen" && (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>{goal} Hedefi</Text>
                 <View style={styles.sectionLine} />
            </View>

            {/* Özet Kartı */}
            <LinearGradient
              colors={["#2a2a2a", "#1a1a1a"]}
              style={styles.summaryCard}
            >
               <View style={styles.summaryHeader}>
                   <Ionicons name="flame" size={24} color="#D6B982" />
                   <Text style={styles.summaryTitle}>Günlük Hedefler</Text>
               </View>
               
               <View style={styles.macroRow}>
                   <View style={styles.macroItem}>
                       <Text style={styles.macroValue}>{plan.calories}</Text>
                       <Text style={styles.macroLabel}>Kcal</Text>
                   </View>
                   <View style={styles.macroDivider}/>
                   <View style={styles.macroItem}>
                       <Text style={styles.macroValue}>{plan.protein}</Text>
                       <Text style={styles.macroLabel}>Prot</Text>
                   </View>
                   <View style={styles.macroDivider}/>
                   <View style={styles.macroItem}>
                       <Text style={styles.macroValue}>{plan.carb}</Text>
                       <Text style={styles.macroLabel}>Karb</Text>
                   </View>
                   <View style={styles.macroDivider}/>
                   <View style={styles.macroItem}>
                       <Text style={styles.macroValue}>{plan.fat}</Text>
                       <Text style={styles.macroLabel}>Yağ</Text>
                   </View>
               </View>
            </LinearGradient>

            {/* Öğünler Listesi */}
            {plan.meals.map((m, i) => (
              <LinearGradient key={i} colors={["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]} style={styles.mealCard}>
                <View style={{flexDirection:'row', alignItems:'center', marginBottom: 10}}>
                    <Ionicons name={i===0 ? "sunny-outline" : i===1 ? "partly-sunny-outline" : "moon-outline"} size={20} color="#888" style={{marginRight:8}} />
                    <Text style={styles.mealTitle}>{m.title}</Text>
                </View>
                {m.items.map((it, idx) => (
                   <View key={idx} style={styles.mealItemRow}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.mealItemText}>{it}</Text>
                   </View>
                ))}
              </LinearGradient>
            ))}
          </View>
        )}

        {/* 📝 2. TAB: KENDİ PROGRAMIM */}
        {activeTab === "Kendi" && (
          <View style={styles.contentSection}>
             <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>Günlük Takip</Text>
                 <View style={styles.sectionLine} />
            </View>

            <View style={styles.inputContainer}>
              <Pressable
                style={styles.selectButtonOutline}
                onPress={() => setFoodModalVisible(true)}
              >
                <Ionicons name="list" size={20} color="#D6B982" style={{marginRight: 8}}/>
                <Text style={styles.selectButtonText}>Hazır Listeden Seç</Text>
              </Pressable>

              <View style={styles.dividerText}>
                 <View style={styles.line} /><Text style={{color:'#444', marginHorizontal:10}}>VEYA</Text><View style={styles.line} />
              </View>

              <Text style={styles.inputLabel}>Besin Bilgileri Gir</Text>
              
              <TextInput
                placeholder="Örn: Haşlanmış Tavuk"
                placeholderTextColor="#666"
                value={foodName}
                onChangeText={setFoodName}
                style={styles.input}
              />
              
              <View style={{flexDirection: 'row', gap: 10}}>
                  <TextInput
                    placeholder="Kalori"
                    placeholderTextColor="#666"
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    style={[styles.input, {flex: 1}]}
                  />
                  <TextInput
                    placeholder="Prot (g)"
                    placeholderTextColor="#666"
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                    style={[styles.input, {flex: 1}]}
                  />
              </View>

              <View style={{flexDirection: 'row', gap: 10}}>
                   <TextInput
                    placeholder="Karb (g)"
                    placeholderTextColor="#666"
                    value={carb}
                    onChangeText={setCarb}
                    keyboardType="numeric"
                    style={[styles.input, {flex: 1}]}
                  />
                  <TextInput
                    placeholder="Yağ (g)"
                    placeholderTextColor="#666"
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                    style={[styles.input, {flex: 1}]}
                  />
              </View>

              <Pressable style={styles.goldButton} onPress={addFood}>
                <Ionicons name="add-circle" size={20} color="#000" style={{marginRight: 5}} />
                <Text style={styles.goldButtonText}>Listeye Ekle</Text>
              </Pressable>
            </View>

            {/* Eklenenler Listesi */}
            {customFoods.length > 0 && (
                <View style={styles.addedListContainer}>
                    <Text style={styles.addedListTitle}>Bugün Eklenenler</Text>
                    {customFoods.map((f, i) => (
                    <View key={i} style={styles.foodItemRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.foodName}>{f.name}</Text>
                            <Text style={styles.foodDetail}>
                            P:{f.protein} C:{f.carb} Y:{f.fat}
                            </Text>
                        </View>
                        <Text style={styles.foodCalories}>{f.calories} kcal</Text>
                    </View>
                    ))}
                    
                    <LinearGradient colors={["#D6B982", "#b39666"]} style={styles.totalBar}>
                        <Text style={styles.totalBarTitle}>TOPLAM</Text>
                        <Text style={styles.totalBarValue}>{total.calories.toFixed(0)} kcal</Text>
                    </LinearGradient>
                </View>
            )}
          </View>
        )}

        {/* 🤖 3. TAB: AI ASİSTAN */}
        {activeTab === "AI" && (
          <View style={styles.contentSection}>
            <View style={styles.aiHeader}>
                <LinearGradient colors={["#333", "#111"]} style={styles.aiIconContainer}>
                     <Ionicons name="hardware-chip-outline" size={40} color="#D6B982" />
                </LinearGradient>
                <Text style={styles.aiTitle}>Akıllı Beslenme Asistanı</Text>
                <Text style={styles.aiSubtitle}>Aklındaki soruları sor veya sana özel tam bir beslenme planı oluştur.</Text>
            </View>
            
            {/* Soru Sorma Kartı */}
            <LinearGradient colors={["#222", "#151515"]} style={styles.aiCard}>
              <View style={styles.aiCardHeader}>
                  <Ionicons name="chatbubbles-outline" size={20} color="#D6B982" />
                  <Text style={styles.aiCardTitle}>Beslenme Sorusu Sor</Text>
              </View>
              
              <TextInput
                placeholder="Örn: Antrenman sonrası ne yemeliyim?"
                placeholderTextColor="#555"
                value={aiQuestion}
                onChangeText={setAiQuestion}
                style={styles.aiInput}
                multiline
              />
              
              <Pressable
                style={[styles.goldButtonSmall, aiLoading && {opacity: 0.6}]}
                onPress={askAI}
                disabled={aiLoading}
              >
                {aiLoading ? <ActivityIndicator color="#000" size="small"/> : <Text style={styles.goldButtonTextSmall}>Gönder</Text>}
              </Pressable>
              
              {aiAnswer ? (
                <View style={styles.aiAnswerContainer}>
                  <Text style={styles.aiAnswerLabel}>Asistanın Cevabı:</Text>
                  <Text style={styles.aiAnswerText}>{aiAnswer}</Text>
                </View>
              ) : null}
            </LinearGradient>

            {/* Plan Oluşturma Kartı */}
            <LinearGradient colors={["#222", "#151515"]} style={[styles.aiCard, {marginTop: 20}]}>
              <View style={styles.aiCardHeader}>
                  <Ionicons name="clipboard-outline" size={20} color="#D6B982" />
                  <Text style={styles.aiCardTitle}>Kişiselleştirilmiş Plan</Text>
              </View>

              {userDetails && (
                  <View style={styles.userInfoBadge}>
                      <Text style={styles.userInfoText}>Hedef: <Text style={{color: "#fff"}}>{userDetails.goal || "Belirtilmemiş"}</Text></Text>
                      <Text style={styles.userInfoText}>Kilo: <Text style={{color: "#fff"}}>{userDetails.weight}kg</Text></Text>
                  </View>
              )}

              <Text style={styles.aiDesc}>Profilindeki boy, kilo ve hedeflerine göre yapay zeka tarafından hazırlanan tam günlük beslenme rutini.</Text>

              <Pressable
                style={[styles.goldButton, aiPlanLoading && {opacity: 0.6}]}
                onPress={generateAIPlan}
                disabled={aiPlanLoading}
              >
                 {aiPlanLoading ? <ActivityIndicator color="#000" /> : (
                     <>
                        <Ionicons name="sparkles" size={18} color="#000" style={{marginRight: 8}} />
                        <Text style={styles.goldButtonText}>AI Planı Oluştur</Text>
                     </>
                 )}
              </Pressable>

              {aiPlan && (
                <View style={styles.generatedPlanBox}>
                  <Text style={styles.planHeader}>Senin İçin Hazırlandı</Text>
                  
                  <View style={styles.planMacroRow}>
                      <Text style={styles.planMacro}>{aiPlan.dailyCalories} kcal</Text>
                      <Text style={styles.planMacro}>P: {aiPlan.protein}</Text>
                  </View>

                  {aiPlan.meals?.map((meal, index) => (
                    <View key={index} style={styles.planMealItem}>
                      <Text style={styles.planMealTitle}>{meal.title}</Text>
                      {meal.items?.map((it, k) => <Text key={k} style={styles.planMealFood}>• {it}</Text>)}
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* 🔹 MODAL: BESİN SEÇ (Blur Effect) */}
      <Modal visible={foodModalVisible} animationType="fade" transparent>
        <BlurView intensity={30} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Besin Seçimi</Text>
                <Pressable onPress={() => setFoodModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#666" />
                </Pressable>
            </View>
            
            <FlatList
              data={foodDatabase}
              keyExtractor={(item) => item.name}
              style={{maxHeight: 400}}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => selectFood(item)}
                >
                  <View>
                      <Text style={styles.modalItemName}>{item.name}</Text>
                      <Text style={styles.modalItemSub}>{item.calories} kcal</Text>
                  </View>
                  <Ionicons name="add" size={24} color="#D6B982" />
                </Pressable>
              )}
            />
          </View>
        </BlurView>
      </Modal>
    </Layout>
  );
};

export default DietPage;

// 🎨 LUXURY STYLE SHEET
const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 100, alignItems: "center" },
  headerSpace: { height: 20 },
  
  mainTitle: { color: "#D6B982", fontSize: 28, fontWeight: "800", letterSpacing: 1, marginTop: 10 },
  subTitle: { color: "#888", fontSize: 13, marginBottom: 25 },
  
  // TABS
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 30,
    padding: 4,
    width: "90%",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 20,
  },
  activeTabGradient: {
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  inactiveTab: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTabText: { color: "#000", fontWeight: "800", fontSize: 12 },
  inactiveTabText: { color: "#666", fontWeight: "600", fontSize: 12 },

  // SECTIONS
  contentSection: { width: "90%" },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginRight: 15 },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#333" },

  // SUMMARY CARD
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(214, 185, 130, 0.2)",
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  summaryTitle: { color: "#D6B982", fontSize: 16, fontWeight: "700", marginLeft: 10 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  macroItem: { alignItems: 'center' },
  macroValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  macroLabel: { color: "#666", fontSize: 11, marginTop: 2, textTransform: 'uppercase' },
  macroDivider: { width: 1, height: 20, backgroundColor: "#333" },

  // MEAL CARDS
  mealCard: {
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#222"
  },
  mealTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  mealItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingLeft: 10 },
  bulletPoint: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#D6B982", marginRight: 8 },
  mealItemText: { color: "#ccc", fontSize: 14 },

  // INPUTS & FORMS
  inputContainer: { backgroundColor: "#151515", padding: 20, borderRadius: 20, borderWidth: 1, borderColor: "#222" },
  inputLabel: { color: "#D6B982", fontSize: 12, fontWeight: "700", marginBottom: 10, textTransform: 'uppercase'},
  input: {
    backgroundColor: "#252525",
    color: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#333"
  },
  selectButtonOutline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: "#D6B982",
      borderRadius: 12,
      paddingVertical: 12,
      marginBottom: 15
  },
  selectButtonText: { color: "#D6B982", fontWeight: "600", fontSize: 14 },
  dividerText: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  line: { width: 30, height: 1, backgroundColor: "#333"},
  
  goldButton: {
      backgroundColor: "#D6B982",
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10
  },
  goldButtonText: { color: "#000", fontWeight: "700", fontSize: 15 },

  // ADDED LIST
  addedListContainer: { marginTop: 25 },
  addedListTitle: { color: "#888", fontSize: 13, fontWeight: "700", marginBottom: 10, paddingLeft: 5 },
  foodItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: "#1a1a1a",
      padding: 15,
      borderRadius: 12,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: "#444"
  },
  foodName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  foodDetail: { color: "#666", fontSize: 12, marginTop: 2 },
  foodCalories: { color: "#D6B982", fontWeight: "bold" },
  totalBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 15,
      borderRadius: 12,
      marginTop: 5
  },
  totalBarTitle: { color: "#000", fontWeight: "800", fontSize: 14 },
  totalBarValue: { color: "#000", fontWeight: "800", fontSize: 16 },

  // AI SECTION
  aiHeader: { alignItems: 'center', marginBottom: 25 },
  aiIconContainer: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 15, borderWidth: 1, borderColor: "#333" },
  aiTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  aiSubtitle: { color: "#666", textAlign: 'center', fontSize: 13, marginTop: 5, paddingHorizontal: 20 },
  
  aiCard: { padding: 20, borderRadius: 20, borderWidth: 1, borderColor: "#333" },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  aiCardTitle: { color: "#D6B982", fontWeight: "700", fontSize: 16, marginLeft: 8 },
  aiInput: { backgroundColor: "#2a2a2a", borderRadius: 12, color: "#fff", padding: 15, minHeight: 80, textAlignVertical: 'top', marginBottom: 15 },
  goldButtonSmall: { backgroundColor: "#D6B982", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignSelf: 'flex-end' },
  goldButtonTextSmall: { color: "#000", fontWeight: "700", fontSize: 13 },
  aiAnswerContainer: { marginTop: 20, backgroundColor: "rgba(214, 185, 130, 0.05)", padding: 15, borderRadius: 12, borderLeftWidth: 2, borderLeftColor: "#D6B982" },
  aiAnswerLabel: { color: "#D6B982", fontSize: 12, fontWeight: "700", marginBottom: 5 },
  aiAnswerText: { color: "#ccc", lineHeight: 20, fontSize: 14 },
  
  userInfoBadge: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  userInfoText: { color: "#666", fontSize: 12 },
  aiDesc: { color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 18 },
  
  generatedPlanBox: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#333" },
  planHeader: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 10 },
  planMacroRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  planMacro: { color: "#D6B982", fontWeight: "600", fontSize: 13, backgroundColor: "#333", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  planMealItem: { marginBottom: 10 },
  planMealTitle: { color: "#fff", fontWeight: "600", fontSize: 14 },
  planMealFood: { color: "#888", fontSize: 13, paddingLeft: 10 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: "85%", backgroundColor: "#1e1e1e", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#333" },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#333" },
  modalItemName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  modalItemSub: { color: "#666", fontSize: 12 },
});