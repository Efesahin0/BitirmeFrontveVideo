import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import Layout from "../components/Layout";
import TrainingProgramService from "../services/trainingProgramService";

// 📌 ELİNDEKİ GIF VİDEOLAR (AYNI)
// 📌 ELİNDEKİ GIF/JPG DOSYALARI (Ekran görüntüsündeki isimlerle birebir)
const LOCAL_VIDEOS = {
  // ---------------- KARIN / CORE ----------------
  "Hanging Leg Raise": require("../../assets/videos/exercisesvideos/karın/HangingLegRaise.gif"),
  "Kicks": require("../../assets/videos/exercisesvideos/karın/Kicks.gif"),
  "Kneeling Cable Crunch": require("../../assets/videos/exercisesvideos/karın/KneelingCableCrunch.gif"),
  "Lying Leg Raise": require("../../assets/videos/exercisesvideos/karın/LyingLegRaise.jpg"),
  "Mountain Climber": require("../../assets/videos/exercisesvideos/karın/MountainClimberGirl.gif"),
  "Plank": require("../../assets/videos/exercisesvideos/karın/Plank.gif"),
  "Russian Twist": require("../../assets/videos/exercisesvideos/karın/RussianTwist.gif"),
  "Side Crunch": require("../../assets/videos/exercisesvideos/karın/SideCruch.gif"), // dosya adı böyle (Cruch)
  "Side Twist": require("../../assets/videos/exercisesvideos/karın/SideTwist.gif"),
  "Weighted Crunch": require("../../assets/videos/exercisesvideos/karın/WeightedCrunch.gif"),
  "Weighted Plank": require("../../assets/videos/exercisesvideos/karın/WeightedPlank.gif"),

  // ---------------- BACAK / KALÇA ----------------
  "Abductor Machine": require("../../assets/videos/exercisesvideos/bacak/Abductor.gif"),
  "Adductor Machine": require("../../assets/videos/exercisesvideos/bacak/Adductor.gif"),
  "Back Squat": require("../../assets/videos/exercisesvideos/bacak/Back Squat.jpg"),
  "Barbell Front Squat": require("../../assets/videos/exercisesvideos/bacak/BarbellFrontSquat.gif"),
  "Barbell Sumo Deadlift": require("../../assets/videos/exercisesvideos/bacak/BarbellSumoDeadlift.gif"),
  "Bicycle": require("../../assets/videos/exercisesvideos/bacak/Bicycle.gif"),
  "Bicycle (Girl)": require("../../assets/videos/exercisesvideos/bacak/BicycleGirl.gif"),
  "Bodyweight Squat": require("../../assets/videos/exercisesvideos/bacak/BodyWeightSquatGirl.gif"),
  "Bulgarian Split Squat": require("../../assets/videos/exercisesvideos/bacak/BulgarianSplitSquat.gif"),
  "Cable Donkey Kickback": require("../../assets/videos/exercisesvideos/bacak/CableDonkeyKickback.gif"),
  "Dumbbell Goblet Squat": require("../../assets/videos/exercisesvideos/bacak/DumbellGobletSquat.gif"),
  "Glute Bridge": require("../../assets/videos/exercisesvideos/bacak/GluteBridge.gif"),
  "Hack Squat": require("../../assets/videos/exercisesvideos/bacak/HackSquat.gif"),
  "Hip Adductor (Girl)": require("../../assets/videos/exercisesvideos/bacak/HipAdductorGirl.jpg"),
  "Hip Thrust": require("../../assets/videos/exercisesvideos/bacak/HipThrusts.gif"),
  "Leg Extension": require("../../assets/videos/exercisesvideos/bacak/LegExtension.gif"),
  "Leg Press": require("../../assets/videos/exercisesvideos/bacak/LegPress.gif"),
  "Machine Calf Raise": require("../../assets/videos/exercisesvideos/bacak/MachineCalfRaise.gif"),
  "Smith Machine Calf Raise": require("../../assets/videos/exercisesvideos/bacak/SmithMachineCalfRaise.gif"),
  "Smith Machine Squat": require("../../assets/videos/exercisesvideos/bacak/SmithMachineSquat.gif"),
  "Treadmill": require("../../assets/videos/exercisesvideos/bacak/TreadmillGirl.gif"),


  // ---------------- BICEPS ----------------
  "Barbell Curl": require("../../assets/videos/exercisesvideos/biceps/BarbellCurlGirl.gif"),
  "Concentration Curl": require("../../assets/videos/exercisesvideos/biceps/ConcentrationCurl.gif"),
  "Dumbbell Curl": require("../../assets/videos/exercisesvideos/biceps/DumbellCurl.gif"),
  "EZ Bar Curl": require("../../assets/videos/exercisesvideos/biceps/EzBarCurlGirl.gif"),
  "Hammer Curl": require("../../assets/videos/exercisesvideos/biceps/HammerCurls.gif"),
  "Preacher Curl": require("../../assets/videos/exercisesvideos/biceps/PreacherCurl.gif"),
  "Rope Curl": require("../../assets/videos/exercisesvideos/biceps/RopeCurl.gif"),
  "Scott Curl": require("../../assets/videos/exercisesvideos/biceps/ScotCurl.gif"),
  "Single Arm Cable Curl": require("../../assets/videos/exercisesvideos/biceps/SingleArmCableCurl.gif"),

  // ---------------- GÖĞÜS ----------------
  "Archer Push Up": require("../../assets/videos/exercisesvideos/göğüs/ArcherPushUp.gif"),
  "Cable Crossover": require("../../assets/videos/exercisesvideos/göğüs/CableCrossover.gif"),
  "Decline Barbell Bench Press": require("../../assets/videos/exercisesvideos/göğüs/DeclineBarbellBenchpress.gif"),
  "Decline Dumbbell Fly": require("../../assets/videos/exercisesvideos/göğüs/DeclineDumbbellFly.gif"),
  "Decline Push Up": require("../../assets/videos/exercisesvideos/göğüs/DeclinePushUp.gif"),
  "Diamond Push Up": require("../../assets/videos/exercisesvideos/göğüs/DiamondPushUp.gif"),
  "Dips": require("../../assets/videos/exercisesvideos/göğüs/Dips.gif"),
  "Flat Barbell Bench Press": require("../../assets/videos/exercisesvideos/göğüs/FlatBarbellBenchPress.gif"),
  "Flat Dumbbell Bench Press": require("../../assets/videos/exercisesvideos/göğüs/FlatDumbbellBenchPress.gif"),
  "Incline Dumbbell Bench Press": require("../../assets/videos/exercisesvideos/göğüs/InclineDumbbellBenchPress.gif"),
  "Incline Barbell Press": require("../../assets/videos/exercisesvideos/göğüs/InclineBarbellPress.gif"),
  "Incline Dumbbell Fly": require("../../assets/videos/exercisesvideos/göğüs/InclineDumbellFly.gif"),
  "Incline Machine Press": require("../../assets/videos/exercisesvideos/göğüs/InclineMachinePress.gif"),
  "Incline Push Up": require("../../assets/videos/exercisesvideos/göğüs/InclinePushUp.gif"),
  "Machine Press": require("../../assets/videos/exercisesvideos/göğüs/MachinePress.gif"),
  "Pec Deck": require("../../assets/videos/exercisesvideos/göğüs/PeckDeck.gif"),
  "Push Up": require("../../assets/videos/exercisesvideos/göğüs/PushUp.gif"),
  "Wide Grip Push Up": require("../../assets/videos/exercisesvideos/göğüs/WideGripPushUp.gif"),

  // ---------------- OMUZ ----------------
  "Arnold Press": require("../../assets/videos/exercisesvideos/omuz/ArnoldPress.gif"),
  "Barbell Front Raise": require("../../assets/videos/exercisesvideos/omuz/BarbellFrontRaise.gif"),
  "Barbell Shoulder Press": require("../../assets/videos/exercisesvideos/omuz/BarbellShoulderPress.gif"),
  "Cable Front Raise": require("../../assets/videos/exercisesvideos/omuz/CableFrontRaise.gif"),
  "Cable Lateral Raise": require("../../assets/videos/exercisesvideos/omuz/CableLateralRaise.gif"),
  "Cable Rear Delt Fly": require("../../assets/videos/exercisesvideos/omuz/CableReardelt.gif"),
  "Dumbbell Upright Row": require("../../assets/videos/exercisesvideos/omuz/DumbellUprightRow.gif"),
  "Dumbbell Front Raise": require("../../assets/videos/exercisesvideos/omuz/DumbellFrontRaise.gif"),
  "Dumbbell Lateral Raise": require("../../assets/videos/exercisesvideos/omuz/DumbellLateralRaise.gif"),
  "Dumbbell Shoulder Press": require("../../assets/videos/exercisesvideos/omuz/DumbellShoulderPress.gif"),
  "Kneeling High Pulley Row": require("../../assets/videos/exercisesvideos/omuz/KneelingHighPulleyRow.gif"),
  "Lateral Raise Machine": require("../../assets/videos/exercisesvideos/omuz/LateralRaiseMachine.gif"),
  "Pec Deck Machine": require("../../assets/videos/exercisesvideos/omuz/PecDeckMachine.gif"),
  "Plate Front Raise": require("../../assets/videos/exercisesvideos/omuz/PlateFrontRaise.gif"),
  "Rope Pull Over": require("../../assets/videos/exercisesvideos/omuz/RopePullOver.gif"),
  "Seated Dumbbell Rear Delt": require("../../assets/videos/exercisesvideos/omuz/SeatedDumbellReardelt.gif"),
  "Seated Dumbbell Shoulder Press": require("../../assets/videos/exercisesvideos/omuz/SeatedDumbellShoulderPress.gif"),
  "Smith Machine Shoulder Press": require("../../assets/videos/exercisesvideos/omuz/SmithMachineShoulderPress.gif"),

  // ---------------- SIRT ----------------
  "Barbell Romanian Deadlift": require("../../assets/videos/exercisesvideos/sırt/BarbellRomanianDeadlift.gif"),
  "Cable Row": require("../../assets/videos/exercisesvideos/sırt/CableRow.gif"),
  "Chin Up": require("../../assets/videos/exercisesvideos/sırt/ChinUp.gif"),
  "Close Grip Lat Pulldown": require("../../assets/videos/exercisesvideos/sırt/CloseGripLatPulldown.gif"),
  "Deadlift": require("../../assets/videos/exercisesvideos/sırt/Deadlift.gif"),
 // "Lat Pulldown": require("../../assets/videos/exercisesvideos/sırt/LatPulldown.jpg"),
  "Machine Row": require("../../assets/videos/exercisesvideos/sırt/MachineRow.gif"),
  "Machine Row (Up)": require("../../assets/videos/exercisesvideos/sırt/MachineRowUp.gif"),
  "Pull Up": require("../../assets/videos/exercisesvideos/sırt/PullUp.gif"),
  "Single Dumbbell Row": require("../../assets/videos/exercisesvideos/sırt/SingleDumbellRow.gif"),
  "T-Bar Row": require("../../assets/videos/exercisesvideos/sırt/Tbarrow.gif"),

  // ---------------- TRICEPS ----------------
  "Bench Dips": require("../../assets/videos/exercisesvideos/triceps/BenchDips.gif"),
  "Diamond Push Up (Triceps)": require("../../assets/videos/exercisesvideos/triceps/DiamondPushUp.gif"),
  "Dips (Triceps)": require("../../assets/videos/exercisesvideos/triceps/Dips.gif"),
  "Dumbbell Triceps Extension": require("../../assets/videos/exercisesvideos/triceps/DumbellTriceps.gif"),
  "EZ Barbell Triceps Extension": require("../../assets/videos/exercisesvideos/triceps/EzBarbellTriceps.gif"),
  "Rope Pushdown": require("../../assets/videos/exercisesvideos/triceps/RopePushdown.gif"),
};

