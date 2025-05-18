import { useEffect } from "react";

const useColdStartRecovery = (restoreFn) => {
  useEffect(() => {
    if (typeof restoreFn === "function") restoreFn();
  }, [restoreFn]);
};

export default useColdStartRecovery;
