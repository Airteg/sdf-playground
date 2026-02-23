import { SkRuntimeEffect } from "@shopify/react-native-skia";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { PlaygroundUniformsSV, ShaderCanvas } from "./ShaderCanvas";

type Props = { effect: SkRuntimeEffect };

function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.btn}>
      <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  );
}

function ValueRow({
  label,
  valueText,
  onDec,
  onInc,
}: {
  label: string;
  valueText: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rowRight}>
        <Button title="-" onPress={onDec} />
        <Text style={styles.value}>{valueText}</Text>
        <Button title="+" onPress={onInc} />
      </View>
    </View>
  );
}

const viewName = (v: number) => (v === 0 ? "GRAY" : v === 1 ? "HEAT" : "RGB");
const modeName = (m: number) =>
  m === 0 ? "OFF" : m === 1 ? "SHOW_VALUE" : m === 2 ? "SHOW_UV" : "SHOW_GRID";

export function ShaderPlayground({ effect }: Props) {
  // ✅ SharedValues: тільки тут, на верхньому рівні компонента
  const sv_p1 = useSharedValue(0.3);
  const sv_p2 = useSharedValue(1.0);
  const sv_p3 = useSharedValue(0.0);
  const sv_p4 = useSharedValue(0.0);

  const sv_debugMode = useSharedValue(0);
  const sv_debugView = useSharedValue(0);

  const sv_freeze = useSharedValue(0);
  const sv_timeScale = useSharedValue(1.0);
  const sv_stepSignal = useSharedValue(0);
  const sv_stepSize = useSharedValue(1 / 60);

  const sv_mouse = useSharedValue<[number, number]>([-1, -1]);

  // ✅ controls object: просто “упаковка” вже створених SV
  const controls: PlaygroundUniformsSV = useMemo(
    () => ({
      p1: sv_p1,
      p2: sv_p2,
      p3: sv_p3,
      p4: sv_p4,

      debugMode: sv_debugMode,
      debugView: sv_debugView,

      freeze: sv_freeze,
      timeScale: sv_timeScale,
      stepSignal: sv_stepSignal,
      stepSize: sv_stepSize,

      mouse: sv_mouse,
    }),
    [
      sv_p1,
      sv_p2,
      sv_p3,
      sv_p4,
      sv_debugMode,
      sv_debugView,
      sv_freeze,
      sv_timeScale,
      sv_stepSignal,
      sv_stepSize,
      sv_mouse,
    ],
  );

  // ✅ React state: тільки для UI тексту (без читання .value в render)
  const [p1, setP1] = useState(0.3);
  const [p2, setP2] = useState(1.0);
  const [p3, setP3] = useState(0.0);
  const [p4, setP4] = useState(0.0);

  const [freeze, setFreeze] = useState(0);
  const [timeScale, setTimeScale] = useState(1.0);
  const [stepSize, setStepSize] = useState(1 / 60);

  const [debugMode, setDebugMode] = useState(0);
  const [debugView, setDebugView] = useState(0);

  // setters, що оновлюють і SV, і React state
  const apply = {
    p1: (v: number) => {
      sv_p1.value = v;
      setP1(v);
    },
    p2: (v: number) => {
      sv_p2.value = v;
      setP2(v);
    },
    p3: (v: number) => {
      sv_p3.value = v;
      setP3(v);
    },
    p4: (v: number) => {
      sv_p4.value = v;
      setP4(v);
    },
    freeze: (v: number) => {
      sv_freeze.value = v;
      setFreeze(v);
    },
    timeScale: (v: number) => {
      sv_timeScale.value = v;
      setTimeScale(v);
    },
    stepSize: (v: number) => {
      sv_stepSize.value = v;
      setStepSize(v);
    },
    debugMode: (v: number) => {
      const iv = v | 0;
      sv_debugMode.value = iv;
      setDebugMode(iv);
    },
    debugView: (v: number) => {
      const iv = v | 0;
      sv_debugView.value = iv;
      setDebugView(iv);
    },
    step: () => {
      sv_stepSignal.value = sv_stepSignal.value + 1;
    },
  };

  const bump = (x: number, delta: number) => x + delta;

  return (
    <View style={{ flex: 1 }}>
      <ShaderCanvas effect={effect} controls={controls} />

      <View style={styles.panel}>
        <Text style={styles.title}>Shader Playground</Text>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Params (u_p1..u_p4)</Text>

          <ValueRow
            label="u_p1"
            valueText={p1.toFixed(3)}
            onDec={() => apply.p1(bump(p1, -0.01))}
            onInc={() => apply.p1(bump(p1, +0.01))}
          />
          <ValueRow
            label="u_p2"
            valueText={p2.toFixed(3)}
            onDec={() => apply.p2(bump(p2, -0.05))}
            onInc={() => apply.p2(bump(p2, +0.05))}
          />
          <ValueRow
            label="u_p3"
            valueText={p3.toFixed(3)}
            onDec={() => apply.p3(bump(p3, -0.05))}
            onInc={() => apply.p3(bump(p3, +0.05))}
          />
          <ValueRow
            label="u_p4"
            valueText={p4.toFixed(3)}
            onDec={() => apply.p4(bump(p4, -0.05))}
            onInc={() => apply.p4(bump(p4, +0.05))}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Time</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Freeze</Text>
            <View style={styles.rowRight}>
              <Button
                title={freeze ? "ON" : "OFF"}
                onPress={() => apply.freeze(freeze ? 0 : 1)}
              />
              <Button title="Step" onPress={apply.step} />
            </View>
          </View>

          <ValueRow
            label="timeScale"
            valueText={timeScale.toFixed(2)}
            onDec={() => apply.timeScale(Math.max(0, timeScale - 0.1))}
            onInc={() => apply.timeScale(timeScale + 0.1)}
          />

          <ValueRow
            label="stepSize"
            valueText={stepSize.toFixed(4)}
            onDec={() => apply.stepSize(Math.max(0.0001, stepSize - 1 / 120))}
            onInc={() => apply.stepSize(stepSize + 1 / 120)}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Debug</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Mode</Text>
            <View style={styles.rowRight}>
              <Button
                title={modeName(debugMode)}
                onPress={() => apply.debugMode((debugMode + 1) % 4)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>View</Text>
            <View style={styles.rowRight}>
              <Button
                title={viewName(debugView)}
                onPress={() => apply.debugView((debugView + 1) % 3)}
              />
            </View>
          </View>

          <Text style={styles.hint}>
            debugMode=SHOW_VALUE → return dbgShowValue(x)
          </Text>
          <Text style={styles.hint}>Touch canvas → u_mouse</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    left: 12,
    top: 12,
    right: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  group: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.25)",
  },
  groupTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  value: { color: "white", minWidth: 64, textAlign: "center" },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },
  btnText: { color: "white", fontSize: 12, fontWeight: "600" },
  hint: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 4 },
});
