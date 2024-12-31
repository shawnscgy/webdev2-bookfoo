"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Loader2,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUserAuth } from "../_utils/auth-context";
import {
  addItem,
  deleteItem,
  getFavoriteId,
} from "@/app/_services/bookfoo-service";
import { BtnFvrtSrch } from "./btn-fvrt-srch"; 

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;
  const { user } = useUserAuth();

  const handleSearch = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      ////// check if book has a cover image
      const filteredResults = data.docs.filter((book) => book.cover_i);
      setResults(filteredResults || []);
      ////// calculate total pages
      setTotalPages(Math.ceil(filteredResults.length / itemsPerPage));
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPageResults = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return results.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-start w-full pt-12 pb-8">
      <div className="w-full max-w-2xl text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Find Your Next Book
        </h1>
        <p className="text-gray-600">Search through millions of books</p>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for books..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-6 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="w-full max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-center">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="w-full max-w-4xl mx-auto mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 px-4 text-center">
            Search Results (Page {currentPage} of {totalPages})
          </h2>
          <div className="space-y-6 px-4">
            {getCurrentPageResults().map((book) => (
              <div
                key={book.key}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-6">
                  {book.cover_i && (
                    <div className="flex-shrink-0">
                      <Image
                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                        alt={`Cover of ${book.title}`}
                        width={112}
                        height={160}
                        className="w-28 h-40 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Link
                          href={`/bookfoo/book/${book.key.replace(
                            "/works/",
                            ""
                          )}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {book.title}
                        </Link>
                        <p className="text-gray-600">
                          by {book.author_name?.[0] || "Unknown Author"}
                        </p>
                        {book.first_publish_year && (
                          <p className="text-sm text-gray-500">
                            First published in {book.first_publish_year}
                          </p>
                        )}
                      </div>
                      <BtnFvrtSrch book={book} user={user}/>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg border ${
                          currentPage === page
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}