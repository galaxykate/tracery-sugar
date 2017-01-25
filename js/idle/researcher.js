var researcherCount = 0;

var Researcher = Entity.extend({
	init: function() {

		this.type = "researcher";
		this.id = researcherCount++;
		this.key = this.type + this.id;

		this.hue = Math.random() * 360;
		this.sockets = {};
		this.skills = {};
		this.createView();
		this.reroll();



		this.announce(" has joined the lab");

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


		this.studyProgress = 0;

		this.stress = Math.random() * 100;
		this.timeInDept = Math.random() * 10;
		this.progress = 10;
		this.progressLevel = 0;

		this.skills = {};
		this.name = grammar.flatten("#firstName#") + " " + grammar.flatten("#lastName#");
		this.view.name.html(this.name);

		for (var i = 0; i < 5; i++) {
			this.gainSkill();
		}
	},

	update: function(increment) {
		this.timeInDept += increment;
		var bonus = 1;

		var neighbors = lab.getAllResearchersWith(this.meeple);

		switch (this.meeple.currentLocationLabel) {
			case "home":
				if (this.skills.chilling)
					bonus += this.skills.chilling.level;
				this.stress = Math.max(0, this.stress - bonus * increment * tuning.chill);
				break;

			case "study":
				if (this.skills.learning)
					bonus += this.skills.learning.level;
				this.progress += bonus * increment;


				this.studyProgress += bonus * increment * Math.random() * tuning.study;

				console.log(this.studyProgress);
				if (this.studyProgress > 100) {
					this.studyProgress = 0;
					this.gainSkill(true);

				}
				break;
			case "research":
				if (this.skills.researching)
					bonus += this.skills.researching.level;
				var project = this.meeple.currentLocation;
				project.addProgress(bonus * increment * tuning.research);
				break;

			case "brainstorm":
				if (this.skills.brainstorming)
					bonus += this.skills.brainstorming.level;
				lab.brainstormProgress += bonus * tuning.brainstorming;

				if (lab.brainstormProgress > 100) {
					lab.brainstormProgress = Math.random() * 30;
					// Come up with new idea
					var allTags = [].concat.apply([], neighbors.map(s => s.getAllTags(true)));
					console.log(allTags);
					lab.ideas.push(new Idea(allTags));

				}
				break;

			case "write":
				if (this.skills.writing)
					bonus += this.skills.writing.level;
				var paper = this.meeple.currentLocation;
				paper.addProgress(bonus * increment * 100);
				break;
			default:
				console.warn(this.meeple.currentLocationLabel);
				break;
		}


		// Advancement
		if (this.progress > progressLevels[this.progressLevel].limit) {
			this.progressLevel++;
			this.announce(" has " + progressLevels[this.progressLevel].announcement);

			if (progressLevels[this.progressLevel].onEnter)
				progressLevels[this.progressLevel].onEnter(this);
		}

		this.stress += increment;
		if (this.stress > 100) {
			this.announce(" has dropped out of the department");
			lab.announce(" morale has gone down due to " + toSpan(this) + "'s departure");
		}

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
		console.log(v);
		if (v < currentSkills.length) {
			var key = getRandom(currentSkills);
			this.skills[key].level++;
		} else {

			var tag = getRandom(allSkills);
			if (Math.random() > .5)
				tag = getRandom(skills.meta);

			var key = tag.key;
			console.log("random skill " + key);
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
			html: grammar.flatten("#personFlavor#")
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


progressLevels = [{
	announcement: "joined the lab",
	limit: 15,
}, {
	announcement: "finished all required classes",
	limit: 30,
}, {
	announcement: "advanced to candidacy",
	limit: 40,
}, {
	announcement: "assembled a dissertation committee",
	limit: 60,
}, {
	announcement: "finished a draft",
	limit: 90,
}, {
	announcement: "scheduled a defense",
	limit: 110,
}, {
	onEnter: function(researcher) {
		researcher.isGraduated = true;
		researcher.name = "Dr. " + researcher.name;
		if (Math.random() > .1) {
			researcher.remove();
		} else {
			researcher.announce(" has joined as a post-doc");
		}
		researcher.refreshView();
	},
	announcement: "graduated",
	limit: 999999999,
}];