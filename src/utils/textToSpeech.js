

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;
const isElevenLabsConfigured =
  ELEVENLABS_API_KEY &&
  ELEVENLABS_API_KEY !== "your_elevenlabs_api_key_here" &&
  VOICE_ID &&
  VOICE_ID !== "your_elevenlabs_voice_id_here";
let currentAudio = null;



async function speakWithElevenLabs(text) {
  stopSpeaking(); // cancel any current audio

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err?.detail?.message || `ElevenLabs API error: ${response.status}`
      );
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    currentAudio = new Audio(url);
    
    return new Promise((resolve, reject) => {
      currentAudio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        resolve();
      };
      currentAudio.onerror = (e) => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        reject(new Error("Audio playback failed"));
      };
      currentAudio.play().catch(reject);
    });
  } catch (error) {
    console.error("ElevenLabs Error:", error);
    throw error;
  }
}

function speakWithWebSpeech(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
 
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                           voices.find(v => v.lang.startsWith('en')) || 
                           voices[0];
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

function stopWebSpeech() {
  window.speechSynthesis?.cancel();
}

export async function speakText(text) {
  if (!text) return;

  if (isElevenLabsConfigured) {
    try {
      await speakWithElevenLabs(text);
      return;
    } catch (error) {
      console.warn("ElevenLabs failed, falling back to Web Speech:", error);
    }
  }
  await speakWithWebSpeech(text);
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  stopWebSpeech();
}
