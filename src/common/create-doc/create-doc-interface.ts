export interface CreateDocInterface {
  generate(data: any[]): Promise<any>;
  getExtensionFile(): string;
}
