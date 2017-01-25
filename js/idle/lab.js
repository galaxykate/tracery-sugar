var labCount = 0;


var Lab = Entity.extend({
	init: function() {
		lab = this;

		this.day = 0;
		this.type = "lab";
		this.id = labCount++;
		this.key = this.type + this.id;

		this.sockets = {};


		this.papers = [];
		this.people = [];
		this.ideas = [];
		this.projects = [];
		this.publications = [];


		this.createView();
		this.reroll();
		this.update();
	},

	getAllResearchersWith: function(meeple) {
		return this.people.filter(function(person) {
			// home location
			return person.meeple.currentLocation === meeple.currentLocation && person.meeple.currentLocationLabel === meeple.currentLocationLabel;
		});
	},

	getPapersAt: function(conf) {
		var papers = this.papers.filter(paper => paper.meeple.currentLocation === conf);
		console.log(papers);
		return papers;
	},

	removeMeeplesAt: function(entity) {
		for (var i = 0; i < this.people.length; i++) {
			if (this.people[i].meeple.currentLocation === entity) {
				this.people[i].reset();
			}
		}

		for (var i = 0; i < this.papers.length; i++) {
			if (this.papers[i].meeple.currentLocation === entity) {
				this.papers[i].reset();
			}
		}
	},

	setDetails: function() {

		this.announce("A CFP game for <a href='http://www.cig2017.com/'>Computational Intelligence in Games", true);
		this.announce("Deadlines:", true);
		this.announce("Competition and Tutorial Proposals:<b> March 1</b>", true);
		this.announce("Full technical papers: <b>April 4</b>", true);
		this.announce("Competition papers, vision papers and poster papers: <b>May 15</b>", true);

		this.name = grammar.flatten("#labName#");
		this.view.name.html(this.name);
		this.brainstormProgress = 90;
		this.morale = 50;
		this.prestige = 1;
		this.day = 1;

		for (var i = 0; i < 5; i++) {
			this.ideas.push(new Idea([]));
		}
		for (var i = 0; i < 5; i++) {
			this.projects.push(new Project(getRandom(this.ideas)));
		}

		for (var i = 0; i < 5; i++) {
			this.publications.push(new Publication(i * 20 + Math.random() * 10 + 10));
		}


	},

	update: function() {
		console.log("update " + this.day);
		var increment = 1 / hoursInADay;
		this.day += increment;



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
			this.publications.push(new Publication(this.day + 60));
		}


		if (this.day < 3) {
			console.log("send out papers");

			for (var i = 0; i < this.papers.length; i++) {

				this.papers[i].meeple.moveTo(this.publications[0], "review");
			}

		}
		this.dayView.update(this.day);

		this.moraleView.update(this.morale);
		this.prestigeView.update(this.prestige);
	},


	createView: function() {
		var lab = this;

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

		this.moraleView = new ValueView(this.view.stats, "morale", true);
		this.prestigeView = new ValueView(this.view.stats, "prestige", true);



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
	}
});