// 📌 GÜNLER
const DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

// 📌 EGZERSİZ KÜTÜPHANESİ
const EXERCISE_LIBRARY = {
  Karın: [
    { name: "Hanging Leg Raise", gif: LOCAL_VIDEOS["Hanging Leg Raise"], desc: "Alt karın odaklı, kontrollü kaldırış.", muscle_group: "Karın", level: "Orta" },
    { name: "Kicks", gif: LOCAL_VIDEOS["Kicks"], desc: "Core aktivasyonu ve alt karın için dinamik hareket.", muscle_group: "Karın", level: "Başlangıç" },
    { name: "Kneeling Cable Crunch", gif: LOCAL_VIDEOS["Kneeling Cable Crunch"], desc: "Kablo ile karın sıkıştırma, iyi izolasyon.", muscle_group: "Karın", level: "Orta" },
    { name: "Lying Leg Raise", gif: LOCAL_VIDEOS["Lying Leg Raise"], desc: "Alt karın için temel bacak kaldırma.", muscle_group: "Karın", level: "Başlangıç" },
    { name: "Mountain Climber", gif: LOCAL_VIDEOS["Mountain Climber"], desc: "Core + kardiyo, tempo kontrollü yapılmalı.", muscle_group: "Karın", level: "Başlangıç" },
    { name: "Plank", gif: LOCAL_VIDEOS["Plank"], desc: "Core stabilizasyonu, bel boşluğunu koru.", muscle_group: "Karın", level: "Başlangıç" },
    { name: "Russian Twist", gif: LOCAL_VIDEOS["Russian Twist"], desc: "Oblique (yan karın) odaklı rotasyon.", muscle_group: "Karın", level: "Orta" },
    { name: "Side Crunch", gif: LOCAL_VIDEOS["Side Crunch"], desc: "Yan karın için side crunch varyasyonu.", muscle_group: "Karın", level: "Başlangıç" },
    { name: "Side Twist", gif: LOCAL_VIDEOS["Side Twist"], desc: "Yan core rotasyon/direnç odaklı.", muscle_group: "Karın", level: "Orta" },
    { name: "Weighted Crunch", gif: LOCAL_VIDEOS["Weighted Crunch"], desc: "Ağırlıkla crunch, kontrollü nefes.", muscle_group: "Karın", level: "Orta" },
    { name: "Weighted Plank", gif: LOCAL_VIDEOS["Weighted Plank"], desc: "Plank üzerine yük bindirilmiş varyasyon.", muscle_group: "Karın", level: "İleri" },
  ],

  Bacak: [
    { name: "Back Squat", gif: LOCAL_VIDEOS["Back Squat"], desc: "Temel squat; core ve form kritik.", muscle_group: "Bacak", level: "Orta" },
    { name: "Barbell Front Squat", gif: LOCAL_VIDEOS["Barbell Front Squat"], desc: "Quadriceps odaklı squat varyasyonu.", muscle_group: "Bacak", level: "Orta" },
    { name: "Hack Squat", gif: LOCAL_VIDEOS["Hack Squat"], desc: "Makinede squat; bacak izolasyonu iyi.", muscle_group: "Bacak", level: "Başlangıç" },
    { name: "Dumbbell Goblet Squat", gif: LOCAL_VIDEOS["Dumbbell Goblet Squat"], desc: "Başlangıç için en iyi squat varyasyonlarından.", muscle_group: "Bacak", level: "Başlangıç" },
    { name: "Bodyweight Squat", gif: LOCAL_VIDEOS["Bodyweight Squat"], desc: "Vücut ağırlığı ile temel squat.", muscle_group: "Bacak", level: "Başlangıç" },
    { name: "Bulgarian Split Squat", gif: LOCAL_VIDEOS["Bulgarian Split Squat"], desc: "Tek bacak kuvvet + denge.", muscle_group: "Bacak", level: "Orta" },
    { name: "Leg Press", gif: LOCAL_VIDEOS["Leg Press"], desc: "Quadriceps + glute, ayak yerleşimi önemli.", muscle_group: "Bacak", level: "Başlangıç" },
    { name: "Leg Extension", gif: LOCAL_VIDEOS["Leg Extension"], desc: "Quadriceps izolasyonu.", muscle_group: "Bacak", level: "Başlangıç" },
    { name: "Machine Calf Raise", gif: LOCAL_VIDEOS["Machine Calf Raise"], desc: "Baldır için makine calf raise.", muscle_group: "Bacak", level: "Başlangıç" },
    { name: "Smith Machine Calf Raise", gif: LOCAL_VIDEOS["Smith Machine Calf Raise"], desc: "Smith ile calf raise.", muscle_group: "Bacak", level: "Başlangıç" },
    { name: "Smith Machine Squat", gif: LOCAL_VIDEOS["Smith Machine Squat"], desc: "Smith squat; kontrollü iniş.", muscle_group: "Bacak", level: "Başlangıç" },
  ],

  Kalça: [
    { name: "Hip Thrust", gif: LOCAL_VIDEOS["Hip Thrust"], desc: "Glute için en etkili hareketlerden.", muscle_group: "Kalça", level: "Orta" },
    { name: "Glute Bridge", gif: LOCAL_VIDEOS["Glute Bridge"], desc: "Hip thrust’un temel varyasyonu.", muscle_group: "Kalça", level: "Başlangıç" },
    { name: "Cable Donkey Kickback", gif: LOCAL_VIDEOS["Cable Donkey Kickback"], desc: "Kalça izolasyonu, cable kickback.", muscle_group: "Kalça", level: "Başlangıç" },
    { name: "Abductor Machine", gif: LOCAL_VIDEOS["Abductor Machine"], desc: "Glute medius odaklı abductor.", muscle_group: "Kalça", level: "Başlangıç" },
    { name: "Adductor Machine", gif: LOCAL_VIDEOS["Adductor Machine"], desc: "İç bacak/adductor odaklı.", muscle_group: "Kalça", level: "Başlangıç" },
    { name: "Hip Adductor (Girl)", gif: LOCAL_VIDEOS["Hip Adductor (Girl)"], desc: "Adductor odaklı varyasyon.", muscle_group: "Kalça", level: "Başlangıç" },
  ],

  Göğüs: [
    { name: "Flat Barbell Bench Press", gif: LOCAL_VIDEOS["Flat Barbell Bench Press"], desc: "Göğüs için temel barbell press.", muscle_group: "Göğüs", level: "Orta" },
    { name: "Flat Dumbbell Bench Press", gif: LOCAL_VIDEOS["Flat Dumbbell Bench Press"], desc: "Dumbbell ile bench; stabilizasyon artar.", muscle_group: "Göğüs", level: "Orta" },
    { name: "Incline Barbell Press", gif: LOCAL_VIDEOS["Incline Barbell Press"], desc: "Üst göğüs odaklı incline press.", muscle_group: "Göğüs", level: "Orta" },
    { name: "Incline Dumbbell Bench Press", gif: LOCAL_VIDEOS["Incline Dumbbell Bench Press"], desc: "Üst göğüs için dumbbell incline.", muscle_group: "Göğüs", level: "Orta" },
    { name: "Decline Barbell Bench Press", gif: LOCAL_VIDEOS["Decline Barbell Bench Press"], desc: "Alt göğüs odaklı decline press.", muscle_group: "Göğüs", level: "Orta" },
    { name: "Decline Dumbbell Fly", gif: LOCAL_VIDEOS["Decline Dumbbell Fly"], desc: "Alt göğüste esneme odaklı fly.", muscle_group: "Göğüs", level: "Orta" },
    { name: "Cable Crossover", gif: LOCAL_VIDEOS["Cable Crossover"], desc: "Göğüs izolasyonu, peak contraction iyi.", muscle_group: "Göğüs", level: "Orta" },
    { name: "Machine Press", gif: LOCAL_VIDEOS["Machine Press"], desc: "Makine press; kontrollü itiş.", muscle_group: "Göğüs", level: "Başlangıç" },
    { name: "Incline Machine Press", gif: LOCAL_VIDEOS["Incline Machine Press"], desc: "Üst göğüs için incline machine press.", muscle_group: "Göğüs", level: "Başlangıç" },
    { name: "Pec Deck", gif: LOCAL_VIDEOS["Pec Deck"], desc: "Pec deck ile göğüs izolasyonu.", muscle_group: "Göğüs", level: "Başlangıç" },
    { name: "Push Up", gif: LOCAL_VIDEOS["Push Up"], desc: "Vücut ağırlığı temel itiş.", muscle_group: "Göğüs", level: "Başlangıç" },
    { name: "Incline Push Up", gif: LOCAL_VIDEOS["Incline Push Up"], desc: "Başlangıç için daha kolay push-up.", muscle_group: "Göğüs", level: "Başlangıç" },
    { name: "Decline Push Up", gif: LOCAL_VIDEOS["Decline Push Up"], desc: "Daha zor push-up; üst göğüs/omuz.", muscle_group: "Göğüs", level: "Orta" },
    { name: "Diamond Push Up", gif: LOCAL_VIDEOS["Diamond Push Up"], desc: "Triceps + iç göğüs odaklı.", muscle_group: "Göğüs", level: "Orta" },
    { name: "Wide Grip Push Up", gif: LOCAL_VIDEOS["Wide Grip Push Up"], desc: "Göğüs aktivasyonu daha belirgin.", muscle_group: "Göğüs", level: "Başlangıç" },
    { name: "Archer Push Up", gif: LOCAL_VIDEOS["Archer Push Up"], desc: "Tek kola yük bindiren zor varyasyon.", muscle_group: "Göğüs", level: "İleri" },
    { name: "Dips", gif: LOCAL_VIDEOS["Dips"], desc: "Göğüs + triceps; form önemli.", muscle_group: "Göğüs", level: "Orta" },
  ],

  Deltoidler: [
    { name: "Arnold Press", gif: LOCAL_VIDEOS["Arnold Press"], desc: "Omuzlara farklı açı kazandırır.", muscle_group: "Omuz", level: "Orta" },
    { name: "Dumbbell Shoulder Press", gif: LOCAL_VIDEOS["Dumbbell Shoulder Press"], desc: "Omuz press; kontrollü.", muscle_group: "Omuz", level: "Orta" },
    { name: "Barbell Shoulder Press", gif: LOCAL_VIDEOS["Barbell Shoulder Press"], desc: "Barbell OHP varyasyonu.", muscle_group: "Omuz", level: "Orta" },
    { name: "Seated Dumbbell Shoulder Press", gif: LOCAL_VIDEOS["Seated Dumbbell Shoulder Press"], desc: "Seated press; stabil.", muscle_group: "Omuz", level: "Başlangıç" },
    { name: "Smith Machine Shoulder Press", gif: LOCAL_VIDEOS["Smith Machine Shoulder Press"], desc: "Smith ile shoulder press.", muscle_group: "Omuz", level: "Başlangıç" },
    { name: "Dumbbell Lateral Raise", gif: LOCAL_VIDEOS["Dumbbell Lateral Raise"], desc: "Orta omuz; genişlik.", muscle_group: "Omuz", level: "Başlangıç" },
    { name: "Cable Lateral Raise", gif: LOCAL_VIDEOS["Cable Lateral Raise"], desc: "Kablo ile sürekli tansiyon.", muscle_group: "Omuz", level: "Orta" },
    { name: "Lateral Raise Machine", gif: LOCAL_VIDEOS["Lateral Raise Machine"], desc: "Makinede lateral raise.", muscle_group: "Omuz", level: "Başlangıç" },
    { name: "Dumbbell Front Raise", gif: LOCAL_VIDEOS["Dumbbell Front Raise"], desc: "Ön omuz izolasyonu.", muscle_group: "Omuz", level: "Başlangıç" },
    { name: "Barbell Front Raise", gif: LOCAL_VIDEOS["Barbell Front Raise"], desc: "Ön omuz; barbell.", muscle_group: "Omuz", level: "Orta" },
    { name: "Cable Front Raise", gif: LOCAL_VIDEOS["Cable Front Raise"], desc: "Kablo ile front raise.", muscle_group: "Omuz", level: "Orta" },
    { name: "Plate Front Raise", gif: LOCAL_VIDEOS["Plate Front Raise"], desc: "Plate ile front raise.", muscle_group: "Omuz", level: "Başlangıç" },
    { name: "Dumbbell Upright Row", gif: LOCAL_VIDEOS["Dumbbell Upright Row"], desc: "Trapez + omuz; dirseği çok yükseltme.", muscle_group: "Omuz", level: "Orta" },
    { name: "Cable Rear Delt Fly", gif: LOCAL_VIDEOS["Cable Rear Delt Fly"], desc: "Arka omuz izolasyonu.", muscle_group: "Omuz", level: "Orta" },
    { name: "Seated Dumbbell Rear Delt", gif: LOCAL_VIDEOS["Seated Dumbbell Rear Delt"], desc: "Arka omuz; seated.", muscle_group: "Omuz", level: "Orta" },
    { name: "Pec Deck Machine", gif: LOCAL_VIDEOS["Pec Deck Machine"], desc: "Arka omuz/pec deck varyasyonu.", muscle_group: "Omuz", level: "Başlangıç" },
    { name: "Rope Pull Over", gif: LOCAL_VIDEOS["Rope Pull Over"], desc: "Üst sırt + lat destekli.", muscle_group: "Omuz", level: "Orta" },
    { name: "Kneeling High Pulley Row", gif: LOCAL_VIDEOS["Kneeling High Pulley Row"], desc: "Üst sırt/arka omuz hissi verir.", muscle_group: "Omuz", level: "Orta" },
  ],

  Sırt: [
    { name: "Deadlift", gif: LOCAL_VIDEOS["Deadlift"], desc: "Posterior chain; form en kritik.", muscle_group: "Sırt", level: "Orta" },
    { name: "Barbell Romanian Deadlift", gif: LOCAL_VIDEOS["Barbell Romanian Deadlift"], desc: "Hamstring + bel; kontrollü.", muscle_group: "Sırt", level: "Orta" },
    { name: "Pull Up", gif: LOCAL_VIDEOS["Pull Up"], desc: "Lat genişliği; vücut ağırlığı.", muscle_group: "Sırt", level: "Orta" },
    { name: "Chin Up", gif: LOCAL_VIDEOS["Chin Up"], desc: "Pull-up’ın biceps ağırlıklı hali.", muscle_group: "Sırt", level: "Orta" },
   //{ name: "Lat Pulldown", gif: LOCAL_VIDEOS["Lat Pulldown"], desc: "Makinede lat odaklı çekiş.", muscle_group: "Sırt", level: "Başlangıç" },
    { name: "Close Grip Lat Pulldown", gif: LOCAL_VIDEOS["Close Grip Lat Pulldown"], desc: "Dar tutuş pulldown.", muscle_group: "Sırt", level: "Başlangıç" },
    { name: "Cable Row", gif: LOCAL_VIDEOS["Cable Row"], desc: "Orta sırt; scapula kontrolü.", muscle_group: "Sırt", level: "Başlangıç" },
    { name: "Machine Row", gif: LOCAL_VIDEOS["Machine Row"], desc: "Makine row; sabit çekiş.", muscle_group: "Sırt", level: "Başlangıç" },
    { name: "Machine Row (Up)", gif: LOCAL_VIDEOS["Machine Row (Up)"], desc: "Makine row varyasyonu.", muscle_group: "Sırt", level: "Başlangıç" },
    { name: "Single Dumbbell Row", gif: LOCAL_VIDEOS["Single Dumbbell Row"], desc: "Tek kol row; lat/orta sırt.", muscle_group: "Sırt", level: "Orta" },
    { name: "T-Bar Row", gif: LOCAL_VIDEOS["T-Bar Row"], desc: "Kalınlık için t-bar row.", muscle_group: "Sırt", level: "Orta" },
  ],

  Biceps: [
    { name: "Barbell Curl", gif: LOCAL_VIDEOS["Barbell Curl"], desc: "Biceps temel curl.", muscle_group: "Biceps", level: "Başlangıç" },
    { name: "Dumbbell Curl", gif: LOCAL_VIDEOS["Dumbbell Curl"], desc: "Dumbbell ile biceps curl.", muscle_group: "Biceps", level: "Başlangıç" },
    { name: "Hammer Curl", gif: LOCAL_VIDEOS["Hammer Curl"], desc: "Brachialis + önkol.", muscle_group: "Biceps", level: "Başlangıç" },
    { name: "EZ Bar Curl", gif: LOCAL_VIDEOS["EZ Bar Curl"], desc: "Bileğe daha rahat tutuş.", muscle_group: "Biceps", level: "Başlangıç" },
    { name: "Concentration Curl", gif: LOCAL_VIDEOS["Concentration Curl"], desc: "İzolasyon; strict form.", muscle_group: "Biceps", level: "Orta" },
    { name: "Preacher Curl", gif: LOCAL_VIDEOS["Preacher Curl"], desc: "Alt pozisyonda cheating’i azaltır.", muscle_group: "Biceps", level: "Orta" },
    { name: "Rope Curl", gif: LOCAL_VIDEOS["Rope Curl"], desc: "Kablo/rope ile sürekli tansiyon.", muscle_group: "Biceps", level: "Orta" },
    { name: "Scott Curl", gif: LOCAL_VIDEOS["Scott Curl"], desc: "Preacher/Scott curl varyasyonu.", muscle_group: "Biceps", level: "Orta" },
    { name: "Single Arm Cable Curl", gif: LOCAL_VIDEOS["Single Arm Cable Curl"], desc: "Tek kol cable curl.", muscle_group: "Biceps", level: "Orta" },
  ],

  Triceps: [
    { name: "Bench Dips", gif: LOCAL_VIDEOS["Bench Dips"], desc: "Bench dips; omuzları koru.", muscle_group: "Triceps", level: "Başlangıç" },
    { name: "Dips (Triceps)", gif: LOCAL_VIDEOS["Dips (Triceps)"], desc: "Triceps ağırlıklı dips.", muscle_group: "Triceps", level: "Orta" },
    { name: "Diamond Push Up (Triceps)", gif: LOCAL_VIDEOS["Diamond Push Up (Triceps)"], desc: "Triceps odaklı push-up.", muscle_group: "Triceps", level: "Orta" },
    { name: "Rope Pushdown", gif: LOCAL_VIDEOS["Rope Pushdown"], desc: "Kablo ile triceps pushdown.", muscle_group: "Triceps", level: "Başlangıç" },
    { name: "Dumbbell Triceps Extension", gif: LOCAL_VIDEOS["Dumbbell Triceps Extension"], desc: "Overhead triceps; uzun baş.", muscle_group: "Triceps", level: "Orta" },
    { name: "EZ Barbell Triceps Extension", gif: LOCAL_VIDEOS["EZ Barbell Triceps Extension"], desc: "Skull crusher tarzı.", muscle_group: "Triceps", level: "Orta" },
  ],
};

