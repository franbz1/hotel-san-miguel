import { Injectable, Logger } from '@nestjs/common';
import { HuespedesSireDto } from './dtos/HuespedSireDto';
import { SIRE_CREDENCIALES } from 'src/common/constants/SireCredenciales';
import puppeteer, { Browser, ElementHandle, PredefinedNetworkConditions } from 'puppeteer';
import { CreateDocService } from 'src/common/create-doc/create-doc.service';
import { TipoDocumentoSireUpload } from 'src/common/enums/tipoDocSireUpload';

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
    if (!fileRute) {
      throw new Error('No se pudo subir el archivo a sire');
    }

    try {
      return await this.trySirePuppeteer(
        SIRE_CREDENCIALES.passwordSire,
        SIRE_CREDENCIALES.usuarioSire,
        SIRE_CREDENCIALES.tipoDocSireUpload,
        fileRute,
      );
    } catch (error) {
      this.logger.error(`Error al subir el archivo a sire: ${error}`);
    }
  }

  /**
   * Sube un archivo al Sire mediante puppeteer
   * @param contrasena
   * @param documento
   * @param tipoDocumento
   * @returns true si se cargó correctamente, false en caso contrario
   * @throws Error si hubo un error en el proceso
   */
  private async trySirePuppeteer(
    contrasena: string,
    documento: string,
    tipoDocumento: TipoDocumentoSireUpload,
    uriTxt: string,
  ): Promise<boolean> {
    let browser: Browser;
    try {
      console.log('🌎 Iniciando navegador...');
      browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox'],
      });
      const page = await browser.newPage();

      const slow3G = PredefinedNetworkConditions['Slow 3G'];

      page.emulateNetworkConditions(slow3G);

      await page.goto(
        'https://apps.migracioncolombia.gov.co/sire/pages/empresas/cargueInformacion.jsf',
        {
          waitUntil: 'domcontentloaded',
        },
      );

      await page.waitForSelector('#formLogin\\:tipoDocumento');
      await page.click('#formLogin\\:tipoDocumento');

      await page.waitForSelector('#formLogin\\:tipoDocumento');
      await page.select('#formLogin\\:tipoDocumento', tipoDocumento);

      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

      await page.waitForSelector('#formLogin\\:numeroDocumento');
      await page.type('#formLogin\\:numeroDocumento', documento);

      await page.waitForSelector('#formLogin\\:password');
      await page.type('#formLogin\\:password', contrasena);

      await Promise.all([
        page.waitForSelector('#formLogin\\:button1'),
        page.click('#formLogin\\:button1'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      ]);

      await page.waitForSelector('#tablehideitemCargarInformacion');
      await page.click('#tablehideitemCargarInformacion');

      await page.waitForSelector('#HOTEL_lbl');
      await page.click('#HOTEL_lbl');

      await page.waitForSelector('#cargueFormHospedaje\\:tipoCargue\\:1');
      await page.click('#cargueFormHospedaje\\:tipoCargue\\:1');

      await page.waitForSelector('#cargueFormHospedaje\\:upload\\:file');
      const fileInput = (await page.$(
        '#cargueFormHospedaje\\:upload\\:file',
      )) as ElementHandle<HTMLInputElement>;
      await fileInput.uploadFile(uriTxt);

      await page.waitForSelector('#cargueFormHospedaje\\:upload\\:upload1');
      await page.click('#cargueFormHospedaje\\:upload\\:upload1');

      //Todo: Validar que el archivo se subio correctamente con response de sire

      await page.waitForSelector('#cargueFormHospedaje\\:j_id911');
      await page.click('#cargueFormHospedaje\\:j_id911');

      // ✅ Verificar si se muestra la imagen de error
      try {
        await page.waitForSelector('#messagesForm\\:messagesPanelContentTable');

        const errorDetected = await page.evaluate(() => {
          const img = document.querySelector(
            '#messagesForm\\:messagesPanelContentTable img',
          );
          const errorSpan = document.querySelector('span.rich-messages-label');

          if (img?.getAttribute('src')?.includes('/sire/imagenes/fatal.png')) {
            return {
              isError: true,
              message:
                '❌ Error al cargar el archivo: Se detectó una imagen de error.',
            };
          }

          if (errorSpan?.textContent?.includes('Error')) {
            return { isError: true, message: errorSpan.textContent.trim() };
          }

          return { isError: false };
        });

        if (errorDetected.isError) {
          throw new Error(errorDetected.message);
        }

        console.log('✅ Archivo cargado correctamente.');
        return Promise.resolve(true);
      } catch (error) {
        console.error(
          `⚠️ No se encontró la imagen esperada o hubo un error: ${error.message}`,
        );
        return Promise.resolve(false);
      }
    } catch (error) {
      console.error(`🚨 Error en el proceso: ${error}`);
      return Promise.resolve(false);
    } finally {
      if (browser) {
        await browser.close();
        console.log('🛑 Navegador cerrado.');
      }
    }
  }
}
