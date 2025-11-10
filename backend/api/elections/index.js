const { getContainers } = require('../../cosmosClient');
const { v4: uuidv4 } = require('uuid');

module.exports = async function (context, req) {
  const method = (req.method || 'GET').toUpperCase();
  const containers = await getContainers();
  const elections = containers.elections;

  if (method === 'GET') {
    const { resources } = await elections.items.readAll().fetchAll();
    context.res = { status: 200, body: resources };
    return;
  }

  if (method === 'POST') {
    const body = req.body || {};
    const id = uuidv4();
    const doc = {
      id,
      title: body.title || 'Untitled',
      candidates: body.candidates || [],
      createdAt: new Date().toISOString()
    };
    await elections.items.create(doc);
    context.res = { status: 201, body: doc };
    return;
  }

  context.res = { status: 405, body: 'Method not allowed' };
};
