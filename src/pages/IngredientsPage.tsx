import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { ingredients } from "@/data";
import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { CategoryPill } from "@/components/ingredients/CategoryPill";
import { CustomIngredientButton } from "@/components/ingredients/CustomIngredientButton";
import { IngredientSearchBox } from "@/components/ingredients/IngredientSearchBox";
import { IngredientTile } from "@/components/ingredients/IngredientTile";
import { SelectedIngredientsBar } from "@/components/ingredients/SelectedIngredientsBar";
import {
  matchesKeyword,
  normalizeSearchKeyword,
  uniqueSearchResultsById,
} from "@/lib/search";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import {
  fadeItem,
  modalBackdropVariants,
  modalPanelVariants,
  motionTapProps,
} from "@/lib/motion";
import { useCookingStore } from "@/stores/useCookingStore";
import type { IngredientCategory } from "@/types";

type IngredientCategoryFilter = Exclude<IngredientCategory, "common">;

const categoryFilters: { label: string; value: IngredientCategoryFilter }[] = [
  { label: "蔬菜", value: "vegetable" },
  { label: "肉禽水产", value: "meat_seafood" },
  { label: "蛋/熟食", value: "egg_processed" },
  { label: "豆制品", value: "soy" },
  { label: "主食", value: "staple" },
  { label: "速冻", value: "frozen" },
  { label: "其他", value: "other" },
];

function normalizeForCompare(name: string) {
  return name.trim();
}

