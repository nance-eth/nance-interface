export interface APIResponse<T> {
  success: boolean;
  error: string;
  data: T;
}

export type SpaceInfo = {
  name: string,
  currentCycle: number,
  currentEvent: {
    title: string,
    start: string,
    end: string
  }
};

export type ProposalUploadPayload = {
  hash: string;
}

export type APIErrorResponse = APIResponse<undefined>;

interface BaseRequest {
  space: string;
}

export interface ProposalsRequest extends BaseRequest {
  cycle: number | undefined;
  keyword: string | undefined;
}

export type SpaceInfoRequest = BaseRequest;

export interface ProposalRequest extends BaseRequest {
  hash: string;
}

export interface FetchReconfigureRequest extends BaseRequest {
  version: string;
  address: string;
  datetime: string;
  network: string;
}

export interface SubmitTransactionRequest extends BaseRequest {
  version: string;
  datetime: string;
  signature: Signature
}

export interface FetchReconfigureData {
  transaction: NanceBasicTransaction;
  nonce: string;
  safe: string;
}

export interface NanceBasicTransaction {
  address: string;
  bytes: string;
}

export interface Signature {
  address: string;
  signature: string;
  timestamp: number;
}

export interface SignatureRequest {
  signature: Signature
}

export interface ProposalUploadRequest extends SignatureRequest {
  proposal: Pick<Proposal,
    "type" | "version" |
    "title" | "body" |
    "payout" | "reserve" |
    "notification">;
}

export interface ConfigSpaceRequest extends SignatureRequest {
  config: CreateFormValues;
  calendar?: string;
}

export type CreateFormValues = {
  name: string;
  discord: DiscordConfig;
  propertyKeys: Partial<PropertyKeys>;
  juicebox: JuiceboxConfig;
  snapshot: SnapshotConfig;
}

export type DiscordConfig = {
  guildId: string;
  roleIds: DiscordConfigRoles;
  channelIds: DiscordConfigChannels;
}

export type DiscordConfigChannels = {
  proposals: string;
}

export type DiscordConfigRoles = {
  governance: string;
}

export type JuiceboxConfig = {
  projectId: string;
  gnosisSafeAddress: string;
}

export type SnapshotConfig = {
  space: string;
  minTokenPassingAmount: number;
  passingRatio: number;
}

export type CreateFormKeys = 'name' | 'propertyKeys.proposalIdPrefix' |
  `discord.${keyof DiscordConfig}` |
  `discord.channelIds.${keyof DiscordConfigChannels}`|
  `discord.roleIds.${keyof DiscordConfigRoles}` |
  `snapshot.${keyof SnapshotConfig}` |
  `juicebox.${keyof JuiceboxConfig}`

export type ConfigSpacePayload = {
  space: string;
  spaceOwner: string;
}

// from https://github.com/jigglyjams/nance-ts/blob/main/src/types.ts
type ProposalType = 'Payout' | 'ReservedToken' | 'ParameterUpdate' | 'ProcessUpdate' | 'CustomTransaction';

export interface Proposal {
  hash: string;
  title: string;
  body?: string;
  translation?: {
    body?: string;
    language?: string;
  },
  payout?: Payout;
  notification?: Notification;
  reserve?: Reserve;
  url: string;
  governanceCycle?: number;
  date?: string,
  translationURL?: string;
  type?: string;
  status: string;
  proposalId: number | null;
  author?: string;
  discussionThreadURL: string;
  ipfsURL: string;
  voteURL: string;
  voteSetup?: SnapshotVoteOptions;
  internalVoteResults?: InternalVoteResults;
  voteResults?: VoteResults;
  version?: string;
  authorAddress?: string;
  authorDiscordId?: string;
  temperatureCheckVotes?: number[];
  createdTime?: Date;
  lastEditedTime?: Date;
}

export type Payout = {
  type?: 'address' | 'project' | 'allocator';
  address: string;
  project?: number;
  amountUSD: number;
  count: number;
  payName: string;
  uuid?: string;
};

type Notification = {
  discordUserId: string;
  expiry: boolean;
  execution: boolean;
  progress: boolean;
};

export type Reserve = {
  address: string;
  percentage: number;
};

export type ParameterUpdate = {
  durationDays: number;
  discountPercentage: number;
  reservedPercentage: number;
  redemptionPercentage: number;
};

export type InternalVoteResults = {
  voteProposalId: string;
  totalVotes: number;
  scoresState: string;
  scores: Record<string, number>;
  percentages: Record<string, number>;
  outcomePercentage: string;
  outcomeEmoji: string;
};

export type VoteResults = {
  choices: string[];
  scores: number[];
  votes: number;
};

export type GnosisTransaction = {
  address: string;
  bytes: string;
};

export type ProposalNoHash = Omit<Proposal, 'hash'>;

export type ProposalStore = Record<string, ProposalNoHash>;

export interface NanceConfig {
  name: string;
  juicebox: {
    network: string;
    projectId: string;
    gnosisSafeAddress: string;
  };
  discord: {
    API_KEY: string;
    guildId: string;
    roles: {
      governance: string;
    };
    channelIds: {
      proposals: string;
      bookkeeping: string;
      transactions: string;
    }
    poll: {
      voteYesEmoji: string;
      voteNoEmoji: string;
      voteGoVoteEmoji: string;
      votePassEmoji: string;
      voteCancelledEmoji: string;
      minYesVotes: number;
      yesNoRatio: number;
      showResults: boolean;
    };
    reminder: {
      channelIds: string[];
      imagesCID: string;
      imageNames: string[];
      links: Record<string, string>;
    };
  };
  propertyKeys: PropertyKeys;
  notion: {
    API_KEY: string;
    enabled: boolean;
    database_id: string;
    current_cycle_block_id: string;
    payouts_database_id: string;
    reserves_database_id: string;
  };
  dolt: DoltConfig,
  snapshot: {
    base: string;
    space: string;
    choices: string[];
    minTokenPassingAmount: number;
    passingRatio: number;
  };
  calendarCID?: string;
}

export type DoltConfig = {
  enabled: boolean;
  owner: string;
  repo: string;
};

export type PropertyKeys = {
  proposalId: string;
  status: string;
  statusTemperatureCheck: string;
  statusVoting: string;
  statusApproved: string;
  statusCancelled: string;
  proposalIdPrefix: string;
  discussionThread: string;
  ipfs: string;
  vote: string;
  type: string;
  typeRecurringPayout: string;
  typePayout: string;
  governanceCycle: string;
  governanceCyclePrefix: string;
  reservePercentage: string;
  payoutName: string;
  payoutType: string;
  payoutAmountUSD: string;
  payoutAddress: string;
  payoutCount: string;
  payName: string;
  treasuryVersion: string;
  payoutFirstFC: string;
  payoutLastFC: string;
  payoutRenewalFC: string;
  payoutProposalLink: string;
  publicURLPrefix: string;
};

export interface DateEvent {
  title: string;
  start: Date;
  end: Date;
  inProgress: boolean;
}

export interface PollResults {
  voteYesUsers: string[];
  voteNoUsers: string[];
}

export interface PollEmojis {
  voteYesEmoji: string;
  voteNoEmoji: string;
}

export interface PinataKey {
  KEY: string;
  SECRET: string;
}

export interface GithubFileChange {
  path: string,
  contents: string
}

export type SnapshotVoteOptions = {
  type: string,
  choices: string[]
};
