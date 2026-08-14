import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';

const AntennaModel = ({ data }) => {
  const meshRef = useRef();
  
  // Scale factor for 3D units
  const s = 0.05;
  const pW = (data?.Patch_W || 37.26) * s;
  const pL = (data?.Patch_L || 28.84) * s;
  const fW = (data?.Feed_W || 3.07) * s;

  return (
    <group ref={meshRef}>
      {/* Substrate */}
      <Box args={[4, 0.1, 4]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#062e06" />
      </Box>

      {/* Copper Patch */}
      <Box args={[pW, 0.02, pL]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#d4af37" metalness={0.8} />
      </Box>

      {/* Feedline */}
      <Box args={[fW, 0.02, 1.5]} position={[0, 0.01, -1.25]}>
        <meshStandardMaterial color="#d4af37" metalness={0.8} />
      </Box>
    </group>
  );
};

export default AntennaModel;