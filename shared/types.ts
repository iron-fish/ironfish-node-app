import type {
  RpcAsset,
  TransactionStatus,
  TransactionType,
} from "@ironfish/sdk";

import type { ChainportTransactionData } from "../main/api/chainport/vendor/utils";

export type TransactionNote = {
  asset?: RpcAsset;
  assetId: string;
  value: string;
  timestamp: number;
  from: string;
  to: string | string[];
  transactionHash: string;
  type: TransactionType;
  status: TransactionStatus;
  memo: string | string[];
  noteHash: string;
  accountName: string;
  chainportData?: ChainportTransactionData;
};

export type SnapshotUpdate =
  | {
      step: "download";
      totalBytes: number;
      currBytes: number;
      speed: number;
    }
  | {
      step: "unzip";
      totalEntries: number;
      currEntries: number;
      speed: number;
    }
  | {
      step: "complete";
    };

export type PartialGithubRelease = {
  id: number;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  body: string;
};
