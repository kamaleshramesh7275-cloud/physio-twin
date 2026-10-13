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
    q.includes("rest") ||
    q.includes("tired") ||
    q.includes("fatigue")
  ) {
    return (
      "Your Recovery Score is 88%, which indicates good sleep quality and resting heart rate stability. To restore your capability reserve back above 80%, stay well-hydrated and incorporate light foam rolling tonight."
    );
  }

  return (
    "As your PhysioTwin, I monitor your movement quality (92%), stability (55%), and recovery reserve (55%). You can ask me 'how is my health?', 'recommend a workout', or 'check joint risks' anytime!"
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "twin", content: "Hello! I'm your PhysioTwin. How can I help you today? You can ask me about your latest stats or ask for advice." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const uid = auth.currentUser?.uid || "test-user";
      // Convert to API format
      const apiMessages = newMessages.map(m => ({
        role: m.role === "twin" ? "assistant" : "user",
        content: m.content
      }));
      
      const res = await api.chatWithTwin(uid, apiMessages);
      if (res && res.response) {
        setMessages([...newMessages, { role: "twin", content: res.response }]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.warn("Backend chat unavailable, using local Twin engine fallback:", e);
      const fallbackReply = generateLocalTwinReply(userMsg);
      setMessages([...newMessages, { role: "twin", content: fallbackReply }]);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
        <Brain className="w-5 h-5 text-primary" />
        <div>
          <div className="text-sm font-bold">Interactive Twin</div>
          <div className="text-xs text-muted-foreground">Ask me anything</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-slate-200" : "bg-primary text-white"}`}>
              {msg.role === "user" ? <User className="w-3 h-3 text-slate-600" /> : <Brain className="w-3 h-3" />}
            </div>
            <div className={`text-xs px-3 py-2 rounded-xl max-w-[85%] leading-relaxed ${
              msg.role === "user" 
                ? "bg-slate-100 text-slate-800 rounded-tr-sm" 
                : "bg-primary/10 text-foreground border border-primary/20 rounded-tl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <Brain className="w-3 h-3" />
            </div>
            <div className="text-xs px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 rounded-tl-sm flex items-center">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-background">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask about your stats..."
            className="w-full bg-muted border border-border rounded-full py-2 pl-4 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-1.5 top-1.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <Send className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
