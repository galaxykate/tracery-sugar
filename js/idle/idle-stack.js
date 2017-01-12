var World = Class.extend({
	init: function() {
		this.stacks = {};
		this.stackHolder = $("<div/>", {
			class: "idle-stacks"
		}).appendTo($("#world"));

		this.createStack("ideas", {
			type: "idea",
		});
		this.createStack("students", {
			type: "student"
		});
	},

	tick: function() {
		if (Math.random() > .8) {
			this.stacks.students.add(1);
		}
		if (Math.random() > .8) {
			this.stacks.ideas.add(1);
		}

	},

	createStack: function(key, settings) {
		this.stacks[key] = new Stack(key, settings);
		this.stacks[key].createView(this.stackHolder);
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
		this.type = settings.type;

		this.content = [];
	},

	add: function(count) {
		this.count += count;
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

	createView: function(holder) {
		this.div = $("<div/>", {
			class: "idle-stack"

		}).appendTo(holder);
		this.labelDiv = $("<div/>", {
			html: this.key,
			class: "idle-stacklabel"
		}).appendTo(this.div);

		this.contentDiv = $("<div/>", {
			class: "idle-stackcontent"

		}).appendTo(this.div);

		this.totalDiv = $("<div/>", {
			class: "idle-stacktotal"

		}).appendTo(this.contentDiv);

		this.inspectorDiv = $("<div/>", {
			class: "idle-stackinspector"

		}).appendTo(this.contentDiv);
	}
})