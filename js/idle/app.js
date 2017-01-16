var paused = false;
var time = {
	current: 0,
	elapsed: .1,
	startTime: Date.now() * .001,
	step: 0
};


var grammar;
var world;

function tick() {
	//console.log("tick " + time.step);
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
	new Panel("ideas", $("#panel-holder"));
	new Panel("projects", $("#panel-holder"));
	new Panel("researchers", $("#panel-holder"));
	new Panel("calendar", $("#panel-holder"));


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
	grammar = tracery.createGrammar(rawGrammar, true);
	grammar.modifiers.acronym = function(s) {
		if (s.length < 5)
			return s;

		var s2 = s.split(" ");

		var s3 = s2.map(function(s4) {
			var ignore = ["in an on the with of"];
			if (ignore.indexOf(s4) >= 0)
				return "";
			var prefixes = "tree graph char gen nav map dev sys int soc rel RPG MMO topo land".split(" ");
			for (var i = 0; i < prefixes.length; i++) {

			}

			var s5 = s4.charAt(0).toUpperCase();
			if (Math.random() > .6) {

				s5 += s4.charAt(1);
				if (Math.random() > .6)
					s5 += s4.charAt(2);
			}

			return s5;
		}).join("");
		
		return s3;
	}
	grammar.openTag = "<";
	grammar.closeTag = ">";


	world = new World();


	setInterval(function() {
		if (!paused) {
			tick();
			updateView();
		}
	}, 400);



});