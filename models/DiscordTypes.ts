export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | null;
  banner_color: string | null;
  accent_color: number | null;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
  avatar_decoration: string | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | undefined;
  owner: boolean;
  permissions: string;
  features: string[];
  approximate_member_count: number;
  approximate_presence_count: number;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  guild_id: string;
  position: number;
  permission_overwrites: any[];
  rate_limit_per_user: number;
  nsfw: boolean;
  topic: string | null;
  last_message_id: string | null;
  bitrate: number;
  user_limit: number;
  parent_id: string | null;
  last_pin_timestamp: string | null;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  flags: number;
}

export interface DiscordUserAuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  state: string;
}

export interface DiscordMessage {
  id: string;
  content: string;
  author: DiscordUser;
  // ISO8601 timestamp
  // e.g "2024-10-25T15:23:24.647000+00:00"
  timestamp: string;
  // 0 for default, 19 for reply
  type: number;
  mentions: DiscordUser[];
  mention_roles: DiscordRole[];
  mention_everyone: boolean;
}
