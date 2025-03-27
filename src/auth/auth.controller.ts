import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { AuthSignupDto } from "./dto/auth.dto";
import { AppResponse } from "src/common/util/app.response";
import { Public } from "src/common/guard/decorator/public.decorator";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService:AuthService
    ){}

    private readonly success = AppResponse.success;

    @Public(true)
    @Post('create')
    async createAccount(
        @Res() res: Response,
        @Body() signupDto: AuthSignupDto
    ):Promise<Response>{

        const data = await this.authService.createUser(signupDto)

        return res.status(200).json(this.success('Signup success!', 201, data))
    }

    @Public(true)
    @Post('login')
    async login(
        @Res() res: Response,
        @Body() loginDto: AuthSignupDto 
    ): Promise<Response> {

        const token = await this.authService.login(loginDto)

        return res.status(200).json(this.success('Login success!', 200, {token}))
    }

    @Get('profile')
    async profile(
        @Res() res: Response,
        @Req() req: any
    ): Promise<Response> {

        const data = await this.authService.profile(req.user.userId)

        return res.status(200).json(this.success('Profile fetched!', 200,  data))
    }
}