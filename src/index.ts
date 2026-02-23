import { renderHtml } from "./renderHtml";

export interface Env {
	DB: D1Database;
}

// Very simple, secure edge-compatible password hasher
async function hashPassword(password: string): Promise<string> {
	const msgUint8 = new TextEncoder().encode(password + "unvAIl_s3cr3t_salt");
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// --- ADS.TXT API (For Google AdSense Verification) ---
		if (url.pathname === '/ads.txt') {
			// This returns the standard authorized digital seller plain text format
			return new Response('google.com, pub-7388329784955167, DIRECT, f08c47fec0942fa0', {
				headers: { 'Content-Type': 'text/plain' }
			});
		}

		// --- AUTH: REGISTER ---
		if (url.pathname === '/api/auth/register' && request.method === 'POST') {
			try {
				const { email, password, guestId } = await request.json() as any;
				const hash = await hashPassword(password);
				const token = crypto.randomUUID();

				// 1. Check if the user already exists in the database
				const existingUser = await env.DB.prepare("SELECT email, password_hash FROM users WHERE email = ?").bind(email).first();

				const queries = [];

				if (existingUser) {
					// 2. Allow legacy Cloudflare Access users to "claim" their account
					if (!existingUser.password_hash || existingUser.password_hash === '') {
						queries.push(env.DB.prepare("UPDATE users SET password_hash = ?, token = ? WHERE email = ?").bind(hash, token, email));
					} else {
						return new Response(JSON.stringify({ error: 'Email already exists and has a password.' }), { status: 400 });
					}
				} else {
					// 3. Completely new user
					queries.push(env.DB.prepare("INSERT INTO users (email, password_hash, token) VALUES (?, ?, ?)").bind(email, hash, token));
				}

				// 4. Safely handle Guest Stat Migration to prevent Primary Key Collisions
				if (guestId) {
					const existingStats = await env.DB.prepare("SELECT user_id FROM user_stats WHERE user_id = ?").bind(email).first();
					if (!existingStats) {
						// Safe to migrate stats
						queries.push(env.DB.prepare("UPDATE user_stats SET user_id = ? WHERE user_id = ?").bind(email, guestId));
						// Clean up old guest row from users table
						queries.push(env.DB.prepare("DELETE FROM users WHERE email = ?").bind(guestId));
					} else {
						// User already has stats, so we just clean up the guest data to prevent clutter
						queries.push(env.DB.prepare("DELETE FROM user_stats WHERE user_id = ?").bind(guestId));
						queries.push(env.DB.prepare("DELETE FROM users WHERE email = ?").bind(guestId));
					}
				}

				await env.DB.batch(queries);
				return new Response(JSON.stringify({ success: true, email, token }), { headers: { 'Content-Type': 'application/json' } });
			} catch (e: any) {
				return new Response(JSON.stringify({ error: `Database Error: ${e.message}` }), { status: 500 });
			}
		}

		// --- AUTH: LOGIN ---
		if (url.pathname === '/api/auth/login' && request.method === 'POST') {
			try {
				const { email, password } = await request.json() as any;
				const hash = await hashPassword(password);

				const user = await env.DB.prepare("SELECT email FROM users WHERE email = ? AND password_hash = ?").bind(email, hash).first();

				if (user) {
					const newToken = crypto.randomUUID();
					await env.DB.prepare("UPDATE users SET token = ? WHERE email = ?").bind(newToken, user.email).run();
					return new Response(JSON.stringify({ success: true, email: user.email, token: newToken }), { headers: { 'Content-Type': 'application/json' } });
				} else {
					return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
				}
			} catch (e: any) {
				return new Response(JSON.stringify({ error: `Database Error: ${e.message}` }), { status: 500 });
			}
		}

		// --- IMAGE PROXY API ---
		if (url.pathname === '/api/image') {
			const id = url.searchParams.get('id');
			if (!id) return new Response('Missing ID', { status: 400 });

			try {
				const stmt = env.DB.prepare("SELECT url FROM images WHERE id = ?").bind(id);
				const result = await stmt.first();
				if (!result || !result.url) return new Response('Not found', { status: 404 });

				const imageResponse = await fetch(result.url as string, { headers: { 'User-Agent': 'unvAIl-Game-Proxy/1.0' } });
				if (!imageResponse.ok) return new Response('Failed to fetch image', { status: 500 });

				return new Response(imageResponse.body, {
					headers: {
						'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
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

				// Ensure the user exists (if they are a guest saving for the first time)
				await env.DB.batch([
					env.DB.prepare(`INSERT INTO users (email) VALUES (?) ON CONFLICT (email) DO NOTHING`).bind(userId),
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

				const stmt = env.DB.prepare("SELECT id, url FROM images LIMIT ? OFFSET ?").bind(limit, offset);
				const { results } = await stmt.all();

				// MAP THE URLS to use the proxy
				dailyImages = results.map(img => ({
					id: img.id,
					url: `/api/image?id=${img.id}`
				}));
			}

			// No longer passing Cloudflare Access email. HTML is entirely self-contained!
			return new Response(renderHtml(JSON.stringify(dailyImages)), {
				headers: { "content-type": "text/html;charset=UTF-8" },
			});

		} catch (e: any) {
			return new Response(`Error connecting to D1 Database: ${e.message}`, { status: 500 });
		}
	},
};