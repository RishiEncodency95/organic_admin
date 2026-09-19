"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Link as LinkIcon, Palette, Code2 } from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  isCodeEditor?: boolean;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  let res = str;
  if (/&lt;\s*\/?\s*(h[1-6]|p|div|ul|ol|li|strong|b|em|i|u|span|blockquote|br|a|img|hr)\b/i.test(res)) {
    res = res
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, "&");
  }
  if (/&lt;\s*\/?\s*(h[1-6]|p|div|ul|ol|li|strong|b|em|i|u|span|blockquote|br|a|img|hr)\b/i.test(res)) {
    res = res
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
  }
  return res;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Start writing your blog content here...",
  minHeight = "300px",
  isCodeEditor = false,
}) => {
  const editorRef = useRef<HTMLDivElement | HTMLTextAreaElement | null>(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    formatBlock: "p",
  });

  // Sync from parent to editor (initial load or external updates)
  useEffect(() => {
    // Only sync for rich text mode. Textarea (code mode) handles value via props directly.
    if (!isCodeEditor && editorRef.current) {
      const currentEl = editorRef.current as HTMLDivElement;
      const decodedVal = decodeHtmlEntities(value || "");
      if (currentEl.innerHTML !== decodedVal) {
        currentEl.innerHTML = decodedVal;
      }
    }
  }, [value, isCodeEditor]);

  const updateActiveFormats = useCallback(() => {
    if (!isCodeEditor && editorRef.current && typeof document !== "undefined") {
      let formatBlockValue = "p";
      try {
        const rawVal = document.queryCommandValue("formatBlock");
        if (rawVal) {
          formatBlockValue = rawVal.toLowerCase().replace(/<|>/g, "");
        }
      } catch {}

      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        formatBlock: formatBlockValue || "p",
      });
    }
  }, [isCodeEditor]);

  const execCommand = (command: string, val: string | null = null) => {
    if (editorRef.current) {
      (editorRef.current as HTMLElement).focus();
      let commandVal = val;
      if (command === "formatBlock" && val) {
        commandVal = val.startsWith("<") ? val : `<${val}>`;
      }
      try {
        document.execCommand(command, false, commandVal as any);
      } catch {
        try {
          document.execCommand(command, false, val as any);
        } catch {}
      }
      handleInput();
      updateActiveFormats();
    }
  };

  const handleInput = () => {
    if (onChange && editorRef.current) {
      if (isCodeEditor) {
        onChange((editorRef.current as HTMLTextAreaElement).value || "");
      } else {
        const currentEl = editorRef.current as HTMLDivElement;
        onChange(currentEl.innerHTML || "");
      }
    }
  };

  const cleanHTML = (html: string) => {
    if (typeof window === "undefined") return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove styling and font tags
    const allElements = doc.body.querySelectorAll("*");
    allElements.forEach((el: any) => {
      const textColor = el.style.color;
      el.removeAttribute("style");
      if (textColor) el.style.color = textColor;
      el.removeAttribute("class");
      el.removeAttribute("id");
      if (el.tagName === "FONT") {
        const parent = el.parentNode;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
    });

    return doc.body.innerHTML
      .replace(/<p>\s*(&nbsp;)*\s*<\/p>/gi, "")
      .replace(/(&nbsp;){2,}/gi, " ")
      .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
      .replace(/\s{2,}/g, " ");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (isCodeEditor) {
      // Allow browser native paste in textarea
      return;
    }

    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const html = e.clipboardData.getData("text/html");

      // 1. If user pasted raw HTML markup string (e.g. <h2>...</h2>)
      if (text && /<[a-z][\s\S]*>/i.test(text)) {
        const decoded = decodeHtmlEntities(text);
        document.execCommand("insertHTML", false, decoded);
      } else if (html) {
        const cleanedHtml = cleanHTML(html);
        document.execCommand("insertHTML", false, cleanedHtml);
      } else {
        // Plain text paste - preserve paragraphs if multiline
        if (text && text.includes("\n")) {
          const formatted = text
            .split(/\n{2,}/)
            .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
            .join("");
          document.execCommand("insertHTML", false, formatted);
        } else {
          document.execCommand("insertText", false, text);
        }
      }
      handleInput();
  };

  // Helper to convert raw typed/pasted HTML tags into rendered rich visual elements
  const handleRenderRawHtml = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editorRef.current && !isCodeEditor) {
      const el = editorRef.current as HTMLDivElement;
      const rawText = el.innerText || el.textContent || "";
      const decoded = decodeHtmlEntities(rawText);

      if (/<[a-z][\s\S]*>/i.test(decoded)) {
        // Convert literal HTML tags into real visual elements
        el.innerHTML = decoded;
        handleInput();
      } else if (rawText.trim() && !/<(h[1-6]|p|div|ul|ol|li|blockquote|br)\b/i.test(rawText)) {
        // Plain text without tags - convert newlines into clean paragraphs
        el.innerHTML = rawText
          .split(/\n{2,}/)
          .map((b) => `<p>${b.replace(/\n/g, "<br>")}</p>`)
          .join("");
        handleInput();
      }
    }
  };

  const insertLink = (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if already in a link
    const selection = window.getSelection();
    let currentLink: Node | null = null;
    if (selection && selection.rangeCount > 0) {
      let container: Node | null = selection.getRangeAt(0).startContainer;
      if (container.nodeType === 3 && container.parentNode) container = container.parentNode;

      // Look up the tree for <a> tag
      while (container && container !== editorRef.current) {
        if ((container as HTMLElement).tagName === "A") {
          currentLink = container;
          break;
        }
        container = container.parentNode;
      }
    }

    if (currentLink) {
      // Unlink if already a link
      execCommand("unlink");
    } else {
      const url = prompt("Enter URL:");
      if (url) {
        execCommand("createLink", url);
      }
    }
  };

  // Helper to handle toolbar actions without losing focus
  const handleAction = (e: React.MouseEvent, command: string, val: string | null = null) => {
    e.preventDefault(); // CRITICAL: Prevents focus loss
    execCommand(command, val);
  };

  // Styling for active state
  const getActiveStyle = (isActive: boolean) =>
    isActive
      ? "bg-blue-100 border-blue-400 text-blue-700 active:bg-blue-200"
      : "bg-white border-gray-300 active:bg-gray-100";

  return (
    <div className="border-2 border-gray-200 rounded overflow-hidden shadow-inner bg-white cursor-default">
      {/* Standardized Toolbar - Hidden in code mode or customized if needed */}
      {!isCodeEditor && (
        <div className="bg-gray-50 p-2 border-b-2 border-gray-200 flex flex-wrap gap-1 items-center select-none">
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "bold")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded font-bold border-2 text-sm shadow-sm transition-colors cursor-pointer ${getActiveStyle(
              activeFormats.bold
            )}`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "italic")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded italic border-2 text-sm shadow-sm transition-colors cursor-pointer ${getActiveStyle(
              activeFormats.italic
            )}`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "underline")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded underline border-2 text-sm shadow-sm transition-colors cursor-pointer ${getActiveStyle(
              activeFormats.underline
            )}`}
            title="Underline"
          >
            U
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "justifyLeft")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-lg shadow-sm transition-colors cursor-pointer ${getActiveStyle(
              activeFormats.justifyLeft
            )}`}
            title="Align Left"
          >
            ≡
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "justifyCenter")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-lg shadow-sm transition-colors cursor-pointer ${getActiveStyle(
              activeFormats.justifyCenter
            )}`}
            title="Align Center"
          >
            ≡
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "justifyRight")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-lg shadow-sm transition-colors cursor-pointer ${getActiveStyle(
              activeFormats.justifyRight
            )}`}
            title="Align Right"
          >
            ≡
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "insertUnorderedList")}
            className={`px-3 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-[11px] font-bold shadow-sm gap-1 transition-colors cursor-pointer ${getActiveStyle(
              activeFormats.insertUnorderedList
            )}`}
            title="Bullet List"
          >
            <span className="text-lg">●</span> List
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "insertOrderedList")}
            className={`px-3 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-[11px] font-bold shadow-sm gap-1 transition-colors cursor-pointer ${getActiveStyle(
              activeFormats.insertOrderedList
            )}`}
            title="Numbered List"
          >
            1. List
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <select
            onChange={(e) => execCommand("formatBlock", e.target.value)}
            value={activeFormats.formatBlock}
            className={`h-9 border-2 text-[11px] font-bold px-2 rounded shadow-sm focus:outline-none min-w-[100px] transition-colors cursor-pointer ${
              activeFormats.formatBlock !== "p" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-300"
            }`}
          >
            <option value="p">Body Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>

          <button
            type="button"
            onMouseDown={insertLink}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-sm shadow-sm transition-colors text-blue-600 cursor-pointer`}
            title="Insert/Remove Link"
          >
            <LinkIcon size={16} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <div className="relative group/color flex items-center gap-2 px-2 h-9 hover:bg-white rounded border-2 border-gray-300 shadow-sm transition-colors">
            <div className="flex items-center gap-1">
              <Palette size={14} className="text-gray-500" />
              <input
                type="color"
                onChange={(e) => execCommand("foreColor", e.target.value)}
                onInput={(e) => execCommand("foreColor", (e.target as HTMLInputElement).value)}
                className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
                title="Visual Color Picker"
              />
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-gray-400 font-mono font-bold">#</span>
              <input
                type="text"
                placeholder="Color Code"
                maxLength={7}
                className="w-16 h-6 text-[10px] bg-transparent focus:outline-none uppercase font-mono font-bold text-gray-700"
                onChange={(e) => {
                  let val = e.target.value.replace("#", "");
                  if (val.length === 3 || val.length === 6) {
                    execCommand("foreColor", `#${val}`);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    let val = (e.target as HTMLInputElement).value.replace("#", "");
                    execCommand("foreColor", `#${val}`);
                    (editorRef.current as HTMLElement)?.focus();
                  }
                }}
              />
            </div>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Quick button to render HTML tags if user pasted raw tags */}
          <button
            type="button"
            onMouseDown={handleRenderRawHtml}
            className="flex items-center gap-1 px-2.5 h-9 bg-[#f0fdf4] hover:bg-[#dcfce7] border-2 border-[#bbf7d0] text-[#166534] rounded text-[10px] font-bold shadow-sm transition-colors cursor-pointer"
            title="Convert and render raw HTML tags into formatted text"
          >
            <Code2 size={13} />
            <span>Format HTML</span>
          </button>
        </div>
      )}

      {/* Editable Content Area */}
      {isCodeEditor ? (
        <textarea
          ref={editorRef as any}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full p-6 focus:outline-none font-mono text-sm leading-relaxed bg-gray-50/50 resize-y border-none text-gray-900"
          style={{ minHeight: minHeight, cursor: "default" }}
          placeholder={placeholder}
        />
      ) : (
        <div
          ref={editorRef as any}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          onFocus={updateActiveFormats}
          className="p-6 focus:outline-none max-w-none text-gray-700 bg-white overflow-y-auto leading-relaxed prose"
          style={{ minHeight: minHeight, cursor: "default" }}
          data-placeholder={placeholder}
        ></div>
      )}

      {/* In-component styling for common elements */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        [contenteditable] {
          outline: none;
          color: #1e293b !important;
          text-align: left !important;
          line-height: 1.6 !important;
          cursor: default !important;
          caret-color: #000000 !important;
        }
        [contenteditable] * {
          cursor: default !important;
          caret-color: #000000 !important;
        }
        [contenteditable] p {
          margin-bottom: 0.5rem !important;
          line-height: 1.5 !important;
          text-align: justify !important;
          cursor: default !important;
        }
        [contenteditable] p:last-child {
          margin-bottom: 0 !important;
        }
        [contenteditable] p, [contenteditable] li, [contenteditable] span {
          /* Removed !important to allow inline colored styles */
          color: inherit;
        }
        [contenteditable] a {
          color: #2563eb !important;
          text-decoration: underline !important;
          cursor: pointer !important;
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
        }
        [contenteditable] ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        [contenteditable] ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        [contenteditable] b, [contenteditable] strong {
          font-weight: 600 !important;
        }
        [contenteditable] i, [contenteditable] em {
          font-style: italic !important;
        }
        [contenteditable] h1, [contenteditable] h2, [contenteditable] h3, [contenteditable] h4, [contenteditable] h5, [contenteditable] h6 {
          font-weight: bold !important;
          margin: 0.5rem 0 !important;
          cursor: default !important;
        }
        [contenteditable] h1 { font-size: 2rem !important; line-height: 1.25 !important; }
        [contenteditable] h2 { font-size: 1.5rem !important; line-height: 1.3 !important; }
        [contenteditable] h3 { font-size: 1.25rem !important; line-height: 1.35 !important; }
        [contenteditable] h4 { font-size: 1.1rem !important; line-height: 1.4 !important; }
        [contenteditable] h5 { font-size: 1rem !important; line-height: 1.4 !important; }
        [contenteditable] h6 { font-size: 0.875rem !important; line-height: 1.4 !important; }
        textarea {
          color: #333333 !important;
          cursor: default !important;
          caret-color: #000000 !important;
        }
      `,
        }}
      />
    </div>
  );
};

export default RichTextEditor;
