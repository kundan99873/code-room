import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchRoomMessages } from "@/api/rooms";
import { Send, Smile, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

type Message = {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

type Props = {
  roomId: string;
  socket: any;
};

export function RoomChatPanel({ roomId, socket }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const emojis = ["👍", "🎉", "😂", "🚀", "❤️", "🔥", "💻", "✨"];

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await fetchRoomMessages(roomId);
        setMessages(history);
      } catch (err: any) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadChatHistory();
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    if (!socket || !socket.connected) {
      toast.error("Not connected to chat server");
      return;
    }

    socket.emit("chat-message", { content: text });
    setContent("");
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setEmojiOpen(false);
  };

  // Basic message formatting: renders markdown-like **bold** and *italics* and URLs
  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline break-all"
          >
            {part}
          </a>
        );
      }

      // Basic formatting for **bold** and *italic*
      let formatted: React.ReactNode = part;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const italicRegex = /\*(.*?)\*?/g;

      if (part.match(boldRegex) || part.match(italicRegex)) {
        const words = part.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        formatted = words.map((word, idx) => {
          if (word.startsWith("**") && word.endsWith("**")) {
            return <strong key={idx}>{word.slice(2, -2)}</strong>;
          }
          if (word.startsWith("*") && word.endsWith("*")) {
            return <em key={idx}>{word.slice(1, -1)}</em>;
          }
          return word;
        });
      }

      return <span key={index}>{formatted}</span>;
    });
  };

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      {/* Panel Title */}
      <div className="flex items-center gap-2 pb-2 border-b border-border p-4">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Room Chat</h3>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin" ref={scrollRef}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" /> Loading history...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No messages yet. Send a message to start chatting!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === user?.id || msg.senderId === user?._id;
            const time = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg._id}
                className={`flex flex-col max-w-[85%] ${isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold text-foreground/80">{msg.senderName}</span>
                  <span className="text-[9px] text-muted-foreground">{time}</span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words border ${
                    isSelf
                      ? "bg-primary border-primary/20 text-primary-foreground rounded-tr-none"
                      : "bg-muted/30 border-border/40 text-foreground rounded-tl-none"
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Emoji Quick Bar */}
      <div className="px-4 py-1 flex items-center gap-1 border-t border-border/30 bg-muted/10 shrink-0">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => insertEmoji(emoji)}
            className="text-sm p-1 rounded hover:bg-muted/50 cursor-pointer transition"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input container */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-2 items-center bg-card shrink-0">
        <div className="relative flex-1">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="h-9 text-xs pr-8 bg-muted/20"
          />
          <button
            type="button"
            onClick={() => setEmojiOpen(!emojiOpen)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Insert emoji"
          >
            <Smile className="h-4 w-4" />
          </button>
        </div>
        <Button type="submit" size="sm" className="h-9 px-3 cursor-pointer shrink-0">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
