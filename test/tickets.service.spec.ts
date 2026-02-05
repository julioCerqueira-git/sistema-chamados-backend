import { TicketsService } from '../src/tickets/tickets.service';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('TicketsService', () => {
  let service: TicketsService;
  let repo: jest.Mocked<Repository<any>>;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      merge: jest.fn(),
      delete: jest.fn(),
    } as any;
    service = new TicketsService(repo as any);
  });

  it('create deve associar userId e salvar', async () => {
    repo.create.mockReturnValue({ id: '1' } as any);
    repo.save.mockResolvedValue({ id: '1' } as any);
    const result = await service.create('user-1', { title: 't', description: 'd' } as any);
    expect(repo.create).toHaveBeenCalledWith({ title: 't', description: 'd', user: { id: 'user-1' } });
    expect(result).toEqual({ id: '1' });
  });

  it('findAllForUser retorna lista ordenada', async () => {
    repo.find.mockResolvedValue([{ id: '1' }] as any);
    const list = await service.findAllForUser('user-1');
    expect(Array.isArray(list)).toBe(true);
  });

  it('findAll retorna todos os tickets ordenados', async () => {
    repo.find.mockResolvedValue([{ id: '1' }, { id: '2' }] as any);
    const list = await service.findAll();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(2);
  });

  it('findOne lança NotFoundException quando não encontra', async () => {
    repo.findOne.mockResolvedValue(null as any);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update deve mesclar e salvar', async () => {
    repo.findOne.mockResolvedValue({ id: '1' } as any);
    repo.save.mockResolvedValue({ id: '1', title: 't2' } as any);
    const result = await service.update('1', { title: 't2' } as any);
    expect(repo.merge).toHaveBeenCalled();
    expect(result).toEqual({ id: '1', title: 't2' });
  });

  it('remove lança NotFoundException quando affected=0', async () => {
    repo.delete.mockResolvedValue({ affected: 0 } as any);
    await expect(service.remove('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove não lança quando affected>0', async () => {
    repo.delete.mockResolvedValue({ affected: 1 } as any);
    await expect(service.remove('1')).resolves.toBeUndefined();
  });
});
