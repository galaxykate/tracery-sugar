var entityCount = 0;
var Entity = Class.extend({

	init: function(type) {
		this.id = entityCount++;
		this.type = type;
		this.key = type + this.id;
		this.activeResearchers = [];

	},



	addResearcher: function(r) {
		this.activeResearchers.push(r);
		r.atEntity = this;
	},

	removeResearcher: function(r) {
		this.activeResearchers = this.activeResearchers.filter(function(r2) {
			return r2 != r;
		});
		r.atEntity = undefined;
	},

	removeAllResearchers: function(r) {
		$.each(this.activeResearchers, function(index, researcher) {
			researcher.moveTo();
		});
	},

	addButtons: function() {
		var entity = this;
		var buttons = $("<div/>", {}).appendTo(this.actionDiv);

		this.rerollButton = $("<button/>", {
			class: "entity-reroll",
			html: "🎲"
		}).appendTo(buttons).click(function() {
			entity.reroll();
			entity.refreshView();

		});

		this.deleteButton = $("<button/>", {
			class: "entity-delete",
			html: "X"
		}).appendTo(buttons).click(function() {
			entity.div.remove();
		});
	},

	refreshView: function() {
		this.socketColumn.html("");
		this.actionDiv.html("");
		this.infoDiv.html("");
		this.tagDiv.html("");
		this.statDiv.html("");
		this.fillView();
	},


	checkProgress: function() {
		if (!this.isCompleted) {

			this.progress = Math.min(this.progress, this.max);

			// On completion
			if (this.progress >= this.max) {
				console.log("COMPLETED");
				this.contentDiv.addClass("completed");
				this.isCompleted = true;
				this.removeAllResearchers();

				if (this.onComplete)
					this.onComplete();

			}

			this.completionBar.update(this.progress, this.rate);
			this.rate = 0;
		}
	},


	gainProgress: function(count) {
		if (this.onGainProgress)
			this.onGainProgress(count)

		this.rate += count;
		this.progress += count;
		this.progress = Math.min(this.progress, this.max);
	},


	createView: function(holder) {

		this.div = $("<div/>", {
			class: "idle-entity entity-" + this.type,
			id: this.type + this.id

		}).appendTo(holder);



		this.contentDiv = $("<div/>", {
			class: "idle-content",

		}).appendTo(this.div);

		this.infoDiv = $("<div/>", {
			class: "idle-info",
		}).appendTo(this.contentDiv);

		this.tagDiv = $("<div/>", {
			class: "idle-tags",
		}).appendTo(this.contentDiv);

		this.statDiv = $("<div/>", {
			class: "idle-stat",
		}).appendTo(this.contentDiv);

		this.actionDiv = $("<div/>", {
			class: "idle-action"
		}).appendTo(this.div);


		if (this.socketLeft) {
			this.socketColumn = $("<div/>", {
				class: "idle-socketHolder"

			}).prependTo(this.div);
		} else {
			this.socketColumn = $("<div/>", {
				class: "idle-socketHolder"

			}).appendTo(this.div);
		}


		this.updateTagDiv();
		this.fillView();
	},

	updateTagDiv: function() {

		this.tagDiv.html("");
		if (this.tags) {
			$.each(this.tags, function(index, tag) {
				$("<div/>", {
					class: "entity-tag",
					html: tag
				}).appendTo(this.tagDiv);
			});
		}
	},


});

