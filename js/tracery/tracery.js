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
				this.symbols[key] = new TraceryRuleset(key, rawSymbols[key]);
			}
		}
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

	TraceryGrammar.prototype.setSymbol = function(key, rules) {
		this.symbols[key] = new TraceryRuleset(key, rules);
	}

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


	TraceryGrammar.prototype.flatten = function(rule, state) {

		var node = parseRule(rule);
		return this.expandNode(node, undefined, state).finished;
	};


	TraceryGrammar.prototype.expandWithOverrides = function(rule, ruleOverrides) {
		var state = {
			stacks: {}
		};

		var node = parseRule(rule, true);
		if (ruleOverrides) {
			for (var key in ruleOverrides) {
				if (ruleOverrides.hasOwnProperty(key)) {
					this.pushRules(key, ruleOverrides[key], state);
				}
			}

		}
		this.expandNode(node, undefined, state);
		return node;
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
							if (!target) {
								node.errors.push("No function " + inQuotes(address.raw));
							} else {
								node.generatedRules = target.apply(null, address.finishedParameters);
							}
						} else if (address.isSymbolKey) {
							// Clone the rules
							if (!target || !target.rules) {
								console.warn("No rules found for " + address.key);
							}
							if (!target || !target.rules)
								node.generatedRules = [];
							else
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
								//	console.warn("unknown type", section.type);
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
								node.errors.push("No modifier " + inQuotes(name));
								mod.finished += "[[." + name + "]]";

							} else {
								if (mod.parameters === undefined)
									mod.parameters = [];
								var parameters = mod.parameters.map(function(p) {
									console.log(p);
									return p.finished;
								});
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
						// Expand each step of the path
						for (var i = 0; i < node.path.length; i++) {
							// This may be either a "player", "5", "player{player.foo}",
							// or a path in itself "/player/{/stats/topPlayer}/5"
							this.expandNode(node.path[i], node, state);
							console.log(node.path[i]);
							if (node.path[i].key !== undefined)
								node.finishedPath.push(node.path[i].key);
							else
								node.finishedPath.push(node.path[i].finished);
						}
						console.log(node.finishedPath);

						// Use a custom access function
						if (state.worldObject.getFromPath) {
							node.finishedTarget = state.worldObject.getFromPath(node.finishedPath);
						}
						node.finishedTarget = getFromPath(state.worldObject, node.finishedPath);
						// if not a function, we're done
						if (!node.isFunction)
							node.finished = node.finishedTarget;
					} else {
						node.errors.push("No world object");
						// Path but no world object
						node.finished = "[[" + node.finishedPath.join(",") + "]]";
					}

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

					if (node.finishedTarget !== undefined) {

						// Expand out all the parameters
						node.finishedParameters = node.parameters.map(function(param) {
							grammar.expandNode(param, node, state);
							return param.finished;
						});


						// Not a modifier?  Apply immediately (Ie, dont need to wait for an inner value to pass as a parameter)
						if (node.context !== "modifier") {
							node.finished = node.finishedTarget.apply(null, node.finishedParameters);
						}
					} else {
						node.errors.push("No function named " + inQuotes(key));
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

					despace: function(s) {

						var s2 = s.replace(/[^A-Za-z0-9]+/g, "");
						s2 = s2.replace(/\s+/g, '');

						return s2;
					},
					allCaps: function(s) {
						var s2 = "";
						var capNext = true;
						for (var i = 0; i < s.length; i++) {
							s2 += s.charAt(i).toUpperCase();
						}
						return s2;
					},

					capitalize: function(s) {
						var s2 = s.charAt(0).toUpperCase() + s.substring(1);
						return s2;
						console.log(capitalize);
					},

					a: function(s) {
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
					},
					ing: function(s) {
						switch (s.charAt(s.length - 1)) {

							case 'e':
								if (!isVowel(s.charAt(s.length - 2)))
									return s.substring(0, s.length - 1) + "ing";
								else
									return s + "ing";
								break;
							default:
								return s + "ing";

						}
					}
				};
				grammar.addModifiers(baseModifiers);

			}
			return grammar;
		},

	}

	// Paths

	function getFromPath(obj, path) {
		if (!obj) {
			console.warn("No object provided for path");
			return undefined;
		}

		var obj2 = obj;
		var next;

		// For each path segment
		for (var i = 0; i < path.length; i++) {
			next = path[i];

			// Subpath: get the name of this link by following this subpath
			if (Array.isArray(next)) {
				var subpath = next;
				next = getFromPath(obj, subpath);
				if (next === undefined) {
					console.warn("No object path found for " + inSquareBrackets(subpath));
					return undefined;
				}
			}


			if (i < path.length - 1) {
				if (!obj2[next]) {
					console.warn("No address " + inQuotes(next) + " found in path " + inSquareBrackets(path));
					return undefined;
				}

				obj2 = obj2[next];
			}
		}

		if (!obj2[next]) {
			console.warn("No address " + inQuotes(next) + " found in path " + inSquareBrackets(path));
			return undefined;
		}
		var found = obj2[next];

		return found;

	}

	function setFromPath(obj, path, val) {
		var obj2 = obj;
		var next;
		for (var i = 0; i < path.length; i++) {
			next = path[i];

			// Subpath: get the name of this link by following this subpath
			if (Array.isArray(next)) {
				var subpath = next;
				next = getFromPath(obj, subpath);
				if (next === undefined) {
					console.warn("No object path found for " + inSquareBrackets(subpath));
					return undefined;
				}
			}


			if (i < path.length - 1) {
				if (obj2[next] === undefined) {
					console.log("Create property " + inQuotes(next));
					obj2[next] = {};
				}
			}


			obj2 = obj2[next];

		}

		return obj2[next];
	}



}());