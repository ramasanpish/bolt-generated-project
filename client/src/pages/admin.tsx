import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { type Character, type InsertCharacter } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

export default function Admin() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCharacter, setNewCharacter] = useState<Partial<InsertCharacter>>({});

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const createMutation = useMutation({
    mutationFn: async (character: InsertCharacter) => {
      await apiRequest("POST", "/api/characters", character);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      setNewCharacter({});
      toast({ title: "Character created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create character", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCharacter> }) => {
      await apiRequest("PATCH", `/api/characters/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      setEditingId(null);
      toast({ title: "Character updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update character", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/characters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({ title: "Character deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete character", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (character: Partial<InsertCharacter>) => {
    if (!character.name || !character.anime || !character.description || !character.imageUrl || !character.personality) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(character as InsertCharacter);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Character Management
      </motion.h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Character
          </h2>
          <div className="grid gap-4">
            <Input
              placeholder="Name"
              value={newCharacter.name || ""}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
            />
            <Input
              placeholder="Anime"
              value={newCharacter.anime || ""}
              onChange={(e) => setNewCharacter({ ...newCharacter, anime: e.target.value })}
            />
            <Input
              placeholder="Image URL"
              value={newCharacter.imageUrl || ""}
              onChange={(e) => setNewCharacter({ ...newCharacter, imageUrl: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newCharacter.description || ""}
              onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
            />
            <Textarea
              placeholder="Personality"
              value={newCharacter.personality || ""}
              onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
            />
            <Button 
              onClick={() => handleSubmit(newCharacter)}
              disabled={createMutation.isPending}
            >
              Create Character
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <AnimatePresence>
          {characters.map((character) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="pt-6">
                  {editingId === character.id ? (
                    <div className="grid gap-4">
                      <Input
                        defaultValue={character.name}
                        onChange={(e) => updateMutation.mutate({ 
                          id: character.id, 
                          data: { ...character, name: e.target.value }
                        })}
                      />
                      <Input
                        defaultValue={character.anime}
                        onChange={(e) => updateMutation.mutate({ 
                          id: character.id, 
                          data: { ...character, anime: e.target.value }
                        })}
                      />
                      <Input
                        defaultValue={character.imageUrl}
                        onChange={(e) => updateMutation.mutate({ 
                          id: character.id, 
                          data: { ...character, imageUrl: e.target.value }
                        })}
                      />
                      <Textarea
                        defaultValue={character.description}
                        onChange={(e) => updateMutation.mutate({ 
                          id: character.id, 
                          data: { ...character, description: e.target.value }
                        })}
                      />
                      <Textarea
                        defaultValue={character.personality}
                        onChange={(e) => updateMutation.mutate({ 
                          id: character.id, 
                          data: { ...character, personality: e.target.value }
                        })}
                      />
                      <Button onClick={() => setEditingId(null)}>Done</Button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold">{character.name}</h3>
                        <p className="text-sm text-muted-foreground">{character.anime}</p>
                        <p className="mt-2">{character.description}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{character.personality}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(character.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(character.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
