package expo.modules.spellchecker

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class LearnedWordsDBHelper(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    override fun onCreate(db: SQLiteDatabase) {
        val createTableQuery = """
            CREATE TABLE ${LearnedWordsContract.TABLE_NAME} (
                ${LearnedWordsContract.COLUMN_WORD} TEXT PRIMARY KEY,
                ${LearnedWordsContract.COLUMN_FREQUENCY} INTEGER,
                ${LearnedWordsContract.COLUMN_LOCALE} TEXT
            )
        """.trimIndent()
        db.execSQL(createTableQuery)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS ${LearnedWordsContract.TABLE_NAME}")
        onCreate(db)
    }

    companion object {
        const val DATABASE_NAME = "LearnedWordsDB.db"
        const val DATABASE_VERSION = 1
    }
}
