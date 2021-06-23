import { TypeOrmModule } from '@nestjs/typeorm';

const databaseForTest = () => {
  // name, // let TypeORM manage the connections
  return TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    entities: ['./**/*.entity.ts'],
    dropSchema: true,
    synchronize: true,
    logging: false,
  });
};

export { databaseForTest };
