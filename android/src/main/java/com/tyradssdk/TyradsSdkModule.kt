package com.tyradssdk

import android.util.Log
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Arguments
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import com.google.gson.Gson
import com.tyrads.sdk.Tyrads
import com.tyrads.sdk.TyradsUserInfo
import com.tyrads.sdk.TyradsMediaSourceInfo
import com.tyrads.sdk.acmo.modules.push_notifications.FCMNotifications
import com.tyrads.sdk.acmo.modules.push_notifications.TyradsNotificationListener
import com.tyrads.sdk.acmo.modules.input_models.TyradsConfig

class TyradsSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), ActivityEventListener, LifecycleEventListener {

  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
  private var languageJob: Job? = null
  private val gson = Gson()

  private var cachedEvents = mutableListOf<String>()
  private var isObserving = false
  private var lastHandledIntent: Intent? = null

  override fun getName(): String {
    return NAME
  }

  init {
    reactContext.addActivityEventListener(this)
    reactContext.addLifecycleEventListener(this)
    setupNotificationListener()
  }

  override fun onHostResume() {
      val intent = currentActivity?.intent
      if (intent != null && intent != lastHandledIntent) {
          FCMNotifications.getInstance().handleNotificationIntent(intent)
          lastHandledIntent = intent
      }
  }

  override fun onHostPause() {}
  override fun onHostDestroy() {}


  override fun onActivityResult(activity: android.app.Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
    // Not needed
  }

  override fun onNewIntent(intent: Intent?) {
    intent?.let {
      FCMNotifications.getInstance().handleNotificationIntent(it)
    }
  }


  private fun setupNotificationListener() {
    FCMNotifications.getInstance().setNotificationListener(object : TyradsNotificationListener {
      override fun onNotificationReceived(data: Map<String, String>) {
        val payload = mapOf(
          "type" to "received",
          "data" to data
        )
        sendEvent("PushNotificationEvent", gson.toJson(payload))
      }

      override fun onNotificationClicked(data: Map<String, String>) {
        val payload = mapOf(
          "type" to "clicked",
          "data" to data
        )
        sendEvent("PushNotificationEvent", gson.toJson(payload))
      }

      override fun onNotificationDismissed(data: Map<String, String>) {
        val payload = mapOf(
          "type" to "dismissed",
          "data" to data
        )
        sendEvent("PushNotificationEvent", gson.toJson(payload))
      }
    })
  }

  private fun sendEvent(eventName: String, data: String) {
    if (!isObserving) {
        Log.i("TyradsSDK", "JS side not ready. Caching event: $eventName")
        cachedEvents.add(data)
        return
    }

    val reactContext = reactApplicationContext
    val isActive = reactContext.hasActiveCatalystInstance()
    Log.i("TyradsSDK", "Emitting event to JS: $eventName (Bridge Active: $isActive)")
    if (isActive) {
      scope.launch {
        reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit(eventName, data)
      }
    }
  }

  @ReactMethod
  fun startObserving() {
    isObserving = true
    Log.d("TyradsSdkModule", "startObserving: flushing ${cachedEvents.size} events")
    
    val eventsToFlush = ArrayList(cachedEvents)
    cachedEvents.clear()
    eventsToFlush.forEach { data ->
        sendEvent("PushNotificationEvent", data)
    }

    if (languageJob?.isActive == true) return

    languageJob = scope.launch {
      Tyrads.getInstance().currentLanguageCode.collectLatest { lang ->
        sendEvent("LanguageChanged", lang)
      }
    }
  }


  @ReactMethod
  fun stopObserving() {
    isObserving = false
    languageJob?.cancel()
    languageJob = null
  }

