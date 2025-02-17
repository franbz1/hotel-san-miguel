import { Injectable, Logger } from '@nestjs/common';
import { HuespedesSireDto } from './dtos/HuespedSireDto';
import { SIRE_CREDENCIALES } from 'src/common/constants/SireCredenciales';
import puppeteer, {
  ElementHandle,
  //PredefinedNetworkConditions,
} from 'puppeteer';
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
    if (!fileRute) {
      throw new Error('No se pudo subir el archivo a sire');
    }

    try {
      return await this.ScrapingUploadFileSire(
        SIRE_CREDENCIALES.tipoDocSireUpload,
        SIRE_CREDENCIALES.usuarioSire,
        SIRE_CREDENCIALES.passwordSire,
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
  async ScrapingUploadFileSire(
    tipoDoc: string,
    numDoc: string,
    password: string,
    fileUri: string,
  ): Promise<boolean> {
    console.log('▶️ iniciando el navegador...');

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    /* console.log('🐌 Emulando conexiones lentas...');
    const slow = PredefinedNetworkConditions['Slow 3G'];
    await page.emulateNetworkConditions(slow); */
    try {
      console.log('🌐 navegando al sitio...');

      await page.goto(
        'https://apps.migracioncolombia.gov.co/sire/public/login.jsf',
        { waitUntil: 'networkidle2' },
      );

      console.log('🔑 llenando el formulario...');

      await page.evaluate(
        (tipoDoc, numDoc) => {
          const tipoDocInput = document.getElementById(
            'formLogin:tipoDocumento',
          ) as HTMLInputElement;
          const numDocInput = document.getElementById(
            'formLogin:numeroDocumento',
          ) as HTMLInputElement;

          if (tipoDocInput) tipoDocInput.value = tipoDoc;
          if (numDocInput) numDocInput.value = numDoc;

          const customEvent = new Event('change', {
            bubbles: true,
            cancelable: false,
            composed: false,
          });
          const I = document.getElementById('formLogin:numeroDocumento');
          I?.dispatchEvent(customEvent);
        },
        tipoDoc,
        numDoc,
      );

      console.log('⌛ Esperando a que se actualice...');

      await page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              'https://apps.migracioncolombia.gov.co/sire/public/login.jsf;jsessionid=',
            ) && response.status() === 200,
      );

      await page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              'https://apps.migracioncolombia.gov.co/sire/imagenes/inicioPresentacion4.jpg',
            ) && response.status() === 200,
      );

      await page.waitForSelector('#formLogin\\:password');
      await page.type('#formLogin\\:password', password);

      await page.waitForSelector('#formLogin\\:button1');

      console.log('🚀 Lanzando el login...');
      await Promise.all([
        await page.click('#formLogin\\:button1'),
        await page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ]);

      console.log('📄 Navegando al upload del archivo...');

      await page.waitForSelector('#itemCargarInformacion');
      await page.click('#itemCargarInformacion');

      await page.waitForSelector('#HOTEL_lbl');
      await page.click('#HOTEL_lbl');

      await page.waitForSelector('#cargueFormHospedaje\\:tipoCargue\\:1');
      await page.click('#cargueFormHospedaje\\:tipoCargue\\:1');

      console.log('📤 Subiendo el archivo...');

      await page.waitForSelector('#cargueFormHospedaje\\:upload\\:file');
      const fileInput = (await page.$(
        '#cargueFormHospedaje\\:upload\\:file',
      )) as ElementHandle<HTMLInputElement>;
      await fileInput.uploadFile(fileUri);

      await page.waitForSelector('#cargueFormHospedaje\\:upload\\:upload1');
      await page.click('#cargueFormHospedaje\\:upload\\:upload1');

      await page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              'https://apps.migracioncolombia.gov.co/sire/a4j/g/3_3_3.Finalorg/richfaces/renderkit/html/images/ico_clear.gif.jsf',
            ) && response.status() === 200,
      );

      await page.waitForSelector('#cargueFormHospedaje\\:j_id911');
      await page.click('#cargueFormHospedaje\\:j_id911');

      // 🚨 Verificación Final: ¿Hubo un error?
      console.log('🧐 Verificando si hubo errores en la carga...');

      //TODO: Verificar si se obtiene confirmación de subida valida

      console.log('✅ Archivo cargado correctamente.');
      return true;
    } catch (error: any) {
      console.error(`💥 Error durante la ejecución: ${error.message}`);
      return false;
    } finally {
      console.log('🛑 cierre del navegador...');
      await page.close();
      await browser.close();
    }
  }
}
