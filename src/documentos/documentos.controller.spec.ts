import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DocumentosController', () => {
  let controller: DocumentosController;
  let service: DocumentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentosController],
      providers: [
        {
          provide: DocumentosService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentosController>(DocumentosController);
    service = module.get<DocumentosService>(DocumentosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new documento', async () => {
      const createDocumentoDto: CreateDocumentoDto = {
        nombre: 'Documento 1',
        huespedId: 1,
        url: 'https://www.google.com',
      };
      const result = {
        id: 1,
        ...createDocumentoDto,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createDocumentoDto)).toBe(result);
    });

    it('should throw a BadRequestException if creation fails', async () => {
      const createDocumentoDto: CreateDocumentoDto = {
        nombre: 'Documento 1',
        huespedId: 1,
        url: 'https://www.google.com',
      };
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException());

      await expect(controller.create(createDocumentoDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle empty input gracefully', async () => {
      const createDocumentoDto: Partial<CreateDocumentoDto> = {};
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('Invalid input'));

      await expect(
        controller.create(createDocumentoDto as CreateDocumentoDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of documentos', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const result = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, lastPage: 0 },
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(1, paginationDto)).toBe(result);
    });

    it('should throw a BadRequestException if findAll fails', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new BadRequestException());

      await expect(controller.findAll(1, paginationDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle invalid pagination gracefully', async () => {
      const paginationDto: PaginationDto = { page: -1, limit: 0 };
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new BadRequestException('Invalid pagination'));

      await expect(controller.findAll(1, paginationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single documento', async () => {
      const result = {
        id: 1,
        nombre: 'Documento 1',
        huespedId: 1,
        url: 'https://www.google.com',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
    });

    it('should throw a NotFoundException if documento is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a documento', async () => {
      const updateDocumentoDto: UpdateDocumentoDto = {
        nombre: 'Documento 1 Updated',
      };
      const result = {
        id: 1,
        nombre: 'Documento 1 Updated',
        huespedId: 1,
        url: 'https://www.google.com',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(1, updateDocumentoDto)).toBe(result);
    });

    it('should throw a NotFoundException if documento to update is not found', async () => {
      const updateDocumentoDto: UpdateDocumentoDto = {
        nombre: 'Documento 1 Updated',
      };
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update(1, updateDocumentoDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a BadRequestException if no data is provided for update', async () => {
      const updateDocumentoDto: UpdateDocumentoDto = {};
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new BadRequestException('Invalid input'));

      await expect(controller.update(1, updateDocumentoDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a documento', async () => {
      const result = {
        id: 1,
        nombre: 'Documento 1',
        huespedId: 1,
        url: 'https://www.google.com',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(1)).toBe(result);
    });

    it('should throw a NotFoundException if documento to remove is not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
