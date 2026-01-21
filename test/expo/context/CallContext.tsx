import CallKeepService from '@/src/services/CallKeepService';
import TwilioVoiceService from '@/src/services/TwilioVoiceService';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export type CallType = 'video' | 'voice';
export type CallStatus =
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'connected'
  | 'ended'
  | 'failed';

export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  phoneNumber?: string;
}

export interface CallState {
  callId: string | null;
  callType: CallType | null;
  callStatus: CallStatus;
  isIncoming: boolean;
  participant: CallParticipant | null;
  callStartTime: Date | null;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isVideoEnabled: boolean;
  callKeepUUID: string | null; // Native call UUID
  error?: string | null;
}

export interface CallHistoryRecord {
  id: string;
  participant: CallParticipant;
  callType: CallType;
  isIncoming: boolean;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  hasRecording: boolean;
  recordingUrl?: string;
}

interface CallContextValue {
  callState: CallState;
  startCall: (participant: CallParticipant, callType: CallType) => void;
  answerCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  toggleVideo: () => void;
  simulateIncomingCall: (
    participant: CallParticipant,
    callType: CallType
  ) => void;
  onCallEnded?: (record: CallHistoryRecord) => void;
  setOnCallEnded: (callback: (record: CallHistoryRecord) => void) => void;
  initializeVoice: (token: string) => Promise<void>;
  debugCallInfo: () => void; // Debug function to check audio state
  resetCallState: () => void;
  fetchVoiceToken: () => Promise<string | null>;
}

const CallContext = createContext<CallContextValue | undefined>(undefined);

const initialCallState: CallState = {
  callId: null,
  callType: null,
  callStatus: 'idle',
  isIncoming: false,
  participant: null,
  callStartTime: null,
  isMuted: false,
  isSpeakerOn: false,
  isVideoEnabled: false,
  callKeepUUID: null,
  error: null,
};

