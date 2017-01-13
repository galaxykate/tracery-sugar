/*
// Railroad diagrams

ParameterList::=  ((('"' Rule '"' | "'" Rule "'" | '[' RuleGenerator ']' | '(' Expression ')' | Expression) ) ( ',' ('"' Rule '"' | "'" Rule "'" | '[' RuleGenerator ']' | '(' Expression ')' | Expression))*)?

Address ::=((("/" Key )+) | Key) ("(" ParameterList ")")?
Key::= (("{" Rule "}")|(plaintext))+
*/

var tracery = (function() {
	function TraceryGrammar(raw) {

		var rawSymbols = raw;


		this.symbols = {};
		this.modifiers = {};
		// Complex raw (with settings)
		if (raw.symbols !== undefined) {
			rawSymbols = raw.symbols;
		}

		for (var key in rawSymbols) {
			if (rawSymbols.hasOwnProperty(key)) {
				//		console.log(rawSymbols[key]);

				this.symbols[key] = new TraceryRuleset(key, rawSymbols[key]);
			}
		}

		console.log(Object.keys(this.symbols));
	};

	TraceryGrammar.prototype.addModifiers = function(mods) {
		for (var key in mods) {
			if (mods.hasOwnProperty(key)) {
				this.modifiers[key] = mods[key];
			}
		}

	};

	TraceryGrammar.prototype.getFunction = function(key, isModifier) {
		if (isModifier)
			return this.modifiers[key];


		if (this.functions[key] !== undefined)
			return this.functions[key];

		if (Math[key] !== undefined) {

			return function() {
				return Math[key].apply(null, Array.from(arguments).map(function(arg) {
					return parseFloat(arg)
				}));

			}
		}

	};

	TraceryGrammar.prototype.getActiveRuleset = function(key, node, state) {
		var stack = state.stacks[key];
		if (stack)
			return stack[stack.length - 1];
		else
			return this.symbols[key];
	};


	TraceryGrammar.prototype.pushRules = function(key, rules, state) {
		if (!state.stacks[key])
			state.stacks[key] = [];
		state.stacks[key].push(new TraceryRuleset(key, rules));
	};

	// Stomp rules
	TraceryGrammar.prototype.setRules = function(key, rules, state) {

		state.stacks[key] = [new TraceryRuleset(key, rules)];
	};

	TraceryGrammar.prototype.popRules = function(key, state) {
		if (state.stacks[key] && state.stacks[key].length > 0) {
			return state.stacks[key].pop();
		}
	};


	TraceryGrammar.prototype.clearRules = function(key, state) {
		state.stacks[key] = [];
	};

	TraceryGrammar.prototype.expand = function(rule, parent, state, isProtected) {

		var node = parseRule(rule, isProtected);
		return this.expandNode(node, parent, state);

	};


	TraceryGrammar.prototype.flatten = function(rule) {

		var node = parseRule(rule, true);
		this.expandNode(node);
		return node.finished;
	};

	// Expand a node
	TraceryGrammar.prototype.expandNode = function(node, parent, state) {
		var grammar = this;
		if (node === undefined)
			throw ("empty node");
		if (state === undefined) {
			state = {};
		}
		if (state.stacks === undefined) {
			state.stacks = {};
		}

		if (parent === undefined)
			node.depth = 0;
		else {
			node.parent = parent;
			node.depth = parent.depth + 1;
		}

		switch (node.type) {

			case "number":
				break;


			case "expression":

				switch (node.expressionType) {
					case "operator":
						grammar.expandNode(node.operator, node, state);
						grammar.expandNode(node.lhs, node, state);
						grammar.expandNode(node.rhs, node, state);
						var lhs = parseFloat(node.lhs.finished);
						var rhs = parseFloat(node.rhs.finished);
						switch (node.operator.finished) {
							case "+":
								node.finished = lhs + rhs;
								break;
							case "-":
								node.finished = lhs - rhs;
								break;
							case "*":
								node.finished = lhs * rhs;
								break;
							case "/":
								node.finished = lhs / rhs;
								break;
							case "^":
								node.finished = lhs ^ rhs;
								break;
							case "%":
								node.finished = lhs % rhs;
								break;
							case "==":
								node.finished = lhs == rhs;
								break;
							case "!=":
								node.finished = lhs != rhs;
								break;
							case ">":
								node.finished = lhs > rhs;
								break;
							case "<":
								node.finished = lhs < rhs;
								break;
							case ">=":
								node.finished = lhs >= rhs;
								break;
							case "<=":
								node.finished = lhs <= rhs;
								break;
							default:
								console.warn(node);
						}

						//	console.log(lhs + node.operator.finished + rhs + " = " + node.finished);
						break;

					case "if":
						break;

					default:
						console.warn("Unknown " + node.expressionType);

				}
				break;

			case "ruleGenerator":

				node.generatedRules = [];

				switch (node.rgType) {

					// Filter a list of nodes through a function
					case "rg-filter":
						grammar.expandNode(node.source, node, state);
						grammar.expandNode(node.conditions, node, state);
						var possibleRules = node.source.generatedRules;
						node.generatedRules = possibleRules.filter(function(rule) {
							var accepted = true;
							for (var i = 0; i < node.conditions.length; i++) {
								var cond = node.conditions[i];
								var address = cond.address;
								var key = address.key;
								// If this address is a function, run it
								if (address.isFunction) {

									var parameters = address.parameters.map(function(param) {
										grammar.expandNode(param, node, state);

										return param.finished;
									});

									// Create the parameter values for this function
									var passCondition = grammar.functions[key].call(rule, parameters);
									if (!passCondition)
										accepted = false;
								}
							}
							return accepted;
						});
						break;



						// For loops
						// For each rule value, generate the rules
					case "rg-for":

						var generatedRules = [];

						// Expand all the rules of the for loops
						for (var i = 0; i < node.loops.length; i++) {

							// Expand the key that we'll be pushing to
							grammar.expandNode(node.loops[i].key, node, state);
							grammar.expandNode(node.loops[i].source, node, state);

						}


						var currentValues = {};

						// For each variant in the loops, push those rules, then do all the templates, then pop
						function makeTemplates(loopIndex) {
							var loop = node.loops[loopIndex];

							// All the rules to iterate through
							var rules = loop.source.generatedRules;

							// For each possible rule, generate expansions with the other loops' values
							for (var i = 0; i < rules.length; i++) {
								var key = loop.key.key;

								grammar.pushRules(key, rules[i], state);
								currentValues[key] = rules[i];

								// recurse
								if (loopIndex < node.loops.length - 1) {
									makeTemplates(loopIndex + 1);
								}
								// Otherwise, generate the rules
								else {
									var s = "";
									$.each(currentValues, function(key, val) {
										s += key + ":" + val + "\t";
									});

									// We're going to be filling a template, with some values

									grammar.expandNode(node.templateExpression, node, state);

									generatedRules.push(node.templateExpression.finished);
								}

								grammar.popRules(node.address, state);
							}

						}

						makeTemplates(0);
						node.generatedRules = generatedRules;


						break;

						// Concatenate rule sets
					case "rg-concatenation":

						var rulesets = node.concatenateRules.map(function(ruleGenerator) {
							grammar.expandNode(ruleGenerator, node, state);
							return ruleGenerator.generatedRules;
						});

						// Merge the arrays
						node.generatedRules = [].concat.apply([], rulesets);
						break;

						// Parse and generate a text rule
					case "rg-rule":


						grammar.expandNode(node.rule, node, state);
						node.generatedRules = [node.rule.finished];

						break;



						// Generate rules from an address
					case "rg-address":
						grammar.expandNode(node.address, node, state);
						var address = node.address;
						var target = address.finishedTarget;

						// May be a ruleset, a function (with params), or some random crap we pulled from the world object
						if (address.isFunction) {

							node.generatedRules = target.apply(null, address.finishedParameters);
						} else if (address.isSymbolKey) {
							// Clone the rules
							if (!target || !target.rules) {
								console.warn("No rules found for " + address.key);
							}
							node.generatedRules = target.rules.slice(0);
						} else {
							// Crap from world object
							node.generatedRules = target;
						}

						break;

					default:
						console.warn("Unknown rule generator type " + inQuotes(node.rgType));
				}


				node.finished = node.generatedRules;


				break;


			case "stackAction":

				this.expandNode(node.address, parent, state);

				// Push onto the appropriate stack
				if (node.address.path) {
					// TODO, do something with a path
					console.warn("No path pushing implemented yet");

				} else {
					if (node.address.key) {

						var key = node.address.key;

						if (node.ruleGenerator) {

							this.expandNode(node.ruleGenerator, parent, state);

							// :: set rules, : push rules
							if (node.operator === "::")
								grammar.setRules(key, node.ruleGenerator.finished, state);
							else
								grammar.pushRules(key, node.ruleGenerator.finished, state);
						} else {
							if (node.command) {
								switch (node.command) {
									case "POP":
										grammar.popRules(key, state);
										break;
									case "CLEAR":
										grammar.clearRules(key, state);
										break;
									default:
										console.warn("Unknown stackaction command: " + inQuotes(node.command));
								}
							}

						}
					} else {
						console.warn("unknown key");
					}
				}

				node.finished = "";
				break;



				// Rules may be non-string, ie, are objects, or numbers
				// Or may have non-string sections, like rule-generators

			case "rule":

				if (node.nonString) {
					node.finished = node.raw;
				} else {
					node.finishedSections = [];
					var val = "";
					var onlyText = true;

					for (var i = 0; i < node.sections.length; i++) {
						var section = node.sections[i];
						this.expandNode(section, node, state);

						switch (section.type) {
							case "ruleGenerator":
								if (section.generatedRules !== undefined) {

									if (Array.isArray(section.generatedRules)) {
										node.finishedSections.push(section.generatedRules.filter(function(s2) {
											return s2 !== undefined
										}).join(""));
									} else {
										node.finishedSections.push(section.generatedRules);
									}

								}
								break;
							case "text":
								node.finishedSections.push(section.finished);

								break;

							case "tag":
								node.finishedSections.push(section.finished);


								break;

							case "number":
								node.finishedSections.push(section.finished);

								break;
							case "address":
								console.log(section);
								if (section.isFunction) {
									var result = section.finishedTarget.apply(null, section.finishedParameters);
									section.finished = result;
								}
								node.finishedSections.push(section.finished);


								break;
							default:
								console.warn("unknown type", section.type);
								node.finishedSections.push(section.finished);

								break

						}


					}

					// Do the joining thing, if a custom one
					if (grammar.joinRuleSections !== undefined)
						node.finished = grammar.joinRuleSections(node.finishedSections);
					else {
						node.finished = node.finishedSections.join("");

					}

					node.tags = [];
					for (var i = 0; i < node.sections.length; i++) {
						var tags = node.sections[i].tags;

						if (tags) {
							node.tags = node.tags.concat(tags);
						}
					}

					// Clear escape chars
					var escaped = false;

					var c = "";
					for (var i = 0; i < node.finished.length; i++) {
						if (escaped) {
							c += node.finished.charAt(i);
							escaped = false;
						} else {
							if (node.finished.charAt(i) === "\\") {
								escaped = true;
							} else
								c += node.finished.charAt(i);
						}
					}
					node.finished = c;
				}

				break;


			case "tag":
				// do preactions TODO
				// get inner value

				this.expandNode(node.address, node, state);

				if (node.address.path !== undefined) {
					// Get from path
					node.innerFinished = node.address.finished;

				} else {
					// Look up a rule from a symbol stack
					var key = node.address.key;
					if (key !== undefined) {
						node.ruleset = this.getActiveRuleset(key, node, state);
						if (!node.ruleset) {
							node.errors.push("No ruleset for " + inQuotes(key));
						} else {
							node.rule = node.ruleset.getRule(node);

							this.expandNode(node.rule, node, state);
							node.innerFinished = node.rule.finished;
							node.tags = node.rule.tags;
						}


					} else
						console.warn("No key for tag" + inQuotes(node.raw));
				}

				node.finished = node.innerFinished;

				// Expand and apply the modifiers
				for (var i = 0; i < node.modifiers.length; i++) {
					this.expandNode(node.modifiers[i], node, state);
				}

				if (node.finished !== undefined) {
					// apply modifiers
					if (node.modifiers) {

						for (var i = 0; i < node.modifiers.length; i++) {
							var mod = node.modifiers[i];
							var name;
							var fxn;
							if (mod.path) {
								fxn = mod.finished;
								name = mod.raw;
							} else {
								fxn = grammar.modifiers[mod.key];
								name = mod.key;
							}
							if (fxn === undefined) {
								mod.finished += "[[." + name + "]]";
							} else {
								var parameters = mod.parameters.map(function(p) {
									console.log(p);
									return p.finished;
								});
								console.log(parameters);
								node.finished = fxn.apply(undefined, [node.finished].concat(parameters));
							}
						}
					}
				} else {
					// Do default behavior for missing rules
					if (node.address.path !== undefined)
						node.finished = "[[" + node.address.path.map(function(pathSegment) {
							return pathSegment.key;
						}).join("/") + "]]";
					else
						node.finished = "[[" + node.address.key + "]]";
				}

				// do postactions TODO


				break;
			case "text":
				// Do nothing
				node.raw = node.finished;

				// Scrape tags 
				if (grammar.openTag) {

					var s = node.finished.split(grammar.openTag);
					var tags = [];
					var text = s[0];
					for (var i = 1; i < s.length; i++) {
						var index = s[i].indexOf(grammar.closeTag);
						var tag = s[i].substring(0, index);
						tags.push(tag);

						text += s[i].substring(index + grammar.closeTag.length);
					}
					node.tags = tags;
					node.finished = text;
				}
				break;


				// Expand an address
				//   Get the target (symbol, modifier, or worldObject)
				//   Get the parameters (if a function)
			case "address":
				if (node.path !== undefined) {
					if (state.worldObject) {

						node.finishedPath = [];
						// Expand each path
						for (var i = 0; i < node.path.length; i++) {
							this.expandNode(node.path[i], node, state);
							node.finishedPath.push(node.path[i].key);
						}
						node.finishedTarget = getFromPath(state.worldObject, node.finishedPath);
					}

					// if not a function, we're done
					if (!node.isFunction)
						node.finished = node.finishedTarget;

				} else {


					// Expand out any dynamic stuff to get the real key
					if (node.isDynamic) {
						var val = "";
						for (var i = 0; i < node.dynamicSections.length; i++) {
							this.expandNode(node.dynamicSections[i], node, state);
							val += node.dynamicSections[i].finished;
							console.log(node.dynamicSections[i]);
						}
						node.key = val;

					}

					if (node.isFunction) {
						// Get from functions or modifiers
						node.finishedTarget = grammar.getFunction(node.key, node.context === "modifier");

					} else {
						node.finishedTarget = grammar.getActiveRuleset(node.key, node, state);
					}

				}

				// if this is a function, perform the function
				if (node.isFunction) {
					node.finishedParameters = node.parameters.map(function(param) {
						grammar.expandNode(param, node, state);
						return param.finished;
					});

					if (node.context !== "modifier") {
						node.finished = node.finishedTarget.apply(null, node.finishedParameters);

					}
				} else {
					// The target is either a ruleset, or a world value

				}

				break;

			default:
				//		console.warn("unknown node type " + inQuotes(node.type), node);
				break;
		}

		if (node.parameters) {
			for (var i = 0; i < node.parameters.length; i++) {
				grammar.expandNode(node.parameters[i], node, state);
			}
		}

		return node;
	};



	//==================================================================================================
	//==================================================================================================
	//==================================================================================================

	function TraceryRuleset(key, rawRules) {
		this.key = key;
		this.raw = rawRules;

		if (Array.isArray(rawRules)) {

			this.rules = rawRules.slice(0);

		} else if (rawRules !== null && typeof rawRules === 'object') {
			// Object rules
		} else {
			// String?
			this.rules = [rawRules];
			//createTestDiagram("rule", rawRules);
		}
	};



	TraceryRuleset.prototype.getRule = function(node) {
		// TODO, shuffles, weights, and conditionals
		var index = Math.floor(Math.random() * this.rules.length);
		var rule = this.rules[index];
		var parsed = parseRule(rule);

		parsed.ruleIndex = index;
		parsed.options = this.rules;
		return parsed;
	};


	TraceryRuleset.prototype.toString = function() {
		return this.raw;
	};



	//==================================================================================================
	//==================================================================================================
	//==================================================================================================


	return {

		createGrammar: function(raw, useBaseModifiers) {
			var grammar = new TraceryGrammar(raw);

			if (useBaseModifiers) {

				function isVowel(c) {
					var c2 = c.toLowerCase();
					return (c2 === 'a') || (c2 === 'e') || (c2 === 'i') || (c2 === 'o') || (c2 === 'u');
				};

				function isAlphaNum(c) {
					return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
				};

				var baseModifiers = {

					varyTune: function(s) {
						var s2 = "";
						var d = Math.ceil(Math.random() * 5);
						for (var i = 0; i < s.length; i++) {
							var c = s.charCodeAt(i) - 97;
							if (c >= 0 && c < 26) {
								var v2 = (c + d) % 13 + 97;
								s2 += String.fromCharCode(v2);
							} else {
								s2 += String.fromCharCode(c + 97);
							}

						}
						return s2;
					},

					capitalizeAll: function(s) {
						var s2 = "";
						var capNext = true;
						for (var i = 0; i < s.length; i++) {

							if (!isAlphaNum(s.charAt(i))) {
								capNext = true;
								s2 += s.charAt(i);
							} else {
								if (!capNext) {
									s2 += s.charAt(i);
								} else {
									s2 += s.charAt(i).toUpperCase();
									capNext = false;
								}

							}
						}
						return s2;
					},

					capitalize: function(s) {
						return s.charAt(0).toUpperCase() + s.substring(1);
					},

					a: function(s) {
						console.log("AAAAA");
						if (s.length > 0) {
							if (s.charAt(0).toLowerCase() === 'u') {
								if (s.length > 2) {
									if (s.charAt(2).toLowerCase() === 'i')
										return "a " + s;
								}
							}

							if (isVowel(s.charAt(0))) {
								return "an " + s;
							}
						}


						return "a " + s;

					},

					s: function(s) {
						switch (s.charAt(s.length - 1)) {
							case 's':
								return s + "es";
								break;
							case 'h':
								return s + "es";
								break;
							case 'x':
								return s + "es";
								break;
							case 'y':
								if (!isVowel(s.charAt(s.length - 2)))
									return s.substring(0, s.length - 1) + "ies";
								else
									return s + "s";
								break;
							default:
								return s + "s";
						}
					},
					ed: function(s) {
						switch (s.charAt(s.length - 1)) {
							case 's':
								return s + "ed";
								break;
							case 'h':
								return s + "ed";
								break;
							case 'x':
								return s + "ed";
								break;
							case 'y':
								if (!isVowel(s.charAt(s.length - 2)))
									return s.substring(0, s.length - 1) + "ied";
								else
									return s + "d";
								break;
							default:
								return s + "d";
						}
					}
				};
				grammar.addModifiers(baseModifiers);

			}
			return grammar;
		},

		// For each in a table, do something relative
		//'#emoji##name#' for a in /emojiTable [emoji:a/emoji][name:a/name] ''
		//"'#myNum##animal#' for myNum in number", "'#myNum##myAnimal#' for myNum in number for myAnimal in animal",
		tests: {
			//rule: ["foo", "\\\\\\foo", "foo#bar#", "#animalName.capitalize.s#", "foo#missingSymbol#", "foo[bar]", "foo[#bar#]","[#animalName.replace([vowel],'X')#]", "[range(0,4,5)]", "[join([range(0,4,5)],',')]", "[doSomethingWithNoReturn(#foo#)]", "foo\\#bar\\#", "\\[foo{#'\\]", "(#foo#)", "!صَبَاحُ الخَيْر", "בוקר טוב.", "早上好", "I 💖 emoji🏄🏾"],
			//rule: ["#animalName.replace([vowel],'X')#"],
			//rule: ["['#x# + 1' for foo in number1]"],
			rule: ["<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>['<circle fill=\\'hsl([(x*10 + y*50)],50%,[(y)]0%)\\' cx=\\'[ (x * #/spacing/x# + 15)  ]\\' cy=\\'[ (y * #/spacing/y# + 15)  ]\\' r=\\'[(random(10) + 3)]\\'/>' for x in number for y in number ]<svg>"],
			//rule: ["[(random(5))]"],
			// "['#drawFlower#' for x in number1 for y in number1]"],
			//rule: ["#origin#"] ,
			//rule: ["[sin(max(2,5))]"],
			//	action: ["foo,bar", "foo", "/foo", "/foo/bar()", "replace('a','foo#bar#, yeah',[foo])", "foo('bar,baz',10e2,10e-2,0x3123ff,5)",range(0,'foo',10)", "foo()", "foo(bar)", "foo('{#bar#}Name')", "'foo'", "\"bar\""],
			//action: ["'test#foo#'", "'test(#foo#)'", "foo", "foo()", "foo('bar')", "leet('foo')", "/foo", "/foo()", "[foo],[bar]", "[foo],'bar','(#baz#)'", "range(0, 10, 11)","range(0, 10, #number#)", "/names/british/female"],
			//action: ["'#number# #foo#' for foo in [animal]", "'#bar# #foo#' for foo in [animal] for bar in [number]", "/names/british/female filter startsWith('A')", "'Miss #name#' for name in /names/british/female filter startsWith('A')"],
			//action: ["'Miss #foo#' for foo in /names/british/female ", "/names/british/female if startsWith('A') if endsWith('A')", "'Miss #name#' for name in /names/british/female if (startsWith('A'))"],
			//action: ["'Miss #foo#' for foo in /names/british/female ", "'Miss #foo#' for foo in [[/names/british/female] if startsWith('A') if endsWith('a')]"],
			//action: ["'#name# the dog', '#name# the cat', 'Miss #foo#' for foo in [/names/british/female if startsWith('a')]"],
			//rule: ["#x#[x:a]#x#[x:b]#x#[x:c]#x#[x:POP]#x#[x::z]#x#[x:POP]#x#[x:POP]#x#", "#x#[x:a]#x#[x:b]#x#[x:c]#x#[x:POP]#x#[x:z]#x#[x:POP]#x#[x:POP]#x#"],
			//action: ["'#x##y#(#letter1#)' for x in [animal1] for y in [number1]"],
			// "/names/british/female if startsWith('A') if endsWith('A')", "'Miss #name#' for name in /names/british/female if (startsWith('A'))"],
			//rule: ["foo #foo# #/foo#", "baz #foo.replace([a],'bar')# bar"],
			address: ["foo", "{foo}", "{#foo#}", "/foo", "/foo/bar", "/foo/bar(#/foo#)", "/foo/{#bar#baz}", "/foo/5/bar", "foo()", "foo(bar)", "foo(#/bar/{#/baz#}#)", "foo(bar,baz)", "foo(bar,'test,1,2,3')"],
			//address: ["/foo/5/bar"],
		},

		testParsing(type, parseFxn, grammar, worldObject, viewHolder, expand) {
			console.log("Testing " + type);
			var tests = [];
			for (var i = 0; i < tracery.tests[type].length; i++) {
				var test = tracery.tests[type][i];
				console.log("----------------------");
				console.log(test);
				var div = $("<div/>", {
					class: "tracery-test",
				}).appendTo(viewHolder);

				var label = $("<div/>", {
					class: "tracery-test-label",
					text: test
				}).appendTo(div);


				var node = parseFxn(test);

				if (expand) {
					grammar.expandNode(node, undefined, {
						worldObject: worldObject
					});
				}


				createDiagram(node, div);
				console.log(node.finished);

				var html = $("<div/>", {

					html: node.finished
				}).appendTo($("#panel-preview .panel-content"));

				var html = $("<div/>", {
					class: "large",
					text: node.raw
				}).appendTo($("#panel-rule .panel-content"));

			}
		},



		test: function() {

			var worldObject = {
				foo: "WORLD_FOO",
				count: {
					value: "**I'm a path!**"
				},
				playerName: "Judge Judy",
				fooName: "Beyoncé",
				barName: "Tilda Swinton",
				spacing: {
					x: 23,
					y: 23,
				},
				names: {
					british: {
						female: ["Alice", "Victoria", "Eugenia", "Anastasia"],
						male: ["Percy", "Marcus", "Alastair", "Drake"],
					}
				},
				emojiTable: [{
					name: "beer",
					emoji: "🍺"
				}, {
					name: "octopus",
					emoji: "🐙"
				}, {
					name: "fire",
					emoji: "🔥"
				}]
			};


			var grammar = tracery.createGrammar({
				origin: "['#drawFlower#' for x in number1 for y in number1]",
				drawFlower: ["<translate x=[#x# * 10 + 5] y=[#y# * 10 + 5]>"],
				foo: ["FOO", "F00"],
				number: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
				animal: "🐌 🐙 🐬 🐅 🐪 🐀 🐿 🐓 🐠 🐈 🐑".split(" "),
				animalName: ["boa", "emu", "okapi", "unicorn"],
				star: "🌝 🌞 🌛 🌜 🌙 💫 ⭐️ 🌟 ✨️ ⚡️ 🔥 💥☄☀️".split(" "),
				animal1: ["🐌", "🐙", "🐬"],
				number1: [0, 1, 2],
				letter1: ["A", "B", "C"],
				fooAddress: "foo",
				fooName: "F$$",
				vowel: "aeiou".split(""),
				bar: ["BAR"],
				baz: ["BAZ"],
				wiz: ["WIZ"],
				count: 3,
				name: ["Sniffly", "Mittens", "Nelson", "Mipsy", "Wellington"],

			});

			grammar.functions = {
				startsWith: function(c) {
					return this.charAt(0).toLowerCase() === c[0].toLowerCase();
				},
				endsWith: function(c) {

					return this.charAt(this.length - 1).toLowerCase() === c[0].toLowerCase();
				},

				formatNum: function(c) {

					return c.toFixed(2);
				},
				foo: function(s) {
					var s2 = ""
					if (s) {
						for (var i = 0; i < s.length; i++) {
							s2 += s.charAt(i) + "_FOO_";
						}
						return s2;
					}
					return "LOTS_A_FOO";
				},

				random: function(a, b) {

					if (b !== undefined)
						return Math.random() * (parseFloat(b) - parseFloat(a)) + parseFloat(a);
					if (a !== undefined)
						return Math.random() * parseFloat(a);

					return Math.random();
				},

				range: function(min, max, steps) {
					var s = [];

					if (steps === 1)
						return [(min + max) / 2]

					for (var i = 0; i < steps; i++) {
						s.push(i * (max - min) / (steps - 1));
					}

					return s;
				},



				// for each letter in s, replace with
				leet: function(s) {
					var replacements = {
						"o": "0",
						"a": "4",
						"i": "!",
						"t": "7",
						"s": "z",
						"e": "3",
					}
					var s3 = [];
					for (var i = 0; i < s.length; i++) {
						var s2 = "";
						for (var j = 0; j < s.length; j++) {
							var c = s.charAt(j).toLowerCase();
							if (replacements[c] && Math.random() > .5)
								s2 += replacements[c]
							else {
								if (Math.random() > .5)
									s2 += c;
								else
									s2 += c.toUpperCase();
							}
						}
						s3.push(s2);
					}
					return s3;

				}
			};


			grammar.modifiers = {


				foo: function(s) {
					return "foo" + s + "foo";
				},

				bar: function(s) {
					return "bar" + s + "bar";
				},
				allBs: function(s) {
					var s2 = "";
					for (var i = 0; i < s.length; i++) {
						var c = s.charCodeAt(i);
						if (c => 65 && c <= 90)
							s2 += "B";
						else if (c => 97 && c <= 122)
							s2 += "b";
						else
							s2 += s.charAt(i);
					}
				},

				add: function(s, a) {
					return s + a;
				},

				// Greedy replacement
				replace: function(s, queries, replacementRule) {

					console.log(s, queries, replacementRule);
					console.log("REPLACE", s);

					if (!Array.isArray(queries))
						queries = [queries];

					for (var i = 0; i < queries.length; i++) {
						var query = getFinished(queries[i]);
						var re = new RegExp(query, 'g');

						var s2 = getFinished(replacementRule);
						s = s.replace(re, s2);
					}

					return s;
				}
			}

			var displayHolder = $("#panel-expansion .panel-content");

			//tracery.testParsing("action", parseAction, grammar, worldObject, displayHolder, true);
			tracery.testParsing("rule", parseRule, grammar, worldObject, displayHolder, true);
			//tracery.testParsing("expression", parseExpression, grammar, worldObject, displayHolder, true);
			//tracery.testParsing("address", parseAddress, grammar, worldObject, displayHolder, true);
		}

	}

}());