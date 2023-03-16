import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { useState } from "react";
import styles from "../styles/Home.module.css";

function ConnectionTab() {
  const [liveKitUrl, setLiveKitUrl] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();

  const router = useRouter();
  const join = () => {
    router.push(`/custom/?liveKitUrl=${liveKitUrl}&token=${token}`);
  };
  return (
    <div className={styles.tabContent}>
      <input
        type="url"
        placeholder="URL"
        onChange={(ev) => setLiveKitUrl(ev.target.value)}
      ></input>
      <input
        type="text"
        placeholder="Token"
        onChange={(ev) => setToken(ev.target.value)}
      ></input>
      <hr
        style={{
          width: "100%",
          borderColor: "rgba(255, 255, 255, 0.15)",
          marginBlock: "1rem",
        }}
      />
      <button
        style={{
          paddingInline: "1.25rem",
          width: "100%",
        }}
        className="lk-button"
        onClick={join}
      >
        Connect
      </button>
    </div>
  );
}

const Home: NextPage = () => {
  return (
    <>
      <main className={styles.main} data-lk-theme="default">
        <ConnectionTab />
      </main>
    </>
  );
};

export default Home;
