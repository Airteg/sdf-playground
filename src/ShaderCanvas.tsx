import {
  Canvas,
  Fill,
  Shader,
  SkRuntimeEffect,
} from "@shopify/react-native-skia";
import React from "react";
import { View } from "react-native";
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

type Props = {
  effect: SkRuntimeEffect;
};

export function ShaderCanvas({ effect }: Props) {
  const res = useSharedValue<[number, number]>([0, 0]);
  const ready = useSharedValue(false);

  const time = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    time.value = (frameInfo.timeSinceFirstFrame ?? 0) / 1000;
  });

  const uniforms = useDerivedValue(() => {
    return {
      u_resolution: res.value,
      u_time: time.value,
    };
  });

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        res.value = [Math.round(width), Math.round(height)];
        ready.value = true;
      }}
    >
      <Canvas style={{ flex: 1 }}>
        <Fill>
          {/* Рендеримо тільки коли є layout */}
          {/* ready — shared value, але тут можна просто перевіряти width/height > 0 */}
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
}
