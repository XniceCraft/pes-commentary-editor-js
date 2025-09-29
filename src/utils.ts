import type { CommentaryRecord, SortedPlayersResult } from "./types.js";

const textDecoder = new TextDecoder("utf-8");

/**
 * Removes null bytes and whitespace from a binary string buffer
 * @param buffer - Uint8Array containing encoded string data
 * @returns Cleaned and trimmed string
 * @example
 * const bytes = new Uint8Array([77, 101, 115, 115, 105, 0, 0]);
 * cleanString(bytes); // "Messi"
 */
export function cleanString(buffer: Uint8Array): string {
  return textDecoder.decode(buffer).replace(/\0.*$/, "").trim();
}

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
export function isBinaryValid(buffer: Uint8Array<ArrayBuffer>): boolean {
  return (
    buffer[0] === 83 &&
    buffer[1] === 69 &&
    buffer[2] === 80 &&
    buffer[3] === 68 &&
    buffer.slice(24, 36).every((byte) => byte === 0)
  );
}

/**
 * Converts a number to a 4-byte little-endian array
 * Used for writing integer values to binary files
 * @param num - Number to convert (32-bit unsigned integer)
 * @returns 4-byte Uint8Array in little-endian format
 * @example
 * decimalToBytes(1000); // Uint8Array [232, 3, 0, 0]
 */
export function decimalToBytes(num: number) {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, num, true);
  return new Uint8Array(buffer);
}

/**
 * Sorts players alphabetically and counts them by first letter
 * Creates an index structure for A-Z navigation in the game
 * @param players - Array of player records to sort and count
 * @returns Object containing sorted array and letter counts
 * @example
 * const { sorted, counts } = sortAndCountPlayers(players);
 * console.log(counts['M']); // Number of players starting with 'M'
 */
export function sortAndCountPlayers(
  players: CommentaryRecord[],
): SortedPlayersResult {
  const sorted = [...players].sort((a, b) =>
    a.playerName.localeCompare(b.playerName, "en", { sensitivity: "base" }),
  );

  const counts: { [key: string]: number } = {};
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    counts[letter] = 0;
  }

  sorted.forEach((player) => {
    const firstChar = player.playerName.charAt(0).toUpperCase();
    if (counts[firstChar] !== undefined) {
      counts[firstChar]++;
    }
  });

  return { sorted, counts };
}
