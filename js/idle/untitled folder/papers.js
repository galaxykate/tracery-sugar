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


			world.upgradeToProject(idea);
		});
	},


	toString: function() {
		return this.name;
	}
});


// Quality of a paper
// based on the completion of the project
var Paper = Entity.extend({
	init: function(project, type, completion) {
		this._super("paper");
		this.name = "PAPER";
		this.paperType = type;
		this.project = project;
		this.set = project.set;
		this.conferenceButtons = {};
		this.tags = project.tags;
		console.log("create a paper for ", project, type, completion);
		console.log(this);
		// Completion matters less for shorter papers than longer
		this.quality = Math.round(completion);

		this.reroll();
	},

	submitTo: function(conf) {
		console.log("Submit this to  " + conf);
		this.outForReview = true;
		this.conferenceButtonHolder.hide();
		this.sentToConference = conf;
		this.statusDiv.html("Out for review at " + conf.name);
		this.reviewTimer = 20;

	},
	acceptOrReject: function() {
		var conf = this.sentToConference;
		this.outForReview = false;
		var accept = .04*this.quality * (1 + .3 * Math.random());
		console.log(accept + " " + this.quality);
		if (accept > conf.quality) {
			this.acceptedTo = conf;
			world.addCredit(conf, this);
			this.statusDiv.html("Accepted to " + conf.name + "!");

		} else {

			this.conferenceButtonHolder.show();
			this.statusDiv.html("Rejected from " + conf.name);
		}
	},

	onGainProgress: function(count) {
		//this.gainInsights(count * insightPerProgress);
	},

	updateConferenceButtons: function() {
		var paper = this;
		if (this.isCompleted && !this.outForReview) {

			$.each(world.conferences, function(index, conf) {
				// update or construct
				//	console.log(conf.type, paper.paperType.name);

				var match = (conf.type === "journal" && paper.paperType.name === "journal") || (conf.type !== "journal" && paper.paperType.name !== "journal");
				if (conf.daysTill > 0 && conf.daysTill < 90 && match) {
					// Upcoming confs
					if (!paper.conferenceButtons[conf.key]) {
						var s = conf.name;
						if (conf.acronym)
							s = conf.acronym

						s = conf.stars + s;
						paper.conferenceButtons[conf.key] = $("<button/>", {
							html: s
						}).appendTo(paper.conferenceButtonHolder).click(function() {
							paper.submitTo(conf);
						});
					}
				} else {
					// Past conf
					// remove submission button
					if (paper.conferenceButtons[conf.key]) {
						paper.conferenceButtons[conf.key].remove();
						paper.conferenceButtons[conf.key] = undefined;
					}
				}

			});
		}

		if (this.outForReview) {
			this.reviewTimer--;
			if (this.reviewTimer < 0) {
				this.acceptOrReject();
			}
		}
	},

	onComplete: function() {
		this.completionBar.holder.remove();
		this.statusDiv.html("Completed");

		this.updateConferenceButtons();
	},


	tick: function() {
		this.checkProgress();
		this.updateConferenceButtons();

	},

	fillView: function() {
		var paper = this;

		this.typeDiv = $("<div/>", {
			class: "minitext paper-type paper-" + this.paperType.name,
			html: this.paperType.name
		}).appendTo(this.infoDiv);

		this.nameDiv = $("<div/>", {
			class: "entity-name",
			html: this.name
		}).appendTo(this.infoDiv);


		this.completionBar = new ProgressBar(this.statDiv, "", this.max);


		this.statusDiv = $("<div/>", {
			class: "status",
		}).appendTo(this.statDiv);

		this.socket = createSocket(this.socketColumn, "writing", this);

		this.conferenceButtonHolder = $("<div/>", {
			html: "submit to",
			class: "entity-conferences minitext",
		}).appendTo(this.actionDiv);

		this.insightView = new ValueView(this.statDiv, "quality");
		this.insightView.update(this.quality);

		this.tagDiv.html("");
		$.each(this.tags, function(key, tag) {
			createSkillChip(paper.tagDiv, tag);
		});

		this.addButtons();

	},

	reroll: function() {
		this.isCompleted = false;
		this.outForReview = false;
		this.progress = 0;
		this.rate = 0;
		console.log(this.project);

		this.max = Math.round(10 + 30 * Math.pow(Math.random(), 3)) * 100;

		// Fill out the set

		var overrides = {
			codeName: this.project.codeName
		};
		console.log(this.set);
		for (var i = 0; i < types.length; i++) {

			overrides[types[i]] = this.set[types[i]].name;

		}

		this.removeAllResearchers();
		this.name = grammar.flatten("#paper#", overrides,
			true);
	},
});



var Project = Entity.extend({
	init: function(idea) {
		this._super("project");
		this.idea = idea;


		this.reroll();


	},

	reroll: function() {
		this.isCompleted = false;
		this.progress = 0;
		this.rate = 0;
		this.insights = 0;
		this.max = Math.round(10 + 30 * Math.pow(Math.random(), 3)) * 100;
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

		this.removeAllResearchers();
		console.log(overrides);
		console.log(set);
		this.set = set;

		this.codeName = grammar.flatten("#projectName#", overrides,
			true);

		overrides.codeName = this.codeName;
		this.name = grammar.flatten("#project#", overrides,
			true);


	},

	payInsights: function(count) {
		this.insights -= count;
		this.updateInsightView();
	},

	gainInsights: function(count) {
		this.insights += count;
		this.updateInsightView();
	},


	// button
	updateInsightView: function() {
		var insightCount = this.insights;
		this.insightView.update(this.insights);
		// label buttons with quality
		$.each(this.paperButtons, function(key, button) {
			var type = paperTypes[key];
			var pct = Math.min(Math.floor(100 * insightCount / type.insight), 100);
			button.html(type.name + "(" + Math.floor(insightCount) + "/" + type.insight + ")");
		});
	},

	onComplete: function() {
		this.completionBar.holder.remove();
		var spinoff = $("<button/>", {
			html: "spinoff new project"
		}).appendTo(this.actionDiv);
	},

	onGainProgress: function(count) {
		var pct = this.progress / this.max;
		console.log(pct);
		this.gainInsights(Math.pow(insightRamp, pct * 3) * count * insightPerProgress);
	},

	tick: function() {
		console.log("project tick");
		this.checkProgress();
	},

	fillView: function() {
		var project = this;

		this.nameDiv = $("<div/>", {
			class: "entity-name",
			html: this.name
		}).appendTo(this.infoDiv);

		this.completionBar = new ProgressBar(this.statDiv, "", this.max);
		this.insightView = new ValueView(this.statDiv, "insights");

		this.graph = $("<div/>", {
			class: "entity-difficultyGraph",

		}).appendTo(this.actionDiv);

		this.socket = createSocket(this.socketColumn, "researching", this);


		var paperButtons = $("<div/>", {
			html: "<div class='minitext'>Write a </div>"
		}).appendTo(this.actionDiv);


		this.paperButtons = {};
		$.each(paperTypes, function(typeName, type) {
			project.paperButtons[typeName] = $("<button/>", {
				html: type.name,

			}).appendTo(paperButtons).click(function() {

				// pay the insights
				var insights = Math.min(project.insights, type.insight);
				var insightPct = insights / type.insight;
				project.payInsights(insights);
				world.generatePaper(project, type, insightPct);
			});
		});

		this.addButtons();

		this.tagDiv.html("");
		$.each(this.tags, function(key, tag) {
			createSkillChip(project.tagDiv, tag);
		});
		this.gainProgress(0);
	},


	toString: function() {
		return this.name;
	}
});