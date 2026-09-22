import type { Exercise } from "./types";
import { setupExercises } from "./setup";
import { snapshottingExercises } from "./snapshotting";
import { branchingExercises } from "./branching";
import { inspectingExercises } from "./inspecting";
import { undoingExercises } from "./undoing";
import { sharingExercises } from "./sharing";

export * from "./types";

const exercises: Exercise[] = [
  ...setupExercises,
  ...snapshottingExercises,
  ...branchingExercises,
  ...inspectingExercises,
  ...undoingExercises,
  ...sharingExercises,
];

export function getExercisesForCommand(slug: string): Exercise[] {
  return exercises.filter((e) => e.slug === slug);
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function getAllExercises(): Exercise[] {
  return [...exercises];
}

export function getExerciseSlugs(): string[] {
  return [...new Set(exercises.map((e) => e.slug))];
}