export function CallProvider({ children }: { children: ReactNode }) {
  const [callState, setCallState] = useState<CallState>(initialCallState);
  const [onCallEndedCallback, setOnCallEndedCallback] = useState<
    ((record: CallHistoryRecord) => void) | undefined
  >();

  const auth = useSelector((state: RootState) => state.auth);

  const callKeepService = CallKeepService;
  const twilioService = TwilioVoiceService.getInstance();

  const initializeVoice = useCallback(
    async (token: string) => {
      // console.log({
      //   "token from callContext : ": token,
      // });
      await twilioService.initialize(
        token,
        '+14702560094',
        4,
        process.env.EXPO_PUBLIC_BASE_URL
      );
    },
    [twilioService]
  );

  console.log({ registered: twilioService.isRegistered });

  const handleCallDisconnected = useCallback(() => {
    const endTime = new Date();
    const currentState = callState;

    // Create call history record if call was connected
    if (
      currentState.callStatus === 'connected' &&
      currentState.participant &&
      currentState.callStartTime
    ) {
      const duration = Math.floor(
        (endTime.getTime() - currentState.callStartTime.getTime()) / 1000
      );

      const record: CallHistoryRecord = {
        id: currentState.callId || `call-${Date.now()}`,
        participant: currentState.participant,
        callType: currentState.callType || 'voice',
        isIncoming: currentState.isIncoming,
        startTime: currentState.callStartTime,
        endTime: endTime,
        duration: duration,
        hasRecording: false,
      };

      // Notify listener about call end
      if (onCallEndedCallback) {
        onCallEndedCallback(record);
      }
    }

    setCallState(initialCallState);
  }, [callState, onCallEndedCallback]);

  const setOnCallEnded = useCallback(
    (callback: (record: CallHistoryRecord) => void) => {
      setOnCallEndedCallback(() => callback);
    },
    []
  );

  const resetCallState = useCallback(() => {
    setCallState(initialCallState);
  }, []);

  const fetchVoiceToken = useCallback(async () => {
    try {
      console.log('[CallContext] Fetching new voice token...');
      // TODO: Get real phone number from user profile or config
      const identity = '+14702560094';
      const companyId = auth.companyId || 4; // Fallback to 4 or from auth
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      const response = await fetch(
        'https://dev.autoworx.tech/api/twilio/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ identity, companyId, platform }),
        }
      );

      const data = await response.json();
      if (data.token) {
        console.log('[CallContext] New token fetched successfully');
        return data.token;
      } else {
        console.error('[CallContext] Failed to get Twilio token', data);
        return null;
      }
    } catch (error) {
      console.error('[CallContext] Error fetching voice token:', error);
      return null;
    }
  }, [auth.companyId]);

  const startCall = useCallback(
    async (participant: CallParticipant, callType: CallType) => {
      try {
        if (!participant.phoneNumber) return;

        // 0. Fetch fresh token before starting call
        const newToken = await fetchVoiceToken();
        if (newToken) {
          await twilioService.updateToken(newToken);
        } else {
          console.warn(
            '[CallContext] Could not fetch fresh token, proceeding with existing session if any'
          );
        }

        // 1. Generate the UUID first
        const callKeepUUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
          /[xy]/g,
          (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
          }
        );

        console.log('starting call by callkeep');
        // 2. IMPORTANT: Register with CallKit IMMEDIATELY.
        // This "holds" the audio session for your app.
        callKeepService.startCall(
          participant.phoneNumber,
          participant.name,
          callKeepUUID
        );

        console.log(
          '[CallContext] Starting call with CallKeep UUID:',
          callKeepUUID
        );

        console.log('starting call by twilio');
        // 3. NOW connect to Twilio
        const { call } = await twilioService.makeCall(
          participant.phoneNumber,
          participant.name
        );
        console.log({ call });

        // 4. Update state
        setCallState({
          callId: callKeepUUID,
          callType,
          callStatus: 'calling',
          isIncoming: false,
          participant,
          callStartTime: null,
          isMuted: false,
          isSpeakerOn: false,
          isVideoEnabled: false,
          callKeepUUID: callKeepUUID,
        });

        // 5. Tell CallKit the call is officially "connected"
        // (Do this once Twilio confirms the connection)
        RNCallKeep.reportConnectedOutgoingCallWithUUID(callKeepUUID);
      } catch (error: any) {
        console.error('[CallContext] Failed to start call:', error);
        // If it fails, make sure to clear the UI
        RNCallKeep.endAllCalls();
        setCallState((prev) => ({
          ...prev,
          callStatus: 'failed',
          error: error?.message || 'Connection failed',
        }));
      }
    },
    [twilioService, callKeepService]
  );
  const answerCall = useCallback(async () => {
    try {
      console.log('[CallContext] Answering call');

      const accepted = await twilioService.acceptCall();

      console.log({ accepted });

      if (callState.callKeepUUID) {
        callKeepService.answerIncomingCall(callState.callKeepUUID);
      }

      setCallState((prev) => ({
        ...prev,
        callStatus: 'connected',
        callStartTime: new Date(),
      }));
    } catch (error) {
      console.error('[CallContext] Failed to answer call:', error);
    }
  }, [callKeepService, callState.callKeepUUID, twilioService]);

  const endCall = useCallback(async () => {
    try {
      console.log('[CallContext] Ending call');

      if (callState.isIncoming && callState.callStatus === 'ringing') {
        await twilioService.rejectCall();
      } else {
        await twilioService.disconnectCall();
      }

      if (callState.callKeepUUID) {
        callKeepService.endCall(callState.callKeepUUID);
      }

      handleCallDisconnected();
    } catch (error) {
      console.error('[CallContext] Failed to end call:', error);
      handleCallDisconnected();
    }
  }, [
    callKeepService,
    callState.callKeepUUID,
    callState.callStatus,
    callState.isIncoming,
    handleCallDisconnected,
    twilioService,
  ]);

  const toggleMute = useCallback(async () => {
    try {
      const isMuted = await twilioService.toggleMute();

      if (callState.callKeepUUID) {
        callKeepService.setMutedCall(callState.callKeepUUID, isMuted);
      }

      setCallState((prev) => ({
        ...prev,
        isMuted: isMuted,
      }));
    } catch (error) {
      console.error('[CallContext] Failed to toggle mute:', error);
    }
  }, [callKeepService, callState.callKeepUUID, twilioService]);

  const toggleSpeaker = useCallback(async () => {
    // 1. Toggle local state logic
    const newSpeakerState = !callState.isSpeakerOn;

    // 2. Instruct Twilio Service to switch device
    await twilioService.setSpeaker(newSpeakerState);

    // 3. Update UI state
    setCallState((prev) => ({
      ...prev,
      isSpeakerOn: newSpeakerState,
    }));
  }, [callState.isSpeakerOn, twilioService]);

  const toggleVideo = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isVideoEnabled: !prev.isVideoEnabled,
    }));
  }, []);

  const simulateIncomingCall = useCallback(
    (participant: CallParticipant, callType: CallType) => {
      // This is for testing, but we can use it to trigger a fake call
      const callId = `call-${Date.now()}`;
      const uuid = callId; // Simple UUID for simulation

      callKeepService.displayIncomingCall(
        participant.phoneNumber || participant.id,
        uuid
      );

      setCallState({
        callId,
        callType,
        callStatus: 'ringing',
        isIncoming: true,
        participant,
        callStartTime: null,
        isMuted: false,
        isSpeakerOn: false,
        isVideoEnabled: callType === 'video',
        callKeepUUID: uuid,
      });
    },
    [callKeepService]
  );

  // Debug function to check if voice/audio is working
  const debugCallInfo = useCallback(() => {
    console.log('========== CALL DEBUG INFO ==========');
    console.log(
      '[Debug] Current Call State:',
      JSON.stringify(callState, null, 2)
    );

    const twilioDebug = twilioService.getCallDebugInfo();
    console.log(
      '[Debug] Twilio Call Info:',
      JSON.stringify(twilioDebug, null, 2)
    );

    if (twilioDebug.hasActiveCall) {
      console.log('[Debug] ✅ Active call exists');
      console.log(
        '[Debug] Muted:',
        twilioDebug.isMuted
          ? '🔇 YES - VOICE NOT TRANSMITTING!'
          : '🔊 NO - Voice should be transmitting'
      );
      console.log('[Debug] Call SID:', twilioDebug.callSid);
      console.log('[Debug] Call State:', twilioDebug.callState);
    } else {
      console.log('[Debug] ❌ No active Twilio call');
    }

    console.log('[Debug] CallKeep UUID:', callState.callKeepUUID);
    console.log('[Debug] Call Status:', callState.callStatus);
    console.log('[Debug] Is Muted (state):', callState.isMuted);
    console.log('=====================================');

    return twilioDebug;
  }, [callState, twilioService]);

  const getUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  };

  // Setup Twilio Listeners
  useEffect(() => {
    twilioService.setListeners({
      onCallStatusChanged: (status, call) => {
        console.log('[CallContext] Twilio status changed:', status);

        // Auto debug when connected
        if (status === 'connected') {
          console.log('========== CALL CONNECTED - AUTO DEBUG ==========');
          const debugInfo = twilioService.getCallDebugInfo();
          console.log('[Auto Debug] Call connected! Checking audio state...');
          console.log(
            '[Auto Debug] Is Muted:',
            debugInfo.isMuted ? '🔇 YES' : '🔊 NO'
          );
          console.log('[Auto Debug] Call SID:', debugInfo.callSid);
          if (debugInfo.isMuted) {
            console.warn(
              '[Auto Debug] ⚠️ WARNING: Call is MUTED! Other party cannot hear you!'
            );
          } else {
            console.log(
              '[Auto Debug] ✅ Audio should be transmitting to other party'
            );
          }
          console.log('================================================');
        }

        let newStatus: CallStatus = 'idle';
        switch (status) {
          case 'connecting':
            newStatus = 'calling';
            break;
          case 'ringing':
            newStatus = 'ringing';
            break;
          case 'connected':
            newStatus = 'connected';
            break;
          case 'reconnecting':
            newStatus = 'connected';
            break;
          case 'disconnected':
            newStatus = 'ended';
            break;
        }

        setCallState((prev) => {
          if (status === 'disconnected') {
            if (prev.callKeepUUID) {
              callKeepService.endCall(prev.callKeepUUID);
            }

            // If we are already in failed state, don't reset!
            // This allows the UI to show the error message.
            if (prev.callStatus === 'failed') {
              return prev;
            }

            return initialCallState;
          }

          return {
            ...prev,
            callStatus: newStatus,
            callStartTime:
              status === 'connected' && !prev.callStartTime
                ? new Date()
                : prev.callStartTime,
          };
        });
      },
      onCallInviteReceived: async (callInvite) => {
        const from = callInvite.getFrom();
        const callSid = callInvite.getCallSid(); // Keep this for logging/reference if needed

        // FIX: Generate a proper UUID for CallKeep
        const incomingCallUUID = getUuid();

        console.log('[CallContext] Incoming call from:', from);
        console.log('[CallContext] - Twilio SID:', callSid);
        console.log('[CallContext] - Generated UUID:', incomingCallUUID);

        // Pass the VALID UUID to CallKeep
        RNCallKeep.displayIncomingCall(incomingCallUUID, from);

        setCallState({
          callId: callSid, // You can keep the SID as the internal callId if you prefer
          callType: 'voice',
          callStatus: 'ringing',
          isIncoming: true,
          participant: { id: from, name: from, phoneNumber: from },
          callStartTime: null,
          isMuted: false,
          isSpeakerOn: false,
          isVideoEnabled: false,
          callKeepUUID: incomingCallUUID, // Store the UUID so we can end/answer it later
        });
      },
      onCallInviteCancelled: (callInvite) => {
        const uuid = callInvite.getCallSid();
        console.log('[CallContext] Call invite cancelled');
        callKeepService.endCall(uuid);
        setCallState(initialCallState);
      },
      onError: (error: any) => {
        console.error('[CallContext] Twilio Error:', error);
        setCallState((prev) => ({
          ...prev,
          callStatus: 'failed',
          error: error?.message || 'An error occurred',
        }));
      },
    });
  }, [callKeepService, twilioService]);

  // Setup CallKeep event listeners
  useEffect(() => {
    const handleAnswerCallEvent = ({ callUUID }: { callUUID: string }) => {
      console.log('Native UI: Answer call', callUUID);
      answerCall();
    };

    // const handleEndCallEvent = ({ callUUID }: { callUUID: string }) => {
    //   console.log("Native UI: End call", callUUID);
    //   endCall();
    // };

    const handleSetMutedEvent = ({
      muted,
      callUUID,
    }: {
      muted: boolean;
      callUUID: string;
    }) => {
      console.log('Native UI: Set muted', muted, callUUID);
      toggleMute();
    };

    RNCallKeep.addEventListener('answerCall', handleAnswerCallEvent);
    // RNCallKeep.addEventListener("endCall", handleEndCallEvent);
    RNCallKeep.addEventListener(
      'didPerformSetMutedCallAction',
      handleSetMutedEvent
    );

    return () => {
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
      RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
    };
  }, [answerCall, endCall, toggleMute]);

  const value: CallContextValue = {
    callState,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    simulateIncomingCall,
    onCallEnded: onCallEndedCallback,
    setOnCallEnded,
    initializeVoice,
    debugCallInfo,
    resetCallState,
    fetchVoiceToken,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}
