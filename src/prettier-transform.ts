import { Transform, TransformCallback } from 'stream';

import * as prettier from 'prettier';
import * as Vinyl from 'vinyl';

import { options as prettierrc } from './style/prettierrc';

/**
 * Formats text if a parser can be inferred;
 * otherwise, text is returned unchanged without throwing.
 */
const safeParser: prettier.CustomParser = (text, _, options) => {
  if (!options.filepath) return text;
  const fileInfo = prettier.getFileInfo.sync(options.filepath);

  if (!fileInfo.ignored && fileInfo.inferredParser) {
    try {
      return prettier.format(text, {
        ...options,
        parser: fileInfo.inferredParser,
      });
    } catch {
      return text;
    }
  } else {
    return text;
  }
};

/**
 * Transform stream that formats Vinyl buffer files using Prettier
 */
export class PrettierTransform extends Transform {
  constructor(private readonly options: prettier.Options = prettierrc) {
    super({ objectMode: true });

    this.options.parser ||= safeParser;
  }

  public _transform(
    chunk: Vinyl,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    // We can only transform buffers
    if (!chunk.isBuffer()) return callback(null, chunk);

    const { contents, path } = chunk;
    const text = contents.toString(encoding);
    const options = { ...this.options, filepath: path };

    // If the formatting is already OK, just push the original chunk
    if (prettier.check(text, options)) return callback(null, chunk);

    const formattedText = prettier.format(text, options);
    const formattedFile = chunk.clone();
    formattedFile._contents = Buffer.from(formattedText);

    // Push the formatted file
    return callback(null, formattedFile);
  }
}
