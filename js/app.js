$(document).ready(function() {
	console.log("start");


new Panel("expansion", $("#panel-holder"),undefined,  true);
new Panel("rule", $("#panel-holder"),undefined,true);
new Panel("preview", $("#panel-holder"),undefined, true);



	/*
		var node = new TraceryNode({
			tagContents: "[myName:#name.capitalize#][myColor:#color#][addFlag:started]origin.replace(animal,[#foo.capitalize#])[x+=1][clearFlag:started]",
			//tagContents: "[test(foo)]test.foo(bar)",
			grammar: grammar,
			addressSpace: {
				clothing: {
					top: {
						type: "shirt",
						color: "red"
					}
				}
			}
		});
	*/


	//node.expand();

	//var viz = new TraceryNodeViz(node, $("#panel-expansion .panel-content"))
	testTracery();
	
});