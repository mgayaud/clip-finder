'use client'

import { useState, FormEvent } from 'react';

export default function SubtitlesSearchForm() {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Video URL:', videoUrl);
    console.log('Search Text:', searchText);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">YouTube Subtitle Search</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="videoUrl">
              YouTube Video URL
            </label>
            <input
              type="text"
              id="videoUrl"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter YouTube video link"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="searchText">
              Text to Search in Subtitles
            </label>
            <input
              type="text"
              id="searchText"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Enter text to search in subtitles"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search Subtitles
          </button>
        </form>
      </div>
    </div>
  );
}
