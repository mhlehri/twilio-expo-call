package com.twiliovoicereactnative

import android.util.Log

import com.facebook.react.bridge.ReactApplicationContext
import com.twilio.voice.AudioCodec
import com.twilio.voice.OpusCodec
import com.twilio.voice.PcmuCodec
import com.twilio.voice.PreflightOptions
import com.twilio.voice.IceOptions
import com.twilio.voice.IceServer
import com.twilio.voice.IceTransportPolicy

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

import java.util.ArrayList
import java.util.HashSet


class ExpoModule : Module() {
  private class PromiseAdapter(private val promise: Promise) : ModuleProxy.UniversalPromise {
    override fun resolve(value: Any?) {
      promise.resolve(
        ReactNativeArgumentsSerializer.serializePromiseResolution(value)
      )
    }

    override fun rejectWithCode(code: Int, message: String) {
      promise.resolve(
        ReactNativeArgumentsSerializer.serializePromiseErrorWithCode(code, message)
      )
    }

    override fun rejectWithName(name: String, message: String) {
      promise.resolve(
        ReactNativeArgumentsSerializer.serializePromiseErrorWithName(name, message)
      )
    }
  }

  private val NAME: String = "TwilioVoiceExpoModule"

  private lateinit var moduleProxy: ModuleProxy

  override fun definition() = ModuleDefinition {
    Name(NAME)

    OnCreate {
      Log.d(NAME, String.format("context %s", this@ExpoModule.appContext.reactContext))

      val reactApplicationContext = this@ExpoModule.appContext.reactContext as ReactApplicationContext?
      if (reactApplicationContext != null) {
        this@ExpoModule.moduleProxy = ModuleProxy(reactApplicationContext)
      }
    }

    /**
     * Call API
     */

    AsyncFunction("call_disconnect") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.disconnect(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_getState") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.getState(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_getStats") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.getStats(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_hold") {
      uuid: String,
      hold: Boolean,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.hold(uuid, hold, PromiseAdapter(promise))
    }

    AsyncFunction("call_isMuted") {
        uuid: String,
        promise: Promise ->

      this@ExpoModule.moduleProxy.call.isMuted(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_isOnHold") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.isOnHold(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_mute") {
      uuid: String,
      mute: Boolean,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.mute(uuid, mute, PromiseAdapter(promise))
    }

    AsyncFunction("call_postFeedback") {
      uuid: String,
      score: String,
      issue: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.postFeedback(uuid, score, issue, PromiseAdapter(promise))
    }

    AsyncFunction("call_sendDigits") {
      uuid: String,
      digits: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.sendDigits(uuid, digits, PromiseAdapter(promise))
    }

    AsyncFunction("call_sendMessage") {
      uuid: String,
      content: String,
      contentType: String,
      messageType: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.sendMessage(
        uuid,
        content,
        contentType,
        messageType,
        PromiseAdapter(promise)
      )
    }

    /**
     * CallInvite API
     */

    AsyncFunction("callInvite_accept") {
      uuid: String,
      options: Map<String, Any>,
      promise: Promise ->

      this@ExpoModule.moduleProxy.callInvite.accept(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("callInvite_reject") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.callInvite.reject(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("callInvite_sendMessage") {
      uuid: String,
      content: String,
      contentType: String,
      messageType: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.callInvite.sendMessage(
        uuid,
        content,
        contentType,
        messageType,
        PromiseAdapter(promise)
      )
    }

    /**
     * PreflightTest API
     */

    AsyncFunction("preflightTest_getCallSid") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getCallSid(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getEndTime") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getEndTime(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getLatestSample") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getLatestSample(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getReport") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getReport(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getStartTime") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getStartTime(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getState") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getState(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_stop") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.stop(uuid, PromiseAdapter(promise))
    }

    /**
     * Voice API
     */

    AsyncFunction("voice_connect_android") {
        accessToken: String,
        twimlParams: Map<String, String>,
        notificationDisplayName: String?,
        promise: Promise ->

      this@ExpoModule.moduleProxy.voice.connect(
        accessToken,
        twimlParams,
        notificationDisplayName,
        PromiseAdapter(promise)
      )
    }

    AsyncFunction("voice_getAudioDevices") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getAudioDevices(PromiseAdapter(promise))
    }


    AsyncFunction("voice_getCalls") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getCalls(PromiseAdapter(promise))
    }

    AsyncFunction("voice_getCallInvites") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getCallInvites(PromiseAdapter(promise))
    }

    AsyncFunction("voice_getDeviceToken") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getDeviceToken(PromiseAdapter(promise))
    }

