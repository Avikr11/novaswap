
import { useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const stats = [
  {
    label: "Total Volume",
    value: "$24.8M",
  },
  {
    label: "Total Liquidity",
    value: "$8.4M",
  },
  {
    label: "Active Users",
    value: "18.2K",
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="bg-slate-950">
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Decentralized Trading
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Trade crypto.
            <br />
            <span className="text-cyan-400">
              Your way.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:mt-6 sm:text-lg sm:leading-8">
            NovaSwap is a modern decentralized trading interface designed for
            fast, transparent, and user-controlled token swaps.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <Button onClick={() => navigate("/swap")}>
              Start Swapping
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("/portfolio")}
            >
              Explore Portfolio
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <p className="text-sm text-slate-400">
                {stat.label}
              </p>

              <p className="mt-2 text-xl font-bold sm:text-2xl">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomePage;

