import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

const sksl = `
uniform vec2 resolution;

// 1. Формула кола (повертає відстань від центру)
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

// 2. Формула квадрата (трохи складніша математика для кутів)
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

vec4 main(vec2 fragCoord) {
    // Нормалізуємо координати
    vec2 p = (2.0 * fragCoord.xy - resolution.xy) / min(resolution.x, resolution.y);

    // Створюємо дві фігури в просторі (зміщуємо їх по осі X)
    float d1 = sdCircle(p - vec2(-0.5, 0.3), 0.2);  // Коло зліва
    float d2 = sdBox(p - vec2(0.5, 0.0), vec2(0.4));    // Квадрат справа

    // Об'єднання (Union). Піксель шукає найближчий край з двох.
    float d = min(d1, d2); 

    // --- ВІЗУАЛІЗАЦІЯ "ТОПОГРАФІЇ" ---
    
    // Колір: якщо d > 0 (зовні) - синій, якщо d < 0 (всередині) - помаранчевий
    vec3 col = (d > 0.0) ? vec3(0.1, 0.4, 0.7) : vec3(0.8, 0.4, 0.1);
    
    // Затемнюємо колір чим далі від краю фігури
    col *= 1.0 - exp(-6.0 * abs(d));
    
    // Малюємо "лінії висот" (хвилі за допомогою косинуса)
    col *= 0.8 + 0.2 * cos(120.0 * d);
    
    // Малюємо ідеально білий контур там, де d дорівнює 0
    col = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.015, abs(d)));

    return vec4(col, 1.0);
}
`;
const test1 = `
  // uniform vec2 resolution; 
  // Залишаємо наш "пін" для часу
  // Замість void main() ми пишемо vec4 main(), 
  // бо функція тепер має повернути колір.
  // Також Skia автоматично передає сюди координати поточного пікселя (fragCoord).
    
  vec4 main(vec2 fragCoord) {
    // Замість присвоєння глобальній змінній, ми просто повертаємо колір
    return vec4(1.0, 0.0, 0.0, 1.0); 
}`;
const test2 = `
  // Оголошуємо наші "піни" для прийому даних
  uniform vec2 u_resolution; // Розмір екрану
  uniform vec3 u_myColor;    // Наш кастомний колір з JS

  vec4 main(vec2 fragCoord) {
    // Ділимо поточний піксель (наприклад 195) на ширину екрану (390).
    // Отримуємо значення від 0.0 (лівий край) до 1.0 (правий край).
    float xPercent = fragCoord.x / u_resolution.x;

    // Множимо наш колір на цей відсоток. 
    // Зліва він буде чорним (множимо на 0), справа - повним (множимо на 1).
    vec3 finalColor = u_myColor * xPercent;

    return vec4(finalColor, 1.0); 
  }
`;
const test3 = ``;
// Правильний виклик фабрики шейдерів через глобальний об'єкт Skia
const effect = Skia.RuntimeEffect.Make(test2);

export default function App() {
  // Перевірка на випадок синтаксичної помилки в самому SkSL коді
  if (!effect) {
    console.error("Шейдер не скомпілювався!");
    return null;
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill>
          <Shader
            source={effect}
            uniforms={{
              u_resolution: [width, height], // Передаємо масив з 2 чисел
              u_myColor: [0.0, 1.0, 0.5], // Передаємо масив з 3 чисел (зеленуватий)
            }}
          />
        </Fill>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  canvas: { flex: 1 },
});
