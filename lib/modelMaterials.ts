import * as THREE from "three";

const SKIP_TINT =
  /screen|glass|camera|flash|grill|screw|pixel|logo|rim_button/i;

function shouldTintMaterial(name: string) {
  if (!name) return false;
  if (SKIP_TINT.test(name)) return false;
  if (name === "Material.001" || name === "Material.003") return false;
  return (
    /^Material\./i.test(name) ||
    name === "Plastic" ||
    name.toLowerCase().includes("body")
  );
}

export function applyBodyTint(root: THREE.Object3D, hex: string) {
  const tint = new THREE.Color(hex);

  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;

    const mesh = child as THREE.Mesh;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    for (const material of materials) {
      if (!material || !(material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
        continue;
      }

      const mat = material as THREE.MeshStandardMaterial;
      if (!shouldTintMaterial(mat.name)) continue;

      mat.color.copy(tint);
      mat.metalness = Math.min(mat.metalness, 0.82);
      mat.roughness = THREE.MathUtils.clamp(mat.roughness, 0.28, 0.45);
      mat.needsUpdate = true;
    }
  });
}