import SwapCard from "../components/swap/SwapCard";

function SwapPage() {
  return (
    <section className="flex min-h-full items-start justify-center bg-slate-950 px-3 py-6 sm:px-6 sm:py-10 lg:items-center lg:py-12">
      <div className="w-full max-w-xl">
        <SwapCard />
      </div>
    </section>
  );
}

export default SwapPage;