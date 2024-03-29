import { Injectable, StreamableFile } from "@nestjs/common";

import * as fs from 'fs';

const baseDir = './uploads';

@Injectable()
export class FilesService {
  isFileExist(filename: string): boolean {
    const path = `${baseDir}/${filename}`;

    if (fs.existsSync(path)) return true;
    return false;
  }

  getFile(filename: string): any {
    const path = `${baseDir}/${filename}`;

    if (!fs.existsSync(path)) {
      return null;
    }
    const buf = Buffer.from(fs.readFileSync(path, { encoding: 'base64' }), 'base64');
    return new StreamableFile(buf)

  }

  changeFile(filename: string, file: any): void {
    try {
      const full_filename = `${baseDir}/${filename}`;
      if (fs.existsSync(full_filename)) fs.unlinkSync(full_filename);

      if (!fs.existsSync (baseDir))
        fs.mkdirSync (baseDir, {recursive: true});

      fs.writeFileSync(full_filename, file, { encoding: 'base64' });
    } catch (err) {
      throw new Error(err);
    }
  }
}
