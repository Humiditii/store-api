import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import { AllGlobalExceptionsFilter } from './common/util/globalFilter.filters';


async function bootstrap() {

  const logger = new Logger('MAIN');

  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.enableCors();

  app.setGlobalPrefix('api/v1');

  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });
  
  app.useGlobalFilters(new AllGlobalExceptionsFilter())

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port, () =>
    logger.log(`App running on Port: ${port}`)
  );

}
bootstrap(); 
