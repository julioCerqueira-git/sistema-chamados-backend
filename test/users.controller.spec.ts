import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { CreateUserDto } from '../src/users/dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
    } as any;
    controller = new UsersController(usersService);
  });

  it('create deve delegar para UsersService.create', async () => {
    const dto = { name: 'A', email: 'a@b.com', password: '123456' } as CreateUserDto;
    usersService.create.mockResolvedValue({ id: '1' } as any);
    const result = await controller.create(dto);
    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: '1' });
  });
});
