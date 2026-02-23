import { renderHtml } from "./renderHtml";

export interface Env {
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// --- NEW: IMAGE PROXY API ---
		// This hides Reddit from the school network!
		if (url.pathname === '/api/image') {
			const id = url.searchParams.get('id');
			if (!id) return new Response('Missing ID', { status: 400 });

			try {
				// 1. Get the real Reddit URL from the database
				const stmt = env.DB.prepare("SELECT url FROM images WHERE id = ?").bind(id);
				const result = await stmt.first();

				if (!result || !result.url) return new Response('Not found', { status: 404 });

				// 2. The Worker fetches the image from Reddit (bypassing the school firewall)
				const imageResponse = await fetch(result.url as string, {
					headers: { 'User-Agent': 'unvAIl-Game-Proxy/1.0' }
				});

				if (!imageResponse.ok) return new Response('Failed to fetch image', { status: 500 });

				// 3. Stream the raw image data directly to the user
				return new Response(imageResponse.body, {
					headers: {
						'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
						// Cache the image in their browser for 24 hours so we don't fetch it twice
						'Cache-Control': 'public, max-age=86400'
					}
				});
			} catch (e: any) {
				return new Response(e.message, { status: 500 });
			}
		}

		// --- REVEAL ANSWER API ---
		if (url.pathname === '/api/reveal') {
			const id = url.searchParams.get('id');
			if (!id) return new Response('Missing ID', { status: 400 });

			try {
				const stmt = env.DB.prepare("SELECT type, explanation FROM images WHERE id = ?").bind(id);
				const result = await stmt.first();
				if (!result) return new Response('Not found', { status: 404 });
				return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
			} catch (e: any) {
				return new Response(e.message, { status: 500 });
			}
		}

		// --- GET USER STATS API ---
		if (url.pathname === '/api/stats' && request.method === 'GET') {
			const userId = url.searchParams.get('userId');
			if (!userId) return new Response('Missing User ID', { status: 400 });

			try {
				const stmt = env.DB.prepare("SELECT * FROM user_stats WHERE user_id = ?").bind(userId);
				const result = await stmt.first();
				return new Response(JSON.stringify(result || {}), { headers: { 'Content-Type': 'application/json' } });
			} catch (e: any) {
				return new Response(e.message, { status: 500 });
			}
		}

		// --- SAVE USER STATS API ---
		if (url.pathname === '/api/stats' && request.method === 'POST') {
			try {
				const body = await request.json() as any;
				const { userId, played, wins, currentStreak, maxStreak, distribution, lastPlayedDate } = body;

				// D1 Batch: Ensure the user exists in the 'users' table first, then upsert their stats
				await env.DB.batch([
					env.DB.prepare(`
                    INSERT INTO users (email) VALUES (?)
                    ON CONFLICT (email) DO NOTHING
                 `).bind(userId),

					env.DB.prepare(`
                    INSERT INTO user_stats (user_id, played, wins, current_streak, max_streak, distribution, last_played_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (user_id) DO UPDATE SET
                    played = excluded.played, 
                    wins = excluded.wins, 
                    current_streak = excluded.current_streak,
                    max_streak = excluded.max_streak, 
                    distribution = excluded.distribution, 
                    last_played_date = excluded.last_played_date
                `).bind(userId, played, wins, currentStreak, maxStreak, JSON.stringify(distribution), lastPlayedDate)
				]);

				return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
			} catch (e: any) {
				console.error("D1 Error saving stats:", e.message);
				return new Response(e.message, { status: 500 });
			}
		}

		// --- MAIN PAGE LOAD (HTML RENDERER) ---
		const START_DATE = new Date('2024-01-01T00:00:00Z');
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - START_DATE.getTime());
		const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		const limit = 5;

		try {
			const countStmt = await env.DB.prepare("SELECT COUNT(*) as total FROM images").first();
			const totalImages = (countStmt?.total as number) || 0;
			let dailyImages: Record<string, unknown>[] = [];

			if (totalImages > 0) {
				const totalSets = Math.floor(totalImages / limit);
				const currentSetIndex = dayIndex % totalSets;
				const offset = currentSetIndex * limit;

				// Fetch ONLY id and url to prevent cheating
				const stmt = env.DB.prepare("SELECT id, url FROM images LIMIT ? OFFSET ?").bind(limit, offset);
				const { results } = await stmt.all();

				// MAP THE URLS: Swap the real Reddit URL with our new Proxy URL
				dailyImages = results.map(img => ({
					id: img.id,
					url: `/api/image?id=${img.id}` // The Vue app will automatically request this instead!
				}));
			}

			// Get the user's email from Cloudflare Access (or 'anonymous' if local/bypassed)
			const userEmail = request.headers.get('cf-access-authenticated-user-email') || 'anonymous';

			return new Response(renderHtml(JSON.stringify(dailyImages), userEmail), {
				headers: { "content-type": "text/html;charset=UTF-8" },
			});

		} catch (e: any) {
			// Failsafe if the database isn't fully set up yet
			return new Response(`Error connecting to D1 Database: ${e.message}`, { status: 500 });
		}
	},
};