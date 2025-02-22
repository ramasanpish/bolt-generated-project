import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { type Character, type Message } from "@shared/schema";
import ChatMessage from "@/components/chat-message";
import ChatInput from "@/components/chat-input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const { data: character } = useQuery<Character>({
    queryKey: [`/api/characters/${id}`],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: [`/api/characters/${id}/messages`],
    refetchInterval: 1000,
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/characters/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isUser: true }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/characters/${id}/messages`] });
      setMessage("");
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/characters/${id}/messages`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/characters/${id}/messages`] });
      toast({ title: "Chat history cleared" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to clear chat history", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      mutation.mutate(message);
    }
  };

  if (!character) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <img 
            src={character.imageUrl} 
            alt={character.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-bold">{character.name}</h2>
            <p className="text-sm text-muted-foreground">{character.anime}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => clearHistoryMutation.mutate()}
          disabled={clearHistoryMutation.isPending}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: msg.isUser ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <ChatMessage message={msg} />
          </motion.div>
        ))}
      </div>

      <ChatInput
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        disabled={mutation.isPending}
      />
    </div>
  );
}
