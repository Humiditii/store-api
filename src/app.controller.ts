import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/guard/decorator/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public(true)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
