export function PromptBoxMock() {
  return (
    <section className="space-y-3">
      <h2 className="text-[15px] font-extrabold text-[#1b1a17]">
        还有什么特别要求？
        <span className="ml-2 text-[12px] font-bold text-[#9d968d]">（选填）</span>
      </h2>
      <div className="min-h-[74px] rounded-[17px] border border-[#ece7df] bg-white px-4 py-3 shadow-[0_7px_22px_rgba(27,24,20,0.055)]">
        <p className="line-clamp-2 text-[12px] font-medium leading-6 text-[#b8b2a9]">
          比如：不想洗锅、想吃热乎的、不要辣、最好一锅出……
        </p>
        <div className="mt-1 text-right text-[11px] font-medium text-[#aaa39a]">0/200</div>
      </div>
    </section>
  );
}
