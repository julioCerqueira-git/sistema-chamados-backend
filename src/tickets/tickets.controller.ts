import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  ForbiddenException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../types/auth';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Request() req: AuthenticatedRequest, @Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(req.user.userId, createTicketDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    if (req.user.role === 'admin') {
      return this.ticketsService.findAll();
    }
    return this.ticketsService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    const ticket = await this.ticketsService.findOne(id);
    
    // Permite se for dono ou admin
    if (ticket.user && ticket.user.id !== req.user.userId && req.user.role !== 'admin') {
       throw new ForbiddenException('You can only update your own tickets');
    }
    
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
