import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { Repository } from 'typeorm';

import { User } from './../src/modules/user/entities/user.entity';
import { UserModule } from './../src/modules/user/user.module';
import { databaseForTest } from '../src/utils/database.test';

describe('User', () => {
  let app: INestApplication;
  let repository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, databaseForTest()],
    }).compile();

    app = moduleFixture.createNestApplication();
    repository = moduleFixture.get('UserRepository');
    await app.init();
  });

  afterEach(async () => {
    await repository.query(`DELETE FROM user;`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /user', () => {
    it('should return an array of users', async () => {
      await repository.save([{ name: 'test-name-0' }, { name: 'test-name-1' }]);
      const { body } = await supertest
        .agent(app.getHttpServer())
        .get('/user')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(body).toEqual([
        { id: expect.any(String), name: 'test-name-0' },
        { id: expect.any(String), name: 'test-name-1' },
      ]);
    });
  });

  describe('POST /user', () => {
    it('should return a cat', async () => {
      const { body } = await supertest
        .agent(app.getHttpServer())
        .post('/user')
        .set('Accept', 'application/json')
        .send({ name: 'test-name' })
        .expect('Content-Type', /json/)
        .expect(201);
      expect(body).toEqual({ id: expect.any(String), name: 'test-name' });
    });

    it('should create a user is the DB', async () => {
      await expect(repository.findAndCount()).resolves.toEqual([[], 0]);
      await supertest
        .agent(app.getHttpServer())
        .post('/user')
        .set('Accept', 'application/json')
        .send({ name: 'test-name' })
        .expect('Content-Type', /json/)
        .expect(201);
      await expect(repository.findAndCount()).resolves.toEqual([
        [{ id: expect.any(String), name: 'test-name' }],
        1,
      ]);
    });

    it('should handle a missing name', async () => {
      await supertest
        .agent(app.getHttpServer())
        .post('/user')
        .set('Accept', 'application/json')
        .send({ none: 'test-none' })
        .expect('Content-Type', /json/)
        .expect(500);
    });
  });
});
