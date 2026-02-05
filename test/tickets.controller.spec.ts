import { TicketsController } from '../src/tickets/tickets.controller';
import { TicketsService } from '../src/tickets/tickets.service';
import { AuthenticatedRequest } from '../src/types/auth';
import { ForbiddenException } from '@nestjs/common';

describe('TicketsController', () => {
  let controller: TicketsController;
  let ticketsService: jest.Mocked<TicketsService>;

  beforeEach(() => {
    ticketsService = {
      create: jest.fn(),
      findAllForUser: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;
    controller = new TicketsController(ticketsService);
  });

  it('create deve criar ticket para usuário autenticado', async () => {
    const req = { user: { userId: 'user-1', username: 'a@b.com', role: 'user' } } as AuthenticatedRequest;
    ticketsService.create.mockResolvedValue({ id: '1' } as any);
    const result = await controller.create(req, { title: 't', description: 'd' } as any);
    expect(ticketsService.create).toHaveBeenCalledWith('user-1', { title: 't', description: 'd' });
    expect(result).toEqual({ id: '1' });
  });

  it('findAll deve retornar tickets do usuário', async () => {
    const req = { user: { userId: 'user-1', username: 'a@b.com', role: 'user' } } as AuthenticatedRequest;
    ticketsService.findAllForUser.mockResolvedValue([{ id: '1' }] as any);
    const result = await controller.findAll(req);
    expect(result).toEqual([{ id: '1' }]);
  });

  it('findOne deve delegar para service', async () => {
    ticketsService.findOne.mockResolvedValue({ id: '1' } as any);
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: '1' });
  });

  it('update deve permitir dono', async () => {
    const req = { user: { userId: 'user-1', username: 'a@b.com', role: 'user' } } as AuthenticatedRequest;
    ticketsService.findOne.mockResolvedValue({ id: '1', user: { id: 'user-1' } } as any);
    ticketsService.update.mockResolvedValue({ id: '1', title: 't2' } as any);
    const result = await controller.update(req, '1', { title: 't2' } as any);
    expect(result).toEqual({ id: '1', title: 't2' });
  });

  it('update deve permitir admin', async () => {
    const req = { user: { userId: 'user-2', username: 'a@b.com', role: 'admin' } } as AuthenticatedRequest;
    ticketsService.findOne.mockResolvedValue({ id: '1', user: { id: 'user-1' } } as any);
    ticketsService.update.mockResolvedValue({ id: '1', title: 't2' } as any);
    const result = await controller.update(req, '1', { title: 't2' } as any);
    expect(result).toEqual({ id: '1', title: 't2' });
  });

  it('update deve lançar Forbidden quando não é dono nem admin', async () => {
    const req = { user: { userId: 'user-2', username: 'a@b.com', role: 'user' } } as AuthenticatedRequest;
    ticketsService.findOne.mockResolvedValue({ id: '1', user: { id: 'user-1' } } as any);
    await expect(controller.update(req, '1', { title: 't2' } as any)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('remove deve delegar para service.remove', async () => {
    const req = { user: { userId: 'admin', username: 'admin@x.com', role: 'admin' } } as AuthenticatedRequest;
    ticketsService.remove.mockResolvedValue(undefined);
    await controller.remove(req, '1');
    expect(ticketsService.remove).toHaveBeenCalledWith('1');
  });
});
