import { createFileRoute } from "@tanstack/react-router";
import { Camera, ChevronLeft, ChevronRight, Gamepad2, Music2, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import musicFile from "../assets/music.mp3";
import { registerVisitorCount } from "../lib/api/visitor-counter.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "diozis" },
      { name: "description", content: "diozis" },
      { property: "og:title", content: "diozis" },
      { property: "og:description", content: "diozis" },
    ],
  }),
  component: Index,
});

const DISCORD_ID = "535560410628227082";

const links = [
  { label: "instagram", href: "https://instagram.com/yusufi.06_", handle: "@yusufi.06_" },
  {
    label: "spotify",
    href: "https://open.spotify.com/user/31m67wuenroyvsrskntlb7ptru6i",
    handle: "Yusuf Aciolglu",
  },
  {
    label: "steam",
    href: "https://steamcommunity.com/id/deloynde_official/",
    handle: "deloynde_official",
  },
];

const linkIcons = {
  instagram: Camera,
  spotify: Music2,
  steam: Gamepad2,
} as const;

const MUSIC_VOLUME = 0.01;

const favoriteGames = [
  {
    title: "Farming Simulator",
    subtitle: "rahat kafa, uzun seans",
    tag: "sim",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1248130/header.jpg",
  },
  {
    title: "Counter-Strike 2",
    subtitle: "rekabet, refleks, clutch",
    tag: "fps",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
  },
  {
    title: "Valorant",
    subtitle: "aim + utility dengesi",
    tag: "taktiksel",
    image: "https://i.pinimg.com/736x/cf/ae/88/cfae886e263126f685510e2f45b82970.jpg",
  },
  {
    title: "League of Legends",
    subtitle: "mekanik, map bilgisi, tilt",
    tag: "moba",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScT0lB7ecC8AIDqxePWYHnx1FNdt2QDSj6Jw&s",
  },
  {
    title: "Euro Truck Simulator 2",
    subtitle: "uzun yollar, sakin kafa, gece sürüşü",
    tag: "simülasyon",
    image:
      "https://images.steamusercontent.com/ugc/797615631997451284/535D67FF80F9EB8FC9420FF44B6B7A96E882BDA9/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true",
  },
  {
    title: "TeamFight Tactics",
    subtitle: "komp kur, ekonomiyi yönet, sona kal",
    tag: "strateji",
    image:
      "https://cdnb.artstation.com/p/assets/covers/images/025/410/377/large/t-j-geisen-tft-iconv2-artstation-thumbnail.jpg?1585702150",
  },
] as const;

type LanyardTimestamps = {
  start?: number;
  end?: number;
};

type LanyardActivityAssets = {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
};

type LanyardActivity = {
  application_id?: string;
  assets?: LanyardActivityAssets;
  buttons?: string[];
  content_classification?: {
    data?: unknown;
    loaded?: boolean;
  };
  created_at?: number;
  details?: string;
  emoji?: {
    animated?: boolean;
    id?: string | null;
    name?: string;
  };
  flags?: number;
  id: string;
  name: string;
  party?: {
    id?: string;
    size?: [number, number];
  };
  session_id?: string;
  state?: string;
  sync_id?: string;
  timestamps?: LanyardTimestamps;
  type: number;
};

type LanyardSpotify = {
  album: string;
  album_art_url: string;
  artist: string;
  song: string;
  timestamps: {
    start: number;
    end: number;
  };
  track_id: string;
};

type DiscordUser = {
  avatar: string | null;
  avatar_decoration_data?: {
    asset?: string;
    expires_at?: number | null;
    sku_id?: string;
  } | null;
  bot?: boolean;
  collectibles?: {
    nameplate?: {
      asset?: string;
      expires_at?: number | null;
      label?: string;
      palette?: string;
      sku_id?: string;
    } | null;
  } | null;
  discriminator: string;
  display_name?: string | null;
  display_name_styles?: {
    colors?: number[];
    effect_id?: number;
    font_id?: number;
  } | null;
  global_name: string | null;
  id: string;
  primary_guild?: {
    badge?: string;
    identity_enabled?: boolean;
    identity_guild_id?: string;
    tag?: string;
  } | null;
  public_flags?: number;
  username: string;
};

