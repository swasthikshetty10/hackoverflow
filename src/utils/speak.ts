import { transliterate } from 'transliteration';


const speakOut = async (text :string , lang? : string) => {
    let speech = new SpeechSynthesisUtterance();

    speech.lang = "hi-IN";
    let englishText = transliterate(text );
    speech.text = englishText;
    speechSynthesis.speak(speech);
}
export default speakOut;