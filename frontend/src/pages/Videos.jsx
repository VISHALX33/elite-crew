import VideoEmbed from '../components/VideoEmbed.jsx';

const videos = [
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Sample Video 1' },
  { url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', title: 'Sample Video 2' },
  { url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', title: 'Sample Video 3' },
  { url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', title: 'Sample Video 4' },
];

export default function Videos() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map((video, idx) => (
          <VideoEmbed key={idx} video={video} />
        ))}
      </div>
    </div>
  );
} 