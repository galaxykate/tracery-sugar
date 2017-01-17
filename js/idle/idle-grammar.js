var rawGrammar = {

	whiteboardSuccess: ["?", "???", "X", "(papers)", "GRANTZ!", "$$$", "!", "win", "yes", "MAYBE"],
	idea: ["#a# and #b#", "#a# & #b#", "#a# & #b#->#whiteboardSuccess#", "#a# + #b# = #whiteboardSuccess#", "#a# -> #b# -> #whiteboardSuccess#", "1. #a# 2. #b# 3. #whiteboardSuccess#", "#b#, but #for# #a#"],

	genre: ["ARG", "dating sim", "pet simulator", "farming simulator", "idlegame", "soap opera", "roguelike", "survival horror game", "MetroidVania", "text adventure", "tactical RPG", "social game", "horror game", "slot machine", "MMO", "card game", "stealth game", "puzzle game", "walking simulator", "board game", "fighting game", "eurogame", "simulation game", "flight simulator", "MOBA", "tower defense", "LARP", "trivia game", "incremental game", "rail shooter", "real-time strategy game", "exergame", "racing sim", "advergame", "serious game", "Match-3", "imperfect information game", "therapy game", "survival game", "tabletop RPG", "Twine game", "visual novel", "physics platformer", "first-person shooter", "stealth game", "JRPG", "pinball"],
	game: ["VR", "augmented reality", "Goat Simulator", "Monument Valley", "Undertale", "online poker", "interactive fiction", "chess", "poker", "Stardew Valley", "Street Fighter", "Overwatch", "Minecraft", "FIFA 16", "Skyrim", "Tony Hawk's Pro Skater", "Pong", "NBA Jam", "Counter-Strike", "Spelunky", "Cookie Clicker", "Bejeweled", "Settlers of Catan", "Candy Crush", "Risk", "Dwarf Fortress", "the Sims 4", "Ms Pac Man", "Tetris", "SimCity", "Sokoban", "Rogue", "StarCraft", "Monkey Island II", "SimCity", "Rock Band", "Go", "League of Legends", "Hearthstone", "Magic the Gathering", "Pokemon Go", "Civilization V", "Eve Online", "Super Mario Bros"],

	content: ["content", "music", "navigation", "physics", "physics puzzles", "humor", "character creators", "user creativity", "emotional affect", "deck building", "color palettes", "weapons", "emergent behavior", "textures", "trees", "level layout", "obstacle placement", "matchmaking", "dialog trees", "quests", "minigames", "skill trees", "art styles", "shaders", "characters", "tutorials", "landscapes", "narrative", "rule-sets", "behavior", "tactics", "long-term strategy", "teammates", "enemies", "traps", "competitions", "evaluation metrics", "NPC behavior", "love triangles", "crafting recipes", "crafting system", "navmeshes", "relationships", "weapons", "quests", "dialogue", "difficulty curves", "difficulty", "matchmaking", "emotional affect", "maps", "terrain", "skyboxes", "interiors", "flavor text", "stories", "drama", "suspense", "audio"],

	approach: ["simple tree search", "A*", "GOAP", "grammar induction", "finite state machines", "deep learning", "constraint solving", "search", "simulated annealing", "genetic programming", "fuzzy logic", "decision networks", "hill-climbing", "classifiers", "multilayer perceptrons", "RNNs", "gradient descent", "knowledge representation", "regret-based optimization", "neural networks", "Markov Chains", "social intelligence", "crowdsourcing", "Monte Carlo tree search", "imitative learning", "swarm intelligence", "multi-agent planning", "reinforcement learning", "case-based reasoning", "Bayesian models", "opponent modelling", "adversarial planning", "Monte Carlo planning", "benchmarks", "stochastic AI", "NLP", "pathfinding", "situated approaches", "clustering", "expert systems", "evolutionary algorithms", "mixed initiative interfaces", "finite state machines", "genetic algorithms", "behavior trees", "LSTMs", "topological mapping", "grammars", "grammatical evolution"],


	randomAcronym: [],
	sysBlargle: [],



	techniqueNamePrefix: ["deep", "top", "next", "multi", "viz", "ludo", "plot", "gen", "smart", "sim", "bot", "dev", "code", "sys"],
	techniqueNameSuffix: ["bot", "buddy", "pal", ".AI", "AI", "eval", "stream", "form", "think", "maker", "space", "mind", "brain", "mesh", "net", "source", "scope", "sys"],

	projectName: ["#projectDesc.acronym#", "#projectDesc.acronym#", "#projectDesc.acronym#", "#techniqueNamePrefix.capitalize##techniqueNameSuffix.capitalize#", "#firstName.allCaps.despace#", "the #firstName.allCaps.despace# Project", "Project #firstName.allCaps.despace#"],
	projectDesc: ["#focus# #content#", "#focus# #approach#"],

	project: ["#codeName#: #approach# for #focus# #content#"],

	verb_present: ["predict", "evolve", "generate", "evaluate", "benchmark", "build", "model", "plan", "analyze", "learn"],
	verb: ["predicting", "evolving", "generating", "evaluating", "benchmarking", "building", "modelling", "analyzing", "learning"],
	adj: ["novel", "expressive", "meaningful", "real", "deep", "simulated", "human-level", "rule-based", "integrated", "real-time", "personalized", "flexible", "augmented", "affective", "adaptive", "reactive", "dynamic", "procedural", "generative"],
	adj_science: ["rapid", "quick", "accurate", "decisive", "impactful", "efficient", "concurrent", "parallel"],

	thing: ["tool", "assistant", "engine", "AI", "generator", "interface"],

	questionword: ["why", "what", "how", "when", "who", "where", ],
	question: ["#verb_present# or #verb_present#", "why #verb_present#", "#questionword# are we #verb#", "but is it #adj#", ],
	bumper: ["when #verb# isn't enough", "from #verb# to #verb#", "#approach# isn't #adj_science#", "if it's not #approach# then it's not #adj_science#"],

	work: ["#work_passive#", "#work_active#"],
	work_passive: ["framework", "taxonomy", "proposal"],
	work_active: ["comparison", "critique", "evaluation", "study"],

	competition: ["competition", "contest", "challenge"],
	taxonomy: ["framework", "taxonomy", "comparison", "evaluation"],
	through: ["with", "through", "from"],
	for: ["in", "for", "with"],


	paper: [
		"#codeName#: #regular_paper.capitalize#",
		"#codeName#: #regular_paper.capitalize#",
		"#codeName#: #regular_paper.capitalize#",
		"#codeName#: #regular_paper.capitalize#",
		"#regular_paper.capitalize#",
		"#codeName#: #regular_paper.capitalize#",
		"#codeName#: #regular_paper.capitalize#",
		"#regular_paper.capitalize#",
		"#regular_paper.capitalize#",
		"#regular_paper.capitalize#",
		"#regular_paper.capitalize#",
		"#approach.capitalize# #for# #adj# #focus#: #work.a#",
		"#approach.capitalize# #for# #focus#: #adj.a# #work#",
		"#approach.capitalize# #for# #focus#: #work.a#",
		"#approach.capitalize# #for# #focus#: #work.a# with #codeName#",
		"#question.capitalize#? #regular_paper.capitalize#",
		"#bumper.capitalize#: #regular_paper.capitalize#",
	],
	//These are fun, and can have anything put after them - almost.
	//Some papers (like competition results, or anything with its own subhead) don't work.
	//I'm not sure the best way to structure this, so I goofed it up.

	regular_paper: [
		"#adj.capitalize# #content# #through# #approach#",
		"#verb.capitalize# #adj# #content# #through# #approach#",
		"#verb.capitalize# #adj# #content# #for# #focus#",
		"#focus# #content# #through# #codeName# #approach#",
		"#approach# #for# #adj# #focus# #content#",
		"#verb# #focus# #content# with #codeName#",
		"#verb# #focus# #content# #through# #approach#",
		"#approach# #for# #focus#: #taxonomy.a#",
		"A #taxonomy# #for# #approach# #for# #focus#",
		//Mike added this stuff
		"#content.a# #work_passive# for #focus#",
		"A #work_active# of #approach# #for# #focus#",
		"#thing.a# for #adj_science# #content# in #focus#",
		"results of the 2017 #focus.capitalizeAll# AI #competition#",
	],


	lastName: ["Wang", "Li", "Harris", "Yonge", "Green", "Lopez", "Walker", "Nelson", "de la Cruz", "Tan", "Kaya", "Hughes", "Dewan", "Devi", "Dehan", "Suzuki", "Kim", "Cho", "Stanley", "Yoon", "Coleman", "Bryant", "Hernandez", "Perry", "Powell", "Schwartz", "Mcbride", "Malhotra", "Sai", "Sharma", "Cunningham", "Holmes", "De Werra", "Jackson", "White", "Green", "Hill", "Cook", "Parrish", "Patel", "Mohamed", "Ólafsson", "Dylan", "Murphy", "Novak", "Cohen", "Dau", "García", "Christodoulou", "Koutsoupias", "Schaeffer", "McGee", "Wen", "Maskin", "Syed", "Ahmed", "Dunn", "Bell", "Khan", "Waugh", "Nowe", "McCoy", "Bott", "Gupta", "Julien", "Lundahl", "Traynor", "Rojek", "May", "Jones", "Penn", "Madeira", "Dimitrov", "Meyer", "Suparasad", "Palfrey", "Müller", "Booker", "Schmidt", "Davis", "Brown", "Miller", "Day", "Carter", "Smith", "Evans", "Soo", "Berger", "Steiner", "Lang", "Hartness", "Clarke", "Noriega", "Molinero", "Chen", "Tan", "Lucas", "Øfsdahl", "Starr", "Buro", "De Jong", "Padilla", "Wu", "McNamara", "Barta", "Dushku", "Leka", "Wiles", "Johnson", "Sun", "Hsieh", "Springer", "Sloan", "Zhang", "Roth", "Key", "Howe", "Sosa", "Rocha", "Lee", "Schadd", "Pazgal", "Ruiz", "Valenciano", "Khoo", "Popović", "Rossi", "Fox", "Gallo", "Vella", "Andov", "Jansen", "De Graaf", "Petrov", "Laine", "Salo", "Laurent", "Nagy", "O'Connor", "Nyman", "Petersen", "Lawal", "Florez", "Silva", "Rodriguez", "Garcia", "Karlsson", "Nguyen", "Lam", "Reyes", "Desai", "Kumar", "Mehta", "Kwon", "Moon", "Suzuki", "Kwok", "Soriano", "Tanaka", "Petit", "Hansen", "Santos", "Alves", "Turk", "Dzhurov", "Hodžić", "Horvat", "Dvořák", "Ivanov", "Tamm", "Jensen", "Sørensen"],
	firstName: ["Judy", "Sandra", "Anish", "Maria", "Angelina", "Tami", "Puja", "Grace", "Karthika", "Jo", "Joe", "Pat", "Leila", "Doha", "Aya", "Hana", "Mateo", "Santiago", "Camila", "Luz", "Anya", "Amit", "Robin", "Ariel", "Adi", "Omar", "Abdul", "Adam", "Somchai", "Maryam", "Myra", "Riya", "Lin", "Zara", "Shu-fen", "Mei-ling", "Oisha", "Star", "Yusif", "Marc", "Hugo", "Ivan", "Jan", "Leo", "Lena", "Raj", "Noor", "Rahul", "Arvind", "Samir", "Vikas", "Lisa", "Donna", "Paul", "Catherine", "Dan", "Jay", "Laura", "Jason", "Greg", "Bob", "Justin", "Dave", "Evelyn", "Dee", "Bruce", "Juan", "Gabriel", "Louis", "Monique", "Andre", "Kareem", "Jara", "Jennifer", "Dani", "Gillian", "Kathy", "Kathleen", "April", "Jakob", "David", "Viraj", "Jane", "Giovanni", "Pedro", "Alex", "Andi", "Audrey", "Ash", "Valerie", "Alex", "Julian", "Rose", "Olivia", "Chengli", "Andre", "Nicola", "Wolf", "Jen", "Jens", "Alain", "Rafael", "Isabelle", "Kay", "Shun", "Takumi", "Mehmet", "Misaki", "Eli", "Dakota", "Gabriel", "Sigurðsson", "Stacey", "James", "Ben", "Mischa", "Armani", "Justice", "Sam", "Sora", "Sky", "Kim", "Aoi", "Ali", "Nils", "Fatma", "Emma", "Lukas", "Veeti", "Robin", "Jan", "João", "Sara", "Tanya", "Vanya", "Shay", "Keya", "Kiara", "Hiran", "Bayani", "Iker", "Tereza", "Lea", "Clara", "Matthew", "Michael", "Alexis", "Ana", "Madison", "Julia", "Zhang Wei", "Li Wei", "Zhang Min"],


	personality: ["local politician", "ballet dancer", "Youtube star", "beauty blogger", "mommy blogger", "yoga instructor", "opera singer", "pro gamer", "#cause# advocate", "#cause# organizer", "body builder", "beauty queen", "libertarian", "slam poet", "activist", "vegan", "librarian", "pianist", "scuptor", "marine", "scuba diver", "caffeine addict", "circus performer", "burlesque dancer", "DJ", "internet celebrity", "improv actor", "skydiver", "veterinarian", "artist", "performance artist", "child prodigy", "trapeeze artist", "gymnast", "sailor", "martial arts master"],
	ex: ["competitive ", "part-time ", "recovering ", "aspiring ", "former "],
	personalityPlus: ["#personality#", "#ex##personality#", "#ex##personality#"],
	gradStuff: ["academia", "teaching", "early mornings", "cheese", "screenreaders", "e-readers", "snacks", "free food", "free time", "cilantro", "all-nighters", "sleeping", "research", "hot-tubbing", "herbal tea", "dancing", "bike repair", "cardio", "the gym", "meditation", "mentoring undergrads", "Netflix", "Twitch", "pubcrawls", "coffee", "espresso", "wine", "beer", "#socialMedia#"],
	socialMedia: ["LinkedIn", "Facebook", "Tinder", "DeviantArt", "Twitch", "Twitter", "Instagram", "Vine"],
	stuff: ["#mediaPlus#", "#gradStuff#"],
	mediaPlus: ["#game#", "#mediaAdj# #media#"],
	instrument: ["cello", "bass guitar", "flute", "violin", "kazoo", "piano", "accordion", "ukulele", "guitar"],
	jazz: ["classical", "jazz", "electric", "synth", "experimental", "avante-garde"],
	mediaAdj: ["French", "Japanese", "Korean", "Chinese", "Bollywood", "badly-translated", "vintage", "bootleg", "abstract", "avant-garde", "punk"],
	media: ["#genre.s#", "#genre.s#", "#genre.s#", "film", "comics", "game shows", "soap operas", "musicals", "movies", "anime", "art films", "reality TV", "video games"],
	instrumentPlus: ["#instrument#", "#jazz# #instrument#", "#instrument# in #jazz.a# band"],
	rad: ["spiky", "punk", "understated", "enigmatic", "secretive", "vintage", "retro", "cool", "sinister", "rad", "80s throwback", "problematic"],
	cause: ["animal rights", "Black Lives", "homeless rights", "voting rights", "environmental", "education", "public policy"],
	tattoos: ["hair", "sunglasses", "fashion sense", "glasses", "jewelry", "tattoos", "dance skills"],
	stuffReaction: ["hates", "loves", "likes", "allergic to", "addicted to"],
	famous: ["has multiple profiles on", "currently refreshing", "popular on", "famous on", "mildly famous on", "always on", "usually surfing", "just installed", "recently uninstalled"],
	personFlavor: ["#famous# #socialMedia#", "#personalityPlus#", "has #rad# #tattoos#", "plays #instrumentPlus#", "#stuffReaction# #stuff#", "#stuffReaction# #stuff# and #stuff#"],

	// Grants n such

	confAdj: ["new", "next", "computer", "human", "graphical", "visual", "computer-aided", "novel", "digital", "electronic", "#adj#", "#verb#", "#adj#", "#verb#"],
	confArea: ["games", "entertainment", "graphics", "computing", "media", "computers", "software", "intelligence", "design", "engineering", "systems", "applications", "hollywood", "art", "modelling", "#verb#", "#verb#"],
	shortJournal: ["#confAdj.capitalize# #confArea.capitalize#"],
	funding_area: ["Science", "Physical Sciences", "Engineering", "Digital Engineering", "Arts and Humanities", "Social Technology", "Future Society", "Digital Society", "Digital Economy", ],
	agency_type: ["Academy", "Funding Agency", "Research Council", "Research Projects Agency", "Foundation", "Research Group", "Research Foundation", "Trust"],

	subject: ["Artificial Intelligence", "Computational Intelligence", "Machine Learning", "Human-Computer Interaction", ],
	sub_adj: ["Intelligent", "Dynamic"],
	subsubject: ["Narrative", "Player Modelling", "Human-Like Behaviour", "Non-Photorealistic Rendering", "Game Analytics"],
	euphemism: ["Electronic Art", "Electronic Media", "Digital Art", "Electronic Entertainment", "Games", "Digital Games", "Digital Entertainment", "Digital Media", "Interactive Media", "Interactive Entertainment", "Videogames", "Video Games", ],
	event_things: ["Technologies", "Approaches"],

	publication: ["Journal", "Transactions"],
	publication_event: ["Conference on", "Workshop on", "Symposium on", "Summit on"],
	fancy_publication: ["Foundations of", "Advances in", "Applications of", "Experimental"],
	region: ["Asian", "North American", "South American", "Hollywood", "Silicon Valley", "European", "North African", "South African", "Middle Eastern", "Eurasian", "South-East Asian", "Central American"],


	journal: ["#publication# on #event_topic#",
	"#publication# on #shortJournal#",
	"#shortJournal#",
		"#fancy_publication# #shortJournal#",
		"#funding_area#",
		"#event_topic#"
	],

    char: "abcdefghijklmnopqrstuvwxyz".split(""),
    digit: "0123456789".split(""),
    nth: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"],
 
	conf: [
		"2017 #publication_event# #shortJournal#",
		"#fancy_publication# #shortJournal#",
		"#publication_event# #event_topic#",
		"#fancy_publication# #shortJournal#",
		"#nth# #region# #publication_event# #shortJournal#",
		"2017 #region# #publication_event# #shortJournal#"
	],

	

	event_topic: ["#subsubject# in #euphemism#", "#subject# and #euphemism#", "#subject# and #euphemism#", "#subject# in #euphemism# and #euphemism#", "#sub_adj# #subsubject# #event_things#"],

	ender: ["", "", "", "", "", "", "(Part of the 2017 #publication_event# #subject#)"],



	studio: ["studio", "group", "lab", "laboratory", "research group", "center", "project"],
	euphemism: ["Electronic Art", "Electronic Media", "Digital Art", "Electronic Entertainment", "Games", "Digital Games", "Digital Entertainment", "Digital Media", "Interactive Media", "Interactive Entertainment", "Videogames", "Video Games"],
	commodityIntelligence: ["entertainment", "play", "design", "playfulness", "emotion", "media", "reasoning", "technology", "intelligence", "AI", "creativity", "art", "science", "thinking", "strategy", "planning"],

	intelligenceUnit: ["mind", "insight", "brain", "game", "story", "simulation", "system", "future", "invention"],
	intelligenceSingle: ["the #intelligenceUnit#", "#commodityIntelligence#"],
	intelligence: ["#intelligenceUnit#", "#commodityIntelligence#"],
	intelligencePlural: ["#intelligenceUnit.s#", "#commodityIntelligence#"],

	labName: ["The #adj.capitalizeAll# #intelligence.capitalizeAll# #studio.capitalizeAll#", "#adj.capitalizeAll# #intelligencePlural.capitalizeAll# #studio.capitalizeAll#", "The #intelligence.capitalizeAll# & #intelligence.capitalizeAll# #studio.capitalizeAll#", "The #studio.capitalizeAll# for #adj.capitalizeAll# #intelligence.s.capitalizeAll#"]
}

