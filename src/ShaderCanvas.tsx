import {
  Canvas,
  Fill,
  Shader,
  SkRuntimeEffect,
} from "@shopify/react-native-skia";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

type Props = {
  effect: SkRuntimeEffect;
};

export function ShaderCanvas({ effect }: Props) {
  const [resolution, setResolution] = useState<[number, number] | null>(null);
  const [t0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  // простий таймер для u_time (секунди)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 16);
    return () => clearInterval(id);
  }, []);

  const uniforms = useMemo(() => {
    if (!resolution) return null;
    const u_time = (now - t0) / 1000;
    return { u_resolution: resolution, u_time };
  }, [resolution, now, t0]);

  if (!effect) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Помилка компіляції шейдера</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setResolution([Math.round(width), Math.round(height)]);
      }}
    >
      <Canvas style={{ flex: 1 }}>
        <Fill>
          {uniforms && <Shader source={effect} uniforms={uniforms} />}
        </Fill>
      </Canvas>
    </View>
  );
}