  @ReactMethod
  fun init(apiKey: String, apiSecret: String, encKey: String?, engagementId: String?, placementId: String?, config: ReadableMap?, promise: Promise) {
    Tyrads.getInstance().tyradScope.launch {
      try {
        val configData = if (config != null) {
                val jsonString = gson.toJson(config.toHashMap())
                gson.fromJson(jsonString, TyradsConfig::class.java)
            } else {
                TyradsConfig() 
            } 
        Tyrads.getInstance().init(reactApplicationContext, apiKey, apiSecret, encKey, engagementId, placementId, configData)

        val lang = Tyrads.getInstance().currentLanguageCode.value

        val result = mapOf(
          "success" to true,
          "languageCode" to lang
        )

        promise.resolve(gson.toJson(result))
      } catch (e: Exception) {
        promise.reject("INIT_ERROR", e.message)
      }
    }
  }

  @ReactMethod
  fun loginUser(userId: String, promise: Promise) {
    Tyrads.getInstance().tyradScope.launch {
      try {
        val apiHeaders = Tyrads.getInstance().loginUser(userId)
        Log.i("bmd", "apiHeaders: $apiHeaders")
        if (apiHeaders != null) {
          val jsonString = gson.toJson(apiHeaders)
          promise.resolve(jsonString)
        } else {
          promise.resolve(null)
        }
      } catch (e: Exception) {
        promise.reject("LOGIN_ERROR", e.message)
      }
    }
  }

  @ReactMethod
  fun showOffers(route: String? = null, promise: Promise) {
    Tyrads.getInstance().tyradScope.launch {
      try {
        Tyrads.getInstance().showOffers(route = route, campaignID = null)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("SHOW_OFFERS_ERROR", e.message)
      }
    }
  }

  @ReactMethod
  fun showOfferDetails(route: String? = null, campaignID: Int? = null, promise: Promise) {
    Tyrads.getInstance().tyradScope.launch {
      try {
        Tyrads.getInstance().showOffers(route = route, campaignID = campaignID)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("SHOW_OFFERS_ERROR", e.message)
      }
    }
  }

  @ReactMethod
  fun changeLanguage(lang: String, promise: Promise) {
    Tyrads.getInstance().tyradScope.launch {
      try {
        Tyrads.getInstance().changeLanguage(lang)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("CHANGE_LANGUAGE_ERROR", e.message)
      }
    }
  }

  @ReactMethod
  fun setSDKVersion(version: String) {
    Tyrads.getInstance().setUpSDKVersion(version)
  }

  @ReactMethod
  fun setMediaSourceInfo(mediaSourceInfoMap: ReadableMap) {
    try {
      val jsonString = gson.toJson(mediaSourceInfoMap.toHashMap())
      val mediaSourceInfo = gson.fromJson(jsonString, TyradsMediaSourceInfo::class.java)
      Log.d(NAME, "Received mediaSourceInfo: $jsonString")
      Tyrads.getInstance().setMediaSourceInfo(mediaSourceInfo)
    } catch (e: Exception) {
      Log.e(NAME, "Error setting MediaSourceInfo", e)
    }
  }

  @ReactMethod
  fun setUserInfo(userInfoMap: ReadableMap) {
    try {
      val jsonString = gson.toJson(userInfoMap.toHashMap())
      val userInfo = gson.fromJson(jsonString, TyradsUserInfo::class.java)
      Log.d(NAME, "Received userInfo: $jsonString")
      Tyrads.getInstance().setUserInfo(userInfo)      
    } catch (e: Exception) {
      Log.e(NAME, "Error setting UserInfo", e)
    }
  }

  @ReactMethod
  fun isPrivacyAccepted(promise: Promise) {
    Tyrads.getInstance().tyradScope.launch {
      try {
        val result = Tyrads.getInstance().isPrivacyAccepted()
        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject("PRIVACY_ERROR", e.message)
      }
    }
  }

  @ReactMethod
  fun checkOnboardingProcess(promise: Promise) {
    coroutineScope.launch {
      try {
        val result = Tyrads.getInstance().checkOnboardingProcess(reactApplicationContext)
        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject("ONBOARDING_PROCESS_ERROR", e.message)
      }
    }
  }

  companion object {
    const val NAME = "TyradsSdk"
  }
}