import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function WaterWeeklyCard({
  goalMl,
  todayMl,
  progress,
  week,
  streak,
  onAdd,
  onReset,
  onSetGoal,
  loading,
}) {
  return (
    <LinearGradient colors={["#1a1a1a", "#0f0f0f"]} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>Su Takibi</Text>
        <Text style={styles.small}>🔥 Streak: {streak || 0}</Text>
      </View>

      <Text style={styles.big}>
        {todayMl} / {goalMl} ml
      </Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${Math.round((progress || 0) * 100)}%` }]} />
      </View>

      <View style={styles.btnRow}>
        <Pressable style={styles.btn} onPress={() => onAdd?.(250)}>
          <Text style={styles.btnText}>+250ml</Text>
        </Pressable>

        <Pressable style={styles.btn} onPress={() => onAdd?.(500)}>
          <Text style={styles.btnText}>+500ml</Text>
        </Pressable>

        <Pressable style={[styles.btn, styles.btnDanger]} onPress={onReset}>
          <Text style={styles.btnText}>Sıfırla</Text>
        </Pressable>
      </View>

      {loading ? <Text style={styles.small}>Yükleniyor...</Text> : null}
      <Text style={styles.small}>
        Haftalık: {week?.days?.filter((d) => d.done).length || 0}/7 gün hedef
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(214,185,130,0.2)",
    marginBottom: 25,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#D6B982", fontWeight: "800", fontSize: 16 },
  big: { color: "white", fontWeight: "800", fontSize: 20, marginTop: 10 },
  small: { color: "#888", marginTop: 10, fontSize: 12 },
  barBg: {
    height: 10,
    borderRadius: 6,
    backgroundColor: "#222",
    marginTop: 10,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#D6B982" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: {
    flex: 1,
    backgroundColor: "#222",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDanger: { backgroundColor: "#3a1f1f" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});