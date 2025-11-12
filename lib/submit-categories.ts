export type CatKey =
  | "LOVE" | "HIPHOP" | "PARTY" | "LATE_NIGHT" | "DRIVING" | "SMOKING_CHILL" | "SOBER"
  | "BROKEN_HEARTED" | "GYM_SESSION" | "LATE_NIGHT_DRIVE" | "LONELY_WALKER"
  | "CLUB_VIBES" | "SPECIAL_SOMEONE" | "BATHROOM_CRONS" | "SOULFUL";

export const CATS: { key: CatKey; label: string; hint: string; emoji: string }[] = [
  { key: "LOVE", label: "Love", hint: "Romance & heartbreak", emoji: "💞" },
  { key: "HIPHOP", label: "Hip-Hop", hint: "Rap, drill, trap", emoji: "🎤" },
  { key: "PARTY", label: "Party", hint: "Club bangers", emoji: "🎉" },
  { key: "LATE_NIGHT", label: "Late Night Vibes", hint: "Chill, moody, ambient", emoji: "🌙" },
  { key: "DRIVING", label: "Driving", hint: "Road trip energy", emoji: "🚗" },
  { key: "SMOKING_CHILL", label: "Smoking / Chill", hint: "Laid-back haze", emoji: "🌀" },
  { key: "SOBER", label: "Sober", hint: "Clean & clear", emoji: "🧊" },
  { key: "BROKEN_HEARTED", label: "Broken Hearted", hint: "Heartbreak & reflection", emoji: "💔" },
  { key: "GYM_SESSION", label: "Gym Session", hint: "Energy boosters", emoji: "🏋️" },
  { key: "LATE_NIGHT_DRIVE", label: "Late Night Drive", hint: "Neon roads & synths", emoji: "🚘" },
  { key: "LONELY_WALKER", label: "Lonely Walker", hint: "Solo stride soundtrack", emoji: "🚶" },
  { key: "CLUB_VIBES", label: "Club Vibes", hint: "Dance floor heaters", emoji: "💃" },
  { key: "SPECIAL_SOMEONE", label: "Special Someone", hint: "Dedications & butterflies", emoji: "💘" },
  { key: "BATHROOM_CRONS", label: "Bathroom Crons", hint: "Shower solos & echoes", emoji: "🛁" },
  { key: "SOULFUL", label: "Soulful", hint: "Warm vocals & grooves", emoji: "🎷" },
];

export const catLabel = (k: CatKey) => CATS.find(c => c.key === k)?.label ?? k;
export const catEmoji = (k: CatKey) => CATS.find(c => c.key === k)?.emoji ?? "🎵";
