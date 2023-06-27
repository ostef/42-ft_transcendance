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
      const path = `${baseDir}/${filename}`;
      if (fs.existsSync(path)) fs.unlinkSync(path);
      //TODO: check if folder exist when start server
      // fs.mkdirSync(baseDir);
      fs.writeFileSync(path, file, { encoding: 'base64' });
    } catch (err) {
      throw new Error(err);
    }
  }
}
