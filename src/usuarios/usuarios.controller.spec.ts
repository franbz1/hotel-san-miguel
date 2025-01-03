import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';

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
  });
});
