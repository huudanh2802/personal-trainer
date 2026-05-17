import { youtubeEmbedSrc } from '../lib/youtube';

type YouTubeEmbedProps = {
  videoId: string;
  title: string;
  loop?: boolean;
  active: boolean;
  onActivate: () => void;
};

export default function YouTubeEmbed({ videoId, title, loop, active, onActivate }: YouTubeEmbedProps) {
  if (!active) {
    return (
      <button
        type="button"
        onClick={onActivate}
        style={{
          width: '100%',
          minHeight: 280,
          background: '#111',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 24,
        }}
      >
        Tap to load YouTube tutorial (avoids loading many embeds at once).
      </button>
    );
  }

  return (
    <div className="youtube-embed">
      <iframe
        key={videoId}
        src={youtubeEmbedSrc(videoId, loop)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
