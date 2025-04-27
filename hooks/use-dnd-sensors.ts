import { useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';

export function useDndSensors() {
  return useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );
}