export function IngredientsPage() {
  const {
    selectedIngredients,
    customIngredients,
    toggleIngredient,
    clearSelectedIngredients,
    addCustomIngredient,
    removeCustomIngredient,
  } = useCookingStore();
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isManagingCustom, setIsManagingCustom] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [customName, setCustomName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<IngredientCategoryFilter>("vegetable");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);
  const activeCategoryLabel =
    categoryFilters.find((category) => category.value === activeCategory)?.label ?? "蔬菜";
  const categoryIngredients = ingredients
    .filter((item) => item.category === activeCategory);
  const selectedIds = new Set(selectedIngredients.map((item) => item.id));
  const selectedNames = selectedIngredients
    .filter((item) => item.name?.trim())
    .map((item) => item.name);
  const normalizedCustomName = normalizeForCompare(customName);
  const allIngredients = useMemo(
    () => [
      ...ingredients,
      ...customIngredients,
      ...selectedIngredients,
    ],
    [customIngredients, selectedIngredients],
  );
  const isDuplicateCustomName =
    normalizedCustomName.length > 0 &&
    allIngredients.some(
      (ingredient) =>
        normalizeForCompare(ingredient.name) === normalizedCustomName ||
        ingredient.aliases?.some((alias) => normalizeForCompare(alias) === normalizedCustomName),
    );
  const canConfirmCustom = normalizedCustomName.length > 0 && !isDuplicateCustomName;
  const normalizedSearchQuery = normalizeSearchKeyword(debouncedSearchQuery);
  const isSearching = normalizedSearchQuery.length > 0;
  const searchResults = useMemo(
    () =>
      uniqueSearchResultsById([
        ...ingredients,
        ...customIngredients,
      ]).filter((item) => matchesKeyword(item, normalizedSearchQuery)),
    [customIngredients, normalizedSearchQuery],
  );

  function closeCustomDialog() {
    setIsAddingCustom(false);
    setCustomName("");
  }

  function handleConfirmCustom() {
    if (!canConfirmCustom) return;
    addCustomIngredient(normalizedCustomName);
    closeCustomDialog();
  }

  function handleConfirmDeleteCustom() {
    if (!pendingDeleteItem) return;
    removeCustomIngredient(pendingDeleteItem.id);
    if (customIngredients.length <= 1) {
      setIsManagingCustom(false);
    }
    setPendingDeleteItem(null);
  }

  function handleConfirmReset() {
    clearSelectedIngredients();
    setIsResetConfirmOpen(false);
  }

  return (
    <DeviceFrame>
      <AppTopBar onReset={() => setIsResetConfirmOpen(true)} />

      <header className="mt-6 px-1 text-left">
        <h1 className="text-[24px] font-black leading-8 tracking-normal text-[#151411]">今晚冰箱里有什么？</h1>
        <p className="mt-2 text-[12px] font-semibold text-[#9b958d]">只选这次要用的，不会当成长期库存。</p>
      </header>

      <div className="mt-5">
        <IngredientSearchBox value={searchQuery} onChange={setSearchQuery} />
      </div>

      {!isSearching ? (
        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categoryFilters.map((category) => (
            <CategoryPill
              active={activeCategory === category.value}
              key={category.value}
              label={category.label}
              onClick={() => setActiveCategory(category.value)}
            />
          ))}
        </nav>
      ) : null}

      {isSearching ? (
        <motion.section
          animate="animate"
          className="mt-5 space-y-3"
          initial="initial"
          variants={fadeItem}
        >
          <h2 className="px-1 text-[14px] font-extrabold text-[#1b1a17]">搜索结果</h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-3 gap-2.5">
              {searchResults.map((item) => (
                <IngredientTile
                  emoji={item.emoji}
                  key={item.id}
                  name={item.name}
                  onClick={() => toggleIngredient(item)}
                  selected={selectedIds.has(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[16px] border border-[#eee9e2] bg-white px-4 py-5 text-center">
              <p className="text-[13px] font-bold text-[#4f4a43]">没找到这个食材</p>
              <p className="mt-1 text-[12px] font-semibold text-[#aaa39a]">
                可以把它加进你的自定义食材里。
              </p>
              <div className="mt-4 flex justify-center">
                <CustomIngredientButton onClick={() => setIsAddingCustom(true)}>
                  添加自定义食材
                </CustomIngredientButton>
              </div>
            </div>
          )}
        </motion.section>
      ) : (
        <>
          <section className="mt-4 space-y-3">
            <h2 className="px-1 text-[14px] font-extrabold text-[#1b1a17]">
              {activeCategoryLabel}食材
            </h2>
            {categoryIngredients.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5">
                {categoryIngredients.map((item) => (
                  <IngredientTile
                    emoji={item.emoji}
                    key={item.id}
                    name={item.name}
                    onClick={() => toggleIngredient(item)}
                    selected={selectedIds.has(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[16px] border border-[#eee9e2] bg-white px-4 py-5 text-center">
                <p className="text-[13px] font-bold text-[#4f4a43]">这个分类还没有食材</p>
              </div>
            )}
          </section>

          <section className="mt-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[14px] font-extrabold text-[#1b1a17]">自定义食材</h2>
              {customIngredients.length > 0 ? (
                <button
                  className="text-[12px] font-bold text-[#6c665d]"
                  onClick={() => setIsManagingCustom((current) => !current)}
                  type="button"
                >
                  {isManagingCustom ? "完成" : "管理"}
                </button>
              ) : null}
            </div>
            {(!isManagingCustom || customIngredients.length === 0) ? (
              <div className="flex flex-wrap gap-2.5">
                <CustomIngredientButton onClick={() => setIsAddingCustom(true)}>
                  添加自定义食材
                </CustomIngredientButton>
              </div>
            ) : null}
            {customIngredients.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5">
                {customIngredients.map((item) => (
                  <IngredientTile
                    emoji={item.emoji}
                    key={item.id}
                    name={item.name}
                    onClick={() => {
                      if (isManagingCustom) return;
                      toggleIngredient(item);
                    }}
                    onDelete={
                      isManagingCustom
                        ? () => setPendingDeleteItem({ id: item.id, name: item.name })
                        : undefined
                    }
                    selected={selectedIds.has(item.id)}
                  />
                ))}
              </div>
            ) : null}
          </section>
          <div className="mb-24" />
        </>
      )}

      <AnimatePresence>
        {selectedNames.length > 0 ? (
          <SelectedIngredientsBar names={selectedNames} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isResetConfirmOpen ? (
          <motion.div
            animate="animate"
            className="fixed inset-0 z-30 flex items-end justify-center bg-black/20 px-4 pb-[calc(18px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
            exit="exit"
            initial="initial"
            variants={modalBackdropVariants}
          >
            <motion.section
              className="w-full max-w-[398px] rounded-[22px] border border-[#eeeae4] bg-[#fbfaf8] p-4 shadow-[0_18px_48px_rgba(22,20,18,0.18)]"
              variants={modalPanelVariants}
            >
              <h2 className="text-[17px] font-black text-[#151411]">
                清空本次食材？
              </h2>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9b958d]">
                会清空当前已选食材，不会影响调料库和自定义食材。
              </p>

              <div className="mt-5 flex gap-2">
                <motion.button
                  className="h-11 flex-1 rounded-[14px] bg-[#f1eee8] text-[14px] font-bold text-[#5f594f]"
                  onClick={() => setIsResetConfirmOpen(false)}
                  type="button"
                  {...motionTapProps}
                >
                  取消
                </motion.button>
                <motion.button
                  className="h-11 flex-1 rounded-[14px] bg-[#111] text-[14px] font-bold text-white"
                  onClick={handleConfirmReset}
                  type="button"
                  {...motionTapProps}
                >
                  确认清空
                </motion.button>
              </div>
            </motion.section>
          </motion.div>
        ) : null}

        {pendingDeleteItem ? (
          <motion.div
            animate="animate"
            className="fixed inset-0 z-30 flex items-end justify-center bg-black/20 px-4 pb-[calc(18px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
            exit="exit"
            initial="initial"
            variants={modalBackdropVariants}
          >
            <motion.section
              className="w-full max-w-[398px] rounded-[22px] border border-[#eeeae4] bg-[#fbfaf8] p-4 shadow-[0_18px_48px_rgba(22,20,18,0.18)]"
              variants={modalPanelVariants}
            >
              <h2 className="text-[17px] font-black text-[#151411]">删除自定义食材？</h2>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9b958d]">
                删除自定义食材「{pendingDeleteItem.name}」？删除后也会从本次已选食材中移除。
              </p>

              <div className="mt-5 flex gap-2">
                <motion.button
                  className="h-11 flex-1 rounded-[14px] bg-[#f1eee8] text-[14px] font-bold text-[#5f594f]"
                  onClick={() => setPendingDeleteItem(null)}
                  type="button"
                  {...motionTapProps}
                >
                  取消
                </motion.button>
                <motion.button
                  className="h-11 flex-1 rounded-[14px] bg-[#111] text-[14px] font-bold text-white"
                  onClick={handleConfirmDeleteCustom}
                  type="button"
                  {...motionTapProps}
                >
                  确认删除
                </motion.button>
              </div>
            </motion.section>
          </motion.div>
        ) : null}

        {isAddingCustom ? (
        <motion.div
          animate="animate"
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/20 px-4 pb-[calc(18px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
          exit="exit"
          initial="initial"
          variants={modalBackdropVariants}
        >
          <motion.section
            className="w-full max-w-[398px] rounded-[22px] border border-[#eeeae4] bg-[#fbfaf8] p-4 shadow-[0_18px_48px_rgba(22,20,18,0.18)]"
            variants={modalPanelVariants}
          >
            <h2 className="text-[17px] font-black text-[#151411]">添加自定义食材</h2>
            <p className="mt-1 text-[12px] font-semibold text-[#9b958d]">
              输入这次想用、但列表里没有的食材。
            </p>

            <input
              autoFocus
              className="mt-4 h-11 w-full rounded-[14px] border border-[#ebe6dd] bg-white px-3 text-[14px] font-semibold text-[#2f2b26] outline-none placeholder:text-[#bbb4aa] transition-[border-color,box-shadow] focus:border-[#8dcf87] focus:shadow-[0_9px_22px_rgba(91,157,85,0.12)] focus:ring-2 focus:ring-[#dff2dc]"
              maxLength={20}
              onChange={(event) => setCustomName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleConfirmCustom();
                if (event.key === "Escape") closeCustomDialog();
              }}
              placeholder="比如：牛肉"
              value={customName}
            />

            <div className="mt-2 min-h-5 text-[12px] font-semibold text-[#d65d4d]">
              {isDuplicateCustomName ? "这个食材已经存在了" : ""}
            </div>

            <div className="mt-3 flex gap-2">
              <motion.button
                className="h-11 flex-1 rounded-[14px] bg-[#f1eee8] text-[14px] font-bold text-[#5f594f]"
                onClick={closeCustomDialog}
                type="button"
                {...motionTapProps}
              >
                取消
              </motion.button>
              <motion.button
                className="h-11 flex-1 rounded-[14px] bg-[#111] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#c8c1b8]"
                disabled={!canConfirmCustom}
                onClick={handleConfirmCustom}
                type="button"
                {...motionTapProps}
              >
                确认添加
              </motion.button>
            </div>
          </motion.section>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </DeviceFrame>
  );
}
