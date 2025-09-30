"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PESCommentaryListParser = void 0;
const utils_js_1 = require("./utils.js");
const textEncoder = new TextEncoder();
/**
 * Parser for PES (Pro Evolution Soccer) commentary binary files
 * Handles reading, editing, and writing player commentary assignments
 */
class PESCommentaryListParser {
    /**
     * Creates a new parser instance
     * @param metadata - Binary metadata from file header
     * @param pesConfig - Configuration for the PES version
     * @param playerList - Array of player records
     */
    constructor(metadata, pesConfig, playerList) {
        this.metadata = metadata;
        this.pesConfig = pesConfig;
        this.playerList = playerList;
    }
    /**
     * Creates a new player in the commentary list
     * @param data - Object containing commentaryId and playerName
     * @throws {Error} If commentary ID already exists
     * @example
     * parser.createPlayer({ commentaryId: 57123, playerName: 'Mohamed Salah' });
     */
    createPlayer(data) {
        var _a;
        if (!((_a = data.playerName) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new Error("Player name cannot be empty");
        }
        if (data.commentaryId < 0 || data.commentaryId > 999999) {
            throw new Error("Commentary ID must be between 0 and 999999");
        }
        const commentaryName = this.buildCommentaryName(data.commentaryId);
        const index = this.playerList.findIndex((player) => player.commentaryName === commentaryName);
        if (index !== -1)
            throw new Error(`Commentary for id ${(0, utils_js_1.formatTo6String)(data.commentaryId)} already exists`);
        this.playerList.push({
            commentaryName: commentaryName,
            playerName: data.playerName,
        });
    }
    /**
     * Updates a player's display name
     * @param data - Object containing commentaryId and new playerName
     * @throws {Error} If player with given commentary ID is not found
     * @example
     * parser.updatePlayer({ commentaryId: 57123, playerName: 'Mohamed Salah' });
     */
    updatePlayer(data) {
        const commentaryName = this.buildCommentaryName(data.commentaryId);
        const index = this.playerList.findIndex((player) => player.commentaryName === commentaryName);
        if (index === -1)
            throw new Error(`Player with commentary name "${commentaryName}" not found`);
        if (this.playerList[index])
            this.playerList[index].playerName = data.playerName;
    }
    /**
     * Removes a player from the commentary list
     * @param commentaryId - Commentary ID to delete (e.g., 57123)
     * @throws {Error} If player with given commentary ID is not found
     * @example
     * parser.deletePlayer(57123);
     */
    deletePlayer(commentaryId) {
        const commentaryName = this.buildCommentaryName(commentaryId);
        const index = this.playerList.findIndex((player) => player.commentaryName === commentaryName);
        if (index === -1) {
            throw new Error(`Player with commentary name "${commentaryName}" not found`);
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
        const buffer = new ArrayBuffer(this.pesConfig.COMMENTARY_START_OFFSET +
            this.playerList.length * this.pesConfig.RECORD_SIZE);
        const intBuffer = new Uint8Array(buffer);
        // Write header
        intBuffer.set(this.metadata.first);
        intBuffer.set((0, utils_js_1.decimalToBytes)(this.playerList.length), 16);
        intBuffer.set(this.metadata.second, 20);
        // Build alphabetical index (A-Z cumulative counts)
        let sum = 0;
        let alphabetPointer = 36;
        const { sorted, counts } = (0, utils_js_1.sortAndCountPlayers)(this.playerList);
        Object.values(counts).forEach((count) => {
            sum += count;
            intBuffer.set((0, utils_js_1.decimalToBytes)(sum), alphabetPointer);
            alphabetPointer += 4;
        });
        // Write total counts
        intBuffer.set((0, utils_js_1.decimalToBytes)(this.playerList.length), 136);
        intBuffer.set((0, utils_js_1.decimalToBytes)(this.playerList.length), 140);
        // Write player records
        let pointer = this.pesConfig.COMMENTARY_START_OFFSET;
        sorted.forEach((value) => {
            const commentaryName = textEncoder.encode(value.commentaryName);
            intBuffer.set(commentaryName.slice(0, this.pesConfig.COMMENTARY_NAME_LENGTH), pointer);
            const playerName = textEncoder.encode(value.playerName);
            intBuffer.set(playerName.slice(0, this.pesConfig.PLAYER_NAME_OFFSET + this.pesConfig.PLAYER_NAME_LENGTH), pointer + this.pesConfig.COMMENTARY_NAME_LENGTH);
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
    static parse(file, pesConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield file.arrayBuffer();
            const fileBuffer = new Uint8Array(buffer);
            if (fileBuffer.length < pesConfig.COMMENTARY_START_OFFSET) {
                throw new Error(`File too small: ${fileBuffer.length} bytes`);
            }
            if (!(0, utils_js_1.isBinaryValid)(fileBuffer)) {
                throw new Error("Invalid file. Make sure your file is correct");
            }
            const metadata = {
                first: fileBuffer.slice(0, 16),
                second: fileBuffer.slice(20, 36),
            };
            const players = [];
            let pointer = pesConfig.COMMENTARY_START_OFFSET;
            while (pointer + pesConfig.RECORD_SIZE <= buffer.byteLength) {
                const commentaryName = (0, utils_js_1.readString)(fileBuffer, pointer, pesConfig.COMMENTARY_NAME_LENGTH);
                const playerName = (0, utils_js_1.readString)(fileBuffer, pointer +
                    pesConfig.PLAYER_NAME_OFFSET +
                    pesConfig.COMMENTARY_NAME_LENGTH, pesConfig.PLAYER_NAME_LENGTH);
                players.push({ commentaryName, playerName });
                pointer += pesConfig.RECORD_SIZE;
            }
            return new PESCommentaryListParser(metadata, pesConfig, players);
        });
    }
    /**
     * Create commentary name with commentary prefix
    */
    buildCommentaryName(commentaryId) {
        return `${this.pesConfig.COMMENTARY_PREFIX}${(0, utils_js_1.formatTo6String)(commentaryId)}`;
    }
}
exports.PESCommentaryListParser = PESCommentaryListParser;
