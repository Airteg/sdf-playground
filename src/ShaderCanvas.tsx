import {
  Canvas,
  Fill,
  Shader,
  SkRuntimeEffect,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { PanResponder, View } from "react-native";
import {
  SharedValue,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

export type PlaygroundUniformsSV = {
  // params
  p1: SharedValue<number>;
  p2: SharedValue<number>;
  p3: SharedValue<number>;
  p4: SharedValue<number>;

  // debug
  debugMode: SharedValue<number>; // int-ish
  debugView: SharedValue<number>; // int-ish

  // time controls
  freeze: SharedValue<number>; // 0/1
  timeScale: SharedValue<number>; // e.g. 1.0
  stepSignal: SharedValue<number>; // increments to step one frame
  stepSize: SharedValue<number>; // e.g. 1/60

  // pointer
  mouse: SharedValue<[number, number]>; // px,px  (-1,-1) if none
};

type Props = {
  effect: SkRuntimeEffect;
  controls: PlaygroundUniformsSV;
};

export function ShaderCanvas({ effect, controls }: Props) {
  const res = useSharedValue<[number, number]>([0, 0]);

  // internal time (seconds)
  const t = useSharedValue(0);

  // for step detection
  const lastStep = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    const raw = (frameInfo.timeSinceFirstFrame ?? 0) / 1000;

    // normal mode: time runs
    if (controls.freeze.value === 0) {
      t.value = raw * controls.timeScale.value;
      return;
    }

    // freeze mode: time only changes when stepSignal increments
    const sig = controls.stepSignal.value;
    if (sig !== lastStep.value) {
      const deltaSteps = sig - lastStep.value;
      lastStep.value = sig;
      t.value = t.value + deltaSteps * controls.stepSize.value;
    }
  });

  const uniforms = useDerivedValue(() => {
    return {
      u_resolution: res.value,
      u_time: t.value,
      u_mouse: controls.mouse.value,

      u_p1: controls.p1.value,
      u_p2: controls.p2.value,
      u_p3: controls.p3.value,
      u_p4: controls.p4.value,

      u_debugMode: controls.debugMode.value | 0,
      u_debugView: controls.debugView.value | 0,
    };
  });

  // PanResponder for mouse/touch
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        controls.mouse.value = [locationX, locationY];
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        controls.mouse.value = [locationX, locationY];
      },
      onPanResponderRelease: () => {
        controls.mouse.value = [-1, -1];
      },
      onPanResponderTerminate: () => {
        controls.mouse.value = [-1, -1];
      },
    });
  }, [controls]);

  return (
    <View
      style={{ flex: 1 }}
      {...panResponder.panHandlers}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        res.value = [Math.round(width), Math.round(height)];
      }}
    >
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
}
