export function EditorToolbar({
  targetRef,
  onCommand,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  onCommand: (command: string, value?: string | null) => void;
}) {
  return (
    <div className="border-b-2 border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
      <button
        type="button"
        onClick={() => onCommand("bold")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 font-bold shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => onCommand("italic")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 italic shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Italic"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => onCommand("underline")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 underline shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Underline"
      >
        U
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => onCommand("justifyLeft")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Align Left"
      >
        ≡
      </button>
      <button
        type="button"
        onClick={() => onCommand("justifyCenter")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Align Center"
      >
        ≡
      </button>
      <button
        type="button"
        onClick={() => onCommand("justifyRight")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Align Right"
      >
        ≡
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => onCommand("insertUnorderedList")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => onCommand("insertOrderedList")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Numbered List"
      >
        1. List
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <select
        onChange={(e) => onCommand("formatBlock", e.target.value)}
        className="px-2 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 focus:outline-none"
        defaultValue=""
      >
        <option value="">Normal</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="h4">H4</option>
        <option value="h5">H5</option>
        <option value="h6">H6</option>
      </select>
      <button
        type="button"
        onClick={() => {
          const url = prompt("Enter URL:");
          if (url) onCommand("createLink", url);
        }}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Insert Link"
      >
        🔗
      </button>
    </div>
  );
}
