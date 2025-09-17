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
    photo: "/images/team/juani.jpeg",
  },
  {
    id: "tl",
    name: "Olivia Osella",
    phrase: "Como decía Fangio, la carrera no se gana en la primera curva sino cuando baja la bandera.",
    photo: "/images/team/oli.jpeg",
  },
  {
    id: "fe",
    name: "Nacho Samocachan",
    phrase: "Es mucho mas facil desactivar un átomo que un neutrón",
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
    phrase: "Cuando veas la sombra de un gigante, no te asustes. Fijate dónde está el sol, porque puede ser la sombra que proyecta un enano",
    photo: "/images/team/maxi.jpg",
  },
  {
    id: "ds",
    name: "Joa Bonugli",
    phrase: "Nosotros eramos Bruce Willis en Sexto Sentido, el único que no sabía que estaba muerto era él. A nosotros nos daban por muertos antes de empezar la película.",
    photo: "/images/team/joa.jpg",
  },
];
