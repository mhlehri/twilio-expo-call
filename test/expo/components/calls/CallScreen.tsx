import { useCall } from "@/src/context/CallContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Animated,
  BackHandler,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface CallScreenProps {
  // isIncoming?: boolean; // Removed prop, using context instead
}

export default function CallScreen(_props: CallScreenProps) {
  const {
    callState,
    endCall,
    startCall,
    resetCallState,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    answerCall,
  } = useCall();
  const navigation = useNavigation();
  const [callDuration, setCallDuration] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  const isIncoming = callState.isIncoming;

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // End call when back button is pressed
        if (
          callState.callStatus !== "idle" &&
          callState.callStatus !== "failed"
        ) {
          endCall();
        } else if (callState.callStatus === "failed") {
          resetCallState();
        }
        return true;
      },
    );

    return () => backHandler.remove();
  }, [endCall, callState.callStatus, resetCallState]);

  // Navigate back when call ends
  useEffect(() => {
    if (callState.callStatus === "idle") {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [callState.callStatus, navigation]);

  // Call duration timer
  useEffect(() => {
    if (callState.callStatus === "connected" && callState.callStartTime) {
      const interval = setInterval(() => {
        const duration = Math.floor(
          (new Date().getTime() - callState.callStartTime!.getTime()) / 1000,
        );
        setCallDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callState.callStatus, callState.callStartTime]);

  // Pulse animation for calling/ringing state
  useEffect(() => {
    if (
      callState.callStatus === "calling" ||
      callState.callStatus === "ringing"
    ) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callState.callStatus, pulseAnim]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    if (callState.callStatus === "failed" || callState.error) {
      return callState.error || "Connection Failed";
    }
    if (isIncoming && callState.callStatus === "ringing") {
      return `Incoming ${callState.callType === "video" ? "Video" : "Voice"} Call`;
    }
    switch (callState.callStatus) {
      case "calling":
        return "Calling...";
      case "ringing":
        return "Ringing...";
      case "connected":
        return formatDuration(callDuration);
      default:
        return "";
    }
  };

  const handleCallAgain = () => {
    if (callState.participant) {
      // We use a small timeout to allow UI to reset or just call directly
      // But startCall usually works.
      // Optimally, we might want to reset locally or just trigger startCall.
      startCall(callState.participant, callState.callType || "voice");
    }
  };

  const handleCancel = () => {
    resetCallState();
  };

  if (!callState.participant) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.content}>
        {/* Top Spacer */}
        <View style={styles.headerSpacer} />

        {/* Participant Info */}
        <View style={styles.participantContainer}>
          <Animated.View
            style={[
              styles.avatarContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            {callState.participant.avatar ? (
              <Image
                source={{ uri: callState.participant.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {callState.participant.name?.charAt(0) || "U"}
                </Text>
              </View>
            )}
            {/* Show error indicator on avatar if failed */}
            {callState.callStatus === "failed" && (
              <View style={styles.errorBadge}>
                <Ionicons name="alert" size={30} color="#fff" />
              </View>
            )}
          </Animated.View>

          <Text style={styles.participantName}>
            {callState.participant.name}
          </Text>
          {callState.participant.phoneNumber && (
            <Text style={styles.phoneNumber}>
              {callState.participant.phoneNumber}
            </Text>
          )}
          <Text
            style={[
              styles.statusText,
              callState.callStatus === "failed" && styles.errorText,
            ]}
          >
            {getStatusText()}
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Main Controls (Mute, Speaker, Video) - Show during active call (calling/ringing/connected) but not failed or incoming ringing */}
          {(callState.callStatus === "connected" ||
            callState.callStatus === "calling" ||
            (callState.callStatus === "ringing" && !isIncoming)) && (
            <View style={styles.controlRow}>
              {/* Mute Button */}
              <View style={styles.controlItem}>
                <Pressable
                  style={[
                    styles.toggleButton,
                    callState.isMuted && styles.toggleButtonActive,
                  ]}
                  onPress={toggleMute}
                >
                  <Ionicons
                    name={callState.isMuted ? "mic-off" : "mic"}
                    size={24}
                    color={callState.isMuted ? "#000" : "#fff"}
                  />
                </Pressable>
                <Text style={styles.toggleLabel}>Mute</Text>
              </View>

              {/* Speaker Button */}
              <View style={styles.controlItem}>
                <Pressable
                  style={[
                    styles.toggleButton,
                    callState.isSpeakerOn && styles.toggleButtonActive,
                  ]}
                  onPress={toggleSpeaker}
                >
                  <Ionicons
                    name={
                      callState.isSpeakerOn ? "volume-high" : "volume-medium"
                    }
                    size={24}
                    color={callState.isSpeakerOn ? "#000" : "#fff"}
                  />
                </Pressable>
                <Text style={styles.toggleLabel}>Speaker</Text>
              </View>

              {/* Video Toggle Button (only for video calls) */}
              {callState.callType === "video" && (
                <View style={styles.controlItem}>
                  <Pressable
                    style={[
                      styles.toggleButton,
                      !callState.isVideoEnabled && styles.toggleButtonActive,
                    ]}
                    onPress={toggleVideo}
                  >
                    <Ionicons
                      name={
                        callState.isVideoEnabled ? "videocam" : "videocam-off"
                      }
                      size={24}
                      color={!callState.isVideoEnabled ? "#000" : "#fff"}
                    />
                  </Pressable>
                  <Text style={styles.toggleLabel}>Video</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {/* Incoming Call: Answer & Reject */}
            {isIncoming && callState.callStatus === "ringing" && (
              <>
                <View style={styles.actionItem}>
                  <Pressable
                    onPress={answerCall}
                    style={[styles.actionButton, styles.acceptButton]}
                  >
                    <Ionicons name="call" size={32} color="#fff" />
                  </Pressable>
                  <Text style={styles.actionButtonText}>Accept</Text>
                </View>

                <View style={styles.actionItem}>
                  <Pressable
                    onPress={endCall}
                    style={[styles.actionButton, styles.rejectButton]}
                  >
                    <Ionicons
                      name="call"
                      size={32}
                      color="#fff"
                      style={{ transform: [{ rotate: "135deg" }] }}
                    />
                  </Pressable>
                  <Text style={styles.actionButtonText}>Decline</Text>
                </View>
              </>
            )}

            {/* Outgoing Call or Connected: End Call */}
            {(callState.callStatus === "calling" ||
              callState.callStatus === "connected" ||
              (callState.callStatus === "ringing" && !isIncoming)) && (
              <View style={styles.actionItem}>
                <Pressable
                  onPress={endCall}
                  style={[styles.actionButton, styles.rejectButton]}
                >
                  <Ionicons
                    name="call"
                    size={32}
                    color="#fff"
                    style={{ transform: [{ rotate: "135deg" }] }}
                  />
                </Pressable>
                <Text style={styles.actionButtonText}>End</Text>
              </View>
            )}

            {/* Failed / Error State: Call Again & Cancel */}
            {callState.callStatus === "failed" && (
              <>
                <View style={styles.actionItem}>
                  <Pressable
                    onPress={handleCallAgain}
                    style={[styles.actionButton, styles.acceptButton]}
                  >
                    <Ionicons name="refresh" size={32} color="#fff" />
                  </Pressable>
                  <Text style={styles.actionButtonText}>Call Again</Text>
                </View>

                <View style={styles.actionItem}>
                  <Pressable
                    onPress={handleCancel}
                    style={[
                      styles.actionButton,
                      styles.rejectButton,
                      { backgroundColor: "#3A3A3C" },
                    ]}
                  >
                    <Ionicons name="close" size={32} color="#fff" />
                  </Pressable>
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E", // Modern dark gray
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerSpacer: {
    height: 60,
  },
  participantContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    // Move up slightly to account for bottom controls
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2C2C2E",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 48,
    color: "#8E8E93",
    fontWeight: "500",
  },
  errorBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF453A",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1C1C1E",
  },
  participantName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  phoneNumber: {
    fontSize: 17,
    color: "#8E8E93",
    marginBottom: 16,
  },
  statusText: {
    fontSize: 15,
    color: "#8E8E93",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#FF453A",
    fontWeight: "600",
  },
  bottomControls: {
    paddingBottom: 50,
    paddingHorizontal: 30,
    width: "100%",
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
    gap: 30,
  },
  controlItem: {
    alignItems: "center",
    gap: 8,
  },
  toggleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#fff",
  },
  toggleLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  actionItem: {
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  acceptButton: {
    backgroundColor: "#30D158",
  },
  rejectButton: {
    backgroundColor: "#FF453A",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});
