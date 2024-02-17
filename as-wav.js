const fs = require("fs/promises");
const minimist = require("minimist");
const path = require("path");
const args = minimist(process.argv.slice(2));

if (!args._.length) {
  console.log("Input paths or folder needed");
  process.exit(1);
}

const sampleRate = 44100;
const channels = args.mode === "stereo" ? 2 : 1;
const suffix = channels === 1 ? ".mono.wav" : ".stereo.wav";
const bitDepth = 16;
const bytesPerSample = channels * (bitDepth >> 3);

(async function () {
  const files = [];
  for (input of args._) {
    const info = await fs.stat(input);
    if (info.isFile()) {
      files.push(input);
    } else if (info.isDirectory()) {
      const allEntries = await fs.readdir(input, { withFileTypes: true });
      allEntries
        .filter(x => x.isFile)
        .filter(x => !x.name.endsWith(".wav"))
        .forEach(x => files.push(input + path.sep + x.name));
    }
  }

  for (inputPath of files) {
    console.log("Reading", inputPath);
    const stats = await fs.stat(inputPath);
    const samples = Math.floor(stats.size / bytesPerSample);
    const inputFileHandle = await fs.open(inputPath);
    const inputStream = inputFileHandle.createReadStream();
    const outputFileHandle = await fs.open(inputPath + suffix, "w");
    const outputStream = outputFileHandle.createWriteStream();

    const writeU16 = x =>
      outputStream.write(new Uint8Array(new Uint16Array([x]).buffer));
    const writeU32 = x =>
      outputStream.write(new Uint8Array(new Uint32Array([x]).buffer));
    const writeString = x =>
      outputStream.write(new Uint8Array([...x].map(x => x.charCodeAt(0))));

    writeString("RIFF");
    writeU32(samples * bytesPerSample - 8);
    writeString("WAVE");
    writeString("fmt ");
    writeU32(16);
    writeU16(0x0001);
    writeU16(channels);
    writeU32(sampleRate);
    writeU32(sampleRate * bytesPerSample);
    writeU16(bytesPerSample);
    writeU16(bitDepth);
    writeString("data");
    writeU32(samples * bytesPerSample);
    inputStream.pipe(outputStream);

    await new Promise(res => inputStream.on("end", res));
    inputStream.close();
    outputStream.close();
    outputStream.close();
    console.log("Written", inputPath + suffix);
  }
})();
