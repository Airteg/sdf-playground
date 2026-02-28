import { Skia, SkRuntimeEffect } from "@shopify/react-native-skia";
import React from "react";
import { ShaderCanvas } from "./src/ShaderCanvas";

import shaderSource from "./src/shaders/shaderThinking.sksl";
// import shaderSource from "./src/shaders/square.sksl";
// import shaderSource from "./src/shaders/circle.sksl";
// import shaderSource from "./src/shaders/gradient.sksl";

const circ = `
uniform float  u_time;
uniform float2 u_resolution;

half4 main(float2 fragCoord) {
    // 1. Нормалізація координат (нуль по центру екрана)
    // Ділимо на .y, щоб пропорції були квадратними
    float2 uv = (fragCoord - 0.5 * u_resolution) / u_resolution.x;

    // 2. Визначаємо координати нашого відрізка
    float2 a = float2(0.0, 0.0);   // Початок у центрі
    float2 b = float2(0.3, 0.0);   // Кінець зміщений вправо на 0.3

    // 3. Створюємо вектори
    float2 ab = b - a; // Вектор лінії
    float2 ap = uv - a; // Вектор до пікселя

    // 4. Шукаємо проєкцію (відсоток шляху вздовж відрізка)
    // dot(ab, ab) - це математичний квадрат довжини відрізка.
    float t = dot(ap, ab) / dot(ab, ab);

    // 5. ЖОРСТКА МЕЖА (Clamp)
    // Якщо піксель лежить лівіше точки A, проєкція буде від'ємною (< 0.0).
    // Якщо піксель лежить правіше точки B, проєкція буде > 1.0.
    // Нам потрібен саме ВІДРІЗОК, а не нескінченна пряма, тому ми 
    // обмежуємо t значеннями від 0.0 до 1.0.
    t = clamp(t, 0.0, 1.0);

    // 6. Знаходимо найближчу точку на відрізку
    // Множимо вектор лінії на наш відсоток і додаємо до стартової точки
    float2 closestPoint = a + ab * t;

    // 7. Рахуємо відстань від пікселя до цієї найближчої точки
    float dist = length(uv - closestPoint);

    // 8. Малюємо лінію товщиною 0.01
    // Все, що ближче ніж 0.01 до лінії, буде 1.0 (білим кольором)
    float mask = 1.0 - step(1/u_resolution.y, dist);

    return half4(mask, mask, mask, 1.0); // Біла лінія на чорному фоні
}
    `;

// const shaderSource = circ;

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
