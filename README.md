# PES Commentary Editor

A TypeScript library for editing PES (Pro Evolution Soccer) commentary files. Supports PES 2017 and PES 2021 formats.

## Features

- Parse PES commentary binary files
- Edit player names and commentary assignments
- Add and remove players
- TypeScript with full type safety

## Installation

```bash
npm install pes-commentary-editor
```

## Usage

### Basic Parsing

```typescript
import { PESCommentaryListParser, PES2021Config, PES2017Config } from 'pes-commentary-editor';

// Load and parse a PES commentary file
const file = // ... File from input
const parser = await PESCommentaryListParser.parse(file, PES2021Config);

// Access player list
console.log(parser.playerList);
// [
//   { commentaryName: 'EN_A1_P0_R57123', playerName: 'Mohamed Salah' },
//   { commentaryName: 'EN_A1_P0_R44840', playerName: 'Virgil Van Dijk' },
//   ...
// ]
```

### Editing Players

```typescript
// Update a player's name
parser.updatePlayer("57123", "Mohamed Salah");

// Delete a player
parser.deletePlayer("57123");

// Save changes
const modifiedBinary = parser.save();
```

### Supported Game Versions

```typescript
// PES 2021
import { PES2021Config } from "pes-commentary-editor";
const parser = await PESCommentaryListParser.parse(file, PES2021Config);

// PES 2017
import { PES2017Config } from "pes-commentary-editor";
const parser = await PESCommentaryListParser.parse(file, PES2017Config);
```

### Custom Configuration

```typescript
import type { PESConfig } from "pes-commentary-editor";

const customConfig: PESConfig = {
  COMMENTARY_START_OFFSET: 144,
  COMMENTARY_NAME_LENGTH: 16,
  PLAYER_NAME_OFFSET: 16,
  PLAYER_NAME_LENGTH: 64,
  RECORD_SIZE: 96,
};
```

See src/parser_config.ts

## React Integration Example

```typescript
import { useState } from "react";
import { PESCommentaryListParser, PES2021Config } from "pes-commentary-editor";

function PESEditor() {
  const [parser, setParser] = useState<PESCommentaryListParser | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await PESCommentaryListParser.parse(file, PES2021Config);
      setParser(parsed);
    } catch (error) {
      console.error("Failed to parse file:", error);
    }
  };

  const handleUpdate = (commentaryName: string, newName: string) => {
    if (!parser) return;
    parser.updatePlayer(commentaryName, newName);
    setParser({ ...parser }); // Trigger re-render
  };

  const handleSave = () => {
    if (!parser) return;
    const binary = parser.save();

    // Download the file
    const blob = new Blob([binary], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PESNAMELISTDAT.bin";
    a.click();
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept=".bin" />

      {parser && (
        <div>
          <h2>Players: {parser.playerList.length}</h2>
          {/* Render table with players */}
          <button onClick={handleSave}>Save Changes</button>
        </div>
      )}
    </div>
  );
}
```

## Development

### Build

```bash
# Install dependencies
npm install

# Build ESM and CJS
npm run build

# Build individual formats
npm run build:esm
npm run build:cjs
```

### Project Structure

```
src/
├── parser.ts           # Main parser class
├── parser_config.ts    # PES version configurations
├── types.ts           # TypeScript interfaces
└── utils.ts           # Helper functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- PES modding community for reverse engineering the file formats
- All contributors who help improve this tool

## Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check existing issues for solutions
- Contribute improvements via pull requests
