import type { CommentaryRecord, SortedPlayersResult } from "./types.js";
/**
 * Removes null bytes and whitespace from a binary string buffer
 * @param buffer - Uint8Array containing encoded string data
 * @returns Cleaned and trimmed string
 * @example
 * const bytes = new Uint8Array([77, 101, 115, 115, 105, 0, 0]);
 * cleanString(bytes); // "Messi"
 */
export declare function cleanString(buffer: Uint8Array): string;
/**
 * Validates if the file is a valid PES commentary binary
 * Checks for:
 * - Magic bytes "SEPD" at start
 * - Zero bytes in metadata section (24-36)
 * @param buffer - File buffer to validate
 * @returns True if file format is valid
 * @example
 * const fileBuffer = new Uint8Array(arrayBuffer);
 * if (!isBinaryValid(fileBuffer)) {
 *   throw new Error("Invalid PES file");
 * }
 */
export declare function isBinaryValid(buffer: Uint8Array<ArrayBuffer>): boolean;
/**
 * Converts a number to a 4-byte little-endian array
 * Used for writing integer values to binary files
 * @param num - Number to convert (32-bit unsigned integer)
 * @returns 4-byte Uint8Array in little-endian format
 * @example
 * decimalToBytes(1000); // Uint8Array [232, 3, 0, 0]
 */
export declare function decimalToBytes(num: number): Uint8Array<ArrayBuffer>;
/**
 * Sorts players alphabetically and counts them by first letter
 * Creates an index structure for A-Z navigation in the game
 * @param players - Array of player records to sort and count
 * @returns Object containing sorted array and letter counts
 * @example
 * const { sorted, counts } = sortAndCountPlayers(players);
 * console.log(counts['M']); // Number of players starting with 'M'
 */
export declare function sortAndCountPlayers(players: CommentaryRecord[]): SortedPlayersResult;
/**
 * Formats a number to a 6-digit string with leading zeros
 * Takes the last 6 digits if the number is longer than 6 digits
 * @param num - Number to format
 * @returns 6-character string with leading zeros
 * @example
 * formatTo6String(123); // "000123"
 * formatTo6String(57123); // "057123"
 * formatTo6String(1234567); // "234567"
 */
export declare function formatTo6String(num: number): string;
/**
 * Reads a null-terminated string from a buffer at a specific offset
 * @param buffer - Buffer to read from
 * @param offset - Starting position in bytes
 * @param length - Maximum length to read in bytes
 * @returns Cleaned string without null bytes or trailing whitespace
 * @example
 * const name = PESCommentaryListParser.readString(buffer, 144, 16);
 */
export declare function readString(buffer: Uint8Array<ArrayBuffer>, offset: number, length: number): string;