var metaskills = ["writing", "chilling", "brainstorming", "researching", "leadership"];
var skills = {
	focus: [],
	content: [],
	approach: [],
	meta: []
};
var allSkills = [];

function addTags(list, type, retag, pluralize) {

	for (var i = 0; i < list.length; i++) {
		var s = list[i];

		var skill = {
			name: s,
			tag: s,
			key: toCamelCase(s),
			type: type
		}

		if (pluralize)
			skill.name += "s";

		allSkills.push(skill);
		skills[type].push(skill);

		if (retag)
			list[i] += "<" + s + ">";
	}
}



var paperTypes = {

	short: {
		name: "short paper",
		insight: "5",
	},
	long: {
		name: "long paper",
		insight: "10",
	},
	journal: {
		name: "journal article",
		insight: "20",
	},
}


var hoursInADay = 10;
var speed = 10;
var insightPerProgress = .01;
var insightRamp = 1.5;

var types = ["content", "focus", "approach"];
addTags(rawGrammar.approach, "approach", true);
addTags(rawGrammar.genre, "focus", true, true);
addTags(rawGrammar.game, "focus", true);
addTags(rawGrammar.content, "content", true);

addTags(metaskills, "meta");
skills.nonMeta = [].concat.apply([], [skills.approach, skills.focus, skills.content]);