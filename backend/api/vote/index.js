const { getContainers } = require('../../cosmosClient');

module.exports = async function (context, req) {
  const body = req.body || {};
  const { electionId, candidateId } = body;
  if (!electionId || !candidateId) {
    context.res = { status: 400, body: 'electionId and candidateId required' };
    return;
  }

  // get user id from Static Web Apps header if present
  const principalHeader = context.req.headers['x-ms-client-principal'] || context.req.headers['x-ms-client-principal-id'];
  let userId = null;
  try {
    if (principalHeader) {
      // header is base64-encoded JSON
      const buff = Buffer.from(principalHeader, 'base64');
      const json = buff.toString('utf8');
      const principal = JSON.parse(json);
      userId = principal.userId || principal.userDetails || principal.upn || principal.claims?.find(c=>c.typ==='http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress')?.val;
    }
  } catch (e) { /* ignore */ }

  if (!userId) {
    // fallback to header from /.auth/me proxy when not running in SWA
    userId = req.headers['x-user-id'] || req.headers['x-user-email'] || 'anonymous';
  }

  const containers = await getContainers();
  const votes = containers.votes;

  // enforce one vote per user per election
  const { resources } = await votes.items.query({ query: 'SELECT * FROM c WHERE c.electionId = @eid AND c.userId = @uid', parameters: [{ name: '@eid', value: electionId }, { name: '@uid', value: userId }] }).fetchAll();
  if (resources && resources.length > 0) {
    context.res = { status: 403, body: { message: 'User already voted in this election' } };
    return;
  }

  const voteDoc = { id: `${electionId}_${userId}`, electionId, candidateId, userId, createdAt: new Date().toISOString() };
  await votes.items.create(voteDoc);
  context.res = { status: 201, body: { success: true } };
};
