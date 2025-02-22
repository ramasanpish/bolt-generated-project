import { useQuery } from "@tanstack/react-query";
import CharacterCard from "@/components/character-card";
import { type Character } from "@shared/schema";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: characters, isLoading } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const filteredCharacters = characters?.filter(character => 
    character.name.toLowerCase().includes(search.toLowerCase()) ||
    character.anime.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[400px] rounded-lg bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Anime World
      </motion.h1>
      
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search characters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {filteredCharacters?.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </motion.div>
    </div>
  );
}
