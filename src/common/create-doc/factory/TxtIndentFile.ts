import { CreateDocInterface } from '../create-doc-interface';
import { writeFile } from 'fs';

export class TxtIndentFile implements CreateDocInterface {
  generate(data: any[]): Promise<string> {
    if (data.length === 0) {
      throw new Error('No data to generate');
    }
    try {
      const rows = data.map((row) => Object.values(row).join('\t')).join('\n');
      const rute =
        'C:\\Users\\programacion\\Documents\\Hotel san miguel\\Codigo\\hotel-san-miguel\\src\\common\\create-doc\\factory\\test.txt';
      writeFile(rute, rows, 'utf8', (err) => {
        if (err) throw err;
      });
      return Promise.resolve(rute);
    } catch (error) {
      throw new Error(`Error al generar el archivo ${error}`);
    }
  }
  getExtensionFile(): string {
    throw new Error('Method not implemented.');
  }
}