    AsyncFunction("voice_getVersion") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getVersion(PromiseAdapter(promise))
    }

    AsyncFunction("voice_handleEvent") {
      eventData: Map<String, String>,
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.handleEvent(eventData, PromiseAdapter(promise))
    }

    AsyncFunction("voice_register") {
        accessToken: String,
        promise: Promise ->

      this@ExpoModule.moduleProxy.voice.register(accessToken, PromiseAdapter(promise))
    }

    AsyncFunction("voice_runPreflight") {
      accessToken: String,
      jsPreflightOptions: Map<String, Any>,
      promise: Promise ->

      val preflightOptionsBuilder = PreflightOptions.Builder(accessToken)

      val iceOptionsBuilder = IceOptions.Builder()

      val iceServers = HashSet<IceServer>()

      val jsIceServers = jsPreflightOptions[CommonConstants.CallOptionsKeyIceServers] as ArrayList<*>?

      jsIceServers?.forEach {
        jsIceServer: Any ->

        if (jsIceServer !is LinkedHashMap<*, *>) {
          return@forEach
        }

        val iceServerUrl = jsIceServer[CommonConstants.IceServerKeyServerUrl] as String?
        val iceServerPassword = jsIceServer[CommonConstants.IceServerKeyPassword] as String?
        val iceServerUsername = jsIceServer[CommonConstants.IceServerKeyUsername] as String?

        if (iceServerUrl != null && iceServerPassword != null && iceServerUsername != null) {
          iceServers.add(IceServer(iceServerUrl, iceServerUsername, iceServerPassword))
        } else if (iceServerUrl != null) {
          iceServers.add(IceServer(iceServerUrl))
        }
      }

      val jsIceTransportPolicy = jsPreflightOptions[CommonConstants.CallOptionsKeyIceTransportPolicy]

      val iceTransportPolicy = when (jsIceTransportPolicy) {
        CommonConstants.IceTransportPolicyValueAll -> IceTransportPolicy.ALL
        CommonConstants.IceTransportPolicyValueRelay -> IceTransportPolicy.RELAY
        else -> null
      }

      if (iceServers.isNotEmpty()) {
        iceOptionsBuilder.iceServers(iceServers)
      }

      if (iceTransportPolicy != null) {
        iceOptionsBuilder.iceTransportPolicy(iceTransportPolicy)
      }

      if (iceServers.isNotEmpty() || iceTransportPolicy != null) {
        preflightOptionsBuilder.iceOptions(iceOptionsBuilder.build())
      }

      val preferredAudioCodecs = ArrayList<AudioCodec>()

      val jsPreferredAudioCodecs = jsPreflightOptions[CommonConstants.CallOptionsKeyPreferredAudioCodecs] as ArrayList<*>?

      jsPreferredAudioCodecs?.forEach {
        jsPreferredAudioCodec: Any ->

        if (jsPreferredAudioCodec !is LinkedHashMap<*, *>) {
          return@forEach
        }

        val jsPreferredAudioCodecType = jsPreferredAudioCodec[CommonConstants.AudioCodecKeyType] as String?

        if (jsPreferredAudioCodecType == CommonConstants.AudioCodecTypeValuePCMU) {
          preferredAudioCodecs.add(PcmuCodec())
        }

        if (jsPreferredAudioCodecType == CommonConstants.AudioCodecTypeValueOpus) {
          val jsAudioCodecBitrate = jsPreferredAudioCodec[CommonConstants.AudioCodecOpusKeyMaxAverageBitrate] as Double?

          val audioCodec = if (jsAudioCodecBitrate == null) {
            OpusCodec()
          } else {
            OpusCodec(jsAudioCodecBitrate.toInt())
          }

          preferredAudioCodecs.add(audioCodec)
        }
      }

      if (preferredAudioCodecs.isNotEmpty()) {
        preflightOptionsBuilder.preferAudioCodecs(preferredAudioCodecs)
      }

      val preflightOptions = preflightOptionsBuilder.build()

      this@ExpoModule.moduleProxy.voice.runPreflight(preflightOptions, PromiseAdapter(promise))
    }

    AsyncFunction("voice_selectAudioDevice") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.selectAudioDevice(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("voice_setIncomingCallContactHandleTemplate") {
      template: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.setIncomingCallContactHandleTemplate(
        template,
        PromiseAdapter(promise)
      )
    }

    AsyncFunction("voice_unregister") {
      token: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.unregister(token, PromiseAdapter(promise))
    }
  }
}

