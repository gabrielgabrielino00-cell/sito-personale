"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { CategoryIcon } from "@/lib/data";
import { useParallaxContext } from "./ParallaxContext";

const TITANIUM = "#8e8e93";
const TITANIUM_DARK = "#636366";
const SCREEN = "#050508";

function useCursorRotation() {
  const ref = useRef<THREE.Group>(null!);
  const { stateRef, mode } = useParallaxContext();

  useFrame(() => {
    if (!ref.current || mode !== "hero") return;

    const px = stateRef.current.pointerX;
    const py = stateRef.current.pointerY;
    const follow = 0.42;

    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      px * Math.PI,
      follow,
    );
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      py * (Math.PI / 2),
      follow,
    );
    ref.current.rotation.z = THREE.MathUtils.lerp(
      ref.current.rotation.z,
      -px * 0.45 + py * 0.2,
      follow,
    );
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x,
      px * 0.65,
      follow,
    );
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      py * 0.5 + 0.28,
      follow,
    );
    ref.current.position.z = THREE.MathUtils.lerp(
      ref.current.position.z,
      py * 0.35,
      follow,
    );
  });

  return ref;
}

function useStaticGroup() {
  const ref = useRef<THREE.Group>(null!);
  const { mode } = useParallaxContext();

  useFrame(() => {
    if (!ref.current || mode !== "category") return;
    ref.current.rotation.set(0, 0, 0);
    ref.current.position.set(0, 0, 0);
  });

  return ref;
}

/* ─── iPhone 17 ─── */
export function IPhone17Model({ scale = 1 }: { scale?: number }) {
  const ref = useCursorRotation();

  return (
    <group ref={ref} scale={scale}>
        {/* Corpo titanio */}
        <RoundedBox args={[1.32, 2.82, 0.11]} radius={0.14} smoothness={10} castShadow>
          <meshPhysicalMaterial
            color={TITANIUM}
            metalness={0.98}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.03}
            reflectivity={1}
          />
        </RoundedBox>

        {/* Bordi laterali satinati */}
        <mesh position={[0.66, 0, 0]}>
          <boxGeometry args={[0.012, 2.6, 0.08]} />
          <meshPhysicalMaterial color={TITANIUM_DARK} metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[-0.66, 0, 0]}>
          <boxGeometry args={[0.012, 2.6, 0.08]} />
          <meshPhysicalMaterial color={TITANIUM_DARK} metalness={1} roughness={0.2} />
        </mesh>

        {/* Schermo edge-to-edge */}
        <mesh position={[0, 0, 0.058]}>
          <planeGeometry args={[1.24, 2.58]} />
          <meshPhysicalMaterial
            color={SCREEN}
            emissive="#f97316"
            emissiveIntensity={0.18}
            metalness={0.4}
            roughness={0.02}
          />
        </mesh>

        {/* Dynamic Island */}
        <mesh position={[0, 1.1, 0.064]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.048, 0.14, 4, 16]} />
          <meshStandardMaterial color="#000" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Camera Control button (lato) */}
        <mesh position={[0.67, 0.35, 0]}>
          <boxGeometry args={[0.018, 0.14, 0.04]} />
          <meshPhysicalMaterial color="#555" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Action button */}
        <mesh position={[0.67, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.018, 24]} />
          <meshPhysicalMaterial color="#444" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Modulo camera iPhone 17 — barra orizzontale */}
        <group position={[0, 0.95, -0.065]}>
          <RoundedBox args={[0.72, 0.28, 0.045]} radius={0.05} smoothness={4}>
            <meshPhysicalMaterial
              color={TITANIUM_DARK}
              metalness={0.95}
              roughness={0.1}
              clearcoat={0.8}
            />
          </RoundedBox>

          {/* Lenti principali */}
          {[-0.2, 0.05, 0.28].map((x, i) => (
            <group key={i} position={[x, 0, -0.03]}>
              <mesh>
                <cylinderGeometry args={[0.09, 0.09, 0.04, 32]} />
                <meshPhysicalMaterial color="#1a1a22" metalness={0.7} roughness={0.05} />
              </mesh>
              <mesh position={[0, 0, -0.025]}>
                <circleGeometry args={[0.075, 32]} />
                <meshPhysicalMaterial
                  color="#0a0a10"
                  metalness={0.9}
                  roughness={0.02}
                  envMapIntensity={3}
                />
              </mesh>
              <mesh position={[0, 0, -0.032]}>
                <ringGeometry args={[0.04, 0.055, 32]} />
                <meshPhysicalMaterial color="#222" metalness={0.8} roughness={0.1} />
              </mesh>
            </group>
          ))}

          {/* Flash / LiDAR */}
          <mesh position={[0.42, 0.08, -0.025]}>
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial color="#f5f5f0" emissive="#fff" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.42, -0.08, -0.025]}>
            <circleGeometry args={[0.028, 16]} />
            <meshStandardMaterial color="#111" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>

        {/* USB-C */}
        <mesh position={[0, -1.2, 0.02]}>
          <boxGeometry args={[0.28, 0.035, 0.025]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
  );
}

