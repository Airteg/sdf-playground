import {
  Canvas,
  Fill,
  Shader,
  SkRuntimeEffect,
} from "@shopify/react-native-skia";
import { useState } from "react";
import { Text, View } from "react-native";

type Props = {
  effect: SkRuntimeEffect | null; // Тепер приймаємо і null теж
};

export function ShaderCanvas({ effect }: Props) {
  const [resolution, setResolution] = useState<[number, number] | null>(null);

  // Якщо шейдер не скомпілювався
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
      onLayout={(e) =>
        setResolution([e.nativeEvent.layout.width, e.nativeEvent.layout.height])
      }
    >
      <Canvas style={{ flex: 1 }}>
        <Fill>
          {resolution && (
            <Shader source={effect} uniforms={{ u_resolution: resolution }} />
          )}
        </Fill>
      </Canvas>
    </View>
  );
}
