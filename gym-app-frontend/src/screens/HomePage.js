import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ 2. koddan
import WaterWeeklyCard from "../components/WaterWeeklyCard";
import {
  addWaterMl,
  getGoalMl,
  getTodayMl,
  getWeekStatus,
  getStreak,
  resetToday,
  setGoalMl as setGoalMlStorage,
} from "../storage/waterStorage";
import Layout from "../components/Layout";



const HomePage = ({ navigation }) => {
  const { user, userDetails } = useSelector((state) => state.user);

  const [name, setName] = useState("");

  // ✅ Water states (1. kod)
  const [waterLoading, setWaterLoading] = useState(true);
  const [waterGoal, setWaterGoalState] = useState(2500);
  const [todayMl, setTodayMl] = useState(0);
  const [week, setWeek] = useState(null);
  const [streak, setStreakState] = useState(0);

  // ✅ Step state (2. kod)
  const [stepCount, setStepCount] = useState(0);

  // ✅ StepCount’i AsyncStorage’dan çek (2. kod işlevi)
  useEffect(() => {
    const getSteps = async () => {
      try {
        const savedSteps = await AsyncStorage.getItem("stepCount");
        if (savedSteps) setStepCount(Number(savedSteps));
      } catch (e) {
        // sessiz geç
      }
    };
    getSteps();
  }, []);

  // ✅ Water refresh
  const refreshWater = async () => {
    setWaterLoading(true);
    try {
      const [g, t, w, s] = await Promise.all([
        getGoalMl(),
        getTodayMl(),
        getWeekStatus(),
        getStreak(),
      ]);
      setWaterGoalState(g);
      setTodayMl(t);
      setWeek(w);
      setStreakState(s);
    } finally {
      setWaterLoading(false);
    }
  };

  useEffect(() => {
    refreshWater();
  }, []);

  const addWater = async (ml) => {
    const next = await addWaterMl(ml);
    setTodayMl(next);
    const [w, s] = await Promise.all([getWeekStatus(), getStreak()]);
    setWeek(w);
    setStreakState(s);
  };

  const resetWater = async () => {
    await resetToday();
    setTodayMl(0);
    const [w, s] = await Promise.all([getWeekStatus(), getStreak()]);
    setWeek(w);
    setStreakState(s);
  };

  const saveWaterGoal = async (ml) => {
    const g = await setGoalMlStorage(ml);
    setWaterGoalState(g);
    const [w, s] = await Promise.all([getWeekStatus(), getStreak()]);
    setWeek(w);
    setStreakState(s);
  };

  const progress = waterGoal > 0 ? Math.min(1, todayMl / waterGoal) : 0;

  // ✅ 1. kod WaterWeeklyCard prop isimleri bozulmasın diye alias
  const goalMl = waterGoal;
  const add = addWater;
  const reset = resetWater;
  const setGoalMl = saveWaterGoal;

  useEffect(() => {
    if (user?.firstName) setName(user.firstName);
    else setName(user?.email?.split("@")[0] || "Sporcu");
  }, [user]);

  // Günün saatine göre selamlama
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "Tünaydın";
    return "İyi Akşamlar";
  };

  return (
    <Layout>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* 🦁 HEADER SECTION */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name}>{name}</Text>
            </View>
            <Pressable
              style={styles.profileIcon}
              onPress={() => navigation.navigate("Profile")}
            >
              <LinearGradient
                colors={["#D6B982", "#b39666"]}
                style={styles.profileGradient}
              >
                <Text style={styles.profileInitial}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* 📊 STATS DASHBOARD (Gradient Card) */}
          <LinearGradient
            colors={["#222", "#111"]}
            style={styles.statsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statsRow}>
              {/* Boy */}
              <View style={styles.statItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="resize-outline" size={18} color="#D6B982" />
                </View>
                <Text style={styles.statValue}>{userDetails?.height || "--"}</Text>
                <Text style={styles.statLabel}>cm</Text>
              </View>

              <View style={styles.verticalDivider} />

              {/* Kilo */}
              <View style={styles.statItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="scale-outline" size={18} color="#D6B982" />
                </View>
                <Text style={styles.statValue}>{userDetails?.weight || "--"}</Text>
                <Text style={styles.statLabel}>kg</Text>
              </View>

              <View style={styles.verticalDivider} />

              {/* Hedef */}
              <View style={styles.statItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="trophy-outline" size={18} color="#D6B982" />
                </View>
                <Text numberOfLines={1} style={[styles.statValue, { fontSize: 14 }]}>
                  {userDetails?.goal ? userDetails.goal.split(" ")[0] : "Hedef"}
                </Text>
                <Text style={styles.statLabel}>Hedef</Text>
              </View>
            </View>
          </LinearGradient>

          {/* 💧 WATER CARD */}
          <WaterWeeklyCard
            goalMl={goalMl}
            todayMl={todayMl}
            progress={progress}
            week={week}
            streak={streak}
            onAdd={add}
            onReset={reset}
            onSetGoal={setGoalMl}
            loading={waterLoading}
          />

          {/* 🚀 QUICK ACTIONS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
            <Ionicons name="grid-outline" size={16} color="#666" />
          </View>

          <View style={styles.actionsGrid}>
            {/* Kart 1: Egzersizler */}
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate("Exercises")}
            >
              <LinearGradient
                colors={["#2a2a2a", "#151515"]}
                style={styles.actionGradient}
              >
                <Image
                  source={require("../../assets/images/homepageicons/exercises.png")}
                  style={styles.actionImage}
                />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Egzersizler</Text>
                  <Text style={styles.actionSubtitle}>Kütüphaneyi Keşfet</Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Ionicons name="barbell-outline" size={20} color="#000" />
                </View>
              </LinearGradient>
            </Pressable>

            {/* Kart 2: Beslenme */}
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate("Diet")}
            >
              <LinearGradient
                colors={["#2a2a2a", "#151515"]}
                style={styles.actionGradient}
              >
                <Image
                  source={require("../../assets/images/homepageicons/beslenme.png")}
                  style={styles.actionImage}
                />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Beslenme</Text>
                  <Text style={styles.actionSubtitle}>Planını Oluştur</Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Ionicons name="nutrition-outline" size={20} color="#000" />
                </View>
              </LinearGradient>
            </Pressable>

            {/* Kart 3: Adım (✅ 2. kod işlevi burada tasarıma eklendi) */}
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate("Steppage")}
            >
              <LinearGradient
                colors={["#2a2a2a", "#151515"]}
                style={styles.actionGradient}
              >
                <Image
                  source={require("../../assets/images/homepageicons/exercises.png")}
                  style={styles.actionImage}
                />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Adım Takibi</Text>
                  <Text style={styles.actionSubtitle}>
                    Günlük Aktivite • Adım: {stepCount}
                  </Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Ionicons name="footsteps-outline" size={20} color="#000" />
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* 🔥 ACTIVE PROGRAM CARD */}
          <View style={styles.programSection}>
            <LinearGradient
              colors={["#D6B982", "#8c734b"]}
              style={styles.programCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.programContent}>
                <Text style={styles.programLabel}>BUGÜNKÜ ANTRENMAN</Text>
                <Text style={styles.programTitle}>Kişisel Programın Hazır</Text>
                <Pressable
                  style={styles.programButton}
                  onPress={() => navigation.navigate("Exercises")}
                >
                  <Text style={styles.programButtonText}>BAŞLA</Text>
                  <Ionicons name="arrow-forward" size={16} color="#D6B982" />
                </Pressable>
              </View>
              <Ionicons
                name="fitness"
                size={120}
                color="rgba(255,255,255,0.1)"
                style={styles.programBgIcon}
              />
            </LinearGradient>
          </View>

          {/* 💡 MOTIVATION QUOTE */}
          <View style={styles.quoteContainer}>
            <Ionicons
              name="quote"
              size={24}
              color="#444"
              style={{ marginBottom: 5 }}
            />
            <Text style={styles.quoteText}>
              "Bugün yaptığın küçük bir adım bile, yarınki büyük değişimin
              başlangıcı olabilir."
            </Text>
            <View style={styles.quoteLine} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Layout>
  );
};

