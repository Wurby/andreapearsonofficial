// Derives an embeddable iframe src from the public show/channel URL an admin
// would paste in — so Andrea can just copy a link from Spotify/YouTube/Apple
// instead of knowing obscure embed IDs.

export function spotifyEmbedSrc(url) {
  const match = url?.match(/show\/([a-zA-Z0-9]+)/)
  return match ? `https://open.spotify.com/embed/show/${match[1]}?utm_source=generator` : null
}

// A channel's uploads playlist ID is always its channel ID with the "UC" prefix
// swapped for "UU" — no API key needed to embed "latest uploads" this way.
export function youtubeEmbedSrc(url) {
  const match = url?.match(/channel\/(UC[\w-]+)/)
  return match ? `https://www.youtube.com/embed/videoseries?list=UU${match[1].slice(2)}` : null
}

export function applePodcastsEmbedSrc(url) {
  return url?.includes('podcasts.apple.com')
    ? url.replace('podcasts.apple.com', 'embed.podcasts.apple.com')
    : null
}
