import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export default function ChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm here to help you. I can guide you on:\n\n1. How to upload a video\n2. How to start a live session\n\nWhat would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");

  const getResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("video") || lowerMessage.includes("upload")) {
      return "To upload a video:\n\n1. Click on 'Upload Video' card on your dashboard\n2. Enter a title for your video\n3. Add a description (optional)\n4. Paste your YouTube video URL\n5. Click 'Upload Video' button\n\nThat's it! Your video will be shared with students.";
    }

    if (lowerMessage.includes("live") || lowerMessage.includes("session")) {
      return "To start a live session:\n\n1. Click on 'Start Live Session' card on your dashboard\n2. Enter a title for your session\n3. Add a description (optional)\n4. Paste your YouTube Live URL\n5. Click 'Start Live Session' button\n\nYour live session will be visible to all students!";
    }

    if (lowerMessage.includes("profile")) {
      return "To update your profile:\n\n1. Click the menu icon (☰) at the top\n2. Select 'My Profile'\n3. Update your information\n4. Click 'Save Changes'\n\nYour profile updates will be saved automatically.";
    }

    return "I can help you with:\n\n• Uploading videos\n• Starting live sessions\n• Updating your profile\n\nPlease let me know what you need help with!";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const assistantMessage: Message = {
      role: "assistant",
      content: getResponse(input),
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 shadow-2xl z-50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Assistant</CardTitle>
              <CardDescription>How can I help you today?</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80 px-4">
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2 p-4 border-t">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
