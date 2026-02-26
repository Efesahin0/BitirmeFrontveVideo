import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import Layout from "../components/Layout";
import { SafeAreaView } from "react-native-safe-area-context";

const Steppage = () => {
  // Geçici örnek veriler – ileride Apple Health API / sensörlerle bağlanabilir
  const dailyStats = {
    steps: 0,
    distance: "0.00 KM",
    calories: "0 / 120 KCAL",
    activity: 0, // 0–100 arasında (%)
  };

  return (
    <Layout>
      <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Tarih ve başlık */}
        <Text style={styles.date}>27 KAS PERŞEMBE</Text>
        <Text style={styles.title}>Özet</Text>

        {/* Aktivite Halkası Kartı */}
        <Pressable style={styles.cardLarge}>
          <View style={styles.circleContainer}>
            <View style={styles.circleOutline}>
              <View
                style={[
                  styles.circleFill,
                  { width: `${dailyStats.activity}%` }, // İleride progress için dinamikleştirilebilir
                ]}
              />
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.cardLabel}>Hareket</Text>
            <Text style={styles.cardValue}>{dailyStats.calories}</Text>
          </View>
        </Pressable>

        {/* Küçük Kartlar */}
        <View style={styles.grid}>
          <Pressable style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Adım Sayısı</Text>
            <Text style={styles.cardValue}>{dailyStats.steps}</Text>
          </Pressable>

          <Pressable style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Adım Mesafesi</Text>
            <Text style={[styles.cardValue, { color: "#fbff00da" }]}>
              {dailyStats.distance}
            </Text>
          </Pressable>

          <Pressable style={styles.cardLarge}>
            <Text style={styles.cardLabel}>Ödüller</Text>
            <Text style={styles.cardValue}>YAKINDA</Text>
          </Pressable>
        </View>
      </ScrollView>
      </SafeAreaView>
    </Layout>
  );
};

export default Steppage;

const styles = StyleSheet.create({
  container: { paddingBottom: 50 },
  date: {
    color: "#888",
    fontSize: 14,
    marginLeft: 20,
    marginTop: 10,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 20,
  },
  cardLarge: {
    width: "90%",
    height: 150,
    alignSelf: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circleContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  circleOutline: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#cf0055",
    alignItems: "center",
    justifyContent: "center",
  },
  circleFill: {
    height: 4,
    backgroundColor: "#ff0044",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  cardSmall: {
    width: "43%",
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 40,
    marginVertical: 6,
  },
  cardLabel: {
    color: "#888",
    fontSize: 13,
  },
  cardValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
});
