import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { BaseRepository } from 'src/common/baseRepository.repository';
import { User } from './schema/auth.schema';

type UserDocument = User & Document;

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
        super(userModel);
    }

    async findByEmail(email: string, session?: ClientSession): Promise<User | null> {
        return this.userModel.findOne({ email }).session(session ?? null).exec();
    }
}