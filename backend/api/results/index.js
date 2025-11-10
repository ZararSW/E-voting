const { getContainers } = require('../../cosmosClient');

module.exports = async function (context, req) {
  const electionId = context.bindingData.id || (req.query && req.query.id);
  if (!electionId) {
    context.res = { status: 400, body: 'election id required' };
    return;
  }
  const containers = await getContainers();
  const elections = containers.elections;
  const votes = containers.votes;

  const { resources: electionRes } = await elections.items.query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: electionId }] }).fetchAll();
  const election = electionRes && electionRes[0];
  if (!election) {
    context.res = { status: 404, body: 'Election not found' };
    return;
  }

  const { resources: voteRes } = await votes.items.query({ query: 'SELECT c.candidateId, COUNT(1) as cnt FROM c WHERE c.electionId = @eid GROUP BY c.candidateId', parameters: [{ name: '@eid', value: electionId }] }).fetchAll();

  const totals = (voteRes || []).reduce((acc, cur) => { acc[cur.candidateId] = cur.cnt; return acc; }, {});
  const results = (election.candidates || []).map(c => ({ id: c.id, name: c.name, votes: totals[c.id] || 0 }));

  context.res = { status: 200, body: { election: { id: election.id, title: election.title }, results } };
};
