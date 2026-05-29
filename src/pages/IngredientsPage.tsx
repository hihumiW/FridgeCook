import { ingredients } from "@/data";
import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { CategoryPill } from "@/components/ingredients/CategoryPill";
import { IngredientSearchBox } from "@/components/ingredients/IngredientSearchBox";
import { IngredientTile } from "@/components/ingredients/IngredientTile";
import { SelectedIngredientsBar } from "@/components/ingredients/SelectedIngredientsBar";

const selectedIngredientIds = ["tomato", "egg", "tofu", "bacon"];
const categoryLabels = ["常用", "蔬菜", "肉蛋奶", "豆制品", "主食", "速冻"];
const recentItems = ["西兰花", "玉米", "胡萝卜", "鸡腿", "金针菇"];

function isSelected(id: string) {
  return selectedIngredientIds.includes(id);
}

export function IngredientsPage() {
  const commonIngredients = ingredients.filter((item) => item.isCommon).slice(0, 15);
  const selectedNames = selectedIngredientIds
    .map((id) => ingredients.find((item) => item.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <DeviceFrame>
      <AppTopBar showReset={false} />

      <header className="mt-6 px-1 text-left">
        <h1 className="text-[24px] font-black leading-8 tracking-normal text-[#151411]">今晚冰箱里有什么？</h1>
        <p className="mt-2 text-[12px] font-semibold text-[#9b958d]">只选这次要用的，不会当成长期库存。</p>
      </header>

      <div className="mt-5">
        <IngredientSearchBox />
      </div>

      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoryLabels.map((label, index) => (
          <CategoryPill active={index === 0} key={label} label={label} />
        ))}
      </nav>

      <section className="mt-4 space-y-3">
        <h2 className="px-1 text-[14px] font-extrabold text-[#1b1a17]">常用食材</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {commonIngredients.map((item) => (
            <IngredientTile
              emoji={item.emoji}
              key={item.id}
              name={item.name}
              selected={isSelected(item.id)}
            />
          ))}
        </div>
      </section>

      <section className="mb-24 mt-7 space-y-3">
        <h2 className="px-1 text-[14px] font-extrabold text-[#1b1a17]">最近使用</h2>
        <div className="flex flex-wrap gap-2.5">
          {recentItems.map((item) => (
            <button
              className="h-8 rounded-full border border-[#ebe6dd] bg-white px-3.5 text-[12px] font-semibold text-[#5f594f] shadow-sm"
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <SelectedIngredientsBar names={selectedNames} />
    </DeviceFrame>
  );
}
