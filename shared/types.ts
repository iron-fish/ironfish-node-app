import type { TransactionType } from "@ironfish/sdk";

export type TransactionNote = {
  assetName: string;
  value: string;
  timestamp: number;
  from: string;
  to: string;
  transactionHash: string;
  type: TransactionType;
  memo: string;
  noteHash: string;
  accountName: string;
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
