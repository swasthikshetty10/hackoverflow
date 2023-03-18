import { transliterate } from "transliteration";

let lastSpokenText = "";

const speakOut = async (text: string, isEmpty: boolean, lang?: string) => {
  if (text === lastSpokenText) {
    console.log("Skipping speaking text again:", text);
    return;
  }

  if (isEmpty) lastSpokenText = "";

  console.log("speakOut function called with text:", text);

  let speech = new SpeechSynthesisUtterance();
  speech.lang = lang || "en-US";

  let englishText = transliterate(text);
  speech.text = englishText;

  console.log("SpeechSynthesisUtterance:", speech);
  speechSynthesis.speak(speech);

  lastSpokenText = text;
};

export default speakOut;
