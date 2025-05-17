// EmbeddingModel.jsx — Embedding and vector memory gateway
import { useState } from "react";
import useEmbedding from "../hooks/useEmbedding";
import useVectorMemory from "../hooks/useVectorMemory";

const EmbeddingModel = ({ message, onEmbedded }) => {
  const [status, setStatus] = useState("idle");
  const { embedText } = useEmbedding();
  const { upsertMemory } = useVectorMemory();

  const processEmbedding = async () => {
    try {
      setStatus("embedding");
      const vector = await embedText(message);
      setStatus("saving");
      await upsertMemory({ vector, message });
      setStatus("done");
      onEmbedded();
    } catch (err) {
      console.error("Embedding error:", err);
      setStatus("error");
    }
  };

  return (
    <div className="embedding-status">
      <button onClick={processEmbedding} disabled={status !== "idle"}>
        {status === "idle" && "Embed"}
        {status === "embedding" && "Embedding..."}
        {status === "saving" && "Saving..."}
        {status === "done" && "Done"}
        {status === "error" && "Retry"}
      </button>
    </div>
  );
};

export default EmbeddingModel;
