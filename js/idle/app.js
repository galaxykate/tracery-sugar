var paused = true;
var time = {
	current: 0,
	elapsed: .1,
	startTime: Date.now() * .001,
	step: 0
};


var grammar;
var world;

function tick() {
	console.log("tick " + time.step);
	time.step += 1;
	output("step: " + time.step);
	world.tick();
}


function output(s) {
	var outputHolder = $("#output");
	outputHolder.append("<div class='output-line'>" + s + "</div>");
	// scroll
}

function updateView() {
	console.log("update view");
	world.updateView();
}


function generate(type, parts) {
	console.log("generate a " + type);
	var s = grammar.expand("#" + type + "#");
	console.log(s.tags);
	console.log(s.finished.split("|"));

}

$(document).ready(function() {
	console.log("start idle game");


	new Panel("output", $("#panel-holder"));
	new Panel("stats", $("#panel-holder"));
	new Panel("controls", $("#panel-holder"));

	var controlHolder = $("#panel-controls .panel-content");

	var statsHolder = $("#panel-stats .panel-content");

	var outputHolder = $("<div>", {
		id: "output"
	}).appendTo($("#panel-output .panel-content"));

	var worldHolder = $("<div/>", {
		id: "world"
	}).appendTo(statsHolder);

	var buttonHolder = $("<div/>", {
		id: "timeButtons"
	}).appendTo(controlHolder);


	var pauseButton = $("<button/>", {
		html: "pause",
	}).appendTo(buttonHolder).click(function() {
		paused = !paused;
		if (paused)
			$(this).html("pause");
		else
			$(this).html("unpause")

	});

	var sim0 = $("<button/>", {
		html: "sim 10"
	}).appendTo(buttonHolder).click(function() {
		for (var i = 0; i < 100; i++) {
			tick();
		}
		updateViz();
	});

	var sim1 = $("<button/>", {
		html: "sim 100"
	}).appendTo(buttonHolder).click(function() {
		for (var i = 0; i < 100; i++) {
			tick();
		}
		updateView();
	});

	world = new World();
	grammar = tracery.createGrammar({
		approach: ["genetic algorithm<ga>", "evolutionary algorithm<ga>", "new approach", "framework<frameworks>"],
		problem: ["optimization", "player modelling", "difficulty adjustment"],
		genre: ["slot machines<gambling>", "MMOs<game><mmo>", "first person shooters<fps>", "quest structure<rpg>"],
		idea: ["#approach# for #problem# in #genre#"],
		lastName: ["Wang", "Li", "Harris", "Yonge", "Green", "Lopez", "Walker", "Nelson", "de la Cruz", "Tan", "Kaya", "Hughes", "Dewan", "Devi", "Dehan", "Suzuki", "Kim", "Cho", "Yoon", "Coleman", "Bryant", "Hernandez", "Perry", "Powell", "Schwartz", "Mcbride", "Malhotra", "Sai", "Pai", "Patel", "Ahmed", "Padilla", "Sloan", "Roth", "Key", "Howe", "Sosa", "Rocha"],
		firstName: ["Judy", "Andre", "Alain", "Rafael", "Isabelle", "KayShun, Takumi", "Mehmet", "Misaki", "Aoi", "Fatma", "Emma", "Lukas", "Veeti", "Robin", "Jan", "João", "Sara", "Tanya", "Vanya", "Shay", "Keya", "Kiara", "Hiran", "Iker", "Tereza", "Lea", "Clara", "Matthew", "Michael", "Alexis", "Ana", "Madison", "Julia", "Zhang Wei", "Li Wei", "Zhang Min"],
		student: ["#firstName#|#lastName#|#specialty#"],
	});

	grammar.openTag = "<";
	grammar.closeTag = ">";


	setInterval(function() {
		if (!paused) {
			tick();
			updateView();
		}
	}, 400);

	generate("idea");

});