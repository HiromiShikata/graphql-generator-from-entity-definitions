// ./src/domain/usecases/adapter-interfaces
export interface FileRepository {
  save(path: string, content: string): Promise<void>;
}
