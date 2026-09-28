const test = require('node:test');
const assert = require('node:assert/strict');
const PNG = require('../src/png-export.js');

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const chunkBytes = Buffer.alloc(data.length + 12);
  chunkBytes.writeUInt32BE(data.length, 0);
  chunkBytes.write(type, 4, 4, 'ascii');
  data.copy(chunkBytes, 8);
  chunkBytes.writeUInt32BE(crc32(chunkBytes.subarray(4, chunkBytes.length - 4)), chunkBytes.length - 4);
  return chunkBytes;
}

function fixturePng() {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(1, 0);
  header.writeUInt32BE(1, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const oldDensity = Buffer.alloc(9);
  oldDensity.writeUInt32BE(3780, 0);
  oldDensity.writeUInt32BE(3780, 4);
  oldDensity[8] = 1;
  return Buffer.concat([
    signature,
    chunk('IHDR', header),
    chunk('pHYs', oldDensity),
    chunk('IDAT', Buffer.alloc(0)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function pngChunks(bytes) {
  const chunks = [];
  let offset = 8;
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    chunks.push({ type, data: bytes.subarray(offset + 8, offset + 8 + length), crcOffset: offset + 8 + length });
    offset += length + 12;
  }
  return chunks;
}

test('300 dpi export scales CSS pixels to print pixels and caps oversized canvases', () => {
  assert.equal(PNG.DPI, 300);
  assert.equal(PNG.scale(1200, 600), 300 / 96);
  assert.ok(PNG.scale(5000, 5000) < 300 / 96);
  assert.throws(() => PNG.scale(0, 10), /positive numbers/);
});

test('PNG density metadata is set to 300 dpi with a valid pHYs CRC', () => {
  const output = Buffer.from(PNG.withDpi(fixturePng(), 300));
  const chunks = pngChunks(output);
  const density = chunks.filter((item) => item.type === 'pHYs');
  assert.equal(density.length, 1);
  assert.equal(density[0].data.readUInt32BE(0), 11811);
  assert.equal(density[0].data.readUInt32BE(4), 11811);
  assert.equal(density[0].data[8], 1);
  const chunkStart = output.indexOf(Buffer.from('pHYs'));
  const densityData = density[0].data;
  const expectedCrc = output.readUInt32BE(density[0].crcOffset);
  assert.equal(crc32(output.subarray(chunkStart, density[0].crcOffset)), expectedCrc);
  assert.equal(densityData.length, 9);
});

test('PNG density update rejects invalid images and resolutions', () => {
  assert.throws(() => PNG.withDpi(Buffer.from('not png')), /Expected a PNG/);
  assert.throws(() => PNG.withDpi(fixturePng(), 0), /Expected a PNG/);
});
