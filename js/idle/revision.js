var lab, selected, held, dropTarget, dropTargetLabel, tagGroup, paused;

function createAcronym(s) {
	if (s.length < 5)
		return s;

	var s2 = s.split(" ");

	var s3 = s2.map(function(s4) {
		var c = s4.charAt(0);
		if (c >= '0' && c <= '9')
			return "";

		var ignore = "& and in an on the with of".split(" ");
		if (ignore.indexOf(s4) >= 0) {
			return "";
		}

		var prefixes = "tree graph char gen nav map dev sys int soc rel RPG MMO topo land".split(" ");
		for (var i = 0; i < prefixes.length; i++) {
			if (s4.toLowerCase().startsWith(prefixes[i]))
				return prefixes[i].charAt(0).toUpperCase() + prefixes[i].substring(1);
		}

		var s5 = s4.charAt(0).toUpperCase();
		var chance = 1 - Math.pow(.6, s.length * .1);
		if (Math.random() > chance) {

			s5 += s4.charAt(1);
			if (Math.random() > chance)
				s5 += s4.charAt(2);
		}

		return s5;
	}).join("");

	return s3;
}

var grammar = tracery.createGrammar(rawGrammar, true);
grammar.modifiers.acronym = createAcronym;
grammar.openTag = "<";
grammar.closeTag = ">";


function openPanel(id) {
	$(".slidersection").removeClass("open");
	$("#" + id).addClass("open");
}
$(document).ready(function() {



	console.log("HEY");
	$(".slidersection").click(function() {
		$(".slidersection").removeClass("open");
		$(this).addClass("open");
	}).append();

	openPanel("whiteboard");

	/*
		popup(function(div) {
			div.html("You did a thing!");
		});
	*/
	$("#overlay").hide();

	lab = new Lab();


	// Update loop
	setInterval(function() {
		if (!paused) {
			// increment the day
			for (var i = 0; i < updatesPerTick; i++) {
				lab.update(1/hoursInADay);
			}
		}
	}, gameRate);
});

$(window).keypress(function(e) {
	if (e.keyCode === 0 || e.keyCode === 32) {

		paused = !paused;
	}
})


function selectTagGroup(key) {
	$(".tag").removeClass("groupSelected");
	if (tagGroup !== key) {
		tagGroup = key;
		$(".tag-" + key).addClass("groupSelected");
	} else {
		tagGroup = undefined;
	}
}


function popup(fillHtml, settings) {


	var overlay = $("#overlay")
	overlay.show();


	function close() {
		$("#popup-content").html("");
		overlay.hide();
		if (settings.onClose)
			onClose();
	}

	var buttonHolder = $("#popup-buttons");
	buttonHolder.html("");

	if (settings.buttons) {

		$.each(settings.buttons, function(label, buttonSet) {
			if (buttonSet !== undefined) {
				var div = $("<div/>", {
					class: "button-column",
					html: label + "<br>"
				}).appendTo(buttonHolder);

				$.each(buttonSet, function(index, b) {

					var button = $("<button/>", {
						html: b.name
					}).appendTo(div).click(b.onClick);
				});
			}
		});
	}
	if (settings.onYes) {

		var yes = $("<button/>", {
			html: "yes"
		}).appendTo(buttonHolder).click(function() {
			console.log("YES");
			if (settings.onYes)
				settings.onYes();
			close();
		});
		var no = $("<button/>", {
			html: "no"
		}).appendTo($("#popup-buttons")).click(function() {
			console.log("NO");
			if (settings.onNo)
				settings.onNo();
			close();
		});
	}



	if (fillHtml)
		fillHtml($("#popup-content"));


	overlay.click(function() {
		if (settings.onNo)
			settings.onNo();
		close();
	});
}