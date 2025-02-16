package com.fintrack

import android.database.Cursor
import android.net.Uri
import android.provider.Telephony
import android.util.Log
import com.facebook.react.bridge.*

class SMSModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SMSModule"
    }

    @ReactMethod
fun getMessages(promise: Promise) {
    val smsList = WritableNativeArray()
    try {
        val uri: Uri = Telephony.Sms.Inbox.CONTENT_URI
        val cursor: Cursor? = reactApplicationContext.contentResolver.query(
            uri, arrayOf(Telephony.Sms.ADDRESS, Telephony.Sms.BODY), null, null, Telephony.Sms.DEFAULT_SORT_ORDER
        )

        cursor?.let {
            while (it.moveToNext()) {
                val address: String = it.getString(it.getColumnIndexOrThrow(Telephony.Sms.ADDRESS))
                val body: String = it.getString(it.getColumnIndexOrThrow(Telephony.Sms.BODY))
                val sms = WritableNativeMap().apply {
                    putString("address", address)
                    putString("body", body)
                }
                smsList.pushMap(sms)
            }
        } ?: run {
            promise.reject("ERROR", "Cursor is null or unable to read SMS.")
            return
        }

        promise.resolve(smsList)
    } catch (e: Exception) {
        Log.e("SMSModule", "Error fetching SMS", e)
        promise.reject("ERROR", "Failed to read SMS")
    }
}

}
