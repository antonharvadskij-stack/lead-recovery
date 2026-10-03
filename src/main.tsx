import React from "react";
import { createRoot } from "react-dom/client";
import GameCanvas from "./components/GameCanvas";
import "./styles.css";

function App() {
  return (
    <main className="game-root">
      <GameCanvas />
      <div className="rotate-hint">Поверните устройство горизонтально</div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
