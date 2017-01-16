function toSocketID(activity, entity) {
	var key = "socket-" + activity;
	if (entity)
		key = "socket-" + activity + "-" + entity.key;
return key;
} 

function createSocket(holder, activity, entity, label, w, h) {
	var socketID = toSocketID(activity, entity);
	
	var socketHolder = $("<div/>", {
		class: "socket-holder socket-" + activity

	}).appendTo(holder);

	if (label) {
		var socketLabel = $("<div/>", {
			class: "socket-label",
			html: activity
		}).appendTo(socketHolder);
	}

	var socket = $("<div/>", {
		id: socketID,
		class: "idle-socket socket-" + activity

	}).appendTo(socketHolder).droppable({
		activeClass: "idle-socket-highlight",
		hoverClass: "idle-socket-hover",
		accept: ".meeple",
		over: function(event, ui) {
			console.log("Over");
		},

		drop: function() {
			heldResearcher.moveTo(activity, entity, socketID);
			heldResearcher = undefined;
		}
	});

	if (w !== undefined) {
		socket.css({
			"min-width": w,
			"min-height": h
		})
	}
	return socket;
}
var heldResearcher, droppedOnTarget;


var Idea = Entity.extend({
	init: function(set) {
		var idea = this;
		this._super("idea");


		var tags = [];
		this.set = {};
		$.each(set, function(key, val) {
			if (val)
				tags.push(val);
		});

		shuffle(tags);
		if (tags.length > 2) {
			tags = tags.slice(0, 2);
		}


		// Make a grammar with the values
		var rawTags = tags.map(function(s) {
			idea.set[s.type] = s;
			return s.name;
		});

		shuffle(tags);


		console.log(idea.set);

		grammar.setSymbol("a", rawTags[0]);
		grammar.setSymbol("b", rawTags[1]);
		this.name = grammar.flatten("#idea#");

	},



	fillView: function() {
		var idea = this;
		this.nameDiv = $("<div/>", {
			class: "entity-name",
			html: this.name
		}).appendTo(this.infoDiv);

		this.nameDiv.css({
			color: "hsl(" + Math.random() * 360 + ", 50%, 50%)",
			transform: "translate(" + Math.random() * 40 + "px, 0px) rotate(" + (Math.random() * 6 - 3) + "deg)"
		})


		this.upgradeToProjectButton = $("<button/>", {
			html: "▲"
		}).appendTo(this.actionDiv).click(function() {

			idea.nameDiv.css({
				"text-decoration": "underline"
			});
			world.upgradeToProject(idea);
		});
	},


	toString: function() {
		return this.name;
	}
});
var Paper = Entity.extend({
	init: function(project) {
		this._super("paper");

	},

	tick: function() {

	}
});

var Project = Entity.extend({
	init: function(idea) {
		this._super("project");
		this.idea = idea;


		this.reroll();


	},

	reroll: function() {
		this.progress = 0;
		this.rate = 0;
		this.max = Math.round(10 + 30*Math.pow(Math.random(), 3))*100;
		this.graphOffset = Math.random() * 9999;

		// Fill out the set
		var set = {};
		var overrides = {};
		this.tags = [];

		console.log(this.idea.set);
		for (var i = 0; i < types.length; i++) {
			var type = types[i];
			if (!this.idea.set[type]) {
				console.log("missing " + type);
				set[type] = getRandom(skills[type]);
			} else {
				set[type] = this.idea.set[type];
			}
			this.tags.push(set[type]);
			overrides[type] = set[type].name;

		}

		console.log(overrides);
		console.log(set);


		this.name = grammar.flatten("#project#", overrides,
			true);


	},

	tick: function() {
		console.log("project tick");
		this.completionBar.update(this.progress, this.rate);
		this.rate = 0;
	},

	fillView: function() {
		var project = this;

		this.nameDiv = $("<div/>", {
			class: "entity-name",
			html: this.name
		}).appendTo(this.infoDiv);

		this.completionBar = new ProgressBar(this.actionDiv, "", this.max);

		this.graph = $("<div/>", {
			class: "entity-difficultyGraph",

		}).appendTo(this.actionDiv);

		this.socket = createSocket(this.socketColumn, "researching", this);


		this.rerollButton = $("<button/>", {
			class: "entity-reroll",
			html: "🎲"
		}).appendTo(this.actionDiv).click(function() {
			project.reroll();
			project.refreshView();

		});


		this.tagDiv.html("");
		$.each(this.tags, function(key, tag) {
			console.log(tag);
			createSkillChip(project.tagDiv, tag);
		});
	},


	toString: function() {
		return this.name;
	}
});