package expo.modules.spellchecker

import android.content.Context
import android.provider.UserDictionary
import android.view.textservice.*
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.runBlocking
import java.net.URL

class ExpoSpellcheckerModule : Module(), SpellCheckerSession.SpellCheckerSessionListener {
    private var spellCheckerSession: SpellCheckerSession? = null
    private val ignoredWords = mutableSetOf<String>()

    private var spellCheckDeferred: CompletableDeferred<List<String>>? = null

    override fun definition() = ModuleDefinition {
        Name("ExpoSpellchecker")

        Constants("PI" to Math.PI)

        Events("onChange")

        Function("hello") {
            "Hello world! 👋"
        }

        AsyncFunction("checkSpelling") { input: String, language: String ->
            val lastWord = extractLastWord(input)

            if (ignoredWords.contains(lastWord)) {
                emptyList<String>()
            } else {
                runBlocking { checkSpellingAsync(lastWord) }
            }
        }

        AsyncFunction("getCompletions") { input: String, language: String ->
            val lastWord = extractLastWord(input)

            if (ignoredWords.contains(lastWord)) {
                emptyList<String>()
            } else {
                runBlocking { getSentenceSuggestionsAsync(lastWord) }
            }
        }

        AsyncFunction("ignoreWord") { word: String ->
            ignoredWords.add(word)
        }

        AsyncFunction("getIgnoredWords") {
            ignoredWords.toList()
        }

        AsyncFunction("learnWord") { word: String ->
            UserDictionary.Words.addWord(appContext.reactContext, word, 100, UserDictionary.Words.LOCALE_TYPE_ALL)
        }

        AsyncFunction("unlearnWord") { word: String ->
            removeWordFromUserDictionary(word)
        }

        AsyncFunction("hasLearnedWord") { word: String ->
            isWordInUserDictionary(word)
        }

        AsyncFunction("getAvailableLanguages") { ->
            val textServicesManager = appContext.reactContext?.getSystemService(Context.TEXT_SERVICES_MANAGER_SERVICE) as? TextServicesManager
            val spellCheckerInfo = textServicesManager?.getCurrentSpellCheckerInfo()
            
            if (spellCheckerInfo != null) {
                val spellCheckerLanguages = mutableListOf<String>()
                val count = spellCheckerInfo.subtypeCount
                
                for (i in 0 until count) {
                    val subtype = spellCheckerInfo.getSubtypeAt(i)
                    val languageTag = subtype.locale
                    
                    if (!languageTag.isNullOrEmpty()) {
                        spellCheckerLanguages.add(languageTag)
                    }
                }
                
                return@AsyncFunction spellCheckerLanguages
            }
            
            // Return a list with the default locale if no spell checker is available
            listOf(java.util.Locale.getDefault().language)
        }

        AsyncFunction("setValueAsync") { value: String ->
            sendEvent("onChange", mapOf("value" to value))
        }

        View(ExpoSpellcheckerView::class) {
            Prop("url") { view: ExpoSpellcheckerView, url: URL ->
                view.webView.loadUrl(url.toString())
            }
            Events("onLoad")
        }

        OnCreate {
            val textServicesManager =
                appContext.reactContext?.getSystemService(Context.TEXT_SERVICES_MANAGER_SERVICE) as? TextServicesManager
            spellCheckerSession = textServicesManager?.newSpellCheckerSession(null, null, this@ExpoSpellcheckerModule, true)
        }

        OnDestroy {
            spellCheckerSession?.close()
            spellCheckerSession = null
        }
    }

    private suspend fun checkSpellingAsync(word: String): List<String> {
        spellCheckDeferred = CompletableDeferred()
        spellCheckerSession?.getSuggestions(TextInfo(word), 1)
        return spellCheckDeferred?.await() ?: emptyList()
    }

    private suspend fun getSentenceSuggestionsAsync(word: String): List<String> {
        spellCheckDeferred = CompletableDeferred()
        spellCheckerSession?.getSentenceSuggestions(arrayOf(TextInfo(word)), 5)
        return spellCheckDeferred?.await() ?: emptyList()
    }

    override fun onGetSuggestions(results: Array<out SuggestionsInfo>?) {
        val suggestions = results?.flatMap { info ->
            (0 until info.suggestionsCount).map { info.getSuggestionAt(it) }
        }.orEmpty()
        spellCheckDeferred?.complete(suggestions)
    }

    override fun onGetSentenceSuggestions(results: Array<out SentenceSuggestionsInfo>?) {
        val completions = results?.flatMap { sentenceSuggestionsInfo ->
            (0 until sentenceSuggestionsInfo.suggestionsCount).flatMap { i ->
                val suggestionsInfo = sentenceSuggestionsInfo.getSuggestionsInfoAt(i)
                (0 until suggestionsInfo.suggestionsCount).map { suggestionsInfo.getSuggestionAt(it) }
            }
        }.orEmpty()
        spellCheckDeferred?.complete(completions)
    }

    private fun extractLastWord(input: String): String {
        val words = input.trim().split(" ")
        return words.lastOrNull() ?: input
    }

    private fun isWordInUserDictionary(word: String): Boolean {
        val cursor = appContext.reactContext?.contentResolver?.query(
            UserDictionary.Words.CONTENT_URI,
            arrayOf(UserDictionary.Words.WORD),
            "${UserDictionary.Words.WORD} = ?",
            arrayOf(word),
            null
        )
        val exists = cursor?.count ?: 0 > 0
        cursor?.close()
        return exists
    }

    private fun removeWordFromUserDictionary(word: String): Boolean {
        return try {
            val uri = UserDictionary.Words.CONTENT_URI
            val selection = "${UserDictionary.Words.WORD} = ?"
            val selectionArgs = arrayOf(word)
            val rowsDeleted = appContext.reactContext?.contentResolver?.delete(uri, selection, selectionArgs)
            (rowsDeleted ?: 0) > 0
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
