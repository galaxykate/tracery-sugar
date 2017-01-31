var labCount = 0;


var Lab = Entity.extend({
	init: function() {
		lab = this;

		this.day = 0;
		this.type = "lab";
		this.id = labCount++;
		this.key = this.type + this.id;

		this.sockets = {};

		this.createView();

		this.reroll();

		for (var i = 0; i < 5; i++) {
			this.update();
		}
		this.tick = 0;

	},

	gainPrestige: function(amt) {
		this.prestige += amt;
	},

	getAllResearchersWith: function(meeple) {
		return this.people.filter(function(person) {
			// home location
			return person.meeple.currentLocation === meeple.currentLocation && person.meeple.currentLocationLabel === meeple.currentLocationLabel;
		});
	},

	getPapersAt: function(conf) {
		var papers = this.papers.filter(paper => paper.meeple ? paper.meeple.currentLocation === conf : false);
		return papers;
	},

	removeMeeplesAt: function(entity) {
		for (var i = 0; i < this.people.length; i++) {
			if (this.people[i].meeple && this.people[i].meeple.currentLocation === entity) {
				this.people[i].reset();
			}
		}

		for (var i = 0; i < this.papers.length; i++) {
			if (this.papers[i].meeple && this.papers[i].meeple.currentLocation === entity) {
				this.papers[i].reset();
			}
		}
	},

	setDetails: function() {

		this.removeAll();

		this.announce("A CFP game for <a href='http://www.cig2017.com/'>Computational Intelligence in Games", true);
		this.announce("Deadlines:", true);
		this.announce("Competition and Tutorial Proposals:<b> March 1</b>", true);
		this.announce("Full technical papers: <b>April 4</b>", true);
		this.announce("Competition papers, vision papers and poster papers: <b>May 15</b>", true);

		this.name = grammar.flatten("#labName#");

		this.brainstormProgress = 90;
		this.morale = 50;
		this.prestige = 1;
		this.day = 1;
		for (var i = 0; i < 0; i++) {
			this.ideas.push(new Idea());
			this.projects.push(new Project(this.ideas[i]));

		}

	},


	toJSON: function() {
		var json = {
			prestige: this.prestige,
			day: this.day,
			name: this.name,
			people: this.people.map(p => p.toJSON()),
			ideas: this.ideas.map(p => p.toJSON()),
			projects: this.projects.map(p => p.toJSON()),
			papers: this.papers.map(p => p.toJSON()),
		publications: this.publications.map(p => p.toJSON())
		}
		console.log(json);
		return JSON.stringify(json);
	},

	loadFromJSON: function(s) {
		var lab = this;
		console.log("load " + s);
		if (s !== undefined && s !== null && s !== "undefined") {
			this.removeAll();

			var json = JSON.parse(s);
			console.log(json);

			["name", "prestige", "day"].forEach(key => this[key] = json[key]);
			console.log(this);

			// clear current

			if (json.people)
				this.people = json.people.map(json => new Researcher(json));
			if (json.ideas)
				this.ideas = json.ideas.map(json => new Idea(undefined, json));
			if (json.projects)
				this.projects = json.projects.map(json => new Project(undefined, json));

			this.refreshView();

		}

	},

	removeAll: function() {
		$("#announcements").html("");
		$("#people").html("");
		$("#projects .content").html("");
		$("#whiteboard .content").html("");
		$("#calendar .content").html("");
		$(".meeple").remove();


		console.log("reroll " + this);

		this.papers = [];
		this.people = [];
		this.ideas = [];
		this.projects = [];
		this.publications = [];
	},

	update: function() {
		this.tick++;


		var increment = 1 / hoursInADay;
		this.day += increment;

		if (lab.people.length < 3 + .2 * Math.pow(this.prestige, .2)) {
			lab.people.push(new Researcher());
		}


		$.each(lab.people, function(index, researcher) {
			researcher.update(increment);
		});



		$.each(lab.papers, function(index, paper) {
			paper.update(increment);
		});
		$.each(lab.projects, function(index, project) {
			project.update(increment);
		});

		for (var i = 0; i < lab.publications.length; i++) {
			lab.publications[i].update(increment);
		}


		if (this.publications.length < 5) {
			this.publications.push(new Publication(this.day + 90 + Math.random() * 10));
		}


		this.dayView.update(this.day);

		//		this.moraleView.update(this.morale);
		this.prestigeView.update(this.prestige);

		if (lab.useAutomove)
			this.automove();
		this.publications = this.publications.filter(s => !s.isDeleted);
		this.projects = this.projects.filter(s => !s.isDeleted);
		this.papers = this.papers.filter(s => !s.isDeleted);
		this.people = this.people.filter(s => !s.isDeleted);
		this.ideas = this.ideas.filter(s => !s.isDeleted);
	},

	// Automatically manage the lab
	automove: function() {


		for (var i = 0; i < this.people.length; i++) {
			var p = this.people[i];


			// Make a move, maybe
			if (Math.random() > .8 && p.stress < 50 && p.meeple.currentLocationLabel === "home") {


				// work on a random paper
				var paper = getRandom(this.papers);
				if (paper && Math.random() > .5)
					p.meeple.moveTo(paper, "write");


				var project = getRandom(this.projects);
				if (project && Math.random() > .5)
					p.meeple.moveTo(project, "research");
				else {
					if (Math.random() > .5 && lab.ideas.length < 5)
						p.meeple.moveTo(lab, "brainstorm");
					else
						p.meeple.moveTo(lab, "study");
				}


			}
		}
		for (var i = 0; i < this.papers.length; i++) {


			var p = this.papers[i];

			if (p.meeple && p.meeple.currentLocationLabel === "home" && Math.random() > .99999) {
				//console.log(p + " is idle");


				// find all matching conferences and their expected review score
				var pairings = this.publications.filter(pub => pub.canAccept(p)).map(function(pub) {
					return {
						pub: pub,
						score: (pub.score(p) + 2) * .5 * (pub.quality + 1) - pub.daysRemaining * .09
					}
				});
				if (pairings.length > 0) {
					pairings.sort(function(a, b) {
						return b.score - a.score;
					});
					p.meeple.moveTo(pairings[0].pub, "review");
				}
			}


		}


	},


	createView: function() {

		this.view = createViewDiv($("#lab-data"), "researcher", this, true);

		this.view.name = $("<div/>", {
			class: "name dataelem",
			contenteditable: true,
		}).appendTo(this.view.top).keyup(function() {

			lab.announce(" is renamed " + inQuotes(lab.view.name.html()));
			lab.name = lab.view.name.html();
		});


		this.view.stats = $("<div/>", {
			class: "people-stats",

		}).appendTo(this.view.top);

		this.view.announcements = $("<div/>", {
			class: "announcements",

		}).appendTo(this.view.center);

		this.dayView = new ValueView(this.view.stats, "day", true);

		//this.moraleView = new ValueView(this.view.stats, "morale", true);
		this.prestigeView = new ValueView(this.view.stats, "prestige", true);

		this.view.reset = $("<button/>", {
			class: "reset",
			html: "X"
		}).appendTo(this.view.top).click(function() {
			var settings = {
				onYes: function() {
					lab.reroll();
				},
				onNo: function() {
					console.log("Cancel");
				}
			};

			popup(function(div) {

				div.append("Restart? You will lose all progress and students")
			}, settings);
		});

		this.view.bottom.css({
			textAlign: "center"
		})

		this.view.socketHolder.remove();

		this.sockets.brainstorm = new Socket(this, {
			type: "researcher",
			label: "brainstorm",
			minWidth: 100,
			minHeight: 30,
			showLabel: true,
			holder: this.view.bottom
		});
		this.sockets.study = new Socket(this, {
			type: "researcher",
			label: "study",
			minWidth: 100,
			minHeight: 30,
			showLabel: true,
			holder: this.view.bottom
		});


	},
	refreshView: function() {
		this.view.name.html(this.name);

		this.dayView.update(this.day);
		this.prestigeView.update(this.prestige);
	}
});