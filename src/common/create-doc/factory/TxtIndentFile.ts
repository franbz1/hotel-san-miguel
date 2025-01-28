import { huespedesSireDto } from 'src/sire/dtos/HuespedSireDto';
import { CreateDocInterface } from '../create-doc-interface';
import { writeFile } from 'fs';

export class TxtIndentFile implements CreateDocInterface {
  async generate(data: huespedesSireDto[]): Promise<string> {
    const rows = data.map((row) => Object.values(row).join('\t')).join('\n');

    await writeFile(
      'C:\\Users\\programacion\\Documents\\Hotel san miguel\\Codigo\\hotel-san-miguel\\src\\common\\create-doc\\factory\\test.txt',
      rows,
      'utf8',
      (err) => {
        if (err) throw err;
      },
    );

    return Promise.resolve(rows);
  }
  getExtensionFile(): string {
    throw new Error('Method not implemented.');
  }
}
