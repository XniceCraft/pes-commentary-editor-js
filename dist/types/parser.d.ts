import type { PESConfig } from "./parser_config.js";
import type { CommentaryMetadata, CommentaryRecord, CommentaryUpsert } from "./types.js";
/**
 * Parser for PES (Pro Evolution Soccer) commentary binary files
 * Handles reading, editing, and writing player commentary assignments
 */
export declare class PESCommentaryListParser {
    readonly pesConfig: PESConfig;
    readonly metadata: CommentaryMetadata;
    readonly playerList: CommentaryRecord[];
    /**
     * Creates a new parser instance
     * @param metadata - Binary metadata from file header
     * @param pesConfig - Configuration for the PES version
     * @param playerList - Array of player records
     */
    constructor(metadata: CommentaryMetadata, pesConfig: PESConfig, playerList: CommentaryRecord[]);
    /**
     * Creates a new player in the commentary list
     * @param data - Object containing commentaryId and playerName
     * @throws {Error} If commentary ID already exists
     * @example
     * parser.createPlayer({ commentaryId: 57123, playerName: 'Mohamed Salah' });
     */
    createPlayer(data: CommentaryUpsert): void;
    /**
     * Updates a player's display name
     * @param data - Object containing commentaryId and new playerName
     * @throws {Error} If player with given commentary ID is not found
     * @example
     * parser.updatePlayer({ commentaryId: 57123, playerName: 'Mohamed Salah' });
     */
    updatePlayer(data: CommentaryUpsert): void;
    /**
     * Removes a player from the commentary list
     * @param commentaryId - Commentary ID to delete (e.g., 57123)
     * @throws {Error} If player with given commentary ID is not found
     * @example
     * parser.deletePlayer(57123);
     */
    deletePlayer(commentaryId: CommentaryUpsert["commentaryId"]): void;
    /**
     * Saves the modified player list to a binary buffer
     * Creates a properly formatted PES commentary file with:
     * - Header and metadata
     * - Alphabetical index (A-Z cumulative counts)
     * - Sorted player records
     * @returns ArrayBuffer containing the complete binary file
     * @example
     * const binary = parser.save();
     * const blob = new Blob([binary], { type: 'application/octet-stream' });
     * // Download or save the blob
     */
    save(): ArrayBuffer;
    /**
     * Parses a PES commentary binary file
     * @param file - Binary file to parse
     * @param pesConfig - Configuration for the PES version
     * @returns Promise resolving to a parser instance
     * @throws {Error} If file is too small (< COMMENTARY_START_OFFSET bytes)
     * @throws {Error} If file format is invalid (missing magic bytes or metadata)
     * @example
     * const file = event.target.files[0];
     * const parser = await PESCommentaryListParser.parse(file, PES2021Config);
     * console.log(parser.playerList.length); // Number of players
     */
    static parse(file: File, pesConfig: PESConfig): Promise<PESCommentaryListParser>;
    /**
     * Create commentary name with commentary prefix
    */
    private buildCommentaryName;
}
