import { transliterate } from "transliteration";

const speakOut = async (text: string, lang?: string) => {
  console.log("%c Hello", "color: blue;");
  let speech = new SpeechSynthesisUtterance();

  speech.lang = "hi-IN";
  let englishText = transliterate(text);
  speech.text = englishText;
  speechSynthesis.speak(speech);
};
export default speakOut;
