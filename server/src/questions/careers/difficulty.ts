// Dificuldade das carreiras do banco. Facil = craque que quase todo mundo
// conhece; dificil = jogador menos lembrado; o resto e medio.
import type { Difficulty } from "@cobra/shared";

const FACIL = new Set([
  // brasileiros
  "Romario", "Rivaldo", "Roberto Carlos", "Cafu", "Adriano", "Robinho", "Thiago Silva", "Marcelo", "Casemiro",
  "Philippe Coutinho", "Roberto Firmino", "Gabriel Jesus", "Vinicius Junior", "Rodrygo", "Richarlison", "Alisson",
  "Marquinhos", "Hulk", "Alexandre Pato", "Fred", "Zico", "Socrates", "David Luiz", "Lucas Moura", "Gabriel Barbosa",
  "Antony", "Endrick", "Raphinha", "Lucas Paqueta", "Julio Cesar", "Willian", "Oscar", "Diego Costa", "Bebeto",
  "Garrincha", "Renato Gaucho", "Edmundo", "Dunga", "Taffarel", "Rivellino", "Felipe Melo", "Dida", "Kaka",
  // sul-americanos
  "Gabriel Batistuta", "Hernan Crespo", "Juan Roman Riquelme", "Carlos Tevez", "Sergio Aguero", "Angel Di Maria",
  "Gonzalo Higuain", "Javier Mascherano", "Javier Zanetti", "Diego Simeone", "Lautaro Martinez", "Julian Alvarez",
  "Enzo Fernandez", "Emiliano Martinez", "Alexis Mac Allister", "Paulo Dybala", "Mauro Icardi", "Luis Suarez",
  "Edinson Cavani", "Diego Forlan", "Federico Valverde", "Darwin Nunez", "Giorgian de Arrascaeta", "Radamel Falcao",
  "James Rodriguez", "Carlos Valderrama", "Juan Cuadrado", "Luis Diaz", "Alexis Sanchez", "Arturo Vidal",
  "Jose Luis Chilavert", "Paolo Guerrero",
  // europeus
  "Zlatan Ibrahimovic", "Kylian Mbappe", "Erling Haaland", "Robert Lewandowski", "Luka Modric", "Karim Benzema",
  "Andres Iniesta", "Xavi Hernandez", "Sergio Ramos", "Gerard Pique", "Iker Casillas", "David Villa", "Fernando Torres",
  "Cesc Fabregas", "Antoine Griezmann", "Paul Pogba", "N'Golo Kante", "Olivier Giroud", "Franck Ribery", "Michel Platini",
  "Eric Cantona", "Ousmane Dembele", "Wayne Rooney", "Steven Gerrard", "Frank Lampard", "John Terry", "Michael Owen",
  "Harry Kane", "Jude Bellingham", "Kevin De Bruyne", "Eden Hazard", "Romelu Lukaku", "Thibaut Courtois", "Arjen Robben",
  "Robin van Persie", "Wesley Sneijder", "Clarence Seedorf", "Virgil van Dijk", "Johan Cruyff", "Andrea Pirlo",
  "Gianluigi Buffon", "Alessandro Del Piero", "Fabio Cannavaro", "Roberto Baggio", "Mario Balotelli", "Thomas Muller",
  "Manuel Neuer", "Toni Kroos", "Miroslav Klose", "Mesut Ozil", "Bruno Fernandes", "Joao Felix", "Ricardo Quaresma",
  "Andriy Shevchenko", "Pavel Nedved", "Gareth Bale", "Didier Drogba", "Samuel Eto'o", "Yaya Toure", "Mohamed Salah",
  "Sadio Mane", "Achraf Hakimi", "Marcus Rashford", "Cole Palmer", "Trent Alexander-Arnold", "Son Heung-min",
  "Javier Hernandez", "Guillermo Ochoa", "Keylor Navas", "Christian Pulisic", "Alvaro Morata", "Isco", "Gianluigi Donnarumma",
  "Raphael Varane", "Patrick Vieira", "Dani Carvajal",
]);

