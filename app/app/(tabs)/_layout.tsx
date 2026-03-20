import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#999",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F5F5F5",
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "영수증",
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="receipt" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "이력",
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "어드바이저",
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="bulb" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
