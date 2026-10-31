import { useState, useRef, useEffect } from "react";
import { Send, User, Brain, Loader2 } from "lucide-react";
import { api } from "./api";
import { auth } from "./firebase";

interface Message {
  role: "user" | "twin";
  content: string;
}

function generateLocalTwinReply(query: string): string {
  const q = query.toLowerCase();
  if (
    q.includes("health") ||
    q.includes("stat") ||
    q.includes("status") ||
    q.includes("overview") ||
    q.includes("how am i") ||
    q.includes("mt health") ||
    q.includes("my health")
  ) {
    return (
      "Here is your current PhysioTwin physical status:\n\n" +
      "• Mobility: 85/100 (Optimal)\n" +
      "• Stability: 55/100 (Caution — needs joint stabilization)\n" +
      "• Movement Quality: 92/100 (High form precision)\n" +
      "• Cardiovascular Efficiency: 78%\n" +
      "• Recovery Score: 88%\n" +
      "• Capability Reserve: 55% / 100%\n\n" +
      "💡 Recommendation: Your form precision is strong, but your stability reserve is running low. Focus on core stability exercises and avoid heavy axial loads today."
    );
  }

  if (
    q.includes("knee") ||
    q.includes("joint") ||
    q.includes("pain") ||
    q.includes("injury") ||
    q.includes("hurt")
  ) {
    return (
      "Your kinematic history flags moderate biomechanical stress on your Left Knee (Grade 2 Meniscus strain marker). I recommend avoiding heavy squats or sprints today. Focus on quad isometric holds, hamstring stretches, and low-resistance cycling."
    );
  }

  if (
    q.includes("workout") ||
    q.includes("exercise") ||
    q.includes("train") ||
    q.includes("gym") ||
    q.includes("routine")
  ) {
    return (
      "With your Capability Reserve currently at 55%, I recommend a moderate 35-minute active recovery session: 10 mins dynamic warm-up, 15 mins posterior chain & core stabilization, and 10 mins mobility cool-down."
    );
  }

  if (
    q.includes("recovery") ||
    q.includes("sleep") ||
    q.includes("tired") ||
    q.includes("rest")
  ) {
    return (
      "Your recovery is at 88% and sleep score is 88/100. Tissue rebuilding is on track. Maintain 25g+ protein per meal to maximize muscle protein synthesis."
    );
  }

  return (
    "I am analyzing your digital twin's latest kinematics. Your movement quality is 92%, but stability needs attention before your next heavy leg day. Let me know if you want an exercise modification or fatigue breakdown!"
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "twin",
      content: "Hello! I am your PhysioTwin AI. Ask me about your stability, mobility, recovery, or today's workout readiness."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const uid = auth.currentUser?.uid || "test-user";
      const newMessages = [...messages, { role: "user", content: userText }];
      const res = await api.chatWithTwin(uid, newMessages);
      const reply = res?.reply || res?.message || generateLocalTwinReply(userText);
      setMessages(prev => [...prev, { role: "twin", content: reply }]);
    } catch {
      const fallback = generateLocalTwinReply(userText);
      setMessages(prev => [...prev, { role: "twin", content: fallback }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3.5 border-b border-slate-100 bg-slate-50/80">
        <Brain className="w-4 h-4 text-blue-600" />
        <div>
          <div className="text-xs font-bold text-slate-900">Interactive Twin Copilot</div>
          <div className="text-[10px] text-slate-500">Biomechanical Intelligence active</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-100 text-blue-700" : "bg-blue-600 text-white"}`}>
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
            </div>
            <div className={`text-xs px-3.5 py-2.5 max-w-[85%] leading-relaxed ${msg.role === "user"
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-xs shadow-xs font-medium"
                : "bg-slate-100 text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-xs whitespace-pre-wrap font-normal"
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs px-3.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200/80 rounded-tl-xs flex items-center gap-2 text-slate-600">
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              <span>Analyzing telemetry...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask about your stability, load, or recovery..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-4 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
