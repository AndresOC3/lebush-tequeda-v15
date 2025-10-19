
import React, { useEffect, useState } from "react";

const API = {
  async login(correo, password) {
    const r = await fetch(`/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.mensaje || "Error de autenticación");
    return data;
  },
};

export default function App() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    document.getElementById("root").classList.add("app-bg");
  }, []);

  async function doLogin(e) {
    e.preventDefault();
    setAuthErr("");
    try {
      const { token, usuario } = await API.login(correo, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(usuario));
      setToken(token); setUser(usuario);
    } catch (err) { setAuthErr(err.message || "Error"); }
  }

  function logout(){
    localStorage.removeItem("token"); localStorage.removeItem("user");
    setToken(null); setUser(null);
  }

  if(!token){
    return (
      <div className="app-bg" style={{padding:16}}>
        <div className="card" style={{width:380}}>
          <div className="logo" style={{marginBottom:10}}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 20H3L12 2z"/></svg>
            LEBUSH — ¡TeQueda! V15
          </div>
          <p className="muted" style={{marginTop:0}}>Inicia sesión con tu cuenta</p>
          <form onSubmit={doLogin} className="grid" style={{gap:10}}>
            <input className="input" placeholder="Correo" value={correo} onChange={(e)=>setCorreo(e.target.value)}/>
            <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e)=>setPassword(e.target.value)}/>
            {authErr && <div style={{color:"#ef4444",fontSize:12}}>{authErr}</div>}
            <button className="btn">🔑 Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row" style={{justifyContent:"space-between"}}>
        <h2 className="header-title">LEBUSH — ¡TeQueda! V15</h2>
        <div className="row"><span className="muted">Hola, {user?.nombre} ({user?.rol})</span>
          <button className="btn" onClick={logout}>🔒 Salir</button></div>
      </div>
      <div className="card" style={{marginTop:16}}>
        <h3 style={{marginTop:0}}>Dashboard</h3>
        <p className="muted">Login y conexión a MongoDB funcionando. Aquí podrás integrar tus módulos de pedidos, imágenes y exportaciones.</p>
      </div>
    </div>
  );
}
