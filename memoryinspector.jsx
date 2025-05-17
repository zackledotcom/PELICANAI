// MemoryInspector.jsx — Displays vector hits, token use, pin toggles, preview
import { useContext } from "react";
import { MemoryContext } from "../context/MemoryContext";

const MemoryInspector = () => {
  const { memoryHits, tokenUsage, maxTokens, pinMemory, unpinMemory } = useContext(MemoryContext);

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 shadow rounded-2xl space-y-4">
      <h2 className="text-lg font-semibold">Memory Inspector</h2>
      <div className="text-sm text-zinc-500">
        Token Usage: <span className="font-medium text-black dark:text-white">{tokenUsage}</span> / {maxTokens}
      </div>
      <ul className="space-y-2 max-h-64 overflow-y-auto">
        {memoryHits.map((item, idx) => (
          <li
            key={idx}
            className="border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <div className="text-xs text-zinc-400 mb-1">{item.timestamp}</div>
            <div className="text-sm text-zinc-800 dark:text-zinc-100 mb-2">{item.preview}</div>
            {item.pinned ? (
              <button
                className="text-xs text-red-500 hover:underline"
                onClick={() => unpinMemory(item.id)}
              >
                Unpin
              </button>
            ) : (
              <button
                className="text-xs text-blue-500 hover:underline"
                onClick={() => pinMemory(item.id)}
              >
                Pin
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemoryInspector;