import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';

interface AudioRecorderProps {
  onTranscript: (text: string) => void;
}

export default function AudioRecorder({ onTranscript }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const newTranscript = transcript + finalTranscript;
      if (finalTranscript) {
        setTranscript(newTranscript);
        onTranscript(newTranscript);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch {}
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
        <MicOff size={14} />
        <span>Audio not supported in this browser (try Chrome)</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={toggleRecording}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          isRecording
            ? 'bg-red-500 text-white shadow-lg shadow-red-200'
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
        }`}
      >
        {isRecording ? (
          <>
            <Square size={16} />
            Stop Recording
          </>
        ) : (
          <>
            <Mic size={16} />
            Record Voice Note
          </>
        )}
      </button>
      {isRecording && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <span className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
          Listening...
        </div>
      )}
    </div>
  );
}
