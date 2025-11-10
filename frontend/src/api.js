import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export async function getElections() {
  const res = await axios.get(`${API_BASE}/api/elections`);
  return res.data;
}

export async function createElection(payload) {
  const res = await axios.post(`${API_BASE}/api/elections`, payload);
  return res.data;
}

export async function vote(electionId, candidateId) {
  const res = await axios.post(`${API_BASE}/api/vote`, { electionId, candidateId });
  return res.data;
}

export async function getResults(electionId) {
  const res = await axios.get(`${API_BASE}/api/results/${electionId}`);
  return res.data;
}
