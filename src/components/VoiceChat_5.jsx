import React, { useState, useEffect } from "react";
import useSpeechToText_5 from "../hooks/useSpeechToText_5";
import { sendMessageToAI } from "../services/aiService_5";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, MessageSquare, AlertCircle, BrainCircuit } from "lucide-react";

const VoiceChat_5 = () => {
  const { isListening, transcript, startListening, stopListening, error: speechError } = useSpeechToText_5();
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    if (!isListening && transcript && !isLoading) {
      handleSendToAI(transcript);
    }
  }, [isListening, transcript]);

  const handleSendToAI = async (text) => {
    setIsLoading(true);
    setChatError("");
    try {
      const response = await sendMessageToAI(text);
      if (response.success) {
        setAiResponse(response.data);
      } else {
        setChatError(response.message || "Failed to get AI response");
      }
    } catch (err) {
      setChatError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setAiResponse("");
      setChatError("");
      startListening();
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-0.5 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
      <div className="bg-white dark:bg-zinc-950 rounded-[2.4rem] p-8 md:p-12 space-y-10 backdrop-blur-3xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-8">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              EduMentor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Voice AI</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Your personal tutor, powered by Gemini 1.5</p>
          </div>

          {isListening && (
            <div className="flex items-center gap-3 px-4 py-2 bg-red-50 dark:bg-red-900/10 rounded-full border border-red-100 dark:border-red-900/20 animate-pulse">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Listening</span>
            </div>
          )}
        </div>

        {/* Mic Control Section */}
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          <div className="relative group">
            {/* Pulse effect when listening */}
            {isListening && (
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150 -z-10"></div>
            )}
            
            <Button
              onClick={handleToggleListening}
              variant={isListening ? "destructive" : "default"}
              className={`w-28 h-28 rounded-full shadow-2xl transition-all duration-300 transform ${
                isListening ? "scale-110 rotate-12" : "hover:scale-105 hover:-rotate-6"
              } ${!isListening ? "bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800" : ""}`}
              disabled={isLoading}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </Button>
          </div>
          
          <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium animate-bounce">
            {isListening ? "I'm listening... click to stop" : "Tap the mic to start your lesson"}
          </p>
        </div>

        {/* Content Section */}
        <div className="grid gap-6">
          {/* Transcript card */}
          {(transcript || isListening) && (
            <div className="group p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 transition-all hover:border-blue-200 dark:hover:border-blue-900/30">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">
                <div className="w-1 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
                Your Voice
              </div>
              <p className="text-xl text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed italic">
                {transcript || "I'm waiting to hear your question..."}
              </p>
            </div>
          )}

          {/* AI Response Card */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 bg-blue-50/30 dark:bg-blue-900/5 rounded-3xl border border-dashed border-blue-200 dark:border-blue-900/30">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-blue-600 dark:text-blue-400 font-bold animate-pulse">Consulting the knowledge base...</p>
            </div>
          )}

          {aiResponse && !isLoading && (
            <div className="p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-20 h-20 text-blue-600" />
              </div>
              
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                Mentor Response
              </div>
              
              <div className="text-lg text-zinc-800 dark:text-zinc-100 leading-relaxed space-y-4">
                {aiResponse.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Error messages */}
          {(speechError || chatError) && (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 flex items-start gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-red-600 dark:text-red-400">Something went wrong</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">{speechError || chatError}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChat_5;
