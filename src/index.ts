import { renderHtml } from "./renderHtml";

export interface Env {
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// 1. Calculate Day Index (relative to start date)
		const START_DATE = new Date('2024-01-01T00:00:00Z');
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - START_DATE.getTime());
		const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		const limit = 5; // Images per day

		// 2. Query total count to handle loop-around when you run out of images
		const countStmt = await env.DB.prepare("SELECT COUNT(*) as total FROM images").first();
		const totalImages = (countStmt?.total as number) || 0;

		let dailyImages: Record<string, unknown>[] = [];

		if (totalImages > 0) {
			// 3. Calculate offset and fetch exactly 5 images
			const totalSets = Math.floor(totalImages / limit);
			const currentSetIndex = dayIndex % totalSets;
			const offset = currentSetIndex * limit;

			const stmt = env.DB.prepare("SELECT * FROM images LIMIT ? OFFSET ?").bind(limit, offset);
			const { results } = await stmt.all();
			dailyImages = results;
		}

		// 4. Pass the resulting array as a JSON string to the HTML template
		return new Response(renderHtml(JSON.stringify(dailyImages)), {
			headers: {
				"content-type": "text/html;charset=UTF-8",
			},
		});
	},
};