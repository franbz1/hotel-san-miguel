import { Injectable } from '@nestjs/common';
import { CreateDocInterface } from './create-doc-interface';
import { TxtIndentFile } from './factory/TxtIndentFile';

@Injectable()
export class CreateDocService {
  private readonly generators: Map<string, CreateDocInterface> = new Map();

  constructor() {
    this.generators.set('txtIndent', new TxtIndentFile());
  }

  getGenerator(type: string): CreateDocInterface {
    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(`Generator not found for type ${type}`);
    }
    return generator;
  }
}
