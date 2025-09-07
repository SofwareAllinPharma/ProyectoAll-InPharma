import type { TeamMember } from "../../landing/data/team";
import styles from "./TeamCard.module.css";

type Props = { member: TeamMember };

export default function TeamCard({ member }: Props) {
  const trackers = Array.from({ length: 25 }, (_, i) => i + 1);

  // Fallbacks por si name o photo están vacíos
  const displayName = member.name?.trim() || "Próximamente";
  const photoSrc = member.photo?.trim() || "/images/team/default.jpg";

  return (
    <div className={styles.container} aria-label={`Tarjeta de ${displayName}`}>
      <div className={styles.canvas}>
        {trackers.map((n) => {
          const trackerClass = (styles as Record<string, string>)[`tr-${n}`] || "";
          return <div key={n} className={`${styles.tracker} ${trackerClass}`} />;
        })}

        <div className={styles.card}>
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-white text-center">
            <img
              src={photoSrc}
              alt={`Foto de ${displayName}`}
              className="h-28 w-28 rounded-full object-cover ring-2 ring-white/70 shadow-md"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/team/default.jpg"; }}
            />
            <h3 className="text-lg font-semibold leading-tight">{displayName}</h3>
            <p className="text-sm opacity-95 max-w-[80%]">“{member.phrase}”</p>
          </div>

          <p className={styles.prompt}>UTN-FRC</p>
        </div>
      </div>
    </div>
  );
}
