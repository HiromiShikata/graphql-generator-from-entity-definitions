import { FsFileRepository } from './FsFileRepository';

describe('FsFileRepository', () => {
  const repository = new FsFileRepository();
  const filePath = './test.log';

  afterEach(async () => {
    await repository.delete(filePath);
  });

  it('should save file correctly', async () => {
    const content = 'test content';
    await repository.save(filePath, content);
    const savedContent = await repository.read(filePath);
    expect(savedContent).toBe(content);
  });
});
