import { UsersService } from '../src/users/users.service';
import { Repository } from 'typeorm';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<any>>;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as any;
    service = new UsersService(repo as any);
  });

  it('create deve hash a senha e salvar usuário', async () => {
    repo.create.mockReturnValue({ id: '1' } as any);
    repo.save.mockResolvedValue({ id: '1' } as any);
    const dto = { name: 'A', email: 'a@b.com', password: '123456' } as any;
    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual({ id: '1' });
  });

  it('findByEmail retorna usuário ou null', async () => {
    repo.findOne.mockResolvedValue({ id: '1' } as any);
    const a = await service.findByEmail('x@y.com');
    expect(a).toEqual({ id: '1' });
  });

  it('findOne retorna usuário ou null', async () => {
    repo.findOne.mockResolvedValue({ id: '1' } as any);
    const a = await service.findOne('1');
    expect(a).toEqual({ id: '1' });
  });
});
