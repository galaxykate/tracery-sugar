var ideaCount = 0;

var Idea = Entity.extend({
	init: function(sourceTags) {

		this.type = "idea";
		this.id = projectCount++;
		this.key = this.type + this.id;
		this.sourceTags = sourceTags;
		this.hue = Math.random() * 360;
		this.createView();
		this.reroll();


	},

	upgradeToProject: function() {
		this.view.css({
			"text-decoration": "underline",
			pointerEvents: "none",
			border: "2px solid hsl(" + this.hue + ",50%, 50%)",
border: "2px solid hsl(" + this.hue + ",50%, 50%)",

		});


		var project = new Project(this);
		lab.projects.push(project);
		openPanel("projects");

	},

	setDetails: function() {
		
		var sourceSet = {};

		for (var i = 0; i < types.length; i++) {
			var type = types[i];
			var tags = this.sourceTags.filter(s => s.type === type);
			sourceSet[type] = [getRandom(skills[type])].concat(tags).concat(tags);
		}
	
		this.set = {
			focus: getRandom(sourceSet.focus),
			approach: getRandom(sourceSet.approach),
			content: getRandom(sourceSet.content),
		};

		this.getTagsFromSet();
		
		this.name = generateWithOverrides("idea", undefined, {
			a: this.tags[0].name,
			b: this.tags[1].name
		}).finished;
		

	},

	createView: function() {
		var idea = this;
		var holder = $("#whiteboard .content");

		this.view = $("<div/>", {
			class: "idea",
			id: this.key,
			html: this.name
		}).appendTo(holder);

		var x = (Math.random() * 70 + 30);

		this.view.css({
			color: "hsl(" + this.hue + ",50%, 50%)",
			transform: "translate(" + x + "px, 0px) rotate(" + 5 * (Math.random() - .5) + "deg) translate(" + -x + "px, 0px)"
		}).click(function() {
			idea.isSelected = !idea.isSelected;
			console.log(idea.isSelected);
			if (idea.isSelected) {
				console.log("draw border");
				idea.view.css({
					border: "2px solid hsl(" + idea.hue + ",50%, 50%)",
				});

			} else {
				idea.view.css({
					border: "none",
				})
			}
		})

		this.view.dblclick(function() {
			var settings = {
				onYes: function() {
					console.log("Upgrade");
					idea.upgradeToProject();
				},
				onNo: function() {
					console.log("Cancel");
				}
			};
			popup(function(div) {
				div.append("Start a project with this idea? <div class='idea'>" + idea.name + "</div>")
			}, settings);

		});

	},
	refreshView: function() {
		this.view.html(this.name);
	}
});