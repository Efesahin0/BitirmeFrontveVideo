import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import Layout from "../components/Layout";

const { width, height } = Dimensions.get("window");

const ExercisesDetailPage = ({ route, navigation }) => {
  // ExercisesPage'den gönderilen veriyi alıyoruz
  const { exercise } = route.params || {};

  // Eğer veri yoksa hata vermesin diye boş obje kontrolü
  if (!exercise) {
    return (
      <Layout>
        <View style={styles.errorContainer}>
          <Text style={{ color: "white" }}>Egzersiz verisi bulunamadı.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButtonSimple}>
             <Text style={{color:'#000'}}>Geri Dön</Text>
          </Pressable>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View style={{ flex: 1 }}>
        {/* 🖼️ HERO GÖRSELİ (Üst Kısım) */}
        <View style={styles.heroContainer}>
            {exercise.gif ? (
                <Image source={exercise.gif} style={styles.heroImage} resizeMode="cover" />
            ) : (
                <View style={[styles.heroImage, {backgroundColor: '#222', alignItems:'center', justifyContent:'center'}]}>
                    <Ionicons name="barbell" size={80} color="#333" />
                </View>
            )}
            
            {/* Görselin üzerine gelen karartma efekti */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.2)", "#000"]}
                style={styles.heroGradient}
            />

            {/* Geri Dön Butonu (Sol Üst) */}
            <SafeAreaView style={styles.safeAreaHeader}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.backButtonBlurWrapper}
                >
                    <BlurView intensity={30} tint="dark" style={styles.backButtonBlur}>
                        <Ionicons name="arrow-back" size={24} color="#D6B982" />
                    </BlurView>
                </Pressable>
            </SafeAreaView>
        </View>

        {/* 📄 İÇERİK KISMI (Scrollable) */}
        <ScrollView 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Başlık ve Kategori */}
            <View style={styles.headerSection}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.tagContainer}>
                    <LinearGradient colors={["#D6B982", "#b39666"]} style={styles.tagBadge}>
                        <Text style={styles.tagText}>{exercise.muscle_group || "Genel"}</Text>
                    </LinearGradient>
                    {exercise.level && (
                         <View style={styles.tagBadgeOutline}>
                            <Text style={styles.tagTextOutline}>{exercise.level}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 📊 İSTATİSTİK KARTLARI (Set/Rep/Rest) */}
            <View style={styles.statsRow}>
                {/* SET */}
                <LinearGradient colors={["#222", "#151515"]} style={styles.statCard}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="layers-outline" size={20} color="#D6B982" />
                    </View>
                    <Text style={styles.statValue}>{exercise.sets || "3-4"}</Text>
                    <Text style={styles.statLabel}>SET</Text>
                </LinearGradient>

                {/* TEKRAR */}
                <LinearGradient colors={["#222", "#151515"]} style={styles.statCard}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="repeat-outline" size={20} color="#D6B982" />
                    </View>
                    <Text style={styles.statValue}>{exercise.reps || "8-12"}</Text>
                    <Text style={styles.statLabel}>TEKRAR</Text>
                </LinearGradient>

                {/* DİNLENME */}
                <LinearGradient colors={["#222", "#151515"]} style={styles.statCard}>
                     <View style={styles.iconCircle}>
                        <Ionicons name="timer-outline" size={20} color="#D6B982" />
                    </View>
                    <Text style={styles.statValue}>{exercise.rest_time || "60"}</Text>
                    <Text style={styles.statLabel}>SANİYE</Text>
                </LinearGradient>
            </View>

            {/* 📝 AÇIKLAMA */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="information-circle-outline" size={22} color="#D6B982" />
                    <Text style={styles.sectionTitle}>Nasıl Yapılır?</Text>
                </View>
                <Text style={styles.descriptionText}>
                    {exercise.desc || "Bu egzersiz için detaylı açıklama bulunmamaktadır. Formunuza dikkat ederek görseldeki hareketi uygulayınız."}
                </Text>
            </View>

            {/* 💡 İPUÇLARI (Varsa) */}
            {exercise.notes ? (
                <View style={styles.noteContainer}>
                    <LinearGradient colors={["rgba(214, 185, 130, 0.1)", "rgba(214, 185, 130, 0.02)"]} style={styles.noteGradient}>
                        <View style={{flexDirection:'row', marginBottom: 5}}>
                             <Ionicons name="bulb" size={20} color="#D6B982" style={{marginRight: 8}} />
                             <Text style={styles.noteTitle}>Eğitmen Notu</Text>
                        </View>
                        <Text style={styles.noteText}>{exercise.notes}</Text>
                    </LinearGradient>
                </View>
            ) : (
                 <View style={styles.noteContainer}>
                    <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]} style={styles.noteGradient}>
                        <View style={{flexDirection:'row', marginBottom: 5}}>
                             <Ionicons name="flash-outline" size={20} color="#888" style={{marginRight: 8}} />
                             <Text style={[styles.noteTitle, {color:'#888'}]}>İpucu</Text>
                        </View>
                        <Text style={[styles.noteText, {color:'#aaa'}]}>
                            Hareketi yaparken nefes alışverişinizi kontrol etmeyi ve kası hissetmeyi unutmayın.
                        </Text>
                    </LinearGradient>
                </View>
            )}

            {/* BUTON */}
            <Pressable style={styles.completeButton} onPress={() => navigation.goBack()}>
                <Text style={styles.completeButtonText}>EGZERSİZİ TAMAMLA</Text>
            </Pressable>

            <View style={{height: 40}} /> 
        </ScrollView>
      </View>
    </Layout>
  );
};

export default ExercisesDetailPage;

const styles = StyleSheet.create({
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backButtonSimple: { marginTop: 20, backgroundColor: '#D6B982', padding: 10, borderRadius: 8 },

    // HERO SECTION
    heroContainer: {
        height: height * 0.45, // Ekranın %45'i görsel
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%', // Görselin alt yarısını karartır
    },
    safeAreaHeader: {
        position: 'absolute',
        top: 10,
        left: 20,
        zIndex: 10,
    },
    backButtonBlurWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    backButtonBlur: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },

    // CONTENT SECTION
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerSection: {
        marginTop: -30, // Görselin üstüne hafif bindirme
        marginBottom: 25,
    },
    exerciseName: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagBadge: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    tagText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    tagBadgeOutline: {
        paddingVertical: 4,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#666',
    },
    tagTextOutline: {
        color: '#ccc',
        fontSize: 12,
    },

    // STATS
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(214, 185, 130, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#666',
        fontSize: 10,
        marginTop: 2,
        fontWeight: '600',
    },

    // DESCRIPTION
    sectionContainer: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        color: '#D6B982',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
    descriptionText: {
        color: '#ccc',
        lineHeight: 24,
        fontSize: 15,
    },

    // NOTES
    noteContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(214, 185, 130, 0.2)',
    },
    noteGradient: {
        padding: 15,
    },
    noteTitle: {
        color: '#D6B982',
        fontSize: 14,
        fontWeight: 'bold',
    },
    noteText: {
        color: '#D6B982',
        fontStyle: 'italic',
        fontSize: 14,
        lineHeight: 20,
    },

    // BUTTON
    completeButton: {
        backgroundColor: '#D6B982',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#D6B982",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    completeButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});