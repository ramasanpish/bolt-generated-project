import { type Message } from "@shared/schema";
import { cn } from "@/lib/utils";

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  return (
    <div
      className={cn(
        "max-w-[80%] rounded-lg p-3",
        message.isUser 
          ? "ml-auto bg-primary text-primary-foreground" 
          : "mr-auto bg-muted"
      )}
    >
      {message.content}
    </div>
  );
}