var World = Entity.extend({
	init: function() {
		this._super("world");


		this.startDate = Date.now();
		this.day = 0;
		this.hour = 1110;

		this.stacks = {};
		this.stackHolder = $("<div/>", {
			class: "idle-stacks"
		}).appendTo($("#world"));

		this.labDiv = $("<div/>", {
			id: "lab",
		}).appendTo($("#panel-researchers .panel-content"));
		this.labHeader = $("<div/>", {
			id: "labheader",
		}).appendTo(this.labDiv);


		this.nameDiv = $("<div/>", {
			id: "lab-name",
			html: grammar.flatten("#labName#"),
			contenteditable: true
		}).appendTo(this.labHeader).change(function() {
			// TODO store
		});

this.reputation = 0;
		this.reputationDiv = new ValueView(this.labHeader, "reputation");


		this.date = $("<div/>", {
			id: "date",
			class: "minitext",
		}).appendTo(this.labHeader);

		this.labStats = $("<div/>", {
			id: "lab-stats",
		}).appendTo(this.labDiv);

		this.sockets = $("<div/>", {
			id: "lab-sockets",
		}).appendTo(this.labDiv);


		this.learningSocket = createSocket(this.sockets, "learning", this, true, 140, 40);
		this.brainstormingSocket = createSocket(this.sockets, "brainstorming", this, true, 140, 40);

		this.researcherDiv = $("<div/>", {
			id: "researchers",
		}).appendTo(this.labDiv);

		this.confHolder = $("<div/>", {
			id: "confs",
		}).appendTo(this.labDiv);
		this.confHolder.css({
			"height": "60px"
		});
		//}).appendTo($("#panel-calendar .panel-content"));



		this.createStack("ideas", {
			type: "idea",
			generator: Idea,
			holder: $("#panel-ideas .panel-content")
		});

		this.createStack("projects", {
			type: "idea",
			generator: Idea,
			holder: $("#panel-ideas .panel-content")
		});

		this.createStack("papers", {
			type: "idea",
			generator: Idea,
			holder: $("#panel-ideas .panel-content")
		});

		this.createStack("researchers", {
			type: "researcher",
			generator: Researcher,
			holder: $("#researchers")
		});



		this.conferences = [];



		for (var i = 0; i < 30; i++) {
			var type = getRandom(["journal", "conf"]);
			var name = grammar.flatten("#" + type + "#");


			var conf = {
				key: "conf" + i,
				day: Math.floor(Math.random() * 365),
				name: name,
				type: type,
				quality: Math.floor(Math.random() * 5)

			};

			conf.stars = "";

			for (var j = 1; j < conf.quality; j++) {
				conf.stars += "★";
			}
			if (name.length > 18) {
				conf.acronym = createAcronym(name);
			}

			this.conferences.push(conf);
		}
		this.conferences.sort(function(a, b) {
			return a.day - b.day;
		});

		console.log(this.conferences);

		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);



		for (var i = 0; i < 1; i++) {
			var idea = this.generateIdea();
			var project = this.upgradeToProject(idea);

		}
		var paper = this.generatePaper(project, paperTypes.long, Math.random() * 100);
		paper.gainProgress(4000);
		var paper = this.generatePaper(project, paperTypes.long, Math.random() * 100);
		paper.gainProgress(4000);
		var paper = this.generatePaper(project, paperTypes.long, Math.random() * 100);
		paper.gainProgress(4000);

		this.reputationDiv.update(this.reputation);
	},

	dayToOutputDate: function(day) {
		var monthNames = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
		var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

		var dat = new Date(this.startDate);
		dat.setDate(dat.getDate() + day);

		//return dayNames[dat.getDay()] + " " + monthNames[dat.getMonth()] + " " + dat.getDate() + ", " + dat.getFullYear();
		return (dat.toLocaleDateString());


	},
	addCredit: function(conf, paper) {
		var reputation = conf.quality;
		this.reputation += reputation;
		this.reputationDiv.update(this.reputation )
	},

	// Papers require 
	generatePaper: function(project, type, insightPct) {

		var paper = new Paper(project, type, insightPct);
		this.stacks.papers.add(paper);
		return paper;
	},

	upgradeToProject: function(idea) {
		if (!idea.used) {
			idea.used = true;
			var project = new Project(idea);
			this.stacks.projects.add(project);

			idea.nameDiv.css({
				"text-decoration": "underline"
			});

			idea.upgradeToProjectButton.remove();
			return project;


		}
	},

	// Get an idea that has different kinds of stuff
	generateIdea: function(researchers) {

		var allTags = {
			content: [getRandom(skills.content)],
			focus: [getRandom(skills.focus)],
			approach: [getRandom(skills.approach)],
		};

		this.stacks.researchers.content.map(function(researcher) {
			var s = researcher.getNonMetaSkills();
			for (var i = 0; i < s.length; i++) {
				var s2 = s[i];

				allTags[s2.type].push(s2);

			}
		});

		var set = {
			focus: getRandom(allTags.focus),
			approach: getRandom(allTags.approach),
			content: getRandom(allTags.content),
		};

		// select n;
		var idea = new Idea(set);
		this.stacks.ideas.add(idea);
		return idea;
	},


	updateConfSchedule: function() {
		$("#date").html(this.dayToOutputDate(this.day));

		// Update conference schedule

		for (var i = 0; i < this.conferences.length; i++) {
			var conf = this.conferences[i];

			conf.daysTill = conf.day - this.day;
			if (conf.daysTill > 0) {
				var s = conf.stars + conf.name;
				if (conf.acronym)
					s = s + " (" + conf.acronym + ")";


				if (conf.daysTill < 90) {
					s += " (" + conf.daysTill + " days)";
				}

				var urgency = Math.floor(Math.pow(conf.daysTill, 1.1) * .038);
				//console.log(conf.daysTill + " " + urgency);
				if (!conf.div) {
					conf.div = $("<div/>", {
						class: "conf conf-" + conf.type,


					}).appendTo(this.confHolder);
				}

				if (urgency < 3) {
					conf.div.removeClass();
					conf.div.addClass("conf urgency" + urgency + " conf-" + conf.type)
				}
				conf.div.html("<div>" + s + "<div></div>" + "</div>");

			} else {
				if (conf.div) {
					conf.div.remove();
				}
			}

		}
	},

	tick: function() {
		this.hour++;
		if (this.hour >= hoursInADay) {
			this.hour = 0;
			this.day++;

			this.updateConfSchedule();
		}



		$.each(this.stacks.researchers.content, function(index, researcher) {
			researcher.tick();
		});

		$.each(this.stacks.projects.content, function(index, project) {
			project.tick();
		});


		$.each(this.stacks.papers.content, function(index, paper) {
			paper.tick();
		});



		// For each student, add work to a research project

		// Promote idea to research projects

		// Promote project to paper

	},

	createStack: function(key, settings) {
		this.stacks[key] = new Stack(key, settings);
		this.stacks[key].createView();
	},

	updateView: function() {
		$.each(this.stacks, function(key, stack) {
			if (stack.needsUpdate)
				stack.updateView();
		});
	}
});

var Stack = Class.extend({
	init: function(key, settings) {
		this.key = key;
		this.needsUpdate = true;
		this.count = 0;
		$.extend(this, settings);
		this.content = [];
	},



	generate: function(level) {
		var s = new this.generator(level);
		return s;
	},

	add: function(s) {
		if (!isNaN(s))
			s = this.generate(s);
		this.content.push(s);
		s.createView(this.contentDiv);
	},


	updateView: function() {


	},



	createView: function() {
		this.div = $("<div/>", {
			class: "idle-stack",
			id: "stack-" + this.key,
		}).appendTo(this.holder);

		this.headerDiv = $("<div/>", {
			class: "idle-stackheader"
		}).appendTo(this.div);

		this.labelDiv = $("<div/>", {
			class: "idle-stacklabel",
			html: this.key,

		}).appendTo(this.headerDiv);

		this.valueDiv = $("<div/>", {
			class: "idle-stackvalue"
		}).appendTo(this.headerDiv);



		this.contentDiv = $("<div/>", {
			class: "idle-stackcontent"

		}).appendTo(this.div);
	}
});