type LanyardData = {
  active_on_discord_desktop?: boolean;
  active_on_discord_embedded?: boolean;
  active_on_discord_mobile?: boolean;
  active_on_discord_vr?: boolean;
  active_on_discord_web?: boolean;
  activities: LanyardActivity[];
  discord_status: "online" | "idle" | "dnd" | "offline";
  discord_user: DiscordUser;
  kv: Record<string, string>;
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
};

type LanyardApiResponse = {
  data?: LanyardData;
  success?: boolean;
};

const statusColor: Record<string, string> = {
  online: "#22c55e",
  idle: "#f59e0b",
  dnd: "#ef4444",
  offline: "#6b7280",
};

const statusLabel: Record<string, string> = {
  online: "çevrimiçi",
  idle: "boşta",
  dnd: "rahatsız etme",
  offline: "çevrimdışı",
};

const activityTypeLabel: Record<number, string> = {
  0: "oynuyor",
  1: "yayında",
  2: "dinliyor",
  3: "izliyor",
  4: "özel durum",
  5: "yarışıyor",
};

function formatDateTime(value?: number) {
  if (!value) return "—";
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });
}

function getAvatarUrl(user: DiscordUser | undefined) {
  if (!user?.avatar) return "https://cdn.discordapp.com/embed/avatars/0.png";
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
}

