package com.tyradssdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import com.google.gson.Gson
import android.util.Log
import com.tyrads.sdk.Tyrads

class TyradsSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

    @ReactMethod
    fun init(apiKey: String, apiSecret: String, encKey: String? = null, promise: Promise) {
      Tyrads.getInstance().tyradScope.launch {
        try {
          Tyrads.getInstance().init(reactApplicationContext, apiKey, apiSecret, encKey)
          promise.resolve(true)
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

  companion object {
    const val NAME = "TyradsSdk"
  }
}
