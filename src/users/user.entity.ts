import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; // hashed

  @Column({ default: 'user' })
  role!: string;

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets!: Ticket[];

  @CreateDateColumn()
  createdAt!: Date;
}
