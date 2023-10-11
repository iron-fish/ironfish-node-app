export type SnapshotUpdate = {
    step: 'download'
    totalBytes: number
    currBytes: number
    speed: number
} | {
    step: 'unzip'
    totalEntries: number
    currEntries: number
    speed: number
} | {
    step: 'complete'
}
