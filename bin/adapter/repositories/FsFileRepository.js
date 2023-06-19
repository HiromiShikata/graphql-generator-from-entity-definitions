'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FsFileRepository = void 0;
const fs_1 = require('fs');
class FsFileRepository {
  async save(path, content) {
    const dir = path.split('/').slice(0, -1).join('/');
    await fs_1.promises.mkdir(dir, { recursive: true });
    await fs_1.promises.writeFile(path, content);
  }
  async read(path) {
    const fileContent = await fs_1.promises.readFile(path, 'utf-8');
    return fileContent;
  }
  async delete(path) {
    await fs_1.promises.unlink(path);
  }
}
exports.FsFileRepository = FsFileRepository;
//# sourceMappingURL=FsFileRepository.js.map
