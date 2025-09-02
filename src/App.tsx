import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  type: "question" | "answer";
  content: string;
}

export default function App() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  async function generateAnswer(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion("");

    setChatHistory((prev) => [
      ...prev,
      { type: "question", content: currentQuestion },
    ]);

    try {
      const apiKey = import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT;
      if (!apiKey) throw new Error("API key missing in .env file");

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: currentQuestion }] }],
        }
      );

      const aiResponse =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response.";
      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: aiResponse },
      ]);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "answer",
          content:
            "❌ Something went wrong. Please check your API key or try again.",
        },
      ]);
    }

    setGeneratingAnswer(false);
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-tr from-indigo-50 to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-purple-700 text-center">
          🤖 Chat AI Gemini
        </h1>
      </header>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50"
      >
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-20">
            <p className="text-lg font-medium mb-2">Welcome! 👋</p>
            <p className="text-sm text-center max-w-md">
              Ask me anything and I’ll try to answer. Start by typing below.
            </p>
          </div>
        )}

        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${
              chat.type === "question" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-md break-words ${
                chat.type === "question"
                  ? "bg-purple-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              <ReactMarkdown>{chat.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {generatingAnswer && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-md animate-pulse">
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={generateAnswer}
        className="bg-white shadow-inner p-4 flex items-center gap-3 sticky bottom-0 z-10"
      >
        <textarea
          required
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          value={question}
          placeholder="Type your question..."
          rows={1}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              generateAnswer(e as unknown as FormEvent);
            }
          }}
        />
        <button
          type="submit"
          disabled={generatingAnswer}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            generatingAnswer
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
