export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeEmbedSrc(videoId: string, loop = false): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
  });
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
