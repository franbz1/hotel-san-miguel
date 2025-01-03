import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: PrismaService,
          useValue: {
            usuario: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new usuario', async () => {
      const createUsuarioDto: CreateUsuarioDto = {
        nombre: 'John Doe',
        rol: 'ADMINISTRADOR',
      };
      const result = {
        id: 1,
        ...createUsuarioDto,
        updatedAt: new Date(),
        createdAt: new Date(),
        deleted: false,
      };
      jest.spyOn(prisma.usuario, 'create').mockResolvedValue(result);

      expect(await service.create(createUsuarioDto)).toBe(result);
    });

    it('should throw a BadRequestException if creation fails', async () => {
      const createUsuarioDto: CreateUsuarioDto = {
        nombre: 'John Doe',
        rol: 'ADMINISTRADOR',
      };
      jest
        .spyOn(prisma.usuario, 'create')
        .mockRejectedValue(new BadRequestException());

      await expect(service.create(createUsuarioDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of usuarios', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const result = {
        data: [],
        meta: { page: 1, limit: 10, totalUsuarios: 0, lastPage: 0 },
      };
      jest.spyOn(prisma.usuario, 'findMany').mockResolvedValue(result.data);
      jest.spyOn(prisma.usuario, 'count').mockResolvedValue(0);

      expect(await service.findAll(paginationDto)).toEqual(result);
    });

    it('should throw a BadRequestException if findAll fails', async () => {
      const paginationDto = { page: 1, limit: 10 };
      jest
        .spyOn(prisma.usuario, 'findMany')
        .mockRejectedValue(new BadRequestException());

      await expect(service.findAll(paginationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single usuario', async () => {
      const result = {
        id: 1,
        nombre: 'John Doe',
        rol: 'ADMINISTRADOR',
        updatedAt: new Date(),
        createdAt: new Date(),
        deleted: false,
      };
      jest.spyOn(prisma.usuario, 'findFirst').mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
    });

    it('should throw a NotFoundException if usuario is not found', async () => {
      jest.spyOn(prisma.usuario, 'findFirst').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a usuario', async () => {
      const updateUsuarioDto: UpdateUsuarioDto = {
        nombre: 'John Doe Updated',
        rol: 'CAJERO',
      };
      const result = {
        id: 1,
        nombre: 'John Doe Updated',
        rol: 'CAJERO',
        updatedAt: new Date(),
        createdAt: new Date(),
        deleted: false,
      };
      jest.spyOn(prisma.usuario, 'update').mockResolvedValue(result);

      expect(await service.update(1, updateUsuarioDto)).toBe(result);
    });

    it('should throw a NotFoundException if usuario to update is not found', async () => {
      const updateUsuarioDto: UpdateUsuarioDto = {
        nombre: 'John Doe Updated',
        rol: 'CAJERO',
      };
      jest.spyOn(prisma.usuario, 'update').mockRejectedValue({ code: 'P2025' });

      await expect(service.update(1, updateUsuarioDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a BadRequestException if no data is provided for update', async () => {
      const updateUsuarioDto: UpdateUsuarioDto = {};
      await expect(service.update(1, updateUsuarioDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a usuario', async () => {
      const result = {
        id: 1,
        nombre: 'John Doe',
        rol: 'ADMINISTRADOR',
        updatedAt: new Date(),
        createdAt: new Date(),
        deleted: false,
      };
      jest.spyOn(prisma.usuario, 'update').mockResolvedValue(result);

      expect(await service.remove(1)).toBe(result);
    });

    it('should throw a NotFoundException if usuario to remove is not found', async () => {
      jest.spyOn(prisma.usuario, 'update').mockRejectedValue({ code: 'P2025' });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
