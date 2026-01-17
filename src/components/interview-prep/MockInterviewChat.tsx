import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft, Loader2, User, Bot } from "lucide-react";
import { MockInterviewMessage, InterviewPrepAnalysis } from "@/types/interview-prep";
import { cn } from "@/lib/utils";

interface MockInterviewChatProps {
  analysis: InterviewPrepAnalysis;
  onBack: () => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-prep-agent`;

export function MockInterviewChat({ analysis, onBack }: MockInterviewChatProps) {
  const [messages, setMessages] = useState<MockInterviewMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const startInterview = async () => {
    setIsStarted(true);
    setIsLoading(true);

    const initialMessage: MockInterviewMessage = {
      role: "user",
      content: "请开始模拟面试，从第一个预测问题开始提问。"
    };

    try {
      await streamResponse([initialMessage]);
    } catch (error) {
      console.error("Failed to start interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const streamResponse = async (conversationHistory: MockInterviewMessage[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        mode: "mock-interview",
        conversationHistory,
        analysisContext: analysis,
      }),
    });

    if (!resp.ok || !resp.body) {
      throw new Error("Failed to get response");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    // Add empty assistant message
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { 
                role: "assistant", 
                content: assistantContent 
              };
              return newMessages;
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: MockInterviewMessage = { role: "user", content: input.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      await streamResponse(newHistory);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">模拟面试</h2>
          <p className="text-muted-foreground max-w-md">
            AI 面试官将根据预测的问题进行提问，并对你的回答给出实时反馈。
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回分析
          </Button>
          <Button onClick={startInterview}>
            开始面试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="font-semibold">模拟面试进行中</h2>
          <p className="text-sm text-muted-foreground">认真作答，获取反馈</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 pr-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <Card
                className={cn(
                  "max-w-[80%] p-3",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </Card>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Card className="p-3 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Card>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="pt-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的回答..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
