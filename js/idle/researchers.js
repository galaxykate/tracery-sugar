function createResearcherIcon(researcher, activity, socketID) {
	console.log("Move to " + activity + " " + socketID);

	//return "<div class='researcher idle-icon'><img width='100%' src='css/img/meeple.png'/><div>";
	var div = $("<div/>", {
		class: "meeple",
		html: "<img width='100%' src='css/img/meeple.png'/>"
	});

	if (socketID)
		div.addClass("meeple-" + researcher.key);
	else
		div.addClass("dragging-meeple dragging-meeple-" + researcher.key);

	if (socketID) {
		div.appendTo($("#" + socketID));
		div.draggable({
			appendTo: $("#drag-overlay"),
			helper: function() {
				return createResearcherIcon(researcher)
			},
			start: function() {
				console.log(activity);

				researcher.removeAll();
				heldResearcher = researcher;
				console.log("Remove " + heldResearcher + " from " + activity);
			},

			stop: function() {


				if (!researcher.atEntity) {
					researcher.moveTo();
				}


			}
		});
	}
	return div;
}

var Researcher = Entity.extend({
	init: function() {
		this.socketLeft = true;

		this._super("researcher");
		this.reroll();

	},

	reroll: function() {
		this.name = grammar.flatten("#firstName# #lastName#");
		this.flavor = grammar.flatten("#personFlavor#");

		this.stress = Math.random() * 50;
		this.ideaProgress = Math.random() * 50;
		this.skillProgress = Math.random() * 50;

		this.skills = {};
		for (var i = 0; i < 5; i++) {
			this.trainSkill();
		}

	},

	getNonMetaSkills: function() {
		var skills = [];
		$.each(this.skills, function(key, skill) {
			if (skill.skill.type !== "meta")
				skills.push(skill.skill);

		});
		return skills;
	},

	getMetaSkills: function() {
		var skills = [];
		$.each(this.skills, function(key, val) {
			if (metaskills.indexOf(key) >= 0) {
				skills.push(key);
			}
		});
		return skills;
	},

	toString: function() {
		return this.name;
	},

	tick: function() {
		var researcher = this;

		var metaBonus = 1;
		metaBonus *= world.speed;
		if (this.skills[this.activity]) {
			metaBonus += this.skills[this.activity].bonus;
		}
		//console.log(this.activity + "" + metaBonus);
		switch (this.activity) {
			case "chilling":
				this.stress = Math.max(this.stress - metaBonus, 0);
				break;

			case "brainstorming":
				this.ideaProgress += metaBonus;
				if (this.ideaProgress > 100) {
					this.ideaProgress = Math.random() * 50;
					world.generateIdea();
					this.flash();
				}
				break;
			case "learning":
				this.skillProgress += metaBonus;
				if (this.skillProgress > 100) {
					this.skillProgress = Math.random() * 50;
					var skill = this.trainSkill();
					this.updateSkillView();
					this.flash(skill);
				}
				break;

			case "researching":

				// increase metabonus with shared tags TODO
				this.atEntity.progress += metaBonus;
				console.log(this.atEntity);
				if (this.atEntity.progress > this.atEntity.max) {
					researcher.moveTo();
				}
				break;
		}
	},
	flash: function(skill) {
		// Color the meeple
		var meepleID = ".meeple-" + this.key;
		$(meepleID).addClass("flash");


		if (skill) {

			console.log(skill);
			var skillDiv = $("#" + this.key).find(".skill-" + skill.skill.key);
			skillDiv.addClass("flash");
			setTimeout(function() {
				skillDiv.removeClass("flash");
			}, 200);

		}
		setTimeout(function() {
			$(meepleID).removeClass("flash");

		}, 200);


	},

	// Upgrade a current skill, or add a new one
	trainSkill: function() {

		var key;
		// Use a current skill
		var skillNames = Object.keys(this.skills);
		if (Math.random() * skillNames.length > .7) {
			key = getRandom(skillNames);
			this.skills[key].bonus++;
		} else {

			// Create a new skill

			if (Math.random() > .5) {
				skill = getRandom(skills.meta);
			} else {
				skill = getRandom(skills.nonMeta);
			}

			key = skill.key;
			if (!this.skills[key]) {
				this.skills[key] = {
					bonus: 0,
					skill: skill
				};
			}

			this.skills[key].bonus++;
		}
		return this.skills[key];
	},

	removeAll: function() {
		$(".meeple-" + this.key).remove();

		this.activity = undefined;
		this.atEntity = undefined;
	},

	moveTo: function(activity, entity) {
		if (!activity) {
			console.log("reset");
			activity = "chilling";
			entity = this;
		}

		var socketID = toSocketID(activity, entity);

		this.removeAll();



		createResearcherIcon(this, "learning", socketID);
		this.activity = activity;
		this.atEntity = entity;

		this.activityDiv.html(activity);
	},


	fillView: function() {
		var researcher = this;

		this.socket = createSocket(this.socketColumn, "chilling", this);


		this.socket.droppable({
			accept: "meeple" + this.key
		});



		this.nameDiv = $("<div/>", {
			class: "entity-name",
			html: this.name
		}).appendTo(this.infoDiv);

		this.flavorDiv = $("<div/>", {
			class: "entity-flavor",
			html: this.flavor
		}).appendTo(this.infoDiv);

		this.activityDiv = $("<div/>", {
			class: "entity-activity",
		}).appendTo(this.infoDiv);



		this.rerollButton = $("<button/>", {
			class: "entity-reroll",
			html: "🎲"
		}).appendTo(this.actionDiv).click(function() {
			console.log(researcher);
			researcher.reroll();
			researcher.refreshView();

		});


		this.moveTo();
		researcher.updateSkillView();
	},


	updateSkillView: function() {
		var researcher = this;
		this.tagDiv.html("");
		$.each(this.skills, function(key, skill) {
			createSkillChip(researcher.tagDiv, skill.skill, skill.bonus);
		});
	}

});

function createSkillChip(holder, skill, value) {

	var div = $("<div/>", {
		class: "skill skill-" + skill.type + " skill-" + skill.key,

	}).appendTo(holder);

	if (value !== undefined) {
		div.html(skill.name + ":" + value);
	} else {
		div.html(skill.name);
	}
}