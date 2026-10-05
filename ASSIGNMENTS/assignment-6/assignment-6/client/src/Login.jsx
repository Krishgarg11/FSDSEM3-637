import { useState } from "react";
import { gql } from "./graphql.js";

const LOGIN = `mutation ($u: String!, $p: String!) { login(username: $u, password: $p) { token username } }`;

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const { login } = await gql(LOGIN, { u: username, p: password });
      onLogin(login);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h1>Login</h1>
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="error">{error}</p>}
      <button type="submit">Log in</button>
    </form>
  );
}