export default HomePage;

// 🎨 PREMIUM STYLES (1. kodun stili aynen)
const styles = StyleSheet.create({
  container: {
    paddingBottom: 80,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  greeting: { color: "#888", fontSize: 14, fontWeight: "600" },
  name: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 0.5 },
  profileIcon: {
    shadowColor: "#D6B982",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  profileGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  profileInitial: { fontSize: 22, fontWeight: "bold", color: "#1a1a1a" },

  // STATS CARD
  statsCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(214, 185, 130, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  statsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: { alignItems: "center", flex: 1 },
  iconContainer: {
    backgroundColor: "rgba(214, 185, 130, 0.1)",
    padding: 8,
    borderRadius: 10,
    marginBottom: 5,
  },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "700" },
  statLabel: { color: "#666", fontSize: 12, marginTop: 2 },
  verticalDivider: { width: 1, height: "70%", backgroundColor: "#333" },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#D6B982",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ACTIONS GRID
  actionsGrid: { gap: 15, marginBottom: 30 },
  actionCard: {
    borderRadius: 16,
    overflow: "hidden",
    height: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  actionGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 16,
  },
  actionImage: { width: 50, height: 50, borderRadius: 10, marginRight: 15 },
  actionContent: { flex: 1 },
  actionTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  actionSubtitle: { color: "#666", fontSize: 12 },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D6B982",
    alignItems: "center",
    justifyContent: "center",
  },

  // PROGRAM CARD
  programSection: { marginBottom: 30 },
  programCard: {
    borderRadius: 24,
    padding: 25,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#D6B982",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  programContent: { zIndex: 1 },
  programLabel: {
    color: "rgba(0,0,0,0.6)",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 5,
  },
  programTitle: {
    color: "#000",
    fontSize: 22,
    fontWeight: "800",
    width: "70%",
    marginBottom: 20,
    lineHeight: 28,
  },
  programButton: {
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: "flex-start",
  },
  programButtonText: {
    color: "#D6B982",
    fontWeight: "bold",
    marginRight: 5,
    fontSize: 12,
  },
  programBgIcon: {
    position: "absolute",
    right: -20,
    bottom: -20,
    opacity: 0.6,
    transform: [{ rotate: "-15deg" }],
  },

  // MOTIVATION
  quoteContainer: { alignItems: "center", paddingHorizontal: 20, opacity: 0.8 },
  quoteText: {
    color: "#ccc",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 14,
  },
  quoteLine: {
    width: 40,
    height: 2,
    backgroundColor: "#D6B982",
    marginTop: 15,
    opacity: 0.5,
  },
});