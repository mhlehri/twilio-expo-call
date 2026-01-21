import { useCall } from "@/src/context/CallContext";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { BackHandler } from "react-native";
import CallScreen from "./CallScreen";

export default function OutgoingCallScreen() {
  const { callState, endCall } = useCall();
  const navigation = useNavigation();

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // End call when back button is pressed
        endCall();
        return true;
      },
    );

    return () => backHandler.remove();
  }, [endCall]);

  // Navigate back when call ends
  useEffect(() => {
    if (callState.callStatus === "idle") {
      navigation.goBack();
    }
  }, [callState.callStatus, navigation]);

  return <CallScreen />;
}
