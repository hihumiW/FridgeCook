import { Grip, RotateCcw } from "lucide-react";

import { ingredients, seasonings } from "@/data";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { EmojiPreview } from "@/components/home/EmojiPreview";
import { EnergyCard } from "@/components/home/EnergyCard";
import { HomeIconButton } from "@/components/home/HomeIconButton";
import { PeopleStepperMock } from "@/components/home/PeopleStepperMock";
import { PreferenceChip } from "@/components/home/PreferenceChip";
import { PromptBoxMock } from "@/components/home/PromptBoxMock";
import { SummaryCard } from "@/components/home/SummaryCard";

const selectedIngredients = ["tomato", "egg", "tofu", "bacon"];
const savedSeasonings = ["oil", "soy_sauce", "garlic", "dried_chili", "sesame_oil"];

function pickEmoji(ids: string[], source: { id: string; name: string; emoji?: string }[]) {
  return ids
    .map((id) => source.find((item) => item.id === id))
    .filter((item): item is { id: string; name: string; emoji?: string } => Boolean(item?.emoji));
}

export function HomePage() {
  const ingredientPreview = pickEmoji(selectedIngredients, ingredients);
  const seasoningPreview = pickEmoji(savedSeasonings, seasonings);

  return (
    <DeviceFrame>
      <div className="flex items-center justify-between px-1">
        <HomeIconButton label="菜单">
          <Grip className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </HomeIconButton>
        <HomeIconButton label="重新开始">
          <RotateCcw className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </HomeIconButton>
      </div>

      <header className="mt-7 px-1">
        <h1 className="text-[28px] font-black leading-9 tracking-normal text-[#151411]">今晚吃什么？</h1>
        <p className="mt-2 text-[13px] font-semibold text-[#969188]">点几下，看看这些东西能不能凑一顿。</p>
      </header>

      <div className="mt-7 space-y-3.5">
        <SummaryCard title="本次食材" subtitle="已选 4 种">
          {ingredientPreview.map((item) => (
            <EmojiPreview emoji={item.emoji ?? ""} key={item.id} label={item.name} />
          ))}
        </SummaryCard>

        <SummaryCard title="我的调料库" subtitle="已保存 12 种">
          {seasoningPreview.map((item) => (
            <EmojiPreview emoji={item.emoji ?? ""} key={item.id} label={item.name} />
          ))}
        </SummaryCard>

        <PeopleStepperMock />
      </div>

      <section className="mt-6 space-y-3">
        <h2 className="px-1 text-[15px] font-extrabold text-[#1b1a17]">你的精力状态</h2>
        <div className="grid grid-cols-3 gap-3">
          <EnergyCard icon="⚡" subtitle="5 分钟糊弄" title="快饿死了" />
          <EnergyCard icon="😊" selected subtitle="15 分钟正常做" title="还有口气" />
          <EnergyCard icon="⭐" subtitle="折腾一下" title="精力充沛" />
        </div>
      </section>

      <section className="mt-7 space-y-3">
        <h2 className="px-1 text-[15px] font-extrabold text-[#1b1a17]">
          口味偏好
          <span className="ml-2 text-[12px] font-bold text-[#9d968d]">（可多选）</span>
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <PreferenceChip>清淡</PreferenceChip>
          <PreferenceChip badge="1">🌶️ 辣一点</PreferenceChip>
          <PreferenceChip>重口味</PreferenceChip>
          <PreferenceChip>热乎汤菜</PreferenceChip>
          <PreferenceChip>下饭菜</PreferenceChip>
          <PreferenceChip>少油</PreferenceChip>
          <PreferenceChip selected>🥕 不挑，能吃就行</PreferenceChip>
        </div>
      </section>

      <div className="mt-7">
        <PromptBoxMock />
      </div>

      <footer className="mt-5 space-y-3">
        <button
          className="h-[52px] w-full rounded-[18px] bg-[#111] text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          type="button"
        >
          用这些凑一顿
        </button>
        <p className="text-center text-[12px] font-semibold text-[#aaa39a]">没思路？先选点食材再说吧～</p>
      </footer>
    </DeviceFrame>
  );
}
