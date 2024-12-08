"use client";

import { useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

const Login = () => {
  const params = useSearchParams();
  const client_id = params.get("client_id");
  const state = params.get("state");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!client_id) alert("client_id not found");

  async function login() {
    if (!username) alert("username not found");
    if (!password) alert("password not found");
    if (!state) alert("state not found");

    const response: Record<string, any> = await axios.post(
      "http://localhost:2003/login",
      {
        username: username,
        password: password,
        client_id: client_id,
        state: state,
      }
    );

    if (response.data.status === "ERROR") {
      alert(response.data.message);
    }

    const path =
      response.data.redirect_uri +
      "?code=" +
      response.data.code +
      "&state=" +
      response.data.state;

    console.log(response.data);

    if (response) {
      window.location.href = path;
    }
  }
  return (
    <div className="w-dvw h-dvh flex justify-center flex-col items-center">
      <p className="text-lg font-bold p-5">Authorization Code Login Page</p>
      <div className="w-auto p-6 border border-black rounded flex flex-col items-center  gap-7">
        <input
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          type="text"
          placeholder="username"
          className="outline outline-1 pl-2 rounded focus:outline focus:outline-1  sm:text-sm/6"
        />
        <input
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          type="text"
          placeholder="password"
          className="outline outline-1 pl-2 rounded focus:outline focus:outline-1  sm:text-sm/6"
        />
        <button
          onClick={() => {
            login();
          }}
          className="bg-black text-white w-fit rounded p-2"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
