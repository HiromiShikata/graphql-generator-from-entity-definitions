export interface FileRepository {
  save(path: string, content: string): Promise<void>;
}
