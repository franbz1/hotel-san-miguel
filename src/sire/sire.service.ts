import { Injectable, Logger } from '@nestjs/common';
import { HuespedesSireDto } from './dtos/HuespedSireDto';
import { SIRE_CREDENCIALES } from 'src/common/constants/SireCredenciales';
import puppeteer from 'puppeteer-core';
import { CreateDocService } from 'src/common/create-doc/create-doc.service';

@Injectable()
export class SireService {
  constructor(private readonly createDocService: CreateDocService) {}

  private readonly logger = new Logger(SireService.name);

  /**
   * Sube un arreglo de huespedesSire al sire
   * @param huespedesSireDto
   * @returns Promise<boolean> true si los huespedes se subieron correctamente
   */
  async uploadAllToSire(
    huespedesSireDto: HuespedesSireDto[],
  ): Promise<boolean> {
    return Promise.resolve(false);
    //TODO: Hacer el upload de multiples huespedes a sire
  }

  /**
   * Toma un huesped lo convertirá a un archivo de texto y lo subirá a sire
   * @param huespedSireDto
   * @returns true si el archivo se subió correctamente
   */
  async uploadOneToSire(huespedSireDto: HuespedesSireDto): Promise<boolean> {
    const data = [
      {
        codigoDelHotel: SIRE_CREDENCIALES.codigoHotelSire,
        codigoDeCiudad: SIRE_CREDENCIALES.codigoCiudadSire,
        ...huespedSireDto,
      },
    ];
    try {
      const rutaFile = await this.createDocService
        .getGenerator('txtIndent')
        .generate(data);
      this.logger.debug(`Ruta del archivo generado: ${rutaFile}`);

      return await this.uploadFileToSire(rutaFile);
    } catch (error) {
      this.logger.error(`Error al subir el archivo a sire: ${error}`);
    }
  }

  /**
   * Toma un archivo de huespedes y lo subirá a sire mediante puppeteer
   * @param fileRute
   * @returns
   */
  async uploadFileToSire(fileRute: string): Promise<boolean> {
    return Promise.resolve(false);
    //TODO: Hacer el upload de archivo a sire
    /*     if (!fileRute) {
      throw new Error('No se pudo subir el archivo a sire');
    }

    try {
      const browser = await puppeteer.launch({
        headless: true,
      });

    } catch (error) {
      
    } */
  }
}