// 📌 KAS RESİMLERİ
const IMAGE_MAP = {
  Göğüs: require("../../assets/images/exercisesicons/chest.png"),
  Sırt: require("../../assets/images/exercisesicons/back.png"),
  Bacak: require("../../assets/images/exercisesicons/leg.png"),
  Kalça: require("../../assets/images/exercisesicons/glutes.png"),
  Deltoidler: require("../../assets/images/exercisesicons/omuz.png"),
  Biceps: require("../../assets/images/exercisesicons/biceps.png"),
  Triceps: require("../../assets/images/exercisesicons/triceps.png"),
};

const LEVEL_OPTIONS = [
  { key: "beginner", label: "Başlangıç", desc: "Haftada 2 kez kas grubu, temel yoğunluk." },
  { key: "intermediate", label: "Orta Seviye", desc: "Haftada 2–3 kez kas grubu, orta hacim." },
  { key: "advanced", label: "Pro", desc: "Haftada 3 kez kas grubu, yüksek hacim." },
];

const DAYS_PER_WEEK_OPTIONS = [3, 4, 5, 6];

const ExercisesPage = ({ navigation }) => {
  const [tab, setTab] = useState("map");
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  // 🔐 Kullanıcı + token
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);

  // 🎯 Program durumu
  const [program, setProgram] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Pazartesi");
  const [loadingProgram, setLoadingProgram] = useState(false);
  const [programError, setProgramError] = useState(null);

  // 📌 Egzersiz kartı expand state
  const [expandedExercises, setExpandedExercises] = useState({});

  // ⚙️ Program oluşturma/yenileme modalı
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [selectedDaysPerWeek, setSelectedDaysPerWeek] = useState(3);

  // 🎬 Video Modal
  const [videoModal, setVideoModal] = useState(false);
  const [selectedExerciseData, setSelectedExerciseData] = useState(null);

  // İlk açılışta backend'den programı çek
  useEffect(() => {
    if (token) {
      fetchProgram();
    }
  }, [token]);

  const normalizeProgram = (raw) => {
    const normalized = {};
    DAYS.forEach((day) => {
      normalized[day] = raw?.[day] || raw?.[day.toLowerCase()] || [];
    });
    return normalized;
  };

  const fetchProgram = async () => {
    try {
      setLoadingProgram(true);
      setProgramError(null);
      const rawProgram = await TrainingProgramService.getProgram(token);
      const normalized = normalizeProgram(rawProgram);
      const hasAny = Object.values(normalized).flat().length > 0;
      setProgram(hasAny ? normalized : null);

      if (hasAny) {
        const firstDayWithEx = DAYS.find((d) => (normalized[d] || []).length > 0) || "Pazartesi";
        setSelectedDay(firstDayWithEx);
      }
    } catch (err) {
      setProgram(null);
      setProgramError(err.message || "Program yüklenirken hata oluştu.");
    } finally {
      setLoadingProgram(false);
    }
  };

  const toggleExpand = (day, index) => {
    const key = `${day}-${index}`;
    setExpandedExercises((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isProfileComplete = () => {
    if (!user) return false;
    if (!user.height || !user.weight || !user.dateOfBirth) return false;
    return true;
  };

  const openConfigModal = () => {
    if (!isProfileComplete()) {
      Alert.alert(
        "Profil Eksik",
        "Lütfen profil sayfasından boy, kilo, doğum tarihi ve sağlık bilgilerinizi doldurun."
      );
      return;
    }
    setConfigModalVisible(true);
  };

  const handleSubmitProgramConfig = async () => {
    try {
      if (!token) {
        Alert.alert("Oturum Hatası", "Lütfen tekrar giriş yapın.");
        return;
      }

      setLoadingProgram(true);
      setProgramError(null);

      let rawProgram;
      rawProgram = await TrainingProgramService.generateProgram({
        token,
        level: selectedLevel,
        daysPerWeek: selectedDaysPerWeek,
        user: {
          height: user?.height,
          weight: user?.weight,
          age: user?.dateOfBirth
            ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()
            : null,
          goal: "Kilo Alma",
          illnesses: [],
        },
      });

      const normalized = normalizeProgram(rawProgram);
      const hasAny = Object.values(normalized).flat().length > 0;
      setProgram(hasAny ? normalized : null);

      if (hasAny) {
        const firstDayWithEx = DAYS.find((d) => (normalized[d] || []).length > 0) || "Pazartesi";
        setSelectedDay(firstDayWithEx);
      }

      setConfigModalVisible(false);
      Alert.alert(
        "Başarılı",
        program ? "Programın yenilendi." : "Programın oluşturuldu."
      );
    } catch (err) {
      console.log("Program create/refresh error:", err);
      Alert.alert(
        "Hata",
        err.message || "Program oluşturulurken bir hata oluştu."
      );
    } finally {
      setLoadingProgram(false);
    }
  };

  return (
    <Layout>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={{height: 20}} /> 
          
          {/* TABLAR */}
          <View style={styles.tabContainer}>
            <Pressable style={styles.tabWrapper} onPress={() => { setTab("map"); setSelectedMuscle(null); }}>
              {tab === "map" ? (
                <LinearGradient colors={["#D6B982", "#b39666"]} style={styles.activeTabGradient}>
                  <Text style={[styles.tabText, styles.activeTabText]}>KASLAR</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Text style={styles.tabText}>KASLAR</Text>
                </View>
              )}
            </Pressable>

            <Pressable style={styles.tabWrapper} onPress={() => setTab("program")}>
              {tab === "program" ? (
                <LinearGradient colors={["#D6B982", "#b39666"]} style={styles.activeTabGradient}>
                  <Text style={[styles.tabText, styles.activeTabText]}>PROGRAM</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Text style={styles.tabText}>PROGRAM</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* 📍 KAS KARTLARI */}
          {tab === "map" && !selectedMuscle && (
            <View style={{ width: "90%" }}>
              {Object.keys(IMAGE_MAP).map((muscle, i) => (
                <Pressable
                  key={i}
                  onPress={() => setSelectedMuscle(muscle)}
                  style={styles.cardContainer}
                >
                  <LinearGradient
                    colors={["rgba(40,40,40,0.9)", "rgba(20,20,20,0.95)"]}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    <Image source={IMAGE_MAP[muscle]} style={styles.cardImage} />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{muscle}</Text>
                      <Text style={styles.cardSubtitle}>Egzersizleri Gör</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#D6B982" style={{ opacity: 0.8 }} />
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          )}

          {/* 📍 EGZERSİZ DETAY LİSTESİ */}
          {tab === "map" && selectedMuscle && (
            <View style={{ width: "90%" }}>
              <View style={styles.headerRow}>
                <Pressable onPress={() => setSelectedMuscle(null)} style={styles.backButtonIcon}>
                  <Ionicons name="arrow-back" size={24} color="#D6B982" />
                </Pressable>
                <Text style={styles.headerTitle}>{selectedMuscle}</Text>
                <View style={{ width: 40 }} />
              </View>

              {(EXERCISE_LIBRARY[selectedMuscle] || []).map((ex, i) => (
                <LinearGradient
                  key={i}
                  colors={["#2a2a2a", "#1a1a1a"]}
                  style={styles.exerciseCard}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.descriptionSmall} numberOfLines={2}>{ex.desc}</Text>
                  </View>
                  <Pressable
                    style={styles.playButton}
                    onPress={() => {
                      setSelectedExerciseData(ex);
                      setVideoModal(true);
                    }}
                  >
                    <Ionicons name={ex.gif ? "play" : "eye"} size={18} color="#000" />
                  </Pressable>
                </LinearGradient>
              ))}
            </View>
          )}

          {/* 🧠 PROGRAM SEKME */}
          {tab === "program" && (
            <View style={{ width: "90%" }}>
              {loadingProgram && (
                <View style={{ alignItems: "center", marginVertical: 20 }}>
                  <ActivityIndicator size="large" color="#D6B982" />
                  <Text style={{ color: "#888", marginTop: 10 }}>Program yükleniyor...</Text>
                </View>
              )}

              {programError && (
                <Text style={styles.errorText}>{programError}</Text>
              )}

              {!loadingProgram && !program && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="fitness-outline" size={60} color="#444" style={{ marginBottom: 10 }} />
                  <Text style={styles.programEmptyText}>Henüz bir programın yok.</Text>
                  <Text style={styles.programEmptySubText}>
                    Sana özel bir antrenman programı oluşturmamızı ister misin?
                  </Text>
                  <Pressable style={styles.goldButton} onPress={openConfigModal}>
                    <Text style={styles.goldButtonText}>Program Oluştur</Text>
                  </Pressable>
                </View>
              )}

              {!loadingProgram && program && (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 20, marginTop: 5 }}
                  >
                    {DAYS.map((day) => {
                      const isActive = selectedDay === day;
                      return (
                        <Pressable
                          key={day}
                          onPress={() => setSelectedDay(day)}
                          style={[styles.dayPill, isActive && styles.dayPillActive]}
                        >
                          <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
                            {day}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </ScrollView>

                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{selectedDay}</Text>
                    <View style={styles.sectionLine} />
                  </View>

                  {(program[selectedDay] || []).length === 0 ? (
                    <Text style={styles.noExerciseText}>Bu gün dinlenme günü veya egzersiz yok.</Text>
                  ) : (
                    (program[selectedDay] || []).map((ex, index) => {
                      const key = `${selectedDay}-${index}`;
                      const expanded = expandedExercises[key];

                      return (
                        <Pressable
                          key={key}
                          style={styles.programCard}
                          onPress={() => toggleExpand(selectedDay, index)}
                        >
                          <LinearGradient
                            colors={["#252525", "#181818"]}
                            style={styles.programCardGradient}
                          >
                            <View style={styles.programHeader}>
                              <Text style={styles.programExerciseName}>{ex.name}</Text>
                              <Ionicons
                                name={expanded ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#D6B982"
                              />
                            </View>

                            {expanded && (
                              <View style={styles.programDetails}>
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Kas Grubu:</Text>
                                  <Text style={styles.detailValue}>{ex.muscle_group || "-"}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Set / Tekrar:</Text>
                                  <Text style={styles.detailValue}>
                                    {ex.sets ? `${ex.sets} Set` : "-"} / {ex.reps ? `${ex.reps} Tekrar` : "-"}
                                  </Text>
                                </View>
                                {ex.rest_time && (
                                  <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Dinlenme:</Text>
                                    <Text style={styles.detailValue}>{ex.rest_time} sn</Text>
                                  </View>
                                )}
                                {ex.notes && (
                                  <View style={styles.noteBox}>
                                    <Text style={styles.noteText}>📝 {ex.notes}</Text>
                                  </View>
                                )}
                                <Pressable 
                                    style={styles.programDetailBtn}
                                    onPress={() => {
                                        navigation.navigate("ExercisesDetailPage", {
                                            exercise: ex,
                                        });
                                    }}
                                >
                                    <Text style={styles.programDetailBtnText}>Hareket Detayı</Text>
                                    <Ionicons name="arrow-forward" size={12} color="#D6B982" />
                                </Pressable>
                              </View>
                            )}
                          </LinearGradient>
                        </Pressable>
                      );
                    })
                  )}

                  <Pressable
                    style={[styles.outlineButton, { marginTop: 30, marginBottom: 50 }]}
                    onPress={openConfigModal}
                  >
                    <Text style={styles.outlineButtonText}>Program Ayarlarını Değiştir</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}

        </ScrollView>
      </View>

      {/* 🎬 SUPER PREMIUM VIDEO PREVIEW MODAL */}
      <Modal visible={videoModal} animationType="fade" transparent>
        <BlurView intensity={40} tint="dark" style={styles.modalBackground}>
          {/* Modal Container */}
          <View style={styles.modalCardPremium}>
            {/* Altın Çerçeve Efekti İçin Gradient Border */}
            <LinearGradient
              colors={["rgba(214, 185, 130, 0.6)", "rgba(214, 185, 130, 0.1)"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.modalBorderGradient}
            >
              <View style={styles.modalContentInner}>
                
                {/* Header: Title + Close */}
                <View style={styles.modalHeaderPremium}>
                  <View style={{flex: 1}}>
                      <Text style={styles.modalTitlePremium} numberOfLines={1}>{selectedExerciseData?.name}</Text>
                      <Text style={styles.modalSubtitlePremium}>Hızlı Önizleme</Text>
                  </View>
                  <Pressable 
                    style={styles.closeButtonPremium}
                    onPress={() => setVideoModal(false)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </Pressable>
                </View>

                {/* Video / GIF Area */}
                <View style={styles.videoContainerPremium}>
                  {selectedExerciseData?.gif ? (
                    <Image source={selectedExerciseData.gif} style={styles.videoImagePremium} />
                  ) : (
                    <View style={styles.noImageContainer}>
                        <Ionicons name="barbell-outline" size={40} color="#555"/>
                        <Text style={{ color: "#666", marginTop:10, fontSize:12 }}>Görsel Yok</Text>
                    </View>
                  )}
                  {/* Overlay Gradient for depth */}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)"]}
                    style={styles.videoOverlay}
                  />
                  <View style={styles.videoTag}>
                      <Text style={styles.videoTagText}>{selectedExerciseData?.muscle_group || "Egzersiz"}</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.descriptionPremium} numberOfLines={3}>
                    {selectedExerciseData?.desc}
                </Text>

                {/* Action Button */}
                <Pressable
                  style={styles.goldButtonPremium}
                  onPress={() => {
                    setVideoModal(false);
                    navigation.navigate("ExercisesDetailPage", {
                      exercise: selectedExerciseData,
                    });
                  }}
                >
                  <LinearGradient
                    colors={["#D6B982", "#b39666"]}
                    style={styles.goldButtonGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.goldButtonTextPremium}>TAMAMINI İNCELE</Text>
                    <View style={styles.btnIconCircle}>
                        <Ionicons name="arrow-forward" size={16} color="#D6B982" />
                    </View>
                  </LinearGradient>
                </Pressable>

              </View>
            </LinearGradient>
          </View>
        </BlurView>
      </Modal>

      {/* ⚙️ CONFIG MODAL (AYNI STİL KORUNDU) */}
      <Modal visible={configModalVisible} transparent animationType="slide">
        <BlurView intensity={30} tint="dark" style={styles.modalBackground}>
          <View style={styles.configModalCard}>
            <View style={styles.configHeader}>
              <Text style={styles.modalTitle}>
                {program ? "Programı Güncelle" : "Yeni Program"}
              </Text>
            </View>

            <Text style={styles.configLabel}>Seviye Seçimi</Text>
            {LEVEL_OPTIONS.map((opt) => {
              const isSelected = selectedLevel === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setSelectedLevel(opt.key)}
                >
                  <View>
                    <Text style={[styles.optionTitle, isSelected && styles.goldText]}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={24} color="#D6B982" />}
                </Pressable>
              )
            })}

            <Text style={[styles.configLabel, { marginTop: 20 }]}>Haftalık Gün Sayısı</Text>
            <View style={styles.daysRow}>
              {DAYS_PER_WEEK_OPTIONS.map((d) => (
                <Pressable
                  key={d}
                  style={[
                    styles.daySelectPill,
                    selectedDaysPerWeek === d && styles.daySelectPillActive,
                  ]}
                  onPress={() => setSelectedDaysPerWeek(d)}
                >
                  <Text
                    style={[
                      styles.daySelectText,
                      selectedDaysPerWeek === d && styles.daySelectTextActive,
                    ]}
                  >
                    {d} Gün
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtonsRow}>
              <Pressable
                style={[styles.cancelButton, { flex: 1, marginRight: 10 }]}
                onPress={() => setConfigModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </Pressable>
              <Pressable
                style={[styles.goldButton, { flex: 1, marginTop: 0 }]}
                onPress={handleSubmitProgramConfig}
              >
                <Text style={styles.goldButtonText}>Onayla</Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </Modal>

    </Layout>
  );
};

export default ExercisesPage;

// 🎨 LUXURY STYLES
const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 100, alignItems: "center" },

  // TAB BUTTONS
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#111",
    borderRadius: 30,
    padding: 4,
    width: "90%",
    borderWidth: 1,
    borderColor: "#333"
  },
  tabWrapper: { flex: 1 },
  activeTabGradient: {
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTab: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: { color: "#888", fontWeight: "600", fontSize: 13, letterSpacing: 1 },
  activeTabText: { color: "#1a1a1a", fontWeight: "800" },

  // MUSCLE CARDS
  cardContainer: {
    marginBottom: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(214, 185, 130, 0.15)",
  },
  cardImage: { width: 70, height: 70, resizeMode: 'contain' },
  cardContent: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  cardSubtitle: { fontSize: 12, color: "#888", marginTop: 4 },

  // DETAIL & HEADER
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 20
  },
  backButtonIcon: {
    padding: 8,
    backgroundColor: 'rgba(214, 185, 130, 0.1)',
    borderRadius: 12
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: "#D6B982", letterSpacing: 1 },

  // EXERCISE ITEM
  exerciseCard: {
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#222"
  },
  exerciseName: { color: "#fff", fontSize: 16, fontWeight: '600', marginBottom: 4 },
  playButton: {
    backgroundColor: "#D6B982",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionSmall: { color: "#666", fontSize: 12 },

  // ---- YENİ PREMIUM MODAL STİLLERİ ----
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)"
  },
  modalCardPremium: {
    width: "90%",
    borderRadius: 24,
    shadowColor: "#D6B982",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  modalBorderGradient: {
      padding: 1.5, // Border kalınlığı
      borderRadius: 24,
  },
  modalContentInner: {
      backgroundColor: "#181818",
      borderRadius: 23, // Border'dan biraz az
      padding: 20,
      overflow: 'hidden'
  },
  modalHeaderPremium: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 15
  },
  modalTitlePremium: { fontSize: 22, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  modalSubtitlePremium: { color: "#D6B982", fontSize: 12, fontWeight: "600", textTransform: 'uppercase', marginTop: 2 },
  closeButtonPremium: {
      backgroundColor: "rgba(255,255,255,0.1)",
      padding: 5,
      borderRadius: 20,
  },
  videoContainerPremium: {
      height: 200,
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
      backgroundColor: "#000",
      position: 'relative'
  },
  videoImagePremium: { width: "100%", height: "100%", resizeMode: "cover" },
  noImageContainer: { flex: 1, alignItems:'center', justifyContent:'center' },
  videoOverlay: { position: 'absolute', bottom:0, left:0, right:0, height: 60 },
  videoTag: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)"
  },
  videoTagText: { color: "#D6B982", fontSize: 10, fontWeight: "bold" },
  
  descriptionPremium: { color: "#bbb", fontSize: 14, lineHeight: 22, marginBottom: 25 },
  
  goldButtonPremium: {
      borderRadius: 16,
      shadowColor: "#D6B982",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
  },
  goldButtonGradient: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
  },
  goldButtonTextPremium: { color: "#000", fontWeight: "800", fontSize: 14, letterSpacing: 1, marginRight: 10 },
  btnIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#000", alignItems: 'center', justifyContent: 'center' },

  // ---- ESKİ STİLLER (Program ve Config için gerekli) ----
  goldButton: {
    backgroundColor: "#D6B982",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  goldButtonText: { color: "#000", fontWeight: "700", fontSize: 15 },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  outlineButtonText: { color: "#888", fontWeight: "600" },

  dayPill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#333"
  },
  dayPillActive: { backgroundColor: "#D6B982", borderColor: "#D6B982" },
  dayText: { color: "#666", fontWeight: "600" },
  dayTextActive: { color: "#000", fontWeight: "bold" },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginRight: 15 },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#333" },

  programCard: { marginVertical: 6, borderRadius: 16, overflow: 'hidden' },
  programCardGradient: { padding: 15 },
  programHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  programExerciseName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  programDetails: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  detailLabel: { color: "#666", fontSize: 13 },
  detailValue: { color: "#D6B982", fontSize: 13, fontWeight: '600' },
  noteBox: { backgroundColor: "rgba(214, 185, 130, 0.1)", padding: 10, borderRadius: 8, marginTop: 5 },
  noteText: { color: "#D6B982", fontSize: 12 },
  
  programDetailBtn: { flexDirection:'row', alignItems:'center', marginTop: 10, alignSelf:'flex-end' },
  programDetailBtnText: { color: "#D6B982", fontSize: 12, marginRight: 5, fontWeight:'600'},

  emptyContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#333",
    borderStyle: 'dashed',
    marginTop: 20
  },
  programEmptyText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 10 },
  programEmptySubText: { color: "#666", textAlign: 'center', marginVertical: 10, fontSize: 13, lineHeight: 20 },

  configModalCard: { width: "90%", backgroundColor: "#1e1e1e", borderRadius: 24, padding: 25 },
  configHeader: { marginBottom: 20, alignItems: 'center' },
  configLabel: { color: "#888", fontSize: 12, fontWeight: "700", textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: "#121212",
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a"
  },
  optionRowSelected: { borderColor: "#D6B982", backgroundColor: "rgba(214, 185, 130, 0.05)" },
  optionTitle: { color: "#ccc", fontSize: 15, fontWeight: "600" },
  goldText: { color: "#D6B982" },
  optionDesc: { color: "#555", fontSize: 11, marginTop: 2 },
  modalTitle: { fontSize: 18, color: "#fff", fontWeight: "700", width: '100%', textAlign:'center' },

  daysRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  daySelectPill: { flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: "#121212", borderRadius: 10, marginHorizontal: 3, borderWidth: 1, borderColor: "#333" },
  daySelectPillActive: { backgroundColor: "#D6B982", borderColor: "#D6B982" },
  daySelectText: { color: "#666", fontSize: 12, fontWeight: "600" },
  daySelectTextActive: { color: "#000", fontWeight: "700" },

  modalButtonsRow: { flexDirection: 'row', marginTop: 10 },
  cancelButton: { backgroundColor: "#222", borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelButtonText: { color: "#fff", fontWeight: "600" },
  noExerciseText: { color: "#555", textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  errorText: { color: "#ff5555", textAlign: "center", marginVertical: 10 },
});