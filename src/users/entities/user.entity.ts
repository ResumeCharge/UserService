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

  @OneToOne(() => EncryptedToken, (token) => token.id, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  githubTokenId: string;

  @Column({ nullable: true })
  githubUserName: string;
}
