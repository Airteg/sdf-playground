import { Skia, SkRuntimeEffect } from "@shopify/react-native-skia";
import React from "react";
import { ShaderCanvas } from "./src/ShaderCanvas";

import shaderSource from "./src/shaders/square.sksl";
// import shaderSource from "./src/shaders/circle.sksl";
// import shaderSource from "./src/shaders/gradient.sksl";

function assertEffect(effect: SkRuntimeEffect | null): SkRuntimeEffect {
  if (!effect) {
    throw new Error("Shader compile failed");
  }
  return effect;
}

export default function App() {
  const effect = assertEffect(Skia.RuntimeEffect.Make(shaderSource));

  return <ShaderCanvas effect={effect} />;
}
