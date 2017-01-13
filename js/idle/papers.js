var Idea = Entity.extend({
	init: function() {

		this._super("idea");
		var node = grammar.expand("#paper#");
		this.tags = node.tags;
		this.name = node.finished;

	},
	fillView: function() {
		this.iconDiv.append("<img width='100%' src='css/img/paper-01.png'/>");

		this.nameDiv = $("<div/>", {
			class: "entity-name",
			html: this.name
		}).appendTo(this.contentDiv);


		var tagDiv = $("<div/>", {
			class: "entity-tags",

		}).appendTo(this.actionDiv);

		$.each(this.tags, function(index, tag) {
			$("<div/>", {
				class: "entity-tag",
				html: tag
			}).appendTo(tagDiv);


		});
	}
});

var Researcher = Entity.extend({
	init: function() {
		console.log("make researcher");

		this._super("researcher");

		this.name = grammar.flatten("#firstName# #lastName#");
		this.flavor = grammar.flatten("#personFlavor#");
		this.skills = {};
		for (var i = 0; i < 5; i++) {
			this.trainSkill();
		}
	},


	trainSkill: function() {


		var skill = "";
		if (Math.random() > .5) {
			skill = getRandom(metaskills);
		} else {
			skill = getRandom(skills);
		}


		var skillNames = Object.keys(this.skills);
		if (Math.random() * skillNames.length > .7) {
			skill = getRandom(skillNames);
		}

		if (!this.skills[skill]) {
			this.skills[skill] = 0;
		}



		this.skills[skill]++;

	},

	fillView: function() {
		this.iconDiv.append("<img width='100%' src='css/img/meeple.png'/>");


		this.nameDiv = $("<div/>", {
			class: "entity-name",
			html: this.name
		}).appendTo(this.contentDiv);

		this.flavorDiv = $("<div/>", {
			class: "entity-flavor",
			html: this.flavor
		}).appendTo(this.contentDiv);

		var skillDiv = $("<div/>", {
			class: "entity-skills",
			html: "skills:"
		}).appendTo(this.actionDiv);

		$.each(this.skills, function(skill, value) {
			$("<div/>", {
				class: "entity-tag",
				html: skill + ":" + value
			}).appendTo(skillDiv);


		});
		// Actions
	}
});