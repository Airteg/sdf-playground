import { Skia } from "@shopify/react-native-skia";
import React from "react";
import { ShaderCanvas } from "./src";
import lesson2 from "./src/shaders/lesson2_math.sksl";

// Створюємо RuntimeEffect один раз поза компонентом
const effect = Skia.RuntimeEffect.Make(lesson2);

if (!effect) {
  throw new Error(
    "Не вдалося скомпілювати шейдер. Перевірте синтаксис шейдера та консоль на наявність помилок.",
  );
}

export default function App() {
  return <ShaderCanvas effect={effect} />;
}
