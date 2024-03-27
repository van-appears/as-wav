# as-wav

Prepends a wav header in front of a file and save it as a new file e.g. if the input was somefile.png it will generate a new file somefile.png.mono.wav.

Usage:
```
node as-wav <file or folder>... [--mode mono|stereo]
```
or
```
npm run as-wav <file or folder>... -- [--mode mono|stereo]
```

If not supplied, it will default to mono.

The process for generating a wav header was derived from the code in [node-wav](https://github.com/andreasgal/node-wav) package.
