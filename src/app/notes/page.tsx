"use client";

import { db } from "@/firebase";
import { collection, getDocs, addDoc, DocumentData, QuerySnapshot } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Button } from "@/components/ui/button";
import { UserAuth } from "@/context/AuthContext";

interface Note {
  id: string;
  title: string;
  content: Record<string, unknown>; // Adjust as per your content structure
  createdAt: number;
  updatedAt: number;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter(); // Initialize the router

  const { user } = UserAuth();
  const userId = user?.uid
  useEffect(() => {
    const fetchNotes = async () => {
      const notesCollection = collection(db, "notes");
      const notesSnapshot: QuerySnapshot<DocumentData> = await getDocs(notesCollection);
      const notesData = notesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(notesData);
    };

    fetchNotes();
  }, []);

  const createNote = async () => {
    try {
      if (!userId) return
      const newNote = {
        userId,
        title: "New Note", // Default title, consider prompting the user for input
        content: "[{}]", // Default content
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Add the new note to Firestore
      const docRef = await addDoc(collection(db, "notes"), newNote);

      // Redirect to the newly created note's page
      router.push(`/notes/${docRef.id}`);
    } catch (error) {
      console.error("Error creating note: ", error);
      alert("Failed to create note. Please try again."); // Notify the user
    }
  };

  return (
    <div className="w-full p-4">
      <div className="flex w-full justify-between items-center">
        <h1 className="font-medium text-3xl">Your Notes</h1>
        <Button onClick={createNote} className="my-4">
          Create New Note
        </Button>
      </div>
      <ul className="space-y-1">
        {notes.map(note => (
          <li key={note.id} className="text-blue-600 font-medium text-lg hover:underline">
            <Link href={`/notes/${note.id}`}>{note.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
