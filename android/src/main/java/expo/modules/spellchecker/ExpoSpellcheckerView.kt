package expo.modules.spellchecker

import android.content.Context
import android.util.AttributeSet
import android.widget.EditText

class ExpoSpellcheckerView(context: Context) : EditText(context) {

    init {
        // Initial configuration for the input view
        setSingleLine(false)
        // setPadding(16, 16, 16, 16)
        setShowSoftInputOnFocus(false)
    }

    fun setKeyboardType(type: String?) {
        inputType = when (type?.lowercase()) {
            "default" -> android.text.InputType.TYPE_CLASS_TEXT
            "numberpad" -> android.text.InputType.TYPE_CLASS_NUMBER
            "emailaddress" -> android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
            "phonepad" -> android.text.InputType.TYPE_CLASS_PHONE
            else -> android.text.InputType.TYPE_CLASS_TEXT
        }
    }

    fun setSpellCheckingType(enabled: Boolean) {
        inputType = if (enabled) {
            inputType or android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT
        } else {
            inputType or android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
        }
    }

    fun setAutocorrectionType(enabled: Boolean) {
        inputType = if (enabled) {
            inputType or android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT
        } else {
            inputType or android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
        }
    }

    fun setHidden(hidden: Boolean) {
        visibility = if (hidden) android.view.View.GONE else android.view.View.VISIBLE
    }
}
