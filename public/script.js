document.addEventListener('keydown', (event) => {
  const activeElement = document.activeElement;
  const isInputFocused = activeElement && (activeElement.id === 'youtube-url' || activeElement.id === 'search-text');

  if (isInputFocused && event.key === 'Enter') {
    event.preventDefault();
    submitForm();
  }
});

function formatTime(seconds) {
  if (seconds < 0) {
    throw new Error("Seconds cannot be negative");
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedHours = hours.toString().padStart(2, '0');

  if (hours === 0 && minutes < 10) {
      return `${minutes}:${formattedSeconds}`;
  } else if (hours === 0) {
      return `${formattedMinutes}:${formattedSeconds}`;
  } else if (hours < 10) {
      return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}

function decodeHTMLEntities(text) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text;
  return tempDiv.textContent || tempDiv.innerText;
}

async function submitForm() {
  const youtubeUrl = document.getElementById('youtube-url').value;
  const searchText = document.getElementById('search-text').value;
  const videoTitle = document.querySelector('.video-title');
  const resultList = document.querySelector('.search-results');
  const loading = document.querySelector('.loading');

  if (!youtubeUrl && !searchText) return;
  resultList.innerHTML = "";
  loading.classList.remove("hidden");
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ youtubeUrl, searchText }),
    });

    const data = await response.json();
    loading.classList.add("hidden");
    if (!data.results || !data.results.length) {
      const li = document.createElement('li');
      li.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'flex', 'justify-between', 'items-center');
      const text = document.createElement('div');
      text.textContent = data.error ? data.error : 'No results found';
      text.classList.add('text-gray-800');
      li.appendChild(text);
      resultList.appendChild(li);
    } else {
      videoTitle.innerText = data.title;
    }
    data.results.forEach(result => {
      const li = document.createElement('li');
      li.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'flex', 'justify-between', 'items-center');
      const text = document.createElement('div');
      text.textContent = decodeHTMLEntities(result.text);
      text.classList.add('text-gray-800');

      const start = document.createElement('div');
      const link = document.createElement("a");
      link.href = `${youtubeUrl}&t=${parseInt(result.start)}`;
      link.target = "_blank";
      link.textContent = formatTime(parseInt(result.start));
      link.classList.add('hover:bg-blue-100', 'transition-colors', 'p-1.5', 'rounded-lg');
      start.classList.add('text-blue-500', 'font-semibold');
      start.appendChild(link);

      li.appendChild(text);
      li.appendChild(start);
      resultList.appendChild(li);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}