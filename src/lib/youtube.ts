// Typed wrapper around the YouTube Data API v3 (public data only, API-key auth).

const API = "https://www.googleapis.com/youtube/v3";

function key(): string {
  const k = process.env.YOUTUBE_API_KEY;
  if (!k || k === "PASTE_YOUR_KEY_HERE") throw new Error("YOUTUBE_API_KEY is not set in the environment");
  return k;
}

async function api<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(API + path);
  url.searchParams.set("key", key());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    const reason = json?.error?.errors?.[0]?.reason || json?.error?.message || res.statusText;
    throw new Error(`YouTube API ${res.status}: ${reason}`);
  }
  return json as T;
}

export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  seconds: number;
  views: number;
  position: number;
}

export function isoToSeconds(iso: string): number {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

function bestThumb(thumbs: Record<string, { url: string }> | undefined): string {
  if (!thumbs) return "";
  return (thumbs.maxres ?? thumbs.standard ?? thumbs.high ?? thumbs.medium ?? thumbs.default)?.url ?? "";
}

export async function getChannelByHandle(handle: string): Promise<ChannelInfo> {
  const h = handle.replace(/^@/, "");
  const data = await api<{ items?: any[] }>("/channels", {
    part: "snippet,statistics",
    forHandle: h,
  });
  const c = data.items?.[0];
  if (!c) throw new Error(`Channel @${h} not found`);
  return {
    id: c.id,
    title: c.snippet.title,
    description: c.snippet.description ?? "",
    thumbnail: bestThumb(c.snippet.thumbnails),
    subscriberCount: Number(c.statistics.subscriberCount ?? 0),
    videoCount: Number(c.statistics.videoCount ?? 0),
    viewCount: Number(c.statistics.viewCount ?? 0),
  };
}

export async function getPlaylists(channelId: string): Promise<PlaylistInfo[]> {
  const out: PlaylistInfo[] = [];
  let pageToken: string | undefined;
  do {
    const data = await api<{ items?: any[]; nextPageToken?: string }>("/playlists", {
      part: "snippet,contentDetails",
      channelId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    for (const p of data.items ?? []) {
      out.push({
        id: p.id,
        title: p.snippet.title,
        description: p.snippet.description ?? "",
        thumbnail: bestThumb(p.snippet.thumbnails),
        itemCount: p.contentDetails.itemCount,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return out;
}

// Returns the ordered videos of a playlist, with durations and view counts resolved.
export async function getPlaylistVideos(playlistId: string): Promise<VideoInfo[]> {
  const raw: Omit<VideoInfo, "seconds" | "views">[] = [];
  let pageToken: string | undefined;
  do {
    const data = await api<{ items?: any[]; nextPageToken?: string }>("/playlistItems", {
      part: "snippet,contentDetails",
      playlistId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    for (const it of data.items ?? []) {
      const vid = it.contentDetails?.videoId;
      if (!vid) continue;
      if (it.snippet?.title === "Private video" || it.snippet?.title === "Deleted video") continue;
      raw.push({
        videoId: vid,
        title: it.snippet.title,
        description: it.snippet.description ?? "",
        thumbnail: bestThumb(it.snippet.thumbnails),
        position: it.snippet.position ?? raw.length,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  // Resolve duration + viewCount in batches of 50 (videos.list).
  const meta = new Map<string, { seconds: number; views: number }>();
  for (let i = 0; i < raw.length; i += 50) {
    const ids = raw.slice(i, i + 50).map((v) => v.videoId).join(",");
    if (!ids) continue;
    const data = await api<{ items?: any[] }>("/videos", {
      part: "contentDetails,statistics",
      id: ids,
    });
    for (const v of data.items ?? []) {
      meta.set(v.id, {
        seconds: isoToSeconds(v.contentDetails.duration),
        views: Number(v.statistics?.viewCount ?? 0),
      });
    }
  }

  return raw
    .map((v) => ({ ...v, seconds: meta.get(v.videoId)?.seconds ?? 0, views: meta.get(v.videoId)?.views ?? 0 }))
    .sort((a, b) => a.position - b.position);
}
