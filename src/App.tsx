import { useState, useCallback, useRef } from "react";
import {
  Loader2,
  Play,
  RotateCcw,
  Clapperboard,
  Film,
  Code,
  Calendar,
  Hash,
} from "lucide-react";

export default function App() {
  const [showName, setShowName] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [generatedScene, setGeneratedScene] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The Safety Lock: This persist across renders and prevents double-firineeeeeeeeeeeeeeg
  const isRequesting = useRef(false);

  const generateScript = useCallback(async () => {
    // GUARD 1: Prevent multiple clicks and ensure ingredients exist
    if (isRequesting.current) return;

    // Set the lock
    isRequesting.current = true;
    setIsGenerating(true);
    setError(null);

    const prompt = `You are a dramatic screenwriter. You will retell exactly what the provided code does as a scene from the requested show.

Rules:
- Use the actual characters, tone, and dialogue style from that movie/show.
- Every variable and function is played by a character or a physical object.
- The bug is the antagonist.
- Stay in character the entire time — no breaking the fourth wall.
- Write it as an actual script excerpt with scene direction and dialogue.
- CRITICAL: Whenever you mention a specific variable name, function, or line of code from the input, wrap it in backticks (e.g. \`variableName\`).
- End with what happens in the next scene (cliffhanger). 
Format the script clearly. Use uppercase for character names. Do not use <center> tags; simply place character names on their own line.

Retell this code as a scene from "${showName}":\n\n${codeSnippet} IMPORTANT: Output ONLY the script. No intro or outro text. Use standard screenplay format with Character names in **BOLD**.`;

    try {
      const response = await fetch(`/.netlify/functions/gemini-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (response.status === 429) {
        throw new Error(
          "Rate limit reached. Please wait a moment before trying again.",
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || "Failed to generate scene.",
        );
      }

      const data = await response.json();
      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No content generated";
      setGeneratedScene(generatedText);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      // Release the lock and stop loading
      setIsGenerating(false);
      isRequesting.current = false;
    }
  }, [showName, codeSnippet]);

  const renderFormattedScript = (text: string) => {
    if (!text) return null;

    // 1. First, let's clean up the text a bit
    const lines = text.split("\n");

    return lines.map((line, index) => {
      // A function to handle the yellow code highlighting within any line
      const highlightCode = (content: string) => {
        const parts = content.split(/(`[^`]+`)/g);
        return parts.map((part, i) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <span key={i} className="code-highlight">
                {part.slice(1, -1)}
              </span>
            );
          }
          return part;
        });
      };

      // ACTION: Handle <center> tags (Usually character names)
      if (line.includes("<center>")) {
        const name = line.replace(/<\/?center>/g, "");
        return (
          <div
            key={index}
            className="text-center font-bold mt-6 mb-1 uppercase tracking-widest text-black"
          >
            {name}
          </div>
        );
      }

      // ACTION: Handle Scene Headings (INT. or EXT.)
      if (line.startsWith("INT.") || line.startsWith("EXT.")) {
        return (
          <div
            key={index}
            className="font-bold uppercase mt-8 mb-4 border-b border-neutral-200 pb-1"
          >
            {line}
          </div>
        );
      }

      // DEFAULT: Regular action lines / descriptions
      return (
        <div key={index} className="mb-3 text-neutral-700">
          {highlightCode(line)}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-500">
      {!generatedScene ? (
        <div className="w-full max-w-2xl transform transition-all duration-700 ease-out">
          <div className="bg-[#111] rounded-xl shadow-2xl overflow-hidden border-8 border-[#111] relative">
            <div
              className={`h-16 bg-[#111] border-b-4 border-white flex items-center justify-around transition-transform duration-300 origin-left ${isGenerating ? "-rotate-12 -translate-y-2.5" : ""}`}
            >
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`h-full w-12 bg-white transform -skew-x-25 ${i % 2 === 0 ? "opacity-100" : "opacity-0"}`}
                />
              ))}
            </div>

            <div className="p-8 text-white space-y-8 font-bold tracking-widest relative">
              <div className="text-center border-b-2 border-white pb-4">
                <h1 className="text-5xl tracking-[0.2em]">HOLLYWOOD</h1>
              </div>

              <div className="grid grid-cols-1 gap-8 text-lg">
                <div className="flex items-end border-b-2 border-neutral-700 pb-1 group focus-within:border-white transition-colors">
                  <span className="mr-4 text-neutral-400 shrink-0 flex items-center gap-2 uppercase text-sm">
                    <Film size={16} /> Production
                  </span>
                  <input
                    type="text"
                    value={showName}
                    onChange={(e) => setShowName(e.target.value)}
                    placeholder="E.g. The Office"
                    className="bg-transparent border-none outline-none w-full text-3xl font-chalk text-yellow-100 placeholder-neutral-700"
                  />
                </div>

                <div className="flex flex-col border-b-2 border-neutral-700 pb-2 group focus-within:border-white transition-colors">
                  <span className="mb-2 text-neutral-400 flex items-center gap-2 uppercase text-sm">
                    <Code size={16} /> Scene (Script Logic)
                  </span>
                  <textarea
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="Paste the code you want explained..."
                    className="bg-transparent border-none outline-none w-full h-40 text-2xl font-chalk text-yellow-100 resize-none placeholder-neutral-700 leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="border-b-2 border-neutral-700 flex flex-col">
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Calendar size={12} /> DATE
                  </span>
                  <span className="font-chalk text-2xl text-yellow-100">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="border-b-2 border-neutral-700 flex flex-col">
                  <span className="text-xs text-neutral-400 flex items-center gap-1 uppercase">
                    <Clapperboard size={12} /> Scene
                  </span>
                  <span className="font-chalk text-2xl text-yellow-100">1</span>
                </div>
                <div className="border-b-2 border-neutral-700 flex flex-col">
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Hash size={12} /> TAKE
                  </span>
                  <span className="font-chalk text-2xl text-yellow-100">A</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={generateScript}
            disabled={!showName || !codeSnippet || isGenerating}
            className={`mt-10 w-full py-6 rounded-full flex items-center justify-center gap-4 text-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50
              ${isGenerating ? "bg-yellow-500 text-black" : "bg-black text-white hover:bg-neutral-800"}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" /> Filming...
              </>
            ) : (
              <>
                <Play fill="currentColor" /> Action!
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 text-center text-red-600 font-bold animate-pulse">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white min-h-[80vh] p-8 md:p-16 shadow-2xl border border-neutral-200 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="max-w-prose mx-auto">
            <div className="flex justify-between items-center mb-12 border-b-4 border-black pb-4">
              <div>
                <h2 className="text-xs font-black uppercase mb-1 text-neutral-400 tracking-widest">
                  Production Title
                </h2>
                <p className="font-script text-2xl font-bold">{showName}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xs font-black uppercase mb-1 text-neutral-400 tracking-widest">
                  Script Review
                </h2>
                <p className="font-script text-xl text-green-600 font-bold uppercase">
                  Ready for Shoot
                </p>
              </div>
            </div>

            <div className="font-script text-lg leading-relaxed whitespace-pre-wrap text-neutral-800">
              {renderFormattedScript(generatedScene)}
            </div>

            <div className="mt-20 flex flex-col items-center gap-6">
              <div className="h-1 w-full bg-neutral-100" />
              <button
                onClick={() => {
                  setShowName("");
                  setCodeSnippet("");
                  setGeneratedScene("");
                  setError(null);
                }}
                className="group flex items-center gap-3 text-neutral-400 hover:text-black transition-colors font-bold uppercase tracking-widest text-sm"
              >
                <RotateCcw
                  size={18}
                  className="group-hover:-rotate-90 transition-transform duration-500"
                />
                Reset for Next Take
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
