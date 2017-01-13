var rawGrammar = {


	singleTopics: ["ARG", "dating sim", "interactive fiction", "soap opera", "roguelike", "social game", "horror game", "slot machine", "real-time strategy game", "racing sim", "advergame", "serious game", "therapy game", "survival game", "visual novel", "physics platformer"],
	commodityTopic: ["VR", "gambling", "online poker", "chess", "poker", "the Sims 4", "Rogue", "StarCraft", "Monkey Island II", "SimCity", "Go", "League of Legends", "Hearthstone", "Magic the Gathering", "Pokemon Go", "Civilization V", "Eve Online", "Super Mario Bros"],

	thingsToGenerate: ["content", "music", "navigation", "rule-sets", "behavior", "team-mates", "competitions", "evaluation metrics", "NPC behavior", "love triangles","crafting recipes", "navmeshes", "relationships", "weapons", "quests", "dialogue", "difficulty curves", "matchmaking", "emotional affect", "maps", "terrain", "interiors", "flavor text", "stories", "drama", "suspense", ""],
	task: ["matchmaking", "difficulty adjustment", "player modelling", "quest generation", "dialogue trees", "NPC behavior", "problem-solving", "puzzle generation", "weapon generation"],

	verb: ["predicting", "evolving", "generating", "evaluating", "benchmarking", "building", "modelling"],
	adj: ["simulated", "human-level", "rule-based", "integrated", "real-time", "personalized", "flexible", "adaptive", "reactive", "dynamic", "procedural", "generative"],
	approaches: ["simple tree search", "deep learning", "neural networks", "Monte Carlo tree search", "imitative learning", "case-based reasoning", "Bayesian models", "opponent modelling", "adversarial planning", "Monte Carlo planning", "benchmarks", "stochastic AI", "pathfinding", "clustering", "evolutionary algorithms", "mixed initiative interfaces", "finite state machines", "genetic algorithms", "behavior trees", "LSTMs", "topological mapping","grammars", "grammatical evolution"],


	taxonomy: ["framework", "taxonomy", "comparison", "evaluation"],
	through: ["with", "through", "from"],
	for: ["in", "for"],
	paper: ["#adj.capitalize# #task# #through# #approaches#",
		"#verb.capitalize# #adj# #task# #through# #approaches#",
		"#verb.capitalize# #adj# #task# #for# #commodityTopic#",
		"#singleTopics# #thingsToGenerate# #through# #approaches#",
		"#approaches# #for# #adj# #singleTopics# #thingsToGenerate#",
		"#verb# #singleTopics# #thingsToGenerate#",
		"#verb# #singleTopics# #thingsToGenerate# #through# #approaches#",
		"#approaches# #for# #commodityTopic#: #taxonomy.a#",
		"A #taxonomy# #for# #approaches# #for# #commodityTopic#"
	],

	lastName: ["Wang", "Li", "Harris", "Yonge", "Green", "Lopez", "Walker", "Nelson", "de la Cruz", "Tan", "Kaya", "Hughes", "Dewan", "Devi", "Dehan", "Suzuki", "Kim", "Cho", "Yoon", "Coleman", "Bryant", "Hernandez", "Perry", "Powell", "Schwartz", "Mcbride", "Malhotra", "Sai", "Pai", "Patel", "Ahmed", "Padilla", "Sloan", "Roth", "Key", "Howe", "Sosa", "Rocha"],
	firstName: ["Judy", "Valerie", "Alex", "Julian", "Andre", "Alain", "Rafael", "Isabelle", "KayShun, Takumi", "Mehmet", "Misaki", "Aoi", "Fatma", "Emma", "Lukas", "Veeti", "Robin", "Jan", "João", "Sara", "Tanya", "Vanya", "Shay", "Keya", "Kiara", "Hiran", "Iker", "Tereza", "Lea", "Clara", "Matthew", "Michael", "Alexis", "Ana", "Madison", "Julia", "Zhang Wei", "Li Wei", "Zhang Min"],
	student: ["#firstName#|#lastName#|#specialty#"],


	personality: ["local politician", "ballet dancer", "yoga instructor", "opera singer", "pro gamer", "competitive body builder", "beauty queen", "marine", "scuba diver", "caffeine addict", "circus performer", "burlesque dancer", "DJ", "internet celebrity", "improve actor", "skydiver", "veterinarian", "artist", "performance artist", "trapeeze artist", "gymnast", "sailor", "martial arts master"],
	ex: ["recovering ", "aspiring ", "former "],
	personalityPlus: ["#personality#", "#ex##personality#"],
	gradStuff: ["academia", "teaching", "early mornings", "all-nighters", "sleeping", "research", "hot-tubbing", "herbal tea", "dancing", "coffee", "espresso", "wine", "beer"],
	media: ["#commodityTopic#", "anime", "badly-dubbed movies"],
	instrument: ["cello", "bass guitar", "flute", "violin", "kazoo", "piano", "accordion", "ukulele", "guitar"],
	jazz: ["classical", "jaz", "electric", "synth"],
	instrumentPlus: ["#instrument#", "#jazz# #instrument#", "#instrument# in #jazz.a# band"],
	rad: ["spiky", "punk", "understated", "secretive", "cool", "sinister", "rad", "80s throwback", "problematic"],
	tattoos: ["hair", "jewelry", "tattoos", "dance skills"],
	stuffReaction: ["hates", "loves", "likes", "allergic to", "addicted to"],
	personFlavor: ["#personalityPlus#", "#stuffReaction# #gradStuff#", "has #rad# #tattoos#", "plays #instrumentPlus#", "loves #media#"]
}

var metaskills = ["writing", "chilling", "brainstorming", "researching"];
var skills = [];

function addTags(list) {
	for (var i = 0; i < list.length; i++) {
		skills.push(list[i]);
		list[i] += "<" + list[i] + ">";
	}

}

addTags(rawGrammar.task);
addTags(rawGrammar.approaches);
addTags(rawGrammar.thingsToGenerate);
addTags(rawGrammar.commodityTopic);
addTags(rawGrammar.singleTopics);

console.log(skills);