object CommonConstants {
    // Call option keys
    const val CallOptionsKeyIceServers = "iceServers"
    const val IceServerKeyServerUrl = "url"
    const val IceServerKeyUsername = "username"
    const val IceServerKeyPassword = "password"
    const val CallOptionsKeyIceTransportPolicy = "iceTransportPolicy"
    const val IceTransportPolicyValueAll = "all"
    const val IceTransportPolicyValueRelay = "relay"
    const val CallOptionsKeyPreferredAudioCodecs = "preferredAudioCodecs"

    // Audio codec keys/values
    const val AudioCodecKeyType = "type"
    const val AudioCodecTypeValuePCMU = "pcmu"
    const val AudioCodecTypeValueOpus = "opus"
    const val AudioCodecOpusKeyMaxAverageBitrate = "maxAverageBitrate"

    // Audio device keys
    const val AudioDeviceKeyEarpiece = "earpiece"
    const val AudioDeviceKeySpeaker = "speaker"
    const val AudioDeviceKeyBluetooth = "bluetooth"
    const val AudioDeviceKeyAudioDevices = "audioDevices"
    const val AudioDeviceKeyName = "name"
    const val AudioDeviceKeySelectedDevice = "selectedDevice"
    const val AudioDeviceKeyType = "type"
    const val AudioDeviceKeyUuid = "uuid"

    // Call events
    const val CallEventConnected = "connected"
    const val CallEventDisconnected = "disconnected"
    const val CallEventReconnected = "reconnected"
    const val CallEventReconnecting = "reconnecting"
    const val CallEventRinging = "ringing"
    const val CallEventCurrentWarnings = "currentWarnings"
    const val CallEventPreviousWarnings = "previousWarnings"
    const val CallEventConnectFailure = "connectFailure"
    const val CallEventQualityWarningsChanged = "qualityWarningsChanged"

    // Call message events
    const val CallEventMessageFailure = "messageFailure"
    const val CallEventMessageReceived = "messageReceived"
    const val CallEventMessageSent = "messageSent"

    // Scopes
    const val ScopeCall = "call"
    const val ScopeCallInvite = "call-invite"
    const val ScopeVoice = "voice"
    const val ScopeCallMessage = "call-message"

    // Voice event keys
    const val VoiceEventType = "type"
    const val VoiceEventError = "error"
    const val VoiceEventSid = "sid"
    const val VoiceEventAudioDevicesUpdated = "audioDevicesUpdated"
    const val VoiceEventTypeValueIncomingCallInvite = "incoming-call-invite"

