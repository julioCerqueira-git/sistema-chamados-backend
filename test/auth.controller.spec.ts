import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { LoginDto } from '../src/auth/dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from '../src/types/auth';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(() => {
    authService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    } as any;
    usersService = {
      create: jest.fn(),
    } as any;
    controller = new AuthController(authService, usersService);
  });

  it('register deve criar usuário', async () => {
    const dto = { name: 'A', email: 'a@b.com', password: '123456' } as CreateUserDto;
    usersService.create.mockResolvedValue({ id: '1' } as any);
    const result = await controller.register(dto);
    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: '1' });
  });

  it('login deve retornar token quando credenciais são válidas', async () => {
    const dto = { email: 'a@b.com', password: '123456' } as LoginDto;
    authService.validateUser.mockResolvedValue({ id: '1', email: 'a@b.com', name: 'A', role: 'user' } as any);
    authService.login.mockResolvedValue({ access_token: 'token' });
    const result = await controller.login(dto);
    expect(authService.validateUser).toHaveBeenCalledWith(dto.email, dto.password);
    expect(result).toEqual({ access_token: 'token' });
  });

  it('login deve lançar Unauthorized quando credenciais são inválidas', async () => {
    const dto = { email: 'a@b.com', password: '123456' } as LoginDto;
    authService.validateUser.mockResolvedValue(null);
    await expect(controller.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('me deve retornar usuário autenticado do request', () => {
    const req = { user: { userId: '1', username: 'a@b.com', role: 'user' } } as AuthenticatedRequest;
    const result = controller.me(req);
    expect(result).toEqual(req.user);
  });
});
