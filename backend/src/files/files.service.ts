import { Injectable } from '@nestjs/common';

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
    return fs.readFileSync(path, { encoding: 'base64' });
  }

  changeAvatar(filename: string, file: any): void {
    try {
      const path = `${baseDir}/${filename}`;
      console.log('DEBUG: path', path);
      if (fs.existsSync(path)) fs.unlinkSync(path);
      fs.mkdirSync(baseDir);
      fs.writeFileSync(path, file, { encoding: 'base64' });
    } catch (err) {
      throw new Error(err);
    }
  }
}
