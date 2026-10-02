import { Pool } from 'pg';

const NEON_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0rhIKLixSq1n@ep-withered-queen-b3o85b1l-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: NEON_DATABASE_URL,
});

export async function getDbMovies() {
  const query = `
    SELECT 
      m.id,
      m.title,
      m.synopsis,
      m.description,
      m.poster_url as "posterUrl",
      m.banner_url as "bannerUrl",
      m.release_year as "releaseYear",
      m.age_rating as "ageRating",
      m.created_at as "createdAt",
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'genre', jsonb_build_object('id', g.id, 'name', g.name)
          )
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) as genres,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', e.id,
            'episodeNumber', e.episode_number,
            'title', e.title,
            'synopsis', e.synopsis,
            'thumbnailUrl', e.thumbnail_url,
            'durationSeconds', e.duration_seconds,
            'coinPrice', e.coin_price,
            'streamUrl', e.stream_url,
            'qualities', e.qualities,
            'currentPackage', jsonb_build_object('subtitles', jsonb_build_array(jsonb_build_object('language', 'vi'), jsonb_build_object('language', 'en')))
          )
        ) FILTER (WHERE e.id IS NOT NULL AND e.production_status = 'PUBLISHED'),
        '[]'
      ) as episodes
    FROM movies m
    LEFT JOIN movie_genres mg ON mg.movie_id = m.id
    LEFT JOIN genres g ON g.id = mg.genre_id
    LEFT JOIN episodes e ON e.movie_id = m.id
    GROUP BY m.id
    HAVING COUNT(CASE WHEN e.production_status = 'PUBLISHED' THEN 1 END) > 0
    ORDER BY m.created_at DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
}

export async function getDbGenres() {
  const { rows } = await pool.query(`SELECT id, name, description FROM genres ORDER BY name ASC;`);
  return rows;
}
