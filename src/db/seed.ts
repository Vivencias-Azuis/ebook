import { importGuidePraticoCourse } from "@/domains/course-import/guide-pratico";

let seedRun: Promise<void> | null = null;

export async function seedDatabase() {
  seedRun ??= importGuidePraticoCourse();

  await seedRun;
}

seedDatabase().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
