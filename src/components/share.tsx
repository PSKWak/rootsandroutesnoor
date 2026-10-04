import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, MessageSquare, Share2, Check } from "lucide-react";

export function QrCode({ url, size = 220 }: { url: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(url, { width: size * 2, margin: 1 }).then(setSrc).catch(() => setSrc(null));
  }, [url, size]);
  return src ? (
    <img src={src} width={size} height={size} alt={`QR code linking to ${url}`} className="mx-auto rounded-xl bg-card p-2" />
  ) : (
    <div style={{ width: size, height: size }} className="mx-auto rounded-xl bg-muted" aria-hidden="true" />
  );
}

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const msg = `${text} ${url}`;
  const btn = "flex min-h-12 items-center justify-center gap-2 rounded-full border bg-card px-3 text-sm font-semibold";
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        className={`${btn} col-span-2 bg-primary text-primary-foreground`}
        onClick={async () => {
          if (navigator.share) await navigator.share({ title: "Meet Noor", text, url }).catch(() => {});
          else {
            await navigator.clipboard?.writeText(url);
            setCopied(true);
          }
        }}
      >
        <Share2 className="h-5 w-5" /> Share
      </button>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          await navigator.clipboard?.writeText(url).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}
      </button>
      <a className={btn} href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <a className={`${btn} col-span-2`} href={`sms:?&body=${encodeURIComponent(msg)}`}>
        <MessageSquare className="h-4 w-4" /> SMS
      </a>
    </div>
  );
}
