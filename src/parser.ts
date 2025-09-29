import {
  cleanString,
  decimalToBytes,
  isBinaryValid,
  sortAndCountPlayers,
} from "./utils";
import type { PESConfig } from "./parser_config";
import type { CommentaryMetadata, CommentaryRecord } from "./types";

const textEncoder = new TextEncoder();

/**
 * Parser for PES (Pro Evolution Soccer) commentary binary files
 * Handles reading, editing, and writing player commentary assignments
 */
export class PESCommentaryListParser {
  public readonly pesConfig: PESConfig;
  public readonly metadata: CommentaryMetadata;
  public readonly playerList: CommentaryRecord[];

  /**
   * Creates a new parser instance
   * @param metadata - Binary metadata from file header
   * @param pesConfig - Configuration for the PES version
   * @param playerList - Array of player records
   */
  constructor(
    metadata: CommentaryMetadata,
    pesConfig: PESConfig,
    playerList: CommentaryRecord[],
  ) {
    this.metadata = metadata;
    this.pesConfig = pesConfig;
    this.playerList = playerList;
  }

   /**
   * Create a player
   * @param commentaryId - Commentary identifier (e.g., '57123')
   * @param playerName - Display name for the player
   * @example
   * parser.createPlayer('57123', 'Mohamed Salah');
   */
  createPlayer(commentaryId: string, playerName: string) {
    const commentaryName = `${this.pesConfig.COMMENTARY_PREFIX}${commentaryId}`;
    this.playerList.push({
      commentaryName,
      playerName,
    });
  }

  /**
   * Updates a player's display name
   * @param commentaryName - Commentary identifier to update (e.g., 'EN_A1_P0_R57123')
   * @param playerName - New display name for the player
   * @throws {Error} If player with given commentary name is not found
   * @example
   * parser.updatePlayer('EN_A1_P0_R57123', 'Mohamed Salah');
   */
  updatePlayer(commentaryName: string, playerName: string) {
    const index = this.playerList.findIndex(
      (player) => player.commentaryName === commentaryName,
    );

    if (index === -1) {
      throw new Error(
        `Player with commentary name "${commentaryName}" not found`,
      );
    }

    if (this.playerList[index]) {
      this.playerList[index].playerName = playerName;
    }
  }

  /**
   * Removes a player from the commentary list
   * @param commentaryName - Commentary identifier to delete
   * @throws {Error} If player with given commentary name is not found
   * @example
   * parser.deletePlayer('EN_A1_P0_R57123');
   */
  deletePlayer(commentaryName: string) {
    const index = this.playerList.findIndex(
      (player) => player.commentaryName === commentaryName,
    );

    if (index === -1) {
      throw new Error(
        `Player with commentary name "${commentaryName}" not found`,
      );
    }

    this.playerList.splice(index, 1);
  }

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
  save() {
    const buffer = new ArrayBuffer(
      this.pesConfig.COMMENTARY_START_OFFSET +
        this.playerList.length * this.pesConfig.RECORD_SIZE,
    );
    const intBuffer = new Uint8Array(buffer);

    // Write header
    intBuffer.set(this.metadata.first);
    intBuffer.set(decimalToBytes(this.playerList.length), 16);
    intBuffer.set(this.metadata.second, 20);

    // Build alphabetical index (A-Z cumulative counts)
    let sum = 0;
    let alphabetPointer = 36;
    const { sorted, counts } = sortAndCountPlayers(this.playerList);

    Object.values(counts).forEach((count) => {
      sum += count;

      intBuffer.set(decimalToBytes(sum), alphabetPointer);

      alphabetPointer += 4;
    });

    // Write total counts
    intBuffer.set(decimalToBytes(this.playerList.length), 136);
    intBuffer.set(decimalToBytes(this.playerList.length), 140);

    // Write player records
    let pointer = this.pesConfig.COMMENTARY_START_OFFSET;
    sorted.forEach((value) => {
      const commentaryName = textEncoder.encode(value.commentaryName);
      intBuffer.set(
        commentaryName.slice(0, this.pesConfig.COMMENTARY_NAME_LENGTH),
        pointer,
      );

      const playerName = textEncoder.encode(value.playerName);
      intBuffer.set(
        playerName.slice(
          0,
          this.pesConfig.PLAYER_NAME_OFFSET + this.pesConfig.PLAYER_NAME_LENGTH,
        ),
        pointer + this.pesConfig.COMMENTARY_NAME_LENGTH,
      );

      pointer += this.pesConfig.RECORD_SIZE;
    });

    return buffer;
  }

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
  static async parse(file: File, pesConfig: PESConfig) {
    const buffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(buffer);

    if (fileBuffer.length < pesConfig.COMMENTARY_START_OFFSET) {
      throw new Error(`File too small: ${fileBuffer.length} bytes`);
    }

    if (!isBinaryValid(fileBuffer)) {
      throw new Error("Invalid file. Make sure your file is correct");
    }

    const metadata: CommentaryMetadata = {
      first: fileBuffer.slice(0, 16),
      second: fileBuffer.slice(20, 36),
    };
    const players: Array<CommentaryRecord> = [];

    let pointer = pesConfig.COMMENTARY_START_OFFSET;

    while (pointer + pesConfig.RECORD_SIZE <= buffer.byteLength) {
      const commentaryName = this.readString(
        fileBuffer,
        pointer,
        pesConfig.COMMENTARY_NAME_LENGTH,
      );
      const playerName = this.readString(
        fileBuffer,
        pointer +
          pesConfig.PLAYER_NAME_OFFSET +
          pesConfig.COMMENTARY_NAME_LENGTH,
        pesConfig.PLAYER_NAME_LENGTH,
      );

      players.push({ commentaryName, playerName });

      pointer += pesConfig.RECORD_SIZE;
    }

    return new PESCommentaryListParser(metadata, pesConfig, players);
  }

  /**
   * Reads a null-terminated string from a buffer at a specific offset
   * @param buffer - Buffer to read from
   * @param offset - Starting position in bytes
   * @param length - Maximum length to read in bytes
   * @returns Cleaned string without null bytes or trailing whitespace
   * @example
   * const name = PESCommentaryListParser.readString(buffer, 144, 16);
   */
  static readString(
    buffer: Uint8Array<ArrayBuffer>,
    offset: number,
    length: number,
  ): string {
    const bytes = buffer.slice(offset, offset + length);
    return cleanString(bytes);
  }
}
