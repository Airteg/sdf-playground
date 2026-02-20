import React from "react";
import { Skia } from "@shopify/react-native-skia";
import { ShaderCanvas } from "./src";
import gradientSource from "./src/shaders/gradient.sksl";

// Створюємо RuntimeEffect один раз поза компонентом
const effect = Skia.RuntimeEffect.Make(gradientSource);

if (!effect) {
  throw new Error(
    "Не вдалося скомпілювати шейдер. Перевірте синтаксис у gradient.sksl",
  );
}

export default function App() {
  return <ShaderCanvas effect={effect} />;
}