    // Voice error keys
    const val VoiceErrorKeyError = "error"
    const val VoiceErrorKeyCode = "code"
    const val VoiceErrorKeyMessage = "message"

    // Call invite event keys
    const val CallInviteEventKeyCallSid = "callSid"
    const val CallInviteEventKeyType = "type"
    const val CallInviteEventTypeValueAccepted = "accepted"
    const val CallInviteEventTypeValueCancelled = "cancelled"
    const val CallInviteEventTypeValueNotificationTapped = "notificationTapped"
    const val CallInviteEventTypeValueRejected = "rejected"

    // Call info keys
    const val CallInfoFrom = "from"
    const val CallInfoInitialConnectedTimestamp = "initialConnectedTimestamp"
    const val CallInfoSid = "sid"
    const val CallInfoTo = "to"
    const val CallInfoUuid = "uuid"
    const val CallInfoState = "state"
    const val CallInfoIsMuted = "isMuted"
    const val CallInfoIsOnHold = "isOnHold"

    // Call states
    const val CallStateConnected = "connected"
    const val CallStateConnecting = "connecting"
    const val CallStateDisconnected = "disconnected"
    const val CallStateReconnecting = "reconnecting"
    const val CallStateRinging = "ringing"

    // Call invite info keys
    const val CallInviteInfoCallSid = "callSid"
    const val CallInviteInfoCustomParameters = "customParameters"
    const val CallInviteInfoFrom = "from"
    const val CallInviteInfoTo = "to"
    const val CallInviteInfoUuid = "uuid"

    // Cancelled call invite info keys
    const val CancelledCallInviteInfoCallSid = "callSid"
    const val CancelledCallInviteInfoFrom = "from"
    const val CancelledCallInviteInfoTo = "to"

    // Call message keys
    const val CallMessageContent = "content"
    const val CallMessageContentType = "contentType"
    const val CallMessageMessageType = "messageType"
    const val JSEventKeyCallMessageInfo = "callMessageInfo"

    // Error codes
    const val ErrorCodeInvalidArgumentError = "invalid-argument-error"
    const val ErrorCodeInvalidStateError = "invalid-state-error"

    // SDK info
    const val ReactNativeVoiceSDK = "twilio-voice-react-native-sdk"
    const val ReactNativeVoiceSDKVer = "2.0.0-dev"

    // Call feedback scores
    const val CallFeedbackScoreNotReported = "not-reported"
    const val CallFeedbackScoreOne = "one"
    const val CallFeedbackScoreTwo = "two"
    const val CallFeedbackScoreThree = "three"
    const val CallFeedbackScoreFour = "four"
    const val CallFeedbackScoreFive = "five"

    // Call feedback issues
    const val CallFeedbackIssueAudioLatency = "audio-latency"
    const val CallFeedbackIssueChoppyAudio = "choppy-audio"
    const val CallFeedbackIssueEcho = "echo"
    const val CallFeedbackIssueDroppedCall = "dropped-call"

    // ICE candidate pair stats keys
    const val AvailableIncomingBitrate = "availableIncomingBitrate"
    const val AvailableOutgoingBitrate = "availableOutgoingBitrate"
    const val BytesReceived = "bytesReceived"
    const val BytesSent = "bytesSent"
    const val ConsentRequestsReceived = "consentRequestsReceived"
    const val ConsentRequestsSent = "consentRequestsSent"
    const val ConsentResponsesReceived = "consentResponsesReceived"
    const val ConsentResponsesSent = "consentResponsesSent"
    const val CurrentRoundTripTime = "currentRoundTripTime"
    const val LocalCandidateId = "localCandidateId"
    const val LocalCandidateIp = "localCandidateIp"
    const val Nominated = "nominated"
    const val Priority = "priority"
    const val Readable = "readable"
    const val RelayProtocol = "relayProtocol"
    const val RemoteCandidateId = "remoteCandidateId"
    const val RemoteCandidateIp = "remoteCandidateIp"
    const val RequestsReceived = "requestsReceived"
    const val RequestsSent = "requestsSent"
    const val ResponsesReceived = "responsesReceived"
    const val ResponsesSent = "responsesSent"
    const val RetransmissionsReceived = "retransmissionsReceived"
    const val RetransmissionsSent = "retransmissionsSent"
    const val State = "state"
    const val TotalRoundTripTime = "totalRoundTripTime"
    const val TransportId = "transportId"
    const val Writeable = "writeable"

