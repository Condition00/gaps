import "@blocknote/core/fonts/inter.css";
import TextareaAutosize from "react-textarea-autosize";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import React, { useState, useEffect, useMemo } from "react";
import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { Button } from "./ui/button";
import { db } from "@/firebase"; // Update this path based on your project structure
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";

interface EditorProps {
  userId: string;
  noteId: string;
}

const Editor: React.FC<EditorProps> = ({ userId, noteId }) => {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [initialContent, setInitialContent] = useState<PartialBlock[] | "loading">("loading");

  // Load note from Firestore on mount
  useEffect(() => {
    const loadNote = async () => {
      const noteRef = doc(db, "notes", noteId);
      const noteSnapshot = await getDoc(noteRef);
      if (noteSnapshot.exists()) {
        const noteData = noteSnapshot.data();
        setTitle(noteData.title);

        try {
          const parsedContent = JSON.parse(noteData.content);

          // Check if parsedContent is an array
          if (Array.isArray(parsedContent)) {
            setInitialContent(parsedContent);
          } else {
            console.error("Parsed content is not an array:", parsedContent);
            setInitialContent([{}]); // Set to empty if not an array
          }
        } catch (error) {
          console.error("Failed to parse content:", error);
          setInitialContent([{}]); // Set to empty if parsing fails
        }
      } else {
        setInitialContent([{}]); // Set to empty if no content found
      }
    };

    loadNote();
  }, [noteId]);

  // Initialize the editor with initial content using useMemo
  const editor = useMemo(() => {
    if (initialContent === "loading") return undefined;
    return BlockNoteEditor.create({ initialContent });
  }, [initialContent]);

  // Save note to Firestore
  const handleSave = async () => {
    if (!userId || !noteId) {
      console.error("User ID or Note ID is missing");
      return;
    }
    if (title === "") {
      console.error("Empty title");
      return;
    }
    const noteRef = doc(db, "notes", noteId);

    await setDoc(
      noteRef,
      {
        userId,
        title,
        content: JSON.stringify(blocks),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    console.log("Note saved successfully!");
  };

  // Only render editor if content is loaded
  if (editor === undefined) {
    return <div role="status" className='mx-auto w-fit m-2'>
      <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-center">
        <TextareaAutosize
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="ml-12 w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
        />
        <Button onClick={handleSave}>Save</Button>
      </div>
      <BlockNoteView
        theme="light"
        editor={editor}
        onChange={() => setBlocks(editor.document)}
      />
    </div>
  );
};

export default Editor;
