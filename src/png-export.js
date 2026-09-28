/* PNG export helpers shared by the editor and Node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PNGExport = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DPI = 300;
  const CSS_DPI = 96;
  const MAX_PIXELS = 16_000_000;
  const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
  const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    return value >>> 0;
  });

  function scale(width, height, dpi = DPI) {
    if (![width, height, dpi].every(Number.isFinite) || width <= 0 || height <= 0 || dpi <= 0) {
      throw new Error('PNG dimensions and DPI must be positive numbers.');
    }
    return Math.min(dpi / CSS_DPI, Math.sqrt(MAX_PIXELS / (width * height)));
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const bytes = new Uint8Array(data.length + 12);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, data.length);
    for (let index = 0; index < 4; index++) bytes[index + 4] = type.charCodeAt(index);
    bytes.set(data, 8);
    view.setUint32(bytes.length - 4, crc32(bytes.subarray(4, bytes.length - 4)));
    return bytes;
  }

  function withDpi(png, dpi = DPI) {
    const source = png instanceof Uint8Array ? png : new Uint8Array(png);
    if (!Number.isFinite(dpi) || dpi <= 0 || PNG_SIGNATURE.some((value, index) => source[index] !== value)) {
      throw new Error('Expected a PNG image and a positive DPI value.');
    }
    const pixelsPerMeter = Math.round(dpi / 0.0254);
    const density = new Uint8Array(9);
    const densityView = new DataView(density.buffer);
    densityView.setUint32(0, pixelsPerMeter);
    densityView.setUint32(4, pixelsPerMeter);
    density[8] = 1;

    const chunks = [source.slice(0, 8)];
    let offset = 8;
    let foundHeader = false;
    let foundEnd = false;
    while (offset + 12 <= source.length) {
      const length = new DataView(source.buffer, source.byteOffset + offset, 4).getUint32(0);
      const end = offset + length + 12;
      if (end > source.length) throw new Error('PNG contains a truncated chunk.');
      const type = String.fromCharCode(...source.subarray(offset + 4, offset + 8));
      if (type === 'IHDR') {
        foundHeader = true;
        chunks.push(source.slice(offset, end), chunk('pHYs', density));
      } else if (type !== 'pHYs') {
        chunks.push(source.slice(offset, end));
      }
      offset = end;
      if (type === 'IEND') {
        foundEnd = true;
        break;
      }
    }
    if (!foundHeader || !foundEnd || offset !== source.length) throw new Error('PNG chunk structure is invalid.');

    const result = new Uint8Array(chunks.reduce((total, part) => total + part.length, 0));
    let cursor = 0;
    for (const part of chunks) {
      result.set(part, cursor);
      cursor += part.length;
    }
    return result;
  }

  return { DPI, MAX_PIXELS, scale, withDpi };
});
