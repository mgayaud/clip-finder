import { NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import { parseStringPromise } from 'xml2js';

interface SearchResult {
  start: string;
  text: string;
}

export async function POST(req: Request) {
  try {
    const { youtubeUrl, searchText } = await req.json();

    if (!youtubeUrl || !searchText) {
      return NextResponse.json({ error: 'YouTube URL and search text are required!' }, { status: 400 });
    }

    const videoId = ytdl.getURLVideoID(youtubeUrl);
    const info = await ytdl.getInfo(videoId);

    const captions = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captions || captions.length === 0) {
      return NextResponse.json({ error: 'No captions available for this video.' }, { status: 404 });
    }

    const englishCaption = captions.find(caption => caption.languageCode === 'en') || captions[0];
    const captionUrl = englishCaption.baseUrl;

    const captionResponse = await fetch(captionUrl);
    const captionXml = await captionResponse.text();

    const parsedCaptions = await parseStringPromise(captionXml);

    const results = searchInCaptions(parsedCaptions, searchText);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching captions:', error);
    return NextResponse.json({ error: 'Failed to fetch subtitles.' }, { status: 500 });
  }
}

function formatTime(seconds: number) {
  const totalSeconds = Math.floor(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

function searchInCaptions(parsedXml: any, searchText: string): SearchResult[] {
  const textNodes = parsedXml.transcript.text || [];

  const results: SearchResult[] = [];
  searchText = searchText.toLowerCase();

  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const nodeText = node._.toLowerCase();
    const start = node.$.start;

    if (nodeText.includes(searchText)) {
      results.push({ start: formatTime(start), text: node._ });
    }
  }

  return results;
}