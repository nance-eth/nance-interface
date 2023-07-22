import { useQuery } from 'graphql-hooks'

const QUERY = `
query SpaceSettings($spaceId: String) {
  space(id: $spaceId) {
    name
    network
    symbol
    private
    admins
    moderators
    members
    categories
    plugins
    voting {
      quorum
      hideAbstain
    }
    strategies {
      name
      network
      params
    }
    validation {
      name
      params
    }
    filters {
      minScore
      onlyMembers
    }
    voteValidation {
      name
      params
    }
    treasuries {
      name
      address
      network
    }
  }
}
`

export interface SpaceSettings {
    name: string;
    avatar: string;
    about: string;
    network: string;
    symbol: string;
    website: string;
    twitter: string;
    github: string;
    coingecko: string;
    domain: string;
    skin: string;
    guidelines: string;
    template: string;
    private: boolean;
    moderators: string[];
    members: string[];
    admins: string[];
    categories: string[];
    plugins: {
      hal: {};
    };
    parent: string;
    children: string[];
    voting: {
      delay: number;
      hideAbstain: boolean;
      period: number;
      quorum: number;
      type: string;
      privacy: string;
    };
    strategies: {
      name: string;
      network: string;
      params: {
        symbol: string;
      };
    }[];
    validation: {
      name: string;
      params: {};
    };
    filters: {
      onlyMembers: boolean;
    };
    voteValidation: {
      name: string;
      params: {};
    };
    treasuries: string[];
}

export default function useSnapshotSpaceSettings(spaceId: string): {data: SpaceSettings | undefined, loading: boolean} {
  const { loading, data } = useQuery<{space: SpaceSettings}>(QUERY, {
        variables: {
          spaceId
        }
    });
    return { loading, data: data?.space };
}