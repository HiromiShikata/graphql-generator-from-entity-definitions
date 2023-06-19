import { FsFileRepository } from './FsFileRepository';

describe('FsFileRepository', () => {
  const repository = new FsFileRepository();
  const filePath = './test.log';
  beforeEach(async () => {
    try {
      await repository.delete(filePath);
      await repository.delete(`./tmp`);
    } catch (e) {
      // do nothing
    }
  });

  it('should save file correctly', async () => {
    const content = 'test content';
    await repository.save(filePath, content);
    const savedContent = await repository.read(filePath);
    expect(savedContent).toBe(content);
  });
  it('should make dir before save file', async () => {
    const content = 'new test content';
    await repository.save(`./tmp/newDir/testfile.txt`, content);
    const savedContent = await repository.read(`./tmp/newDir/testfile.txt`);
    expect(savedContent).toBe(content);
  });
});