    // ICE candidate stats keys
    const val CandidateType = "candidateType"
    const val Deleted = "deleted"
    const val Ip = "ip"
    const val IsRemote = "isRemote"
    const val Port = "port"
    const val Protocol = "protocol"
    const val Url = "url"

    // ICE candidate pair states
    const val StateFailed = "failed"
    const val StateFrozen = "frozen"
    const val StateInProgress = "in-progress"
    const val StateSucceeded = "succeeded"
    const val StateWaiting = "waiting"

    // More call feedback issues
    const val CallFeedbackIssueNoisyCall = "noisy-call"
    const val CallFeedbackIssueNotReported = "not-reported"
    const val CallFeedbackIssueOneWayAudio = "one-way-audio"

    // Preflight test states
    const val PreflightTestStateCompleted = "completed"
    const val PreflightTestStateConnected = "connected"
    const val PreflightTestStateConnecting = "connecting"
    const val PreflightTestStateFailed = "failed"

    // Promise keys
    const val PromiseKeyStatus = "status"
    const val PromiseStatusValueResolved = "resolved"
    const val PromiseKeyValue = "value"
    const val PromiseStatusValueRejectedWithCode = "rejected-with-code"
    const val PromiseKeyErrorCode = "code"
    const val PromiseKeyErrorMessage = "message"
    const val PromiseStatusValueRejectedWithName = "rejected-with-name"
    const val PromiseKeyErrorName = "name"

    // Preflight test event keys
    const val PreflightTestEventTypeValueConnected = "connected"
    const val PreflightTestEventKeyUuid = "uuid"
    const val PreflightTestEventKeyType = "type"
    const val PreflightTestEventTypeValueCompleted = "completed"
    const val PreflightTestCompletedEventKeyReport = "report"
    const val PreflightTestEventTypeValueFailed = "failed"
    const val PreflightTestFailedEventKeyError = "error"
    const val PreflightTestEventTypeValueQualityWarning = "quality-warning"
    const val PreflightTestQualityWarningEventKeyCurrentWarnings = "currentWarnings"
    const val PreflightTestQualityWarningEventKeyPreviousWarnings = "previousWarnings"
    const val PreflightTestEventTypeValueSample = "sample"
    const val PreflightTestSampleEventKeySample = "sample"
    const val ScopePreflightTest = "preflight-test"

    // Voice event types
    const val VoiceEventRegistered = "registered"
    const val VoiceEventUnregistered = "unregistered"

    // Stats keys
    const val PeerConnectionId = "peerConnectionId"
    const val LocalAudioTrackStats = "localAudioTrackStats"
    const val RemoteAudioTrackStats = "remoteAudioTrackStats"
    const val IceCandidatePairStats = "iceCandidatePairStats"
    const val IceCandidateStats = "iceCandidateStats"
    const val Codec = "codec"
    const val PacketsLost = "packetsLost"
    const val Ssrc = "ssrc"
    const val Timestamp = "timestamp"
    const val TrackId = "trackId"
    const val PacketsSent = "packetsSent"
    const val RoundTripTime = "roundTripTime"
    const val AudioLevel = "audioLevel"
    const val Jitter = "jitter"
    const val PacketsReceived = "packetsReceived"
    const val Mos = "mos"
    const val ActiveCandidatePair = "activeCandidatePair"
}
