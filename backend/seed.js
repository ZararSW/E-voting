/**
 * Seed script for local dev. Run: node seed.js
 * Requires COSMOS_CONNECTION_STRING env var (or set values in local.settings.json)
 */
const { getContainers } = require('./cosmosClient');

async function run() {
  const containers = await getContainers();
  const elections = containers.elections;
  // sample election
  const election = {
    id: 'election-1',
    title: 'Student Council 2025',
    candidates: [ { id: 'c1', name: 'Alice' }, { id: 'c2', name: 'Bob' } ],
    createdAt: new Date().toISOString()
  };
  console.log('Creating sample election...');
  await elections.items.upsert(election);
  console.log('Done.');
}

run().catch(err => { console.error(err); process.exit(1); });
