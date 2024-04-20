import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class EncryptedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: false, type: 'bytea' })
  value: Buffer;
  @Column({ nullable: false, type: 'bytea' })
  iv: Buffer;
  @OneToOne(() => User, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  userId: string;
}
