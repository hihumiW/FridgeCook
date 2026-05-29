type SummaryItemPreviewProps = {
  emoji?: string;
  name: string;
};

export function SummaryItemPreview({ emoji, name }: SummaryItemPreviewProps) {
  return (
    <span className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border border-[#ece7df] bg-white px-3 text-[12px] font-semibold text-[#4f4942]">
      {emoji ? (
        <span aria-hidden className="text-[15px] leading-none">
          {emoji}
        </span>
      ) : null}
      <span className="truncate">{name}</span>
    </span>
  );
}
