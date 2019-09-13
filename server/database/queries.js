import { Pool } from 'pg';
import dotenv from 'dotenv';
import { users } from '../models/userModel';

dotenv.config();

class Database {
  static databaseConnection() {
    // dev DB
    if (process.env.NODE_ENV === 'development') {
      return new Pool({
        connectionString: process.env.DEV_DB_URL,
      });
    }

    // test DB
    if (process.env.NODE_ENV === 'test') {
      return new Pool({
        connectionString: process.env.TEST_DB_URL,
      });
    }

    // Production DB with Heroku
    if (process.env.NODE_ENV === 'production') {
      return new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }
    return 0;
  }

  static createTables() {
    const conn = this.databaseConnection();
    const result = conn.query(`
    CREATE TABLE IF NOT EXISTS users (
        userId SERIAL,
        email VARCHAR(100) UNIQUE NOT NULL,
        firstname VARCHAR(50) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        address VARCHAR (100) NOT NULL,
        bio VARCHAR(250) NOT NULL,
        occupation VARCHAR (100) NOT NULL,
        expertise VARCHAR(50) NOT NULL,
        type VARCHAR(10) NOT NULL,
        PRIMARY KEY (userId)
    );

    CREATE TABLE IF NOT EXISTS sessions (
        sessionId SERIAL,
        mentorId INT REFERENCES users(userId) ON DELETE CASCADE,
        menteeId INT REFERENCES users(userId) ON DELETE CASCADE,
        questions VARCHAR(250) NOT NULL,
        menteeEmail VARCHAR(100) NOT NULL,
        status VARCHAR(20),
        PRIMARY KEY(sessionId)
    );

    CREATE TABLE IF NOT EXISTS reviews (
        reviewid SERIAL,
        sessionId INT REFERENCES sessions(sessionId) on DELETE CASCADE,
        mentorId INT REFERENCES users(userId) ON DELETE CASCADE,
        menteeId INT REFERENCES users(userId) ON DELETE CASCADE,
        score INT not null,
        menteeFullName VARCHAR(100) NOT NULL,
        remark VARCHAR(250),
        PRIMARY KEY(reviewid)
    );
    `);
    return result;
  }

  static createUsers(data) {
    const conn = this.databaseConnection();
    const result = conn.query(`INSERT into users (email, firstname, lastname, password, address, bio, occupation, expertise, type) VALUES (
        '${data.email}',
        '${data.firstname}',
        '${data.lastname}',
        '${data.password}',
        '${data.address}',
        '${data.bio}',
        '${data.occupation}',
        '${data.expertise}',
        '${data.type}') on conflict (email) do nothing returning *`);
    conn.end();
    return result;
  }

  static createReviews(data) {
    const conn = this.databaseConnection();
    const result = conn.query(`INSERT into reviews (sessionid, mentorid, menteeid, score, menteefullname, remark) VALUES (
        ${data.sessionid},
        ${data.mentorid},
        ${data.menteeid},
        ${data.score},
        '${data.menteefullname}',
        '${data.remark}')returning *`);
    conn.end();
    return result;
  }

  static async upgradeToMentor(table, column, value) {
    const conn = this.databaseConnection();
    const result = await conn.query(`UPDATE ${table} SET type='mentor' WHERE ${column} = '${value}'`);
    await conn.end();
    return result;
  }

  static async acceptsession(table, column, value) {
    const conn = this.databaseConnection();
    const result = await conn.query(`UPDATE ${table} SET status='accepted' WHERE ${column} = '${value}'`);
    await conn.end();
    return result;
  }

  static async rejectsession(table, column, value) {
    const conn = this.databaseConnection();
    const result = await conn.query(`UPDATE ${table} SET status='rejected' WHERE ${column} = '${value}'`);
    await conn.end();
    return result;
  }

  static async findUser(table, column, value) {
    const conn = this.databaseConnection();
    const result = await conn.query(`SELECT * FROM ${table} WHERE ${column} = '${value}'`);
    await conn.end();
    return result;
  }

  static async viewMentors() {
    const conn = this.databaseConnection();
    const result = await conn.query("SELECT * FROM users WHERE type = 'mentor'");
    await conn.end();
    return result;
  }

  static async viewSessiions() {
    const conn = this.databaseConnection();
    const result = await conn.query('SELECT * FROM sessions');
    await conn.end();
    return result;
  }

  static async viewUsers() {
    const conn = this.databaseConnection();
    const result = await conn.query(' SELECT userid,email FROM users ');
    await conn.end();
    return result;
  }

  static async viewSpecificMentor(table, column, value) {
    const conn = this.databaseConnection();
    const result = await conn.query(`SELECT * FROM ${table} WHERE type='mentor' AND ${column} = '${value}'`);
    await conn.end();
    return result;
  }

  static async selectBy(table, column, row) {
    const conn = this.databaseConnection();
    const result = await conn.query(`SELECT * FROM ${table} WHERE ${column} = '${row}'`);
    await conn.end();
    return result;
  }

  static async createSessions(data) {
    const conn = this.databaseConnection();
    const result = await conn.query(`INSERT into sessions (mentorid, menteeid, questions, menteeemail, status) VALUES (
        ${data.mentorid},
        ${data.menteeid},
        '${data.questions}',
        '${data.menteeemail}',
        '${data.status}'
      ) returning *;
      `);
    await conn.end();
    return result;
  }
}

export default Database;