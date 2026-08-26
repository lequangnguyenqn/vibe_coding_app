import { ClayButton } from "../components/ui/ClayButton";
import { ClayCard } from "../components/ui/ClayCard";

export function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <header className="mx-auto mb-8 flex w-full max-w-6xl items-center justify-between">
        <div className="rounded-[22px] bg-[#fff9e9] px-4 py-2 text-sm font-semibold text-[#2f3d46] shadow-[0_12px_20px_rgba(56,84,98,0.18),inset_0_-6px_12px_rgba(56,84,98,0.15),inset_0_6px_12px_rgba(255,255,255,0.65)]">
          Food Expiry Tracker
        </div>
        <ClayButton href="/login" aria-label="Open login page">
          Login
        </ClayButton>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ClayCard>
          <h1 className="text-4xl font-black tracking-tight text-[#163245] md:text-5xl">
            Track food expiry dates before they become waste.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[#27465a]">
            Keep one clear view of everything in your kitchen. See what is expiring soon, reduce waste,
            and stay ahead with proactive reminders.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ClayButton href="/admin">Go to Admin</ClayButton>
            <ClayButton href="#how-it-works" className="bg-[#dff7ff] text-[#14364a]">
              How it works
            </ClayButton>
          </div>
        </ClayCard>

        <ClayCard className="bg-[#daf4ec]">
          <h2 className="text-2xl font-extrabold text-[#184235]">Why this helps</h2>
          <ul className="mt-4 space-y-3 text-[#184235]">
            <li>Automatic reminders for items close to expiration.</li>
            <li>Cleaner pantry rotation with one weekly check.</li>
            <li>Share visibility with your household.</li>
          </ul>
        </ClayCard>
      </section>
    </main>
  );
}
