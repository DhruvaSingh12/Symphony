import { z } from "zod";

export const SongSchema = z.object({
  id: z.number(),
  user_id: z.string().nullish().transform(val => val ?? null),
  artist: z.array(z.string()).nullish().transform(val => val ?? null)
    .or(z.string().transform(s => [s]).nullish().transform(val => val ?? null)),
  title: z.string().nullish().transform(val => val ?? null),
  song_path: z.string().nullish().transform(val => val ?? null),
  image_path: z.string().nullish().transform(val => val ?? null),
  created_at: z.string().nullish().transform(val => val ?? null),
  updated_at: z.string().nullish().transform(val => val ?? null),
  album: z.string().nullish().transform(val => val ?? null),
  duration: z.number().nullish().transform(val => val ?? null),
});

export const UserDetailsSchema = z.object({
  id: z.string(),
  full_name: z.string().nullish().transform(val => val ?? null),
  avatar_url: z.string().nullish().transform(val => val ?? null),
  gender: z.string().nullish().transform(val => val ?? null),
  dateOfBirth: z.string().nullish().transform(val => val ?? null),
});

export const PlaylistSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().nullish().transform(val => val ?? null),
  image_path: z.string().nullish().transform(val => val ?? null),
  created_at: z.string().nullish().transform(val => val ?? null),
});

export const PlaylistCollaboratorSchema = z.object({
  id: z.string(),
  playlist_id: z.string(),
  user_id: z.string(),
  invited_by: z.string(),
  invited_at: z.string().nullish().transform(val => val ?? null),
  accepted_at: z.string().nullish().transform(val => val ?? null),
  status: z.enum(['pending', 'accepted', 'declined']),
  created_at: z.string().nullish().transform(val => val ?? null),
  user: UserDetailsSchema.nullish().transform(val => val ?? null),
  playlist: PlaylistSchema.nullish().transform(val => val ?? null),
});

export type SongData = z.infer<typeof SongSchema>;
export type UserDetailsData = z.infer<typeof UserDetailsSchema>;
export type PlaylistData = z.infer<typeof PlaylistSchema>;
export type PlaylistCollaboratorData = z.infer<typeof PlaylistCollaboratorSchema>;

export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fallback: T
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error("Validation failed:", error, "for data:", data);
    return fallback;
  }
}

export function validateArraySafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T[] {
  if (!Array.isArray(data)) return [];
  return data.map(item => {
    try {
      return schema.parse(item);
    } catch (error) {
        console.error("Array validation failed for item:", item, error);
        return null;
    }
  }).filter((item): item is T => item !== null);
}