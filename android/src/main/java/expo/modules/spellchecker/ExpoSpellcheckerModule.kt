package expo.modules.spellchecker

import android.util.Log
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.content.ContentValues
import android.view.textservice.*
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.runBlocking
import java.net.URL
import android.net.Uri

import android.Manifest
import android.content.pm.PackageManager

class ExpoSpellcheckerModule : Module(), SpellCheckerSession.SpellCheckerSessionListener {
    private var spellCheckerSession: SpellCheckerSession? = null

    private lateinit var dbHelper: LearnedWordsDBHelper
    private lateinit var database: SQLiteDatabase

    private val ignoredWords = mutableSetOf<String>()

    private var spellCheckDeferred: CompletableDeferred<List<String>>? = null

    override fun definition() = ModuleDefinition {
        Name("ExpoSpellchecker")

        AsyncFunction("checkSpelling") { input: String, language: String ->
            val lastWord = extractLastWord(input)

            if (ignoredWords.contains(lastWord.lowercase()) || isWordInDatabase(lastWord)) {
                emptyList<String>()
            } else {
                runBlocking { getSentenceSuggestionsAsync(lastWord) }
            }
        }

        AsyncFunction("getCompletions") { input: String, language: String ->
            val lastWord = extractLastWord(input)

            if (ignoredWords.contains(lastWord.lowercase()) || isWordInDatabase(lastWord)) {
                emptyList<String>()
            } else {
                runBlocking { getSentenceSuggestionsAsync(lastWord) }
            }
        }

        AsyncFunction("ignoreWord") { word: String ->
            ignoredWords.add(word.lowercase())
        }

        AsyncFunction("getIgnoredWords") {
            ignoredWords.toList()
        }

        AsyncFunction("learnWord") { word: String ->
            val lowercaseWord = word.lowercase()
            val locale = java.util.Locale.getDefault().toString()
            val newFrequency = getWordFrequency(lowercaseWord) + 1

            val contentValues = ContentValues().apply {
                put(LearnedWordsContract.COLUMN_WORD, lowercaseWord)
                put(LearnedWordsContract.COLUMN_FREQUENCY, newFrequency)
                put(LearnedWordsContract.COLUMN_LOCALE, locale)
            }

            database.insertWithOnConflict(
                LearnedWordsContract.TABLE_NAME,
                null,
                contentValues,
                SQLiteDatabase.CONFLICT_REPLACE
            )

            // Log.d("ExpoSpellchecker", "Learned word: $lowercaseWord, frequency updated to $newFrequency.")
        }

        AsyncFunction("unlearnWord") { word: String ->
            val lowercaseWord = word.lowercase()
            val rowsDeleted = database.delete(
                LearnedWordsContract.TABLE_NAME,
                "${LearnedWordsContract.COLUMN_WORD} = ?",
                arrayOf(lowercaseWord)
            )
            // Log.d("ExpoSpellchecker", "Unlearned word: $lowercaseWord, rows deleted: $rowsDeleted")
        }

        AsyncFunction("hasLearnedWord") { word: String ->
            isWordInDatabase(word)
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

        View(ExpoSpellcheckerView::class) {
            // Register props from TypeScript
            Prop("keyboardType") { view: ExpoSpellcheckerView, type: String? ->
                view.setKeyboardType(type)
            }

            Prop("spellCheckingType") { view: ExpoSpellcheckerView, enabled: Boolean ->
                view.setSpellCheckingType(enabled)
            }

            Prop("autocorrectionType") { view: ExpoSpellcheckerView, enabled: Boolean ->
                view.setAutocorrectionType(enabled)
            }

            Prop("hidden") { view: ExpoSpellcheckerView, hidden: Boolean ->
                view.setHidden(hidden)
            }

            Events("onLoad")
        }

        OnCreate {
            dbHelper = LearnedWordsDBHelper(appContext.reactContext!!)
            database = dbHelper.writableDatabase

            val textServicesManager = appContext.reactContext?.getSystemService(Context.TEXT_SERVICES_MANAGER_SERVICE) as? TextServicesManager
            spellCheckerSession = textServicesManager?.newSpellCheckerSession(
                null, null, this@ExpoSpellcheckerModule, true
            )
        }

        OnDestroy {
            database.close()
            spellCheckerSession?.close()
        }
    }

    private suspend fun getSentenceSuggestionsAsync(input: String): List<String> {
        spellCheckDeferred = CompletableDeferred()
        spellCheckerSession?.getSuggestions(TextInfo(input), 10)
        return spellCheckDeferred?.await() ?: emptyList()
    }

    // private suspend fun getSentenceSuggestionsAsync(input: String): List<String> {
    //     spellCheckDeferred = CompletableDeferred()

    //     val lastWord = extractLastWord(input)
    //     val textInfo = TextInfo(input, input.lastIndexOf(lastWord), input.length)
        
    //     spellCheckerSession?.getSentenceSuggestions(arrayOf(textInfo), 10)
    //     return spellCheckDeferred?.await() ?: emptyList()
    // }

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

    private fun getWordFrequency(word: String): Int {
        val lowercaseWord = word.lowercase()
        val cursor = database.query(
            LearnedWordsContract.TABLE_NAME,
            arrayOf(LearnedWordsContract.COLUMN_FREQUENCY),
            "${LearnedWordsContract.COLUMN_WORD} = ?",
            arrayOf(lowercaseWord),
            null, null, null
        )

        val frequency = if (cursor.moveToFirst()) {
            cursor.getInt(cursor.getColumnIndexOrThrow(LearnedWordsContract.COLUMN_FREQUENCY))
        } else {
            0
        }
        cursor.close()
        return frequency
    }

    private fun isWordInDatabase(word: String): Boolean {
        val lowercaseWord = word.lowercase()
        val cursor = database.query(
            LearnedWordsContract.TABLE_NAME,
            arrayOf(LearnedWordsContract.COLUMN_WORD),
            "${LearnedWordsContract.COLUMN_WORD} = ?",
            arrayOf(lowercaseWord),
            null, null, null
        )

        val exists = cursor.count > 0
        cursor.close()
        return exists
    }

    private fun extractLastWord(input: String): String {
        val words = input.trim().split(" ")
        return words.lastOrNull() ?: input
    }
}