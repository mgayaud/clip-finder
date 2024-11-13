// https://www.youtube.com/watch?v=LJbUaciFdV8 cette video ne fonctionn pas, pourquoi ?

const express = require('express');
const ytdl = require('ytdl-core');
const { parseStringPromise } = require('xml2js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/search', async (req, res) => {
  try {
    const { youtubeUrl, searchText } = req.body;

    if (!youtubeUrl || !searchText) {
      return res.status(400).json({ error: 'YouTube URL and search text are required!' });
    }

    const videoId = ytdl.getURLVideoID(youtubeUrl);
    const info = await ytdl.getInfo(videoId);

    const captions = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captions || captions.length === 0) {
      return res.status(404).json({ error: 'No captions available for this video.' });
    }

    const englishCaption = captions.find(caption => caption.languageCode === 'en') || captions[0];
    const captionUrl = englishCaption.baseUrl;

    const captionResponse = await fetch(captionUrl);
    const captionXml = await captionResponse.text();

    const parsedCaptions = await parseStringPromise(captionXml);

    const results = searchInCaptions(parsedCaptions, searchText);

    const title = info.videoDetails.title;;
    const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;

    return res.json({ title, thumbnail, results });
  } catch (error) {
    console.error('Error fetching captions:', error);
    return res.status(500).json({ error: 'Failed to fetch subtitles.' });
  }
});

function searchInCaptions(parsedXml, searchText) {
  const textNodes = parsedXml.transcript.text || [];

  const results = [];
  searchText = searchText.toLowerCase();

  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const nodeText = node._.toLowerCase();
    const start = node.$.start;

    if (nodeText.includes(searchText)) {
      results.push({ start, text: node._ });
    }
  }

  return results;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
