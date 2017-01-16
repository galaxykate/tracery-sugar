var World = Class.extend({
	init: function() {
		this.speed = 20;
		this.stacks = {};
		this.stackHolder = $("<div/>", {
			class: "idle-stacks"
		}).appendTo($("#world"));

		this.labDiv = $("<div/>", {
			id: "lab",
		}).appendTo($("#panel-researchers .panel-content"));


		this.labName = $("<div/>", {
			id: "lab-name",
			html: grammar.flatten("#labName#"),
			contenteditable: true
		}).appendTo(this.labDiv).change(function() {

		});

		this.labStats = $("<div/>", {
			id: "lab-stats",
		}).appendTo(this.labDiv);


		this.researcherDiv = $("<div/>", {
			id: "researchers",
		}).appendTo($("#panel-researchers .panel-content"));
		this.socket = createSocket(this.labDiv, "learning", this, true, 140, 40);
		this.socket = createSocket(this.labDiv, "brainstorming", this, true, 140, 40);


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

		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
this.stacks.researchers.add(5);
this.stacks.researchers.add(5);



		for (var i = 0; i < 1; i++) {
			var idea = this.generateIdea();
			var project = this.upgradeToProject(idea);
		
		}

	},

	generatePaper: function(project) {
		var paper = new Paper();
		this.stacks.papers.add(paper);
		return paper;
	},

	upgradeToProject: function(idea) {
		if (!idea.used) {
			idea.used = true;
			var project = new Project(idea);
			this.stacks.projects.add(project);
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

	tick: function() {

		$.each(this.stacks.researchers.content, function(index, researcher) {
			researcher.tick();
		});

		$.each(this.stacks.projects.content, function(index, project) {
			project.tick();
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


var entityCount = 0;
var Entity = Class.extend({

	init: function(type) {
		this.id = entityCount++;
		this.type = type;
		this.key = type + this.id;

	},


	refreshView: function() {
		this.socketColumn.html("");
		this.actionDiv.html("");
		this.infoDiv.html("");
		this.tagDiv.html("");
		this.fillView();
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

	fillView: function() {
		this.contentDiv.html(this.key);
	}

});