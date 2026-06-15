import * as THREE from "three";

/** Riduce lo spostamento verticale delle AirPods nel GLB Sketchfab. */
export function tameAirpodsClip(clip: THREE.AnimationClip, travelScale = 0.26) {
  const next = clip.clone();

  for (const track of next.tracks) {
    const name = track.name.toLowerCase();
    if (!name.includes("airpods")) continue;
    if (!name.includes("position") && !name.includes("translation")) {
      continue;
    }

    const baseY = track.values[1];

    for (let i = 1; i < track.values.length; i += 3) {
      track.values[i] = baseY + (track.values[i] - baseY) * travelScale;
    }
  }

  return next;
}

export function prepareCategoryClips(
  path: string,
  animations: THREE.AnimationClip[],
) {
  if (!path.includes("airpods")) {
    return animations;
  }

  return animations.map((clip) =>
    clip.name === "CINEMA_4D_Main" ? tameAirpodsClip(clip) : clip,
  );
}