/** Display words in title case through CSS, while preserving URLs, domains and email addresses inline. */
const ADDRESS = /(https?:\/\/[^\s<>]+|(?:[\w.+-]+@)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s<>]*)?)/gi;
export default function DisplayText({ text }: { text: string }) {
  return <>{text.split(ADDRESS).map((part, i) => i % 2 ? <span key={i} className="normal-case break-all">{part}</span> : part)}</>;
}
