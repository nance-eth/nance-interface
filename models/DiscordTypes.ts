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

export interface DiscordChannelMetadata {
  archived: boolean;
  create_timestamp?: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  // guild is also called server
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
  // count
  // an approximate count of users in a thread, stops counting at 50
  member_count?: number;
  message_count?: number;
  total_message_sent?: number;
  thread_metadata?: DiscordChannelMetadata;
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

export interface DiscordAttachment {
  id: string;
  content_type: string;
  url: string;
}

export interface DiscordEmbed {
  type?: string;
  title?: string;
  description?: string;
  url?: string;
}

export enum DiscordMessageType {
  DEFAULT = 0,
  CHANNEL_NAME_CHANGE = 4,
  REPLY = 19,
  THREAD_STARTER_MESSAGE = 21,
}

export interface DiscordMessage {
  id: string;
  channel_id: string;
  content: string;
  author: DiscordUser;
  // ISO8601 timestamp
  // e.g "2024-10-25T15:23:24.647000+00:00"
  timestamp: string;
  type: DiscordMessageType;
  mentions: DiscordUser[];
  mention_roles: string[];
  mention_everyone: boolean;
  attachments: DiscordAttachment[];
  embeds: DiscordEmbed[];
  referenced_message?: DiscordMessage;
  // this only exists inside `referenced_message` if the message is a thread starter
  thread?: DiscordChannel;
}
