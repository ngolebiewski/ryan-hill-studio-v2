import { test, expect } from '@playwright/test';

const BASE_API_URL = 'https://ryanhill.studio/api/artworks';

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

test('Verify all artwork YouTube videos are public', async ({ request }) => {
  const response = await request.get(BASE_API_URL);
  expect(response.ok()).toBeTruthy();
  
  const artworks = await response.json();
  const videoArtworks = artworks.filter((art) => 
    art.is_video && 
    art.video_url && 
    (art.video_url.includes('youtube.com') || art.video_url.includes('youtu.be'))
  );

  console.log(`Found ${videoArtworks.length} YouTube videos to check.`);
  const brokenVideos = [];

  await Promise.all(
    videoArtworks.map(async (art) => {
      const videoId = getYouTubeId(art.video_url);
      
      if (!videoId) {
        brokenVideos.push({
          id: art.id,
          title: art.title,
          url: art.video_url,
          reason: 'Could not parse a valid 11-digit YouTube ID from URL'
        });
        return;
      }

      const ytResponse = await request.get(`https://www.youtube.com/oembed`, {
        params: { url: `https://www.youtube.com/watch?v=${videoId}`, format: 'json' }
      });

      if (!ytResponse.ok()) {
        let errorReason = `YouTube returned Status Code ${ytResponse.status()}`;
        if (ytResponse.status() === 401) errorReason = 'Video is PRIVATE or restricted';
        if (ytResponse.status() === 404) errorReason = 'Video is DELETED or does not exist';

        brokenVideos.push({ id: art.id, title: art.title, url: art.video_url, reason: errorReason });
      }
    })
  );

  if (brokenVideos.length > 0) {
    console.error('\n❌ DETECTED PRIVATE OR BROKEN YOUTUBE ASSETS:');
    console.table(brokenVideos);
    const titles = brokenVideos.map(v => `"${v.title}"`).join(', ');
    test.fail(true, `The following video assets are not public: ${titles}`);
  } else {
    console.log('\n✅ All artwork YouTube assets are public and valid.');
  }
});