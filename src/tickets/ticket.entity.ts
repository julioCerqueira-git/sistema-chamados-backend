import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({ default: 'open' })
  status!: string;

  @ManyToOne(() => User, (user) => user.tickets)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
