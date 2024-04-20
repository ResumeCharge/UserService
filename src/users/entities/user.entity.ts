import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { EncryptedToken } from '../../crypto/entity/encryptedToken.entity';

@Entity()
export class User {
  @PrimaryColumn()
  userId: string;

  @Column('bigint', { default: Date.now(), nullable: false })
  createdAt: number;

  @Column('bigint', { default: Date.now(), nullable: false })
  lastUpdatedAt: number;

  @Column({ nullable: true })
  email: string;

  @Column({ default: false, nullable: false })
  isEmailVerified: boolean;

  @Column({ default: true, nullable: false })
  isActive: boolean;

  @Column({ default: false, nullable: false })
  isPremium: boolean;

  @OneToOne(() => EncryptedToken, (token) => token.id, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  githubTokenId: string;

  @Column({ nullable: true })
  githubUserName: string;
}
