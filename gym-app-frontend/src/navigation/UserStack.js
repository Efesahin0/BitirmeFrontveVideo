import React from "react";
import { StyleSheet, View } from "react-native";
import {
  HomePage,
  ProfilePage,
  ExercisesPage,
  DietPage,
  StepPage,
  ExercisesDetailPage
} from "../screens";

// ↑ Eğer senin detay dosyan farklı yerdeyse yolu düzelt:
// örn: "../screens/Exercises/ExercisesDetail"

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Ionicons from "@expo/vector-icons/Ionicons";
import { FontAwesome6 } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { playClickSound } from "../utils/clickSound";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** ✅ TABLAR (senin mevcut UserStack'in) */
const UserTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenListeners={{
        tabPress: () => playClickSound(),
      }}
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ color, size, focused }) => {
          let icon;

          switch (route.name) {
            case "Exercises":
              icon = (
                <FontAwesome6 name="dumbbell" size={size} color={color} />
              );
              break;
            case "Diet":
              icon = (
                <MaterialCommunityIcons
                  name="food-apple-outline"
                  size={size}
                  color={color}
                />
              );
              break;
            case "Profile":
              icon = <Ionicons name="person" size={size} color={color} />;
              break;
            case "Steppage":
              icon = (
                <MaterialCommunityIcons name="walk" size={size} color={color} />
              );
              break;
            case "Home":
            default:
              icon = <Ionicons name="home" size={size} color={color} />;
              break;
          }

          return <View style={{ top: focused ? -6 : 0 }}>{icon}</View>;
        },

        tabBarActiveTintColor: "#D6B982",
        tabBarInactiveTintColor: "#888",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },

        tabBarStyle: {
          backgroundColor: "#0F0F0F",
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 20,
          elevation: 15,
          shadowColor: "#D6B982",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{ title: "Ana Sayfa" }}
      />

      <Tab.Screen
        name="Exercises"
        component={ExercisesPage}
        options={{ title: "Egzersizler" }}
      />

      <Tab.Screen
        name="Diet"
        component={DietPage}
        options={{ title: "Beslenme" }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{ title: "Profil" }}
      />

      <Tab.Screen
        name="Steppage"
        component={StepPage}
        options={{ title: "Adım" }}
      />
    </Tab.Navigator>
  );
};

/** ✅ STACK (Tabs + Detail ekranları) */
const UserStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tab'lar */}
      <Stack.Screen name="UserTabs" component={UserTabs} />

      {/* Detail ekranı (Tab’a eklenmez, üstte açılır) */}
      <Stack.Screen name="ExercisesDetailPage" component={ExercisesDetailPage} />
    </Stack.Navigator>
  );
};

export default UserStack;

const styles = StyleSheet.create({});