const DIFICIL = new Set([
  // brasileiros
  "Mauro Silva", "Juninho Paulista", "Grafite", "Nilmar", "Jo", "Elano", "Denilson", "Edilson", "Vampeta", "Amoroso",
  "Giovanni", "Sonny Anderson", "Taison", "Wendell", "Luiz Gustavo", "Diego Tardelli", "Thiago Neves", "Ricardo Oliveira",
  "Fred Rodrigues", "Evair", "Viola", "Tulio Maravilha", "Djalminha", "Branco", "Muller",
  "Emerson", "Alex", "Anderson",
  "Grafite", "Mario Jardel",
  "Rony", "Tiquinho Soares",
  "Felipe Anderson", "Gustavo Scarpa", "Joao Gomes", "Andreas Pereira", "Yuri Alberto", "Diego Souza",
  "Marcelinho Carioca",
  // sul-americanos
  "Ariel Ortega", "Claudio Caniggia", "Ever Banega", "Fernando Gago", "Walter Samuel",
  "Roberto Ayala", "Erik Lamela", "Marcos Rojo", "Leandro Paredes", "Gabriel Heinze",
  "Pablo Zabaleta", "Nicolas Lodeiro",
  "Paolo Montero", "Cristian Rodriguez", "Martin Caceres", "Sebastian Coates", "Jose Maria Gimenez",
  "Freddy Rincon", "Mario Yepes", "Jackson Martinez", "Davinson Sanchez", "Yerry Mina", "David Ospina",
  "Juan Fernando Quintero", "Teofilo Gutierrez", "Charles Aranguiz",
  "Eduardo Vargas", "Elias Figueroa", "Roque Santa Cruz", "Carlos Gamarra", "Oscar Cardozo", "Miguel Almiron",
  "Gustavo Gomez", "Enner Valencia", "Pervis Estupinan", "Piero Hincapie",
  "Jefferson Farfan", "Salomon Rondon", "Juan Arango",
  "Jonathan Calleri", "Lucas Pratto", "Thiago Almada",
  // europeus / outros
  "Gaizka Mendieta",
  "Youri Djorkaeff",
  "Aymeric Laporte",
  "Ian Rush",
  "Dries Mertens",
  "Gennaro Gattuso",
  "Jurgen Klinsmann",
  "Sami Khedira",
  "Per Mertesacker", "Joao Moutinho", "Ricardo Carvalho", "Paulo Futre", "Simao Sabrosa",
  "Raul Meireles", "Davor Suker", "Dejan Stankovic",
  "Tomas Rosicky", "Granit Xhaka",
  "Xherdan Shaqiri", "Michael Laudrup", "Hakan Sukur",
  "Arda Turan", "Hakan Calhanoglu",
  "Seydou Keita", "Frederic Kanoute", "Abedi Pele",
  "Andre Onana", "Wilfried Zaha", "Thomas Partey", "Naby Keita", "Serhou Guirassy",
  "Raul Jimenez", "Andres Guardado", "Carlos Vela",
  "Cuauhtemoc Blanco", "Landon Donovan", "Clint Dempsey", "Tim Howard", "Bryan Ruiz", "Jozy Altidore", "Tyler Adams",
  "Shinji Kagawa",
  "Mehdi Taremi", "Sardar Azmoun", "Ali Daei", "Salem Al-Dawsari", "Tim Cahill", "Harry Kewell", "Mark Viduka",
  "Kieran Trippier", "Rasmus Hojlund", "Mikel Merino", "Randal Kolo Muani",
  "Sandro Tonali", "Christopher Nkunku", "Benjamin Sesko", "Bryan Mbeumo", "Jonathan David", "Weston McKennie",
]);

export function careerDifficulty(playerName: string): Difficulty {
  if (FACIL.has(playerName)) return "facil";
  if (DIFICIL.has(playerName)) return "dificil";
  return "medio";
}

/** Ordem das carreiras numa partida: facil, medio, facil, dificil... */
const PATTERN: Difficulty[] = ["facil", "medio", "facil", "dificil"];
export function careerDifficultyForRound(roundIndex: number): Difficulty {
  return PATTERN[roundIndex % PATTERN.length];
}
