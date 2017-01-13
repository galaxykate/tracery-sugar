var World = Class.extend({
	init: function() {
		this.stacks = {};
		this.stackHolder = $("<div/>", {
			class: "idle-stacks"
		}).appendTo($("#world"));

		this.createStack("ideas", {
			type: "idea",
			generator: Idea,
			holder: $("#panel-ideas .panel-content")
		});
		this.createStack("researchers", {
			type: "researcher",
			generator: Researcher,
			holder: $("#panel-students .panel-content")
		});

		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.researchers.add(5);
		this.stacks.ideas.add(5);
		this.stacks.ideas.add(5);
		this.stacks.ideas.add(5);
		this.stacks.ideas.add(5);
		this.stacks.ideas.add(5);
		this.stacks.ideas.add(5);
		this.stacks.ideas.add(5);
		this.stacks.ideas.add(5);
		this.stacks.ideas.add(5);

	},


	tick: function() {

		$.each(this.stacks.students, function(index, student) {
			student.tick();
		});

		$.each(this.stacks.projects, function(index, project) {
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
		console.log(settings);
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
		this.totalDiv.html(this.count);

		// add to the inspectorDiv
		if (this.content.length < this.count) {
			var toDo = this.count - this.content.length;
			console.log("generate " + toDo);
			for (var i = 0; i < toDo; i++) {
				this.content.push(generate(this.type));
			}
		}

	},

	createView: function() {
		this.div = $("<div/>", {
			class: "idle-stack"

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

	createView: function(holder) {

		this.div = $("<div/>", {
			class: "idle-entity entity-" + this.type + this.id

		}).appendTo(holder);

		this.contentDiv = $("<div/>", {
			class: "idle-content",

		}).appendTo(this.div);
		this.iconDiv = $("<div/>", {
			class: "idle-icon"

		}).appendTo(this.div);
		this.actionDiv = $("<div/>", {
			class: "idle-action"

		}).appendTo(this.div);



		this.fillView();
	},

	fillView: function() {
		this.contentDiv.html(this.key);
	}

});