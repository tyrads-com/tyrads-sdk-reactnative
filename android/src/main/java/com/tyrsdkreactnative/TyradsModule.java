package com.tyrsdkreactnative;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import com.tyrads.sdk.Tyrads;

public class TyradsModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public TyradsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "TyradsModule";
    }

    @ReactMethod
    public void init(String apiKey, String apiSecret, Promise promise) {
        try {
            Tyrads.getInstance().init(reactContext, apiKey, apiSecret);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("INIT_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void loginUser(String userId, Promise promise) {
        try {
            Tyrads.getInstance().loginUser(userId);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("LOGIN_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void showOffers() {
        Tyrads.getInstance().showOffers();
    }
}