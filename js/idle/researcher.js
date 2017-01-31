var researcherCount = 0;

var Researcher = Entity.extend({
	init: function(json) {

		this.type = "researcher";
		this.id = researcherCount++;
		this.key = this.type + this.id;

		this.hue = Math.random() * 360;
		this.sockets = {};
		this.skills = {};
		this.createView();

		if (json)
			this.loadFromJSON(json);
		else {
			this.reroll();
		}



		this.announce(" has joined the lab");

	},

	loadFromJSON: function(json) {
		var researcher = this;
		var values = ["progress", "timeInDept", "name", "hue", "flavor", "studyProgress", "level", "stress"];
		values.forEach(key => this[key] = json[key]);

		if (json.skills)
			$.each(json.skills, function(key, val) {
				researcher.skills[key] = {
					level: val,
					tag: skillsByKey[key]
				}
			});

		this.refreshView();
		this.updateSkillView();
	},

	toJSON: function() {
		var values = ["progress", "timeInDept", "name", "hue", "flavor", "studyProgress", "level", "stress"];
		var json = {
			skills: {}
		};

		$.each(this.skills, function(key, val) {
			json.skills[key] = val.level
		});

		values.forEach(key => json[key] = this[key]);
		return json;
	},

	remove: function() {
		var researcher = this;
		this.isDeleted = true;
		this.view.animate({
			opacity: .5,
			pointerEvents: "none"
		});
		this.reset();
		setTimeout(function() {
			researcher.meeple.remove();
			researcher.view.slideUp();

		}, 600);

	},

	setDetails: function() {
		this.view.tags.html("");
		this.flavor = grammar.flatten("#personFlavor#");

		this.studyProgress = 0;

		this.stress = Math.random() * 100;
		this.timeInDept = Math.random() * 10;
		this.progress = 10;


		this.skills = {};
		this.name = grammar.flatten("#firstName#") + " " + grammar.flatten("#lastName#");
		this.view.name.html(this.name);

		for (var i = 0; i < 5; i++) {
			this.gainSkill();
		}
	},

	update: function(increment) {

		this._super(increment);

		this.timeInDept += increment;



		// self preservation

		if (this.meeple.currentLocationLabel !== "home" && this.stress > (70 + 20 * Math.random()) && Math.random() > .9) {
			this.announce(" is too stressed to work and has gone home to rest");
			this.reset();
		}

		// Do work
		var bonus = 1;

		var neighbors = lab.getAllResearchersWith(this.meeple);
		var leaderBonus = 1;
		for (var i = 0; i < neighbors.length; i++) {

			if (neighbors[i].skills.leadership && this !== neighbors[i])
				leaderBonus += neighbors[i].skills.leadership.level;
		}

		if (this.meeple.currentLocationLabel !== "home") {
			this.stress += tuning.stress * increment;

			if (this.stress > 100) {
				this.announce(" has dropped out of the department from stress");

				this.remove();
			}
		}

		//console.log(this.progress);
		if (this.progress / this.timeInDept < .1 && this.timeInDept > 20) {

			this.announce(" has dropped out of the department from frustration");
			this.remove();
		}



		switch (this.meeple.currentLocationLabel) {
			case "home":
				if (this.skills.chilling)
					bonus += this.skills.chilling.level;
				this.stress = Math.max(0, this.stress - bonus * increment * tuning.chilling);



				break;

			case "study":
				if (this.skills.learning)
					bonus += this.skills.learning.level;
				this.progress += bonus * increment;


				this.studyProgress += bonus * increment * Math.random() * tuning.studying * leaderBonus;

				if (this.studyProgress > 15) {
					this.studyProgress = 0;
					this.gainSkill(true);
					this.meeple.jump(1.5);


				}
				break;
			case "research":
				if (this.skills.researching)
					bonus += this.skills.researching.level;
				var project = this.meeple.currentLocation;

				var skillBonus = 1;
				for (var i = 0; i < project.tags.length; i++) {
					var skill = this.skills[project.tags[i].key];
					if (skill)
						skillBonus += skill.level;
				}


				project.addProgress(bonus * increment * tuning.researching * skillBonus * leaderBonus, this);
				break;

			case "brainstorm":
				if (this.skills.brainstorming)
					bonus += this.skills.brainstorming.level;
				lab.brainstormProgress += bonus * tuning.brainstorming * leaderBonus;

				if (lab.brainstormProgress > 100) {
					lab.brainstormProgress = Math.random() * 30;
					// Come up with new idea
					var allTags = [].concat.apply([], neighbors.map(s => s.getAllTags(true)));
					lab.ideas.push(new Idea(allTags));
					this.meeple.jump(1.5);


				}
				break;

			case "write":
				if (this.skills.writing)
					bonus += this.skills.writing.level;
				var paper = this.meeple.currentLocation;
				paper.addProgress(bonus * increment * tuning.writing * leaderBonus, this);
				break;
			default:
				console.warn(this.meeple.currentLocationLabel);
				break;
		}

		var rate = 12 / Math.min(bonus, 4);
		if (lab.tick % rate === this.id % rate)
			this.meeple.jump(.5 + .1 * bonus);

		this.stressView.update(this.stress);
		this.timeView.update(this.timeInDept);
		this.progressView.update(this.progress);

	},



	getAllTags: function(ignoreMeta) {
		var tags = [];
		$.each(this.skills, function(key, skill) {
			if (!ignoreMeta || skill.type !== "meta")
				tags.push(skill.tag);
		});

		return tags;
	},


	setActivity: function(activity) {
		this.view.activity.html(activity);
	},

	gainSkill: function() {
		var currentSkills = Object.keys(this.skills);
		var key;

		var v = Math.pow(Math.random(), 3) * 5;
		if (v < currentSkills.length) {
			var key = getRandom(currentSkills);
			this.skills[key].level++;
		} else {

			var tag = getRandom(allSkills);
			if (Math.random() > .5)
				tag = getRandom(skills.meta);

			var key = tag.key;
			if (this.skills[key]) {
				this.skills[key].level++;
			} else {
				this.skills[key] = {
					tag: tag,
					level: 1
				};
			}

		}


		this.updateSkillView();
	},

	updateSkillView: function() {
		var researcher = this;


		$.each(this.skills, function(key, skill) {
			var tag = skill.tag;
			if (!skill.div) {
				skill.div = $("<div/>", {
					html: skill.tag.name,
					class: "tag" + " tag-" + key + " tag-" + tag.type
				}).appendTo(researcher.view.tags).click(function() {

					selectTagGroup(tag.key);

					event.stopPropagation();
				});
			}
			skill.div.html(tag.name + ": " + skill.level);

		});


	},

	createView: function() {
		var researcher = this;

		this.view = createViewDiv($("#people"), "researcher", this, true);

		this.view.name = $("<div/>", {
			class: "name dataelem"
		}).appendTo(this.view.top);

		this.view.activity = $("<div/>", {
			class: "activity minitext dataelem",
			html: "chilling"
		}).appendTo(this.view.top);

		this.view.reroll = $("<button/>", {
			class: "reroll-button",
			html: "🎲"
		}).appendTo(this.view.top).click(function() {
			researcher.reroll();
			event.stopPropagation();
		}).dblclick(function() {
			researcher.reroll();
			event.stopPropagation();
		});



		this.view.tags = $("<div/>", {
			class: "tags",

		}).appendTo(this.view.center);

		this.view.details = $("<div/>", {
			class: "details",

		}).appendTo(this.view.bottom);

		this.view.life = $("<div/>", {
			class: "life",
		}).appendTo(this.view.bottom);
		this.view.bottom.css({
			flexDirection: "column"
		})
		this.view.stats = $("<div/>", {
			class: "people-stats",

		}).appendTo(this.view.bottom);
		this.stressView = new ValueView(this.view.stats, "stress", true);
		this.timeView = new ValueView(this.view.stats, "timeInDept", true);
		this.progressView = new ValueView(this.view.stats, "progress", true);

		this.sockets.home = new Socket(this, {
			label: "home",
			type: "researcher",
			isHomeSocket: true
		});

		this.meeple = new Meeple(this, "");

	},
	refreshView: function() {

		this.view.name.html(this.name);
		this.view.details.html(this.flavor);
	},

	toString: function() {
		return this.name;
	}
});

function toSpan(s) {
	var color = "hsl(" + Math.random() * 360 + ",50%, 50%)";
	if (s.hue)
		color = "hsl(" + s.hue + ",80%, 40%)";
	return "<span style='color:" + color + "' class='entityspan entityspan-" + s.type + "'>" + s.name + "</span>";
}