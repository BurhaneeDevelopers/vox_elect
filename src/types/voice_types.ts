// Voice feature types for VoxElect

export type voice_state = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export type voice_mode = 'push_to_talk' | 'toggle';

export interface voice_recognition_result {
  transcript: string;
  confidence: number;
  is_final: boolean;
}

export interface voice_config {
  mode: voice_mode;
  language: string;
  continuous: boolean;
  interim_results: boolean;
  tts_enabled: boolean;
  tts_rate: number;
  tts_pitch: number;
  tts_volume: number;
}

export interface voice_support_info {
  speech_recognition_supported: boolean;
  speech_synthesis_supported: boolean;
  available_voices: SpeechSynthesisVoice[];
}
