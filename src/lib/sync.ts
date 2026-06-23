import { prisma } from "./prisma";
import { getChannelByHandle, getPlaylists, getPlaylistVideos } from "./youtube";
import { classifyPlaylist } from "./curation";
import { slugify } from "./slug";

export function cleanTitle(t: string): string {
  return t.replace(/\s*\|\s*\d{4}\s*$/, "").trim();
}

export function deriveCode(title: string, track: string): string | null {
  if (track === "CERTIFICATION") {
    const m = title.match(/NISM\s*([0-9]+|[IVXLA]+)/i);
    return m ? `NISM ${m[1].toUpperCase()}` : "NISM";
  }
  if (track === "CODING") {
    if (/leetcode/i.test(title)) return "LC";
    if (/c\/c\+\+/i.test(title)) return "C++";
    if (/c language/i.test(title)) return "C";
    return "DSA";
  }
  return null;
}

export interface SyncResult {
  channel: string;
  courses: number;
  lessons: number;
}

// Pulls the channel from YouTube and upserts the catalog into Postgres.
// Synced fields are refreshed every run; owner-curated fields (published,
// track, level, code, order, title/desc overrides) are set only on first
// insert and preserved thereafter.
export async function runSync(): Promise<SyncResult> {
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE || "@techcourses4u";
  const channel = await getChannelByHandle(handle);

  await prisma.channel.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      title: channel.title,
      subscribers: channel.subscriberCount,
      totalViews: channel.viewCount,
      videoCount: channel.videoCount,
    },
    update: {
      title: channel.title,
      subscribers: channel.subscriberCount,
      totalViews: channel.viewCount,
      videoCount: channel.videoCount,
      syncedAt: new Date(),
    },
  });

  const playlists = await getPlaylists(channel.id);
  const usedSlugs = new Set(
    (await prisma.course.findMany({ select: { slug: true } })).map((c) => c.slug),
  );

  let courseCount = 0;
  let lessonCount = 0;

  for (const pl of playlists) {
    if (pl.itemCount === 0) continue;
    const videos = await getPlaylistVideos(pl.id);
    if (videos.length === 0) continue;

    const curation = classifyPlaylist(pl.title, pl.itemCount);
    const totalViews = videos.reduce((a, v) => a + v.views, 0);

    const existing = await prisma.course.findUnique({ where: { id: pl.id } });
    let slug = existing?.slug;
    if (!slug) {
      const base = slugify(cleanTitle(pl.title));
      let candidate = base;
      let n = 2;
      while (usedSlugs.has(candidate)) candidate = `${base}-${n++}`;
      slug = candidate;
      usedSlugs.add(slug);
    }

    const level =
      curation.track === "CERTIFICATION" ? "Certification" : curation.track === "CODING" ? "Coding" : "";

    await prisma.course.upsert({
      where: { id: pl.id },
      create: {
        id: pl.id,
        slug,
        ytTitle: cleanTitle(pl.title),
        ytDescription: pl.description,
        thumbnail: pl.thumbnail,
        views: totalViews,
        published: curation.published,
        track: curation.track,
        level,
        code: deriveCode(pl.title, curation.track),
        order: curation.order,
      },
      update: {
        ytTitle: cleanTitle(pl.title),
        ytDescription: pl.description,
        thumbnail: pl.thumbnail,
        views: totalViews,
        syncedAt: new Date(),
      },
    });
    courseCount++;

    const keep = new Set<string>();
    for (const v of videos) {
      const lessonId = `${pl.id}_${v.videoId}`;
      keep.add(lessonId);
      await prisma.lesson.upsert({
        where: { id: lessonId },
        create: {
          id: lessonId,
          courseId: pl.id,
          ytVideoId: v.videoId,
          title: cleanTitle(v.title),
          thumbnail: v.thumbnail,
          seconds: v.seconds,
          views: v.views,
          position: v.position,
        },
        update: {
          title: cleanTitle(v.title),
          thumbnail: v.thumbnail,
          seconds: v.seconds,
          views: v.views,
          position: v.position,
        },
      });
      lessonCount++;
    }
    // Drop lessons removed from the playlist (keep manually-added ones).
    await prisma.lesson.deleteMany({
      where: { courseId: pl.id, id: { notIn: [...keep] }, manuallyAdded: false },
    });
  }

  return { channel: channel.title, courses: courseCount, lessons: lessonCount };
}
