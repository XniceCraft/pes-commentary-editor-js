/**
 * Represents a single player record in the commentary file
 */
export interface CommentaryRecord {
    /** Commentary identifier (e.g., 'EN_A1_P0_RXXXXXX') */
    commentaryName: string;
    /** Display name of the player */
    playerName: string;
}
/**
 * Represents upsert model for commentary record
 */
export interface CommentaryUpsert {
    /** Commentary identifier */
    commentaryId: number;
    /** Display name of the player */
    playerName: string;
}
/**
 * Binary metadata preserved from the original file
 */
export interface CommentaryMetadata {
    /** First 16 bytes of the file header */
    first: Uint8Array<ArrayBuffer>;
    /** Metadata section from bytes 20-36 */
    second: Uint8Array<ArrayBuffer>;
}
/**
 * Result of sorting and counting players by first letter
 */
export interface SortedPlayersResult {
    /** Players sorted alphabetically by player name */
    sorted: CommentaryRecord[];
    /** Count of players for each letter A-Z */
    counts: Record<string, number>;
}
