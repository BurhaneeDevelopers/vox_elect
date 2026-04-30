# VoxElect Voice UX Specification

## Overview

VoxElect supports voice input (speech-to-text) and voice output (text-to-speech) using browser-native APIs with graceful fallbacks. Voice features are progressive enhancements — the app works fully without them.

---

## Voice Input (Speech-to-Text)

### Technology
- **Primary:** Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Fallback:** Display text input only if unsupported

### Browser Support
| Browser | Support |
|---|---|
| Chrome 33+ | ✅ Full support |
| Edge 79+ | ✅ Full support |
| Firefox | ❌ Not supported (show fallback) |
| Safari 14.1+ | ⚠️ Partial (webkitSpeechRecognition) |
| Mobile Chrome | ✅ Supported |
| Mobile Safari | ⚠️ Requires user gesture |

### Input Modes

**Push-to-Talk:**
- User holds mic button → recording active → release → auto-transcribe + send
- Waveform animation plays while holding

**Toggle Mode:**
- Click mic → toggle on → continuous listening → click again or silence timeout → send
- 3-second silence timeout triggers automatic send

### UX States
1. **Idle:** Mic button at rest (gray)
2. **Listening:** Mic button pulses green; expanding waveform rings
3. **Processing:** Spinner animation; transcription preview shown
4. **Error:** Mic button turns amber; tooltip with error message

### Graceful Degradation
```
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
  // Hide mic button
  // Show tooltip: "Voice input not supported in this browser. Try Chrome."
}
```

---

## Voice Output (Text-to-Speech)

### Technology
- **Primary:** ElevenLabs API (when `ELEVENLABS_API_KEY` set) — streaming audio
- **Fallback:** Web Speech Synthesis API (`window.speechSynthesis`)
- **Secondary Fallback:** Silent mode (text only)

### ElevenLabs Configuration
- **Voice ID:** Configurable via `ELEVENLABS_VOICE_ID` env var
- **Model:** `eleven_turbo_v2` for low latency
- **Streaming:** Use chunked streaming for long responses

### Speech Synthesis Fallback
```typescript
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 0.9;
utterance.pitch = 1.0;
utterance.volume = 1.0;
// Prefer a female voice if available
const voices = window.speechSynthesis.getVoices();
utterance.voice = voices.find(v => v.name.includes('Female')) ?? voices[0];
```

### TTS Behavior
- Speaks Elara's responses automatically (configurable, default ON)
- User can mute TTS via speaker button in header
- TTS pauses if user starts typing
- Long responses split at paragraph boundaries for smoother playback

---

## Waveform Animation Spec

### Listening Waveform
- 5 vertical bars with randomized height animation
- Color: `#2D5016` (forest green)
- Animation: sine-wave motion using CSS keyframes
- Duration: loops while listening

### Speaking Waveform
- Radiating rings from Elara avatar
- Color: `#C9A84C` (gold)
- Scale: rings expand from 1.0 to 1.8, fade out
- Duration: 1.2s loop while TTS playing

---

## Accessibility

- All voice controls have `aria-label` attributes
- Visual-only fallback always available
- Keyboard shortcut: `Ctrl+Shift+M` to toggle mic
- Screen reader announcements for voice state changes
- Never auto-start voice without user interaction (browser security + UX)
