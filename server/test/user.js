// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import { it, describe } from 'mocha';
import jwt from 'jsonwebtoken';

import app from '../app';

import {
  newuser, admin, generalusers, signedUser, newUserCredentials,
} from './mockData';

// Configure chai
chai.use(chaiHttp);
chai.should();


const adminToken = jwt.sign(admin, process.env.KEY, { expiresIn: '1D' });
const userToken = jwt.sign(signedUser, process.env.KEY, { expiresIn: '1D' });
const usergeneraltoken = jwt.sign(newUserCredentials, process.env.KEY, { expiresIn: '1D' });

describe('user should sign up', () => {
  it('user should be able to signup', (done) => {
    chai.request(app).post('/api/v1/auth/signup')
      .send(newuser)
      .then((res) => {
        chai.expect(res).to.have.status(201);
        done();
      })
      .catch((err) => {
        console.log(err.message);
      });
  });
  it('general user should be able to signup', (done) => {
    chai.request(app).post('/api/v1/auth/signup')
      .send(generalusers)
      .then((res) => {
        chai.expect(res).to.have.status(201);
        done();
      })
      .catch((err) => {
        console.log(err.message);
      });
  });
  it('should return error if email already exists', (done) => {
    chai.request(app).post('/api/v1/auth/signup').send(newuser)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});
describe('user should sign in', () => {
  it('user should be able to sign in', (done) => {
    chai.request(app)
      .post('/api/v1/auth/signin')
      .send({ email: newuser.email, password: newuser.password })
      .end((err, res) => {
        chai.expect(res.status).to.be.eq(200);
        done();
      });
  });
describe('user should view list of all mentors', () => {
  it('user should be view list of all mentors', (done) => {
    chai.request(app)
      .get('/api/v1/mentors')
      .set('token', usergeneraltoken)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

