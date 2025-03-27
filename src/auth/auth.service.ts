import { Injectable } from "@nestjs/common";
import { UserRepository } from "./auth.repository";
import { User } from "./schema/auth.schema";
import { AppResponse } from "src/common/util/app.response";
import { AuthSignupDto } from "./dto/auth.dto";
import { normalizeEmail } from "src/common/util/methods.util";
import { AppErr, JwtPayloadI } from "src/common/interface/main.interface";
import { JwtService } from "@nestjs/jwt";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { compareSync, genSaltSync, hashSync } from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private jwtService: JwtService,
        @InjectConnection() private readonly connection: Connection,
    ){}

    async createUser(createUser: AuthSignupDto):Promise<User | undefined>{
        try {

            createUser.email = normalizeEmail(createUser?.email)

            const findUser = await this.userRepository.findByEmail(createUser?.email);

            if(findUser){
                const err: AppErr = {
                    message: "User exists",
                    status: 400
                }
                return AppResponse.error(err)
            }

            // hash password
            createUser.password = hashSync(createUser.password, genSaltSync())
            return await this.userRepository.create(createUser)
            
        } catch (error) {
            error.location = `AuthServices.${this.createUser.name} method`;
            return AppResponse.error(error)
        }
    }

    async login(loginUser: AuthSignupDto):Promise<string>{
        try {
            loginUser.email = normalizeEmail(loginUser.email)

            const findUser: User = await this.userRepository.findByEmail(loginUser.email) as User;

            if (!findUser) {
                const err: AppErr = {
                    message: "User doesn\'t exists",
                    status: 404
                }
                return AppResponse.error(err)
            }

            // compare password
            if (!compareSync(loginUser.password, findUser.password)) {
                const err: AppErr = { message: 'Invalid Password supplied!', status: 400 }

                AppResponse.error(err)
            }

            const payload: JwtPayloadI = {
                userId: findUser._id as string,

            }

            return await this.jwtService.signAsync(payload);

        } catch (error) {
            error.location = `AuthServices.${this.createUser.name} method`;
            return AppResponse.error(error)
        }
    }

    async profile(userId:string):Promise<User>{
        try {

            const user: User = await this.userRepository.findById(userId) as User;

            if (!user) {
                const err: AppErr = {
                    message: "User doesn\'t exists",
                    status: 404
                }
                return AppResponse.error(err)
            }

            return user
            
        } catch (error) {
            error.location = `AuthServices.${this.createUser.name} method`;
            return AppResponse.error(error)
        }
    }
}