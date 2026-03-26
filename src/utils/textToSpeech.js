/**
 * Text-to-Speech utility
 *
 * Primary: ElevenLabs REST API (when VITE_ELEVENLABS_API_KEY + VITE_ELEVENLABS_VOICE_ID are set)
 * Fallback: browser Web Speech API (works with no configuration)
 */

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

// Consider ElevenLabs configured only when real values are present
const isElevenLabsConfigured =
  ELEVENLABS_API_KEY &&
  ELEVENLABS_API_KEY !== "your_elevenlabs_api_key_here" &&
  VOICE_ID &&
  VOICE_ID !== "your_elevenlabs_voice_id_here";

// Holds the current audio object (ElevenLabs path)
let currentAudio = null;

// ─── ElevenLabs path ────────────────────────────────────────────────────────

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

// ─── Web Speech API fallback ─────────────────────────────────────────────────

function speakWithWebSpeech(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to select a good voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer English voices, ideally natural sounding ones
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                           voices.find(v => v.lang.startsWith('en')) || 
                           voices[0];
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // Resolve even on error to unblock UI

    window.speechSynthesis.speak(utterance);
  });
}

function stopWebSpeech() {
  window.speechSynthesis?.cancel();
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Speaks the given text.
 * Uses ElevenLabs when configured, otherwise the browser Web Speech API.
 * Falls back to Web Speech if ElevenLabs fails.
 * @param {string} text
 */
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

  // Fallback or if not configured
  await speakWithWebSpeech(text);
}

/**
 * Stops any currently playing speech.
 */
export function stopSpeaking() {
  // ElevenLabs audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  // Web Speech API
  stopWebSpeech();
}
