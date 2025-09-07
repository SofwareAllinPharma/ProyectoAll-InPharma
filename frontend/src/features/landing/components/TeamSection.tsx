import TeamCard from "./TeamCard";
import { TEAM } from "../../landing/data/team";

export default function TeamSection() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-8">
          <h2 className="text-2xl font-semibold text-[#5d5448]">Equipo de desarrollo</h2>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
          {TEAM.map((m) => (
            <TeamCard key={m.id} member={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
