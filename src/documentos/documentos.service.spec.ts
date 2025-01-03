import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosService } from './documentos.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DocumentosService', () => {
  let service: DocumentosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentosService,
        {
          provide: PrismaService,
          useValue: {
            documento: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirstOrThrow: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DocumentosService>(DocumentosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new documento', async () => {
      const createDocumentoDto: CreateDocumentoDto = {
        nombre: 'Documento 1',
        huespedId: 1,
        url: 'https://example.com/documento1.pdf',
      };
      const result = {
        id: 1,
        ...createDocumentoDto,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      jest.spyOn(prisma.documento, 'create').mockResolvedValue(result);

      expect(await service.create(createDocumentoDto)).toEqual(result);
    });

    it('should throw a NotFoundException if huespedId does not exist', async () => {
      const createDocumentoDto: CreateDocumentoDto = {
        nombre: 'Documento 1',
        huespedId: 999,
        url: 'https://example.com/documento1.pdf',
      };
      jest
        .spyOn(prisma.documento, 'create')
        .mockRejectedValue({ code: 'P2003' });

      await expect(service.create(createDocumentoDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of documentos', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const result = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, lastPage: 0 },
      };
      jest.spyOn(prisma.documento, 'findMany').mockResolvedValue(result.data);
      jest.spyOn(prisma.documento, 'count').mockResolvedValue(0);

      expect(await service.findAll(1, paginationDto)).toEqual(result);
    });

    it('should throw a BadRequestException if findAll fails', async () => {
      const paginationDto = { page: 1, limit: 10 };
      jest
        .spyOn(prisma.documento, 'findMany')
        .mockRejectedValue(new BadRequestException());

      await expect(service.findAll(1, paginationDto)).rejects.toThrow(
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
        url: 'https://example.com/documento1.pdf',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      jest
        .spyOn(prisma.documento, 'findFirstOrThrow')
        .mockResolvedValue(result);

      expect(await service.findOne(1)).toEqual(result);
    });

    it('should throw a NotFoundException if documento is not found', async () => {
      jest
        .spyOn(prisma.documento, 'findFirstOrThrow')
        .mockRejectedValue({ code: 'P2025' });

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
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
        url: 'https://example.com/documento1.pdf',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      jest.spyOn(prisma.documento, 'update').mockResolvedValue(result);

      expect(await service.update(1, updateDocumentoDto)).toEqual(result);
    });

    it('should throw a NotFoundException if documento to update is not found', async () => {
      const updateDocumentoDto: UpdateDocumentoDto = {
        nombre: 'Documento 1 Updated',
      };
      jest
        .spyOn(prisma.documento, 'update')
        .mockRejectedValue({ code: 'P2025' });

      await expect(service.update(1, updateDocumentoDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a BadRequestException if no data is provided for update', async () => {
      const updateDocumentoDto: UpdateDocumentoDto = {};
      await expect(service.update(1, updateDocumentoDto)).rejects.toThrow(
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
        url: 'https://example.com/documento1.pdf',
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      jest.spyOn(prisma.documento, 'delete').mockResolvedValue(result);

      expect(await service.remove(1)).toEqual(result);
    });

    it('should throw a NotFoundException if documento to remove is not found', async () => {
      jest
        .spyOn(prisma.documento, 'delete')
        .mockRejectedValue({ code: 'P2025' });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
