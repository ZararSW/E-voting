import React, { useEffect, useState } from 'react';
import { getElections, createElection, vote, getResults } from './api';

function AuthButtons() {
  const login = (provider) => {
    window.location.href = `/.auth/login/${provider}?post_login_redirect_uri=/`;
  };
  const logout = () => { window.location.href = '/.auth/logout'; };

  return (
    <div style={{marginBottom:12}}>
      <button onClick={() => login('github')}>Login with GitHub</button>
      <button onClick={() => login('azureactivedirectory')}>Login with Microsoft</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default function App() {
  const [elections, setElections] = useState([]);
  const [user, setUser] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchUser();
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  async function fetchUser() {
    try {
      const r = await fetch('/.auth/me');
      if (!r.ok) return;
      const data = await r.json();
      if (data && data.clientPrincipal) {
        setUser(data.clientPrincipal);
      } else if (Array.isArray(data) && data.length>0) {
        // newer SWA returns [] or clientPrincipal in object; handle both
        const cp = data?.find(x=>x.identityProvider);
        setUser(cp || null);
      }
    } catch (e) { console.log('no auth', e); }
  }

  async function load() {
    const list = await getElections();
    setElections(list || []);
  }

  async function handleCreate() {
    if (!newTitle) return alert('Enter title');
    await createElection({ title: newTitle, candidates: [{ id: 'c1', name: 'Alice' }, { id: 'c2', name: 'Bob' }] });
    setNewTitle('');
    load();
  }

  async function handleVote(eid, cid) {
    await vote(eid, cid);
    load();
  }

  return (
    <div style={{padding:20,fontFamily:'Segoe UI'}}>
      <h1>University Clubs E-Voting</h1>
      <AuthButtons />
      {user && <div>Signed in as: {user.userDetails || user?.userId || JSON.stringify(user)}</div>}

      <h2>Active Elections</h2>
      {elections.map(e => (
        <div key={e.id} style={{border:'1px solid #ddd',padding:12,marginBottom:8}}>
          <h3>{e.title}</h3>
          <div>
            {e.candidates?.map(c => (
              <div key={c.id} style={{display:'flex',alignItems:'center',gap:8}}>
                <strong>{c.name}</strong>
                <button onClick={() => handleVote(e.id, c.id)}>Vote</button>
              </div>
            ))}
          </div>
          <div style={{marginTop:8}}>
            <a href="#" onClick={async (ev)=>{ev.preventDefault(); const r = await getResults(e.id); alert(JSON.stringify(r,null,2))}}>View results</a>
          </div>
        </div>
      ))}

      <h2>Admin: Create Election</h2>
      <div>
        <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Election title" />
        <button onClick={handleCreate}>Create (adds two sample candidates)</button>
      </div>

      <footer style={{marginTop:24,fontSize:'0.9em',color:'#666'}}>
        Built for university clubs. Deployment: GitHub Actions → Azure Static Web Apps
      </footer>
    </div>
  );
}
