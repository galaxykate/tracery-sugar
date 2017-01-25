var projectCount = 0;

var Project = Entity.extend({
	init: function(idea) {
		this.idea = idea;
		this.type = "project";
		this.id = projectCount++;
		this.key = this.type + this.id;

		this.hue =idea.hue;
		this.sockets = {};
		this.createView();
		this.reroll();

		this.papers = [];

		this.addProgress(1000);
		
		for (var i = 0; i < 3; i++) {
			var paper = this.createPaper(getRandom(paperTypes),Math.floor(Math.random(3)), 0);
			paper.addProgress(1000);
			
		}
		
	},

	update: function(increment) {

		this.progressBar.update(this.progress, this.tickProgress / increment);
		this.tickProgress = 0;

		if (!this.completed && this.progress > this.projectSize) {
			this.announce("completed");
			// remove any meeples 
			lab.removeMeeplesAt(this);
			this.completed = true;

		}

		this.insightView.update(this.insights);
	},

	addProgress: function(amt) {
		this.tickProgress += amt;
		this.progress += amt;

		this.insights += .01 * amt * (Math.pow(this.progess / this.projectSize), 2);
	},

	setDetails: function() {
		this.progress = 0;
		this.tickProgress = 0;

		this.insights = 0;
		this.completed = false;

		var project = this;
		this.set = {};

		this.projectSize = Math.floor(Math.random() * Math.random() * 20 + 10) * 100;

		$.each(types, function(index, type) {
			if (project.idea.set[type]) {
				project.set[type] = project.idea.set[type];
			} else {
				project.set[type] = getRandom(skills[type]);
			}
			console.log(type  + project.set[type].name + project.set[type].type);

		})



		this.getTagsFromSet();
		this.codeName = generateWithOverrides("codeName", this.set).finished;

		this.name = generateWithOverrides("project", this.set, {
			codeName: this.codeName
		}).finished;
		this.view.name.html(this.name);

	},

	createPaper: function(type, quality, cost) {
		console.log(type, quality);

		var paper = new Paper(this, type, quality);
		paper.addProgress(5000);
		this.papers.push(paper);
		lab.papers.push(paper);

		this.insights -= cost;
		this.insightView.update(this.insights);
		return paper;
	},

	createPaperPopup: function() {
		var project = this;
		var buttonSettings = {

		};

		var qualities = ["slender", "regular", "meaty"];



		$.each(paperTypes, function(index, type) {
			// create small medium large papers for each type
			var quality = 1;
			buttonSettings[type.name] = [];


			function createPaperButton(quality) {
				var cost = type.cost * (1 + .5 * (quality - 1));
				if (project.insights > cost) {
					buttonSettings[type.name].push({
						name: qualities[quality] + " " + type.shortName + "<br>" + cost,
						onClick: function() {
							project.createPaper(type, quality, cost);


						}
					});


				}

			}

			for (var i = 0; i < 3; i++) {
				createPaperButton(i);
			}
			if (buttonSettings[type.name].length === 0) {
				buttonSettings[type.name] = undefined;
			}
		});
		popup(function(div) {
			div.append("Write about " + toSpan(project) + " <div class='minitext'>(" + Math.floor(project.insights) + " insights)</div>");
		}, {
			buttons: buttonSettings
		});


	},

	createView: function() {
		var project = this;

		this.view = createViewDiv($("#projects .content"), "project", this).dblclick(function() {
			project.createPaperPopup();
		});
		
this.view.css({
	backgroundColor: "hsl(" + this.hue + ",50%, 90%)",
	border: "3px solid hsla(" + this.hue + ",50%, 50%, .2)"
})
		this.makeDragDeletable();


		this.view.name = $("<div/>", {
			class: "name dataelem"
		}).appendTo(this.view.top);

		this.view.reroll = $("<button/>", {
			class: "reroll-button",
			html: "🎲"
		}).appendTo(this.view.top).click(function() {
			project.reroll();
			event.stopPropagation();
		}).dblclick(function() {
			project.reroll();
			event.stopPropagation();
		});

		this.view.tags = $("<div/>", {
			class: "tags",
		}).appendTo(this.view.center);
		this.view.actionHolder = $("<div/>", {
			class: "actionHolder",
		}).appendTo(this.view.center);
		this.view.progressHolder = $("<div/>", {}).appendTo(this.view.actionHolder);

		this.insightView = new ValueView(this.view.bottom, "insight", true);
		this.writeButton = $("<button/>", {
			html: "start a publication"
		}).appendTo(this.view.actionHolder).click(function() {
			project.createPaperPopup();
		});



		this.sockets.research = new Socket(this, {
			label: "research",
			type: "researcher"
		});

	},
	refreshView: function() {
		this.view.name.html(this.name);
		this.updateTagView();

		this.view.base.html("");
		this.view.progressHolder.html("");

		this.progressBar = new ProgressBar(this.view.progressHolder, "progress", this.projectSize, true);
		this.view.papers = $("<div/>", {
			class: "papers",
		}).appendTo(this.view.base);
	}
});