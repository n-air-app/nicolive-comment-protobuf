import { Reader, util } from 'protobufjs/minimal';
import { describe, expect, it } from 'vitest';
import { dwango } from '../dist';

// protobufjs は class 要素を objectに変換しようとすると toJSONメソッドが呼ばれるが、
// その変換ルールがデフォルトで Long と enum が Stringになってしまうので、Number に戻してアプリと挙動を合わせる
// (そうしないとエンコードしてデコードするときに元に戻らない)
util.toJSONOptions = { longs: Number, enums: Number, bytes: String };

function toITimestamp(date: Date) {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: (date.getTime() % 1000) * 1000000,
  };
}

describe('encode and decode', () => {
  const now = new Date();

  it('should encode and decode moderatorUpdated message', () => {
    const messages: dwango.nicolive.chat.service.edge.IChunkedMessage[] = [
      {
        message: {
          moderatorUpdated: {
            operation: dwango.nicolive.chat.data.atoms.ModeratorUpdated.ModeratorOperation.ADD,
            operator: {
              userId: 1,
              nickname: 'test',
            },
            updatedAt: toITimestamp(now),
          },
        },
      },
      {
        message: {
          moderatorUpdated: {
            operation: dwango.nicolive.chat.data.atoms.ModeratorUpdated.ModeratorOperation.DELETE,
            operator: {
              userId: 2,
              nickname: 'test2',
            },
            updatedAt: toITimestamp(now),
          },
        },
      },
    ];

    // encode
    const encoded = Uint8Array.from(
      messages
        .map(message => dwango.nicolive.chat.service.edge.ChunkedMessage.encodeDelimited(message).finish())
        .map((b) => Array.from(b))
        .flat()
    );

    // decode and compare
    const reader = new Reader(encoded);
    for (const message of messages) {
      const decoded = dwango.nicolive.chat.service.edge.ChunkedMessage.decodeDelimited(reader);
      expect(JSON.stringify(decoded)).toEqual(JSON.stringify(message));
    }
  });
});
