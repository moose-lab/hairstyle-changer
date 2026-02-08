import { cn } from "@/lib/utils";

interface HairstyleSelectorProps {
  onPromptChange: (prompt: string) => void;
  prompt: string;
  disabled?: boolean;
}

const PRESET_STYLES = [
  { id: "pink-bangs", label: "Short Pink with Bangs", prompt: "Short pink hair with see-through bangs" },
  { id: "wavy-blonde", label: "Long Wavy Blonde", prompt: "Long wavy blonde hair" },
  { id: "curly-red", label: "Curly Red Bob", prompt: "Curly red bob cut" },
  { id: "blue-purple", label: "Blue-Purple Highlights", prompt: "Blue-purple highlighted long hair" },
  { id: "platinum-buzz", label: "Platinum Buzz Cut", prompt: "Platinum buzz cut" },
  { id: "braids-beads", label: "Braids with Beads", prompt: "Black braids with golden beads" },
  { id: "silver-pixie", label: "Silver Pixie", prompt: "Silver pixie cut" },
  { id: "auburn-bangs", label: "Auburn Curtain Bangs", prompt: "Auburn hair with curtain bangs" },
];

export default function HairstyleSelector({
  onPromptChange,
  prompt,
  disabled = false,
}: HairstyleSelectorProps) {
  const selectedPreset = PRESET_STYLES.find((style) => style.prompt === prompt);

  const handlePresetClick = (presetPrompt: string) => {
    if (!disabled) {
      onPromptChange(presetPrompt);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!disabled) {
      onPromptChange(e.target.value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Gallery */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Quick Styles
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_STYLES.map((style) => {
            const isSelected = selectedPreset?.id === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handlePresetClick(style.prompt)}
                disabled={disabled}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  "border-2 hover:scale-105 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  isSelected
                    ? "bg-gradient-to-r from-[#6B46FF] to-[#FF6B9D] text-white border-transparent shadow-lg shadow-purple-200"
                    : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:shadow-md"
                )}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Text Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Or Describe Your Own
        </label>
        <textarea
          value={prompt}
          onChange={handleTextChange}
          disabled={disabled}
          placeholder="Example: Short pink hair with see-through bangs, or long blue-purple highlights..."
          rows={3}
          className={cn(
            "w-full px-4 py-3 rounded-xl border-2 border-gray-200",
            "focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none",
            "transition-all duration-200 resize-none",
            "placeholder:text-gray-400 text-gray-700",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
          )}
        />
      </div>
    </div>
  );
}
