const { CosmosClient } = require('@azure/cosmos');

const connectionString = process.env.COSMOS_CONNECTION_STRING || process.env.COSMOS_CONNECTION || '';
const client = new CosmosClient(connectionString);

const DB_NAME = process.env.COSMOS_DATABASE || 'evoting_db';
const ELECTIONS = process.env.COSMOS_CONTAINER_ELECTIONS || 'elections';
const VOTES = process.env.COSMOS_CONTAINER_VOTES || 'votes';

async function getContainers() {
  const { database } = await client.databases.createIfNotExists({ id: DB_NAME });
  const { container: elections } = await database.containers.createIfNotExists({ id: ELECTIONS, partitionKey: { kind: 'Hash', paths: ['/id'] } });
  const { container: votes } = await database.containers.createIfNotExists({ id: VOTES, partitionKey: { kind: 'Hash', paths: ['/electionId'] } });
  return { database, elections, votes };
}

module.exports = { client, getContainers };
