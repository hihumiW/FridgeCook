type PromptBoxMockProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PromptBoxMock({ value, onChange }: PromptBoxMockProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-[15px] font-extrabold text-[#1b1a17]">
        还有什么特别要求？
        <span className="ml-2 text-[12px] font-bold text-[#9d968d]">（选填）</span>
      </h2>
      <div className="min-h-[74px] rounded-[17px] border border-[#ece7df] bg-white px-4 py-3 shadow-[0_7px_22px_rgba(27,24,20,0.055)]">
        <textarea
          className="min-h-[42px] w-full resize-none bg-transparent text-[12px] font-medium leading-6 text-[#4f4942] outline-none placeholder:text-[#b8b2a9]"
          maxLength={200}
          onChange={(event) => onChange(event.target.value)}
          placeholder="比如：不想洗锅、想吃热乎的、不要辣、最好一锅出……"
          value={value}
        />
        <div className="mt-1 text-right text-[11px] font-medium text-[#aaa39a]">
          {value.length}/200
        </div>
      </div>
    </section>
  );
}
