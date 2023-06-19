import { promises as fs } from 'fs';
import { FileRepository } from '../../domain/usecases/adapter-interfaces/FileRepository';

export class FsFileRepository implements FileRepository {
  async save(path: string, content: string): Promise<void> {
    const dir = path.split('/').slice(0, -1).join('/');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path, content);
  }

  async read(path: string): Promise<string> {
    const fileContent = await fs.readFile(path, 'utf-8');
    return fileContent;
  }

  async delete(path: string): Promise<void> {
    await fs.unlink(path);
  }
}
