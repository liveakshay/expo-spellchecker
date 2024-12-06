import { useEvent } from "expo";
import ExpoSpellchecker, { ExpoSpellcheckerView } from "expo-spellchecker";
import { useEffect, useState } from "react";
import {
  Button,
  Keyboard,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function App() {
  useEffect(() => {
    // Add listener for "keyboardWillShow"
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      () => {
        Keyboard.dismiss(); // Dismiss the keyboard when it is about to show
        console.log("Keyboard will show, dismissed it!");
      }
    );

    // Clean up the listener on component unmount
    return () => {
      keyboardWillShowListener.remove();
    };
  }, []);

  const onChangePayload = useEvent(ExpoSpellchecker, "onChange");

  const [word, setWord] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [completions, setCompletions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // State to track loading status
  const [output, setOutput] = useState<string>("");

  const handleCheckSpelling = async () => {
    try {
      setLoading(true); // Show loading indicator
      const results = await ExpoSpellchecker.checkSpelling(word, "en"); // Async call to check spelling
      setSuggestions(results); // Update suggestions state
    } catch (error) {
      console.error("Error checking spelling:", error);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleAddWord = () => {
    setWord("Hte");
  };

  const handleGetCompletions = async () => {
    try {
      setLoading(true); // Show loading indicator
      const results = await ExpoSpellchecker.getCompletions(word, "en"); // Async call to check spelling
      setCompletions(results); // Update suggestions state
    } catch (error) {
      console.error("Error checking spelling:", error);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleLearnWord = async () => {
    try {
      console.log("handleLearnWord");
      await ExpoSpellchecker.learnWord(word); // Wait for the word to be learned
      const isLearned = await ExpoSpellchecker.hasLearnedWord(word); // Await the promise to get the boolean
      logOutput("hasLearnedWord: " + isLearned);
    } catch (error) {
      console.error("Error in handleLearnWord:", error);
    }
  };

  const handleUnlearnWord = async () => {
    try {
      console.log("handleUnlearnWord");
      await ExpoSpellchecker.unlearnWord(word); // Wait for the word to be unlearned
      const isLearned = await ExpoSpellchecker.hasLearnedWord(word); // Await the promise to get the boolean
      logOutput("hasLearnedWord: " + isLearned);
    } catch (error) {
      console.error("Error in handleUnlearnWord:", error);
    }
  };

  const handleIgnoreWord = async () => {
    try {
      console.log("handleIgnoreWord");
      await ExpoSpellchecker.ignoreWord(word); // Wait for the word to be ignored
      const ignoredWords = await ExpoSpellchecker.getIgnoredWords(); // Await the promise to get the string[]
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        <Group name="Constants">
          <Text>{ExpoSpellchecker.PI}</Text>
        </Group>
        <Group name="Functions">
          <Text>{ExpoSpellchecker.hello()}</Text>
        </Group>
        <Group name="Spell Checking">
          <View style={styles.container}>
            <TextInput
              style={styles.input}
              placeholder="Enter a word"
              value={word}
              onChangeText={setWord}
              showSoftInputOnFocus={false}
            />
            <Button
              title="Add Word"
              onPress={handleAddWord}
              disabled={!loading && word.trim() !== ""} // Disable button when loading or input is empty
            />
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
            <Text style={styles.title}>Other Functions</Text>
            <Button
              title="Get Available Languages"
              onPress={testAvailableLanguages}
            />
            <Button title="Learn Word" onPress={handleLearnWord} />
            <Button title="Unlearn Word" onPress={handleUnlearnWord} />
            <Button title="Ignore Word" onPress={handleIgnoreWord} />
          </View>
        </Group>

        <Group name="Output">
          <View style={styles.container}>
            <ScrollView
              style={styles.outputContainer}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flex: 1, height: 500 }}
            >
              <Text style={styles.output}>{output}</Text>
            </ScrollView>
          </View>
        </Group>

        <Group name="Async functions">
          <Button
            title="Set value"
            onPress={async () => {
              await ExpoSpellchecker.setValueAsync("Hello from JS!");
            }}
          />
        </Group>
        <Group name="Events">
          <Text>{onChangePayload?.value}</Text>
        </Group>
        <Group name="Views">
          <ExpoSpellcheckerView
            url="https://www.example.com"
            onLoad={({ nativeEvent: { url } }) => console.log(`Loaded: ${url}`)}
            style={styles.view}
          />
        </Group>
      </ScrollView>
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
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  container: { flex: 1, flexGrow: 1, padding: 16, backgroundColor: "#fff" },
  view: {
    flex: 1,
    height: 200,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
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
