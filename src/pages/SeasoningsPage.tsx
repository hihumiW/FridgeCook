import { seasonings } from "@/data";
import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { CustomSeasoningButton } from "@/components/seasonings/CustomSeasoningButton";
import { SeasoningChip } from "@/components/seasonings/SeasoningChip";
import { SeasoningSearchBox } from "@/components/seasonings/SeasoningSearchBox";
import type { SeasoningCategory } from "@/types";

const selectedSeasoningIds = [
  "salt",
  "oil",
  "soy_sauce",
  "garlic",
  "vinegar",
  "ginger",
  "dried_chili",
];

const categorySections: { title: string; category: SeasoningCategory }[] = [
  { title: "基础调料", category: "basic" },
  { title: "常见增味", category: "flavor_booster" },
  { title: "辛香料", category: "aromatics" },
  { title: "进阶调料", category: "advanced" },
];

function isSelected(id: string) {
  return selectedSeasoningIds.includes(id);
}

export function SeasoningsPage() {
  return (
    <DeviceFrame>
      <AppTopBar showReset={false} />

      <header className="mt-6 px-1">
        <h1 className="text-[24px] font-black leading-8 tracking-normal text-[#151411]">我的调料库</h1>
        <p className="mt-2 text-[12px] font-semibold text-[#9b958d]">
          勾选你家里常有的调料，下次会自动记住。
        </p>
      </header>

      <div className="mt-5">
        <SeasoningSearchBox />
      </div>

      <div className="mt-6 space-y-7">
        {categorySections.map((section) => {
          const items = seasonings.filter((item) => item.category === section.category);

          return (
            <section className="space-y-3" key={section.category}>
              <h2 className="px-1 text-[14px] font-extrabold text-[#1b1a17]">{section.title}</h2>
              <div className="flex flex-wrap gap-2.5">
                {items.map((item) => (
                  <SeasoningChip
                    emoji={item.emoji}
                    key={item.id}
                    name={item.name}
                    selected={isSelected(item.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <section className="space-y-3 pb-8">
          <h2 className="px-1 text-[14px] font-extrabold text-[#1b1a17]">自定义调料</h2>
          <div className="flex flex-wrap gap-2.5">
            <CustomSeasoningButton>添加自定义调料</CustomSeasoningButton>
            <SeasoningChip name="藤椒油" selected />
          </div>
          <p className="pt-8 text-center text-[11px] font-medium text-[#aaa39a]">
            每次修改都会自动保存到本地
          </p>
        </section>
      </div>
    </DeviceFrame>
  );
}
