import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { seasonings } from "@/data";
import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { CustomSeasoningButton } from "@/components/seasonings/CustomSeasoningButton";
import { SeasoningChip } from "@/components/seasonings/SeasoningChip";
import { SeasoningSearchBox } from "@/components/seasonings/SeasoningSearchBox";
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
import type { SeasoningCategory } from "@/types";

const categorySections: { title: string; category: SeasoningCategory }[] = [
  { title: "基础调料", category: "basic" },
  { title: "常见增味", category: "flavor_booster" },
  { title: "辛香料", category: "aromatics" },
  { title: "进阶调料", category: "advanced" },
];

function normalizeForCompare(name: string) {
  return name.trim();
}

export function SeasoningsPage() {
  const {
    seasoningLibrary,
    toggleSeasoning,
    addCustomSeasoning,
    removeCustomSeasoning,
  } = useCookingStore();
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isManagingCustom, setIsManagingCustom] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [customName, setCustomName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);
  const selectedIds = new Set(
    seasoningLibrary.selectedSeasonings.map((seasoning) => seasoning.id),
  );
  const normalizedCustomName = normalizeForCompare(customName);
  const allSeasonings = useMemo(
    () => [...seasonings, ...seasoningLibrary.customSeasonings],
    [seasoningLibrary.customSeasonings],
  );
  const isDuplicateCustomName =
    normalizedCustomName.length > 0 &&
    allSeasonings.some(
      (seasoning) =>
        normalizeForCompare(seasoning.name) === normalizedCustomName ||
        seasoning.aliases?.some((alias) => normalizeForCompare(alias) === normalizedCustomName),
    );
  const canConfirmCustom = normalizedCustomName.length > 0 && !isDuplicateCustomName;
  const normalizedSearchQuery = normalizeSearchKeyword(debouncedSearchQuery);
  const isSearching = normalizedSearchQuery.length > 0;
  const searchResults = useMemo(
    () =>
      uniqueSearchResultsById([...seasonings, ...seasoningLibrary.customSeasonings]).filter(
        (item) => matchesKeyword(item, normalizedSearchQuery),
      ),
    [normalizedSearchQuery, seasoningLibrary.customSeasonings],
  );

  function closeCustomDialog() {
    setIsAddingCustom(false);
    setCustomName("");
  }

  function handleConfirmCustom() {
    if (!canConfirmCustom) return;
    addCustomSeasoning(normalizedCustomName);
    closeCustomDialog();
  }

  function handleConfirmDeleteCustom() {
    if (!pendingDeleteItem) return;
    removeCustomSeasoning(pendingDeleteItem.id);
    if (seasoningLibrary.customSeasonings.length <= 1) {
      setIsManagingCustom(false);
    }
    setPendingDeleteItem(null);
  }

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
        <SeasoningSearchBox value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="mt-6 space-y-7">
        {isSearching ? (
          <motion.section
            animate="animate"
            className="space-y-3"
            initial="initial"
            variants={fadeItem}
          >
            <h2 className="px-1 text-[14px] font-extrabold text-[#1b1a17]">搜索结果</h2>
            {searchResults.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {searchResults.map((item) => (
                  <SeasoningChip
                    emoji={item.emoji}
                    key={item.id}
                    name={item.name}
                    onClick={() => toggleSeasoning(item)}
                    selected={selectedIds.has(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[16px] border border-[#eee9e2] bg-white px-4 py-5 text-center">
                <p className="text-[13px] font-bold text-[#4f4a43]">没找到这个调料</p>
                <p className="mt-1 text-[12px] font-semibold text-[#aaa39a]">
                  可以把它加进你的自定义调料里。
                </p>
                <div className="mt-4 flex justify-center">
                  <CustomSeasoningButton onClick={() => setIsAddingCustom(true)}>
                    添加自定义调料
                  </CustomSeasoningButton>
                </div>
              </div>
            )}
          </motion.section>
        ) : (
          categorySections.map((section) => {
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
                      onClick={() => toggleSeasoning(item)}
                      selected={selectedIds.has(item.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}

        {!isSearching ? (
          <section className="space-y-3 pb-8">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[14px] font-extrabold text-[#1b1a17]">自定义调料</h2>
              {seasoningLibrary.customSeasonings.length > 0 ? (
                <button
                  className="text-[12px] font-bold text-[#6c665d]"
                  onClick={() => setIsManagingCustom((current) => !current)}
                  type="button"
                >
                  {isManagingCustom ? "完成" : "管理"}
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {(!isManagingCustom || seasoningLibrary.customSeasonings.length === 0) ? (
                <CustomSeasoningButton onClick={() => setIsAddingCustom(true)}>
                  添加自定义调料
                </CustomSeasoningButton>
              ) : null}
              {seasoningLibrary.customSeasonings.map((item) => (
                <SeasoningChip
                  emoji={item.emoji}
                  key={item.id}
                  name={item.name}
                  onClick={() => {
                    if (isManagingCustom) return;
                    toggleSeasoning(item);
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
            <p className="pt-8 text-center text-[11px] font-medium text-[#aaa39a]">
              每次修改都会自动保存到本地
            </p>
          </section>
        ) : null}
      </div>

      <AnimatePresence>
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
              <h2 className="text-[17px] font-black text-[#151411]">删除自定义调料？</h2>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9b958d]">
                删除自定义调料「{pendingDeleteItem.name}」？删除后也会从已选调料中移除。
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
            <h2 className="text-[17px] font-black text-[#151411]">添加自定义调料</h2>
            <p className="mt-1 text-[12px] font-semibold text-[#9b958d]">
              输入你家里常备但列表里没有的调料。
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
              placeholder="比如：藤椒油"
              value={customName}
            />

            <div className="mt-2 min-h-5 text-[12px] font-semibold text-[#d65d4d]">
              {isDuplicateCustomName ? "这个调料已经存在了" : ""}
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
