/**
 * Compress the Namaqualand Boulder GLB for production.
 * 
 * Strategy: The gltf-transform webp/resize commands fail on these JPEGs
 * (vips colorspace issue), so we:
 * 1. Take the Draco-compressed GLB (geometry already compressed)
 * 2. Downscale all textures from 2K to 1K using sharp (sufficient for hero animation
 *    where the rock stays at roughly constant apparent screen size)
 * 3. Re-encode as JPEG at quality 75 
 * 4. Re-pack into the GLB
 * 
 * Run: node scripts/compress-boulder.mjs
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const INPUT_GLB = 'public/models/namaqualand-boulder-draco.glb';
const OUTPUT_GLB = 'public/models/namaqualand-boulder.glb';

// GLB format: 12-byte header + JSON chunk + BIN chunk
// Header: magic(4) + version(4) + length(4)
// Each chunk: length(4) + type(4) + data(length)

async function main() {
  const buf = await readFile(INPUT_GLB);
  
  // Parse GLB header
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546C67) throw new Error('Not a GLB file');
  
  const version = buf.readUInt32LE(4);
  const totalLength = buf.readUInt32LE(8);
  
  // Parse JSON chunk
  const jsonChunkLength = buf.readUInt32LE(12);
  const jsonChunkType = buf.readUInt32LE(16);
  const jsonData = buf.subarray(20, 20 + jsonChunkLength);
  const gltf = JSON.parse(jsonData.toString('utf8'));
  
  // Parse BIN chunk
  const binOffset = 20 + jsonChunkLength;
  const binChunkLength = buf.readUInt32LE(binOffset);
  const binChunkType = buf.readUInt32LE(binOffset + 4);
  const binData = Buffer.from(buf.subarray(binOffset + 8, binOffset + 8 + binChunkLength));
  
  console.log(`Input GLB: ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  JSON chunk: ${(jsonChunkLength / 1024).toFixed(1)} KB`);
  console.log(`  BIN chunk: ${(binChunkLength / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Images: ${gltf.images?.length ?? 0}`);
  
  // Process each image: downscale to 1K and re-compress
  const newBinParts = [];
  let currentOffset = 0;
  
  // We need to rebuild the binary buffer. First, copy non-image data.
  // Track which bufferViews are images
  const imageBufferViews = new Set();
  for (const img of (gltf.images || [])) {
    if (img.bufferView !== undefined) {
      imageBufferViews.add(img.bufferView);
    }
  }
  
  // Process buffer views in order, replacing image ones
  const newBufferViews = [];
  const bufferViewOffsets = [];
  
  for (let i = 0; i < gltf.bufferViews.length; i++) {
    const bv = gltf.bufferViews[i];
    const start = bv.byteOffset || 0;
    const length = bv.byteLength;
    let data = binData.subarray(start, start + length);
    
    if (imageBufferViews.has(i)) {
      // This is an image — downscale and recompress
      const imgIndex = gltf.images.findIndex(img => img.bufferView === i);
      const imgName = gltf.images[imgIndex]?.name || `image_${imgIndex}`;
      
      try {
        const originalSize = data.length;
        
        // Downscale to 1K max dimension, JPEG quality 75
        const compressed = await sharp(data)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 75 })
          .toBuffer();
        
        console.log(`  ${imgName}: ${(originalSize/1024).toFixed(0)} KB → ${(compressed.length/1024).toFixed(0)} KB (${((1 - compressed.length/originalSize)*100).toFixed(0)}% reduction)`);
        data = compressed;
      } catch (err) {
        console.warn(`  ${imgName}: compression failed, keeping original — ${err.message}`);
      }
    }
    
    // Align to 4 bytes
    const alignedOffset = currentOffset;
    bufferViewOffsets.push(alignedOffset);
    newBinParts.push(data);
    
    currentOffset += data.length;
    // Pad to 4-byte boundary
    const padding = (4 - (data.length % 4)) % 4;
    if (padding > 0) {
      newBinParts.push(Buffer.alloc(padding, 0));
      currentOffset += padding;
    }
    
    newBufferViews.push({
      ...bv,
      byteOffset: alignedOffset,
      byteLength: data.length,
    });
  }
  
  // Update buffer views in gltf
  gltf.bufferViews = newBufferViews;
  
  // Update buffer total length
  gltf.buffers[0].byteLength = currentOffset;
  
  // Rebuild the GLB
  const newBin = Buffer.concat(newBinParts);
  const newJsonStr = JSON.stringify(gltf);
  // Pad JSON to 4-byte boundary with spaces
  const jsonPadding = (4 - (newJsonStr.length % 4)) % 4;
  const paddedJson = newJsonStr + ' '.repeat(jsonPadding);
  const jsonBuf = Buffer.from(paddedJson, 'utf8');
  
  const newTotalLength = 12 + 8 + jsonBuf.length + 8 + newBin.length;
  const output = Buffer.alloc(newTotalLength);
  
  // Header
  output.writeUInt32LE(0x46546C67, 0); // magic
  output.writeUInt32LE(2, 4);           // version
  output.writeUInt32LE(newTotalLength, 8);
  
  // JSON chunk
  output.writeUInt32LE(jsonBuf.length, 12);
  output.writeUInt32LE(0x4E4F534A, 16); // 'JSON'
  jsonBuf.copy(output, 20);
  
  // BIN chunk
  const binStart = 20 + jsonBuf.length;
  output.writeUInt32LE(newBin.length, binStart);
  output.writeUInt32LE(0x004E4942, binStart + 4); // 'BIN\0'
  newBin.copy(output, binStart + 8);
  
  await writeFile(OUTPUT_GLB, output);
  
  console.log(`\nOutput GLB: ${(output.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Compression ratio: ${((1 - output.length / buf.length) * 100).toFixed(1)}% reduction`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
