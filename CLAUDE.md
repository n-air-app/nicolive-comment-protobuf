# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a TypeScript/JavaScript library that provides Protocol Buffer definitions for Niconico Live (nicolive) chat system. The library compiles `.proto` files into TypeScript type definitions and JavaScript modules that can be used in Node.js applications.

## Build System

The project uses a custom build system (`build.js`) that:

1. Reads all `.proto` files from the `proto/` directory
2. Uses `protobufjs-cli` to compile them into:
   - `dist/index.js` - CommonJS JavaScript module (static-module format)
   - `dist/index.d.ts` - TypeScript type definitions

The build is automatically triggered before publishing via the `prepack` script.

## Commands

### Development

- `npm run build` - Compile protobuf definitions to JS and TS
- `npm test` - Run tests with Vitest
- `npm run update-proto` - Update proto files from source repository (requires `../ndgr-edge-proto/` sibling directory)

### Running Single Tests

```bash
npm test -- use-from-ts.test.ts
```

## Architecture

### Proto Definition Sources

The `.proto` files in `proto/dwango/nicolive/chat/` define the message structure for:

- **data/message.proto** - Chat message definitions
- **data/state.proto** - State management messages
- **data/origin.proto** - Origin/source information
- **data/atoms/** - Atomic message types (notifications, moderator actions, forwarded messages, sensitive content)
- **service/edge/payload.proto** - Top-level message containers (`ChunkedMessage`, `PackedSegment`, etc.)

### Generated Output

- `dist/index.js` - Compiled protobuf messages as a CommonJS module with static methods
- `dist/index.d.ts` - TypeScript definitions for type-safe usage
- Exports messages under the `dwango.nicolive.chat.*` namespace hierarchy

### Protocol Buffer Usage Pattern

The library uses `protobufjs` with the static-module format, which generates:

- Constructors for message types
- `encode()` / `decode()` methods for serialization
- `encodeDelimited()` / `decodeDelimited()` for length-prefixed messages
- TypeScript interfaces with `I` prefix (e.g., `IChunkedMessage`)

### Important Configuration Note

When working with this library, configure `protobufjs` JSON conversion to match application behavior:

```typescript
import { util } from 'protobufjs/minimal';
util.toJSONOptions = { longs: Number, enums: Number, bytes: String };
```

This ensures that Long values and enums are converted to Numbers instead of Strings, which is critical for correct encode/decode round-trips.

## Proto File Update Workflow

The `update-proto.js` script syncs proto definitions from a source repository:

1. Expects source files in `../ndgr-edge-proto/` (sibling directory)
2. Removes all comments (line and block comments)
3. Strips content between `__REMOVE_BEGIN__` and `__REMOVE_END__` markers
4. Copies cleaned files to `proto/` directory

This workflow suggests proto definitions are maintained in a separate repository and imported here.

## Testing

Tests use Vitest and verify:

- Encoding/decoding round-trips work correctly
- Generated TypeScript types work as expected
- Messages can be serialized and deserialized with length-delimited format

The test file (`test/use-from-ts.test.ts`) demonstrates proper usage patterns.
