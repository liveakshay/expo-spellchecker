import ExpoSpellchecker from "expo-spellchecker";
import { useEffect, useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function App() {
  const [word, setWord] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [completions, setCompletions] = useState<string[]>([]);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [ignoredWords, setIgnoredWords] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // State to track loading status
  const [output, setOutput] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Fetch the ignored words on component mount
  useEffect(() => {
    ExpoSpellchecker.getIgnoredWords()
      .then((words) => setIgnoredWords(words))
      .catch((error) => console.error("Error fetching ignored words:", error));
  }, [ignoredWords]);

  const checkSpellingWithTimeout = async (
    input: string,
    language: string,
    timeoutMs: number
  ) => {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("checkSpelling timed out"));
      }, timeoutMs);
    });

    // Create a promise for checkSpelling
    const checkSpellingPromise = new Promise<string[]>((resolve, reject) => {
      // Replace this with your actual native module function
      ExpoSpellchecker.checkSpelling(input, language)
        .then(resolve)
        .catch(reject);
    });

    // Use Promise.race to race the timeout and checkSpelling
    return Promise.race([checkSpellingPromise, timeoutPromise]);
  };

  const handleCheckSpelling = async () => {
    try {
      setLoading(true); // Show loading indicator
      // console.log("word.toUpperCase()", word.toUpperCase());
      const results = await checkSpellingWithTimeout(
        word,
        selectedLanguage,
        3000
      );
      // console.log("results", results);
      setSuggestions(results); // Update suggestions state
    } catch (error) {
      console.log("Error checking spelling:", error);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleGetCompletions = async () => {
    try {
      setLoading(true); // Show loading indicator
      const results = await ExpoSpellchecker.getCompletions(
        word,
        selectedLanguage
      ); // Async call to check spelling
      setCompletions(results); // Update suggestions state
    } catch (error) {
      console.error("Error checking spelling:", error);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleLearnWord = async () => {
    try {
      await ExpoSpellchecker.learnWord(word); // Wait for the word to be learned

      if (!learnedWords.includes(word)) {
        learnedWords.push(word);
        setLearnedWords(learnedWords);
      }

      const isLearned = await ExpoSpellchecker.hasLearnedWord(word); // Await the promise to get the boolean
      logOutput("hasLearnedWord: " + isLearned);
    } catch (error) {
      console.error("Error in handleLearnWord:", error);
    }
  };

  const handleUnlearnWord = async () => {
    try {
      await ExpoSpellchecker.unlearnWord(word); // Wait for the word to be unlearned
      if (learnedWords.includes(word)) {
        learnedWords.splice(learnedWords.indexOf(word), 1);
        setLearnedWords(learnedWords);
      }

      const isLearned = await ExpoSpellchecker.hasLearnedWord(word); // Await the promise to get the boolean
      logOutput("hasLearnedWord: " + isLearned);
    } catch (error) {
      console.error("Error in handleUnlearnWord:", error);
    }
  };

  const handleIgnoreWord = async () => {
    try {
      await ExpoSpellchecker.ignoreWord(word); // Wait for the word to be ignored

      logOutput("ignoredWords: " + ignoredWords);
    } catch (error) {
      console.error("Error in handleIgnoreWord:", error);
    }
  };

  // Utility function to append new logs
  const logOutput = (message: string) => {
    setOutput((prev) => `${prev}\n${message}`);
  };

  const testAvailableLanguages = async () => {
    try {
      const languages = await ExpoSpellchecker.getAvailableLanguages();
      logOutput(`Available languages: ${languages.join(", ")}`);
    } catch (error) {
      const err = error as Error;
      logOutput(`Error fetching available languages: ${err.message}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Text style={styles.header}>Module Test Examples</Text>
          <Group name="Spell Checking">
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Enter a word"
                value={word}
                onChangeText={setWord}
                multiline
                numberOfLines={4}
                // showSoftInputOnFocus={false}
                spellCheck={false}
                autoComplete="off"
                autoCorrect={false}
              />
              <Picker
                selectedValue={selectedLanguage}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedLanguage(itemValue)
                }
                style={{ flex: 1 }}
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="Spanish" value="es" />
                <Picker.Item label="Greek" value="el" />
              </Picker>
              <Button
                title="Check Spelling"
                onPress={handleCheckSpelling}
                disabled={loading || word.trim() === ""} // Disable button when loading or input is empty
              />
              <Button
                title="Get Completions"
                onPress={handleGetCompletions}
                disabled={loading || word.trim() === ""} // Disable button when loading or input is empty
              />
              {loading && <Text>Checking spelling...</Text>}
              {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text>Suggestions:</Text>
                  {suggestions.map((suggestion, index) => (
                    <Text key={index} style={styles.suggestion}>
                      {suggestion}
                    </Text>
                  ))}
                </View>
              )}
              {loading && <Text>Getting completions...</Text>}
              {completions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text>Completions:</Text>
                  {completions.map((completion, index) => (
                    <Text key={index} style={styles.suggestion}>
                      {completion}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </Group>
          <Group name="Other Functions">
            <View style={styles.container}>
              <Button
                title="Get Available Languages"
                onPress={testAvailableLanguages}
              />
              <Button title="Learn Word" onPress={handleLearnWord} />
              <Button title="Unlearn Word" onPress={handleUnlearnWord} />
              <Button title="Ignore Word" onPress={handleIgnoreWord} />
              <ScrollView
                style={styles.outputContainer}
                // keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flex: 1, height: 500 }}
              >
                <Text style={styles.output}>{output}</Text>
              </ScrollView>
            </View>
          </Group>

          <Group name="IgnoredWords">
            <View style={styles.container}>
              <ScrollView
                style={styles.outputContainer}
                // keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flex: 1, height: 500 }}
              >
                <Text style={styles.output}>{ignoredWords}</Text>
              </ScrollView>
            </View>
          </Group>

          {/* <Group name="View">
          <View style={styles.container}>
            <Text style={styles.label}>Type something below:</Text>
            <ExpoSpellcheckerView
              keyboardType="emailAddress" // Change to "emailAddress", "numberPad", etc. to test different types
              spellCheckingType={true} // Enable spell checking
              autocorrectionType={false} // Enable autocorrection
              hidden={true} // Set to true to hide the keyboard
              style={styles.view}
            />
          </View>
        </Group> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    padding: 20,
  },
  container: { flex: 1, flexGrow: 1, padding: 16, backgroundColor: "#fff" },
  view: {
    flex: 1,
    height: 200,
  },
  input: {
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  suggestionsContainer: { marginTop: 16 },
  suggestionsTitle: { fontSize: 16, fontWeight: "bold" },
  suggestion: { fontSize: 14, color: "blue" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  outputContainer: {
    flex: 1,
    flexGrow: 1,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    borderRadius: 4,
    maxHeight: "50%",
  },
  output: {
    flex: 1,
    flexGrow: 1,
    fontSize: 14,
    color: "black",
  },
};
