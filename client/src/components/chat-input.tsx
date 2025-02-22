import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function ChatInput({ value, onChange, onSend, disabled }: Props) {
  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={disabled}
          className="bg-background"
        />
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button 
            onClick={onSend} 
            disabled={disabled}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
