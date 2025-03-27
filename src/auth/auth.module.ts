import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/auth.schema";
import { AuthController } from "./auth.controller";
import { UserRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

@Module({
    controllers:[AuthController],
    providers:[UserRepository, AuthService],
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                global: true
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
    ]
})

export class AuthModule {}