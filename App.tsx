import { Skia, SkRuntimeEffect } from "@shopify/react-native-skia";
import React from "react";
import { ShaderCanvas } from "./src/ShaderCanvas";

// import shaderSource from "./src/shaders/_test_time.sksl";
import shaderSource from "./src/shaders/lesson5_swizzle.sksl";
// import shaderSource from "./src/shaders/gradient.sksl";
// import shaderSource from "./src/shaders/lesson1_types.sksl";
// import shaderSource from "./src/shaders/lesson2_math.sksl";

function assertEffect(effect: SkRuntimeEffect | null): SkRuntimeEffect {
  if (!effect) {
    throw new Error("Shader compile failed");
  }
  return effect;
}

const effect = assertEffect(Skia.RuntimeEffect.Make(shaderSource));

export default function App() {
  return <ShaderCanvas effect={effect} />;
}
