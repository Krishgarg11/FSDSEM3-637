import { useState } from "react";
import Login from "./Login.jsx";
import Notes from "./Notes.jsx";

export default function App() {
  const [auth, setAuth] = useState(null);
  return auth ? (
    <Notes auth={auth} onLogout={() => setAuth(null)} />
  ) : (
    <div className="app"><Login onLogin={setAuth} /></div>
  );
}
