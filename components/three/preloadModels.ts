import { useGLTF } from "@react-three/drei";
import { allModelPaths } from "@/lib/models3d";
import { IPHONE_MODEL_PATH } from "@/lib/cinematic/config";

let categoryModelsPreloaded = false;

function scheduleIdle(task: () => void, timeout = 2200) {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(task, { timeout });
    return;
  }
  window.setTimeout(task, 480);
}

/** Precarica i modelli categorie uno alla volta, in idle — non blocca l'hero. */
export function preloadCategoryModels() {
  if (categoryModelsPreloaded || typeof window === "undefined") return;
  categoryModelsPreloaded = true;

  const paths = allModelPaths.filter((path) => path !== IPHONE_MODEL_PATH);
  let index = 0;

  const preloadNext = () => {
    if (index >= paths.length) return;
    const path = paths[index];
    index += 1;
    useGLTF.preload(path);
    scheduleIdle(preloadNext);
  };

  scheduleIdle(preloadNext, 3200);
}