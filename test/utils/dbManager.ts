import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect } from 'mongoose';
import { Collection } from 'mongodb';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';

let mongod: MongoMemoryServer;
let mongoUri: string;
export const startServer = async () => {
  mongod = await MongoMemoryServer.create();
  mongoUri = mongod.getUri();
  return mongoUri;
};

export const stopServer = async () => {
  await mongod.stop();
};

export const seedDb = async () => {
  const mongoConnection = (await connect(mongoUri)).connection;
  const usersCollection = mongoConnection.collection('users');
  await seedCollections(usersCollection);
};

export const clearCollection = async (collectionString: string) => {
  const mongoConnection = (await connect(mongoUri)).connection;
  const collection = mongoConnection.collection(collectionString);
  await collection.deleteMany({});
};

const seedCollections = async (usersCollection: Collection) => {
  await usersCollection.insertOne(user);
};

export const clearCollections = async () => {
  await clearCollection('users');
};

const user: CreateUserDto = {
  userId: '1234',
  email: 'user@email.com',
};
