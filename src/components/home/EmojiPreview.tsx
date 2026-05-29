type EmojiPreviewProps = {
  emoji: string;
  label: string;
};

export function EmojiPreview({ emoji, label }: EmojiPreviewProps) {
  return (
    <span
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center text-[25px] drop-shadow-[0_8px_10px_rgba(0,0,0,0.12)]"
      role="img"
    >
      {emoji}
    </span>
  );
}
