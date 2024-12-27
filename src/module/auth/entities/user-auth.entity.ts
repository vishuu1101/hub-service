import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_auth')
export class UserAuth {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @OneToOne(() => User, (user) => user.userAuth, { cascade: false })
  user: User;

  @Column({ type: 'text', name: 'access_token' })
  accessToken: string;

  @Column({ type: 'text', name: 'refresh_token' })
  refreshToken: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_date',
  })
  createdDate: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'upated_date',
  })
  updatedDate: Date;
}
