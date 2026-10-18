"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ChangeEvent } from "react";
import {
  IconPlus,
  IconAt,
  IconSliders,
  IconMic,
  IconSend,
  IconPaperclip,
} from "./docs-chat-icons";
import type { ChatAttachment } from "./docs-chat-types";

interface BrowserSpeechRecognitionResult {
  isFinal?: boolean;
  length: number;
  [index: number]: {
    transcript: string;
    confidence?: number;
  };
}

interface BrowserSpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: BrowserSpeechRecognitionResult;
  };
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface BrowserSpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart?: (() => void) | null;
  onresult?: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror?: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend?: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface CustomAudioWindow {
  SpeechRecognition?: new () => BrowserSpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognitionInstance;
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

interface DocsChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (prompt: string, attachments: ChatAttachment[]) => void;
  isLoading: boolean;
  selectedBookContext: string | null;
  onClearBookContext: () => void;
  onOpenAtModal: () => void;
  onOpenSettingsModal: () => void;
}

export function DocsChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  selectedBookContext,
  onClearBookContext,
  onOpenAtModal,
  onOpenSettingsModal,
}: DocsChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Références microphone natif et Web Audio
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognitionInstance | null>(null);
  const recordedMimeTypeRef = useRef<string>("audio/webm");
  const recordingIdRef = useRef<string>("");
  const isRecordingRef = useRef<boolean>(false);
  const speechActiveRef = useRef<boolean>(false);

  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);

  // États du studio vocal
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [audioLevels, setAudioLevels] = useState<number[]>([8, 14, 20, 12, 16, 10]);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Auto-ajustement de la hauteur du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [value]);

  // Fonction de libération complète du microphone
  const cleanupAudioResources = useCallback(() => {
    isRecordingRef.current = false;
    speechActiveRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
      mediaRecorderRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, [cleanupAudioResources]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachments.length > 0) && !isLoading) {
        onSubmit(value, attachments);
        setAttachments([]);
      }
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    if (val.endsWith("@")) {
      onOpenAtModal();
    }
  };

  // =========================================================================
  // 1. GESTION DES FICHIERS ET PHOTOS (PC & TÉLÉPHONE)
  // =========================================================================
  const handleOpenNativeFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith("image/");
      const reader = new FileReader();

      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        const newAttachment: ChatAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          dataUrl,
          isImage: isImg,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };

      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        // Pour les fichiers texte, code source ou documents
        reader.readAsDataURL(file);
      }
    });

    // Réinitialise l'input pour pouvoir sélectionner à nouveau le même fichier si besoin
    e.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // =========================================================================
  // 2. ENREGISTREUR MICROPHONE DU NAVIGATEUR (Expérience vocale fluide comme ChatGPT)
  // =========================================================================
  const handleStartAudioRecording = useCallback(async () => {
    if (typeof window === "undefined") return;

    setRecordingError(null);

    // Vérification du contexte sécurisé (HTTPS ou localhost obligatoire dans les navigateurs modernes)
    if (
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setRecordingError(
        "Le microphone requiert une connexion sécurisée (HTTPS ou localhost). Veuillez ouvrir l'application sur http://localhost."
      );
      return;
    }

    const customWin = window as unknown as CustomAudioWindow;
    const SpeechRec = customWin.SpeechRecognition || customWin.webkitSpeechRecognition;
    const hasMedia = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

    if (!hasMedia && !SpeechRec) {
      setRecordingError("Votre navigateur ne prend pas en charge l'enregistrement audio ou la dictée vocale.");
      return;
    }

    // 1. Activation immédiate du mode studio vocal (comme ChatGPT)
    setIsRecording(true);
    isRecordingRef.current = true;
    speechActiveRef.current = false;
    setRecordingSeconds(0);
    setLiveTranscript("");
    audioChunksRef.current = [];
    recordingIdRef.current = `audio_${Date.now()}`;

    // 2. Animation d'ondes sonores (démarrage immédiat avec ondes réactives et vivantes)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const updateWaves = () => {
      if (!isRecordingRef.current) return;

      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const levels: number[] = [];
        for (let b = 0; b < 6; b++) {
          const idx = Math.floor((b / 6) * dataArray.length);
          const val = dataArray[idx] || 0;
          const height = Math.max(6, Math.min(30, Math.round((val / 255) * 30) + 6));
          levels.push(height);
        }
        setAudioLevels(levels);
      } else {
        // Ondes organiques dynamiques vivantes (style ChatGPT standby)
        const t = Date.now() / 180;
        const simulated = [
          Math.round(8 + Math.sin(t) * 5),
          Math.round(15 + Math.cos(t * 1.2) * 7),
          Math.round(22 + Math.sin(t * 0.9) * 8),
          Math.round(17 + Math.cos(t * 1.1) * 7),
          Math.round(13 + Math.sin(t * 1.3) * 6),
          Math.round(8 + Math.cos(t * 0.8) * 4),
        ];
        setAudioLevels(simulated);
      }

      animationFrameRef.current = requestAnimationFrame(updateWaves);
    };
    animationFrameRef.current = requestAnimationFrame(updateWaves);

    // 3. Lancement du chronomètre
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // 4. Moteur de dictée vocale natif du navigateur (Web Speech API - identique à ChatGPT)
    let recognitionStarted = false;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognitionRef.current = recognition;
        recognition.lang =
          typeof navigator !== "undefined" && navigator.language
            ? navigator.language
            : "fr-FR";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          speechActiveRef.current = true;
        };

        recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
          speechActiveRef.current = true;
          let finalStr = "";
          let interimStr = "";
          for (let i = 0; i < event.results.length; i++) {
            const item = event.results[i];
            if (item && item[0]) {
              if (item.isFinal) {
                finalStr += item[0].transcript + " ";
              } else {
                interimStr += item[0].transcript;
              }
            }
          }
          const combined = (finalStr + interimStr).trim();
          if (combined) {
            setLiveTranscript(combined);
          }
        };

        recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
          console.warn("Speech recognition notice:", event?.error);
          if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
            speechActiveRef.current = false;
            // Si le flux MediaRecorder n'est pas actif non plus, on avertit l'utilisateur
            if (!mediaStreamRef.current) {
              setIsRecording(false);
              isRecordingRef.current = false;
              cleanupAudioResources();
              setRecordingError(
                "Microphone bloqué : Cliquez sur l'icône de cadenas ou de réglages (🔒 ou 🎛️) dans la barre d'adresse de votre navigateur pour autoriser le microphone, puis cliquez sur Réessayer."
              );
            }
          }
        };

        recognition.onend = () => {
          // Relance automatique pour rester à l'écoute tant que l'utilisateur est en mode dictée
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Ignore si déjà démarré
            }
          }
        };

        recognition.start();
        recognitionStarted = true;
      } catch (recStartErr) {
        console.warn("Speech recognition start non critique:", recStartErr);
      }
    }

    // 5. Moteur de capture audio MediaStream (asynchrone, non bloquant)
    if (hasMedia && navigator.mediaDevices?.getUserMedia) {
      try {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            if (!isRecordingRef.current) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            mediaStreamRef.current = stream;

            // MediaRecorder pour créer l'audio téléchargeable / joint
            if (typeof MediaRecorder !== "undefined") {
              const candidates = [
                "audio/webm;codecs=opus",
                "audio/webm",
                "audio/mp4",
                "audio/ogg;codecs=opus",
                "audio/aac",
              ];
              let mime = "";
              for (const cand of candidates) {
                if (MediaRecorder.isTypeSupported(cand)) {
                  mime = cand;
                  break;
                }
              }
              recordedMimeTypeRef.current = mime || "audio/webm";

              try {
                const recorder = mime
                  ? new MediaRecorder(stream, { mimeType: mime })
                  : new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (event) => {
                  if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                  }
                };
                recorder.start(250);
              } catch (recErr) {
                console.warn("MediaRecorder start non critique:", recErr);
              }
            }

            // Web Audio API : Visualiseur de volume sonore réel
            try {
              const AudioCtx = customWin.AudioContext || customWin.webkitAudioContext;
              if (AudioCtx) {
                const audioCtx = new AudioCtx();
                audioContextRef.current = audioCtx;
                const source = audioCtx.createMediaStreamSource(stream);
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 64;
                analyser.smoothingTimeConstant = 0.75;
                source.connect(analyser);
                analyserRef.current = analyser;
              }
            } catch (audioErr) {
              console.warn("AudioContext non critique:", audioErr);
            }
          })
          .catch((streamErr: unknown) => {
            console.warn("getUserMedia non bloquant:", streamErr);
            const isDenied =
              streamErr instanceof Error &&
              (streamErr.name === "NotAllowedError" ||
                streamErr.name === "PermissionDeniedError");

            // Si la reconnaissance vocale n'a pas pu démarrer non plus et que l'autorisation est refusée :
            if (!recognitionStarted && isDenied) {
              setIsRecording(false);
              isRecordingRef.current = false;
              cleanupAudioResources();
              setRecordingError(
                "Microphone bloqué : Cliquez sur l'icône de cadenas ou de réglages (🔒 ou 🎛️) dans la barre d'adresse de votre navigateur pour autoriser le microphone, puis cliquez sur Réessayer."
              );
            }
          });
      } catch (streamInitErr) {
        console.warn("Erreur d'initialisation getUserMedia:", streamInitErr);
      }
    }
  }, [cleanupAudioResources]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Arrêt et insertion du texte transcrit / audio dans le champ de texte
  const handleStopAndApplyRecording = useCallback(() => {
    isRecordingRef.current = false;
    cleanupAudioResources();
    setIsRecording(false);

    if (liveTranscript.trim()) {
      onChange(value ? `${value} ${liveTranscript}` : liveTranscript);
    }

    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, {
        type: recordedMimeTypeRef.current || "audio/webm",
      });
      if (blob.size > 0) {
        const audioUrl = URL.createObjectURL(blob);
        const currentId = recordingIdRef.current || `audio_${recordingSeconds}s`;
        const audioAttachment: ChatAttachment = {
          id: currentId,
          name: `Audio enregistré (${formatTime(recordingSeconds)}).webm`,
          size: blob.size,
          type: recordedMimeTypeRef.current || "audio/webm",
          dataUrl: audioUrl,
          isImage: false,
        };
        setAttachments((prev) => [...prev, audioAttachment]);
      }
    } else if (!liveTranscript.trim()) {
      const defaultVoiceNote = `[Note Vocale enregistrée : ${formatTime(recordingSeconds)}]`;
      onChange(value ? `${value} ${defaultVoiceNote}` : defaultVoiceNote);
    }
  }, [cleanupAudioResources, liveTranscript, onChange, value, recordingSeconds]);

  // Arrêt et envoi direct au chatbot (comme ChatGPT)
  const handleStopAndSendRecording = useCallback(() => {
    isRecordingRef.current = false;
    cleanupAudioResources();
    setIsRecording(false);

    let promptToSend = value;
    if (liveTranscript.trim()) {
      promptToSend = value ? `${value} ${liveTranscript}` : liveTranscript;
    }

    const newAttachments = [...attachments];
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, {
        type: recordedMimeTypeRef.current || "audio/webm",
      });
      if (blob.size > 0) {
        const audioUrl = URL.createObjectURL(blob);
        const currentId = recordingIdRef.current || `audio_${recordingSeconds}s`;
        const audioAttachment: ChatAttachment = {
          id: currentId,
          name: `Message vocal (${formatTime(recordingSeconds)}).webm`,
          size: blob.size,
          type: recordedMimeTypeRef.current || "audio/webm",
          dataUrl: audioUrl,
          isImage: false,
        };
        newAttachments.push(audioAttachment);
      }
    }

    if (promptToSend.trim() || newAttachments.length > 0) {
      onSubmit(promptToSend, newAttachments);
      onChange("");
      setAttachments([]);
    }
  }, [cleanupAudioResources, value, liveTranscript, attachments, onSubmit, onChange, recordingSeconds]);

  const handleCancelRecording = useCallback(() => {
    isRecordingRef.current = false;
    cleanupAudioResources();
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
    setLiveTranscript("");
  }, [cleanupAudioResources]);

  const hasContent = value.trim().length > 0 || attachments.length > 0;

  return (
    <div ref={containerRef} className="docs-chat-input-card">
      {/* Alerte d'autorisation du microphone si nécessaire */}
      {recordingError && (
        <div className="docs-chat-mic-error-banner">
          <div className="docs-chat-mic-error-text">
            <span>⚠️ {recordingError}</span>
          </div>
          <div className="docs-chat-mic-error-actions">
            <button
              type="button"
              onClick={handleStartAudioRecording}
              className="docs-chat-mic-error-retry"
              title="Réessayer d'ouvrir le microphone"
            >
              🔄 Réessayer
            </button>
            <button
              type="button"
              onClick={() => setRecordingError(null)}
              className="docs-chat-mic-error-close"
              aria-label="Fermer l'alerte"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input de sélection native de fichiers et photos (PC / Téléphone) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.c,.php,.js,.ts,.json,.py,.doc,.docx"
        onChange={handleFilesSelected}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {/* Badges de contexte (si un livre est attaché) */}
      {selectedBookContext && (
        <div className="docs-chat-context-bar">
          <span className="docs-chat-context-tag">
            <span>📚 Contexte : {selectedBookContext}</span>
            <button
              type="button"
              className="docs-chat-context-close"
              onClick={onClearBookContext}
              aria-label="Retirer ce livre"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Prévisualisation des photos et fichiers joints (PC & Smartphone) */}
      {attachments.length > 0 && (
        <div className="docs-chat-attachment-bar">
          {attachments.map((att) => (
            <div key={att.id} className="docs-chat-attachment-pill">
              {att.isImage ? (
                /* Miniature photo */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="docs-chat-attachment-thumb"
                />
              ) : (
                <IconPaperclip />
              )}
              <span className="docs-chat-attachment-name" title={att.name}>
                {att.name}
              </span>
              <span className="docs-chat-attachment-size">
                ({(att.size / 1024).toFixed(0)} Ko)
              </span>
              <button
                type="button"
                className="docs-chat-attachment-del"
                onClick={() => handleRemoveAttachment(att.id)}
                aria-label={`Supprimer ${att.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================
          MODE NORMAL : Zone de texte
          =================================================================== */}
      {!isRecording ? (
        <div className="docs-chat-textarea-wrap">
          <textarea
            ref={textareaRef}
            rows={1}
            className="docs-chat-textarea"
            placeholder="Commencer un nouveau chat"
            value={value}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </div>
      ) : (
        /* ===================================================================
           MODE ENREGISTREUR AUDIO : Studio vocal ChatGPT avec orbe, visualiseur et transcription
           =================================================================== */
        <div className="docs-chat-audio-studio docs-chat-chatgpt-voice">
          <div className="docs-chat-voice-orb-wrap">
            <div className="docs-chat-voice-orb" />
            <div className="docs-chat-voice-ripple" />
          </div>

          <div className="docs-chat-audio-info">
            <div className="docs-chat-audio-status-line">
              <span className="docs-chat-rec-indicator" />
              <span className="docs-chat-rec-timer">{formatTime(recordingSeconds)}</span>
              <span className="docs-chat-rec-badge">Microphone actif</span>
            </div>

            {/* Visualiseur d'ondes sonores interactives réagissant au volume réel */}
            <div className="docs-chat-soundwaves">
              {audioLevels.map((lvl, idx) => (
                <span
                  key={idx}
                  className="docs-chat-wave-bar is-active"
                  style={{ height: `${lvl}px` }}
                />
              ))}
            </div>

            <div className="docs-chat-rec-transcript">
              {liveTranscript ? (
                <span className="docs-chat-live-text">« {liveTranscript} »</span>
              ) : (
                <span className="docs-chat-listening-placeholder">
                  DOCS SHOW vous écoute... Parlez dans votre microphone
                </span>
              )}
            </div>
          </div>

          <div className="docs-chat-audio-actions">
            <button
              type="button"
              className="docs-chat-audio-btn docs-chat-audio-cancel"
              onClick={handleCancelRecording}
              aria-label="Annuler l'enregistrement vocal"
              title="Annuler l'écoute"
            >
              <span>✕ Annuler</span>
            </button>
            <button
              type="button"
              className="docs-chat-audio-btn docs-chat-audio-insert"
              onClick={handleStopAndApplyRecording}
              aria-label="Insérer la transcription dans le texte"
              title="Insérer le texte dans la discussion"
            >
              <span>✓ Insérer</span>
            </button>
            <button
              type="button"
              className="docs-chat-audio-btn docs-chat-audio-send"
              onClick={handleStopAndSendRecording}
              aria-label="Envoyer directement au chatbot"
              title="Envoyer immédiatement (comme ChatGPT)"
            >
              <IconSend />
              <span>Envoyer</span>
            </button>
          </div>
        </div>
      )}

      {/* Barre d'actions inférieure */}
      {!isRecording && (
        <div className="docs-chat-actions-row">
          {/* Actions gauches : + (Fichiers & Photos), @ (Débat/Chatbot), Paramètres */}
          <div className="docs-chat-actions-left">
            {/* BOUTON + : Ouvre directement l'explorateur de fichiers / photos du PC ou téléphone */}
            <button
              type="button"
              className="docs-chat-icon-btn"
              onClick={handleOpenNativeFilePicker}
              aria-label="Prendre des photos ou joindre des fichiers de votre appareil"
            >
              <IconPlus />
            </button>

            {/* Bouton @ : Mention de chatbot ou tuteur conforme */}
            <button
              type="button"
              className="docs-chat-icon-btn"
              onClick={onOpenAtModal}
              aria-label="Mentionner un chatbot ou tuteur spécialisé"
            >
              <IconAt />
            </button>

            {/* Bouton Sliders : Paramètres IA conforme */}
            <button
              type="button"
              className="docs-chat-icon-btn"
              onClick={onOpenSettingsModal}
              aria-label="Paramètres de génération et précision"
            >
              <IconSliders />
            </button>
          </div>

          {/* Actions droites : Micro (Enregistreur Audio) et Envoi */}
          <div className="docs-chat-actions-right">
            {/* BOUTON MICRO : Ouvre directement le microphone du navigateur (Style ChatGPT) */}
            <button
              type="button"
              className="docs-chat-icon-btn"
              onClick={handleStartAudioRecording}
              aria-label="Ouvrir le microphone et enregistrer l'audio"
              title="Enregistrer l'audio (Microphone du navigateur)"
            >
              <IconMic />
            </button>

            {/* Bouton d'envoi */}
            <button
              type="button"
              className={`docs-chat-send-btn${hasContent ? " has-content" : ""}`}
              onClick={() => {
                if (hasContent && !isLoading) {
                  onSubmit(value, attachments);
                  setAttachments([]);
                }
              }}
              disabled={!hasContent || isLoading}
              aria-label="Envoyer le message"
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
