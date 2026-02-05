import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findOne: jest.fn(),
    } as any;
    jwtService = {
      sign: jest.fn().mockReturnValue('token'),
    } as any;
    authService = new AuthService(usersService, jwtService);
  });

  it('validateUser retorna usuário sem password quando credenciais são válidas', async () => {
    const user = { id: '1', email: 'a@b.com', name: 'A', password: 'hashed' } as any;
    usersService.findByEmail.mockResolvedValue(user);
    const result = await authService.validateUser('a@b.com', 'x');
    expect(result).toEqual({ id: '1', email: 'a@b.com', name: 'A' });
  });

  it('login define role como admin quando email está em ADMIN_EMAILS', async () => {
    process.env.ADMIN_EMAILS = 'admin@exemplo.com';
    const user = { id: '1', email: 'admin@exemplo.com', name: 'A', role: 'user' } as any;
    await authService.login(user);
    expect(jwtService.sign).toHaveBeenCalled();
    const payload = (jwtService.sign as jest.Mock).mock.calls[0][0];
    expect(payload.role).toBe('admin');
  });

  it('login define role como admin quando user.role é admin', async () => {
    process.env.ADMIN_EMAILS = '';
    const user = { id: '1', email: 'x@y.com', name: 'A', role: 'admin' } as any;
    await authService.login(user);
    const payload = (jwtService.sign as jest.Mock).mock.calls[0][0];
    expect(payload.role).toBe('admin');
  });

  it('login define role como user quando não é admin', async () => {
    process.env.ADMIN_EMAILS = '';
    const user = { id: '1', email: 'x@y.com', name: 'A', role: 'user' } as any;
    await authService.login(user);
    const payload = (jwtService.sign as jest.Mock).mock.calls[0][0];
    expect(payload.role).toBe('user');
  });
});
