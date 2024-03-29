import http from 'http';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';
import app from '../../../app';
import models from '../../../Application/Database/models';
import { lineManagerHash } from '../testUtils';
import { companyInfo } from '../../../Application/Features/utilities/utils/general';
import EmailNotifications from '../../../Application/Features/utilities/notifications/EmailNotifications';

jest.mock('@sendgrid/mail');

const { LineManagers } = models;

const lineManagerDetails = {
  idNumber: 'SN773456',
  solId: 333,
  firstname: 'firstname',
  lastname: 'lastname',
  email: 'email@email.com',
  phone: '8057632182'
};

const supervisorsIncorrectDetails = {
  idNumber: 'SN773456',
  firstname: '   ',
  lastname: '   ',
  phone: '8057632182'
};

companyInfo.emailAddress = 'someEmailAddress';

describe('Line Manager', () => {
  let server;
  let request;

  beforeAll(async () => {
    server = http.createServer(app);
    await server.listen(7000);
    request = supertest('http://init.overtime-api.example.com:7000');
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET/Create/Update Line managers', () => {
    let token;

    beforeAll(async () => {
      // signin a user
      const response = await request
        .post('/signin')
        .send({ staffId: 'TN098432', password: 'password' })
        .set('Accept', 'application/json');

      token = response.header['set-cookie'];
    });

    beforeEach(() => jest.spyOn(EmailNotifications, 'sender').mockImplementation(() => {}));

    afterEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it('should fail if staff is not logged in', async () => {
      const response = await request
        .post('/users/profile/line-manager')
        .set('Accept', 'application/json')
        .send(lineManagerDetails);

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Please login first.');
    });

    it('should fail if field entries are incorrect', async () => {
      const response = await request
        .post('/users/profile/line-manager')
        .set('cookie', token)
        .set('Accept', 'application/json')
        .send(supervisorsIncorrectDetails);

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual('validationErrors');
      expect(response.body.errors.length).toEqual(2);
    });

    it('should fail if fields are missing', async () => {
      const { phone, ...rest } = lineManagerDetails;
      const response = await request
        .post('/users/profile/line-manager')
        .set('cookie', token)
        .set('Accept', 'application/json')
        .send(rest);

      const expectedMessage = 'The following fields are missing: phone';

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(expectedMessage);
    });

    it('should add supervisor if supervisor does not already exist', async () => {
      const response = await request
        .post('/users/profile/line-manager')
        .set('cookie', token)
        .set('Accept', 'application/json')
        .send(lineManagerDetails);

      expect(response.status).toBe(201);
      expect(response.body.message).toEqual('Line manager added successfully.');
    });

    it('should update supervisor if supervisor already exists', async () => {
      const response = await request
        .post('/users/profile/line-manager')
        .set('cookie', token)
        .set('Accept', 'application/json')
        .send(lineManagerDetails);

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Line manager updated successfully.');
    });

    it('should respond with a list of line managers', async () => {
      const response = await request.get('/line-managers').set('cookie', token);
      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Request successful!');
      expect(response.body.data).toHaveLength(8);
      expect(response.body.data[0]).toHaveProperty('idNumber');
    });

    it('should respond with an error message if an error occurs', async () => {
      const err = new Error('Not working');
      jest.spyOn(LineManagers, 'findOrCreate').mockRejectedValue(err);
      const response = await request
        .post('/users/profile/line-manager')
        .set('cookie', token)
        .set('Accept', 'application/json')
        .send(lineManagerDetails);

      expect(response.status).toBe(500);
      expect(response.body.message).toEqual('An error occured ERR500CNGLNM');
    });

    it('should respond with an error message if authentication fails', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error(); });

      const response = await request
        .post('/users/profile/line-manager')
        .set('cookie', token)
        .set('Accept', 'application/json')
        .send(lineManagerDetails);

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Authentication error ERRSTFAUTH.');
    });
  });
});