function getActivityAssetUrl(activity: LanyardActivity, image?: string) {
  if (!image) return null;
  if (image.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${image.replace("spotify:", "")}`;
  }
  if (image.startsWith("mp:external/")) {
    return `https://media.discordapp.net/${image.replace("mp:", "")}`;
  }
  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`;
  }
  return null;
}

function Index() {
  const [time, setTime] = useState("");
  const [lanyard, setLanyard] = useState<LanyardData | null>(null);
  const [favoriteGameIndex, setFavoriteGameIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const json = (await response.json()) as LanyardApiResponse;

        if (alive && json.success && json.data) {
          setLanyard(json.data);
        }
      } catch {
        // Keep the last successful presence snapshot on screen.
      }
    };

    load();
    const id = setInterval(load, 30000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const applyVolume = () => {
      audio.volume = MUSIC_VOLUME;
    };

    const startPlayback = () => {
      applyVolume();
      void audio.play().catch(() => {
        // Some browsers require a user gesture before audio playback.
      });
    };

    const syncPlaybackState = () => {
      setIsMusicPlaying(!audio.paused);
    };

    startPlayback();
    applyVolume();
    syncPlaybackState();
    audio.addEventListener("play", syncPlaybackState);
    audio.addEventListener("pause", syncPlaybackState);
    audio.addEventListener("play", applyVolume);
    audio.addEventListener("loadeddata", applyVolume);

    const resumeOnInteraction = () => {
      startPlayback();
      window.removeEventListener("click", resumeOnInteraction);
      window.removeEventListener("keydown", resumeOnInteraction);
      window.removeEventListener("touchstart", resumeOnInteraction);
    };

    window.addEventListener("click", resumeOnInteraction);
    window.addEventListener("keydown", resumeOnInteraction);
    window.addEventListener("touchstart", resumeOnInteraction);

    return () => {
      audio.removeEventListener("play", syncPlaybackState);
      audio.removeEventListener("pause", syncPlaybackState);
      audio.removeEventListener("play", applyVolume);
      audio.removeEventListener("loadeddata", applyVolume);
      window.removeEventListener("click", resumeOnInteraction);
      window.removeEventListener("keydown", resumeOnInteraction);
      window.removeEventListener("touchstart", resumeOnInteraction);
    };
  }, []);

  useEffect(() => {
    const storageKey = "dusk-luxe-visitor-id";
    const savedVisitorId = window.localStorage.getItem(storageKey);
    const visitorId = savedVisitorId ?? crypto.randomUUID();

    if (!savedVisitorId) {
      window.localStorage.setItem(storageKey, visitorId);
    }

    void registerVisitorCount({ data: { visitorId } })
      .then((result) => {
        setVisitorCount(result.total);
      })
      .catch(() => {
        // Keep the UI stable even if the counter cannot be reached.
      });
  }, []);

  const user = lanyard?.discord_user;
  const avatarUrl = getAvatarUrl(user);
  const displayName =
    user?.display_name || user?.global_name || user?.username || "bilinmeyen kullanıcı";
  const handle = user?.username ? `@${user.username}` : "@—";
  const status = lanyard?.discord_status ?? "offline";
  const activities = lanyard?.activities ?? [];
  const customStatus = activities.find((activity) => activity.type === 4);
  const mainActivity = activities.find(
    (activity) => activity.type !== 4 && activity.name !== "Spotify",
  );
  const spotify = lanyard?.spotify;
  const mainActivityLargeAsset = mainActivity
    ? getActivityAssetUrl(mainActivity, mainActivity.assets?.large_image)
    : null;
  const mainActivitySmallAsset = mainActivity
    ? getActivityAssetUrl(mainActivity, mainActivity.assets?.small_image)
    : null;
  const activeFavoriteGame = favoriteGames[favoriteGameIndex];

  const spotifyProgress = useMemo(() => {
    if (!spotify?.timestamps?.start || !spotify.timestamps?.end) return 0;
    const total = spotify.timestamps.end - spotify.timestamps.start;
    const elapsed = Date.now() - spotify.timestamps.start;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [spotify]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch(() => {
        // Playback can still be blocked until the user interacts with the page.
      });
      return;
    }

    audio.pause();
  };

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-background text-foreground">
      <audio ref={audioRef} src={musicFile} autoPlay loop preload="auto" />

      <div className="pointer-events-none fixed inset-0 z-0">
        <video
          src="/bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/58 to-background/92" />
        <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-[#E85002]/30 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-[#C10801]/25 blur-[160px]" />
        <div className="absolute inset-0 radial-vignette" />
        <div className="absolute inset-0 grid-fade opacity-70" />
        <div className="absolute inset-0 noise" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-10 hidden xl:block">
        <div className="edge-line left-8" />
        <div className="edge-line right-8" />
      </div>

      <header className="fixed top-0 z-20 w-full px-6 py-5 md:px-10 xl:px-14">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
          <span className="font-mono text-xs tracking-wider text-white/70">
            {time}
            <span className="animate-blink">_</span>
          </span>
        </div>
      </header>

      <section className="relative z-10 min-h-screen px-6 pb-16 pt-28 md:px-10 xl:px-14">
        <div className="mx-auto grid max-w-[1500px] gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:gap-12">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="max-w-lg font-mono text-[11px] uppercase tracking-[0.35em] text-white/45">
                Benim Hakkımda Birşeyler
              </p>
              <h1 className="max-w-5xl text-5xl font-semibold leading-none tracking-[-0.05em] text-white sm:text-6xl md:text-7xl xl:text-[7rem]">
                Kendi
                <br />
                hikayenin
                <br />
                <span className="text-orange">kahramanı ol.</span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/72 md:text-lg">
                Ben Yusuf, 17 yaşındayım. Hayatı kasmadan, tamamen akışında ve keyifle yaşamayı
                seviyorum. Yeni insanlarla tanışmak ve gerçekten akan sohbetler etmek tam benim
                olayım. Kimi zaman bir oyunda rekabetin dibine vuruyor, kimi zaman da sadece
                muhabbetin sardığı yerde kalıyorum. Dışarıda yeni yerler keşfetmek ne kadar modumu
                yükseltiyorsa, kulaklığı takıp müzik dinlemek veya iyi bir anime izlemek de beni o
                kadar dinlendiriyor.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="edge-chip rounded-2xl px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  durum
                </p>
                <p className="mt-2 text-sm text-white/84">{statusLabel[status]}</p>
              </div>
              <div className="edge-chip rounded-2xl px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  activity sayısı
                </p>
                <p className="mt-2 text-sm text-white/84">{activities.length}</p>
              </div>
              <div className="edge-chip rounded-2xl px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  spotify
                </p>
                {spotify ? (
                  <div className="mt-2 space-y-1">
                    <p className="truncate text-sm text-white/90">{spotify.song}</p>
                    <p className="truncate text-xs text-white/55">{spotify.artist}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-white/84">kapalı</p>
                )}
              </div>
              <div className="edge-chip rounded-2xl px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  ziyaretçi
                </p>
                <p className="mt-2 text-sm text-white/84">
                  {visitorCount !== null ? visitorCount : "yükleniyor"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="section-panel rounded-[2rem] p-6 md:p-7">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange">
                    canlı özet
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
                    profile snapshot
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">
                      oynadığı
                    </p>
                    <p className="mt-2 break-all text-sm text-white/82">
                      {mainActivity?.name ?? "aktif oyun yok"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">
                      activity type
                    </p>
                    <p className="mt-2 break-all text-sm text-white/82">
                      {mainActivity
                        ? (activityTypeLabel[mainActivity.type] ?? `tip ${mainActivity.type}`)
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">
                      detay
                    </p>
                    <p className="mt-2 break-all text-sm text-white/82">
                      {mainActivity?.details ?? customStatus?.state ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">
                      state
                    </p>
                    <p className="mt-2 break-all text-sm text-white/82">
                      {mainActivity?.state ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">
                      spotify
                    </p>
                    <p className="mt-2 break-all text-sm text-white/82">
                      {spotify ? spotify.song : "kapalı"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="section-panel rounded-[2rem] p-6 md:p-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange">
                  spotify now
                </p>
                {spotify ? (
                  <div className="mt-5 space-y-5">
                    <img
                      src={spotify.album_art_url}
                      alt={spotify.album}
                      className="h-44 w-full rounded-[1.6rem] object-cover"
                    />
                    <div className="space-y-2">
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange/85">
                        çalan şarkı
                      </p>
                      <p className="text-lg font-medium text-white">{spotify.song}</p>
                      <p className="text-sm text-white/72">{spotify.artist}</p>
                    </div>
                    <div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-orange transition-[width]"
                          style={{ width: `${spotifyProgress}%` }}
                        />
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                          süre
                        </p>
                        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                          <span>{formatDateTime(spotify.timestamps.start)}</span>
                          <span>{formatDateTime(spotify.timestamps.end)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-white/70">
                    Şu anda Spotify dinlemiyor.
                  </p>
                )}
              </div>
            </div>

            <div className="section-panel rounded-[2rem] p-6 md:p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange">
                bağlantılar
              </p>
              <div className="mt-5 grid gap-2.5 md:grid-cols-2">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group glass flex items-center justify-between rounded-2xl px-5 py-3.5 transition hover:border-orange/60 hover:shadow-glow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = linkIcons[link.label as keyof typeof linkIcons];
                        return (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition group-hover:border-orange/40 group-hover:bg-orange/10 group-hover:text-orange">
                            <Icon className="h-4 w-4" strokeWidth={1.9} />
                          </span>
                        );
                      })()}
                      <span className="font-mono text-xs uppercase tracking-widest text-white/70 group-hover:text-white">
                        {link.label}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-white/70 group-hover:text-orange">
                      {link.handle} →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:pt-10">
            <div className="section-panel rounded-[2rem] p-3 shadow-glow">
              <div className="relative overflow-hidden rounded-[1.6rem] bg-black/35">
                <div className="relative h-40 overflow-hidden bg-brand-gradient">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                </div>

                <div className="relative px-6 pb-7">
                  <div className="-mt-16 mb-5 flex items-end justify-between gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-orange/40 blur-xl" />
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        width={120}
                        height={120}
                        className="relative h-28 w-28 rounded-full border-4 border-black/70 object-cover"
                      />
                      <span
                        className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-black/80"
                        style={{ background: statusColor[status] }}
                      >
                        <span className="h-2 w-2 rounded-full bg-black/60" />
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
                        durum
                      </p>
                      <p className="mt-2 text-sm text-white/78">{statusLabel[status]}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-3xl font-semibold tracking-tight text-white">
                      {displayName}
                    </h2>
                    <p className="font-mono text-xs text-white/60">
                      {handle} <span className="text-orange">·</span> ID {user?.id ?? DISCORD_ID}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-orange">
                        discord id
                      </p>
                      <p className="mt-2 break-all text-sm text-white/82">
                        {user?.id ?? DISCORD_ID}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-orange">
                        username
                      </p>
                      <p className="mt-2 break-all text-sm text-white/82">
                        {user?.username ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-orange">
                        display name
                      </p>
                      <p className="mt-2 break-all text-sm text-white/82">{displayName}</p>
                    </div>
                  </div>

                  <div className="my-5 h-px bg-white/10" />

                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-orange">
                        oynadığı oyun / aktivite
                      </p>
                      {mainActivity ? (
                        <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">
                                {activityTypeLabel[mainActivity.type] ?? `tip ${mainActivity.type}`}
                              </p>
                              <h3 className="mt-2 text-lg font-medium text-white">
                                {mainActivity.name}
                              </h3>
                              {mainActivity.details ? (
                                <p className="mt-2 text-sm text-white/78">{mainActivity.details}</p>
                              ) : null}
                              {mainActivity.state ? (
                                <p className="mt-1 text-sm text-white/62">{mainActivity.state}</p>
                              ) : null}
                            </div>
                            {mainActivityLargeAsset ? (
                              <img
                                src={mainActivityLargeAsset}
                                alt={mainActivity.assets?.large_text ?? mainActivity.name}
                                className="h-16 w-16 rounded-2xl object-cover"
                              />
                            ) : null}
                          </div>

                          {mainActivity.assets?.large_text ||
                          mainActivity.assets?.small_text ||
                          mainActivitySmallAsset ? (
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              {mainActivity.assets?.large_text ? (
                                <span className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
                                  {mainActivity.assets.large_text}
                                </span>
                              ) : null}
                              {mainActivity.assets?.small_text ? (
                                <span className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
                                  {mainActivity.assets.small_text}
                                </span>
                              ) : null}
                              {mainActivitySmallAsset ? (
                                <img
                                  src={mainActivitySmallAsset}
                                  alt={mainActivity.assets?.small_text ?? mainActivity.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-white/78">aktif oyun yok</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-orange">
                        custom status
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/82">
                        {customStatus?.emoji?.name ? `${customStatus.emoji.name} ` : ""}
                        {customStatus?.state ?? "aktif özel durum yok"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-panel rounded-[2rem] p-6 md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange">
                    favori oyunlarım
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFavoriteGameIndex(
                        (current) => (current - 1 + favoriteGames.length) % favoriteGames.length,
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-orange/50 hover:bg-orange/10 hover:text-orange"
                    aria-label="Önceki oyun"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFavoriteGameIndex((current) => (current + 1) % favoriteGames.length)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-orange/50 hover:bg-orange/10 hover:text-orange"
                    aria-label="Sonraki oyun"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative mt-6 h-[21rem]">
                {favoriteGames.map((game, index) => {
                  const offset =
                    (index - favoriteGameIndex + favoriteGames.length) % favoriteGames.length;

                  if (offset > 2) return null;

                  const stackStyles = [
                    "z-30 translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100",
                    "z-20 translate-x-5 translate-y-4 rotate-[3deg] scale-[0.96] opacity-[0.55]",
                    "z-10 translate-x-10 translate-y-8 rotate-[6deg] scale-[0.92] opacity-30",
                  ] as const;

                  return (
                    <article
                      key={game.title}
                      className={`absolute inset-0 overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/35 shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-all duration-500 ${stackStyles[offset]}`}
                    >
                      <img
                        src={game.image}
                        alt={game.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/42 to-black/8" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,80,2,0.24),transparent_35%)]" />

                      {offset === 0 ? (
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <div className="inline-flex rounded-full border border-white/12 bg-black/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-orange">
                            {game.tag}
                          </div>
                          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
                            {game.title}
                          </h3>
                          <p className="mt-2 text-sm text-white/72">{game.subtitle}</p>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
                    sıradaki görünüm
                  </p>
                  <p className="mt-2 text-sm text-white/82">{activeFavoriteGame.title}</p>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">
                  {String(favoriteGameIndex + 1).padStart(2, "0")} /{" "}
                  {String(favoriteGames.length).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-6 font-mono text-[10px] uppercase tracking-widest text-white/50 md:px-10 xl:px-14">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={toggleMusic}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-white/60 transition hover:border-orange/50 hover:bg-orange/10 hover:text-orange"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/70 transition group-hover:border-orange/40 group-hover:text-orange">
              {isMusicPlaying ? (
                <Pause className="h-3.5 w-3.5" strokeWidth={1.9} />
              ) : (
                <Play className="h-3.5 w-3.5" strokeWidth={1.9} />
              )}
            </span>
            {isMusicPlaying ? "müziği durdur" : "müziği aç"}
          </button>

          <a
            href="https://instagram.com/doruhk"
            target="_blank"
            rel="noreferrer"
            className="hover:text-orange transition-colors"
          >
            made by doruhk with ❤️
          </a>
        </div>
      </footer>
    </main>
  );
}
