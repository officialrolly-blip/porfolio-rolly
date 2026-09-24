"use client";
import { useEffect, useRef, useState } from "react";
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-5 w-5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
      <path d="M12 3C7 3 3 7 3 12c0 4 2.6 7.4 6.2 8.6.5.1.6-.2.6-.4v-1.5c-2.5.6-3-1.1-3-1.1-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.7.8.1-.7.3-1.1.6-1.4-2-.2-4.1-1-4.1-4.5 0-1 .3-1.8.9-2.4-.1-.2-.4-1.1.1-2.4 0 0 .8-.2 2.5.9a8.6 8.6 0 0 1 4.6 0c1.7-1.1 2.5-.9 2.5-.9.5 1.3.2 2.2.1 2.4.6.6.9 1.4.9 2.4 0 3.5-2.1 4.3-4.1 4.5.4.3.7.9.7 1.9v2.8c0 .2.1.5.6.4A9 9 0 0 0 21 12c0-5-4-9-9-9Z" />
    </svg>
  );
}
const SOCIALS = [
  { name: "Facebook", href: "https://www.facebook.com/RollyParedesOrtiz/", handle: "facebook.com/RollyParedesOrtiz", icon: "fb" },
  { name: "Instagram", href: "https://instagram.com/piierolly/", handle: "@piierolly", icon: "ig" },
  { name: "GitHub", href: "https://github.com/officialrolly-blip", handle: "github.com/officialrolly-blip", icon: "gh" },
];
export default function Contact() {
  const ref = useRef<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sendStep, setSendStep] = useState(0); // 0 = connecting, 1 = sending, 2 = delivering
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  const rise = (d: string) => `transition-all duration-700 ease-out ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${d}`;
  const sending = status === "sending";
  const SEND_STEPS = ["Connecting", "Sending", "Delivering"];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    // One free access key per Gmail address (Web3Forms free tier = 1 inbox per key;
    // the CC field is a paid feature). Get keys at https://web3forms.com — create
    // one with iamrollyparedes@gmail.com and one with rollyparedesva2@gmail.com.
    const keys = [
      process.env.NEXT_PUBLIC_WEB3FORMS_KEY_1 ?? "",
      process.env.NEXT_PUBLIC_WEB3FORMS_KEY_2 ?? "",
    ].filter((k) => k && !k.startsWith("PASTE_"));
    const formValues = new FormData(form);
    const name = String(formValues.get("name") ?? "");
    const email = String(formValues.get("email") ?? "");
    const subject = String(formValues.get("subject") ?? "New message from portfolio");
    const message = String(formValues.get("message") ?? "");
    const recipients = ["iamrollyparedes@gmail.com", "rollyparedesva2@gmail.com"];

    // No access keys yet → open the visitor's mail app as a fallback so nothing is lost.
    if (keys.length === 0) {
      const to = recipients.join(",");
      const body = `${message}\n\n— ${name} (${email})`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("sent");
      form.reset();
      setTimeout(() => setStatus("idle"), 5000);
      return;
    }

    setStatus("sending");
    setSendStep(0);
    // Advance the step label on a timer so the visitor sees progress even while
    // the network request is in flight. Cleared in the finally block below.
    const stepTimer = setInterval(() => {
      setSendStep((s) => (s < SEND_STEPS.length - 1 ? s + 1 : s));
    }, 1200);
    try {
      // Submit once per key (per the official Web3Forms docs: FormData body with
      // access_key appended) so each inbox receives the message.
      for (const access_key of keys) {
        const payload = new FormData();
        payload.append("access_key", access_key);
        payload.append("from_name", "Rolly Portfolio Contact Form");
        payload.append("name", name);
        payload.append("email", email);
        payload.append("subject", `[Portfolio] ${subject}`);
        payload.append("message", message);
        payload.append("replyto", email);
        payload.append("botcheck", "");

        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: payload,
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message ?? "Send failed");
        // Move to the next step as each inbox confirms delivery.
        setSendStep((s) => (s < SEND_STEPS.length - 1 ? s + 1 : s));
      }
      setStatus("sent");
      form.reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    } finally {
      clearInterval(stepTimer);
    }
  }
  return (
    <section id="contact" ref={ref} className="relative flex w-full scroll-mt-24 justify-center overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/25 via-fuchsia-400/20 to-cyan-300/25 blur-3xl dark:from-violet-600/15 dark:via-fuchsia-600/10 dark:to-cyan-500/10" />
      </div>
      <div className="relative w-full max-w-6xl">
        <p className={rise("")}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-600 shadow backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
            Contact Me
          </span>
        </p>
        <h2 className={`${rise("[transition-delay:100ms]")} mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl xl:text-5xl dark:text-white`}>
          Let&apos;s <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">work together</span>
        </h2>
        <p className={`${rise("[transition-delay:200ms]")} mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400`}>
          Send me a message or reach me on social — I usually reply within 24 hours.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <form id="contact-form" onSubmit={handleSubmit} className={`${rise("[transition-delay:250ms]")} rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl sm:p-8 dark:border-white/15 dark:bg-white/[0.06]`}>
            {/* Progress steps — visible while the message is being sent */}
            {status === "sending" && (
              <div className="mt-4" aria-hidden>
                {/* Animated progress bar (indeterminate while waiting on the network) */}
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900/10 dark:bg-white/10">
                  <div className="h-full w-1/3 animate-[sendbar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500" />
                </div>
                {/* Step indicators: Connecting → Sending → Delivering */}
                <ol className="mt-3 flex items-center gap-1.5">
                  {SEND_STEPS.map((label, i) => (
                    <li key={label} className="flex flex-1 items-center gap-1.5 last:flex-none">
                      <span className="flex flex-1 flex-col items-center gap-1.5">
                        <span
                          className={`flex w-full items-center gap-1.5 text-[11px] font-semibold ${
                            i < sendStep
                              ? "text-emerald-600 dark:text-emerald-300"
                              : i === sendStep
                                ? "text-zinc-800 dark:text-zinc-100"
                                : "text-zinc-400 dark:text-zinc-500"
                          }`}
                        >
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                              i < sendStep
                                ? "bg-emerald-500 text-white"
                                : i === sendStep
                                  ? "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white"
                                  : "bg-zinc-900/10 text-zinc-400 dark:bg-white/10 dark:text-zinc-500"
                            }`}
                          >
                            {i < sendStep ? "✓" : i + 1}
                          </span>
                          {label}
                        </span>
                      </span>
                      {i < SEND_STEPS.length - 1 && (
                        <span className={`h-px flex-1 ${i < sendStep ? "bg-emerald-400" : "bg-zinc-900/10 dark:bg-white/10"}`} />
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {/* Skeleton shimmer over the fields while sending, so the form visibly locks */}
            <div className={`relative ${sending ? "pointer-events-none select-none" : ""}`}>
              <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Your Name</label>
                <input id="name" name="name" required disabled={sending} placeholder="Juan Dela Cruz" className="h-12 w-full rounded-xl border border-white/25 bg-white/20 px-4 text-sm text-zinc-900 placeholder:text-zinc-500 backdrop-blur-md outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/30 disabled:opacity-60 dark:border-white/15 dark:bg-white/10 dark:text-white" />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Email Address</label>
                <input id="email" name="email" type="email" required disabled={sending} placeholder="you@email.com" className="h-12 w-full rounded-xl border border-white/25 bg-white/20 px-4 text-sm text-zinc-900 placeholder:text-zinc-500 backdrop-blur-md outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/30 disabled:opacity-60 dark:border-white/15 dark:bg-white/10 dark:text-white" />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="subject" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Subject</label>
              <input id="subject" name="subject" required disabled={sending} placeholder="Project inquiry, collaboration..." className="h-12 w-full rounded-xl border border-white/25 bg-white/20 px-4 text-sm text-zinc-900 placeholder:text-zinc-500 backdrop-blur-md outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/30 disabled:opacity-60 dark:border-white/15 dark:bg-white/10 dark:text-white" />
            </div>
            <div className="mt-4">
              <label htmlFor="message" className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Message</label>
              <textarea id="message" name="message" required rows={5} disabled={sending} placeholder="Hi Rolly! I'd like to talk about..." className="w-full rounded-xl border border-white/25 bg-white/20 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 backdrop-blur-md outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/30 disabled:opacity-60 dark:border-white/15 dark:bg-white/10 dark:text-white" />
            </div>
              {sending && (
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                  <div className="absolute inset-0 animate-pulse bg-white/20 dark:bg-white/[0.04]" />
                  <div className="absolute inset-y-0 w-1/2 animate-[sendshine_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
                </div>
              )}
            </div>
            <button type="submit" disabled={status === "sending"} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 dark:bg-white dark:text-zinc-900" aria-live="polite">
              {status === "sending" ? (
                <>
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" /><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                  {SEND_STEPS[sendStep]} your message...
                </>
              ) : (
                "Send Message"
              )}
            </button>
            {status === "sent" && <p role="status" className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-center text-sm font-medium text-emerald-600 dark:text-emerald-300">✅ Message sent successfully! Thanks for reaching out — I&apos;ll get back to you within 24 hours.</p>}
            {status === "error" && <p role="alert" className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-center text-sm font-medium text-rose-600 dark:text-rose-300">Something went wrong — please email me directly at iamrollyparedes@gmail.com.</p>}
          </form>
          <div className={`${rise("[transition-delay:350ms]")} flex flex-col gap-5`}>
            <div className="rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl sm:p-7 dark:border-white/15 dark:bg-white/[0.06]">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Find me online</h3>
              <ul className="mt-4 space-y-3">
                {SOCIALS.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-white/25 bg-white/20 px-4 py-3.5 transition hover:-translate-y-0.5 hover:bg-white/30 dark:border-white/15 dark:bg-white/10">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-lg ring-1 ring-white/30">
                        {s.icon === "fb" && <FacebookIcon />}
                        {s.icon === "ig" && <InstagramIcon />}
                        {s.icon === "gh" && <GithubIcon />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-zinc-900 dark:text-white">{s.name}</span>
                        <span className="block truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">{s.handle}</span>
                      </span>
                      <span className="ml-auto text-zinc-400 transition group-hover:translate-x-1">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl sm:p-7 dark:border-white/15 dark:bg-white/[0.06]">
              <h3 className="relative text-lg font-bold text-zinc-900 dark:text-white">Download my CV</h3>
              <p className="relative mt-1 text-sm text-zinc-500 dark:text-zinc-400">Get my resume with experience and skills.</p>
              <a href="https://drive.google.com/file/d/1Xm00VhAWofotbvUH1_tbzGiy0eItMnGU/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="relative mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="h-4 w-4"><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
                Download CV
              </a>
              <p className="relative mt-3 text-center font-mono text-[11px] text-zinc-400">Opens my CV in Google Drive</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}