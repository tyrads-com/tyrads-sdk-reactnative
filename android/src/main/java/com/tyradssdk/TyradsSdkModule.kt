package com.tyradssdk

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.google.gson.Gson
import com.tyrads.sdk.Tyrads


class TyradsSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
  private var languageJob: Job? = null

  override fun getName(): String {
    return NAME
  }

  private fun sendEvent(eventName: String, data: String) {
    val reactContext = reactApplicationContext
    if (reactContext.hasActiveCatalystInstance()) {
      Tyrads.getInstance().tyradScope.launch {
        reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit(eventName, data)
      }
    }
  }

  @ReactMethod
  fun startObserving() {
    if (languageJob?.isActive == true) return

    languageJob = scope.launch {
      Tyrads.getInstance().currentLanguageCode.collectLatest { lang ->
        sendEvent("LanguageChanged", lang)
      }
    }
  }

  @ReactMethod
  fun stopObserving() {
    languageJob?.cancel()
    languageJob = null
  }

  @ReactMethod
  fun init(apiKey: String, apiSecret: String, encKey: String?, promise: Promise) {
    Tyrads.getInstance().tyradScope.launch {
      try {
        Tyrads.getInstance().init(reactApplicationContext, apiKey, apiSecret, encKey)

        val lang = Tyrads.getInstance().currentLanguageCode.value

        val result = mapOf(
          "success" to true,
          "languageCode" to lang
        )

        promise.resolve(Gson().toJson(result))
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
          val jsonString = Gson().toJson(apiHeaders)
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

  companion object {
    const val NAME = "TyradsSdk"
  }
}
