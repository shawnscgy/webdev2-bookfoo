"use client";
import { useState, useEffect } from "react";
import {
  addItem,
  deleteItem,
  getFavoriteId,
} from "@/app/_services/bookfoo-service";
import { Loader2, Star, StarOff } from "lucide-react";

export function BtnFvrtSrch({ book, user }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check the initial favorite status when the component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const itemId = await getFavoriteId(user.uid, book.key);
        setIsFavorite(!!itemId); // Set isFavorite to true if itemId exists
      } catch (err) {
        console.error("Error checking favorite status:", err);
      } finally {
        setCheckingStatus(false); // Ensure checkingStatus is set to false
      }
    };

    checkFavoriteStatus();
  }, []);

  const handleToggleFavorite = async (book) => {
    setCheckingStatus(true);
    try {
      const itemId = await getFavoriteId(user.uid, book.key);
      // If the book is already in the user's favorites, remove it
      if (itemId) {
        const isDeleted = await deleteItem(user.uid, itemId);
        if (isDeleted) {
          setIsFavorite(false);
        }
        // If the book is not in the user's favorites, add it
      } else {
        const bookData = {
          key: book.key,
          title: book.title,
          author: book.author_name?.[0] || "Unknown Author",
          cover_i: book.cover_i,
          first_publish_year: book.first_publish_year,
        };
        if (await addItem(user.uid, bookData)) {
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setCheckingStatus(false); // Ensure the spinner stops
    }
  };

  const isLoading = checkingStatus;

  return (
    <button
      onClick={() => handleToggleFavorite(book)}
      disabled={isLoading}
      className="w-10 h-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : isFavorite ? (
        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
      ) : (
        <StarOff className="w-6 h-6 text-gray-500" />
      )}
    </button>
  );
}