/* ─── AirPods Pro ─── */
export function AirPodsModel({ scale = 1 }: { scale?: number }) {
  const ref = useStaticGroup();

  const earbud = (x: number, z: number, rotY: number) => (
    <group position={[x, 0.55, z]} rotation={[0.3, rotY, 0.15]}>
      {/* Stelo */}
      <mesh position={[0, -0.22, 0]}>
        <capsuleGeometry args={[0.055, 0.28, 4, 12]} />
        <meshPhysicalMaterial color="#f5f5f7" metalness={0.1} roughness={0.35} />
      </mesh>
      {/* Auricolare */}
      <mesh>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshPhysicalMaterial color="#fafafa" metalness={0.05} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.1]} rotation={[0.4, 0, 0]}>
        <sphereGeometry args={[0.09, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#eee" metalness={0.1} roughness={0.3} />
      </mesh>
      {/* Griglia */}
      <mesh position={[0, 0, 0.12]} rotation={[0.3, 0, 0]}>
        <circleGeometry args={[0.04, 16]} />
        <meshStandardMaterial color="#ccc" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );

  return (
    <group ref={ref} scale={scale}>
        {/* Custodia */}
        <RoundedBox args={[1.5, 0.65, 0.95]} radius={0.18} smoothness={8} castShadow>
          <meshPhysicalMaterial color="#f2f2f7" metalness={0.05} roughness={0.45} />
        </RoundedBox>

        {/* Coperchio (linea) */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[1.42, 0.008, 0.9]} />
          <meshStandardMaterial color="#e0e0e5" roughness={0.5} />
        </mesh>

        {/* LED frontale */}
        <mesh position={[0, 0, 0.48]}>
          <circleGeometry args={[0.025, 16]} />
          <meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={0.6} />
        </mesh>

        {/* Cerniera */}
        <mesh position={[0, 0.12, -0.42]}>
          <boxGeometry args={[0.5, 0.04, 0.06]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Auricolari */}
        {earbud(-0.35, 0.15, 0.3)}
        {earbud(0.35, 0.15, -0.3)}
      </group>
  );
}

/* ─── Lavatrice (elettrodomestici) ─── */
export function WashingMachineModel({ scale = 1 }: { scale?: number }) {
  const ref = useStaticGroup();

  return (
    <group ref={ref} scale={scale}>
        {/* Corpo principale */}
        <RoundedBox args={[1.5, 1.85, 1.35]} radius={0.04} smoothness={4} castShadow>
          <meshPhysicalMaterial color="#f8f8fa" metalness={0.15} roughness={0.55} />
        </RoundedBox>

        {/* Pannello superiore */}
        <mesh position={[0, 0.88, 0.02]}>
          <boxGeometry args={[1.48, 0.18, 1.32]} />
          <meshPhysicalMaterial color="#ececf0" metalness={0.2} roughness={0.4} />
        </mesh>

        {/* Display digitale */}
        <mesh position={[0.45, 0.88, 0.69]}>
          <boxGeometry args={[0.42, 0.1, 0.02]} />
          <meshPhysicalMaterial
            color="#0f172a"
            emissive="#f97316"
            emissiveIntensity={0.25}
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>

        {/* Manopola */}
        <mesh position={[0, 0.88, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 32]} />
          <meshPhysicalMaterial color="#c0c0c8" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.88, 0.73]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.015, 8, 32]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.25} />
        </mesh>

        {/* Tasti */}
        {[-0.35, -0.2].map((x, i) => (
          <mesh key={i} position={[x, 0.88, 0.69]}>
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.5} roughness={0.3} />
          </mesh>
        ))}

        {/* Oblò — anello cromato */}
        <mesh position={[0, -0.05, 0.68]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.42, 0.05, 16, 48]} />
          <meshPhysicalMaterial color="#b0b0b8" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Vetro oblò */}
        <mesh position={[0, -0.05, 0.7]}>
          <circleGeometry args={[0.38, 48]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            resolution={256}
            transmission={0.85}
            thickness={0.3}
            roughness={0.05}
            color="#a8d4f0"
            attenuationColor="#4a90c2"
            attenuationDistance={0.5}
          />
        </mesh>

        {/* Tamburo interno (visibile) */}
        <mesh position={[0, -0.05, 0.65]}>
          <circleGeometry args={[0.3, 48]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Maniglia oblò */}
        <mesh position={[0, -0.42, 0.72]}>
          <boxGeometry args={[0.25, 0.04, 0.06]} />
          <meshPhysicalMaterial color="#c8c8d0" metalness={0.85} roughness={0.15} />
        </mesh>

        {/* Cassetto detersivo */}
        <mesh position={[-0.55, 0.88, 0.69]}>
          <boxGeometry args={[0.28, 0.08, 0.12]} />
          <meshPhysicalMaterial color="#e4e4e8" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Piedini */}
        {[
          [-0.6, -0.95, 0.5],
          [0.6, -0.95, 0.5],
          [-0.6, -0.95, -0.5],
          [0.6, -0.95, -0.5],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <cylinderGeometry args={[0.04, 0.05, 0.06, 12]} />
            <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
  );
}

