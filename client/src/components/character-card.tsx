import { type Character } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface Props {
  character: Character;
}

export default function CharacterCard({ character }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden h-full bg-card hover:shadow-lg hover:shadow-primary/20 transition-shadow">
        <div className="relative h-48">
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="font-bold text-lg text-primary">{character.name}</h3>
            <p className="text-sm text-muted-foreground">{character.anime}</p>
          </div>
          
          <p className="text-sm line-clamp-2">{character.description}</p>
          
          <Link href={`/chat/${character.id}`}>
            <Button className="w-full group">
              <MessageCircle className="mr-2 h-4 w-4 group-hover:animate-pulse" />
              Chat Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
