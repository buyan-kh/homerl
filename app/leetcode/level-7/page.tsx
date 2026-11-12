import { LevelView } from "@/components/leetcode/LevelView";
import { LEETCODE_LEVEL_7 } from "@/data/leetcode/level-7";
import { LEETCODE_LEVELS } from "@/data/leetcode/meta";

export default function LeetCodeLevel7Page() {
  return (
    <main className="flex flex-1 flex-col items-stretch px-4 py-6 sm:px-8 sm:py-10 lg:px-10">
      <LevelView meta={LEETCODE_LEVELS[6]} items={LEETCODE_LEVEL_7} />
    </main>
  );
}