/* ─── Cuffie over-ear ─── */
export function HeadphonesModel({ scale = 1 }: { scale?: number }) {
  const ref = useStaticGroup();

  return (
    <group ref={ref} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.85, 0.04, 16, 64, Math.PI]} />
          <meshPhysicalMaterial color="#2a2a35" metalness={0.9} roughness={0.1} />
        </mesh>
        {[-0.85, 0.85].map((x, i) => (
          <group key={i} position={[x, -0.15, 0]}>
            <RoundedBox args={[0.5, 0.65, 0.22]} radius={0.12} smoothness={4}>
              <meshPhysicalMaterial color="#1e1e28" metalness={0.85} roughness={0.15} />
            </RoundedBox>
            <mesh position={[0, 0, 0.12]}>
              <circleGeometry args={[0.2, 32]} />
              <meshPhysicalMaterial
                color="#111"
                metalness={0.3}
                roughness={0.4}
                emissive="#f97316"
                emissiveIntensity={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>
  );
}

export function GamepadModel({ scale = 1 }: { scale?: number }) {
  const ref = useStaticGroup();

  return (
    <group ref={ref} scale={scale}>
        <RoundedBox args={[2.2, 1.3, 0.35]} radius={0.25} smoothness={6}>
          <meshPhysicalMaterial color="#1a1a24" metalness={0.7} roughness={0.2} />
        </RoundedBox>
        <mesh position={[-0.55, 0.1, 0.2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} />
          <meshStandardMaterial color="#222" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[-0.55, 0.1, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.035, 8, 32]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.2} />
        </mesh>
        {[
          [0.5, 0.2],
          [0.65, 0.05],
          [0.5, -0.1],
          [0.35, 0.05],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.2]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial
              color={i === 0 ? "#22c55e" : "#374151"}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
        ))}
        <mesh position={[0, -0.35, 0.15]}>
          <boxGeometry args={[0.5, 0.12, 0.06]} />
          <meshStandardMaterial color="#444" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
  );
}

export function ChipModel({ scale = 1 }: { scale?: number }) {
  const ref = useStaticGroup();

  return (
    <group ref={ref} scale={scale}>
        <RoundedBox args={[1.2, 1.2, 0.15]} radius={0.04} smoothness={2}>
          <meshPhysicalMaterial color="#1a1a22" metalness={0.9} roughness={0.1} />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]}>
          <boxGeometry args={[0.7, 0.7, 0.02]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            resolution={128}
            transmission={0.9}
            thickness={0.2}
            roughness={0.05}
            color="#f97316"
          />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`t${i}`} position={[-0.5 + i * 0.14, 0.65, 0]}>
            <boxGeometry args={[0.04, 0.15, 0.04]} />
            <meshStandardMaterial color="#c0c0c8" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>
  );
}

export function CableModel({ scale = 1 }: { scale?: number }) {
  const ref = useStaticGroup();

  return (
    <group ref={ref} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusKnotGeometry args={[0.5, 0.08, 128, 16]} />
          <meshPhysicalMaterial
            color="#f97316"
            metalness={0.6}
            roughness={0.2}
            clearcoat={1}
          />
        </mesh>
        <RoundedBox args={[0.35, 0.6, 0.25]} radius={0.05} position={[0.6, 0.4, 0]}>
          <meshPhysicalMaterial color="#e8e8f0" metalness={0.4} roughness={0.3} />
        </RoundedBox>
      </group>
  );
}

export function CategoryModel({
  icon,
  scale = 0.82,
}: {
  icon: CategoryIcon;
  scale?: number;
}) {
  switch (icon) {
    case "smartphone":
      return <IPhone17Model scale={scale * 0.48} />;
    case "audio":
      return <AirPodsModel scale={scale * 0.78} />;
    case "cuffie":
      return <HeadphonesModel scale={scale * 0.62} />;
    case "videogames":
      return <GamepadModel scale={scale * 0.5} />;
    case "elettrodomestici":
      return <WashingMachineModel scale={scale * 0.48} />;
    case "elettronica":
      return <ChipModel scale={scale * 0.58} />;
    case "accessori":
    default:
      return <CableModel scale={scale * 0.58} />;
  }
}

export { IPhone17Model as PhoneModel };