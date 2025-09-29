/**
 * Configuration for parsing PES commentary binary files
 */
export interface PESConfig {
  /** Commentary prefix */
  COMMENTARY_PREFIX: string;
  /** Byte offset where player records begin */
  COMMENTARY_START_OFFSET: number;
  /** Length of commentary name field in bytes */
  COMMENTARY_NAME_LENGTH: number;
  /** Padding bytes between commentary name and player name */
  PLAYER_NAME_OFFSET: number;
  /** Length of player name field in bytes */
  PLAYER_NAME_LENGTH: number;
  /** Total size of each player record in bytes */
  RECORD_SIZE: number;
}

/**
 * Configuration for PES 2021 commentary files
 * - Record size: 96 bytes
 * - Has 16 bytes padding between commentary and player names
 */
export const PES2021Config: PESConfig = {
  COMMENTARY_PREFIX: "EN_A1_P0_R",
  COMMENTARY_START_OFFSET: 144,
  COMMENTARY_NAME_LENGTH: 16,
  PLAYER_NAME_OFFSET: 16,
  PLAYER_NAME_LENGTH: 64,
  RECORD_SIZE: 96,
};

/**
 * Configuration for PES 2017 commentary files
 * - Record size: 80 bytes
 * - No padding between commentary and player names
 */
export const PES2017Config: PESConfig = {
  COMMENTARY_PREFIX: "E_A1_P0_R",
  COMMENTARY_START_OFFSET: 144,
  COMMENTARY_NAME_LENGTH: 16,
  PLAYER_NAME_OFFSET: 0,
  PLAYER_NAME_LENGTH: 64,
  RECORD_SIZE: 80,
};
