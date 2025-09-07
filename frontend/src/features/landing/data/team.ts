export type TeamMember = {
  id: string;
  name: string;
  phrase: string;
  photo: string;   
};

export const TEAM: TeamMember[] = [
  {
    id: "po",
    name: "Juani Arrigoni",
    phrase: "Primero el valor, después la escala.",
    photo: "/images/team/juani.jpg",
  },
  {
    id: "tl",
    name: "Olivia Osella",
    phrase: "Decisiones simples, arquitectura sólida.",
    photo: "/images/team/oli.jpg",
  },
  {
    id: "fe",
    name: "Nacho Samocachan",
    phrase: "Es mucho mas facil desactivar un átomo que un preconcepto",
    photo: "/images/team/samo.jpg",
  },
  {
    id: "be",
    name: "Cata Perez",
    phrase: "Dominio primero, endpoints después.",
    photo: "/images/team/cata.jpg",
  },
  {
    id: "qa",
    name: "Maxi27 Rossa",
    phrase: "Lo que no se prueba, no existe.",
    photo: "/images/team/maxi.jpg",
  },
  {
    id: "ds",
    name: "Joa Bonugli",
    phrase: "Datos confiables, decisiones mejores.",
    photo: "/images/team/joa.jpg",
  },
];
