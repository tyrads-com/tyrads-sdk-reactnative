package com.tyradssdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.tyrads.sdk.Tyrads

class TyradsSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

    @ReactMethod
    fun init(apiKey: String, apiSecret: String, promise: Promise) {
        try {
            Tyrads.getInstance().init(this.reactApplicationContext, apiKey, apiSecret)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun loginUser(userId: String, promise: Promise) {
        try {
            Tyrads.getInstance().loginUser(userId)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("LOGIN_ERROR", e.message)
        }
    }

    @ReactMethod
    fun showOffers() {
        Tyrads.getInstance().showOffers()
    }

  companion object {
    const val NAME = "TyradsSdk"
  }
}
