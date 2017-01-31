var paperCount = 0;

var Paper = Entity.extend({
	init: function(project, type, quality, json) {

		this.type = "paper";
		this.paperType = type;
		this.id = paperCount++;
		this.key = this.type + this.id;
		this.project = project;
		this.sockets = {};
		this.hue = Math.random() * 360;
		this.quality = quality;
		this.createView();
		this.reroll();


	},

	loadFromJSON: function(json) {
		var values = ["hue", "name"];
		values.forEach(key => this[key] = json[key]);

		if (json.tags)
			this.tags = json.tags.map(key => skillsByKey[key]);

		this.refreshView();
		this.updateSkillView();
	},

	toJSON: function() {
		var values = ["progress", "timeInDept", "name", "hue", "flavor", "studyProgress", "level", "stress"];
		var json = {
			tags: this.map(tag => tag.key)
		};
		values.forEach(key => json[key] = this[key]);

		return json;
	},


	setDetails: function() {
		this.citations = 0;
		this.isPublished = false;
		var node = generateWithOverrides("paper", this.project.set, {
			codeName: this.project.codeName
		});

		var type = getRandom(types);
		this.name = node.finished;
		this.tags = this.getTagObjects(node.tags);

		this.size = this.paperType.length;
	

	},


	setActivity: function(activity, target) {
		if (activity === "review") {
			this.announce(" submitted to " + target.nickname);
		}
		this.view.activity.html(activity);
	},

	completeDraft: function() {

		this.sockets.home = new Socket(this, {
			label: "home",
			type: "paper",
			isHomeSocket: true,
		});
		this.meeple = new Meeple(this, "");
	},

	perfectDraft: function() {
		lab.removeMeeplesAt(this);
		this.sockets.write.remove();
	},

	addProgress: function(amt) {
		this.tickProgress += amt;
		if (this.isComplete) {
			this.polish += amt;
		} else {
			this.progress += amt;
		}
	},

	publish: function(pub) {
		this.isPublished = true;
		this.sockets.write.remove();
		this.sockets.home.remove();
		this.meeple.remove();
		this.view.publication.html(" published in " + toSpan(pub));
		this.setActivity("published");
	},

	update: function(increment) {
		this._super(increment);
		if (this.isPublished) {
			if (Math.random() > .99)
				this.getCitation();
		}
	},

	getCitation: function() {
		this.citations++;
		this.announce(" has been cited");
		lab.gainPrestige(Math.ceil(this.size * .01));

		this.view.publication.html("citations: " + this.citationCount);
	},

	createView: function() {
		var paper = this;
		this.view = createViewDiv(this.project.view.papers, "paper", this);

		this.makeDragDeletable();


		this.view.name = $("<div/>", {
			class: "name dataelem"
		}).appendTo(this.view.top);


		this.view.publication = $("<div/>", {
			class: "paper-stat"
		}).appendTo(this.view.center);

		this.view.citations = $("<div/>", {
			class: "paper-stat"
		}).appendTo(this.view.center);


		this.view.reroll = $("<button/>", {
			class: "reroll-button",
			html: "🎲"
		}).appendTo(this.view.top).click(function() {
			paper.reroll();
			event.stopPropagation();
		}).dblclick(function() {
			paper.reroll();
			event.stopPropagation();
		});

		this.view.paperDetails = $("<div/>", {
			class: "paper-details"
		}).appendTo(this.view.center);


		this.view.progress = $("<span/>", {
			class: "paper-stat"
		}).appendTo(this.view.paperDetails);

		this.view.quality = $("<span/>", {
			class: "paper-stat",

		}).appendTo(this.view.paperDetails);

		this.view.type = $("<span/>", {
			class: "paper-stat"
		}).appendTo(this.view.paperDetails);



		this.view.tags = $("<div/>", {
			class: "tags",
		}).appendTo(this.view.bottom);
		this.view.activity = $("<div/>", {
			html: "unwritten",
			class: "activity dataelem minitext"
		}).appendTo(this.view.bottom);


		this.view.progressHolder = $("<div/>", {}).appendTo(this.view.center);



		this.sockets.write = new Socket(this, {
			label: "write",
			type: "researcher"
		});



	},
	refreshView: function() {
		console.log(this);
		this.view.progressHolder.html("");

		this.progressBar = new ProgressBar(this.view.progressHolder, "progress", this.size);

		this.view.name.html(this.name);
		

			this.view.quality.html(qualityToText[this.quality]);
		this.view.type.html(this.paperType.name + "");

		this.updateTagView();
	},


	detailsToString: function() {
		return this.quality + " " + this.level + " " + this.size + " " + this.tags.map(tag => tag ? tag.key : "");
	},

	toString: function() {
		return inQuotes(this.name);
	}
});