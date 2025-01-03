import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: UsuariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
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

    controller = module.get<UsuariosController>(UsuariosController);
    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createUsuarioDto)).toBe(result);
    });

    it('should throw a BadRequestException if creation fails', async () => {
      const createUsuarioDto: CreateUsuarioDto = {
        nombre: 'John Doe',
        rol: 'ADMINISTRADOR',
      };
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException());

      await expect(controller.create(createUsuarioDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle empty input gracefully', async () => {
      const createUsuarioDto: Partial<CreateUsuarioDto> = {};
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('Invalid input'));

      await expect(
        controller.create(createUsuarioDto as CreateUsuarioDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of usuarios', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const result = {
        data: [],
        meta: { page: 1, limit: 10, totalUsuarios: 0, lastPage: 0 },
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(paginationDto)).toBe(result);
    });

    it('should throw a BadRequestException if findAll fails', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new BadRequestException());

      await expect(controller.findAll(paginationDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle invalid pagination gracefully', async () => {
      const paginationDto: PaginationDto = { page: -1, limit: 0 };
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new BadRequestException('Invalid pagination'));

      await expect(controller.findAll(paginationDto)).rejects.toThrow(
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
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
    });

    it('should throw a NotFoundException if usuario is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should handle invalid ID input', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new BadRequestException('Invalid ID'));

      await expect(controller.findOne(-1)).rejects.toThrow(BadRequestException);
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
      };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(1, updateUsuarioDto)).toBe(result);
    });

    it('should throw a NotFoundException if usuario to update is not found', async () => {
      const updateUsuarioDto: UpdateUsuarioDto = {
        nombre: 'John Doe Updated',
        rol: 'CAJERO',
      };
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update(1, updateUsuarioDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle empty update data gracefully', async () => {
      const updateUsuarioDto: Partial<UpdateUsuarioDto> = {};
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new BadRequestException('No data provided'));

      await expect(
        controller.update(1, updateUsuarioDto as UpdateUsuarioDto),
      ).rejects.toThrow(BadRequestException);
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
      };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(1)).toBe(result);
    });

    it('should throw a NotFoundException if usuario to remove is not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should handle invalid ID input for removal gracefully', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new BadRequestException('Invalid ID'));

      await expect(controller.remove(-1)).rejects.toThrow(BadRequestException);
    });
  });
});
