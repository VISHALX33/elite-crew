function getYoutubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function VideoEmbed({ video }) {
  const id = getYoutubeId(video.url);
  const thumbnail = id
    ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    : 'https://via.placeholder.com/100x100?text=Video';
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col items-center">
      <img
        src={thumbnail}
        alt={video.title}
        className="w-24 h-24 object-cover rounded mb-2"
      />
      <h3 className="font-semibold text-lg mb-1 text-center">{video.title}</h3>
    </div>
  );
}
