import { lib, game, ui, get, ai, _status } from "../../noname.js";
import character from "./character.js"; //水波使用

const skills = {
	/**
	因为牌库默认带毒，所以在弃牌转化牌等操作中对ai进行毒适配
	@example
	第一个为原本返回值(数字VALUE)，第二个为遍历卡牌(一般为card)，第三个为当前玩家(一般为player)
	在ai返回卡牌value时使用 skills.duexcept_ai(number, card, player)
	例：原本为 return VALUE
	  修改后为 return skills.duexcept_ai(VALUE, card, player)
	**/
	duexcept_ai: function (aireturn, card, player) {
		if (card.name != "du")
			return aireturn;
		const ducheck = player.hp + player.countCards("h", card => {
			const name = get.name(card);
			return (name == "tao" || name == "jiu") && player.canUse(card, player);
		}) <= ui.selected.cards.filter(card => card.name == "du").length + 1;
		if (ducheck)
			return -114514;
		return aireturn
	},
	/**
	因为牌库默认带毒，所以在弃牌转化牌等操作中对ai进行毒适配
	@example
	用于检测卡片是否可以被丢弃等卡片失去等操作
	**/
	ducardexcept_ai: function (boolean, card, player) {
		if (card.name == "du" && player.hp <= 1 && !player.countCards("h", card => {
			const name = get.name(card);
			return (name == "tao" || name == "jiu") && player.canUse(card, player);
		}) > 0)
			return false;

		return boolean
	},
	"jk_unform_skill": {
		audio: "ext:魔法纪录:1",
		trigger: {
			target: "useCardToTargeted",
		},
		forced: true,
		equipSkill: true,
		filter(event, player) {
			if (player.hasSkillTag("unequip2")) {
				return false;
			}
			if (
				event.player.hasSkillTag("unequip", false, {
					name: event.card ? event.card.name : null,
					target: player,
					card: event.card,
				})
			) {
				return false;
			}
			return event.card.name == "sha";
		},
		content() {
			"step 0";
			player.judge(function (card) {
				return get.color(card) == "black" ? -2 : 0;
			}).judge2 = function (result) {
				return result.bool == false ? true : false;
			};
			"step 1";
			if (result.bool === false) {
				var map = trigger.customArgs,
					id = player.playerid;
				if (!map[id]) {
					map[id] = {};
				}
				if (!map[id].extraDamage) {
					map[id].extraDamage = 0;
				}
				map[id].extraDamage++;
				game.log(trigger.card, "对", player, "的伤害+1");
			}
		},
		"_priority": -25,
	},
	"kuroe_kill_skill": {
		forced: true,
		equipSkill: true,
		audio: "ext:魔法纪录:1",
		trigger: {
			source: "damageBegin",
		},
		async content(event, trigger, player) {
			if (trigger.player.name == "kuroe") {
				trigger.num++;
			}
		},
		"_priority": 0,
	},
	"yongzhuang_skill": {
		equipSkill: true,
		trigger: {
			target: "useCardToTarget",
		},
		forced: true,
		check(event, player) {
			return get.effect(event.target, event.card, event.player, player) < 0;
		},
		filter(event, player) {
			if (["shuiyanqijun", "shuiyanqijunx", "shuiyanqijuny"].includes(event.card.name)) {
				return true;
			}
			return false;
		},
		content() {
			trigger.getParent().targets.remove(player);
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (["shuiyanqijun", "shuiyanqijunx", "shuiyanqijuny"].includes(card.name)) {
						return "zeroplayertarget";
					}
				},
			},
		},
		"_priority": -25,
	},
	"shuibojian_skill": {
		audio: "ext:魔法纪录:1",
		trigger: {
			player: "useCard2",
		},
		direct: true,
		equipSkill: true,
		filter(event, player) {
			if (event.card.name != "sha" && get.type(event.card) != "trick") {
				return false;
			}
			var info = get.info(event.card);
			if (info.allowMultiple == false) {
				return false;
			}
			var num = player.getHistory("useSkill", function (evt) {
				return evt.skill == "shuibojian_skill";
			}).length;
			if (num >= 1) {
				return false;
			}
			if (event.targets && !info.multitarget) {
				if (
					game.hasPlayer(function (current) {
						return lib.filter.targetEnabled2(event.card, player, current) && !event.targets.includes(current);
					})
				) {
					return true;
				}
			}
			return false;
		},
		content() {
			"step 0";
			var prompt2 = "为" + get.translation(trigger.card) + "额外指定一个目标";
			player
				.chooseTarget([1, player.storage.fumian_red], get.prompt(event.name), function (card, player, target) {
					var player = _status.event.player;
					if (_status.event.targets.includes(target)) {
						return false;
					}
					return lib.filter.targetEnabled2(_status.event.card, player, target);
				})
				.set("prompt2", prompt2)
				.set("ai", function (target) {
					var trigger = _status.event.getTrigger();
					var player = _status.event.player;
					return get.effect(target, trigger.card, player, player);
				})
				.set("targets", trigger.targets)
				.set("card", trigger.card);
			"step 1";
			if (result.bool) {
				if (!event.isMine() && !event.isOnline()) {
					game.delayx();
				}
				event.targets = result.targets;
			}
			"step 2";
			if (event.targets) {
				player.logSkill(event.name, event.targets);
				trigger.targets.addArray(event.targets);
			}
		},
		ai: {
			equipValue(card, player) {
				if (player.getEnemies().length < 2) {
					if (player.isDamaged()) {
						return 0;
					}
					return 1;
				}
				return 4.5;
			},
			basic: {
				equipValue: 4.5,
			},
		},
		"_priority": -25,
	},
	"mengshenjueqiang_skill": {
		audio: "ext:魔法纪录:1",
		trigger: {
			source: "damageSource",
		},
		usable: 1,
		equipSkill: true,
		filter(event, player) {
			return event.getParent().name == "sha";
		},
		content() {
			"step 0";
			player.judge(function (card) {
				var player = _status.event.getParent("mengshenjueqiang_skill").player;
				if (player.isHealthy() && get.color(card) == "red") {
					return 0;
				}
				return 2;
			});
			"step 1";
			switch (result.color) {
				case "red":
					player.recover();
					break;
				case "black":
					player.draw(2);
					break;
				default:
					break;
			}
		},
		ai: {
			equipValue(card, player) {
				if (player.isDamaged()) {
					return 4.5;
				}
				return 6;
			},
			basic: {
				equipValue: 4.5,
			},
		},
		"_priority": -25,
	},
	"test_tube_skill": {
		audio: "ext:魔法纪录:1",
		forced: true,
		equipSkill: true,
		trigger: {
			player: "shaDamage",
		},
		async content(event, trigger, player) {
			let card = trigger.card;
			trigger.target.gain(game.createCard2("du", card.suit, card.number), "gain2");
		},
	},

	//杏子
	"kyoko_shengxu": {
		trigger: {
			player: ["loseAfter", "recoverAfter"],
			global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
		},
		frequent: true,
		preHidden: true,
		filter(event, player) {
			if (event.name == "recover") {
				return true;
			}
			if (player == _status.currentPhase) {
				if (event.type != "discard") {
					return false;
				}
				var evt = event.getl(player);
				return (
					evt && evt.cards2
				);
			}
			if (event.name == "gain" && event.player == player) {
				return false;
			}
			var evt = event.getl(player);
			return evt && evt.cards2 && evt.cards2.length > 0;
		},
		// 技能发动次数修改器
		getIndex(event, player) {
			return event.name == "recover" ? event.num : event.getl(player).cards.length;
		},
		async content(event, trigger, player) {
			// const num = trigger.name == "recover" ? trigger.num : trigger.getl(player).cards.length;
			// for (let i = 0; i < num; i++) {
			const next = player.judge(function (card) {
				return 1;
			});
			next.set("callback", lib.skill.kyoko_shengxu.callback);
			// }
		},
		async callback(event, trigger, player) {
			const card = event.judgeResult.card || trigger.card;

			if (event.judgeResult.suit == "heart") {
				await player.gain(card, "gain2");
				return;
			} else if (get.mode() == "guozhan") {
				const result = await player.chooseBool("是否将" + get.translation(card) + "作为“蓄”置于武将牌上？")
					.set("frequentSkill", "kyoko_shengxu")
					.set("ai", function () {
						return true;
					})
					.forResult();

				if (!result.bool) {
					return;
				}
			}
			await player.addToExpansion(card, "gain2").gaintag.add("kyoko_shengxu");
		},
		marktext: "蓄",
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
		onremove(player, skill) {
			const cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (typeof card === "object" && get.name(card) === "sha" && target.mayHaveShan(player, "use")) {
						return [0.6, 0.75];
					}
					if (!target.hasFriend() && !player.hasUnknown()) {
						return;
					}
					if (_status.currentPhase == target || get.type(card) === "delay") {
						return;
					}
					if (card.name != "shuiyanqijunx" && get.tag(card, "loseCard") && target.countCards("he")) {
						if (target.hasSkill("ziliang")) {
							return 0.7;
						}
						return [0.5, Math.max(2, target.countCards("h"))];
					}
					if (target.isUnderControl(true, player)) {
						if ((get.tag(card, "respondSha") && target.countCards("h", "sha")) || (get.tag(card, "respondShan") && target.countCards("h", "shan"))) {
							if (target.hasSkill("ziliang")) {
								return 0.7;
							}
							return [0.5, 1];
						}
					} else if (get.tag(card, "respondSha") || get.tag(card, "respondShan")) {
						if (get.attitude(player, target) > 0 && card.name == "juedou") {
							return;
						}
						if (get.tag(card, "damage") && target.hasSkillTag("maixie")) {
							return;
						}
						if (target.countCards("h") == 0) {
							return 2;
						}
						if (target.hasSkill("ziliang")) {
							return 0.7;
						}
						if (get.mode() == "guozhan") {
							return 0.5;
						}
						return [0.5, Math.max(target.countCards("h") / 4, target.countCards("h", "sha") + target.countCards("h", "shan"))];
					}
				},
			},
			threaten(player, target) {
				if (target.countCards("h") == 0) {
					return 2;
				}
				return 0.5;
			},
		},
	},
	"kyoko_xiqiang": {
		enable: "phaseUse",
		filter(event, player) {
			if (player.getStorage("kyoko_xiqiang_used").length > 2) {
				return false;
			}
			return player.getExpansions("kyoko_shengxu").length > 0;
		},
		chooseButton: {
			check(button) {
				const player = _status.event.player
				if (typeof button.link == "object") {
					if (player.hasSkill("kyoko_xunshen")) {
						if (button.link.name == "sha")
							return Math.max(95 - get.value(button.link), 0.01);
						return Math.max(100 - get.value(button.link), 0.01);
					}
					return 1;
				}

				const card = ui.selected.buttons.length ? ui.selected.buttons[0].link : false;
				switch (button.link) {
					case 0:
						if (card)
							return player.hasValueTarget(get.autoViewAs({ name: "shunshou" }, card), false) ? player.getUseValue("shunshou", false) : 0;
						return player.hasValueTarget("shunshou", false) ? player.getUseValue("shunshou", false) : 0;
					case 1:
						if (card)
							return player.hasValueTarget(get.autoViewAs({ name: "yiyi" }, card), false) ? player.getUseValue("yiyi", false) + 20 : 0;
						return player.hasValueTarget("yiyi", false) ? player.getUseValue("yiyi", false) + 20 : 0;
					case 2:
						if (card)
							return player.hasValueTarget(get.autoViewAs({ name: "dz_mantianguohai" }, card), false) ? player.getUseValue("dz_mantianguohai", false) : 0;
						return player.hasValueTarget("dz_mantianguohai", false) ? player.getUseValue("dz_mantianguohai", false) : 0;
					default:
						return 1;
				}
			},
			dialog(event, player) {
				var dialog = ui.create.dialog("袭枪：把1张『蓄』当下述锦囊使用", "hidden");
				var table = document.createElement("div");
				table.classList.add("add-setting");
				table.style.margin = "0";
				table.style.width = "100%";
				table.style.position = "relative";
				var list = ["顺手牵羊", "以逸待劳", "瞒天过海"];
				dialog.add([
					list.map((item, i) => {
						return [i, item];
					}),
					"tdnodes",
				]);
				dialog.add(player.getExpansions("kyoko_shengxu"));
				return dialog;
			},
			select: 2,
			filter(button, player) {
				const ck = ui.selected.buttons.length ? typeof ui.selected.buttons[0].link != typeof button.link : true;
				if (typeof button.link == "number") {
					if (player.getStorage("kyoko_xiqiang_used").includes(button.link))
						return false;
					else if (button.link == 0) {
						return game.hasPlayer(function (current) {
							return ck && player.canUse("shunshou", current, false);
						})
					} else if (button.link == 1) {
						return game.hasPlayer(function (current) {
							return ck && player.canUse("yiyi", current, true);
						})
					} else if (button.link == 2) {
						return game.hasPlayer(function (current) {
							return ck && player.canUse("dz_mantianguohai", current, true);
						})
					}
				}
				return ck;
			},
			backup(links) {
				if (typeof links[0] == "object") {
					links.reverse();
				}
				var next = get.copy(lib.skill["kyoko_xiqiang_backup" + links[0]]);
				next.card = links[1];
				return next;
			},
			prompt(links, player) {
				if (typeof links[0] == "object") {
					links.reverse();
				}
				if (links[0] == 0) {
					return "视为使用【顺手牵羊】";
				} else if (links[0] == 1) {
					return "视为使用【以逸待劳】";
				}
				return "视为使用【瞒天过海】：对一至两名区域内有牌的其他角色使用。你获得目标角色一张牌，然后依次交给每名目标角色各一张牌。";
			},
		},
		ai: {
			order: 8,
			result: {
				player(player) {
					return 1;
				}
			},
		},
		group: ["kyoko_xiqiang_2"],
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
			},
			backup0: {
				selectCard: -1,
				position: "x",
				filterCard: card => card == lib.skill.kyoko_xiqiang_backup.card,
				viewAs: { name: "shunshou", },

				filterTarget(card, player, target) {
					return lib.filter.targetEnabled2(card, player, target)
				},
				async precontent(event, trigger, player) {
					player.addTempSkill("kyoko_xiqiang_used", "phaseUseEnd");
					player.markAuto("kyoko_xiqiang_used", [0]);
				},
				ai: {
					order: 10,
					result: {
						player(player) {
							return 1;
						}
						// target(player, target){
						// 	const att = get.attitude(player, target);
						// 	if (att > 0 && (target.countCards("j") > 0 || target.countCards("e", card => get.value(card, target) < 0) > 0)) {
						// 		return 10;
						// 	}
						// 	if (att < 0 && (target.countCards("he", card => get.value(card, target) < 0) != target.countCards("he"))){
						// 		return -att;
						// 	}
						// 	return 1;
						// }
					},
				},
			},
			backup1: {
				selectCard: -1,
				position: "x",
				filterCard: card => card == lib.skill.kyoko_xiqiang_backup.card,
				viewAs: { name: "yiyi" },
				selectTarget: [1, 3],
				filterTarget(card, player, target) {
					return lib.filter.targetEnabled2(card, player, target);
				},
				async precontent(event, trigger, player) {
					player.addTempSkill("kyoko_xiqiang_used", "phaseUseEnd");
					player.markAuto("kyoko_xiqiang_used", [1]);
				},
				ai: {
					order: 10,
					result: {
						target(player, target) {
							const att = get.attitude(player, target);
							if (att < 0) return 0;
							if (player == target) return 100;
							return att + Math.sqrt(target.countCards("he"));
						}
					},
				},
			},
			backup2: {
				selectCard: -1,
				position: "x",
				filterCard: card => card == lib.skill.kyoko_xiqiang_backup.card,
				viewAs: { name: "dz_mantianguohai" },
				selectTarget: [1, 2],
				filterTarget(card, player, target) {
					return player != target && lib.filter.targetEnabled2(card, player, target);
				},
				async precontent(event, trigger, player) {
					player.addTempSkill("kyoko_xiqiang_used", "phaseUseEnd");
					player.markAuto("kyoko_xiqiang_used", [2]);
				},
				ai: {
					order: 10,
					result: {
						player(player) {
							return 1;
						}
					},
				},
			},
			2: {
				trigger: {
					player: ["useCardEnd"],
				},
				direct: true,
				filter(event, player) {
					return !player.hasSkill("kyoko_xiqiang_3") && player.isPhaseUsing() && get.type2(event.card) == 'trick';
				},
				onremove(player, skill) {
					player.removeSkill("kyoko_xiqiang_ex2mark")
				},
				async content(event, trigger, player) {
					function getUniqueTrickNames(player) {

						var history = player.getHistory("useCard");
						var trickNames = new Set();

						for (var record of history) {
							if (get.type2(record.card, null, false) == "trick") {
								trickNames.add(get.name(record.card));
							}
						}

						return Array.from(trickNames);
					}
					const n = getUniqueTrickNames(player)
					if (n.length >= 3) {
						player.addTempSkill("kyoko_xiqiang_3");
						player.removeSkill("kyoko_xiqiang_ex2mark");
					} else {
						player.storage.kyoko_xiqiang_ex2mark = n
						player.addTempSkill("kyoko_xiqiang_ex2mark", "phaseUseEnd");
					}
				},
			},
			ex2mark: {
				charlotte: true,
				mark: true,
				intro: {
					markcount(storage, player) {
						return player.getStorage("kyoko_xiqiang_ex2mark").length
					},
					content(storage) {
						return "已使用过【" + get.translation(storage[0]) + "】" + (storage[1] ? ("【" + get.translation(storage[1]) + "】") : "")
					},
				},
			}
		},
	},
	"kyoko_xiqiang_3": {
		enable: "phaseUse",
		filter(event, player) {
			if (player.getStorage("kyoko_xiqiang_3_used").length > 2) {
				return false;
			}
			return player.getDiscardableCards(player, "h").length > 0;
		},
		chooseButton: {
			check(button) {
				const player = _status.event.player
				if (typeof button.link == "object") {
					return skills.duexcept_ai(100 - get.value(button.link, player), button.link, player)
				}

				const card = ui.selected.buttons.length ? ui.selected.buttons[0].link : false;
				switch (button.link) {
					case 0:
						if (card)
							return player.hasValueTarget(get.autoViewAs({ name: "shunshou" }, card), false) ? player.getUseValue("shunshou", false) : 0;
						return player.hasValueTarget("shunshou", false) ? player.getUseValue("shunshou", false) : 0;
					case 1:
						if (card)
							return player.hasValueTarget(get.autoViewAs({ name: "yiyi" }, card), false) ? player.getUseValue("yiyi", false) + 20 : 0;
						return player.hasValueTarget("yiyi", false) ? player.getUseValue("yiyi", false) + 20 : 0;
					case 2:
						if (card)
							return player.hasValueTarget(get.autoViewAs({ name: "dz_mantianguohai" }, card), false) ? player.getUseValue("dz_mantianguohai", false) : 0;
						return player.hasValueTarget("dz_mantianguohai", false) ? player.getUseValue("dz_mantianguohai", false) : 0;
					default:
						return 1;
				}
			},
			dialog(event, player) {
				var dialog = ui.create.dialog("袭枪：弃1张手牌视为使用下述锦囊", "hidden");
				var table = document.createElement("div");
				table.classList.add("add-setting");
				table.style.margin = "0";
				table.style.width = "100%";
				table.style.position = "relative";
				var list = ["顺手牵羊", "以逸待劳", "瞒天过海"];
				dialog.add([
					list.map((item, i) => {
						return [i, item];
					}),
					"tdnodes",
				]);
				dialog.add(player.getDiscardableCards(player, "h"));
				return dialog;
			},
			select: 2,
			filter(button, player) {
				const ck = ui.selected.buttons.length ? typeof ui.selected.buttons[0].link != typeof button.link : true;
				if (typeof button.link == "number") {
					if (player.getStorage("kyoko_xiqiang_3_used").includes(button.link))
						return false;
					else if (button.link == 0) {
						return game.hasPlayer(function (current) {
							return ck && player.canUse("shunshou", current, false);
						})
					} else if (button.link == 1) {
						return game.hasPlayer(function (current) {
							return ck && player.canUse("yiyi", current, true);
						})
					} else if (button.link == 2) {
						return game.hasPlayer(function (current) {
							return ck && player.canUse("dz_mantianguohai", current, true);
						})
					}
				}
				return ck;
			},
			backup(links) {
				if (typeof links[0] == "object") {
					links.reverse();
				}
				var next = get.copy(lib.skill["kyoko_xiqiang_3_backup" + links[0]]);
				next.card = links[1];
				return next;
			},
			prompt(links, player) {
				if (typeof links[0] == "object") {
					links.reverse();
				}
				if (links[0] == 0) {
					return "视为使用【顺手牵羊】";
				} else if (links[0] == 1) {
					return "视为使用【以逸待劳】";
				}
				return "视为使用【瞒天过海】：对一至两名区域内有牌的其他角色使用。你获得目标角色一张牌，然后依次交给每名目标角色各一张牌。";
			},
		},
		ai: {
			order: 10,
			result: { player: 1 },
		},
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
			},
			backup0: {
				filterTarget(card, player, target) {
					return player.canUse("shunshou", target, false)
				},
				filterCard: () => false,
				selectCard: -1,
				viewAs: { name: "shunshou", },
				async precontent(event, trigger, player) {
					player.addTempSkill("kyoko_xiqiang_3_used", "phaseUseEnd");
					player.markAuto("kyoko_xiqiang_3_used", [0]);

					await player.discard(lib.skill.kyoko_xiqiang_3_backup.card);
				},
				ai: {
					order: 10,
					result: {
						player(player) {
							return 1;
						}
					},
				},
			},
			backup1: {
				filterTarget(card, player, target) {
					return player.canUse("yiyi", target, true)
				},
				filterCard: () => false,
				selectCard: -1,
				selectTarget: [1, 3],
				viewAs: { name: "yiyi", },
				async precontent(event, trigger, player) {
					player.addTempSkill("kyoko_xiqiang_3_used", "phaseUseEnd");
					player.markAuto("kyoko_xiqiang_3_used", [1]);

					await player.discard(lib.skill.kyoko_xiqiang_3_backup.card);
				},
				ai: {
					order: 10,
					result: {
						target(player, target) {
							const att = get.attitude(player, target);
							if (att < 0) return 0;
							if (player == target) return 100;
							return att + Math.sqrt(target.countCards("he"));
						}
					},
				},
			},
			backup2: {
				filterTarget(card, player, target) {
					return player.canUse("dz_mantianguohai", target, true)
				},
				filterCard: () => false,
				selectTarget: [1, 2],
				selectCard: -1,
				viewAs: { name: "dz_mantianguohai", },
				async precontent(event, trigger, player) {
					player.addTempSkill("kyoko_xiqiang_3_used", "phaseUseEnd");
					player.markAuto("kyoko_xiqiang_3_used", [2]);

					await player.discard(lib.skill.kyoko_xiqiang_3_backup.card);
				},
				ai: {
					order: 10,
					result: {
						player(player) {
							return 1;
						}
					},
				},
			},
		},
	},
	"kyoko_xunshen": {
		limited: true,
		enable: "phaseUse",
		filter(event, player) {
			return player.getExpansions("kyoko_shengxu").length > 0;
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);

			const num = player.getExpansions("kyoko_shengxu").length;
			await player.gain(player.getExpansions("kyoko_shengxu"), "gain2")
			await player.removeSkill("kyoko_shengxu");
			await player.draw(num);
			player.addTempSkill("kyoko_xunshen_2");
		},
		ai: {
			threaten: 4.5,
			order: 7,
			result: {
				player(player) {
					if (player.hasValueTarget("sha", false)) {
						const n = player.getExpansions("kyoko_shengxu")
						const n2 = Math.sqrt(game.filterPlayer().length - 1) - (player.hp < 3 ? 3 - player.hp : 0)
						if (n.length >= 6 + n2 || (n.length >= 4 + n2 && n.filter(card => card.name == 'sha') >= 2 + n2)) {
							return 1
						}
					}
					return -1;
				}
			},
		},
		subSkill: {
			2: {
				charlotte: true,
				mod: {
					targetInRange(card, player) {
						if (player == _status.currentPhase) {
							return true;
						}
					},
					cardUsable(card, player) {
						if (player == _status.currentPhase) {
							return Infinity;
						}
					},
				},
			},
		},
	},

	// 美树沙耶香
	"sayaka_kuangzou": {
		trigger: { global: "damageEnd" },
		filter(event, player) {
			return get.distance(player, event.player) <= 1 && event.num > 0;
		},
		forced: true,
		getIndex: event => event.num,
		frequent: true,
		preHidden: true,
		async content(event, trigger, player) {
			const num = event.index || 1;
			const f1 = trigger.source == player || player == _status.currentPhase;
			for (let i = 0; i < num; i++) {
				if (!f1 || player.isHealthy()) {
					await player.draw();
				} else {
					let choice;
					if (
						player.isDamaged() &&
						get.recoverEffect(player) > 0 &&
						player.countCards("hs", function (card) {
							return card.name == "sha" && player.hasValueTarget(card);
						}) >= player.getCardUsable("sha")
					) {
						choice = "回复1点体力";
					} else {
						choice = "摸一张牌";
					}

					// 让玩家选择摸牌或回血
					const next = player.chooseControl(["摸一张牌", "回复1点体力"])
						.set("prompt", `狂奏：请选择一项`)
						.set("choice", choice)
						.set("ai", function () {
							return _status.event.choice;
						});

					const control = await next.forResultControl();

					if (control == "摸一张牌") {
						await player.draw();
					} else if (control == "回复1点体力") {
						await player.recover();
					}
				}
			}
		},
	},
	"sayaka_yuehun":{
		mark: true,
		marktext: "音",
		forced: true,
		init(player) {
			player.storage.sayaka_yuehun = []
		},
		intro: {
			content(storage) {
				if (storage.length)
					return "你到" + storage.map(target => get.translation(target)) + "的距离视为1"
				return "没有强音过的角色"
			}
		},
		mod: {
			globalFrom(from, to) {
				if (from.storage.sayaka_yuehun?.includes(to)) {
					return -Infinity;
				}
			},
		},
	},
	"sayaka_qiangyin": {
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return player.countCards("h", card => lib.filter.cardDiscardable(card, player)) >= 2 && game.hasPlayer(function (current) {
				return current != player;
			});
		},
		async content(event, trigger, player) {
			const result = await player.chooseCardTarget({
				prompt: "弃置两张手牌并选择一名角色，你与其各回复一点体力。然后你们和有“协奏”牌的角色获得【无畏】",
				filterTarget(card, player, target) {
					return player != target
				},
				forced: true,
				position: "h",
				selectCard: 2,
				selectTarget: 1,
				ai1(card) {
					return skills.duexcept_ai(100 - get.value(card), card, player);
				},
				ai2(target) {
					if (get.attitude(player, target) <= 0) return -100
					const n = (target.getExpansions("sayaka_xiezou")?.length > 0) ? 2 : 0
					const m = target.isDamaged() ? 3 : 0
					return get.attitude(player, target) + n + m
				}
			})
			.forResult();

			
			if (result.bool) {
				player.discard(result.cards);
				const target = result.targets[0];
				player.line(target)

				await player.recover();
				await target.recover();
			
				player.addTempSkill("sayaka_qiangyin_clear", { player: "phaseBeginStart" })

				if (!player.storage.sayaka_yuehun?.includes(target)) {
					if (!player.storage.sayaka_yuehun)
						player.storage.sayaka_yuehun = []
					player.storage.sayaka_yuehun.push(target)
				}

				game.filterPlayer(current => current == player || current == target || current.getExpansions("sayaka_xiezou")?.length > 0)
					.forEach(current => {
						current.addAdditionalSkills("sayaka_qiangyin_" + player.playerid, "sayaka_wuwei", true)
					});

			};
		},
		subSkill: {
			clear: {
				charlotte: true,
				onremove(player){
					game.countPlayer(current => {
						current.removeAdditionalSkills("sayaka_qiangyin_" + player.playerid)
					})
				}
			},
		},
		ai: {
			order: 9,
			result: {
				player(player) {
					if (game.hasPlayer(target => {
						return target != player && get.attitude(player, target) > 0
					}))
						return 1;
					return -1;
				},
			},
			threaten: 2,
		},
	},
	"sayaka_wuwei": {
		trigger: { player: "damageBegin" },
		frequent: true,
		onremove: true,
		mark: true,
		intro: {
			content: "当你受到伤害时，你可以将牌堆顶的一张牌置于武将牌上，称为“协奏”。若以此法置入武将牌上的牌与“协奏”牌的花色均不同，防止本次伤害；若以此法置入武将牌上的牌与“协奏”牌的花色相同，你获得这张牌。"
		},
		async content(event, trigger, player) {
			const card = get.cards(1)[0];
			await game.cardsGotoOrdering(card);

			await player.showCards(card, get.translation(player) + "发动了【无畏】");

			const xiezouCards = player.getExpansions('sayaka_xiezou');

			if (xiezouCards.length != 0) {

				if (xiezouCards.some(xiezouCard => get.suit(card) == get.suit(xiezouCard))) {
					player.gain(card, 'gain2');
				} else {
					trigger.cancel();
					player.addToExpansion(card, player, 'give').gaintag.add('sayaka_xiezou');
				}
			} else {
				trigger.cancel();
				player.addToExpansion(card, player, 'give').gaintag.add('sayaka_xiezou');
			}
		}
	},
	"sayaka_xiezou": {
		mark: true,
		marktext: "协",
		charlotte: true,
		intro: {
			content: "协奏：已记录的牌",
			markcount: "expansion"
		},
		intro: {
			content: "expansion",
			markcount: "expansion"
		},
	},

	// 鹿目圆
	"madoka_pomo": {
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.getAttackRange() > 0;
		},
		async content(event, trigger, player) {
			await player.draw(player.getAttackRange());

			const damagecards = player.getCards("he", card => get.tag(card, 'damage') && player.hasValueTarget(card))
			const cardsResult = await player.chooseToDiscard("he", [1, 2], false)
				.set("goon", damagecards.length != 0)
				.set("ai", card => {
					if (!_status.event.goon || (ui.selected.cards.length != 0 && get.color(ui.selected.cards[0]) == get.color(card)))
						return -1;
					if (get.color(card) == "red")
						return skills.duexcept_ai(7 - get.value(card, player), card, player);
					return skills.duexcept_ai(4 - get.value(card, player), card, player);
				}).forResult();

			if (!cardsResult.bool) return;
			const cards = cardsResult.cards;
			const colors = cards.map(card => get.color(card))
			const suits = cards.map(card => get.suit(card))

			const result = await player
				.chooseTarget("请选择至多" + get.cnNumber(3 - cards.length) + "名角色", [1, 3 - cards.length], true)
				.set("ai", function (target) {
					return -get.attitude(_status.event.player, target);
				}).forResult();

			if (result.bool && result.targets.length) {
				for (let target of result.targets) {
					target.storage.madoka_pomo_2 = colors;
					target.addTempSkill("madoka_pomo_2");
					target.markSkill("madoka_pomo_2");
				}
				player.line(result.targets);
			}

			player.storage.madoka_pomo_4 = suits;
			player.addTempSkill("madoka_pomo_4", { player: "dieAfter" });
			player.markSkill("madoka_pomo_4");

			player.storage.madoka_pomo_3 = colors;
			player.addTempSkill("madoka_pomo_3", "phaseUseAfter");
			player.markSkill("madoka_pomo_3");

		},
		mod: {
			attackRange(player, distance) {
				return distance + player.hp;
			},
			aiValue(player, card, num) {
				const info = get.info(card)
				let attackRange = 0
				if (info?.distance?.attackFrom) {
					attackRange -= info.distance.attackFrom
					if (card == player.getEquip('equip1'))
						return num + (attackRange - 1) * 3
					if (get.subtype(card) == 'equip1') {
						const weapon = player.getEquip('equip1')
						const attackRange2 = weapon ? (get.info(weapon)?.distance?.attackFrom ? get.info(weapon).distance.attackFrom : 1) : 1
						if (attackRange >= attackRange2)
							return num + (attackRange - 1) * 3
					}
				}
				return num;
			},
			aiOrder(player, card, num) {
				const info = get.info(card)
				let attackRange = 0
				if (info?.distance?.attackFrom) {
					attackRange -= info.distance.attackFrom
					if (card == player.getEquip('equip1'))
						return num + (attackRange - 1) * 3
					if (get.subtype(card) == 'equip1') {
						const weapon = player.getEquip('equip1')
						const attackRange2 = weapon ? (get.info(weapon)?.distance?.attackFrom ? get.info(weapon).distance.attackFrom : 1) : 1
						if (attackRange >= attackRange2)
							return num + (attackRange - 1) * 3
					}
				}
				return num;
			},
		},
		ai: {
			order: 9,
			directHit_ai: true,
			pretao: true,
			result: {
				player(player) {
					return 1;
				},
			},
			effect: {
				player(card, player, target) {
					if (get.tag(card, 'damage') && target.storage.madoka_pomo_2?.includes("red")) return [1, 1, 1, 1];
				}
			},
			skillTagFilter(player, tag, arg) {
				if (tag != "directHit_ai" || !arg.target.hasSkill("madoka_pomo_2")) {
					return false;
				}
				if (arg.card.name == "sha" || arg.card.name == "wanjian") {
					return (
						arg.target.storage.madoka_pomo_2.includes("red") &&
						!arg.target.hasSkillTag(
							"freeShan",
							false,
							{
								player: player,
								card: arg.card,
								type: "use",
							},
							true
						)
					);
				}
				return arg.target.storage.madoka_pomo_2.includes("red") && arg.target.storage.madoka_pomo_2.includes("black");
			},
		},
		subSkill: {
			2: {
				charlotte: true,
				forced: true,
				mark: true,
				marktext: "破",
				onremove: true,
				content() {
					player.removeSkill("madoka_pomo_2");
				},
				mod: {
					cardEnabled2(card, player) {
						if (player.storage.madoka_pomo_2.includes(get.color(card)) && get.position(card) == "h")
							return false;
					},
				},
				intro: {
					content(colors) {
						let color = ""
						for (let i of ["red", "black", "none"]) {
							if (colors.includes(i))
								color == "" ? (color = get.translation(i)) : (color += ("或" + get.translation(i)))
						}
						return "不能使用或打出" + color + "的手牌";
					},
				},
			},
			3: {
				charlotte: true,
				silent: true,
				mark: true,
				marktext: "破",
				trigger: { source: "damageBegin1" },
				audio: false,
				onremove: true,
				usable: 1,
				filter(event, player) {
					if (_status.currentPhase != player) return false;
					return event.card && player.storage.madoka_pomo_3.includes(get.color(event.card));
				},
				async content(event, trigger, player) {
					trigger.num++;
					player.removeSkill("madoka_pomo_3");
				},
				intro: {
					content(colors) {
						let color = ""
						for (let i of ["red", "black", "none"]) {
							if (colors.includes(i))
								color == "" ? (color = get.translation(i)) : (color += ("或" + get.translation(i)))
						}
						return "本回合使用" + color + "牌第一次造成伤害+1";
					},
				},
			},
			4: {
				charlotte: true,
				mark: true,
				marktext: "灵",
				onremove: true,
				intro: {
					name: "灵跃",
					content(suits) {
						let suit = ""
						for (let i of ["heart", "diamond", "spade", "club", "none"]) {
							if (suits.includes(i))
								suit == "" ? (suit = get.translation(i)) : (suit += ("和" + get.translation(i)))
						}
						return "判定为非" + suit + "时视为使用或打出一张【闪】";
					},
				},
			},
		}
	},
	"madoka_lingyue": {
		trigger: {
			player: ["chooseToRespondBefore", "chooseToUseBefore"],
		},
		frequent: true,
		logTarget: "source",
		filter(event, player, name) {
			if (event.responded) return false;
			if (!event.filterCard({ name: "shan", isCard: true }, player, event)) return false;
			return true;
		},
		async content(event, trigger, player) {
			let judge = await player.judge(card => {
				if (player.storage.madoka_pomo_4 && !player.storage.madoka_pomo_4.includes(get.suit(card)))
					return 2;
				return -1;
			}).forResult();

			if (judge.bool) {
				trigger.untrigger();
				trigger.set("responded", true);
				trigger.result = { bool: true, card: { name: "shan", isCard: true } };
			} else {
				await player.gain(judge.card);

				if (!game.hasPlayer(current => current.countDiscardableCards(player, "ej"))) {
					return;
				}
				const { result } = await player
					.chooseTarget("是否弃置场上的一张牌？", (card, player, target) => {
						return target.countDiscardableCards(player, "ej");
					})
					.set("ai", target => {
						const att = get.attitude(player, target);
						if (att > 0 && (target.countCards("j") > 0 || target.countCards("e", card => get.value(card, target) < 0) > 0)) {
							return 10 + att;
						}
						if (att < 0) {
							if (target.countCards("e") > 0 && (target.countCards("e", card => get.value(card, target) < 0) != target.countCards("e")) && !target.hasSkillTag("noe"))
								return -att;
							return 0;
						}
						return 0;
					});
				if (result?.bool && result?.targets?.length) {
					const enemy = result.targets[0];
					await player.discardPlayerCard(enemy, "ej", true)
						.set("ai", button => {
							const card = button.link;
							if (get.attitude(player, enemy) > 0 && get.position(card) == "j")
								return 20 + get.value(card);
							if (get.attitude(player, enemy) > 0 && get.position(card) == "e")
								return -get.value(card);
							return get.value(card);
						});
				}
			}
		},
		ai: {
			respondShan: true,
			freeShan: true,
		},
	},
	"madoka_yuanhuan": {
		group: ["madoka_yuanhuan1", "madoka_yuanhuan_Range"],
		forbid: ["guozhan"],
		zhuSkill: true,
		filter(event, player) {
			if (!player.hasZhuSkill("madoka_yuanhuan") || !game.hasPlayer(current => current != player && current.group == "Law_of_Cycles")) return false;
			return !event.madoka_yuanhuan && (event.type != "phase" || !player.hasSkill("madoka_yuanhuan3"));
		},
		enable: ["chooseToUse", "chooseToRespond"],
		viewAs: {
			name: "sha",
		},
		filterCard() {
			return false;
		},
		selectCard: -1,
		ai: {
			order() {
				return get.order({ name: "sha" }) + 0.3;
			},
			respondSha: true,
			skillTagFilter(player) {
				if (!player.hasZhuSkill("madoka_yuanhuan") || !game.hasPlayer(current => current != player && current.group == "Law_of_Cycles")) return false;
			},
			yingbian(card, player, targets, viewer) {
				if (get.attitude(viewer, player) <= 0) return 0;
				var base = 0,
					hit = false;
				if (get.cardtag(card, "yingbian_hit")) {
					hit = true;
					if (
						targets.some(target => {
							return (
								target.mayHaveShan(
									viewer,
									"use",
									target.getCards("h", i => {
										return i.hasGaintag("sha_notshan");
									})
								) &&
								get.attitude(viewer, target) < 0 &&
								get.damageEffect(target, player, viewer, get.natureList(card)) > 0
							);
						})
					)
						base += 5;
				}
				if (get.cardtag(card, "yingbian_add")) {
					if (
						game.hasPlayer(function (current) {
							return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
						})
					)
						base += 5;
				}
				if (get.cardtag(card, "yingbian_damage")) {
					if (
						targets.some(target => {
							return (
								get.attitude(player, target) < 0 &&
								(hit ||
									!target.mayHaveShan(
										viewer,
										"use",
										target.getCards("h", i => {
											return i.hasGaintag("sha_notshan");
										})
									) ||
									player.hasSkillTag(
										"directHit_ai",
										true,
										{
											target: target,
											card: card,
										},
										true
									)) &&
								!target.hasSkillTag("filterDamage", null, {
									player: player,
									card: card,
									jiu: true,
								})
							);
						})
					)
						base += 5;
				}
				return base;
			},
			canLink(player, target, card) {
				if (!target.isLinked() && !player.hasSkill("wutiesuolian_skill")) return false;
				if (player.hasSkill("jueqing") || player.hasSkill("gangzhi") || target.hasSkill("gangzhi")) return false;
				let obj = {};
				if (get.attitude(player, target) > 0 && get.attitude(target, player) > 0) {
					if (
						(player.hasSkill("jiu") ||
							player.hasSkillTag("damageBonus", true, {
								target: target,
								card: card,
							})) &&
						!target.hasSkillTag("filterDamage", null, {
							player: player,
							card: card,
							jiu: player.hasSkill("jiu"),
						})
					)
						obj.num = 2;
					if (target.hp > obj.num) obj.odds = 1;
				}
				if (!obj.odds)
					obj.odds =
						1 -
						target.mayHaveShan(
							player,
							"use",
							target.getCards("h", i => {
								return i.hasGaintag("sha_notshan");
							}),
							"odds"
						);
				return obj;
			},
			basic: {
				useful: [5, 3, 1],
				value: [5, 3, 1],
			},
			result: {
				target(player, target, card, isLink) {
					let eff = -1.5,
						odds = 1.35,
						num = 1;
					if (isLink) {
						eff = isLink.eff || -2;
						odds = isLink.odds || 0.65;
						num = isLink.num || 1;
						if (
							num > 1 &&
							target.hasSkillTag("filterDamage", null, {
								player: player,
								card: card,
								jiu: player.hasSkill("jiu"),
							})
						)
							num = 1;
						return odds * eff * num;
					}
					if (
						player.hasSkill("jiu") ||
						player.hasSkillTag("damageBonus", true, {
							target: target,
							card: card,
						})
					) {
						if (
							target.hasSkillTag("filterDamage", null, {
								player: player,
								card: card,
								jiu: player.hasSkill("jiu"),
							})
						)
							eff = -0.5;
						else {
							num = 2;
							if (get.attitude(player, target) > 0) eff = -7;
							else eff = -4;
						}
					}
					if (
						!player.hasSkillTag(
							"directHit_ai",
							true,
							{
								target: target,
								card: card,
							},
							true
						)
					)
						odds -=
							0.7 *
							target.mayHaveShan(
								player,
								"use",
								target.getCards("h", i => {
									return i.hasGaintag("sha_notshan");
								}),
								"odds"
							);
					_status.event.putTempCache("sha_result", "eff", {
						bool: target.hp > num && get.attitude(player, target) > 0,
						card: ai.getCacheKey(card, true),
						eff: eff,
						odds: odds,
					});
					return odds * eff;
				},
			},
			tag: {
				respond: 1,
				respondShan: 1,
				damage(card) {
					if (game.hasNature(card, "poison")) return;
					return 1;
				},
				natureDamage(card) {
					if (game.hasNature(card, "linked")) return 1;
				},
				fireDamage(card, nature) {
					if (game.hasNature(card, "fire")) return 1;
				},
				thunderDamage(card, nature) {
					if (game.hasNature(card, "thunder")) return 1;
				},
				poisonDamage(card, nature) {
					if (game.hasNature(card, "poison")) return 1;
				},
			},
		},
		"_priority": 0,
	},
	"madoka_yuanhuan1": {
		trigger: {
			player: ["useCardBegin", "respondBegin"],
		},
		logTarget: "targets",
		sourceSkill: "madoka_yuanhuan",
		filter(event, player) {
			return event.skill == "madoka_yuanhuan";
		},
		forced: true,
		async content(event, trigger, player) {
			delete trigger.skill;
			trigger.getParent().set("madoka_yuanhuan", true);
			while (true) {
				if (event.current == undefined) event.current = player.next;
				if (event.current == player) {
					player.addTempSkill("madoka_yuanhuan3");
					trigger.cancel();
					trigger.getParent().goto(0);
					return;
				} else if (event.current.group == "Law_of_Cycles") {
					const chooseToRespondEvent = event.current.chooseToRespond("是否替" + get.translation(player) + "打出一张杀？", { name: "sha" });
					chooseToRespondEvent.set("ai", () => {
						const event = _status.event;
						return get.attitude(event.player, event.source) - 2;
					});
					chooseToRespondEvent.set("source", player);
					chooseToRespondEvent.set("madoka_yuanhuan", true);
					chooseToRespondEvent.set("skillwarn", "替" + get.translation(player) + "打出一张杀");
					chooseToRespondEvent.noOrdering = true;
					chooseToRespondEvent.autochoose = lib.filter.autoRespondSha;
					const { bool = false, card = null, cards } = await chooseToRespondEvent.forResult();
					if (bool) {
						trigger.card = card;
						trigger.cards = cards;
						trigger.throw = false;
						if (typeof event.current.ai.shown == "number" && event.current.ai.shown < 0.95) {
							event.current.ai.shown += 0.3;
							if (event.current.ai.shown > 0.95) event.current.ai.shown = 0.95;
						}
						return;
					} else event.current = event.current.next;
				} else event.current = event.current.next;
			}
		},
		"_priority": 0,
	},
	"madoka_yuanhuan3": {
		trigger: {
			global: ["useCardAfter", "useSkillAfter", "phaseAfter"],
		},
		silent: true,
		charlotte: true,
		sourceSkill: "madoka_yuanhuan",
		filter(event) {
			return event.skill != "madoka_yuanhuan";
		},
		async content(event, trigger, player) {
			player.removeSkill("madoka_yuanhuan3");
		},
		forced: true,
		popup: false,
		"_priority": 1,
	},

	// 环彩羽
	"iroha_shukun": {
		enable: "phaseUse",
		usable: 4,
		async content(event, trigger, player) {
			player.draw(1);
		},
		ai: {
			order: 9,
			threaten: 2,
			result: {
				player(player) {
					return 1;
				}
			}
		},
	},
	"iroha_dimeng": {
		trigger: {
			player: "gainAfter",
			global: "loseAsyncAfter"
		},
		check(event, player) {
			const n1 = player.countCards("h")
			return game.hasPlayer(function (target) {
				if (player == target) return false;
				if (target.hasSkill("iroha_dimeng_aicount") && target.storage.iroha_dimeng_aicount >= 5) return false;
				if (get.attitude(player, target) > 0) {
					const n01 = player.countCards("h", card => get.value(card, target) >= 0)
					if (n01 == 0) return false;
					if ((n1 >= player.hp + 3 && _status.currentPhase == player) || _status.currentPhase == target)
						return true;
					const n02 = target.countCards("h")
					if (n1 > n02 && ((n1 + n02) % 2 == 0) && ((n1 - n02) / 2 <= n01))
						return true;
				} else {
					return player.hasCard("h", card => get.value(card, player) <= 0 && get.value(card, target) <= 0)
				}
				return false;
			})
		},
		filter(event, player) {
			return event.getg(player).length != 0 && event.getParent(2).name != "iroha_dimeng" && player.countCards("h") >= player.hp && player.countCards("h") > 0;
		},
		async content(event, trigger, player) {

			const n1 = player.countCards("h")
			const n2 = player.isDamaged()

			const result1 = await player
				.chooseTarget("缔盟：请选择要交给手牌的角色", 1, true, function (card, player, target) {
					return player != target;
				}).set("ai", function (target) {
					if (target.hasSkill("iroha_dimeng_aicount") && target.storage.iroha_dimeng_aicount >= 5) return 0
					const n02 = target.countCards("h")
					if (get.attitude(player, target) > 0) {
						const n01 = player.countCards("h", card => get.value(card, target) >= 0)
						const f0 = n01 > 0
						const f1 = (n1 >= player.hp + 3 && _status.currentPhase == player) || _status.currentPhase == target
						const f2 = n1 > n02 && (n1 + n02) % 2 == 0 && (n1 - n02) / 2 <= Math.min(n01, player.hp)
						if (f0 && (f1 || f2)) {
							let value = Math.abs(get.attitude(player, target));
							if (f2) {
								value += 3;
								if (n2 || target.isDamaged()) {
									value += 7;
									if (target.isDamaged() && target.hp == 1)
										value += 8;
								}
							}
							return value;
						}
					} else {
						const n01 = player.countCards("h", card => get.value(card, player) <= 0 && get.value(card, target) <= 0)
						if (n01 > 0) {
							let value = Math.abs(get.attitude(player, target));
							if (n1 > n02 && (n1 + n02) % 2 == 0 && (n1 - n02) / 2 <= Math.min(n01, player.hp)) {
								value += 3;
								if (n2)
									value += 10;
							}
							return value;
						}
					}
					return 0;
				}).forResult();

			if (!result1.bool) return;

			const target1 = result1.targets[0];

			target1.addTempSkill("iroha_dimeng_aicount")
			target1.storage.iroha_dimeng_aicount++
			const n3 = target1.isDamaged()
			const n30 = target1.hp <= 1
			const n4 = target1.countCards("h")

			const att = get.attitude(player, target1)
			const n01 = player.countCards("h", card => get.value(card, target1) >= 0)
			const n02 = player.countCards("h", card => get.value(card, player) <= 0 && get.value(card, target1) <= 0)

			const nsub = (n1 - n4) / 2
			const ncheck = n1 > n4 && (n1 + n4) % 2 == 0 && (nsub <= Math.min((att > 0 ? n01 : n02), player.hp))


			const result2 = await player.chooseCard("h", "缔盟：请选择要交给" + get.translation(target1) + "的至多" + get.cnNumber(player.hp) + "张手牌", true, [1, Math.min(player.hp, player.countCards("h"))])
				.set("ai", function (card) {
					if ((ncheck && ui.selected.cards.length == nsub) || (!ncheck && att > 0 && ui.selected.cards.length == (n1 - player.hp + 1)))
						return -1
					if (att > 0) {
						if (n3 && n30)
							return get.value(card, target1)
						return 1 / get.value(card, target1)
					} else {
						if (get.value(card, player) > 0)
							return -1
						return -get.value(card, target1)
					}
				})
				.forResult();

			if (!result2.bool) return;

			player.line(target1, "green");
			await player.give(result2.cards, target1);

			if (player.countCards("h") == target1.countCards("h")) {
				await player.draw(1);
				await target1.draw(1);
				const f1 = player.isDamaged()
				const f2 = target1.isDamaged()
				if (f1 || f2) {
					const result = await player.chooseTarget("缔盟：请选择要回复体力的角色", 1, false, function (card, player, target) {
						return (target == player || target == target1) && target.isDamaged();
					}).set("ai", function (target) {
						const att = get.attitude(player, target);
						return att + ((att >= 0 && target.hp == 1) ? 3 : 0)
					}).forResult();

					if (!result.bool || result.targets.length == 0) return;

					await result.targets[0].recover(1);
				}
			}
		},
		subSkill: {
			aicount: {
				silent: true,
				charlotte: true,
				onremove: true,
				init(player) {
					player.storage.iroha_dimeng_aicount = 0
				}
			},
		},
		ai: {
			threaten: 4.5,
		},
	},
	"iroha_huanyu": {
		trigger: { player: "damageBegin4" },
		filter(event, player) {
			return event.source
		},
		forced: true,
		logTarget: "source",
		async content(event, trigger, player) {
			const target = trigger.source;
			player.line(target);
			if (target.countCards("h") > player.countCards("h")) {
				const {
					result: { bool },
				} = await target
					.chooseToDiscard("环羽：弃置一张牌，或令对" + get.translation(player) + "造成的伤害-1", "he")
					.set("ai", card => {
						if (get.event("goon")) {
							return 0;
						}
						return 6 - get.value(card);
					})
					.set("goon", get.damageEffect(player, target, target) <= 0);
				if (!bool) {
					trigger.num--;
				}
			} else {
				await player.draw();
			}
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (get.tag(card, "damage") && target != player) {
						if (_status.event.name == "iroha_huanyu") {
							return;
						}
						if (get.attitude(player, target) > 0 && current < 0) {
							return "zeroplayertarget";
						}
						var bs = player.getCards("h");
						bs.remove(card);
						if (card.cards) {
							bs.removeArray(card.cards);
						} else {
							bs.removeArray(ui.selected.cards);
						}
						if (bs.length > target.countCards("h")) {
							if (bs.some(bsi => get.value(bsi) < 7)) {
								return [1, 0, 1, -0.5];
							}
							return [1, 0, 0.3, 0];
						}
						return [1, 0, 1, -0.5];
					}
				},
			},
		},
	},
	"iroha_yuanjiu": {
		zhuSkill: true,
		forbid: ["guozhan"],
		trigger: {
			player: ["chooseToRespondBefore", "chooseToUseBefore"],
		},
		filter(event, player) {
			if (event.responded) return false;
			if (player.storage.yuanjiuing) return false;
			if (!player.hasZhuSkill("iroha_yuanjiu")) return false;
			if (!event.filterCard({ name: "shan", isCard: true }, player, event)) return false;
			return game.hasPlayer(current => current != player && current.group == "Kamihama_Magia_Union");
		},
		check(event, player) {
			if (get.damageEffect(player, event.player, player) >= 0) return false;
			return true;
		},
		async content(event, trigger, player) {
			while (true) {
				let bool;
				if (!event.current) event.current = player.next;
				if (event.current == player) return;
				else if (event.current.group == "Kamihama_Magia_Union") {
					if ((event.current == game.me && !_status.auto) || get.attitude(event.current, player) > 2 || event.current.isOnline()) {
						player.storage.yuanjiuing = true;
						const next = event.current.chooseToRespond("是否替" + get.translation(player) + "打出一张闪？", { name: "shan" });
						next.set("ai", () => {
							const event = _status.event;
							return get.attitude(event.player, event.source) - 2;
						});
						next.set("skillwarn", "替" + get.translation(player) + "打出一张闪");
						next.autochoose = lib.filter.autoRespondShan;
						next.set("source", player);
						bool = await next.forResultBool();
					}
				}
				player.storage.yuanjiuing = false;
				if (bool) {
					trigger.result = { bool: true, card: { name: "shan", isCard: true } };
					trigger.responded = true;
					trigger.animate = false;
					if (typeof event.current.ai.shown == "number" && event.current.ai.shown < 0.95) {
						event.current.ai.shown += 0.3;
						if (event.current.ai.shown > 0.95) event.current.ai.shown = 0.95;
					}
					return;
				} else {
					event.current = event.current.next;
				}
			}
		},
		ai: {
			respondShan: true,
			skillTagFilter(player) {
				if (player.storage.yuanjiuing) return false;
				if (!player.hasZhuSkill("iroha_xiyuan")) return false;
				return game.hasPlayer(current => current != player && current.group == "Kamihama_Magia_Union");
			},
		},
		"_priority": 0,
	},

	// 美国织莉子
	"oriko_yuzhi": {
		group: ["oriko_yuzhi_add", "oriko_yuzhi_lose", "oriko_yuzhi_use"],
		mark: true,
		marktext: "视",
		intro: {
			name: "未来视",
			content: "expansion",
			markcount: "expansion",
		},
		subSkill: {
			"add": {
				trigger: {
					global: "gameStart",
				},
				forced: true,
				content: function () {
					player.addToExpansion(get.cards(game.players.length), player, "draw").gaintag.add("oriko_yuzhi");
				},
				sub: true,
				sourceSkill: "oriko_yuzhi",
				"_priority": 0,
			},
			"lose": {
				trigger: {
					global: "dieAfter",
				},
				forced: true,
				filter: function (event, player) {
					return player.hasExpansions("oriko_yuzhi");
				},
				content: function () {
					player.discard(player.getExpansions("oriko_yuzhi")[0]);
				},
				sub: true,
				sourceSkill: "oriko_yuzhi",
				"_priority": 0,
			},
			"use": {
				trigger: {
					player: ["damageEnd", "phaseDrawAfter"],
				},
				filter: function (event, player) {
					return player.hasExpansions("oriko_yuzhi");
				},
				async content(event, trigger, player) {
					let num = player.countExpansions("oriko_yuzhi");
					player.gain(player.getExpansions("oriko_yuzhi"));
					const result = await player.chooseCard("he", true, "选择" + get.cnNumber(num) + "张牌作为『视』", num).forResult();
					if (result.bool) {
						player.addToExpansion(result.cards, player, "giveAuto").gaintag.add("oriko_yuzhi");
					}
				}

			}
		},
		"_priority": 0,
	},
	"oriko_jiangsha": {
		audio: "ext:魔法纪录/audio/skill:2",
		group: ["oriko_jiangsha2"],
		trigger: {
			global: "judge",
		},
		direct: true,
		filter(event, player) {
			return player.getExpansions("oriko_yuzhi").length && event.player.isIn();
		},
		async content(event, trigger, player) {
			var list = player.getExpansions("oriko_yuzhi");
			const result = await player.chooseButton([get.translation(trigger.player) + "的" + (trigger.judgestr || "") + "判定为" + get.translation(trigger.player.judging[0]) + "，" + get.prompt("oriko_jiangsha"), list, "hidden"], function (button) {
				var card = button.link;
				var trigger = _status.event.getTrigger();
				var player = _status.event.player;
				var judging = _status.event.judging;
				var result = trigger.judge(card) - trigger.judge(judging);
				var attitude = get.attitude(player, trigger.player);
				return result * attitude;
			})
				.set("judging", trigger.player.judging[0])
				.set("filterButton", function (button) {
					var player = _status.event.player;
					var card = button.link;
					var mod2 = game.checkMod(card, player, "unchanged", "cardEnabled2", player);
					if (mod2 != "unchanged") return mod2;
					var mod = game.checkMod(card, player, "unchanged", "cardRespondable", player);
					if (mod != "unchanged") return mod;
					return true;
				})
				.forResult();

			if (!result.bool) return;

			event.forceDie = true;
			player.respond(result.links, "oriko_jiangsha", "highlight", "noOrdering");
			result.cards = result.links;
			var card = result.cards[0];
			event.card = card;

			if (trigger.player.judging[0].clone) {
				trigger.player.judging[0].clone.classList.remove("thrownhighlight");
				game.broadcast(function (card) {
					if (card.clone) {
						card.clone.classList.remove("thrownhighlight");
					}
				}, trigger.player.judging[0]);
				game.addVideo("deletenode", player, get.cardsInfo([trigger.player.judging[0].clone]));
			}
			game.cardsDiscard(trigger.player.judging[0]);
			trigger.player.judging[0] = result.cards[0];
			trigger.orderingCards.addArray(result.cards);
			game.log(trigger.player, "的判定牌改为", card);

			await player.draw(2);
		},
		ai: {
			combo: "oriko_yuzhi",
			rejudge: true,
			tag: {
				rejudge: 0.6,
			},
		},
		"_priority": 0,
	},
	"oriko_jiangsha2": {
		trigger: {
			global: "phaseDiscardAfter",
		},
		forced: true,
		filter(event, player) {
			return player.hasHistory("useSkill", evt => evt.skill == "oriko_jiangsha");
		},
		async content(event, trigger, player) {
			let num = Math.min(player.getHistory("useSkill", evt => evt.skill == "oriko_jiangsha").length);
			const result = await player.chooseCard("he", true, "选择" + get.cnNumber(num) + "张牌作为『视』", num).forResult();
			if (result.bool) {
				player.addToExpansion(result.cards, player, "giveAuto").gaintag.add("oriko_yuzhi");
			}
			player.draw();
		},
		"_priority": 0,
	},
	"oriko_xianzhong": {
		zhuSkill: true,
		forbid: ["guozhan"],
		trigger: {
			global: "damage",
		},
		filter(event, player) {
			// 伤害为0时不触发
			if (event.num <= 0) return false;
			return player.hasZhuSkill("oriko_xianzhong", event.player);
		},
		async cost(event, trigger, player) {
			// 防止其他势力触发
			if (!trigger.source || trigger.source.group != "Law_of_Cycles") return false;
			event.result = await trigger.source
				.chooseBool("是否发动【献种】，令" + get.translation(player) + "摸一张牌？")
				.set("choice", get.attitude(trigger.source, player) > 0)
				.forResult();
		},
		async content(event, trigger, player) {
			trigger.source.line(player, "green");
			player.draw();
		},
		"_priority": 0,
	},

	// 七海八千代
	"yachiyo_zhishui": {
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		filter(event, player) {
			return event.name != "phase" || game.phaseNumber == 0;
		},
		init(player) {
			player.storage.yachiyo_zhishui = 0;
		},
		forced: true,
		async content(event, trigger, player) {
			player.addMark("yachiyo_zhishui", 1)
			player.disableJudge()
		},
		intro: {
			content: "拥有#个标记",
		},
		group: ["yachiyo_zhishui_1", "yachiyo_zhishui_2"],
		subSkill: {
			1:{
				trigger: {
					player: "phaseBegin",
				},
				forced: true,
				filter(event, player) {
					return !player.hasMark("yachiyo_zhishui");
				},
				async content(event, trigger, player) {
					player.addMark("yachiyo_zhishui", 1)
					player.disableJudge()
				},
			},
			2:{
				trigger: { 
					player: "damageEnd"
				},
				filter(event, player) {
					return event.num > 0;
				},
				forced: true,
				async content(event, trigger, player) {
					for (let i = 0; i < trigger.num; i++) {
						const ck = player.hasMark("yachiyo_zhishui")
						player.addMark("yachiyo_zhishui", 1)
						if (ck) {
							await player.draw();
						}
					}
				},
			}
		}
	},
	"yachiyo_jueyu": {
		trigger: { source: "damageBegin1" },
		filter(event, player) {
			const target = event.player;
			return (player.hasMark("yachiyo_zhishui") && !player.getStat("yachiyo_jueyu1")?.includes(target)) || !player.getStat("yachiyo_jueyu2")?.includes(target)
		},
		forced: true,
		async content(event, trigger, player) {
			trigger.cost_data = "yachiyo_jueyu"
			const target = trigger.player
			const str = get.translation(target)
			let choice = ["选项一", "选项二"]
			let str1, str2

			const f1 = player.hasMark("yachiyo_zhishui")
			const f01 = !player.getStat("yachiyo_jueyu1")?.includes(target)
			const f2 = true
			const f02 = !player.getStat("yachiyo_jueyu2")?.includes(target)

			if (!f1) {
				str1 = "无法选择"
				choice.remove("选项一")
			} else {
				if (!f01)
					choice.remove("选项一")
				str1 = "移去一个【止水】标记，对" + str + "造成伤害+1，并获得其一张牌" + (!f01 ? "（本回合已选择过）" : "")
			}

			if (!f2) {
				str2 = "无法选择"
				choice.remove("选项二")
			} else {
				if (!f02)
					choice.remove("选项二")
				str2 = "令" + str + "本回合非charlotte技失效" + (!f02 ? "（本回合已选择过）" : "")
			}

			let aichoice
			if (choice.length == 1)
				aichoice = choice[0]
			else {
				if (f02 && (player.hasSkill("yachiyo_xiji_temp") || get.attitude(player, target) >= 0))
					aichoice = "选项二"
				else
					aichoice = "选项一"
			}

			let result
			if (choice.length == 1)
				result = choice[0]
			else 
				result = await player.chooseControl(choice)
				.set("prompt", "绝雨：请选择一个效果")
				.set("choiceList", [str1, str2])
				.set("choice", aichoice)
				.set("ai", function () {
					return _status.event.choice;
				})
				.forResultControl();

			player.line(target)
			if (result == "选项一") {
				player.storage.yachiyo_zhishui -= 1
				if (player.storage.yachiyo_zhishui == 0)
					player.unmarkSkill("yachiyo_zhishui")
				trigger.num++
				if (target.countGainableCards(player, "he") > 0)
					await player.gainPlayerCard(target, true, "he");
				let stat = player.getStat()
				if (!stat.yachiyo_jueyu1)
					stat.yachiyo_jueyu1 = [];
				stat.yachiyo_jueyu1.push(target);
			} else if (result == "选项二") {
				target.addTempSkill("yachiyo_jueyu_baiban")
				let stat = player.getStat()
				if (!stat.yachiyo_jueyu2)
					stat.yachiyo_jueyu2 = [];
				stat.yachiyo_jueyu2.push(target);
			}
		},
		group: ["yachiyo_jueyu_sha", "yachiyo_jueyu_juedou", "yachiyo_jueyu_draw"],
		preHidden: ["yachiyo_jueyu_sha", "yachiyo_jueyu_juedou"],
		subSkill: {
			draw:{
				trigger: { global: "damageEnd" },
				forced: true,
				filter(event, player) {
					return event.cost_data == "yachiyo_jueyu"
				},
				async content(event, trigger, player) {
					await player.draw(trigger.num)
				},
			},
			baiban: {
				init(player, skill) {
					player.addSkillBlocker(skill);
					player.addTip(skill, "绝雨 技能失效");
				},
				onremove(player, skill) {
					player.removeSkillBlocker(skill);
					player.removeTip(skill);
				},
				inherit: "baiban",
				marktext: "绝",
			},
			sha: {
				audio: "yachiyo_jueyu",
				sourceSkill: "yachiyo_jueyu",
				trigger: { player: "useCardToPlayered" },
				forced: true,
				filter(event, player) {
					return event.card.name == "sha" && !event.getParent().directHit.includes(event.target) && player.hasMark("yachiyo_zhishui");
				},
				logTarget: "target",
				async content(event, trigger, player) {
					const id = trigger.target.playerid;
					const map = trigger.getParent().customArgs;
					if (!map[id]) {
						map[id] = {};
					}
					if (typeof map[id].shanRequired == "number") {
						map[id].shanRequired++;
					} else {
						map[id].shanRequired = 2;
					}
				},
				ai: {
					directHit_ai: true,
					skillTagFilter(player, tag, arg) {
						if (arg.card.name != "sha" || arg.target.countCards("h", "shan") > 1) {
							return false;
						}
					},
				},
			},
			juedou: {
				audio: "yachiyo_jueyu",
				sourceSkill: "yachiyo_jueyu",
				trigger: { player: "useCardToPlayered", target: "useCardToTargeted" },
				forced: true,
				logTarget(trigger, player) {
					return player == trigger.player ? trigger.target : trigger.player;
				},
				filter(event, player) {
					return event.card.name == "juedou" && player.hasMark("yachiyo_zhishui");
				},
				async content(event, trigger, player) {
					const id = (player == trigger.player ? trigger.target : trigger.player)["playerid"];
					const idt = trigger.target.playerid;
					const map = trigger.getParent().customArgs;
					if (!map[idt]) {
						map[idt] = {};
					}
					if (!map[idt].shaReq) {
						map[idt].shaReq = {};
					}
					if (!map[idt].shaReq[id]) {
						map[idt].shaReq[id] = 1;
					}
					map[idt].shaReq[id]++;
				},
				ai: {
					directHit_ai: true,
					skillTagFilter(player, tag, arg) {
						if (arg.card.name != "juedou" || Math.floor(arg.target.countCards("h", "sha") / 2) > player.countCards("h", "sha")) {
							return false;
						}
					},
				},
			},
		},
	},
	"yachiyo_xiji": {
		trigger: { global: "die" },
		preHidden: true,
		forced: true,
		async content(event, trigger, player) {
			await player.recover();
			const cards = trigger.player.getCards("he");
			if (cards.length != 0)
				await player.gain(cards, trigger.player, "giveAuto", "bySelf")
			player.addMark("yachiyo_zhishui", 1)

			player.addSkill("yachiyo_xiji_handmax")
			player.storage.yachiyo_xiji_handmax += 2

			player.addSkill("yachiyo_xiji_temp")
		},
		subSkill: {
			handmax: {
				charlotte: true,
				nopop: true,
				init(player) {
					player.storage.yachiyo_xiji_handmax = 0
				},
				mark: true,
				marktext: "希",
				intro: { content: "手牌上限+#，使用【杀】的次数上限+1" },
				mod: {
					maxHandcardBase(player, num) {
						return player.storage.yachiyo_xiji_handmax + num
					},
				},
			},
			temp: {
				charlotte: true,
				nopop: true,
				mod: {
					cardUsable(card, player, num) {
						if (card.name == "sha") {
							return num + 1;
						}
					}
				},
			}
		},
	},
	"yachiyo_gujun": {
		zhuSkill: true,
		forced: true,
		forbid: ["guozhan"],
		trigger: {
			global: "dyingAfter",
		},
		filter(event, player) {
			if (event.player == player || !event.player.isIn()) return false;
			if (event.player.group != "Kamihama_Magia_Union") return false;
			if (player.hp == player.maxHp) return false;
			if (player.hasSkill("yachiyo_gujun2")) return false;
			return player.hasZhuSkill("yachiyo_gujun", event.player);
		},
		async content(event, trigger, player) {
			player.recover();
			player.addTempSkill("yachiyo_gujun2")
		},
		"_priority": 0,
	},
	"yachiyo_gujun2": {
		"_priority": 0,
	},

	// 玛吉斯
	"magius_jiefang": {
		zhuSkill: true,
		forbid: ["guozhan"],
		global: "magius_jiefang2",
		"_priority": 0,
	},
	"magius_jiefang2": {
		enable: "phaseUse",
		discard: false,
		lose: false,
		delay: false,
		line: true,
		prepare(cards, player, targets) {
			targets[0].logSkill("magius_jiefang");
		},
		prompt() {
			var player = _status.event.player;
			var list = game.filterPlayer(function (target) {
				return target != player && target.hasZhuSkill("magius_jiefang", player);
			});
			var str = "将一张【闪】或黑桃手牌交给" + get.translation(list);
			if (list.length > 1) str += "中的一人";
			return str;
		},
		filter(event, player) {
			if (player.group != "Magius_Wing") return false;
			if (
				!game.hasPlayer(function (target) {
					return target != player && target.hasZhuSkill("magius_jiefang", player) && !target.hasSkill("magius_jiefang3");
				})
			)
				return false;
			return player.hasCard(function (card) {
				return lib.skill.magius_jiefang2.filterCard(card, player);
			}, "h");
		},
		filterCard(card, player) {
			return get.name(card, player) == "shan" || get.suit(card, player) == "spade";
		},
		log: false,
		visible: true,
		filterTarget(card, player, target) {
			return target != player && target.hasZhuSkill("magius_jiefang", player) && !target.hasSkill("magius_jiefang3");
		},
		content() {
			player.give(cards, target);
			target.addTempSkill("magius_jiefang3", "phaseUseEnd");
		},
		ai: {
			expose: 0.3,
			order: 10,
			result: {
				target: 5,
			},
		},
		"_priority": 0,
	},
	"magius_jiefang3": {
		"_priority": 0,
	},
	"magius_zhishang": {
		zhuSkill: true,
		forbid: ["guozhan"],
		locked: true,
		forced: true,
		filter(event, player) {
			if (!event.source || !event.source.isIn() || event.source.group != "Magius_Wing") {
				return false;
			}
			if (!player.hasZhuSkill("magius_zhishang", event.source)) {
				return false;
			}
		},
		direct: true,
		group: "magius_zhishang_jijun",
		global: "magius_zhishang_sha",
		subSkill: {
			sha: {
				mod: {
					cardUsable(card, player, num) {
						if (card.name == "sha") {
							if (player.group != "Magius_Wing") {
								return;
							}
							return (
								num +
								game.countPlayer(current => {
									return current.hasZhuSkill("magius_zhishang", player) || current.group == "Magius_Wing";
								})
							);
						}
					},
				},
			},
			jijun: {
				trigger: {
					global: "useCardAfter",
				},
				forced: true,
				filter(event, player) {
					if (!player.hasZhuSkill("magius_zhishang", event.source)) return false;
					if (get.name(event.card) != "sha") return false;
					if (!event.player || event.player.group != "Magius_Wing") return false;
					return true;
				},
				content() {
					player.useSkill("himena_zhiquan");
				}
			}
		},
	},

	// 晓美焰
	"homura_yeyin": {
		trigger: { player: "phaseZhunbeiBegin" },
		frequent(event, player) {
			return !game.hasPlayer(function (current) {
				return current.name == "ui"
			});
		},
		async content(event, trigger, player) {
			const ck = await player.chooseBool("是否失去1点体力额外观看2张牌？")
				.set('ai', function () {
					if (player.countCards("h", card => card.name == "du") >= player.hp || (player.countCards("h") - 1) >= 2 * player.hp || player.hasJudge("lebu"))
						return false;
					return (player.hp >= 3) ? true : false;
				})
				.forResult();

			const n = ck.bool ? 5 : 3;
			if (n == 5)
				await player.loseHp();

			const cards = get.cards(n);
			const cards2 = [];
			game.cardsGotoOrdering(cards);

			const result = await player.chooseToMove(prompt, true)
				.set("list", [["牌堆顶", cards], ["牌堆底", cards2]])
				.set("prompt", "业因：若你将牌都置于牌堆底，则你跳过弃牌阶段")
				.set("processAI", function (list) {
					const cards = list[0][1].slice(0);

					const poisonCards = cards.filter(card => card.name == 'du');
					const nonPoisonCards = cards.filter(card => card.name != 'du');

					const redCards = nonPoisonCards.filter(card => get.color(card) == 'red');
					const blackCards = nonPoisonCards.filter(card => get.color(card) == 'black');

					if (player.countCards("h", card => card.name == "du") >= player.hp || (player.countCards("h") - 1) >= 2 * player.hp || player.hasJudge("lebu")) {
						return [[], redCards.concat(blackCards.concat(poisonCards))]
					}

					const redValue = redCards.reduce((sum, card) => sum + get.value(card), 0);
					const blackValue = blackCards.reduce((sum, card) => sum + get.value(card), 0);

					const cards1 = redValue >= blackValue ? redCards : blackCards;
					const cards1Value = redValue >= blackValue ? redValue : blackValue;
					const cards2 = redValue >= blackValue ? blackCards : redCards;

					if ((cards1.length <= 1 && cards1Value <= 7)) {
						return [[], cards1.concat(cards2.concat(poisonCards))];
					}
					return [cards1, cards2.concat(poisonCards)];
				})
				.forResult();

			if (result?.bool) {
				let top = result.moved[0];
				let bottom = result.moved[1];

				if (!top.length)
					await player.skip("phaseDiscard");

				top.reverse();
				game.cardsGotoPile(top.concat(bottom), ["top_cards", top], function (event, card) {
					if (event.top_cards.includes(card)) return ui.cardPile.firstChild;
					return null;
				});

			}
		},
		ai: {
			threaten: 3.5
		}
	},
	"homura_shiting": {
		audio: "ext:魔法纪录/audio/skill:2",
		mod: {
			cardUsable(card, player, num) {
				if (card.name == 'sha') return num + player.maxHp - player.hp;
			}
		},
		forced: true,
		charlotte: true,
		trigger: {
			global: "phaseJieshu",
		},
		filter(event, player) {
			return player.countCards("h") == 0;
		},
		async content(event, trigger, player) {
			player.insertPhase();
		},
		ai: {
			noh: true,
		},
		"_priority": 0,
	},
	"homura_juwu": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "phaseZhunbeiBegin" },
		frequent: true,
		async content(event, trigger, player) {
			event.bool = true
			event.color = null

			while(event.bool){
				let next = await player.judge(card => {
					const color = get.color(card);
					if (event.color == null || event.color == color) {
						if (event.color == null)
							event.color = color
						return 1
					}
					return 0
				}).set("judge2", result => result.bool ? true : false).set("callback", lib.skill.homura_juwu.callback).forResult();

				if (!next)
					event.bool = false

			}
		},
		async callback(event, trigger, player) {
			const evt = event.getParent();
			const evt2 = event.getParent(2);
			await player.gain(event.card, "gain2")

			if (evt.result.bool) {
				const result = await player.chooseBool("是否再次发动【聚武】？")
					.set("frequentSkill", "homura_juwu")
					.forResult();
				evt2.bool = result.bool
			} else
				evt2.bool = false
		},
		ai: {
			threaten: 3.5
		},
	},

	// 麻花焰
	"homura_glasses_jihuo": {
		init(player) {
			if (player.storage.homura_glasses_jihuo3?.length >= 4)
				player.useSkill("homura_glasses_jihuo")
		},
		async content(event, trigger, player) {
			await player.draw(2);
			await player.removeSkill("homura_glasses_jihuo3");

			let list = [];
			for (let name of lib.inpile) {
				if (get.type(name) != "basic") {
					continue;
				}
				const card = { name: name, isCard: true, storage: { homura_glasses_jihuo2: true } };
				if (
					lib.filter.cardUsable(card, player, event.getParent("chooseToUse")) &&
					game.hasPlayer(current => {
						return player.canUse(card, current);
					})
				) {
					list.push(["基本", "", name]);
				}
				if (name == "sha") {
					for (let nature of lib.inpile_nature) {
						card.nature = nature;
						if (
							lib.filter.cardUsable(card, player, event.getParent("chooseToUse")) &&
							game.hasPlayer(current => {
								return player.canUse(card, current);
							})
						) {
							list.push(["基本", "", name, nature]);
						}
					}
				}
			}

			if (list.length) {
				const result = await player
					.chooseButton(["集火：视为使用一张基本牌（无次数限制）", [list, "vcard"]])
					.set("ai", function (button) {
						const player = _status.event.player;
						const card = {
							name: button.link[2],
							nature: button.link[3],
							isCard: true,
						};
						if (card.name == "tao") {
							if (player.hp == 1 || (player.hp == 2 && !player.hasShan("all")) || player.needsToDiscard()) {
								return 5;
							}
							return 1;
						}
						if (card.name == "sha") {
							if (
								game.hasPlayer(function (current) {
									return player.canUse(card, current) && get.effect(current, card, player, player) > 0;
								})
							) {
								if (card.nature == "fire") {
									return 2.95;
								}
								if (card.nature == "thunder" || card.nature == "ice") {
									return 2.92;
								}
								return 2.9;
							}
							return 0;
						}
						if (card.name == "jiu") {
							return 0.5;
						}
						return 0;
					})
					.forResult();
				if (result && result.bool && result.links[0]) {
					const card = {
						name: result.links[0][2],
						nature: result.links[0][3],
						isCard: true,
						storage: { homura_glasses_jihuo2: true }
					};
					await player.chooseUseTarget(card, true);
				}
			}
		},
		mod: {
			cardUsable(card, player, num) {
				if (card.storage?.homura_glasses_jihuo2) {
					return Infinity;
				}
			},
		},
		group: ["homura_glasses_jihuo_discard", "homura_glasses_jihuo_judge"],
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
				mark: true,
				marktext: "集",
				intro: {
					content(storage, player) {
						if (storage && storage.length) {
							// const suitOrder = ["spade", "heart", "club", "diamond"];
							// storage.sort((a, b) => suitOrder.indexOf(a) - suitOrder.indexOf(b));
							return "本回合已拾取颜色：" + storage.map(color => get.translation(color));
						}
						return "暂无拾取颜色";
					}
				},

			},
			discard: {
				trigger: { global: ["loseAfter", "loseAsyncAfter"] },
				async cost(event, trigger, player) {
					if (trigger.type != "discard" || trigger.getlx == false)
						return false;

					let validCards = [];
					let cards = trigger.cards.slice(0);
					const evt = trigger.getl(player);
					if (evt && evt.cards) {
						cards.removeArray(evt.cards);
						if (cards.length == 0)
							return false;
					}

					for (var i = 0; i < cards.length; i++) {
						if (cards[i].original != "j" && !player.storage.homura_glasses_jihuo_used?.includes(get.color(cards[i], player)) && get.position(cards[i], true) == "d")
							validCards.push(cards[i]);
					}

					if (validCards.length == 0)
						return false;

					const result = await player.chooseButton(["集火：选择要获得的颜色各不相同的牌", validCards], [1, validCards.length])
						.set("filterButton", function (button) {
							for (var i = 0; i < ui.selected.buttons.length; i++) {
								if (get.color(ui.selected.buttons[i].link) == get.color(button.link))
									return false;
							}
							return true;
						})
						.set("ai", function (button) {
							if (player.storage.homura_glasses_jihuo3?.includes(get.suit(button.link)))
								return get.value(button.link, player) / 2
							return get.value(button.link, player)
						}).forResult();

					event.result = {
						bool: result?.bool,
						cost_data: result?.links,
					};
				},
				async content(event, trigger, player) {
					if (trigger.delay == false)
						game.delay();
					const cards = event.cost_data
					if (cards?.length) {
						await player.gain(cards, "gain2");
						for (let i = 0; i < cards.length; i++) {
							if (!player.storage.homura_glasses_jihuo3?.includes(get.suit(cards[i]))) {
								await player.addSkill("homura_glasses_jihuo3");
								await player.markAuto("homura_glasses_jihuo3", get.suit(cards[i]))
							}
							if (!player.storage.homura_glasses_jihuo_used?.includes(get.color(cards[i]))) {
								await player.addTempSkill("homura_glasses_jihuo_used", "phaseAfter");
								await player.markAuto("homura_glasses_jihuo_used", get.color(cards[i]));
							}
						}
						if (player.storage.homura_glasses_jihuo3?.length >= 4)
							await player.useSkill("homura_glasses_jihuo");
					}
				}
			},
			judge: {
				trigger: { global: "cardsDiscardAfter" },
				async cost(event, trigger, player) {
					const evt = trigger.getParent().relatedEvent;
					if (!evt || evt.name != "judge" || evt.player == player)
						return false;

					if (get.position(trigger.cards[0], true) != "d" || player.storage.homura_glasses_jihuo_used?.includes(get.color(trigger.cards[0], player)))
						return false;

					const result = await player.chooseButton(["集火：选择要获得的颜色各不相同的牌", trigger.cards], [1, trigger.cards.length])
						.set("filterButton", function (button) {
							for (var i = 0; i < ui.selected.buttons.length; i++) {
								if (get.color(ui.selected.buttons[i].link) == get.color(button.link))
									return false;
							}
							return true;
						})
						.set("ai", function (button) {
							if (player.storage.homura_glasses_jihuo3?.includes(get.suit(button.link)))
								return get.value(button.link, player) / 2
							return get.value(button.link, player)
						}).forResult();

					event.result = {
						bool: result?.bool,
						cost_data: result?.links,
					};
				},
				async content(event, trigger, player) {
					if (trigger.delay == false)
						game.delay();
					const cards = event.cost_data
					if (cards?.length) {
						await player.gain(cards, "gain2");
						for (let i = 0; i < cards.length; i++) {
							if (!player.storage.homura_glasses_jihuo3?.includes(get.suit(cards[i]))) {
								await player.addSkill("homura_glasses_jihuo3");
								await player.markAuto("homura_glasses_jihuo3", get.suit(cards[i]))
							}
							if (!player.storage.homura_glasses_jihuo_used?.includes(get.color(cards[i]))) {
								await player.addTempSkill("homura_glasses_jihuo_used", "phaseAfter");
								await player.markAuto("homura_glasses_jihuo_used", get.color(cards[i]));
							}
						}
						if (player.storage.homura_glasses_jihuo3?.length >= 4)
							await player.useSkill("homura_glasses_jihuo");
					}
				},
			},
		},
	},
	"homura_glasses_jihuo3": {
		onremove: true,
		charlotte: true,
		intro: {
			content(storage, player) {
				if (storage && storage.length) {
					const suitOrder = ["spade", "heart", "club", "diamond"];
					storage.sort((a, b) => suitOrder.indexOf(a) - suitOrder.indexOf(b));
					return "集火记录花色：" + storage.map(suit => get.translation(suit));
				}
				return "暂无记录花色";
			}
		},
		mark: true,
		marktext: "弹",
	},
	"homura_glasses_baopo": {
		enable: "chooseToUse",
		hiddenCard(player, name) {
			return name == "huogong" && player.hasCard(card => {
				return !player.storage.homura_glasses_baopo_used?.includes(get.suit(card));
			}, "he");
		},
		filterCard(card, player) {
			return !player.storage.homura_glasses_baopo_used?.includes(get.suit(card));
		},
		viewAs: { name: "huogong" },
		viewAsFilter(player) {
			return player.hasCard(card => {
				return !player.storage.homura_glasses_baopo_used?.includes(get.suit(card));
			}, "he");
		},
		position: "he",
		prompt: "将一张牌当火攻使用",
		async precontent(event, trigger, player) {
			player.addTempSkill("homura_glasses_baopo_used", "phaseAfter");
			player.markAuto("homura_glasses_baopo_used", get.suit(event.result.cards[0]));
		},
		check(card) {
			const player = get.player();
			if (player.countCards("h") >= player.hp) {
				return skills.duexcept_ai(6 - get.value(card), card, player);
			}
			return skills.duexcept_ai(3 - get.value(card), card, player);
		},
		ai: {
			order: 7.9,
			fireAttack: true,
		},
		group: "homura_glasses_baopo_effect",
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
				mark: true,
				marktext: "聚",
				intro: {
					content(storage, player) {
						if (storage && storage.length) {
							const suitOrder = ["spade", "heart", "club", "diamond"];
							storage.sort((a, b) => suitOrder.indexOf(a) - suitOrder.indexOf(b));
							return "本回合已火攻花色：" + storage.map(suit => get.translation(suit));
						}
						return "暂无火攻花色";
					}
				},
			},
			effect: {
				trigger: { global: "damageSource" },
				filter(event, player) {
					return event.card && event.card.name == "huogong" && event.source == player
				},
				usable: 1,
				forced: true,
				async content(event, trigger, player) {
					let ran = []
					const suits = ["spade", "heart", "club", "diamond"]
					for (var i = 0; i < suits.length; i++) {
						if (!player.storage.homura_glasses_jihuo3?.includes(suits[i]))
							ran.push(suits[i]);
					}

					await player.addSkill("homura_glasses_jihuo3");
					if (ran.length) {
						ran = ran.randomGets(2);
						for (var i = 0; i < ran.length; i++)
							await player.markAuto("homura_glasses_jihuo3", ran[i])
					}


					if (player.storage.homura_glasses_jihuo3?.length >= 4 && player.hasSkill("homura_glasses_jihuo"))
						await player.useSkill("homura_glasses_jihuo");
				},
			},
		},
	},
	"homura_glasses_liandan": {
		enable: "chooseToUse",
		hiddenCard(player, name) {
			return name == "tiesuo" && player.hasCard(card => {
				return !player.storage.homura_glasses_liandan_used?.includes(get.suit(card));
			}, "he");
		},
		filterCard(card, player) {
			return !player.storage.homura_glasses_liandan_used?.includes(get.suit(card));
		},
		viewAs: { name: "tiesuo" },
		viewAsFilter(player) {
			return player.hasCard(card => {
				return !player.storage.homura_glasses_liandan_used?.includes(get.suit(card));
			}, "he");
		},
		position: "he",
		prompt: "将一张牌当铁索连环使用",
		async precontent(event, trigger, player) {
			player.addTempSkill("homura_glasses_liandan_used", "phaseAfter");
			player.markAuto("homura_glasses_liandan_used", get.suit(event.result.cards[0]));
		},
		ai1(card) {
			return skills.duexcept_ai(6 - get.value(card), card, get.player());
		},
		ai2(target) {
			const player = get.player();
			return get.effect(target, { name: "tiesuo" }, player, player);
		},
		ai: {
			order(item, player) {
				if (game.hasPlayer(current => get.effect(current, { name: "tiesuo" }, player, player) > 0)) {
					return 8;
				}
				return 1;
			},
			result: { player: 1 },
		},
		group: "homura_glasses_liandan_effect",
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
				mark: true,
				marktext: "链",
				intro: {
					content(storage, player) {
						if (storage && storage.length) {
							const suitOrder = ["spade", "heart", "club", "diamond"];
							storage.sort((a, b) => suitOrder.indexOf(a) - suitOrder.indexOf(b));
							return "本回合已铁索花色：" + storage.map(suit => get.translation(suit));
						}
						return "暂无铁索花色";
					}
				},
			},
			effect: {
				trigger: { global: "linkAfter" },
				usable: 1,
				forced: true,
				filter(event, player) {
					if (event.player.isLinked())
						return false;

					const evt = event.getParent("useCard");
					if (evt?.card?.name != "tiesuo")
						return false;

					if (evt.player != player)
						return false;
					return true
				},
				async content(event, trigger, player) {
					let ran = []
					const suits = ["spade", "heart", "club", "diamond"]
					for (var i = 0; i < suits.length; i++) {
						if (!player.storage.homura_glasses_jihuo3?.includes(suits[i]))
							ran.push(suits[i]);
					}

					await player.addSkill("homura_glasses_jihuo3");
					if (ran.length) {
						ran = ran.randomGets(2);
						for (var i = 0; i < ran.length; i++)
							await player.markAuto("homura_glasses_jihuo3", ran[i])
					}

					if (player.storage.homura_glasses_jihuo3?.length >= 4 && player.hasSkill("homura_glasses_jihuo"))
						await player.useSkill("homura_glasses_jihuo");
				},
				ai: {
					expose: 0.2,
				},
			},
		},
	},

	// 缎带焰
	"homura_lunzhuan": {
		forced: true,
		zhuanhuanji: true,
		mark: true,
		marktext: "☯",
		usable: 1,
		derivation: ["homura_juwu", "madoka_pomo"],
		trigger: { player: "phaseZhunbeiBegin" },
		async content(event, trigger, player) {
			let skillName = player.storage.homura_lunzhuan ? "madoka_pomo" : "homura_juwu";
			player.addTempSkill(skillName, "phaseEnd");
			player.changeZhuanhuanji("homura_lunzhuan");
			player.skip("phaseDiscard");
		},
	},
	"homura_chongyuan": {
		trigger: { player: "phaseUseEnd" },
		group: ["homura_chongyuan_addTurn"],
		async content(event, trigger, player) {
			const targets = await player.chooseTarget(get.prompt2("homura_chongyuan"), function (card, player, target) {
				return target != player && target.isAlive();
			}).set("ai", function (target) {
				return get.attitude(_status.event.player, target) > 0;
			}).forResult();

			if (!targets.bool) {
				return;
			}

			let target = targets.targets[0];
			await target.skip("phaseDiscard");
			player.line(target, "green");
			game.log(player, "发动了技能【重圆】，令", target, "跳过弃牌阶段");
		},
		subSkill: {
			"addTurn": {
				round: 1,
				trigger: {
					global: ["phaseDiscardSkipped", "phaseDiscardCancelled"],
				},
				filter(event, player) {
					return event.player != player;
				},
				async content(event, trigger, player) {
					player.insertPhase();
				},
			}
		},
	},

	// 柊音梦
	"nemu_zhiyao": {
		audio: "ext:魔法纪录/audio/skill:2",
		forced: true,
		trigger: {
			player: ["damageEnd", "loseHpEnd"],
		},
		mark: true,
		marktext: "谣",
		intro: {
			name: "谣",
			content: "当前谣数：#",
		},
		filter(event, player) {
			return event.num > 0;
		},
		async content(event, trigger, player) {
			let num = trigger.num;
			for (let i = 0; i < num; i++) {
				const result = await player.judge(function (card) {
					// 使用get函数访问能让ai改判
					if (get.color(card) == "black") {
						return 5;
					}
					return -5;
				}).forResult();
				if (result.bool) player.addMark("nemu_zhiyao", 2);
			}
		},
		ai: {
			threaten: 1.5,
			maixie: true,
		},
		"_priority": 0,
	},
	"nemu_sanyao": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			global: "phaseBegin",
		},
		filter(event, player) {
			return player.hasMark("nemu_zhiyao");
		},
		async cost(event, trigger, player) {
			let markNum = player.countMark("nemu_zhiyao");
			let choices = ["一个标记"]
			if (markNum >= 2) choices.push("两个标记");
			if (markNum >= 3) choices.push("三个标记");
			choices.push("cancel");

			const result = await player.chooseControl(choices)
				.set("ai", () => {
					const target = _status.currentPhase;
					let attitude = get.attitude(player, target);
					let markNum = player.countMark("nemu_zhiyao");

					if (markNum == 1 && attitude < 0 && (target.hp - player.hp >= 2 || target.hp == 1)) return 0;
					if (markNum >= 3 && attitude < 0 && target.hasSkillTag('threaten')) return 2;
					if (markNum >= 2 && ((attitude < 0 && target.countCards("j") == 0)) || (attitude > 0 && target.countCards("j") > 0)) return 1;
					return -1;
				})
				.set("prompt", "请选择标记数")
				.forResult();

			let stage = 0;
			if (result.index == 1) {
				let phase = ["判定阶段", "摸牌阶段", "出牌阶段", "弃牌阶段", "cancel"];
				let choosePhase = await player.chooseControl(phase)
					.set("ai", () => {
						const target = _status.currentPhase;
						let attitude = get.attitude(player, target);
						let markNum = player.countMark("nemu_zhiyao");

						if (attitude > 0) {
							if (target.countCards("j") > 0) return 0;
							if (target.countCards("s") - target.hp >= 0) return 3;
						}
						if (attitude < 0) {
							if (target.countCards("h") <= 1) return 1;
							return 2;
						}
						return -1;
					})
					.set("prompt", "请选择跳过阶段")
					.forResult();
				stage = choosePhase.index;
				game.log(player, "跳过了", trigger.player, "的" + phase[stage]);
			}

			if (result.index != -1 && stage != -1) {
				player.removeMark("nemu_zhiyao", result.index + 1);
				player.line(trigger.player);
			}

			event.result = {
				bool: result.index == -1 || stage == -1 ? false : true,
				cost_data: {
					result: result.index,
					stage_data: stage,
				}
			}
		},
		async content(event, trigger, player) {
			switch (event.cost_data.result) {
				case 0:
					trigger.player.damage();
					break;
				case 1:
					switch (event.cost_data.stage_data) {
						case 0:
							trigger.player.skip("phaseJudge");
							break;
						case 1:
							trigger.player.skip("phaseDraw");
							break;
						case 2:
							trigger.player.skip("phaseUse");
							break;
						case 3:
							trigger.player.skip("phaseDiscard");
							break;
					}
					break;
				case 2:
					trigger.cancel();
					trigger.player.turnOver();
					break;
			}
		},
		"_priority": 0,
	},
	"nemu_tiruo": {
		trigger: {
			player: "phaseJieshuBegin",
		},
		forced: true,
		filter(event, player) {
			return !player.isMinHp();
		},
		async content(event, trigger, player) {
			player.loseHp();
		},
		ai: {
			combo: "nemu_zhiyao",
		},
		"_priority": 0,
	},

	// 阿什莉
	"ashley_yuanyu": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "damageBegin4",
		},
		forced: true,
		preHidden: true,
		check(event, player) {
			return true;
		},
		filter(event, player) {
			if (event.num <= 0 || !event.source) return false;
			var n1 = player.getNext();
			var p1 = player.getPrevious();
			if (event.source != n1 && event.source != p1) return true;
		},
		content() {
			trigger.cancel();
		},
		ai: {
			effect: {
				target(card, player, target) {
					if (player.hasSkillTag("jueqing", false, target)) return;
					if (player == target.getNext() || player == target.getPrevious()) return;
					if (get.tag(card, "damage")) return "zeroplayertarget";
				},
			},
		},
		"_priority": 0,
	},
	"ashley_mengshu": {
		enable: "phaseUse",
		filter(event, player) {
			return player.countCards("hs", { suit: "spade" }) > 0;
		},
		chooseButton: {
			dialog(event, player) {
				var list = ["yuanjiao", "zhibi"];
				for (var i = 0; i < list.length; i++) {
					list[i] = ["锦囊", "", list[i]];
				}
				return ui.create.dialog("萌术", [list, "vcard"]);
			},
			filter(button, player) {
				var name = button.link[2];
				if (player.storage.gzguishu_used == 1 && name == "yuanjiao") return false;
				if (player.storage.gzguishu_used == 2 && name == "zhibi") return false;
				return lib.filter.filterCard({ name: name }, player, _status.event.getParent());
			},
			check(button) {
				var player = _status.event.player;
				if (button.link == "yuanjiao") {
					return 3;
				}
				if (button.link == "zhibi") {
					if (player.countCards("hs", { suit: "spade" }) > 2) return 1;
					return 0;
				}
			},
			backup(links, player) {
				return {
					filterCard: { suit: "spade" },
					position: "hs",
					popname: true,
					ai(card) {
						return 6 - ai.get.value(card);
					},
					viewAs: { name: links[0][2] },
					precontent() {
						player.addTempSkill("gzguishu_used");
						player.storage.gzguishu_used = ["yuanjiao", "zhibi"].indexOf(event.result.card.name) + 1;
					},
				};
			},
			prompt(links, player) {
				return "###萌术###将一张黑桃手牌当作【" + get.translation(links[0][2]) + "】使用";
			},
		},
		ai: {
			order: 4,
			result: {
				player: 1,
			},
			threaten: 2,
		},
		subSkill: {
			backup: {
				sub: true,
				sourceSkill: "ashley_mengshu",
				"_priority": 0,
			},
			used: {
				charlotte: true,
				onremove: true,
				sub: true,
				sourceSkill: "ashley_mengshu",
				"_priority": 0,
			},
		},
		"_priority": 0,
	},

	// 环忧
	"ui_jinghua": {
		trigger: { global: "phaseJieshu" },
		direct: true,
		filter(event, player) {
			return event.player != player
		},
		check(event, player) {
			return get.attitude(player, event.player) > 0 || player.countMark("ui_jinghua_used") < game.countPlayer()
		},
		async content(event, trigger, player) {
			player.line(trigger.player);
			await trigger.player.judge(function (card) {
				if (get.color(card) == "red")
					return 2
				if (get.color(card) == "black")
					return 1
				return 0
			}).set("callback", lib.skill.ui_jinghua.callback);
		},
		async callback(event, trigger, player) {
			const tplayer = event.getParent(2).player
			const card = event.judgeResult.card || trigger.card;
			if (get.color(card) == "red") {
				const result = await tplayer.chooseBool(
					"净化：是否令" + get.translation(player) + "摸两张牌？"
				).set("ai", () => {
					return get.attitude(tplayer, player) > 0 ? true : false;
				}).forResult();
				if (result.bool) {
					await player.draw(2);
				}
			}
		},
		ai: {
			expose: 0.2,
			result: {
				player(player) {
					return 1;
				}
			}
		},
		group: ["ui_jinghua_judge"],
		subSkill: {
			used: {
				onremove: true,
				charlotte: true,
				intro: {
					content: "【净化】②：本轮已发动#次",
				},
			},
			judge: {
				trigger: { global: "judgeFixing" },
				usable(skill, player) {
					return game.countPlayer()
				},
				filter(event, player) {
					return event.result && event.result.color == "black" && player.countMark("ui_jinghua_used") < game.countPlayer()
				},
				check(event, player) {
					return event.result.judge * get.attitude(player, event.player) <= 0 && !(event.result.judge == 0 && get.attitude(player, event.player) > 0)
				},
				frequent: true,
				async cost(event, trigger, player) {
					event.result = await player.chooseBool(
						"净化：是否中止" + get.translation(trigger.player) + "的判定，并获得【" + get.translation(trigger.result) + "】？"
					).set("ai", () => {
						return trigger.result.judge * get.attitude(player, trigger.player) <= 0 && !(trigger.result.judge == 0 && get.attitude(player, trigger.player) > 0)
					}).forResult();
				},
				async content(event, trigger, player) {
					player.addTempSkill("ui_jinghua_used", "roundStart")
					player.addMark("ui_jinghua_used")
					const evt = trigger.getParent();
					if (evt.name == "phaseJudge") {
						evt.excluded = true;
					} else {
						evt.finish();
						evt._triggered = null;
						if (evt.name.startsWith("pre_")) {
							const evtx = evt.getParent();
							evtx.finish();
							evtx._triggered = null;
						}
						const nexts = trigger.next.slice();
						for (const next of nexts) {
							if (next.name == "judgeCallback") {
								trigger.next.remove(next);
							}
						}
						const evts = game.getGlobalHistory("cardMove", function (evt) {
							return evt.getParent(2) == trigger.getParent();
						});
						const cards = [];
						for (let i = evts.length - 1; i >= 0; i--) {
							const evt = evts[i];
							for (const card of evt.cards) {
								if (get.position(card, true) == "o") {
									cards.push(card);
								}
							}
						}
						trigger.orderingCards.addArray(cards);
					}

					player.line(trigger.player)
					if (get.position(trigger.result.card) == "d")
						await player.gain(trigger.result.card, "gain2");
					if (trigger.player.isIn() && player.canUse({ name: "sha", nature: "thunder", isCard: true }, trigger.player, false)) {
						const result = await player.chooseBool(
							"净化：是否视为对" + get.translation(trigger.player) + "使用一张雷【杀】？"
						).set("ai", () => {
							return get.effect(trigger.player, { name: "sha" }, player, player) > 0;
						}).forResult();
						if (result.bool)
							await player.useCard({ name: "sha", nature: "thunder", isCard: true }, trigger.player, false);
					}
				},
			}
		},
	},
	"ui_jieyou": {
		trigger: {
			player: "phaseBegin"
		},
		frequent: true,
		async cost(event, trigger, player) {
			const result = await player
				.chooseTarget([1, Infinity], "获得技能【强运】，弃置其判定区的所有牌，重置连环翻面，摸牌", function (card, player, target) {
					return !target.hasSkill("tsuruno_qiangyun");
				})
				.set("ai", function (target) {
					return get.attitude(player, target) > 0;
				})
				.forResult();

			event.result = {
				bool: result.bool,
				targets: result?.targets
			}
		},
		async content(event, trigger, player) {
			const result = event.targets

			player.line(result, "green");

			result.sortBySeat()
			for (let target of result) {
				target.addAdditionalSkills("ui_jieyou_" + player.playerid, "tsuruno_qiangyun", true);
				target.addSkill("ui_jieyou_mark");
				if (target.countCards("j"))
					await target.discard(target.getCards("j"));
				if (target.isLinked())
					await target.link(false);
				if (target.isTurnedOver())
					await target.turnOver(false);
				await target.draw()
			}
			player.addTempSkill("ui_jieyou_clear", { player: "phaseBeginStart" });
			await player.draw(Math.ceil(result.length / 2));
		},
		subSkill: {
			clear: {
				charlotte: true,
				onremove(player) {
					game.countPlayer(function (current) {
						current.removeAdditionalSkills("ui_jieyou_" + player.playerid);
						current.removeSkills("ui_jieyou_mark");
					});
				},
			},
			mark: {
				mark: true,
				marktext: "解",
				nopop: true,
				charlotte: true,
				onremove: true,
				intro: {
					content() {
						return "【净化】：锁定技，当你横置时，取消之；当你翻面后，你翻回正面朝上。你不能成为延时类锦囊的目标。"
					}
				}
			},
		},
	},

	// 和美
	"kazumi_xingyun": {
		trigger: {
			global: "die",
		},
		forced: true,
		zhuSkill: true,
		forbid: ["guozhan"],
		async content(event, trigger, player) {
			player.addToExpansion(get.cards(), "draw").gaintag.add("qixing");
		},
		"_priority": 0,
	},

	// 深月菲莉西亚
	"felicia_chuiji": {
		audio: 2,
		trigger: { global: "useCardToPlayered" },
		group: "felicia_chuiji_3",
		direct: true,
		filter(event, player) {
			return event.card.name == "sha" && (player.inRange(event.target) || event.player == player) && event.target.hp > 0 && event.target.countCards("he") > 0;
		},
		preHidden: true,
		async content(event, trigger, player) {
			const discardcount = trigger.player == player ? Math.min(trigger.target.hp, trigger.target.countCards("he")) : 1
			const next = player.choosePlayerCard(
				trigger.target, 
				"he", 
				[1, discardcount], 
				"锤击：盖覆" + get.translation(trigger.target) + "至多" + discardcount + "张牌", 
			);
			
			next.set("ai", function (button) {
				if (!_status.event.goon) {
					return 0;
				}

				var val = get.value(button.link);
				var hasRedCard = false;
				for (var i = 0; i < ui.selected.buttons.length; i++) {
					if (get.color(ui.selected.buttons[i].link) == "red") {
						hasRedCard = true;
						break;
					}
				}
				

				if (button.link == _status.event.target.getEquip(2)) {
					return 2 * (val + 2);
				} else if (!hasRedCard && get.color(button.link) == "red") {
					return val + 5;
				}
				return val;
			});
			
			next.set("goon", get.attitude(player, trigger.target) <= 0);
			next.set("forceAuto", true);
			next.setHiddenSkill(event.name);
			
			const result = await next.forResult();
			
			if (result.bool) {
				var target = trigger.target;
				player.logSkill("felicia_chuiji", target);
				target.addSkill("felicia_chuiji_2");

				const cards = result.cards;
				await target.addToExpansion("giveAuto", cards, target).gaintag.add("felicia_chuiji_2");

				for (var i of cards) {
					if (get.color(i) == "red"){

						const discard = await player.chooseButton(
							[
								"锤击：可以选择一张牌置入弃牌堆",
								cards.filter(function (card) {
									return get.color(card) == "red";
								}),
							],
							false
						).set("ai", function (button) {
							return get.value(button.link, _status.event.getTrigger().target);
						}).forResult();

						if (discard?.links?.length) {
							await target.loseToDiscardpile(discard.links);
						}
						break;
					}
				}
			} else {
				const n = Math.random()
				let target
				if (n < 0.5) 
					target = trigger.target
				else
					target = player

				player.line(target);
				await target.draw()
			}
		},
		ai: {
			unequip_ai: true,
			directHit_ai: true,
			skillTagFilter(player, tag, arg) {
				if (get.attitude(player, arg.target) > 0) {
					return false;
				}
				if (tag == "directHit_ai") {
					return arg.target.hp >= Math.max(1, arg.target.countCards("h") - 1);
				}
				if (arg && arg.name == "sha" && arg.target.getEquip(2)) {
					return true;
				}
				return false;
			},
			threaten: 2.5,
		},
		subSkill:{
			2: {
				trigger: { global: "phaseEnd" },
				forced: true,
				popup: false,
				charlotte: true,
				sourceSkill: "felicia_chuiji",
				filter(event, player) {
					return player.getExpansions("felicia_chuiji_2").length > 0;
				},
				async content(event, trigger, player) {
					var cards = player.getExpansions("felicia_chuiji_2");
					await player.gain(cards, "draw");
					player.removeSkill("felicia_chuiji_2");
				},
				intro: {
					markcount: "expansion",
					mark(dialog, storage, player) {
						var cards = player.getExpansions("felicia_chuiji_2");
						if (player.isUnderControl(true)) {
							dialog.addAuto(cards);
						} else {
							return "共有" + get.cnNumber(cards.length) + "张牌";
						}
					},
				},
			},
			3: {
				audio: "felicia_chuiji",
				trigger: { source: "damageBegin1" },
				filter(event, player) {
					const target = event.player;
					return event.card && event.card.name == "sha" && event.getParent("sha", true)?.targets?.includes(target) && player.countCards("h") >= target.countCards("h");
				},
				forced: true,
				logTarget: "player",
				preHidden: true,
				async content(event, trigger, player) {
					trigger.num++;
				},
			},
		},
	},
	"felicia_yongbing":{
		trigger: { player: "damageEnd", source: "damageSource" },
		group: ["felicia_yongbing_2"],
		filter(event, player) {
			return event.source && event.source.isIn() && event.num >= 2;
		},
		forced: true,
		preHidden: true,
		async content(event, trigger, player) {
			
			const rplayer = trigger.source;
			if (rplayer == player) {
				await player.draw();
			}else{
				
				const next = player.chooseControl(["自己摸牌", "伤害来源摸牌"])
					.set("prompt", `佣兵：请选择一项`)
					.set("choice", get.attitude(player, rplayer) > 0 ? "伤害来源摸牌" : "自己摸牌")
					.set("ai", function () {
						return _status.event.choice;
					});
					
				const control = await next.forResultControl();
				
				if (control == "自己摸牌") {
					await player.draw();
				} else if (control == "伤害来源摸牌") {
					await rplayer.draw();
				}
			}
		},
		subSkill: {
			2: {
				trigger: {
					player: ["changeHp"],
				},
				audio: 2,
				forced: true,
				filter(event, player) { 
					return get.sgn(player.hp - 2.5) != get.sgn(player.hp - 2.5 - event.num); 
				}, 
				content() {},
				mod: {
					globalFrom: function(from, to, current) {
						return from.hp <= 2 ? current - 4 : current - 2;
					}, 
					globalTo: function(from, to, current) {
						return to.hp <= 2 ? current + 2 : current + 1;
					}
				},
				ai: {
					threaten: 1.5,
				},
			}
		},
	},
	// 二叶莎奈
	"sana_dunwei":{
		trigger: { player: "phaseJieshuBegin" },
		check(event, player) {
			return player.countCards("h") <= 5
		},
		filter(event, player) {
			return player.countCards("h") < 9;
		},
		async content(event, trigger, player) {
			await player.draw(9 - player.countCards("h"));

			player.storage.sana_touming_2 = "sana_dunwei";
			await player.turnOver();
			delete player.storage.sana_touming_2;

			let whileck = player.countCards("h", card => get.type(card) == "equip") > 0 ? true : false;
			while (whileck) { 

				const result = await player.chooseCardTarget({
					prompt: "可以选择任意数量的装备牌，并选择任意角色使用之",
					filterCard(card, player) {
						if (ui.selected.targets.length > 0) {
							const target = ui.selected.targets[0];
							return target.canUse(card, target)
						}
						return get.type(card) == "equip";
					},
					filterTarget(card, player, target) {
						if (ui.selected.cards.length > 0) {
							const card = ui.selected.cards[0];
							return target.canUse(card, target)
						}
						return true;
					},
					position: "h",
					selectCard: 1,
					selectTarget: 1,
					goon: player.hasCard(function (card) {
						return get.type(card) == "equip" && game.hasPlayer(function (current) {
							return get.equipValue(card) > 0 && get.effect(current, card, player, player) > 0 && current.canUse(card, current)
						}), "h"
					}),
					ai1(card) {
						if (!_status.event.goon)
							return 0;
						return get.equipValue(card)
					},
					ai2(target) {
						if (!_status.event.goon)
							return 0;
						return get.effect(target, ui.selected.cards[0], player, player)
					}
				}).forResult();

				if (result.bool) {
					player.line(result.targets[0]);
					await result.targets[0].equip(result.cards[0]);
				}

				whileck = player.countCards("h", card => get.type(card) == "equip") > 0 ? result.bool : false;
			}
		},
	},
	"sana_touming": {
		trigger: {
			target: "shaBefore",
		},
		forced: true,
		group: ["sana_touming_2"],
		filter(event, player) {
			return player.isTurnedOver();
		},
		async content(event, trigger, player) {
			trigger.cancel();
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (card.name == "sha" && target.isTurnedOver()) return "zeroplayertarget";
				},
			},
		},
		subSkill: {
			2: {
				trigger: { player: "turnOverEnd" },
				filter (event, player) {
					return player.getStorage("sana_touming_2").length > 0;
				},
				async cost(event, trigger, player) {
					const result = await player.chooseTarget("你可以选择一名角色：直到下个你的回合开始，只要你翻面，【杀】对其无效，并且可以额外摸牌", function(card, player, target) {
						return target != player;
					})
					.set("ai", function (target) {
						return get.attitude(player, target);
					})
					.forResult();

					event.result = {
						bool: result.bool,
						cost_data: result.bool ? result.targets[0] : null
					}
				},
				async content(event, trigger, player) {
					const target = event.cost_data
					player.line(target);

					player.addTempSkill("sana_touming_3", { player: "phaseBeginStart" })
					player.storage.sana_touming_3 = target;

					target.storage.sana_touming_4 = player;
					target.addTempSkill("sana_touming_4", { player: "dieAfter" });

				},
			},
			3: {
				charlotte: true,
				trigger: {
					global: "shaBefore",
				},
				forced: true,
				onremove(player){
					player.storage.sana_touming_3?.removeSkill("sana_touming_4");
					delete player.storage.sana_touming_3;
				},
				filter(event, player) {
					return player.isTurnedOver() && player.storage.sana_touming_3 == event.target;
				},
				async content(event, trigger, player) {
					trigger.cancel();
				},
			},
			4: {
				charlotte: true,
				mark: "character",
				intro: {
					content: "只要$翻面，【杀】对你无效。摸牌阶段额外摸你装备区数量的牌",
				},
				trigger: { player: "phaseDrawBegin2" },
				silent: true,
				filter(event, player) {
					return !event.numFixed && player.countCards("e")
				},
				async content(event, trigger, player) {
					trigger.num += player.countCards("e")
				},
				onremove: true,
				ai: {
					effect: {
						target: function (card, player, target) {
							if (card.name == "sha" && target.storage.sana_touming_4?.isTurnedOver()) return "zeroplayertarget";
						},
					},
				},
			}
		},
	},
	"sana_duntu":{
		mod: {
			aiValue(player, card, num) {
				if (get.name(card) != "wuxie" && !(player.isTurnedOver() ? !(get.type2(card) == "trick") : get.type(card) == "equip")) {
					return;
				}
				var cards = player.getCards("hs", function (card) {
					return get.name(card) == "wuxie" || (player.isTurnedOver() ? !(get.type2(card) == "trick") : get.type(card) == "equip");
				});
				cards.sort(function (a, b) {
					return (get.name(b) == "wuxie" ? 1 : 2) - (get.name(a) == "wuxie" ? 1 : 2);
				});
				var geti = function () {
					if (cards.includes(card)) {
						return cards.indexOf(card);
					}
					return cards.length;
				};
				if (get.name(card) == "wuxie") {
					return skills.duexcept_ai(Math.min(num, [6, 4, 3][Math.min(geti(), 2)]) * 0.6, card, player);
				}
				return skills.duexcept_ai(Math.max(num, [6, 4, 3][Math.min(geti(), 2)]), card, player);
			},
			aiUseful() {
				return lib.skill.sana_duntu.mod.aiValue.apply(this, arguments);
			},
		},
		enable: "chooseToUse",
		filterCard: true,
		position: "he",
		viewAs: { name: "wuxie" },
		viewAsFilter(player) {
			return player.countCards("he", card => player.isTurnedOver() ? !(get.type2(card) == "trick") : get.type(card) == "equip") > 0;
		},
		selectCard: 1,
		filterCard(card, player) {
			return player.isTurnedOver() ? !(get.type2(card) == "trick") : get.type(card) == "equip";
		},
		prompt() {
			return "将一张" + (_status.event.player.isTurnedOver() ? "非锦囊牌" : "装备牌") + "当无懈可击使用";
		},
		check(card) {
			return 8 - get.value(card);
		},
		threaten: 1.2,
		group: ["sana_duntu_2","sana_duntu_draw"],
		subSkill: {
			draw:{
				trigger: { player: "useCard" },
				silent: true,
				filter(event, player) {
					return event.skill == "sana_duntu" && event.card.name == "wuxie" && event.cards[0].original == "e"
				},
				async content(event, trigger, player) {
					await player.draw()
				}
			},
			2: {
				trigger: { player: "turnOverEnd" },
				frequent: true,
				filter(event, player) {
					return !player.isTurnedOver() && get.cardPile(function(card) { return get.type(card) == 'equip'; }) != undefined;
				},
				async content(event, trigger, player) {
					const card = get.cardPile(function (card) {
						return get.type(card) == "equip";
					});
					if (card) {
						await player.gain(card, "gain2", "log");
					}
					if (player.canMoveCard()){
						player.moveCard(false)
					}
				},
			},
		},
	},
	// DP环
	"iroha2_huzi": {
		trigger: { player: "phaseBegin" },
		forced: true,
		filter(event, player) {
			return game.hasPlayer(target => !target.hasMark("iroha2_huzi_used") && player != target)
		},
		async content(event, trigger, player) {

			const result = await player.chooseTarget("呼子：请选择一名角色获得【灭】标记", true)
				.set("filterTarget", (card, player, target) => !target.hasMark("iroha2_huzi_used") && player != target)
				.set("ai", function (target) {
					return - get.attitude(player, target)
				}).forResult();

			const target = result.targets[0];
			player.line(target);
			target.addMark("iroha2_huzi_used");
			target.update();
		},
		ai: {
			threaten: 3,
			expose: 0.2,
		},
		group: ["iroha2_huzi_2", "iroha2_huzi_3"],
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
				mark: true,
				marktext: "灭",
				intro: { content: "被呼子鸟盯上的标记" },
			},
			2: {
				trigger: { player: "phaseEnd" },
				filter(event, player) {
					return game.hasPlayer(function (target) {
						return target.hasMark("iroha2_huzi_used") && !player.getStat("iroha2_chengmo_3")?.includes(target) && (target.countCards("h") > target.hp || target.hp > 0)
					})
				},
				forced: true,
				async content(event, trigger, player) {
					let target
					if (game.countPlayer(function (target) {
						return target.hasMark("iroha2_huzi_used") && !player.getStat("iroha2_chengmo_3")?.includes(target) && (target.countCards("h") > target.hp || target.hp > 0)
					}) == 1)
						target = game.filterPlayer(function (target) {
							return target.hasMark("iroha2_huzi_used") && !player.getStat("iroha2_chengmo_3")?.includes(target) && (target.countCards("h") > target.hp || target.hp > 0)
						})[0]
					else {
						const result = await player.chooseTarget("呼子：选一名符合条件的角色的执行一次呼子②", true)
							.set("filterTarget", function (card, player, target) {
								return target.hasMark("iroha2_huzi_used") && !player.getStat("iroha2_chengmo_3")?.includes(target) && (target.countCards("h") > target.hp || target.hp > 0)
							})
							.set("ai", target => - get.attitude(player, target))
							.forResult()
						target = result.targets[0]
					}

					player.storage.iroha2_huzi_3 = target
					player.useSkill("iroha2_huzi_3")
				},
			},
			3: {
				trigger: {
					global: "damageEnd",
				},
				forced: true,
				filter(event, player) {
					const target = event.player;
					return target.hasMark("iroha2_huzi_used") && !player.getStat("iroha2_chengmo_3")?.includes(target) && (target.countCards("h") > target.hp || target.hp > 0)
				},
				async content(event, trigger, player) {
					const target = player.storage.iroha2_huzi_3 || trigger.player
					player.line(target)
					delete player.storage.iroha2_huzi_3

					let stat = player.getStat();
					if (!stat.iroha2_chengmo_3)
						stat.iroha2_chengmo_3 = [];
					stat.iroha2_chengmo_3.push(target);

					let choice = []
					let str1 = "无法选择", str2 = "无法选择"
					const str = get.translation(player)
					const f1 = target.countCards("h") > target.hp
					const f2 = target.hp > 0

					let aichoice
					if (f1) {
						const n = target.countCards("h") - target.hp
						str1 = "你弃" + n + "张手牌，" + str + "摸" + n + "张牌"
						choice.push("选项一")
						const f1 = n == 1
						const f2 = n == 2 && target.countCards("h", card => {
							const name = get.name(card);
							return !((name == "tao" || name == "jiu") && target.canUse(card, target));
						}) >= 2
						const f3 = target.hp == 1 && n <= 4 && !target.hasCard("h", card => {
							const name = get.name(card);
							return !((name == "tao" || name == "jiu") && target.canUse(card, target));
						})
						if (f1 || f2 || f3)
							aichoice = "选项一"
						else
							aichoice = "选项二"
					}
					if (f2) {
						str2 = "你失去一点体力，" + str + "摸一张牌"
						choice.push("选项二")
						if (!aichoice)
							aichoice = "选项二"
					}

					const result = await target.chooseControl(choice)
						.set("prompt", "呼子：请选择一项")
						.set("choiceList", [
							str1, str2
						])
						.set("choice", aichoice)
						.set("ai", function () {
							return _status.event.choice;
						})
						.forResultControl();

					if (result == "选项一") {
						const result = await target.chooseToDiscard(target.countCards("h") - target.hp, "呼子：请选择要弃置的手牌", "h", true)
							.set("ai", function (card) {
								return - get.value(card, target)
							}).forResult()
						await player.draw(result.cards.length);
					}
					if (result == "选项二") {
						await target.loseHp();
						await player.draw();
					}
				},
			},
		},
	},
	"iroha2_chengmo": {
		trigger: { global: "die" },
		filter(event, player) {
			return event.player.hasMark("iroha2_huzi_used")
		},
		forced: true,
		limited: true,
		async content(event, trigger, player) {
			player.awakenSkill("iroha2_chengmo")
			const alivePlayers = game.filterPlayer(target => target.hasMark("iroha2_huzi_used"))
			if (alivePlayers.length > 0) {
				player.line(alivePlayers)
				alivePlayers.forEach(target => target.removeSkill("iroha2_huzi_used"))
			}
			if (player.countCards("h") < player.maxHp)
				await player.draw(player.maxHp - player.countCards("h"))
			await player.recover()
			const result = await player.chooseTarget("呼子：请选择一名角色获得【灭】标记", true)
				.set("filterTarget", (card, player, target) => !target.hasMark("iroha2_huzi_used") && player != target)
				.set("ai", function (target) {
					return - get.attitude(player, target)
				}).forResult();

			const target = result.targets[0];
			player.line(target);
			target.addMark("iroha2_huzi_used");
			player.addSkill("iroha2_jimie")
		},
		derivation: ["iroha2_jimie"],
	},
	"iroha2_jimie": {
		trigger: {
			player: "useCardToPlayer",
		},
		filter(event, player) {
			return event.isFirstTarget && event.targets.some(target => player != target && target.hasMark("iroha2_huzi_used"))
		},
		forced: true,
		async content(event, trigger, player) {
			const targets = trigger.targets.filter(target => player != target && target.hasMark("iroha2_huzi_used"))
			targets.sortBySeat()
			player.line(targets)
			for (const target of targets)
				target.addTempSkill("iroha2_jimie_baiban")

			await player.draw(targets.length)
		},
		subSkill: {
			baiban: {
				init(player, skill) {
					player.addSkillBlocker(skill);
					player.addTip(skill, "寂灭 技能失效");
				},
				onremove(player, skill) {
					player.removeSkillBlocker(skill);
					player.removeTip(skill);
				},
				inherit: "baiban",
				marktext: "寂",
			},
		}
	},

	// 爱生眩
	"mabayu_jingying": {
		trigger: { player: "phaseUseBefore" },
		mark: true,
		zhuanhuanji: true,
		marktext: "☯",
		direct: true,
		intro: {
			content(storage) {
				if (storage)
					return "阳：你摸场上角色数量的牌，并弃置一张牌。本回合你跳过弃牌阶段，且回合结束时若你手牌数量为弃置点数的牌，你可以额外进行一个回合。";
				return "阴：你可以跳过出牌阶段，然后选择一名其他角色，于其回合结束后其立刻进行一个完整回合，其获得你所有黑色手牌。或者不跳过出牌阶段受到一点伤害。";
			}
		},
		async content(event, trigger, player) {
			if (player.storage.mabayu_jingying) {
				await player.draw(player.countMark("mabayu_jingying_4"))
				player.removeSkill("mabayu_jingying_4")
				let cards
				if (player.hp > 1 || game.hasPlayer(current => !current.hasSkill("mabayu_jingying_2") && current != player && get.attitude(player, current) > 0)) {
					if (player.countCards("h") > 5)
						cards = player.getCards("h", card => get.number(card) < player.countCards("h") - 2)
					else
						cards = player.getCards("h", card => get.number(card) < player.countCards("h"))
				}
				const result = await player.chooseToDiscard("he", true)
					.set("prompt", "镜影：弃一张牌。回合结束时若该牌点数与你的手牌数相同，进行一个额外回合。")
					.set("ai", function (card) {
						if (cards?.includes(card))
							return get.number(card, player) + 10
						return skills.duexcept_ai(-get.value(card, player) - 10, card, player)
					})
					.forResult();

				if (result.bool && result.cards && result.cards.length) {
					player.storage.mabayu_jingying_dis = get.number(result.cards[0], player);
					player.addTempSkill("mabayu_jingying_dis", { global: "phaseBegin" });
					player.markSkill("mabayu_jingying_dis");
				}
				player.skip("phaseDiscard")
			} else {
				const result = await player.chooseTarget("镜影：跳过出牌阶段并选择一名其他角色，其将在其回合结束后立刻进行一个回合，或者取消受到一点伤害", lib.filter.notMe)
					.set("ai", target => {
						if (player.hp > 1 && player.countCards("h", card => get.color(card) == "red") > Math.max(player.hp * 3, 5))
							return -1
						const att = get.attitude(player, target)
						if (att > 0 && target.hasSkill("mabayu_jingying_2"))
							return att / 10
						return att
					})
					.forResult();

				if (result.bool && result.targets && result.targets.length) {
					trigger.cancel();
					const target = result.targets[0];

					const cards = player.getCards("h", card => get.color(card) == "black")
					if (cards.length)
						await player.give(cards, target)

					player.line(target, "green");
					target.addSkill("mabayu_jingying_2");
					target.markSkill("mabayu_jingying_2");
					target.storage.mabayu_jingying_2 = player

					target.addTempSkill("mabayu_jingying_3", { player: "dieAfter" });
				} else {
					await player.damage();
				}
			}
			player.changeZhuanhuanji("mabayu_jingying")
		},
		ai: {
			threaten: 5
		},
		subSkill: {
			2: {
				charlotte: true,
				silent: true,
				onremove: true,
				mark: true,
				marktext: "影",
				trigger: { player: "phaseAfter" },
				async content(event, trigger, player) {
					player.insertPhase()

					player.addSkill("mabayu_jingying_mark")
					player.addSkill("mabayu_jingying_mark2")
					player.addSkill("mabayu_jingying_mark3")
					player.storage.mabayu_jingying_mark = player.storage.mabayu_jingying_2
					player.storage.mabayu_jingying_mark2 = false
					player.removeSkill("mabayu_jingying_2")
				},
				intro: {
					content: "回合结束后立刻进行一个没有弃牌阶段的完整回合"
				},
				ai:{
					threaten: 3
				}
			},
			mark: {
				charlotte: true,
				silent: true,
				trigger: { source: "damageSource" },
				onremove: true,
				filter(event, player) {
					return player.storage.mabayu_jingying_mark.isIn()
				},
				async content(event, trigger, player) {
					player.storage.mabayu_jingying_mark.addMark("mabayu_jingying_4", trigger.num)
				},
			},
			mark2: {
				charlotte: true,
				silent: true,
				trigger: { player: "phaseAfter" },
				onremove: true,
				filter(event, player) {
					return player.storage.mabayu_jingying_mark2
				},
				async content(event, trigger, player) {
					player.removeSkill("mabayu_jingying_mark2")
					player.removeSkill("mabayu_jingying_mark")
				},
			},
			mark3: {
				charlotte: true,
				silent: true,
				trigger: { player: "phaseBegin" },
				onremove: true,
				async content(event, trigger, player) {
					player.storage.mabayu_jingying_mark2 = true
					player.removeSkill("mabayu_jingying_mark3")
				},
			},
			3: {
				charlotte: true,
				onremove: true,
			},
			4: {
				charlotte: true,
				onremove: true,
				mark: true,
				marktext: "阳",
				intro: { content: "镜影阳效果额外摸牌数：#" },
			},
			dis: {
				charlotte: true,
				silent: true,
				onremove: true,
				mark: true,
				marktext: "影",
				trigger: { player: "phaseAfter" },
				filter(event, player) {
					return player.storage.mabayu_jingying_dis == player.countCards("h")
				},
				async content(event, trigger, player) {
					player.insertPhase()
				},
				intro: {
					content(num) {
						return "若回合结束后手牌数量为" + num + "，进行一个额外回合。"
					}
				},
				mod: {
					aiOrder(player, card, num) {
						if (player.storage.mabayu_jingying_dis == player.countCards("h") && (player.hp > 1 || game.hasPlayer(current => !current.hasSkill("mabayu_jingying_2") && current != player && get.attitude(player, current) > 0)))
							return num - 99999
						return num
					},
					aiUseful() {
						return lib.skill.mabayu_jingying_dis.mod.aiOrder.apply(this, arguments);
					},
				},
				ai: {
					pretao: true,
				}
			}
		}
	},
	"mabayu_henyi": {
		trigger: { player: "damageEnd" },
		forced: true,
		async content(event, trigger, player) {
			const cards = get.cards(1);
			await game.cardsGotoOrdering(cards);
			await player.showCards(cards, get.translation(player) + "发动了技能【痕忆】");
			await player.gain(cards, "gain2");

			if (get.color(cards[0]) == "red")
				await player.recover();
			else
				await player.draw();
		}
	},
	"mabayu_jingxiang": {
		zhuSkill: true,
		limited: true,
		forbid: ["guozhan"],
		trigger: { global: "dying" },
		filter(event, player) {
			const f1 = player == event.player && game.hasPlayer(current => current.hasSkill("mabayu_jingying_3") && current != player && current.hp > 1)
			const f2 = player != event.player && event.player.hasSkill("mabayu_jingying_3") && player.hp > 1
			return f1 || f2
		},
		check(event, player) {
			return get.attitude(player, event.player) > 0
		},
		async content(event, trigger, player) {
			player.awakenSkill("mabayu_jingxiang");

			const target = trigger.player
			if (player != target) {
				player.line(target, "green");
				const n = player.hp - 1
				await player.damage(n)
				await target.recover(n)
			} else {
				const players = game.filterPlayer(current => current.hasSkill("mabayu_jingying_3") && current != player && current.hp > 1).sortBySeat()

				for (const current of players) {

					const result = await current.chooseBool(
						"镜像：是否受到" + (current.hp - 1) + "点伤害，让" + get.translation(player) + "回复" + get.cnNumber(current.hp - 1) + "点体力"
					).set("ai", () => {
						return get.attitude(current, player) > 0;
					}).forResult();

					if (result?.bool) {
						const n = current.hp - 1
						await current.damage(n)
						current.line(target, "green");
						await player.recover(n)
						break;
					}
				}
			}
		},
	},

	//百江渚
	"nagisa_tianlao": {
		enable: "phaseUse",
		usable(skill, player) {
			return 1 + (player.storage.nagisa_tianlao_use || 0);
		},
		filter(event, player) {
			return player.countCards("h", card => lib.filter.cardDiscardable(card, player)) >= 1 && game.hasPlayer(function (current) {
				return current.isDamaged();
			});
		},
		init(player) {
			player.storage.nagisa_tianlao_use = 0;
		},
		onremove: true,
		async content(event, trigger, player) {
			let damage = 0
			game.filterPlayer(current => get.recoverEffect(current, player, player) > 0 && current.isDamaged() && player != current).forEach(current => damage += (current.maxHp - current.hp));
			const result = await player.chooseCardTarget({
				prompt: "弃置一张牌并选择一名已受伤角色，其回复一点体力。若选择自己则本回合无法再使用此技能。",
				filterTarget(card, player, target) {
					return target.isDamaged();
				},
				forced: true,
				position: "he",
				selectCard: 1,
				selectTarget: 1,
				ai1(card) {
					let value = 100 - get.value(card)
					if (damage > 1 && (get.color(card) == "red"))
						value += 3
					return skills.duexcept_ai(value, card, player);
				},
				ai2(target) {
					if (damage > 1 && ui.selected.cards.length && get.color(ui.selected.cards[0]) == "red" && get.recoverEffect(target, player, player) > 0) {
						if (player == target)
							return 0.9
						return 1 + get.recoverEffect(target, player, player)
					}
					return get.recoverEffect(target, player, player)
				}
			})
				.forResult();

			if (!result?.bool) return;
			const card = result.cards[0];
			await player.discard(card);
			const target = result.targets[0]
			player.line(target, "green");
			await target.recover()

			let chooseControl = ["选项一", "选项二"]
			if (get.color(card) != "red")
				chooseControl.remove("选项一")

			const str1 = (get.color(card) != "red" ? "无法发动" : "额外发动【甜酪】") + ((target == player && get.color(card) == "red") ? "(不建议选择)" : "")
			const num = get.skillCount("nagisa_tianlao", player)
			const str2 = "选至多" + get.cnNumber(num) + "名角色各摸一张牌"
			const control = await player.chooseControl(chooseControl)
				.set("prompt", "甜酪：请选择额外效果")
				.set("choiceList", [str1, str2])
				.set("choice", (damage > 1 && get.color(card) == "red" && player != target) ? "选项一" : "选项二")
				.set("ai", function () {
					return _status.event.choice;
				})
				.forResultControl();

			if (control == "选项一") {
				player.storage.nagisa_tianlao_use++
				player.updateMarks()
			} else if (control == "选项二") {
				const result = await player
					.chooseTarget("甜酪：请选择至多" + get.cnNumber(num) + "名角色各摸一张牌", [1, num], true)
					.set("ai", function (target) {
						return get.attitude(player, target);
					}).forResult();

				if (result.bool && result.targets.length) {
					const targets = result.targets;
					targets.sortBySeat();
					player.line(targets, "green");
					await game.asyncDraw(targets)
				}
			}

			if (player == target) {
				player.storage.nagisa_tianlao_use = -99
				player.updateMarks()
			}
		},
		group: "nagisa_tianlao_2",
		subSkill: {
			2: {
				trigger: {
					player: "phaseUseBegin"
				},
				charlotte: true,
				silent: true,
				async content(event, trigger, player) {
					player.addTempSkill("nagisa_tianlao_use", "phaseUseAfter");
				}
			},
			use: {
				onremove: true,
				charlotte: true,
				mark: true,
				marktext: "酪",
				init(player) {
					player.storage.nagisa_tianlao_use = 0;
				},
				intro: {
					content(storage, player) {
						const n = 1 + storage - get.skillCount("nagisa_tianlao", player)
						if (n <= 0)
							return "本回合【甜酪】使用次数达到上限";
						return "【甜酪】本回合还可以使用" + get.cnNumber(n) + "次";
					}
				},
			}
		},
		ai: {
			order: 10,
			threaten: 2,
			result: {
				player(player) {
					if (game.hasPlayer(target => get.recoverEffect(target, player, player) > 0))
						return 1;
				}
			}
		},
	},
	"nagisa_beiji": {
		limited: true,
		enable: "chooseToUse",
		forced: true,
		filter(event, player) {
			if (event.type == "dying") {
				if (player != event.dying) {
					return false;
				}
				return true;
			} else if (event.getParent().name == "phaseUse") {
				return true;
			}
			return false;
		},
		async content(event, trigger, player) {
			player.storage.nagisa_beiji = true;
			await player.discard(player.getCards("hej"));
			await player.link(false);
			await player.turnOver(false);
			await player.recoverTo(player.maxHp)
			await player.draw(player.maxHp);
			if (player.storage.nagisa_beiji_gs) {
				await player.removeSkill("nagisa_beiji2")
				await player.removeSkill("nagisa_beiji2_2")
				if (player.storage.nagisa_beiji_gs[0])
					await player.removeSkill(player.storage.nagisa_beiji_gs[0])
				if (player.storage.nagisa_beiji_gs[1]) {
					await player.addTempSkill(player.storage.nagisa_beiji_gs[1], { player: "dieAfter" })
					if (player.storage.nagisa_beiji_gs[1] == "nagisa_tianshi")
						await player.addTempSkill("nagisa_beiji2", { player: "dieAfter" })
					if (player.storage.nagisa_beiji_gs[1] == "nagisa_tianhui")
						await player.addTempSkill("nagisa_beiji2_2", { player: "dieAfter" })
				}
			}
			player.awakenSkill(event.name)
		},
		ai: {
			order: 1,
			skillTagFilter(player, tag, target) {
				if (player != target || player.storage.nagisa_beiji) {
					return false;
				}
			},
			save: true,
			result: {
				player(player) {
					if (player.hp <= 0) {
						return 10;
					}
					if (player.hp <= 2 && player.countCards("he") <= 1) {
						return 10;
					}
					return 0;
				},
			},
			threaten(player, target) {
				if (!target.storage.nagisa_beiji) {
					return 0.6;
				}
			},
		},
		group: ["nagisa_beiji_du", "nagisa_beiji_gs"],
		subSkill: {
			du: {
				trigger: {
					player: "loseHpBegin",
				},
				silent: true,
				filter(event, player) {
					return event.name == "loseHp" && event.type == "du" && event.getParent("nagisa_beiji", true)
				},
				logTarget(event, player) {
					return event[event.name == "loseHp" ? "player" : "target"];
				},
				async content(event, trigger, player) {
					trigger.cancel();
				},
			},
			gs: {
				trigger: {
					global: "phaseBefore",
					player: "enterGame",
				},
				filter(event, player) {
					return event.name != "phase" || game.phaseNumber == 0;
				},
				forced: true,
				async content(event, trigger, player) {
					const skill1 = "nagisa_tianshi"
					const skill2 = "nagisa_tianhui"
					const result = await player.chooseControl([skill1, skill2])
						.set("prompt", "蓓寂：请选择获得一个技能")
						.set("choiceList", [
							`【甜噬】当场上一名其他角色回复体力时，①每回合各限一次，你可以选择一项：1.令其摸两张牌。2.令其交给你一张非【毒】牌。②若其体力与你相等，你摸一张牌。`,
							`【天惠】每回合限一次，当场上有角色的牌因弃置进入弃牌堆后，你可以选择(X为弃置牌数量)：1.若X=1，你可以令其获得与弃牌花色相同的一张牌。2.若X>=2，你可以令其回复一点体力。3.你摸X张牌（至多为3）。`
						])
						.set("displayIndex", false)
						.set("ai", () => {
							return Math.random() > 0.5 ? skill1 : skill2;
						})
						.forResult();

					if (result.control) {
						player.addTempSkill(result.control, { player: "dieAfter" })
						if (result.control == skill1)
							player.addTempSkill("nagisa_beiji2", { player: "dieAfter" })
						if (result.control == skill2)
							player.addTempSkill("nagisa_beiji2_2", { player: "dieAfter" })
						player.storage.nagisa_beiji_gs = [result.control, ((result.control == skill1) ? skill2 : skill1)]
					}
				},
			}
		},
	},
	"nagisa_beiji2": {
		onremove: true,
		charlotte: true,
		intro: {
			content: "【甜噬】当场上一名其他角色回复体力时，①每回合各限一次，你可以选择一项：1.令其摸两张牌。2.令其交给你一张非【毒】牌。②若其体力与你相等，你摸两张牌。"
		},
		mark: true,
		marktext: "噬",
		subSkill: {
			2: {
				onremove: true,
				charlotte: true,
				intro: {
					content: "【天惠】每回合限一次，当场上有角色的牌因弃置进入弃牌堆后，你可以选择(X为弃置牌数量)：1.若X=1，你可以令其获得与弃牌花色相同的一张牌。2.若X>=2，你可以令其回复一点体力。3.你摸X张牌（至多为5）。"
				},
				mark: true,
				marktext: "惠",
			}
		}
	},
	"nagisa_tianshi": {
		trigger: { global: "recoverAfter" },
		async cost(event, trigger, player) {
			const target = trigger.player;
			if (target == player)
				return false

			const f1 = !player.getStorage("nagisa_tianshi_used").includes(0)
			const f20 = !player.getStorage("nagisa_tianshi_used").includes(1)
			const f2 = target.countCards("he") > 0 && f20
			const f3 = target.hp == player.hp

			if (!f1 && !f2 && !f3)
				return false

			if (!f1 && !f2) {
				event.result = {
					bool: true,
					cost_data: false,
				}
				return true
			}

			let control = ["选项一", "选项二", "cancel2"]
			if (!f1)
				control.remove("选项一")
			if (!f2)
				control.remove("选项二")

			let choice = "cancel2"
			const att = get.attitude(player, target)
			if (att >= 0 && f1)
				choice = "选项一"
			if (att < 0 && f2)
				choice = "选项二"

			const str = get.translation(target)
			const str1 = "令" + str + "摸两张牌" + ((!f1) ? "(本回合已使用过)" : "")
			const str2 = ((target.countCards("he") > 0) ? ("令" + str + "交你一张非【毒】牌") : "无法选择") + ((!f20) ? "(本回合已使用过)" : "")
			const control2 = await player.chooseControl(control)
				.set("prompt", "甜噬：请选择一项或取消")
				.set("choiceList", [str1, str2])
				.set("choice", choice)
				.set("ai", function () {
					return _status.event.choice;
				})
				.forResultControl();

			event.result = {
				bool: (control2 != "cancel2") || f3,
				cost_data: control2,
			};
		},
		async content(event, trigger, player) {
			const target = trigger.player
			const control = event.cost_data

			if (control) {
				if (control == "选项一") {
					player.addTempSkill("nagisa_tianshi_used", "phaseAfter");
					player.markAuto("nagisa_tianshi_used", [0]);
					player.line(target, "green");
					await target.draw(2)
				}
				else if (control == "选项二") {
					player.addTempSkill("nagisa_tianshi_used", "phaseAfter");
					player.markAuto("nagisa_tianshi_used", [1]);
					const result = await target.chooseCard(target, "he", 1, "甜噬：请选择一张非【毒】牌交给" + get.translation(player), true)
						.set("filterCard", card => {
							return get.name(card) != "du";
						})
						.set("ai", function (card) {
							return -get.value(card, target);
						})
						.forResult();

					if (result.bool && result.cards.length)
						target.line(player);
					await target.give(result.cards, player)
				}
			}

			if (target.hp == player.hp)
				await player.draw()
		},
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
			},
		}
	},
	"nagisa_tianhui": {
		trigger: { global: ["loseAfter", "loseAsyncAfter"] },
		usable: 1,
		check(event, player) {
			return true
		},
		async cost(event, trigger, player) {
			if (trigger.type != "discard" || trigger.getlx == false)
				return false;

			const cards = trigger.cards;
			const num = cards.length;
			const target = trigger.player;

			const f1 = num == 1 && target.isIn()
			const f2 = num >= 2 && target.isIn() && target.isDamaged()
			const att = get.attitude(player, target)
			const recoveratt = get.recoverEffect(target, player, player)

			let control = ["选项一", "选项二", "选项三", "cancel2"]
			if (!f1)
				control.remove("选项一")
			if (!f2)
				control.remove("选项二")

			const str = get.translation(target)
			const str1 = f1 ? (str + "获得一张" + get.translation(cards.map(card => get.suit(card))) + "牌") : "无法选择"
			const str2 = f2 ? (str + "回复一点体力") : "无法选择"
			const str3 = "自己摸" + get.cnNumber(Math.min(num, 3)) + "张牌"

			let choice = "选项三"
			if (f2 && recoveratt >= 0)
				choice = "选项二"
			else if (f1 && att >= 0 && player != target)
				choice = "选项一"
			else if (num >= 2)
				choice = "选项三"
			else if (num == 1 && _status.currentPhase.countCards("h") > _status.currentPhase.maxHp + 1 && _status.event.name != "phaseDiscard")
				choice = "cancel2"

			const control2 = await player.chooseControl(control)
				.set("prompt", "天惠：请选择一项或取消")
				.set("choiceList", [str1, str2, str3])
				.set("choice", choice)
				.set("ai", function () {
					return _status.event.choice;
				})
				.forResultControl();

			event.result = {
				bool: control2 != "cancel2",
				cost_data: control2
			};

		},
		async content(event, trigger, player) {
			const target = trigger.player;
			const cards = trigger.cards;
			const num = cards.length;

			const choice = event.cost_data

			if (choice == "选项一") {
				const suits = cards.map(card => get.suit(card));
				const cardToGain = get.cardPile(card => suits.includes(get.suit(card)));
				if (cardToGain) {
					player.line(target, "green");
					await target.gain(cardToGain, "gain2");
				}
			} else if (choice == "选项二") {
				player.line(target, "green");
				await target.recover();
			} else if (choice == "选项三") {
				target.line(player);
				await player.draw(Math.min(num, 3));
			}
		}
	},

	// 常盘七香
	"nanaka_huaxin": {
		inherit: "xiaoji",
		audio: "ext:魔法纪录/audio/skill:2",
		getIndex(event, player) {
			const evt = event.getl(player);
			if (evt && evt.player === player && evt.es && evt.es.length) return 1;
			return false;
		},
	},

	// 爱酱
	"ai_shuxin": {
		mod: {
			targetEnabled(card, player, target, now) {
				let prime = [2, 3, 5, 7, 11, 13];

				if (prime.includes(card.number) && player != target) {
					return false;
				}
			},
		},
		"_priority": 0,
	},

	// 龙城明日香
	"asuka_longzhen": {
		audio: "ext:魔法纪录/audio/skill:2",
		charlotte: true,
		forced: true,
		trigger: {
			player: ["useCard1"],
		},
		group: "asuka_longzhen_cancel",
		mod: {
			cardUsable(card, player) {
				if (card.name == "sha" && !player.getStorage("asuka_longzhen").includes(get.suit(card))) {
					return Infinity;
				}
			},
		},
		filter(event, player) {
			return event.card.name == "sha" && event.getParent().type == "phase" && (!player.storage.asuka_longzhen || !player.storage.asuka_longzhen.includes(get.suit(event.card)));
		},
		async content(event, trigger, player) {
			player.markAuto("asuka_longzhen", [get.suit(trigger.card)]);
			player.addTip("asuka_longzhen", get.translation("asuka_longzhen") + player.getStorage("asuka_longzhen").reduce((str, suit) => str + get.translation(suit), ""));
		},
		subSkill: {
			cancel: {
				trigger: {
					player: ["phaseUseEnd"],
				},
				forced: true,
				filter(event, player) {
					return player.getStorage("asuka_longzhen");
				},
				content() {
					if (player.getStorage("asuka_longzhen").length >= 3) player.recover();

					delete player.storage.asuka_longzhen;
					player.unmarkSkill("asuka_longzhen");
					player.removeTip("asuka_longzhen");
				}
			}
		},
		ai: {
			skillTagFilter(player, tag, arg) {
				if (arg && arg.name == "sha") {
					return true;
				}
				return false;
			},
		},
	},
	"asuka_kurou": {
		inherit: "kurou",
		audio: "ext:魔法纪录/audio/skill:2",
	},

	// 游佐叶月
	"hazuki_mingjian": {
		inherit: "mingjian",
		audio: "ext:魔法纪录/audio/skill:2",
		content(event, trigger, player) {
			player.give(cards, target);
			target.insertPhase();
			var evt = event.getParent("phaseUse");
			if (evt && evt.player == player) {
				evt.skipped = true;
				game.log(player, "结束了出牌阶段");
			}
		},
		"_priority": 0,
	},

	// 秋野枫
	"kaede_manmiao": {
		audio: "ext:魔法纪录/audio/skill:2",
		forced: true,
		trigger: {
			player: "taoAfter",
		},
		group: ["kaede_manmiao_jijiu"],
		async content(event, trigger, player) {
			const card = get.cardPile(function (card) {
				return get.color(card) == "black";
			});
			if (card) {
				await player.gain(card, "gain2", "log");
			}
		},
		mod: {
			cardname(card, player, name) {
				if (card.name == "du" || card.name == "jiu") {
					return "tao";
				}
			},
			aiValue(player, card, num) {
				if (card.name == "du" || card.name == "jiu") {
					return get.value({ name: "tao" });
				}
			},
			ignoredHandcard(card, player) {
				return card.name == "tao" || card.name == "du" || card.name == "jiu"
			},
		},
		ai: {
			nodu: true,
			usedu: true,
		},
		subSkill: {
			jijiu: {
				mod: {
					aiValue(player, card, num) {
						if (get.name(card) != "tao" && get.color(card) != "red") {
							return;
						}
						const cards = player.getCards("hs", card => get.name(card) == "tao" || get.color(card) == "red");
						cards.sort((a, b) => (get.name(a) == "tao" ? 1 : 2) - (get.name(b) == "tao" ? 1 : 2));
						var geti = () => {
							if (cards.includes(card)) {
								cards.indexOf(card);
							}
							return cards.length;
						};
						return Math.max(num, [6.5, 4, 3, 2][Math.min(geti(), 2)]);
					},
					aiUseful() {
						return lib.skill.kaede_manmiao_jijiu.mod.aiValue.apply(this, arguments);
					},
				},
				enable: "chooseToUse",
				audio: "kaede_manmiao",
				viewAsFilter(player) {
					return player != _status.currentPhase && player.countCards("hes", { color: "red" }) > 0;
				},
				filterCard(card) {
					return get.color(card) == "red";
				},
				position: "hes",
				viewAs: { name: "tao" },
				prompt: "将一张红色牌当桃使用",
				check(card) {
					return 15 - get.value(card);
				},
				ai: {
					threaten: 1.5,
				},
			}
		},
	},
	"kaede_qudu": {
		trigger: { global: "phaseUseBefore" },
		filter(event, player) {
			return event.player.isIn() && player.countCards("he", card => lib.filter.cardDiscardable(card, player)) > 0 && player != event.player;
		},
		async cost(event, trigger, player) {
			const result = await player.chooseToDiscard("祛毒：是否弃一张牌？", "he").set("ai", card => {
				const target = trigger.player
				if (get.attitude(player, target) > 0) {
					if (card.name == "tao" && (target.countCards("h") >= Math.min(target.hp * 2, 4)))
						return 2
					return 1 / get.value(card, player);
				}
				return -1
			}).forResult();
			event.result = {
				bool: result.bool,
				cost_data: result.cards
			};
		},
		async content(event, trigger, player) {
			player.addSkill("kaede_qudu2");
			player.storage.kaede_qudu2++

			const target = trigger.player;
			player.line(target, "green");
			const str = get.translation(player)

			let chooseControl = ["选项一", "选项二", "背水"]
			const f1 = target.hasCard(card => get.type(card) == "basic" || get.type(card) == "equip", "he")
			const f3 = get.name(event.cost_data[0]) == "tao" && f1
			if (!f1)
				chooseControl.remove("选项一")
			if (!f3)
				chooseControl.remove("背水")

			const str1 = f1 ? ("把任意数量的装备牌和基本牌交给" + str + "。其于下个其摸牌阶段额外摸一张牌。") : "无法选择"
			const str2 = "摸一张牌，出牌阶段可以额外使用一张【杀】。" + str + "于下个其结束阶段额外摸一张牌。"
			const str3 = f3 ? "背水" : "无法选择"

			let choice = "选项二"
			if (target.hasCard(card => (get.name(card) == "du" || get.type(card) == "equip") && get.value(card, target) < 0, "he"))
				choice = "选项一";
			if (f3)
				choice = "背水"

			const result = await target.chooseControl(chooseControl)
				.set("prompt", "祛毒：请选择一项")
				.set("choiceList", [
					str1, str2, str3
				])
				.set("choice", choice)
				.set("ai", function () {
					return _status.event.choice;
				})
				.forResultControl();

			if (result == "选项一" || result == "背水") {
				let ck2 = [[], []]

				const card = target.getCards("he", card => get.type(card) == "equip")
				if (card.length > 0)
					card.forEach(card => {
						if ((get.color(card) == "black" || get.position(card) == "e") && !get.tag(card, "gift")) {
							const pos = get.position(card) == "h" ? 0 : 1
							const types = get.subtypes(card)
							for (let i = 0; i < types.length; i++) {
								if (!ck2[pos].includes(types[i]))
									ck2[pos].push(types[i]);
							}
						}
					});

				const choosecard = await target.chooseCard("祛毒：选择要交给" + str + "的牌", [1, Infinity], "he", true, (card, player, target) => {
					return get.type(card) == "equip" || get.type(card) == "basic"
				})
					.set("ai", card => {
						if ((get.type(card) == "equip" && get.color(card) == "red" && get.subtypes(card).length == 1 && (get.position(card) == "h" && ck2[1].includes(get.subtype(card))) || (get.position(card) == "e" && ck2[0].includes(get.subtype(card)))))
							return 1
						if (get.type(card) == "basic" && get.color(card) == "red")
							return - get.value(card, target) + 2
						return - get.value(card, target);
					}).forResult();

				await target.give(choosecard.cards, player)
			}
			if (result == "选项二" || result == "背水") {
				await target.draw();
				target.addTempSkill("kaede_qudu_2", "phaseUseAfter")
			}
			if (result == "选项一" || result == "背水") {
				player.addSkill("kaede_qudu_used");
				player.storage.kaede_qudu_used++
			}
			if (result == "选项二" || result == "背水") {
				player.addSkill("kaede_qudu_used2");
				player.storage.kaede_qudu_used2++
			}

			await player.useCard({ name: "jiu", isCard: true }, target, false);

			if (get.color(event.cost_data[0]) == "red")
				await player.draw();

			player.updateMarks();

		},
		subSkill: {
			used: {
				trigger: { player: "phaseDrawBegin" },
				charlotte: true,
				silent: true,
				onremove: true,
				mark: true,
				marktext: "祛",
				intro: {
					content(storage) {
						return "下个摸牌阶段摸牌数+" + storage
					},
				},
				filter(event) {
					return event.num > 0;
				},
				init(player) {
					player.storage.kaede_qudu_used = 0
				},
				async content(event, trigger, player) {
					trigger.num += player.storage.kaede_qudu_used;
					player.removeSkill("kaede_qudu_used");
				},
			},
			used2: {
				trigger: { player: "phaseDrawBegin" },
				charlotte: true,
				onremove: true,
				mark: true,
				silent: true,
				marktext: "蓄",
				intro: {
					content(storage) {
						return "下个你的回合结束阶段摸" + storage + "张牌"
					},
				},
				filter(event) {
					return event.num > 0;
				},
				init(player) {
					player.storage.kaede_qudu_used2 = 0
				},
				async content(event, trigger, player) {
					for (let i = 0; i < player.storage.kaede_qudu_used2; i++)
						await player.draw();
					player.removeSkill("kaede_qudu_used2");
				},
			},
			2: {
				mark: true,
				nopop: true,
				marktext: "祛",
				intro: {
					content(storage) {
						return "额外出一张杀"
					},
				},
				mod: {
					cardUsable(card, player, num) {
						if (card.name == "sha")
							return num + 1;
					},
				},
			},
		},
		ai: {
			threaten: 2,
			expose: 0.3,
		},
	},
	"kaede_qudu2": {
		charlotte: true,
		onremove: true,
		mark: true,
		init(player) {
			player.storage.kaede_qudu2 = 0
		},
		nopop: true,
		marktext: "绪",
		intro: {
			content(storage) {
				return "已发动【祛毒】次数：" + storage
			},
		},
	},
	"kaede_zhuisi": {
		trigger: { player: "die" },
		skillAnimation: true,
		forceDie: true,
		async cost(event, trigger, player) {
			const num = player.getStorage("kaede_qudu2") || 0
			event.result = await player
				.chooseTarget("追忆：令一名不为击杀者的其他角色其获得技能【绪思】，回复全部体力并摸" + num + "张牌", function (card, player, target) {
					return player != target && _status.event.sourcex != target;
				})
				.set("forceDie", true)
				.set("ai", function (target) {
					let num = get.attitude(player, target);
					if (num > 0) {
						if (target.hp == 1) {
							num += 2;
						}
						if (target.hp < target.maxHp) {
							num += 2;
						}
					}
					return num;
				})
				.set("sourcex", trigger.source)
				.forResult();
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			player.line(target, "green");
			target.addSkill("kaede_xusi");
			await target.recoverTo(target.maxHp);
			await target.draw(player.getStorage("kaede_qudu2") || 0);
			player.removeSkill("kaede_qudu2");
		},
		ai: {
			expose: 0.5,
		},
	},
	"kaede_xusi": {
		mark: true,
		nopop: true,
		marktext: "绪",
		intro: {
			content() {
				return "锁定技。摸牌阶段摸牌数+1，出牌阶段额外使用一张【杀】，不会因为失去【毒】失去体力。"
			},
		},
		forced: true,
		filter(event, player) {
			return !event.numFixed;
		},
		async content(event, trigger, player) {
			trigger.num++;
		},
		mod: {
			cardUsable(card, player, num) {
				if (card.name == "sha")
					return num + 1;
			},
		},
		group: "kaede_xusi_du",
		subSkill: {
			du: {
				trigger: { player: "loseHpBegin" },
				forced: true,
				filter: event => event.type == "du",
				content() {
					trigger.cancel();
				},
				ai: {
					nodu: true,
				},
			},
		},
	},

	// 和泉十七夜
	"kanagi_yinshi": {
		trigger: { player: "phaseZhunbeiBegin" },
		filter(event, player) {
			return player.maxHp < 17;
		},
		frequent(event, player) {
			return !game.hasPlayer(function (current) {
				return current.name == "ui"
			});
		},
		async content(event, trigger, player) {
			event.cards = [];
			event.checks = [];
			event.bool = true

			let ck = true
			while (event.bool) {
				const result = await player.judge(function (result) {
					const evt = _status.event.getParent("kanagi_yinshi");
					if (evt?.checks?.some(subArray => subArray[0] == get.color(result) && subArray[1] == get.number(result))) {
						return 0
					}
					return 1
				}).set("judge2", result => result.bool ? true : false).set("callback", lib.skill.kanagi_yinshi.callback).forResult();

				if (!result) {
					event.bool = false
					ck = false
				}
			}

			if (!ck)
				return false

			if (player.maxHp >= 15) {
				const [card] = get.cards();
				await player.showCards(card, "颖识");
				const next = player.addToExpansion(card, "gain2");
				next.gaintag.add("kanagi_yinshi");
				await next;
			}

			const cards = event.cards.filterInD();
			if (cards.length) {
				const newcards = await player.chooseCardButton(
					"颖识：选择最多五张需要的牌",
					cards, true,
					[1, Math.min(5, cards.length)]
				).set('ai', function (button) {
					return get.value(button.link);
				}).forResult();

				const targetResult = await player.chooseTarget("颖识：将这些牌交给一名角色", true)
					.set("ai", function (target) {
						return get.attitude(player, target);
					})
					.forResult();

				const target = targetResult.targets[0];
				player.line(target, "green");
				const cEvent = target.gain(newcards.links, "gain2").giver = player;
				await cEvent
			}
		},
		async callback(event, trigger, player) {
			var evt = event.getParent(2);
			var evt2 = event.getParent();
			evt2.orderingCards.remove(evt2.result.card);
			evt.cards.push(evt2.result.card)

			if (evt2.result.bool && player.maxHp < 17) {
				evt.checks.push([get.color(evt2.result.card), get.number(evt2.result.card)]);
				await player.gainMaxHp();

				const result = await player.chooseBool("是否继续发动【颖识】？")
					.set("frequentSkill", "kanagi_yinshi")
					.forResult();
				evt.bool = result.bool
			} else {
				evt.bool = false
			}
		},
		marktext: "颖",
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
	},
	"kanagi_duxin": {
		enable: "phaseUse",
		usable: 2,
		filter(event, player) {
			return player.getExpansions("kanagi_yinshi").length > 0 || game.hasPlayer(function (target) {
				return player != target && target.countCards("h");
			});
		},
		async content(event, trigger, player) {
			await player.loseMaxHp(2)

			let chooseControl = ["选项一", "选项二", "背水"]
			const f1 = player.getExpansions("kanagi_yinshi").length > 0
			const f2 = game.hasPlayer(function (target) {
				return player != target && target.countCards("h");
			});
			const f3 = f1 && f2 && player.maxHp >= 3
			if (!f1)
				chooseControl.remove("选项一")
			if (!f2)
				chooseControl.remove("选项二")
			if (!f3)
				chooseControl.remove("背水")

			const str1 = f1 ? "弃置一枚【颖】标记，翻开牌堆顶五张牌并选择获得牌" : "无法选择"
			const str2 = f2 ? "观看一名其他角色手牌并弃置其中一张牌" : "无法选择"
			const str3 = f3 ? "背水：失去四点体力上限" : "无法选择"

			let choice
			const aif2 = game.hasPlayer(function (target) {
				return player != target && target.countCards("h") && get.attitude(player, target) < 0;
			});
			if (aif2)
				choice = "选项二";
			if (f1)
				choice = "选项一";
			if (f3 && aif2 && (player.maxHp >= 13 || player.maxHp >= 2 + player.hp) && player.maxHp > 5)
				choice = "背水"

			const result = await player.chooseControl(chooseControl)
				.set("prompt", "读心：请选择一项")
				.set("choiceList", [
					str1, str2, str3
				])
				.set("choice", choice)
				.set("ai", function () {
					return _status.event.choice;
				})
				.forResultControl();

			if (result == "背水")
				await player.loseMaxHp(4);
			if (result == "选项一" || result == "背水") {
				const cards = player.getExpansions("kanagi_yinshi");

				let selectedCards;

				if (cards.length == 1) {
					selectedCards = [cards[0]];
				} else {
					const result = await player.chooseCardButton("读心：请选择一张【颖】牌获得", true, cards
					).set("ai", button => {
						return get.value(button.link, player)
					}).forResult();

					selectedCards = result.links;
				}

				if (selectedCards && selectedCards.length) {
					const num = 17
					await player.showCards(selectedCards, "读心");
					await player.gain(selectedCards, "gain2");

					const cards = get.cards(5)
					game.cardsGotoOrdering(cards);

					const result = await player.chooseCardButton(cards, [1, 5], "读心：选择点数和不大于" + num + "的任意数量牌获得", true)
						.set("filterButton", function (button) {
							const selected = ui.selected.buttons.map(btn => btn.link);
							if (selected.includes(button.link)) return true;

							const newSelected = selected.concat([button.link]);

							return newSelected.reduce((total, card) => total + get.number(card), 0) <= num;
						})
						.set("ai", function (button) {
							return get.value(button.link, player)
						}).forResult()

					if (result.bool) {
						await player.gain(result.links, "gain2");
					}
				}
			}
			if (result == "选项二" || result == "背水") {
				const result2 = await player.chooseTarget("读心：请选择要弃置手牌的角色", true)
					.set("filterTarget", (card, player, target) => player.countCards("h") && player != target)
					.set("ai", target => {
						return -get.attitude(player, target);
					}).forResult();

				const target = result2.targets[0];
				player.line(target);
				if (!target || !target.countCards("h")) {
					event.finish();
				} else {
					let card = await player.chooseCardButton(target, target.getCards("h"), "读心：请选择弃置一张手牌", true)
						.set("ai", button => {
							return get.value(button.link, player)
						})
						.forResult();
					if (card.bool) {
						await target.discard(card.links[0]);
					}
				}
			}

		},
		ai: {
			order: 11,
			result: {
				player(player) {
					if (player.maxHp > 4 && player.maxHp != player.Hp && (player.getExpansions("kanagi_yinshi").length > 0 || game.hasPlayer(function (target) {
						return player != target && target.countCards("h") && get.attitude(player, target) < 0;
					})))
						return 1;
					return -1
				},
			},
			threaten: 1.1,
		},
	},
	"kanagi_dongyou": {
		trigger: {
			target: "taoBegin",
		},
		zhuSkill: true,
		forbid: ["guozhan"],
		forced: true,
		filter(event, player) {
			if (player == event.player) return false;
			if (!player.hasZhuSkill("kanagi_dongyou")) return false;
			if (event.player.group != "Kamihama_Magia_Union") return false;
			return true;
		},
		async content(event, trigger, player) {
			trigger.baseDamage++;
		},
		"_priority": 0,
	},
	// "kanagi_nvpu": {
	// 	trigger: {
	// 		player: ["equipAfter", "loseAfter"],
	// 	},
	// 	forced: true,
	// 	charlotte: true,
	// 	filter(event, player, name) {
	// 		return get.name(event.cards[0]) == "maid_uniform";
	// 	},
	// 	content() {
	// 	},
	// },

	// 由比鹤乃
	"tsuruno_tuanluan": {
		inherit: "drlt_huairou",
		async content(event, trigger, player) {
			let equip_type = get.subtype(event.cards[0]);
			player.recast(event.cards);

			if (player.isDisabled(equip_type)) player.enableEquip(equip_type);
			delete player.getStat().skill.drlt_jueyan;
		},
	},
	"tsuruno_qiangyun": {
		audio: "ext:魔法纪录/audio/skill:2",
		group: ["tsuruno_qiangyun_link", "tsuruno_qiangyun_delay", "tsuruno_qiangyun_turnOver"],
		locked: true,
		ai: {
			effect: {
				target(card) {
					if (card.name == "tiesuo") {
						return "zeroplayertarget";
					}
				},
			},
		},
		subSkill: {
			link: {
				audio: "tsuruno_qiangyun",
				trigger: {
					player: ["linkBegin"],
				},
				forced: true,
				filter(event, player) {
					return !player.isLinked();
				},
				async content(event, trigger, player) {
					trigger.cancel();
				},
				ai: {
					noLink: true,
				},
			},
			delay: {
				mod: {
					targetEnabled(card, player, target) {
						if (get.type(card) == "delay") {
							return false;
						}
					},
				},
			},
			turnOver: {
				audio: "tsuruno_qiangyun",
				trigger: {
					player: "turnOverAfter",
				},
				filter(event, player) {
					return player.isTurnedOver();
				},
				forced: true,
				async content(event, trigger, player) {
					await game.delay();
					await player.turnOver();
				},
				ai: {
					noturnOver: true,
					noturn: true,
				},
			},
		},
	},
	"tsuruno_jizhi": {
		derivation: ["tsuruno_jiyan", "tsuruno_yingfa", "tsuruno_yanzhan", "tsuruno_yanwu"],
		trigger: { player: "changeHp" },
		firstDo: true,
		silent: true,
		init2(player) {
			player.removeSkill(["tsuruno_jiyan", "tsuruno_yingfa", "tsuruno_yanzhan", "tsuruno_yanwu"]);
			if (player.hp <= 4)
				player.addSkill("tsuruno_jiyan");
			if (player.hp <= 3)
				player.addSkill("tsuruno_yingfa");
			if (player.hp <= 2)
				player.addSkill("tsuruno_yanzhan");
			if (player.hp <= 1)
				player.addSkill("tsuruno_yanwu");
		},
		content() {
			lib.skill.tsuruno_jizhi.init2(player);
		},
	},
	"tsuruno_jiyan": {
		preHidden: true,
		trigger: {
			global: "damageAfter",
		},
		filter(event, player) {
			return event.hasNature("fire")
		},
		forced: true,
		async content(event, trigger, player) {
			const target = trigger.source
			if (target && target == player && trigger.childEvents?.find(evt => evt.name == "changeHp" && evt.num < 0))
				await player.changeHujia(1, null, true)
			else
				await player.draw()
		},
		group: "tsuruno_jiyan_2",
		subSkill: {
			2: {
				trigger: {
					player: "phaseUseBefore",
				},
				forced: true,
				async content(event, trigger, player) {
					let ck = true
					if (player.hp == 1 && player.countCards("he", card => card.hasNature("fire") && lib.filter.cardDiscardable(card, player)) && game.hasPlayer(target => target != player)) {
						const result = await player.chooseCardTarget({
							prompt: "激炎：弃一张火属性牌并选择一名角色受到一点火属性伤害，若不弃自己受到火属性伤害",
							filterTarget(card, player, target) {
								return player != target
							},
							filterCard(card, player) {
								return card.hasNature("fire") && lib.filter.cardDiscardable(card, player)
							},
							position: "he",
							selectCard: 1,
							selectTarget: 1,
							ai1(card) {
								return skills.duexcept_ai(100 - get.value(card), card, player);
							},
							ai2(target) {
								return get.damageEffect(target, player, player, "fire")
							}
						})
						.forResult();

						if (result.bool) {
							ck = false
							await player.discard(result.cards);
							const target = result.targets[0];
							player.line(target);
							await target.damage("fire");
						}
					}
					if (ck) {
						await player.damage("fire");
					}
				},
			},
		},
	},
	"tsuruno_yingfa": {
		trigger: { player: "phaseJieshuBegin" },
		frequent: true,
		preHidden: true,
		async cost(event, trigger, player) {
			const card = get.cardPile(function (card) {
				return get.tag(card, "fireDamage")
			});
			if (!card)
				return false

			const result = await player.chooseTarget("英发：选择一名角色获得一张火属性伤害牌")
				.set("ai", (target) => {
					return get.attitude(player, target)
				})
				.forResult();
			
			event.result = {
				bool: result.bool,
				cost_data: result.targets
			}
			
		},
		async content(event, trigger, player) {
			const card = get.cardPile(function (card) {
				return get.tag(card, "fireDamage")
			});
			const target = event.cost_data[0]
			player.line(target)
			await target.gain(card, "gain2")
		},
		mod: {
			maxHandcardBase(player, num) {
				return player.maxHp + num
			},
			ignoredHandcard(card, player) {
				return get.tag(card, "fireDamage")
			},
		},
		group: ["tsuruno_yingfa_draw"],
		subSkill: {
			draw: {
				trigger: { player: "phaseDrawBegin2" },
				frequent: true,
				filter(event, player) {
					return !event.numFixed;
				},
				async content(event, trigger, player) {
					trigger.num += (player.maxHp - player.hp)
				},
			},
		},
	},
	"tsuruno_yanzhan":{
		mod: {
			aiOrder(player, card, num) {
				if (num <= 0 || get.itemtype(card) !== "card" || get.type(card) !== "equip") {
					return num;
				}
				let eq = player.getEquip(get.subtype(card));
				if (eq && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) {
					return 0;
				}
			},
		},
		locked: false,
		enable: "phaseUse",
		usable: 1,
		position: "he",
		filterCard: true,
		selectCard: () => [1, get.event("player").maxHp],
		prompt: "弃置任意张牌并摸等量的牌",
		check(card) {
			let player = _status.event.player;
			if (get.position(card) == "e") {
				let subs = get.subtypes(card);
				if (subs.includes("equip2") || subs.includes("equip3")) {
					return skills.duexcept_ai(player.getHp() - get.value(card), card ,player);
				}
			}
			return skills.duexcept_ai((card.name == "sha" ? 5 : 6) - get.value(card),card ,player);
		},
		async content(event, trigger, player) {
			const card = get.cardPile(function (card) {
				return get.tag(card, "fireDamage")
			});
			if (card) {
				await player.gain(card, "gain2", "log");
			}
			const n = event.cards.length
			await player.draw(n);

			player.addTempSkill("tsuruno_yanzhan_temp","phaseUseAfter");
			player.addMark("tsuruno_yanzhan_temp", n, false);
		},
		ai: {
			order: 8,
			result: {
				player: 1,
			},
			threaten: 2.5,
		},
		subSkill: { 
			temp: {
				charlotte: true,
				onremove: true,
				intro: { content: "本回合使用【杀】的次数上限+#" },
				mod: {
					cardUsable(card, player, num) {
						if (card.name == "sha") {
							return num + player.countMark("tsuruno_yanzhan_temp");
						}
					}
				},
			}
		},
	},
	"tsuruno_yanwu": {
		enable: "phaseUse",
		usable: 2,
		filter(event, player) {
			return game.hasPlayer(function (target) {
				return player.canUse("huogong", target);
			});
		},
		async content(event, trigger, player) {
			let result = await player.chooseTarget("炎舞", "视为对一名角色使用【火攻】", true)
				.set("ai", (target) => {
					return get.effect(target, { name: "huogong" }, player, player);
				})
				.set("filterTarget", (card, player, target) => player.canUse("huogong", target))
				.forResult();

			if (!player.canUse({ name: "huogong" }, result.targets[0])) return;

			player.line(result.targets[0])
			player.storage.tsuruno_yanwu = result.targets[0];
			let next = player.useCard({ name: "huogong" }, result.targets[0]);
			player.when("useCardAfter").filter((event, player) => {
				return event.card == next.card;
			}).then(() => {
				// if (!player.hasHistory("sourceDamage", evt => evt.card == trigger.card)) {
				// 	let control = ["弃对方1张牌", "摸1张牌"]
				// 	if (player.storage.tsuruno_yanwu.countDiscardableCards(player, "he") > 0)
				// 		control.remove("弃对方1张牌"); 
				// 	return player.chooseControl(control)
				// 	.set("ai", () => {
				// 		if (!(get.event("controls").includes("弃对方1张牌")) || get.attitude(player, player.storage.tsuruno_yanwu) >= 0 || player.countCards("h") <= player.maxHp)
				// 			return "摸1张牌";
				// 		return "弃对方1张牌";
				// 	}).forResult();
				// }
				if (!player.hasHistory("sourceDamage", evt => evt.card == trigger.card))
					player.draw()
			// }).then(() => {
			// 	if (result.control == "摸1张牌") {
			// 		player.draw();
			// 	} else if (result.control == "弃对方1张牌") {
			// 		player.discardPlayerCard("he", player.storage.tsuruno_yanwu, true);
			// 	}
			// 	delete player.storage.tsuruno_yanwu;
			});
		},
		ai: {
			threaten: 0.4,
			order: 9,
			result: {
				player : 1,
			},
		}
	},

	// 伊吹丽良
	"rera_nuanxin": {
		inherit: "xinfu_jiyuan",
		audio: "ext:魔法纪录/audio/skill:2",
		filter(event, player, triggername, target) {
			if (!target.isIn()) {
				return false;
			}
			if (event.name === "dying") {
				return true;
			}
			if (event.giver !== player) {
				return false;
			}
			if (event.name === "gain") {
				return event.getg(target).length > 0;
			}
			return game.hasPlayer(current => current != player && event.getg(current).length > 0);
		},
		async content(event, trigger, player) {
			event.targets[0].draw(2);
		},
		group: ["rera_nuanxin_gift"],
		subSkill: {
			gift: {
				sourceSkill: "rera_nuanxin",
				trigger: {
					player: "giftAccepted",
				},
				check(event, player, triggername, target) {
					return get.attitude(player, target) > 0;
				},
				content(event, trigger, player) {
					trigger.target.draw(2);
				},
			}
		}
	},

	// 都雏乃
	"hinano_huawu": {
		group: "hinano_huawu2",
		locked: true,
		"_priority": 0,
	},
	"hinano_huawu2": {
		forced: true,
		equipSkill: true,
		noHidden: true,
		inherit: "test_tube_skill",
		sourceSkill: "hinano_huawu",
		filter(event, player) {
			if (!player.hasEmptySlot(1)) {
				return false;
			}
			return true;
		},
		audio: "ext:魔法纪录:1",
		"_priority": 0,
	},
	"hinano_duji": {
		forced: true,
		mod: {
			cardname(card, player, name) {
				if (player == _status.currentPhase && (card.name == "du" || card.suit == "club")) {
					return "guohe";
				}
			},
			aiValue(player, card, num) {
				if (card.name == "du" || card.suit == "club") {
					return get.value({ name: "guohe" });
				}
			},
		},
		init: () => {
			game.addGlobalSkill("hinano_duji_du");
			game.addGlobalSkill("g_du");	//赠毒程序代码
		},
		onremove: () => {
			if (!game.hasPlayer(i => i.hasSkill("hinano_duji", null, null, false), true)) {
				game.removeGlobalSkill("hinano_duji_du");
			}
		},
		subSkill: {
			du: {
				mod: {
					cardname(card, player, name) {
						if (_status.currentPhase && player != _status.currentPhase && _status.currentPhase.hasSkill("hinano_duji") && get.suit(card) == "club") {
							return "du";
						}
					},
					aiValue(player, card, num) {
						if (get.name(card) == "du" && card.name != "du") {
							return get.value({ name: card.name });
						}
					},
				},
				trigger: { player: "dieAfter" },
				filter: () => {
					return !game.hasPlayer(i => i.hasSkill("hinano_duji", null, null, false), true);
				},
				silent: true,
				forceDie: true,
				content: () => {
					game.removeGlobalSkill("hinano_duji_du");
				},
			},
		},
		ai: { threaten: 2.1 },
		trigger: {
			player: "loseHpBefore",
		},
		filter(event, player) {
			return event.type == "du";
		},
		content() {
			trigger.cancel();
		}
	},
	"hinano_shiyao": {
		global: "hinano_shiyao_global",
		subSkill: {
			global: {
				enable: "phaseUse",
				usable: 1,
				filterTarget(card, player, target) {
					return target.hasSkill("hinano_shiyao");
				},
				filter(event, player) {
					const num = game.countPlayer(current => current.hasSkill("hinano_shiyao"));
					return num > 0;
				},
				selectTarget() {
					const num = game.countPlayer(current => current.hasSkill("hinano_shiyao"));
					if (num > 1) {
						return 1;
					}
					return -1;
				},
				async content(event, trigger, player) {
					const target = event.target;
					const card = game.createCard("du", lib.suit.randomGet(), Math.ceil(Math.random() * 13));
					if (card) {
						await target.gain(card, "gain2");
					}
					const result = await player
						.judge(card => {
							if (get.color(card) == "red") {
								return 2;
							}
							return 1;
						})
						.forResult();
					if (result.color == "red") {
						player.useCard({ name: "guaguliaodu" }, player, false);

						let num = 0;
						let cardx = player.getCards("he").filter(card => get.suit(card) == "club");
						num = cardx.length;
						player.discard(cardx);
						player.draw(num);
					} else if (result.color == "black") {
						const cardx = game.createCard("du", lib.suit.randomGet(), Math.ceil(Math.random() * 13));
						if (cardx) {
							let cardy = player.getCards("he").filter(card => get.suit(card) == "spade");
							player.discard(cardy);
							await player.gain(cardx, "gain2");
						}
					}
				},
				ai: {
					order: 1,
					result: {
						target(player, target) {
							if (get.attitude(player, target) > 0) return 1;
							if (player.hp == 1) return 1;
							return 0;
						}
					},
				},
			},
		},
	},
	"hinano_baoming": {
		enable: "phaseUse",
		filter(event, player) {
			return game.hasPlayer(current => player != current);
		},
		limited: true,
		skillAnimation: "epic",
		animationColor: "thunder",
		filterTarget: lib.filter.notMe,
		selectTarget: -1,		// 表示选择所有目标
		multiline: true,
		async contentBefore(event, trigger, player) {
			player.awakenSkill(event.skill);
		},
		async content(event, trigger, player) {
			const { target } = event;
			let num = target.countCards("h");
			target.discard(target.getCards("h"));
			target.draw(num);
		},
		ai: {
			order: 5,
			result: {
				player(player) {
					var num = game.countPlayer(current => get.attitude(player, current) < 0 && current.countCards("h"));
					if (
						(player.hp > 2) ||
						!game.hasPlayer(current => {
							return (get.attitude(player, current) > 0 && current.needsToDiscard(num) < 2) || (get.attitude(player, current) < 0 && current.needsToDiscard(-5));
						})
					) {
						return -10;
					}
					return 1;
				},
				target: -1,
			},
		}
	},

	// 观鸟令
	"ryo_yaozuo": {
		enable: "phaseUse",
		usable: 1,
		filterTarget: lib.filter.notMe,
		selectTarget: -1,
		multiline: true,
		multitarget: true,
		async content(event, trigger, player) {
			let targets = game.filterPlayer(current => current != player);
			player.line(targets);
			targets = targets.filter(i => i.isIn());

			if (targets.length) {
				for (const target of targets) {
					if (!target.countCards("he")) {
						continue;
					}
					const {
						result: { bool },
					} = await target
						.chooseToGive("he", player)
						.set("prompt", "是否交给" + get.translation(player) + "一张牌？")
						.set("ai", card => {
							const target = get.event("player"),
								player = get.event("target");
							const att = get.attitude(target, player);
							if (att > 0) {
								return 6 - get.value(card);
							}
							return 1 - get.value(card);
						})
						.set("target", player);
					if (bool) {
						if (!player.storage.ryo_yaozuo) player.storage.ryo_yaozuo = target;
					} else {
						player.addTempSkill("ryo_yaozuo_effect");
						player.markAuto("ryo_yaozuo_effect", [target]);
					}
				}
			}

			if (player.storage.ryo_yaozuo) {
				const first = player.storage.ryo_yaozuo;
				const result = await first
					.chooseTarget("令" + get.translation(player) + "对一名其他角色发动〖撰文〗", true, function (card, player, target) {
						return !get.event("targets").includes(target);
					})
					.set("targets", [first, player])
					.set("ai", target => {
						const player = get.player(),
							hs = target.countCards("h");
						if (get.attitude(player, target) <= 0 && target.hp <= Math.floor(target.maxHp)) {
							return hs * 2;
						}
						return hs;
					})
					.forResult();
				if (result.bool) {
					const targets = result.targets;
					first.line(targets, "green");
					await player.useSkill("dcsbzhuanwen", null, targets);
				}
			}
		},
		subSkill: {
			effect: {
				onremove: true,
				charlotte: true,
				mark: true,
				intro: {
					content: "本回合下次对$造成的伤害+1",
				},
				trigger: {
					source: "damageBegin1",
				},
				filter(event, player) {
					return player.getStorage("ryo_yaozuo_effect").includes(event.player);
				},
				logTarget: "player",
				forced: true,
				async content(event, trigger, player) {
					trigger.num++;
					player.unmarkAuto(event.name, [trigger.player]);
				},
			},
		},

	},

	// 红晴结菜
	"yuna_chouhai": {
		trigger: {
			player: "damageEnd",
			source: "damageSource",
		},
		frequent: true,
		preHidden: true,
		filter(event, player, name) {
			return !player.hasHistory("useSkill", evt => {
				return evt.skill == "yuna_chouhai" && evt.event.triggername == name;
			});
		},
		content() {
			"step 0";
			const num = Math.max(1, Math.min(player.maxHp, player.getExpansions("yuna_chouhai").length));
			event.num = num;
			player.draw(num);
			"step 1";
			var hs = player.getCards("he");
			if (hs.length > 0) {
				if (hs.length <= event.num) event._result = { bool: true, cards: hs };
				else player.chooseCard("he", true, "选择" + get.cnNumber(event.num) + "张牌作为“仇”", event.num);
			} else event.finish();
			"step 2";
			if (result.bool) {
				var cs = result.cards;
				player.addToExpansion(cs, player, "give").gaintag.add("yuna_chouhai");
			}
		},
		mod: {
			maxHandcard(player, num) {
				return num + player.getExpansions("yuna_chouhai").length;
			},
		},
		ai: {
			notemp: true,
		},
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
		onremove(player, skill) {
			var cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
		},
		locked: false,
		subSkill: {
			used: {
				onremove: true,
				charlotte: true,
			},
		},
	},
	"yuna_xuehen": {
		enable: "phaseUse",
		usable(skill, player) {
			if (player.storage.xuemeng) return 4;
			return 2;
		},
		filter(event, player) {
			return player.getExpansions("yuna_chouhai").length > 0;
		},
		filterTarget: true,
		async content(event, trigger, player) {
			const target = event.targets[0];
			const cards = player.getExpansions("yuna_chouhai");
			const num = Math.ceil(cards.length / 2);

			const discardCards = cards.slice(0, num);
			await player.discard(discardCards);
			await target.damage();
			target.draw(num);
		},
		ai: {
			order: 10,
			result: {
				target(player, target) {
					const cards = player.getExpansions("yuna_chouhai");
					if (get.attitude(player, target) < 0 && cards.length < 4) {
						if (target.hasSkill("buqu")) return 0;
						if (target.countCards("h") > target.maxHp) return -1;
						return -3;
					}
					if (get.attitude(player, target) > 0 && cards.length >= 4) {
						if (target.hp >= 3 && target.countCards("h") <= 1) return 3;
						if (target.hp == 1) return 0;
						return 1;
					}
				},
			}
		},
	},
	"yuna_liuli": {
		trigger: { target: "useCardToTarget" },
		forced: true,
		filter(event, player) {
			// get.tag()判断是伤害类牌
			return get.tag(event.card, "damage") && event.targets.length > 1 && event.player.isIn();
		},
		preHidden: true,
		async content(event, trigger, player) {
			const result = await player.chooseTarget("请选择“流离”的对象")
				.set("ai", target => {
					return -get.attitude(player, target);
				}).forResult();
			if (result.bool) {
				await player.useSkill("yuna_chouhai");
				const target = result.targets[0];
				player.line(target, "green");

				const evt = trigger.getParent();
				evt.triggeredTargets2.remove(player);
				evt.targets.remove(player);
				evt.targets.push(target);
			}
		},
	},
	"yuna_xuemeng": {
		zhuSkill: true,
		forbid: ["guozhan"],
		forced: true,
		trigger: {
			global: ["gameStart"],
		},
		filter(event, player) {
			if (!player.hasZhuSkill("yuna_xuemeng", event.source)) {
				return false;
			}
			let n = game.countPlayer(current => {
				return current.group == "Kamihama_Magia_Union" || current.group == "Magius_Wing";
			})
			if (n == 0) return false;
			return true;
		},
		content() {
			player.storage.xuemeng = true;
		}
	},

	// 加贺见真良
	"masara_cisha": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { global: "phaseUseBegin" },
		filter(event, player) {
			return event.player.isIn() && player.countCards("h") > 0 && player != event.player;
		},
		direct: true,
		preHidden: true,
		content() {
			"step 0";
			var nono = Math.abs(get.attitude(player, trigger.player)) < 3;
			if (get.damageEffect(trigger.player, player, player) <= 0) {
				nono = true;
			} else if (trigger.player.hp > 1 && player.countCards("h") < 3 && trigger.player.countCards("h") >= 3) {
				nono = true;
			}
			var next = player.chooseToDiscard(get.prompt2("masara_cisha", trigger.player));
			next.set("ai", function (card) {
				if (_status.event.nono) {
					return -1;
				}
				return 7 - get.useful(card);
			});
			next.set("logSkill", ["masara_cisha", trigger.player]);
			next.set("nono", nono);
			next.setHiddenSkill("masara_cisha");
			"step 1";
			if (result.bool) {
				let card = player.useCard({ name: "sha", nature: "stab", isCard: true }, trigger.player, false);
				player.addTempSkill("qinggang2");
				player.storage.qinggang2.add(card);
			} else {
				event.finish();
			}
		},
		ai: {
			threaten: 2,
			expose: 0.3,
		},
	},
	"masara_wuying": {
		preHidden: true,
		trigger: { global: "phaseEnd" },
		frequent: true,
		group: "masara_wuying_biyue",
		filter(event, player) {
			return game.hasPlayer2(function (current) {
				return current.getStat("kill") > 0;
			});
		},
		prompt(event, player) {
			var num = game.countPlayer2(function (current) {
				return (current.getStat("kill") || 0) * (current == player ? 3 : 1);
			});
			return get.prompt("masara_wuying") + "（可摸" + get.cnNumber(num) + "张牌）";
		},
		async content(event, trigger, player) {
			await player.draw(game.countPlayer2(function (current) {
				return (current.getStat("kill") || 0) * (current == player ? 3 : 1);
			}));
			if (player == trigger.player) {
				player.draw(player.countCards("h") ? 1 : 2);
			}
		},
		subSkill: {
			draw: {
				trigger: { global: "dieAfter" },
				frequent: true,
				filter(event, player) {
					return /*get.mode()!='guozhan'&&*/ player != event.source;
				},
				content() {
					player.draw();
				},
			},
			biyue: {
				trigger: { player: "phaseJieshuBegin" },
				frequent: true,
				content() {
					player.draw(player.countCards("h") ? 1 : 2);
				},
			}
		},
	},

	// 神名浅海
	"asumi_zhuilie": {
		mod: {
			targetInRange(card) {
				if (card.name == "sha") {
					return true;
				}
			},
		},
		trigger: { player: "useCardToTargeted" },
		filter(event, player) {
			return event.card && event.card.name == "sha" && !player.inRange(event.target);
		},
		forced: true,
		logTarget: "target",
		async content(event, trigger, player) {
			if (trigger.getParent().addCount !== false) {
				trigger.getParent().addCount = false;
				var stat = player.getStat();
				if (stat && stat.card && stat.card.sha) {
					stat.card.sha--;
				}
			}
		},
		group: ["asumi_zhuilie_sha", "asumi_zhuilie_damage"],
		subSkill: {
			sha: {
				silent: true,
				charlotte: true,
				trigger: { player: "useCardToTargeted" },
				filter(event, player) {
					return event.card && event.card.name == "sha";
				},
				async content(event, trigger, player) {
					trigger.target.addTempSkill("qinggang2");
					trigger.target.storage.qinggang2.add(trigger.card);
					trigger.target.markSkill("qinggang2");
				},
			},
			damage: {
				trigger: { source: "damageBegin" },
				forced: true,
				filter(event, player) {
					return event.card && event.card.name == "sha";
				},
				async content(event, trigger, player) {
					const result = await player.judge(function (card) {
						return get.type(card) == "equip" ? 6 : -6;
					}).forResult();

					if (result.bool) {
						trigger.num = trigger.player.hp;
					} else if (result.bool === false && get.type(result.card) != "basic") {
						await player.loseHp();
						await player.draw(3);
					}
				},
			}
		},
	},
	"asumi_zhuilie2": {
		onremove: true,
		intro: {
			content: "使用【杀】的次数上限+#",
		},
		mod: {
			cardUsable(card, player, num) {
				if (card.name == "sha") {
					return num + player.countMark("asumi_zhuilie2");
				}
			},
		},
	},

	// 小名
	"name_dengtai": {
		audio: "ext:魔法纪录/audio/skill:2",
		unique: true,
		preHidden: true,
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		filter(event, player) {
			return event.name != "phase" || game.phaseNumber == 0;
		},
		forced: true,
		init(player) {
			player.useSkill("name_dengtai");
		},
		async content(event, trigger, player) {
			if (!_status.characterlist) {
				game.initCharactertList();
			}
			_status.characterlist.randomSort();
			let characters = [];
			for (let i = 0; i < _status.characterlist.length; i++) {
				if (
					get.character(_status.characterlist[i], 3).some(skill => {
						return lib.skill[skill] && !lib.skill[skill].charlotte;
					})
				) {
					characters.push(_status.characterlist[i]);
					if (characters.length >= 6) {
						break;
					}
				}
			}
			if (characters.length < 2) {
				return;
			}
			const first = characters.slice(0, characters.length / 2),
				last = characters.slice(characters.length / 2, 6);
			const skills1 = [],
				skills2 = [];
			for (let i of first) {
				skills1.push(
					get
						.character(i, 3)
						.filter(skill => {
							return lib.skill[skill] && !lib.skill[skill].charlotte;
						})
						.randomGet()
				);
			}
			for (let i of last) {
				skills2.push(
					get
						.character(i, 3)
						.filter(skill => {
							return lib.skill[skill] && !lib.skill[skill].charlotte;
						})
						.randomGet()
				);
			}
			const result1 = await player
				.chooseControl(skills1)
				.set("dialog", ["小名：请选择第一个技能", [first, "character"]])
				.forResult();
			const gains = [];
			gains.add(result1.control);
			const result2 = await player
				.chooseControl(skills2)
				.set("dialog", ["小名：请选择第二个技能", [last, "character"]])
				.forResult();
			gains.add(result2.control);
			await player.addSkills(gains);
			await player.removeSkill("name_dengtai");
		},
	},

	// 时女静香
	"shizuka_xueji": {
		inherit: "umi_lunhui",
		round: 1,
	},
	"tokime_shinv": {
		clanSkill: true,
		forced: true,
		trigger: { global: ["phaseJieshuBefore"] },
		filter(event, player) {
			let num = game.countPlayer(function (current) {
				return (current == player || current.hasClan("时女一族"));
			});

			if (player.getRoundHistory("useSkill", evt => evt.skill == player.getSkills()[0]).length) {
				return player.getRoundHistory("useSkill", evt => evt.skill == "tokime_shinv").length < num;
			}
			return false;
		},
		async content(event, trigger, player) {
			let skill = player.getSkills()[0];
			var info = get.info(skill);
			if (info.round && player.storage[skill + "_roundcount"]) {
				player.storage[skill + "_roundcount"]--;
				game.log(player, "重置了技能", skill);
			}
		}
	},
	"shizuka_xueshang": {
		trigger: { global: "die" },
		forced: true,
		skillAnimation: true,
		chargingSkill: true,
		filter(event, player) {
			return player.hp > 0;
		},
		animationColor: "metal",
		content() {
			"step 0";
			player.addSkill("riki_xueshang");
			var map = {};
			var list = [];
			for (var i = 1; i <= player.hp; i++) {
				var cn = get.cnNumber(i, true);
				map[cn] = i;
				list.push(cn);
			}
			event.map = map;
			player
				.chooseControl(list, function () {
					return "一";
				})
				.set("prompt", "血殇：请选择自己受到的伤害的点数");
			"step 1";
			var num = event.map[result.control] || 1;
			event.num = num > 1 ? 2 : 1;
			event.list = game
				.filterPlayer(function (current) {
					return current != player;
				})
				.sortBySeat();
			player.damage(num);
			player.line(event.list, { color: [255, 224, 172] });
			"step 2";
			if (!player.hasSkill(event.name)) {
				return;
			} else {
				event.list.shift().damage(num);
				if (event.list.length) {
					event.redo();
				}
			}
		},
	},

	// 巴麻美
	"mami_duanbian": {
		trigger: {
			player: ["phaseZhunbeiBefore", "phaseJudgeBefore", "phaseDrawBefore", "phaseDiscardBefore"],
		},
		filter(event, player) {
			return player.countCards("h") > 0 || player.storage.mami_duanbian_mark;
		},
		preHidden: true,
		async cost(event, trigger, player) {
			const ZhunbeiCheck = player.storage.mami_duanbian_mark ? true : false;
			const discardstr = ZhunbeiCheck ? "跳过" : "弃置一张手牌并跳过";
			let phasenamestr = "弃牌阶段";
			let aicheck = false;

			const lebu_aif1 = player.hasCard(card => {
					return skills.ducardexcept_ai(get.suit(card) == "diamond" && lib.filter.cardDiscardable(card, player), card, player);
				}, "h");
			const lebu_ai = lebu_aif1 && game.hasPlayer(target => {
				return get.effect(target, {name: "lebu"}, player, player) > 0 && !target.hasJudge("lebu") && !target.hasSkill("tsuruno_qiangyun");
			})
			switch (trigger.name) {
				case "phaseZhunbei":
					phasenamestr = "准备阶段，你本回合接下来使用【缎变】跳过的两个阶段无需弃牌";
					aicheck = true;
					break;
				case "phaseJudge":
					phasenamestr = "判定阶段，然后可以移动场上的一张牌";
					if (!player.canMoveCard(true)) {
						aicheck = false;
					} else {
						aicheck = game.hasPlayer(function (current) {
							if (get.attitude(player, current) > 0){
								const f11 = current.countCards("j", card =>{
									return game.hasPlayer(target => {
										return current != target &&
											get.attitude(player, target) <= 0 &&
											!target.hasSkill("tsuruno_qiangyun") &&
											!target.hasJudge(card.name);
									});
								}) > 0;
								const f12 = current.countCards("e", card => 
										get.value(card, player) < 0 && 
										game.hasPlayer(target => 
											current != target &&
											get.effect(target, card, player, player) > 0 && 
											target.canEquip(card) && 
											!target.getEquip(get.subtype(card))
										)
									) > 0;
								return f11 || f12
							}
							if (get.attitude(player, current) <= 0){
								const f21 = current.countCards("e", card => 
									get.value(card, player) > 0 && 
									game.hasPlayer(target => 
										current != target &&
										get.effect(target, card, player, player) > 0 && 
										target.canEquip(card) && 
										!target.getEquip(get.subtype(card))
									)
								) > 0;
								return f21
							}
						});
					};
					break;
				case "phaseDraw": {
					phasenamestr = "摸牌阶段，然后可以获得至多X(X∈[0,3])名其他角色的各一张手牌并摸3-X张牌";
					aicheck = true;
					break;
				}
				case "phaseDiscard":
					aicheck = player.storage.mami_duanbian_mark || player.needsToDiscard() || lebu_ai;
					break;
			}

			event.result = ZhunbeiCheck ? (await player.chooseBool(discardstr + phasenamestr)
				.set("choice", aicheck)
				.setHiddenSkill(event.skill)
				.forResult())
				: (await player.chooseToDiscard(get.prompt(event.skill), discardstr + phasenamestr, lib.filter.cardDiscardable)
				.set("ai", card => {
					if (!_status.event.check) {
						return -1;
					}
					return skills.duexcept_ai((get.suit(card) == "diamond" && lebu_ai) ? (12 - get.value(card)) : (1 / get.value(card)), card, player);
				})
				.set("check", aicheck)
				.setHiddenSkill(event.skill)
				.forResult());

			if (event.result.bool && ZhunbeiCheck){
				player.storage.mami_duanbian_mark--;
				//刷新标记
				player.updateMarks();
				if (player.storage.mami_duanbian_mark == 0) {
					player.removeSkill("mami_duanbian_mark");
				}
			};
		},
		async content(event, trigger, player) {
			if (event.cards) {
				const card = event.cards[0];
				if (get.suit(card) == "diamond") {
					let result = await player.chooseTarget("缎变：请选择方块牌的目标，置入后当作【乐不思蜀】使用", function (card, player, target) {
						return target != player && !target.isDisabledJudge() && !target.hasJudge("lebu")
					}).set("ai", function (target) {
						if (get.effect(target, { name: "lebu" }, player, player) > 0)
							return -get.attitude(player, target);
						return 0;
					}).forResult();

					if (result.bool && !result.targets[0].hasJudge("lebu")) {
						player.line(result.targets, "green");
						result.targets[0].addJudge({ name: "lebu" }, card);
					}
				}
			}

			trigger.cancel();
			let triggerstr = "弃牌";

			switch (trigger.name) {
				case "phaseZhunbei":{
					triggerstr = "准备";
					player.storage.mami_duanbian_mark = 2;
					player.addTempSkill("mami_duanbian_mark");
					player.markSkill("mami_duanbian_mark");
					break;
				}
				case "phaseJudge":{
					triggerstr = "判定";
					if (player.canMoveCard()) {
						await player.moveCard();
					}
					await game.delay();
					break;
				}
				case "phaseDraw":{
					triggerstr = "抽牌";
					const { result } = await player
					.chooseTarget([0, 3], true, "获得至多三名角色各一张手牌", function (card, player, target) {
						return target != player && target.countCards("h");
					})
					.set("ai", function (target) {
						if (get.attitude(player, target) < 0 && target.countCards("h", card => get.value(card) < 0) <= target.countCards("h", card => get.value(card) > 0))
							return -get.attitude(player, target);
						return -1;
					});
					if (!result.bool) {
						return;
					}
					if (!result.targets.length) {
						await player.draw(3);
						return;
					}
					result.targets.sortBySeat();
					player.line(result.targets, "green");
					await player.gainMultiple(result.targets);
					await player.draw(3-result.targets.length);
					await game.delay();
					break;
				}
			}

			game.log(player, "跳过了", "#y" + triggerstr + "阶段");
		},
		subSkill: { 
			mark: {
				charlotte: true,
				mark: true,
				onremove(player) {
					delete player.storage.mami_duanbian_mark;
				},
				intro: {
					content(mark) {
						return "本回合使用【缎变】还有" + mark + "次可以不需要丢弃手牌来跳过阶段";
					},
				},
			},
		},
		ai: { 
			threaten: 3,
		},
	},
	
	"mami_zhongmu": {
		enable: "phaseUse",
		usable: 1,
		viewAs: { name: "wanjian" },
		audio: "ext:魔法纪录/audio/skill:2",
		filterCard: true,
		selectCard: 1,
		position: "hs",
		prompt: "将一张手牌当【万箭齐发】使用",
		check(card) {
			var player = _status.event.player;
			var targets = game.filterPlayer(function (current) {
				return player.canUse("wanjian", current);
			});
			var num = 0;
			for (var i = 0; i < targets.length; i++) {
				var eff = get.sgn(get.effect(targets[i], { name: "wanjian" }, player, player));
				if (targets[i].hp == 1) {
					eff *= 1.5;
				}
				num += eff;
			}
			if (!player.needsToDiscard(-1)) {
				if (targets.length >= 7) {
					if (num < 1) {
						return 0;
					}
				} else if (targets.length >= 5) {
					if (num < 0.5) {
						return 0;
					}
				}
			}
			return skills.duexcept_ai(6 - get.value(card), card, player);
		},
		ai: {
			threaten: 1.6,
		},
		group: ["mami_zhongmu_2"],
		subSkill: {
			2:{
				trigger: { player: "useCardAfter" },
				direct: true,
				filter(event, player) {
					return event.card.name == "wanjian" && event.targets.length != 0
				},
				async content(event, trigger, player) {
					const n = game.filterPlayer2(target => {
						return target.getHistory("damage", evt => evt.card && evt.card == trigger.card).length
					}).length
					const m = trigger.targets.length - n

					await player.draw(Math.max(n, m))
				}
			},
		},
	},
	"mami_jiandan": {
		audio: 2,
		trigger: { global: ["useCard"] },
		forced: true,
		filter(event, player) {
			return event.player != player && event.card.name == "wuxie" && ((event.respondTo && event.respondTo[1].name == "wanjian" ) || (event.getParent("phaseJudge", true)?.card?.name == "lebu"))
		},
		async content(event, trigger, player) {
			const target = trigger.player

			player.line(target)
			const result = await target.chooseToDiscard("h", "溅弹：弃置一张手牌，否则受到来自" + get.translation(player) + "的一点伤害")
				.set("ai", card => {
					return skills.duexcept_ai(7 - get.value(card, target), card, target)
				})
				.forResult();

			if (!result.bool)
				await target.damage()
		},
		group: "mami_jiandan_2",
		subSkill: {
			2:{
				trigger: {
					global: "discardAfter"
				},
				forced: true,
				filter(event, player) {
					return event.cards.filter(card => get.position(card, true) == "d" && card.original == "j").length > 0
				},
				async content(event, trigger, player) {
					const cards = trigger.cards.filter(card => get.position(card, true) == "d" && card.original == "j")
					await player.gain(cards, "gain2")
				}
			}
		}
	},

	// 圣巴麻美
	"saint_mami_zhongye": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		viewAs: { name: "wanjian" },
		filterCard(card, player) {
			if (!player.storage.saint_mami_zhongye) {
				return true;
			}
			return !player.storage.saint_mami_zhongye.includes(get.suit(card));
		},
		position: "hs",
		selectCard: 2,
		check(card) {
			const player = _status.event.player;
			const targets = game.filterPlayer(function (current) {
				return player.canUse("wanjian", current);
			});
			let num = 0;
			for (let i = 0; i < targets.length; i++) {
				let eff = get.sgn(get.effect(targets[i], { name: "wanjian" }, player, player));
				if (targets[i].hp == 1) {
					eff *= 1.5;
				}
				num += eff;
			}
			if (!player.needsToDiscard(-1)) {
				if (targets.length >= 7) {
					if (num < 2) {
						return 0;
					}
				} else if (targets.length >= 5) {
					if (num < 1.5) {
						return 0;
					}
				}
			}
			return 6 - get.value(card);
		},
		ai: {
			basic: {
				order: 8.9,
			},
		},
		group: ["saint_mami_zhongye_count", "saint_mami_zhongye_reset", "saint_mami_zhongye_respond", "saint_mami_zhongye_damage", "saint_mami_zhongye_draw"],
		subSkill: {
			reset: {
				trigger: { player: "phaseAfter" },
				silent: true,
				async content(event, trigger, player) {
					delete player.storage.saint_mami_zhongye;
					delete player.storage.saint_mami_zhongye2;
				},
			},
			count: {
				trigger: { player: "useCard" },
				silent: true,
				filter(event) {
					return event.skill == "saint_mami_zhongye";
				},
				async content(event, trigger, player) {
					player.storage.saint_mami_zhongye2 = trigger.card;
					if (!player.storage.saint_mami_zhongye) {
						player.storage.saint_mami_zhongye = [];
					}
					player.storage.saint_mami_zhongye.addArray(trigger.cards.map(c => get.suit(c)));
				},
			},
			respond: {
				trigger: { global: "respond" },
				silent: true,
				filter(event) {
					return event.getParent(2).skill == "saint_mami_zhongye";
				},
				async content(event, trigger, player) {
					await trigger.player.draw();
				},
			},
			damage: {
				trigger: { source: "damage" },
				forced: true,
				silent: true,
				popup: false,
				filter(event, player) {
					return player.storage.saint_mami_zhongye2 && event.card == player.storage.saint_mami_zhongye2;
				},
				async content(event, trigger, player) {
					delete player.storage.saint_mami_zhongye2;
				},
			},
			draw: {
				trigger: { player: "useCardAfter" },
				forced: true,
				silent: true,
				popup: false,
				filter(event, player) {
					return player.storage.saint_mami_zhongye2 && event.card == player.storage.saint_mami_zhongye2;
				},
				async content(event, trigger, player) {
					await player.draw(trigger.targets.length);
					delete player.storage.saint_mami_zhongye2;
				},
			},
		},
	},
	"saint_mami_xiaoyan": {
		trigger: {
			global: "roundStart"
		},
		filter(event, player) {
			if (!game.hasPlayer(current => current != player)) {
				return false;
			}
			if (player.storage.saint_mami_xiaoyan == true) {
				player.storage.saint_mami_xiaoyan = false;
				return false;
			}
			return true;
		},
		forced: true,
		group: ["saint_mami_xiaoyan_mark"],
		async content(event, trigger, player) {
			player.loseHp();
			let targets = game.filterPlayer(current => current != player).sortBySeat();
			player.line(targets);
			for (const target of targets) {
				await target.damage("fire");
			}
			targets = targets.filter(i => i.isIn());
			if (targets.length) {
				for (const target of targets) {
					if (!target.countCards("he")) {
						continue;
					}
					const {
						result: { bool },
					} = await target
						.chooseToGive("he", player)
						.set("prompt", "是否交给" + get.translation(player) + "一张牌" + (target.isDamaged() ? "并回复1点体力" : "") + "？")
						.set("ai", card => {
							const target = get.event("player"),
								player = get.event("target");
							const att = get.attitude(target, player);
							if (get.recoverEffect(target, target, target) <= 0) {
								if (att <= 0) {
									return -get.value(card);
								}
								return 0;
							}
							return 7 - get.value(card);
						})
						.set("target", player);
					if (bool) {
						await target.recover();
					}
				}
			}
		},
		subSkill: {
			mark: {
				trigger: { global: "dieAfter" },
				silent: true,
				async content(event, trigger, player) {
					player.storage.saint_mami_xiaoyan = true;
				},
			},
		},
	},

	// 吴纪里香
	"kirika_shensu": {
		audio: "ext:魔法纪录/audio/skill:2",
		group: ["kirika_shensu_1", "kirika_shensu_2", "kirika_shensu_4"],
		preHidden: ["kirika_shensu_1", "kirika_shensu_2", "kirika_shensu_4"],
		subSkill: {
			1: {
				audio: "kirika_shensu",
				inherit: "shensu1",
				sourceSkill: "kirika_shensu",
			},
			2: {
				audio: "kirika_shensu",
				inherit: "shensu2",
				sourceSkill: "kirika_shensu",
			},
			4: {
				audio: "kirika_shensu",
				inherit: "shensu4",
				sourceSkill: "kirika_shensu",
			},
		},
	},
	"kirika_renya": {
		trigger: { player: "damageEnd" },
		filter(event, player) {
			return event.source?.isIn();
		},
		check(event, player) {
			return get.attitude(player, event.source) <= 0;
		},
		logTarget: "source",
		async content(event, trigger, player) {
			const { source } = trigger;
			const judgeEvent = player.judge(card => {
				if (get.color(card) == "red") {
					return 0;
				}
				return 2;
			});
			judgeEvent.judge2 = result => result.bool;
			let result;
			result = await judgeEvent.forResult();
			switch (result?.color) {
				case "black":
					if (source.isIn()) {
						await source.damage();
					}
					break;

				case "red":
					if (source.countDiscardableCards(player, "h")) {
						await source.chooseToDiscard(2, "h", true);
					}
					if (player.isTurnedOver()) {
						await player.turnOver();
					}
					break;
				default:
					break;
			}
		},
		ai: {
			maixie_defend: true,
			effect: {
				target(card, player, target) {
					if (player.hasSkillTag("jueqing", false, target)) {
						return [1, -1];
					}
					return 0.8;
					// if(get.tag(card,'damage')&&get.damageEffect(target,player,player)>0) return [1,0,0,-1.5];
				},
			},
		},
	},

	// 里见那由他
	"nayuta_kanwu": {
		audio: "huanshi",
		trigger: { global: "judge" },
		direct: true,
		preHidden: true,
		filter(event, player) {
			return player.countCards("hes", { color: "red" }) > 0;
		},
		content() {
			"step 0";
			player
				.chooseCard(get.translation(trigger.player) + "的" + (trigger.judgestr || "") + "判定为" + get.translation(trigger.player.judging[0]) + "，" + get.prompt("nayuta_kanwu"), "hes", function (card) {
					var player = _status.event.player;
					var mod2 = game.checkMod(card, player, "unchanged", "cardEnabled2", player);
					if (mod2 != "unchanged") {
						return mod2;
					}
					var mod = game.checkMod(card, player, "unchanged", "cardRespondable", player);
					if (mod != "unchanged") {
						return mod;
					}
					return get.color(card) == "red";
				})
				.set("ai", function (card) {
					var trigger = _status.event.getTrigger();
					var player = _status.event.player;
					var judging = _status.event.judging;
					var result = trigger.judge(card) - trigger.judge(judging);
					var attitude = get.attitude(player, trigger.player);
					if (attitude == 0 || result == 0) {
						return 0;
					}
					if (attitude > 0) {
						return result - get.value(card) / 2;
					} else {
						return -result - get.value(card) / 2;
					}
				})
				.set("judging", trigger.player.judging[0])
				.setHiddenSkill("nayuta_kanwu");
			"step 1";
			if (result.bool) {
				player.respond(result.cards, "nayuta_kanwu", "highlight", "noOrdering");
			} else {
				event.finish();
			}
			"step 2";
			if (result.bool) {
				if (trigger.player.judging[0].clone) {
					trigger.player.judging[0].clone.classList.remove("thrownhighlight");
					game.broadcast(function (card) {
						if (card.clone) {
							card.clone.classList.remove("thrownhighlight");
						}
					}, trigger.player.judging[0]);
					game.addVideo("deletenode", player, get.cardsInfo([trigger.player.judging[0].clone]));
				}
				game.cardsDiscard(trigger.player.judging[0]);
				trigger.player.judging[0] = result.cards[0];
				trigger.orderingCards.addArray(result.cards);
				game.log(trigger.player, "的判定牌改为", result.cards[0]);
				game.delay(2);
			}
		},
		ai: {
			rejudge: true,
			tag: {
				rejudge: 1,
			},
		},
	},
	"nayuta_mingsu": {
		trigger: {
			player: ["loseAfter", "useCard", "respond"],
			global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
		},
		filter(event, player) {
			if (player == _status.currentPhase) {
				return false;
			}
			if (event.name == "useCard" || event.name == "respond") {
				return (
					get.color(event.card, false) == "red" &&
					player.hasHistory("lose", function (evt) {
						return evt.getParent() == event && evt.hs && evt.hs.length > 0;
					})
				);
			}
			var evt = event.getl(player);
			if (!evt || !evt.es || !evt.es.length) {
				return false;
			}
			for (var i of evt.es) {
				if (get.color(i, player) == "red") {
					return true;
				}
			}
			return false;
		},
		frequent: true,
		preHidden: true,
		content() {
			player.draw();
		},
	},

	// 绫野梨花
	"rika_liuge": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "damageBegin3" },
		filter(event, player) {
			return player.countCards("he", { color: "red" }) > 0 && event.num > 0;
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCardTarget({
					position: "he",
					filterCard(card, player) {
						return get.color(card) == "red" && lib.filter.cardDiscardable(card, player);
					},
					filterTarget(card, player, target) {
						return player != target;
					},
					ai1(card) {
						return 10 - get.value(card);
					},
					ai2(target) {
						const att = get.attitude(_status.event.player, target);
						const trigger = _status.event.getTrigger();
						let da = 0;
						if (_status.event.player.hp == 1) {
							da = 10;
						}
						if (trigger.num > 1) {
							if (target.maxHp > 5 && target.hp > 1) {
								return -att / 10 + da;
							}
							return -att + da;
						}
						const eff = get.damageEffect(target, trigger.source, target, trigger.nature);
						if (att == 0) {
							return 0.1 + da;
						}
						if (eff >= 0 && trigger.num == 1) {
							return att + da;
						}
						if (target.hp == target.maxHp) {
							return -att + da;
						}
						if (target.hp == 1) {
							if (target.maxHp <= 4 && !target.hasSkillTag("maixie")) {
								if (target.maxHp <= 3) {
									return -att + da;
								}
								return -att / 2 + da;
							}
							return da;
						}
						if (target.hp == target.maxHp - 1) {
							if (target.hp > 2 || target.hasSkillTag("maixie")) {
								return att / 5 + da;
							}
							if (att > 0) {
								return 0.02 + da;
							}
							return 0.05 + da;
						}
						return att / 2 + da;
					},
					prompt: get.prompt2(event.skill),
				})
				.forResult();
		},
		async content(event, trigger, player) {
			trigger.player = event.targets[0];
			trigger.player.addSkill("rika_liuge2");
			await player.discard(event.cards[0]);
		},
		ai: {
			maixie_defend: true,
			effect: {
				target(card, player, target) {
					if (player.hasSkillTag("jueqing", false, target)) {
						return;
					}
					if (get.tag(card, "damage") && target.countCards("he") > 1) {
						return 0.7;
					}
				},
			},
			threaten(player, target) {
				if (target.countCards("he") == 0) {
					return 2;
				}
			},
		},
	},
	rika_liuge2: {
		trigger: { player: ["damageAfter", "damageCancelled", "damageZero"] },
		forced: true,
		popup: false,
		audio: false,
		vanish: true,
		charlotte: true,
		sourceSkill: "rika_liuge",
		async content(event, trigger, player) {
			player.removeSkill("rika_liuge2");
			player.popup("rika_liuge");
			if (player.getDamagedHp()) {
				await player.draw(player.getDamagedHp());
			}
		},
	},
	"rika_sanshe": {
		trigger: { target: ["rewriteGainResult", "rewriteDiscardResult"] },
		direct: true,
		preHidden: true,
		filter(event, player) {
			return event.player != player;
		},
		mod: {
			maxHandcardBase(player) {
				return player.maxHp;
			},
		},
		content() {
			"step 0";
			var prompt = "即将失去" + get.translation(trigger.result.cards) + "，是否发动【散射】？";
			var next = player.choosePlayerCard(player, prompt, trigger.position);
			next.set("ai", function (button) {
				return 20 - get.value(button.link);
			});
			next.filterButton = trigger.filterButton;
			next.selectButton = trigger.result.cards.length;
			next.setHiddenSkill("rika_sanshe");
			"step 1";
			if (result.bool) {
				player.logSkill("rika_sanshe");
				trigger.result.cards = result.links.slice(0);
				trigger.result.links = result.links.slice(0);
				trigger.cards = result.links.slice(0);
				trigger.untrigger();
			}
		},
	},

	// 五十铃怜
	"ren_beige": {
		inherit: "olbeige",
		audio: "ext:魔法纪录/audio/skill:2",
	},

	// 十咎桃子
	"momoko_liji": {
		enable: "phaseUse",
		usable: 2,
		filter(event, player) {
			return (player.hp >= 1 || player.hasCard(card => get.type(card) == "equip" && lib.filter.cardDiscardable(card, player), "he")) && game.hasPlayer(current => player != current && !player.getStat("momoko_liji")?.includes(current));
		},
		async content(event, trigger, player) {
			let n = [0, 1]
			if (player.hp < 1)
				n = 1
			const result = await player.chooseCardTarget({
				prompt: "弃置装备牌，或者不弃置体力流失1点，选一名角色造成一点伤害",
				filterCard(card, player) {
					return get.type(card) == "equip" && lib.filter.cardDiscardable(card, player)
				},
				filterTarget(card, player, target) {
					return player != target && !player.getStat("momoko_liji")?.includes(target)
				},
				forced: true,
				position: "he",
				selectCard: n,
				selectTarget: 1,
				ai1(card) {
					return skills.duexcept_ai(100 - get.value(card), card, player);
				},
				ai2(target) {
					return get.damageEffect(target, player, player)
				}
			}).forResult()

			if (!result.bool)
				return false

			const target = result.targets[0]
			let stat = player.getStat();
			if (!stat.momoko_liji)
				stat.momoko_liji = [];
			stat.momoko_liji.push(target);

			const card2 = result.cards[0]
			if (!card2) {
				await player.loseHp();
				const card = get.cardPile(function (card) {
					return get.type(card) == "equip";
				});
				if (card)
					await player.gain(card, "gain2");
			} else {
				await player.discard(card2)
				if (get.position(card2) == "d" && game.hasPlayer(function (current) {
					return current != player && current.canUse(card2, current)
				})) {
					const target2 = await player.chooseTarget(function (card, player, target) {
						return target != player && target.canUse(card2, target)
					}).set("prompt", "可以令一名角色使用【" + get.translation(card2) + "】并摸两张牌").set("ai", function (target) {
						return get.effect(target, card2, player, player);
					}).forResult();

					if (target2.bool) {
						await target2.targets[0].equip(card2)
						await target2.targets[0].draw(2)
					}
				}
			}
			player.line(target);
			await target.damage();
		},
		ai: {
			damage: true,
			order: 8,
			result: {
				player(player, target) {
					if (game.hasPlayer(current => player != current && !player.getStat("momoko_liji")?.includes(current) && get.damageEffect(current, player, player) > 0)) {
						if (player.hasCard(card => get.type(card) == "equip" && lib.filter.cardDiscardable(card, player), "he") || player.hp > 2)
							return 1
						if (player.hasSkill("momoko_liji2")) {
							const liji = player.getExpansions("momoko_liji2");
							if (liji.length == 0)
								return 1
							let cardsByNumber = {};
							for (const card of liji) {
								const num = get.number(card);
								if (!cardsByNumber[num])
									cardsByNumber[num] = [];
								cardsByNumber[num].push(card);
							}
							if (liji.length <= 6)
								return 1
						}
					}
					return -1;
				},
			},
			threaten: 2,
		}
	},
	"momoko_liji2": {
		trigger: { player: "chooseToUseBefore" },
		forced: true,
		filter(event, player) {
			return event.type == "dying" && player.isDying() && event.dying == player && !event.getParent()._momoko_liji2;
		},
		async content(event, trigger, player) {
			trigger.getParent()._momoko_liji2 = true;
			const [card] = get.cards();
			const next = player.addToExpansion(card, "gain2");
			next.gaintag.add("momoko_liji2");
			await next;
			const cards = player.getExpansions("momoko_liji2"),
				num = get.number(card);
			player.showCards(cards, "励己");
			for (let i = 0; i < cards.length; i++) {
				if (cards[i] != card && get.number(cards[i]) == num)
					return;
			}
			trigger.cancel();
			trigger.result = { bool: true };
			if (player.hp <= 0)
				await player.recoverTo(1);
		},
		mod: {
			maxHandcardBase(player, num) {
				if (player.getExpansions("momoko_liji2").length) {
					return player.getExpansions("momoko_liji2").length + num;
				}
			},
		},
		ai: {
			save: true,
			mingzhi: true,
			skillTagFilter(player, tag, target) {
				if (player != target) {
					return false;
				}
			},
		},
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
		group: "momoko_liji2_recover",
		subSkill: {
			recover: {
				trigger: {
					player: "recoverAfter"
				},
				forced: true,
				filter(event, player) {
					return event.getParent().name != "momoko_liji2"
				},
				async content(event, trigger, player) {
					const card = get.cardPile(function (card) {
						return get.type(card) == "equip";
					});
					if (card)
						await player.gain(card, "gain2");

					const liji = player.getExpansions("momoko_liji2");
					if (liji.length == 0) return;

					let cardsByNumber = {};
					for (const card of liji) {
						const num = get.number(card);
						if (!cardsByNumber[num])
							cardsByNumber[num] = [];
						cardsByNumber[num].push(card);
					}

					const randomNumber = Object.keys(cardsByNumber).randomGet();

					let cards = cardsByNumber[randomNumber];
					const duCards = cards.filter(card => get.name(card) === 'du')
					if (duCards.length > 0) {
						cards.removeArray(duCards);
						await player.discard(duCards);
						await player.draw(duCards.length);
					}
					await player.gain(cards, "gain2");
				}
			}
		}
	},

	// 天音月夜
	"yueye_yingyin": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "phaseDrawEnd" },
		filter: (event, player) => player.countCards("he") > 0,
		async cost(event, trigger, player) {
			event.result = await player
				.chooseToDiscard("he", get.prompt("yueye_yingyin"), "弃置一张牌，然后你本回合内可以将一张与此牌颜色不同的牌当做【决斗】使用", "chooseonly")
				.set("ai", function (card) {
					let player = _status.event.player;
					if (!_status.event.goon || player.skipList.includes("phaseUse")) {
						return -get.value(card);
					}
					let color = get.color(card),
						effect = 0,
						cards = player.getCards("hes"),
						sha = false;
					for (const cardx of cards) {
						if (cardx == card || get.color(cardx) == color) {
							continue;
						}
						const cardy = get.autoViewAs({ name: "juedou" }, [cardx]),
							eff1 = player.getUseValue(cardy);
						if (get.position(cardx) == "e") {
							let eff2 = get.value(cardx);
							if (eff1 > eff2) {
								effect += eff1 - eff2;
							}
							continue;
						} else if (get.name(cardx) == "sha") {
							if (sha) {
								effect += eff1;
								continue;
							} else {
								sha = true;
							}
						}
						let eff2 = player.getUseValue(cardx, null, true);
						if (eff1 > eff2) {
							effect += eff1 - eff2;
						}
					}
					return effect - get.value(card);
				})
				.set("goon", player.hasValueTarget({ name: "juedou" }) && !player.hasSkill("yueye_yingyin_effect"))
				.forResult();
		},
		async content(event, trigger, player) {
			const { cards } = event,
				color = get.color(cards[0], player);
			await player.modedDiscard(cards);
			player.markAuto("yueye_yingyin_effect", [color]);
			player.addTempSkill("yueye_yingyin_effect");
		},
		group: "yueye_yingyin_jianxiong",
		subSkill: {
			effect: {
				audio: "yueye_yingyin",
				enable: "chooseToUse",
				viewAs: { name: "juedou" },
				position: "hes",
				viewAsFilter(player) {
					return player.hasCard(card => lib.skill.yueye_yingyin_effect.filterCard(card, player), "hes");
				},
				filterCard(card, player) {
					const color = get.color(card),
						colors = player.getStorage("yueye_yingyin_effect");
					for (const i of colors) {
						if (color != i) {
							return true;
						}
					}
					return false;
				},
				prompt() {
					const colors = _status.event.player.getStorage("yueye_yingyin_effect");
					let str = "将一张颜色";
					for (let i = 0; i < colors.length; i++) {
						if (i > 0) {
							str += "或";
						}
						str += "不为";
						str += get.translation(colors[i]);
					}
					str += "的牌当做【决斗】使用";
					return str;
				},
				check(card) {
					const player = _status.event.player;
					if (get.position(card) == "e") {
						const raw = get.value(card);
						const eff = player.getUseValue(get.autoViewAs({ name: "juedou" }, [card]));
						return eff - raw;
					}
					const raw = player.getUseValue(card, null, true);
					const eff = player.getUseValue(get.autoViewAs({ name: "juedou" }, [card]));
					return eff - raw;
				},
				onremove: true,
				charlotte: true,
				ai: { order: 7 },
			},
			jianxiong: {
				audio: "yueye_yingyin",
				trigger: { player: "phaseJieshuBegin" },
				forced: true,
				locked: false,
				filter(event, player) {
					return player.hasHistory("damage", function (evt) {
						//Disable Umi Kato's chaofan
						return evt.card && evt.cards && evt.cards.some(card => get.position(card, true));
					});
				},
				content() {
					const cards = [];
					player.getHistory("damage", function (evt) {
						if (evt.card && evt.cards) {
							cards.addArray(evt.cards.filterInD("d"));
						}
					});
					if (cards.length) {
						player.gain(cards, "gain2");
					}
				},
			},
		},
	},

	// 天音月咲
	"yuexiao_yingyu": {
		enable: ["chooseToUse", "chooseToRespond"],
		filterCard: true,
		selectCard: 2,
		position: "hes",
		audio: "ext:魔法纪录/audio/skill:2",
		derivation: ["new_rewusheng", "olpaoxiao"],
		group: ["yuexiao_yingyu_effect", "yuexiao_yingyu_mark"],
		global: ["yuexiao_yingyu_block"],
		viewAs: { name: "sha" },
		prompt: "将两张牌当杀使用或打出",
		viewAsFilter(player) {
			return player.countCards("hes") > 1;
		},
		check(card) {
			if (_status.event.player.hasSkill("new_rewusheng") && get.color(card) == "red") {
				return 0;
			}
			if (_status.event.name == "chooseToRespond") {
				if (card.name == "sha") {
					return 0;
				}
				return 6 - get.useful(card);
			}
			if (_status.event.player.countCards("hs") < 4) {
				return 6 - get.useful(card);
			}
			return 7 - get.useful(card);
		},
		ai: {
			respondSha: true,
			skillTagFilter(player) {
				if (player.countCards("hs") < 2) {
					return false;
				}
			},
			order(item, player) {
				if (player.hasSkill("new_rewusheng") && player.hasSkill("olpaoxiao")) {
					return 1;
				}
				if (player.countCards("hs") < 4) {
					return 1;
				}
				return 4;
			},
		},
		subSkill: {
			effect: {
				audio: "yuexiao_yingyu",
				trigger: {
					source: "damageSource",
				},
				forced: true,
				filter(event, player) {
					if (["new_rewusheng", "olpaoxiao"].every(skill => player.hasSkill(skill, null, false, false))) {
						return false;
					}
					return player.isPhaseUsing();
				},
				content() {
					player.addTempSkills(["new_rewusheng", "olpaoxiao"]);
				},
			},
			mark: {
				audio: "yuexiao_yingyu",
				forced: true,
				locked: false,
				trigger: { player: "useCard" },
				firstDo: true,
				filter(event, player) {
					return event.card?.name == "sha" && get.is.convertedCard(event.card);
				},
				content() {
					if (!trigger.card.storage) {
						trigger.card.storage = {};
					}
					trigger.card.storage.yuexiao_yingyu = true;
				},
			},
			//根据思召剑和谋韩当的弓骑修改
			block: {
				mod: {
					cardEnabled(card, player) {
						let evt = get.event();
						if (evt.name != "chooseToUse") {
							evt = evt.getParent("chooseToUse");
						}
						if (!evt?.respondTo || !evt.respondTo[1]?.storage?.yuexiao_yingyu) {
							return;
						}
						const color1 = get.color(card),
							color2 = get.color(evt.respondTo[1]),
							hs = player.getCards("h"),
							cards = [card];
						if (color1 === "unsure") {
							return;
						}
						if (Array.isArray(card.cards)) {
							cards.addArray(card.cards);
						}
						if (color1 != color2 || !cards.containsSome(...hs)) {
							return false;
						} //
					},
				},
				charlotte: true,
			},
		},
	},

	// 阿莉娜
	"alina_moying": {
		trigger: {
			player: "loseAfter",
			global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
		},
		usable: 1,
		audio: "ext:魔法纪录/audio/skill:2",
		filter(event, player) {
			if (player == _status.currentPhase || event.getParent().name == "useCard") {
				return false;
			}
			if (event.name == "gain" && event.player == player) {
				return false;
			}
			var evt = event.getl(player);
			return evt && evt.cards2 && evt.cards2.length == 1 && ["equip", "trick"].includes(get.type2(evt.cards2[0], evt.type == "discard" && evt.hs.includes(evt.cards2[0]) ? player : false));
		},
		async content(event, trigger, player) {
			var number = trigger.getl(player).cards2[0].number;
			var numbers = [number - 2, number - 1, number, number + 1, number + 2];
			for (let i = 0; i < numbers.length; i++) {
				if (numbers[i] <= 0) numbers[i] = numbers[i] + 13;
				if (numbers[i] > 13) numbers[i] = numbers[i] - 13;
			}

			await player.draw(13);
			let cards = player.getCards("he").filter(function (card) {
				return !numbers.includes(get.number(card));
			});
			let num = cards.length;
			player.discard(cards);

			let target = _status.currentPhase;
			if (target && num >= 2) {
				let result = await player.chooseControl(["弃置手牌", "造成1点伤害", "取消"])
					.set("ai", function () {
						const target = _status.currentPhase;
						if (get.attitude(player, target) > 0) return 2;

						var eff0 = get.effect(target, { name: "guohe_copy2" }, player, player) * Math.min(1.7, target.countCards("he"));
						var eff1 = get.damageEffect(target, player, player);
						return eff0 > eff1 ? 0 : 1;
					})
					.forResult();

				switch (result.index) {
					case 0:
						player.line(target);
						player.discardPlayerCard(target, num, true, "he");
						break;
					case 1:
						player.line(target);
						target.damage();
						break;
					case 2:
						trigger.cancel();
						break;
				}
			}
		},
		ai: {
			noe: true,
		},
	},

	// 蓝家姬奈
	"himena_zhiquan": {
		trigger: { player: "useCardAfter" },
		filter(event, player) {
			return event.targets && event.targets.includes(player);
		},
		frequent: true,
		async content(event, trigger, player) {
			let card = get.cards();
			await player.showCards(card, get.translation(player) + "的【执权】结果为");
			player.addToExpansion(card).gaintag.add("himena_zhiquan");
			if (player.getExpansions("himena_zhiquan").some(current => current.number == get.number(card))) {
				player.useSkill("himena_shanji");
			}
		},
		onremove(player, skill) {
			var cards = player.getExpansions(skill);
			if (cards.length) {
				player.loseToDiscardpile(cards);
			}
		},
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
		marktext: "权",
		ai: { combo: "himena_shanji" },
	},
	"himena_shanji": {
		trigger: { player: "phaseJieshuBegin" },
		filter(event, player) {
			return player.getExpansions("himena_zhiquan").length > 0;
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseBool(get.prompt2("himena_shanji"))
				.set("ai", () => {
					var player = _status.event.player;
					if (!game.hasPlayer(target => target != player && get.damageEffect(target, player, player, "thunder") > 0)) {
						return 0;
					}
					if (
						player.getExpansions("himena_zhiquan").reduce(function (num, card) {
							return num + get.number(card, false);
						}, 0) > 36
					) {
						return 10;
					} else {
						return 2;
					}
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const cards = event.cards;
			const result = await player
				.chooseButton(["###是否移去任意张“权”，对一名其他角色造成1点雷属性伤害？###若你移去的“权”的点数和大于36，则改为造成3点雷属性伤害", player.getExpansions("himena_zhiquan")], [1, player.getExpansions("himena_zhiquan").length])
				.set("ai", button => {
					var player = _status.event.player;
					var cards = player.getExpansions("himena_zhiquan");
					if (
						cards.reduce(function (num, card) {
							return num + get.number(card, false);
						}, 0) <= 36
					) {
						if (!ui.selected.buttons.length) {
							return 1 / get.number(button.link, false);
						}
						return 0;
					} else {
						var num = 0,
							list = [];
						cards.sort((a, b) => get.number(b, false) - get.number(a, false));
						for (var i = 0; i < cards.length; i++) {
							list.push(cards[i]);
							num += get.number(cards[i], false);
							if (num > 36) {
								break;
							}
						}
						return list.includes(button.link) ? 1 : 0;
					}
				})
				.forResult();
			if (result?.bool) {
				const bool =
					result.links.reduce(function (num, card) {
						return num + get.number(card, false);
					}, 0) > 36;
				await player.loseToDiscardpile(result.links);
				const result2 = await player
					.chooseTarget("请选择一名其他角色", "对其造成" + (bool ? 3 : 1) + "点雷属性伤害", lib.filter.notMe)
					.set("ai", target => get.damageEffect(target, _status.event.player, _status.event.player, "thunder"))
					.forResult();
				if (result2?.bool) {
					const target = result2.targets[0];
					player.line(target, "thunder");
					target.damage(bool ? 3 : 1, "thunder");
				}
			}
		},
	},

	//八云御魂
	"mitama_yuhun": {
		trigger: {
			player : "phaseBegin"
		},
		filter(event, player) {
			return !player.hasSkill("mitama_yuhun_clear");
		},
		check(card) {
			if (
				game.hasPlayer(function (current) {
					return get.attitude(_status.event.player, current) > 0;
				})
			)
				return 1;
			return 0;
		},
		async cost(event, trigger, player) {
			const result = await player.chooseTarget([1, 4], "御魂：请选择最多4个要获得技能的角色")
				.set("filterTarget", (card, player, target) => {
					return !target.hasSkill("mitama_yuhun_mark");
				})
				.set("ai", function (target) {
					return get.attitude(player, target)
				})
				.forResult();
			
			event.result = {
				bool: result.bool,
				cost_data: result.targets
			}
		},
		async content(event, trigger, player) {
			const targets = event.cost_data;
			player.line(targets, "green")
			targets.sortBySeat();

			game.log(get.translation(player) + "发动了【御魂】");
			event.skills = lib.skill.mitama_yuhun.derivation.randomGets(targets.length);
			player.addTempSkill("mitama_yuhun_clear", { player: "phaseBeginStart" });
			
			for (let i = 0; i < targets.length; i++) {
				const target = targets[i];
				const result = await target.chooseControl(event.skills, true)
					.set(
						"choiceList",
						event.skills.map(function (skill) {
							return '<div class="skill">【' + get.translation(lib.translate[skill + "_ab"] || get.translation(skill).slice(0, 2)) + "】</div><div>" + get.skillInfoTranslation(skill, player) + "</div>";
						})
					)
					.set("displayIndex", false)
					.set("prompt", "御魂：选择获得一个技能")
					.forResult();
					
				const skill = result.control;
				event.skills.remove(skill);
				target.addAdditionalSkills("mitama_yuhun_" + player.playerid, skill, true);
				target.addSkill("mitama_yuhun_mark");
				target.markAuto("mitama_yuhun_mark", skill);
				
				if (target != game.me && !target.isOnline2()) {
					game.delayx();
				}
			}

			const num = 4 - targets.length
			if (num > 0 && !player.storage.mitama_tiaozheng)
				await player.draw(num)
		},
		ai: {
			threaten: 3,
			order: 10,
			result: {
				target: 1,
			},
		},
		//derivation: ["releiji", "kirika_shensu", "reyingzi", "remingce", "xinzhiyan", "nhyinbing", "nhhuoqi", "nhguizhu", "tsuruno_qiangyun", "iroha_huanyu", "nayuta_kanwu", "nhyanzheng"],
		derivation: ["releiji", "reyingzi", "remingce", "xinzhiyan", "nhyinbing", "nhhuoqi", "nhguizhu", "tsuruno_qiangyun", "iroha_huanyu", "nhyanzheng"],
		subSkill: {
			clear: {
				charlotte: true,
				onremove(player) {
					game.countPlayer(function (current) {
						current.removeAdditionalSkills("mitama_yuhun_" + player.playerid);
						current.removeSkills("mitama_yuhun_mark");
					});
				},
			},
			mark: {
				mark: true,
				marktext: "御",
				nopop: true,
				charlotte: true,
				onremove: true,
				intro:{
					content(storage){
						return "得到调整屋技能【" + get.translation(storage)  + "】：" + get.skillInfoTranslation(storage)
					}
				}
			},
		},
	},
	"mitama_tiaozheng": {
		trigger: { player: "phaseJieshu" },
		frequent: true,
		async cost(event, trigger, player) {
			event.list1 = [];
			event.list2 = [];
			
			game.countPlayer(function (current) {
				if (current.additionalSkills["mitama_yuhun_" + player.playerid]) {
					event.list1.push(current);
				} else {
					event.list2.push(current);
				}
			});
			
			const ck = player.storage.mitama_tiaozheng == true
			let str1 = "无法选择", str2 = "无法选择", str3 = "无法选择"
			let choice = []
			const f1 = event.list1.length
			const f2 = event.list2.length
			const f3 = f1 && f2 && ck && player.hasCard(card => lib.filter.cardDiscardable(card, player), "h")

			if (f1) {
				event.list1.sortBySeat();
				str1 = "令" + get.translation(event.list1) + (event.list1.length > 1 ? "各" : "") + "摸1张牌(若其没有手牌改为摸2张牌)";
				choice.push("选项一")
			}
			
			if (f2) {
				event.list2.sortBySeat();
				str2 = "令" + get.translation(event.list2) + (event.list2.length > 1 ? "各" : "") + "弃置1张手牌(之后目标若没有手牌你摸2张牌)"
				choice.push("选项二")
			}

			if (f3) {
				str3 = "弃一张手牌，背水"
				choice.push("背水")
			}
			choice.push("cancel2")
			
			let n1 = 0, n2 = 0, n3 = -1
			for (let i of event.list1) {
				const att = get.attitude(player, i) >= 0 ? 1 : -1
				n1 += 1 * att
				n3 += 1 * att
				if (i.countCards("h") == 0) {
					n1 += 1 * att
					n3 += 1 * att
				}
			}
			for (let i of event.list2) {
				const att = get.attitude(player, i) <= 0 ? 1 : -1
				const n = i.countCards("h")
				n2 += Math.min(n, 1) * att
				n3 += Math.min(n, 1) * att
				if (n <= 1)
					n2 += 1
				if (n <= 1)
					n3 += 2
			}
			let nArray = [n1, n2, n3]
			if (!f3)
				nArray.remove(n3)
			if (!f2)
				nArray.remove(n2)
			if (!f1)
				nArray.remove(n1)
			const max = Math.max(...nArray);
			let aichoice
			if (max < 0)
				aichoice = "cancel2"
			else {
				if (max == n2 && f2)
					aichoice = "选项二"
				if (max == n1 && f1)
					aichoice = "选项一"
				if (max == n3 && f3)
					aichoice = "背水"
			} 
			const result = await player.chooseControl(choice)
				.set("prompt", "调整：请选择一项")
				.set("choiceList", [
					str1, str2, str3
				])
				.set("choice", aichoice)
				.set("ai", function () {
					return _status.event.choice;
				})
				.forResultControl();
			
			event.result = {
				bool: result != "cancel2",
				cost_data: result,
			}
		},
		async content(event, trigger, player) {
			event.list1 = [];
			event.list2 = [];
			
			game.countPlayer(function (current) {
				if (current.additionalSkills["mitama_yuhun_" + player.playerid]) {
					event.list1.push(current);
				} else {
					event.list2.push(current);
				}
			});

			event.list1.sortBySeat();
			event.list2.sortBySeat();
			const result = event.cost_data
			if (result == "背水")
				await player.chooseToDiscard("h", true).set("prompt", "调整：弃一张手牌").set("ai", card => skills.duexcept_ai(100 - get.value(card), card, player))
			if (result == "选项一" || result == "背水") {
				player.line(event.list1, "green");
				for (let i of event.list1) {
					if (i.countCards("h") == 0)
						await i.draw(2)
					await i.draw(1)
				}
			}
			if (result == "选项二" || result == "背水") {
				player.line(event.list2);
				for (let i of event.list2) {
					await i.chooseToDiscard("h", true).set("prompt", "调整：弃一张手牌").set("ai", card => skills.duexcept_ai(100 - get.value(card), card, player))
					if (i.countCards("h") == 0)
						await player.draw(2)
				}
			}
		},
		ai: {
			combo: "mitama_yuhun",
		},
	},
	"mitama_chuanshu": {
		trigger: { global: "dying" },
		limited: true,
		filter(event, player) {
			return event.player.hp <= 0
		},
		check(event, player) {
			return get.attitude(player, event.player) > 0;
		},
		logTarget: "player",
		async content(event, trigger, player) {
			player.storage.mitama_tiaozheng = true
			player.awakenSkill(event.name)
			const skills = lib.skill.mitama_yuhun.derivation.randomGets(4)
			const result = await trigger.player.chooseControl(skills, true)
					.set(
						"choiceList",
						skills.map(function (skill) {
							return '<div class="skill">【' + get.translation(lib.translate[skill + "_ab"] || get.translation(skill).slice(0, 2)) + "】</div><div>" + get.skillInfoTranslation(skill, player) + "</div>";
						})
					)
					.set("displayIndex", false)
					.set("prompt", "传术：选择获得一项技能")
					.forResultControl();
			
			trigger.player.addTempSkill(result, { player : "dieAfter" });
			trigger.player.storage.mitama_chuanshu = result
			await trigger.player.addSkill(result.control);
			await trigger.player.recoverTo(1);
			await trigger.player.draw(2);
			trigger.player.storage.mitama_shuhun = player;
			trigger.player.addSkill("mitama_shuhun");
		},
		ai: {
			order: 1,
			skillTagFilter(player, tag, target) {
				if (game.hasPlayer(current => current.hasSkill("mitama_shuhun"))) {
					return false;
				}
			},
			save: true,
			threaten(player, target) {
				if (!game.hasPlayer(current => current.hasSkill("mitama_shuhun"))) {
					return 0.6;
				}
			},
		},
	},
	"mitama_shuhun":{
		trigger: { player: "damageEnd", source: "damageEnd" },
		filter(event, player) {
			return event.num > 0
		},
		onremove(player) {
			delete player.storage.mitama_shuhun
		},
		getIndex: event => event.num,
		forced: true,
		preHidden: true,
		mark: "character",
		filter(event, player) {
			return player.storage.mitama_shuhun && player.storage.mitama_shuhun.isIn() && event.num > 0;
		},
		intro: {
			content(storage, player){
				const storage2 = player.storage.mitama_chuanshu
				if (player.name != "mitama")
					return "①你造成或受到伤害后，八云御魂摸一张牌。②你死亡后，八云御魂重置技能【传术】。③获得传术技能【" + get.translation(storage2)  + "】：" + get.skillInfoTranslation(storage2)
				return "①你造成或受到伤害后，摸一张牌。②你死亡后，可令一名角色失去所有手牌。③获得传术技能【" + get.translation(storage2)  + "】：" + get.skillInfoTranslation(storage2)
			}
		},
		async content(event, trigger, player) {
			await player.storage.mitama_shuhun.draw()
		},
		group: "mitama_shuhun_2",
		subSkill: {
			2: {
				trigger: {
					player: "die",
				},
				onremove: true,
				forceDie: true,
				sourceSkill: "mitama_chuanshu",
				filter(event, player) {
					return player.name == "mitama" || (player.storage.mitama_shuhun && player.storage.mitama_shuhun.isIn());
				},
				async content(event, trigger, player) {
					await game.delayx();
					if (player.name != "mitama") {
						const target = player.storage.mitama_shuhun;
						player.line(target, "green");
						target.restoreSkill("mitama_chuanshu");
						target.update();
					} else {
						const result = await player.chooseTarget("术魂：选择获得一名角色弃置全部手牌")
							.set("forceDie", true)
							.set("filterTarget", (card, player, target) => {
								return target != player && target.countCards("h") != 0
							})
							.set("ai", function(target) { 
								if (get.attitude(player, target) >= 0)
									return -1
								return target.countCards("h")
							})
							.forResult();
						if (result.bool) {
							const target = result.targets[0];
							player.line(target);
							await target.discard(target.getCards("h"));
						}
					}
				},
				forced: true,
				popup: false,
			},
		}
	},

	// 八云御影
	"mikage_yuying": {
		mod: {
			ignoredHandcard(card, player) {
				if (card.name == "ying") return true
			},
			cardDiscardable(card, player, name) {
				if (name == "phaseDiscard" && card.name == "ying") {
					return false;
				}
			},
		},
		audio: false,
		trigger: {
			player: "loseAfter"
		},
		filter(event, player) {
			return event.cards.filter(card => card.name != "ying" && get.color(card) == "red").length >= 1;
		},
		forced: true,
		charlotte: true,
		async content(event, trigger, player) {
			await player.gain(lib.card.ying.getYing())
		},
		group: "mikage_yuying_shan",
		subSkill: {
			shan: {
				audio: false,
				enable: ['chooseToUse', 'chooseToRespond'],
				filter(event, player) {
					var list = ['shan'];
					return player.countCards("hs", card => card.name == "ying") && list.some(name => event.filterCard({
						name: name
					}, player, event))
				},
				chooseButton: {
					dialog(event, player) {
						var list = ['shan'];
						return ui.create.dialog("御影", [list, "vcard"]);
					},
					filter(button, player) {
						return _status.event.getParent().filterCard({
							name: button.link[2]
						}, player, _status.event.getParent());
					},
					backup(links, player) {
						return {
							audio: false,
							filterCard: {
								name: "ying"
							},
							position: "hs",
							viewAs: {
								name: links[0][2]
							},
							ai1(card) {
								if (player.countCards("hes", {
									name: links[0][2]
								}) > 0) return false
								return true;
							},
						};
					},
					prompt(links, player) {
						return "将一张【影】当做" + get.translation(links[0][2]) + "使用";
					},
				},
				ai: {
					respondShan: true,
					skillTagFilter(player, tag, arg) {
						if (!player.countCards("h", "ying")) return false;
					},
					order: 6,
					result: {
						player: 1
					},
				},
			}
		}
	},
	"mikage_yingbing": {
		init: player => {
			game.addGlobalSkill("mikage_yingbing_order");
		},
		onremove: player => {
			if (!game.hasPlayer(current => current.hasSkill("mikage_yingbing", null, null, false), true)) {
				game.removeGlobalSkill("mikage_yingbing_order");
			}
		},
		trigger: { global: "useCard" },
		direct: true,
		filter(event, player) {
			return event.card.name == "sha" && player.countCards("hs", card => card.name == "ying" || card.name == "shan") > 0 && event.player.isPhaseUsing();
		},
		content() {
			"step 0";
			var go = false;
			if (get.attitude(player, trigger.player) > 0) {
				if (trigger.addCount === false || !trigger.player.isPhaseUsing()) {
					go = false;
				} else if (!trigger.player.hasSkill("paoxiao") && !trigger.player.hasSkill("tanlin3") && !trigger.player.hasSkill("zhaxiang2") && !trigger.player.hasSkill("fengnu") && !trigger.player.getEquip("zhuge") && !trigger.player.hasSkill("asuka_longzhen")) {
					var nh = trigger.player.countCards("h");
					if (player == trigger.player) {
						go = player.countCards("h", "sha") > 0;
					} else if (nh >= 4) {
						go = true;
					} else if (player.countCards("hs", card => card.name == "ying" || card.name == "shan") > 0) {
						if (nh == 3) {
							go = Math.random() < 0.8;
						} else if (nh == 2) {
							go = Math.random() < 0.5;
						}
					} else if (nh >= 3) {
						if (nh == 3) {
							go = Math.random() < 0.5;
						} else if (nh == 2) {
							go = Math.random() < 0.2;
						}
					}
				}
			}
			//AI停顿
			if (
				go &&
				!event.isMine() &&
				!event.isOnline() &&
				player.hasCard(function (card) {
					return player.countCards("hs", card => card.name == "ying" || card.name == "shan") > 0;
				}, "he")
			) {
				game.delayx();
			}
			var next = player.chooseToDiscard(get.prompt("mikage_yingbing"), "弃置一张【影】或【闪】" + "，令" + get.translation(trigger.player) + "本次使用的【杀】不计入使用次数", { name: ["ying", "shan"] });
			next.logSkill = ["mikage_yingbing", trigger.player];
			next.set("ai", function (card) {
				if (_status.event.go) {
					return 6 - get.value(card);
				}
				return 0;
			});
			next.set("go", go);
			"step 1";
			if (result.bool) {
				if (trigger.addCount !== false) {
					trigger.addCount = false;
					trigger.player.getStat().card.sha--;
				}
				if (player != trigger.player) {
					player.draw();
				}
			}
		},
		ai: {
			expose: 0.2,
		},
		subSkill: {
			order: {
				mod: {
					aiOrder: (player, card, num) => {
						if (num && card.name === "sha") {
							let gp = game.findPlayer(current => {
								return current.hasSkill("mikage_yingbing") && current.hasCard(i => true, "he");
							});
							if (gp) {
								return num + 0.15 * Math.sign(get.attitude(player, gp));
							}
						}
					},
				},
				trigger: { player: "dieAfter" },
				filter: (event, player) => {
					return !game.hasPlayer(current => current.hasSkill("mikage_yingbing", null, null, false), true);
				},
				silent: true,
				forceDie: true,
				charlotte: true,
				content: () => {
					game.removeGlobalSkill("mikage_yingbing_order");
				},
			},
		},
	},

	// 柊樱子
	"sakura_yinghu": {
		trigger: {
			global: "roundStart",
		},
		filter(event, player) {
			return game.hasPlayer(current => current != player);
		},
		async cost(event, trigger, player) {
			if (player.storage.sakura_yinghu2 && get.attitude(player, player.storage.sakura_yinghu2[0]) > 0) return false;
			const result = await player
				.chooseTarget("请选择【樱护】的目标", lib.translate.sakura_yinghu_info, false, function (card, player, target) {
					return target != player && (!player.storage.sakura_yinghu2 || !player.storage.sakura_yinghu2.includes(target));
				})
				.set("ai", function (target) {
					let att = get.attitude(_status.event.player, target);
					if (att > 0) {
						return att + 1;
					}
					if (att == 0) {
						return Math.random();
					}
					return att;
				})
				.set("animate", false)
				.forResult();
			event.result = {
				bool: result.bool,
				cost_data: result.bool ? result.targets[0] : null,
			};
		},
		async content(event, trigger, player) {
			let target = event.cost_data;
			if (player.storage.sakura_yinghu2) {
				lib.skill.sakura_yinghu2.onremove(player);
			}

			if (!player.storage.sakura_yinghu2) {
				player.storage.sakura_yinghu2 = [];
			}
			player.storage.sakura_yinghu2.push(target);
			player.addSkill("sakura_yinghu2");
			player.line(target);

			const func = (player, target) => {
				if (!target.storage.sakura_yinghu_mark) {
					target.storage.sakura_yinghu_mark = [];
				}
				target.storage.sakura_yinghu_mark.add(player);
				target.storage.sakura_yinghu_mark.sortBySeat();
				target.markSkill("sakura_yinghu_mark", null, null, true);
			};
			func(player, target);

			if (player.isOnline2()) {
				player.send(func, player, target);
			}
		},
	},
	sakura_yinghu_mark: {
		marktext: "护",
		intro: {
			name: "樱护",
			content: "当你受到伤害后，$受到等量的伤害，当你回复体力后，$回复等量的体力",
		},
	},
	sakura_yinghu2: {
		audio: "sakura_yinghu",
		charlotte: true,
		trigger: { global: ["damageEnd", "recoverEnd"] },
		forced: true,
		sourceSkill: "sakura_yinghu",
		filter(event, player) {
			if (event.player.isDead() || !player.storage.sakura_yinghu2 || !player.storage.sakura_yinghu2.includes(event.player) || event.num <= 0) {
				return false;
			}
			if (event.name == "damage") {
				return true;
			}
			return player.isDamaged();
		},
		logTarget: "player",
		content() {
			"step 0";
			var target = trigger.player;
			if (!target.storage.sakura_yinghu_mark) {
				target.storage.sakura_yinghu_mark = [];
			}
			target.storage.sakura_yinghu_mark.add(player);
			target.storage.sakura_yinghu_mark.sortBySeat();
			target.markSkill("sakura_yinghu_mark");
			game.delayx();
			"step 1";
			player[trigger.name](trigger.num, "nosource");
		},
		onremove(player) {
			if (!player.storage.sakura_yinghu2) {
				return;
			}
			game.countPlayer(function (current) {
				if (player.storage.sakura_yinghu2.includes(current) && current.storage.sakura_yinghu_mark) {
					current.storage.sakura_yinghu_mark.remove(player);
					if (!current.storage.sakura_yinghu_mark.length) {
						current.unmarkSkill("sakura_yinghu_mark");
					} else {
						current.markSkill("sakura_yinghu_mark");
					}
				}
			});
			delete player.storage.sakura_yinghu2;
		},
		group: "sakura_yinghu3",
	},
	sakura_yinghu3: {
		trigger: { global: "dieBegin" },
		silent: true,
		sourceSkill: "sakura_yinghu",
		filter(event, player) {
			return event.player == player || (player.storage.sakura_yinghu2 && player.storage.sakura_yinghu2.includes(player));
		},
		content() {
			delete player.storage.sakura_yinghu2;
		},
	},
	"sakura_yingmeng": {
		trigger: { player: "damageEnd" },
		getIndex: event => event.num,
		filter(event) {
			return event.num > 0;
		},
		async content(event, trigger, player) {
			const result = await player.judge().forResult();
			const color = result?.color;
			let result2;
			switch (color) {
				case "black":
					if (game.hasPlayer(current => current.countDiscardableCards(player, "hej"))) {
						result2 = await player
							.chooseTarget(
								"弃置一名角色区域内的一张牌",
								(card, player, target) => {
									return target.countDiscardableCards(player, "hej");
								},
								true
							)
							.set("ai", target => {
								const player = get.player();
								let att = get.attitude(player, target);
								if (att < 0) {
									att = -Math.sqrt(-att);
								} else {
									att = Math.sqrt(att);
								}
								return att * lib.card.guohe.ai.result.target(player, target);
							})
							.forResult();
					}
					break;

				case "red": {
					const next = player.chooseTarget("令一名角色摸一张牌");
					if (player.storage.sakura_yinghu2?.length) {
						next.set("prompt2", "（若目标为" + get.translation(player.storage.sakura_yinghu2) + "则改为摸两张牌）");
					}
					next.set("ai", target => {
						const player = get.player();
						let att = get.attitude(player, target) / Math.sqrt(1 + target.countCards("h"));
						if (target.hasSkillTag("nogain")) {
							att /= 10;
						}
						if (player.storage.sakura_yinghu2?.includes(target)) {
							return att * 2;
						}
						return att;
					});
					result2 = await next.forResult();
					break;
				}

				default:
					break;
			}
			if (result2?.bool && result2?.targets?.length) {
				const target = result2.targets[0];
				player.line(target, "green");
				if (color == "black") {
					if (target.countDiscardableCards(player, "hej")) {
						await player.discardPlayerCard(target, "hej", true);
					}
				} else {
					if (player.storage.sakura_yinghu2?.includes(target)) {
						target.storage.sakura_yinghu_mark ??= [];
						target.storage.sakura_yinghu_mark.add(player);
						target.storage.sakura_yinghu_mark.sortBySeat();
						target.markSkill("sakura_yinghu_mark");
						await target.draw(2);
					} else {
						await target.draw();
					}
				}
			}
		},
		ai: {
			maixie: true,
			maixie_hp: true,
			effect: {
				target(card, player, target) {
					if (get.tag(card, "damage")) {
						if (player.hasSkillTag("jueqing", false, target)) {
							return [1, -2];
						}
						if (!target.hasFriend()) {
							return;
						}
						if (target.hp >= 4) {
							return [1, get.tag(card, "damage") * 1.5];
						}
						if (target.hp == 3) {
							return [1, get.tag(card, "damage") * 1];
						}
						if (target.hp == 2) {
							return [1, get.tag(card, "damage") * 0.5];
						}
					}
				},
			},
		},
	},

	// 水波玲奈
	"lena_bianzhuang":{
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return game.hasPlayer(function(target) {
				return target.countCards("h") < target.maxHp && player.hasCard(card => lib.filter.cardDiscardable(card, player), "he")
			}) || (player.countCards("h") == player.maxHp && player.hasCard(card => lib.filter.cardDiscardable(card, player), "h"))
		},
		async bianshen(player, ck, skill) {
			if (ck == 1) {
				player.storage.lena_maxHp = player.maxHp
				player.storage.lena_Hp = player.hp
				if (player.name2 && get.character(player.name2)[3].includes(skill)) {
					await player.reinitCharacter(player.name2, "lena2");
				} else {
					await player.reinitCharacter(player.name1, "lena2");
				}
				if (player.maxHp > 1)
					await player.loseMaxHp(player.maxHp - 1)
				if (player.hp < 1)
					await player.recoverTo(1)
			} 
			if (ck == 2) {
				if (player.name2 && get.character(player.name2)[3].includes(skill)) {
					await player.reinitCharacter(player.name2, "lena");
				} else {
					await player.reinitCharacter(player.name1, "lena");
				}
				const m = player.storage.lena_maxHp
				if (player.maxHp != m) {
					if (player.maxHp < m)
						await player.gainMaxHp(m - player.maxHp)
					if (player.maxHp > m)
						await player.loseMaxHp(player.maxHp - m)
				}
				const n = player.storage.lena_Hp
				if (player.hp < n)
					await player.recoverTo(n)
				delete player.storage.lena_maxHp
				delete player.storage.lena_Hp
			}
		},
		async content(event, trigger, player) {
			const f1 = game.hasPlayer(target => target.countCards("h") < target.maxHp && player.hasCard(card => lib.filter.cardDiscardable(card, player), "he"))
			const f2 = player.countCards("h") == player.maxHp && player.hasCard(card => lib.filter.cardDiscardable(card, player), "h")
			const result = await player.chooseCardTarget({
				prompt: "变装：弃置一张牌，令一名角色把手牌补到体力上限。若弃置红牌，你可以变身。",
				filterCard(card, player) {
					if (!ui.selected.targets.length) {
						const f01 = f1
						const f02 = f2 && get.position(card) == "h"
						return f01 || f02
					} else {
						if (player == ui.selected.targets[0] && f2)
							return get.position(card) == "h"
						return true
					}
				},
				filterTarget(card, player, target) {
					const f01 = f1 && target.countCards("h") < target.maxHp
					const f02 = f2 && target == player
					return f01 || f02
				},
				forced: true,
				position: "he",
				selectCard: 1,
				selectTarget: 1,
				ai1(card) {
					if (get.color(card) == "red")
						return skills.duexcept_ai(100 - get.value(card), card, player)
					return skills.duexcept_ai(96 - get.value(card), card, player)
				},
				ai2(target) {
					const att = get.attitude(player, target)
					if (att >= 0) {
						if (player == target && ui.selected.cards[0].color == "red")
							return att + 0.1
						return att + target.countCards("h") - target.maxHp + (player == target ? 1 : 0)
					}
					return att
				}
			}).forResult();

			if (!result.bool) return false

			if (result.cards[0])
				await player.discard(result.cards[0])
			if (result.targets[0]) {
				player.line(result.targets[0]);
				await result.targets[0].draw(result.targets[0].maxHp - result.targets[0].countCards("h"))
			}

			if (get.color(result.cards[0]) == "red" && player.name == "lena") {
				const change = await player.chooseBool("变身：是否变身为变装形态？")
					.set("ai", () => true)
					.forResult();

				if (change.bool) {
					await lib.skill.lena_bianzhuang.bianshen(player, 1, "lena_bianzhuang")
				}
			}
		},
		ai: {
			order: 9,
			result: {
				player(player) {
					if (game.hasPlayer(function(target) {
						return get.attitude(player, target) > 0 && target.countCards("h") < target.maxHp && player.hasCard(card => lib.filter.cardDiscardable(card, player), "he")
					}) || (player.countCards("h") == player.maxHp && player.hasCard(card => lib.filter.cardDiscardable(card, player), "h")))
						return 1
					return -1
				}
			},
		},
	},
	"lena_nizong":{
		audio: 2,
		trigger: { player: "damageEnd" },
		forced: true,
		filter(event, player) {
			return event.cost_data != "lena_nizong2" && player.name == "lena"
		},
		async content(event, trigger, player) {
			await lib.skill.lena_bianzhuang.bianshen(player, 1, "lena_nizong")
		},
	},
	"lena_zhiao":{
		audio: 2,
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return player.countCards("he", card => lib.filter.cardDiscardable(card, player)) >= Math.ceil(player.maxHp / 2)
		},
		async content(event, trigger, player) {
			await player.chooseToDiscard("稚傲：请弃置" + get.cnNumber(Math.ceil(player.maxHp / 2)) + "张牌", Math.ceil(player.maxHp / 2), true, "he")
				.set("ai", card => skills.duexcept_ai(100 - get.value(card), card, player))
				.forResult();
			await player.gainMaxHp();
		},
		ai: {
			pretao: true,
			order(item, player) {
				if (player.countCards("h") <= Math.ceil(player.maxHp / 2))
					return 8;
				return 10;
			},
			result: {
				player(player) {
					return 1
				}
			},
		},
	},
	"lena_bianzhuang2":{
		//Infinity_Aqua:["momoko","kaede"],
		Infinity_Aqua:["momoko","kaede","ren","ao"],
		Lena_Except:["lena","lena2","ulti_madoka","devil_homura","sakura","ai","yamada"],
		onremove(player, skill) {
			player.removeSkill(player.getStorage("lena_bianzhuang2"))
			delete player.storage.lena_bianzhuang2
		},
		unique: true,
		frequent: true,
		async init(player, skill) {
			const players = game.filterPlayer(current => {
				if (current == player) return false
				const name = current.name;
				return character[name] && !lib.skill.lena_bianzhuang2.Lena_Except.includes(name) && !lib.skill.lena_bianzhuang2.Infinity_Aqua.includes(name)
			});

			const playerName = players.map(player => player.name)
			const allname = [...playerName, ...lib.skill.lena_bianzhuang2.Infinity_Aqua].randomSort()

			let total = [];
			for (let i = 0; i < allname.length; i++) {
				const skills = get.character(allname[i], 3).filter(skill => {
						const ckskill = lib.skill[skill]
						return ckskill && !ckskill.charlotte && !ckskill.limited && !ckskill.juexingji && !ckskill.forced && !ckskill.zhuSkill && !ckskill.unique
				})
				if (skills.length > 0) {
					for (let j of skills)
						total.push([allname[i], j])
					if (skills.length > 32)
						break
				}
			}

			total.randomSort()
			const total2 = total.slice(0, 4)
			const characters = total2.map(item => item[0])
			const skills = total2.map(item => item[1])

			const result = await player
				.chooseControl(skills)
				.set("dialog", ["变装：请选择一个技能获得", [characters, "character"]])
				.forResultControl();
			
			await player.addTempSkill(result, {player : "dieAfter"});
			player.markAuto("lena_bianzhuang2", result)

			if (player.storage.lena_maxHp > player.countCards("h")) 
				await player.draw(player.storage.lena_maxHp - player.countCards("h"))

		},
		content() {},
		mark: true,
		marktext: "水",
		intro:{
			content(storage, player) {
				const hp = player.storage.lena_Hp
				const maxHp = player.storage.lena_maxHp
				if (!storage)
					return "【水波玲奈】体力/体力上限为" + hp + "/" + maxHp
				return "【水波玲奈】体力/体力上限为" + hp + "/" + maxHp + "，变装技能为【" + get.translation(storage) + "】：" + get.skillInfoTranslation(storage)
			},
		},
		mod:{
			maxHandcardBase(player, num) {
				if (player.storage.lena_maxHp) {
					return player.storage.lena_maxHp + num;
				}
			},
		}
    },
	"lena_nizong2":{
		enable: "chooseToUse",
		filter(event, player) {
			return event.type == "dying" && player == event.dying;
		},
		check(event, player) {
			return true
		},
		async content(event, trigger, player) {
			if (event.getParent("damage", true))
				event.getParent("damage", true).cost_data = "lena_nizong2"
			await lib.skill.lena_bianzhuang.bianshen(player, 2, "lena_nizong2")
		},
		ai: {
			order: 10,
			save: true,
			skillTagFilter(player, tag, target) {
				if (player != target) {
					return false;
				}
			},
			result: {
				player() {
					return 1;
				},
			},
		},
	},
	"lena_zhiao2":{
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return game.hasPlayer(function(target) {
				return target != player && player.inRange(target)
			}) && player.hasCard(card => lib.filter.cardDiscardable(card, player), "h")
		},
		async content(event, trigger, player) {
			const ck = player.hasHistory('useSkill', evt => evt.skill == "lena_bianzhuang")
			const result = await player.chooseCardTarget({
				prompt: "稚傲：弃置一张手牌，对攻击范围内的一名角色造成1点伤害。若弃置黑牌，你可以变身。",
				filterTarget(card, player, target) {
					return target != player && player.inRange(target)
				},
				forced: true,
				position: "h",
				selectCard: 1,
				selectTarget: 1,
				ai1(card) {
					if (get.color(card) == "black" && !ck)
						return skills.duexcept_ai(100 - get.value(card), card, player)
					return skills.duexcept_ai(96 - get.value(card), card, player);
				},
				ai2(target) {
					return -get.attitude(player, target)
				}
			}).forResult();

			if (!result.bool) return false

			if (result.cards[0])
				await player.discard(result.cards[0]);
			if (result.targets[0]) {
				player.line(result.targets[0]);
				await result.targets[0].damage()
			}

			if (get.color(result.cards[0]) == "black" && player.name == "lena2") {
				const change = await player.chooseBool("变身：是否变身为水波玲奈？")
					.set("ai", () => !ck)
					.forResult();

				if (change.bool) {
					await lib.skill.lena_bianzhuang.bianshen(player, 2, "lena_zhiao2")
				}
			}
		},
		ai: {
			order: 8,
			result: {
				player(player) {
					if (game.hasPlayer(function(target) {
						return target != player && player.inRange(target) && get.attitude(player, target) < 0
					}))
						return 1;
					return -1
				},
			},
		},
	},

	// 桑水清佳
	"seika_huzhu": {
		skillAnimation: true,
		animationColor: "gray",
		unique: true,
		enable: "phaseUse",
		audio: "ext:魔法纪录/audio/skill:2",
		limited: true,
		filterTarget: lib.filter.notMe,
		async content(event, trigger, player) {
			player.awakenSkill("seika_huzhu");
			let target = event.target;
			await game.asyncDraw([target, player], 3);
			if (player.isMinHp() && player.isDamaged()) {
				await player.recover();
			}

			var list = [];
			var skills = target.getOriginalSkills();
			var playerSkills = player.getOriginalSkills();
			skills.addArray(playerSkills);

			for (var i = 0; i < skills.length; i++) {
				if (lib.skill[skills[i]].limited
					&& (target.awakenedSkills.includes(skills[i]) || player.awakenedSkills.includes(skills[i]))
				) {
					list.push(skills[i]);
				}
			}

			if (list.length == 1) {
				player.storage.seika_huzhu_restore = list[0];
				player.addTempSkill("seika_huzhu_restore");
			} else if (list.length > 1) {
				const result = await player.chooseControl(list).set("prompt", "选择一个限定技在回合结束后重置之").forResult();
				if (playerSkills.includes(result.control)) {
					player.storage.seika_huzhu_restore = result.control;
					player.addTempSkill("seika_huzhu_restore");
				} else {
					target.storage.seika_huzhu_restore = result.control;
					target.addTempSkill("seika_huzhu_restore");
				}
			}
		},
		subSkill: {
			restore: {
				trigger: { global: "phaseEnd" },
				forced: true,
				popup: false,
				charlotte: true,
				onremove: true,
				content() {
					player.restoreSkill(player.storage.seika_huzhu_restore);
				},
			},
		},
		ai: {
			order: 4,
			result: {
				target(player, target) {
					var skills = target.getOriginalSkills();
					for (var i = 0; i < skills.length; i++) {
						if (lib.skill[skills[i]].limited && target.awakenedSkills.includes(skills[i])) {
							return 8;
						}
					}
					return 4;
				},
			},
		},
	},

	// 大庭树里
	"juri_longhuo": {
		enable: "phaseUse",
		zhuanhuanji: true,
		locked: false,
		mark: true,
		marktext: "☯",
		selectCard: 2,
		usable: 1,
		position: "hes",
		group: ["juri_longhuo_draw"],
		intro: {
			markcount: () => 0,
			content(storage) {
				return "转换技。你可以将两张" + (!storage ? "黑色牌当【南蛮入侵】" : "红色牌当【火烧联营】") + "使用。";
			},
		},
		viewAs(cards, player) {
			var name = player.storage.juri_longhuo ? "huoshaolianying" : "nanman";
			return { name: name };
		},
		check(card) {
			var player = _status.event.player;
			var name = player.storage.juri_longhuo ? "huoshaolianying" : "nanman";
			var targets = game.filterPlayer(function (current) {
				return player.canUse(name, current);
			});

			var num = 0;
			for (let i = 0; i < targets.length; i++) {
				let eff = get.sgn(get.effect(targets[i], { name: name }, player, player));
				if (targets[i].hp == 1) {
					eff *= 1.5;
				}
				num += eff;
			}
			if (!player.needsToDiscard(-1)) {
				if (targets.length >= 7) {
					if (num < 2) {
						return 0;
					}
				} else if (targets.length >= 5) {
					if (num < 1.5) {
						return 0;
					}
				}
			}
			return 6 - get.value(card);
		},
		filterCard(card, player) {
			if (ui.selected.cards.length) {
				return get.color(card) == get.color(ui.selected.cards[0]);
			}

			let storageColor = player.storage.juri_longhuo ? "red" : "black";
			const cards = player.getCards("hes").filter(card => get.color(card) == storageColor);
			for (let i = 0; i < cards.length; i++) {
				if (card != cards[i]) {
					if (get.color(card) == get.color(cards[i])) {
						return true;
					}
				}
			}
			return false;
		},
		prompt() {
			var storage = _status.event.player.storage.juri_longhuo;
			if (!storage) {
				return "将两张黑色牌当【南蛮入侵】使用";
			}
			return "将两张红色牌当【火烧连营】使用";
		},
		async precontent(event, trigger, player) {
			var skill = "juri_longhuo";
			player.logSkill(skill);
			player.changeZhuanhuanji(skill);
		},
		subSkill: {
			draw: {
				trigger: { source: "damageEnd" },
				usable: 3,
				forced: true,
				content() {
					player.draw();
				},
			},
		},
		ai: {
			threaten: 1.6,
			order: 9,
		},
	},
	"juri_fenyan": {
		trigger: { player: "useCardToPlayered" },
		forced: true,
		group: ["juri_fenyan_nanman", "juri_fenyan_fire"],
		filter(event, player) {
			return get.type(event.card, "trick") && get.tag(event.card, "damage") && event.targets.length > 1 && event.isFirstTarget;
		},
		preHidden: true,
		async content(event, trigger, player) {
			const result = await player.chooseTarget("请选择“焚炎”额外发动的目标")
				.set("ai", target => {
					return -get.attitude(player, target);
				}).forResult();

			if (result.bool) {
				const target = result.targets[0];
				player.line(target, "green");
				const evt = trigger.getParent();
				evt.targets.push(target);
			}
		},
		subSkill: {
			nanman: {
				trigger: { target: "useCardToBefore" },
				forced: true,
				priority: 15,
				filter(event, player) {
					return event.card.name == "nanman";
				},
				content() {
					trigger.cancel();
				},
			},
			fire: {
				trigger: { source: "damageBegin" },
				forced: true,
				filter(event) {
					return event.hasNature("fire");
				},
				content() {
					trigger.num++;
				},
				ai: {
					effect: {
						player(card, player, target) {
							if (card.name == "sha") {
								if (game.hasNature(card, "fire")) {
									return 2;
								}
								if (player.hasSkill("zhuque_skill")) {
									return 1.9;
								}
							}
							if (get.tag(card, "fireDamage")) {
								return 2;
							}
						},
					},
				},
			}
		},
	},

	// 天乃铃音
	"suzune_chuancheng": {
		audio: "tuogu",
		trigger: { global: "die" },
		filter(event, player) {
			return (
				event.player.getStockSkills().filter(function (skill) {
					var info = get.info(skill);
					return info && !info.juexingji && !info.hiddenSkill && !info.zhuSkill && !info.charlotte && !info.limited && !info.dutySkill;
				}).length > 0
			);
		},
		logTarget: "player",
		check(event, player) {
			var list = event.player.getStockSkills().filter(function (skill) {
				var info = get.info(skill);
				return info && !info.juexingji && !info.hiddenSkill && !info.zhuSkill && !info.charlotte && !info.limited && !info.dutySkill;
			});
			var negSkill = list.some(function (skill) {
				return get.skillRank(skill, "inout") <= 0;
			});
			if (!player.storage.suzune_chuancheng) {
				if (negSkill) {
					return false;
				}
				return true;
			}
			list.sort(function (a, b) {
				return get.skillRank(b, "inout") - get.skillRank(a, "inout");
			})[0];
			return get.skillRank(list[0], "inout") >= get.skillRank(player.storage.suzune_chuancheng, "inout");
		},
		content() {
			"step 0";
			var list = trigger.player.getStockSkills().filter(function (skill) {
				var info = get.info(skill);
				return info && !info.juexingji && !info.hiddenSkill && !info.zhuSkill && !info.charlotte && !info.limited && !info.dutySkill;
			});
			if (list.length == 1) {
				event._result = { control: list[0] };
			} else {
				player.chooseControl(list)
					.set("prompt", "获得一个技能")
					.set("forceDie", true)
					.set("ai", function () {
						var listx = list
							.map(function (skill) {
								return [skill, get.skillRank(skill, "inout")];
							})
							.sort(function (a, b) {
								return b[1] - a[1];
							})
							.slice(0, 2);
						var listx2 = [0];
						if (Math.abs(listx[0][1] - listx[1][1]) <= 0.5 && Math.sign(listx[0][1]) == Math.sign(listx[1][1])) {
							listx2.push(1);
						}
						return listx[listx2.randomGet()][0];
					});
			}
			"step 1";
			if (player.storage.suzune_chuancheng) {
				player.removeSkill(player.storage.suzune_chuancheng);
			}
			player.storage.suzune_chuancheng = result.control;
			player.markSkill("suzune_chuancheng");
			player.addSkills(result.control);
			game.broadcastAll(function (skill) {
				var list = [skill];
				game.expandSkills(list);
				for (var i of list) {
					var info = lib.skill[i];
					if (!info) {
						continue;
					}
					if (!info.audioname2) {
						info.audioname2 = {};
					}
					info.audioname2.caoshuang = "tuogu";
				}
			}, result.control);
		},
		mark: true,
		intro: { content: "当前传承的技能：$" },
		group: ["suzune_chuancheng2"],
	},
	"suzune_chuancheng2": {
		trigger: { global: "die" },
		forced: true,
		async content(event, trigger, player) {
			player.gainMaxHp();
			player.recover();
		}
	},
	"suzune_zhuanlu": {
		trigger: { source: "damageSource" },
		audio: 2,
		direct: true,
		filter(event, player) {
			return player != event.player && !event.player.isDisabledJudge() && event.player.countCards("he") && !event.player.countCards("j", card => get.type(card.viewAs || card.name) == "delay");
		},
		content() {
			"step 0";
			player.choosePlayerCard(trigger.player, "he", get.prompt("suzune_zhuanlu", trigger.player)).set("ai", function (card) {
				if (get.attitude(_status.event.player, _status.event.target) >= 0) {
					return 0;
				}
				return get.buttonValue(card);
			});
			"step 1";
			if (result.bool) {
				player.logSkill("suzune_zhuanlu", trigger.player);
				var card = result.cards[0];
				trigger.player.$throw(card);
				game.delayx();
				if (get.type(card, null, false) == "delay") {
					trigger.player.addJudge(card);
				} else {
					trigger.player.addJudge({ name: get.color(card, false) == "red" ? "lebu" : "bingliang" }, result.cards);
				}
			}
		},
		group: "suzune_zhuanlu_draw",
		subfrequent: ["draw"],
		subSkill: {
			draw: {
				audio: "suzune_zhuanlu",
				trigger: { player: "phaseEnd" },
				prompt(links, player) {
					return "是否发动【专戮】将牌补齐至体力上限并弃" + player.getHistory("useSkill", evt => evt.skill == "suzune_zhuanlu").length + "张牌？";
				},
				check(event, player) {
					return player.maxHp - player.countCards("h") >= player.getHistory("useSkill", evt => evt.skill == "suzune_zhuanlu").length;
				},
				async content(event, trigger, player) {
					await player.drawTo(player.maxHp);
					await player.chooseToDiscard(player.getHistory("useSkill", evt => evt.skill == "suzune_zhuanlu").length, true);
				},
			},
		},
	},

	// 笠音青
	"ao_qulong": {
		enable: "phaseUse",
		usable: 1,
		filterTarget(card, player, target) {
			return target.countCards("h");
		},
		selectTarget: 2,
		complexTarget: true,
		multitarget: true,
		async content(event, trigger, player) {
			const { targets: [target1, target2], } = event;
			const result = await target1.chooseToCompare(target2).forResult();

			let bool1 = target1 == result.winner, bool2 = target2 == result.winner;
			let card1 = result.player, card2 = result.target;
			let num = Math.abs(card1.number - card2.number);
			if (num <= 5) {
				bool1 = true;
				bool2 = true;
			}

			if (bool1) {
				player.line(target1, "green");
				await target1.damage(player, "fire");
			}
			if (bool2) {
				player.line(target2, "green");
				await target2.damage(player, "fire");
			}
		},
		ai: {
			order: 6,
			result: {
				target: -1,
			},
			combo: "ao_fuhu",
		},
	},
	"ao_fuhu": {
		trigger: { player: "phaseEnd" },
		group: ["ao_fuhu_cancel"],
		filter(event, player) {
			return player.getHistory("sourceDamage").reduce((sum, evt) => sum + evt.num, 0) > 1;
		},
		forced: true,
		mark: true,
		marktext: "附",
		intro: {
			name: "附",
			content: "当前附标记数：#",
		},
		content() {
			player.addMark("ao_fuhu", 1);
		},
		subSkill: {
			"cancel": {
				trigger: { global: "useCardToPlayered" },
				filter(event, player) {
					if (event.getParent().triggeredTargets3.length > 1) {
						return false;
					}
					if (get.type(event.card) != "trick") {
						return false;
					}
					if (get.info(event.card).multitarget) {
						return false;
					}
					if (event.targets.length < 2) {
						return false;
					}
					if (player.countMark("ao_fuhu") == 0) {
						return false;
					}
					return true;
				},
				direct: true,
				content() {
					"step 0";
					player.chooseTarget(get.prompt("ao_fuhu"), [1, trigger.targets.length], function (card, player, target) {
						return _status.event.targets.includes(target);
					})
						.set("ai", function (target) {
							var trigger = _status.event.getTrigger();
							return -get.effect(target, trigger.card, trigger.player, _status.event.player);
						})
						.set("targets", trigger.targets);
					"step 1";
					if (result.bool) {
						player.logSkill("ao_fuhu", result.targets);
						trigger.getParent().excluded.addArray(result.targets);
						player.removeMark("ao_fuhu", 1);
						game.delay();
					}
				},
			},
		}
	},

	// 山田正一郎
	"yamada_feixiang": {
		trigger: { player: "phaseUseBegin" },
		forced: true,
		derivation: ["yamada_cuimian"],
		async content(event, trigger, player) {
			const result = await player.judge(card => {
				if (get.color(card) == "black") {
					return 0;
				}
				return 2;
			}).forResult();
			const color = get.color(result.card);

			switch (color) {
				case "black":
					player.draw(player.maxHp);
					break;
				case "red":
					const resultTarget = await player.chooseTarget("请选择【催眠】的目标", true, [1, player.maxHp], function (card, player, target) {
						return target != player && !target.hasSkill("yamada_cuimian");
					})
						.set("ai", function (target) {
							var player = _status.event.player;
							var att = -get.attitude(player, target),
								attx = att * 2;
							if (att <= 0 || target.hasSkill("xinfu_pdgyingshi")) {
								return 0;
							}
							if (target.hasJudge("lebu")) {
								attx -= att;
							}
							if (target.hasJudge("bingliang")) {
								attx -= att;
							}
							return attx / Math.max(2.25, Math.sqrt(target.countCards("h") + 1));
						}).forResult();
					const targets = resultTarget.targets;
					player.line(targets, "green");
					game.log(targets, "获得了", "#y“催眠”", "效果");
					for (var i of targets) {
						i.addSkill("yamada_cuimian");
					}
					break;
			}
		}
	},
	"yamada_cuimian": {
		trigger: { player: "phaseZhunbeiBegin" },
		audio: false,
		forced: true,
		charlotte: true,
		async content(event, trigger, player) {
			player.removeSkill("yamada_cuimian");
			const result = await player.judge().forResult();
			const color = get.color(result.card);
			switch (color) {
				case "red":
					player.skip("phaseDraw");
					break;
				case "black":
					player.skip("phaseUse");
					player.skip("phaseDiscard");
					break;
				default:
					break;
			}
		},
		mark: true,
		intro: {
			content: "准备阶段时进行判定，结果为红则跳过摸牌阶段，为黑则跳过出牌阶段和弃牌阶段",
		},
		ai: {
			order: 7,
			result: {
				player: 1,
			},
		},
	},
	"yamada_mofa": {
		trigger: { player: "damageBegin4" },
		filter(event, player) {
			if (event.nature) {
				return true;
			}
		},
		forced: true,
		content() {
			trigger.cancel();
		},
		ai: {
			nofire: true,
			nothunder: true,
			effect: {
				target: function (card, player, target, current) {
					if (get.tag(card, "natureDamage")) {
						return "zeroplayertarget";
					}
					if (card.name == "tiesuo") {
						return 0.01;
					}
				},
			},
		},
	},

	// 里见灯花
	"toka_jiquan": {
		trigger: { player: "judgeEnd" },
		group: ["toka_jiquan_judge"],
		direct: true,
		filter(event, player) {
			return ["spade", "club"].includes(event.result.suit) && !player.hasSkill("toka_jiquan_blocker");
		},
		async content(event, trigger, player) {
			player.addTempSkill("toka_jiquan_blocker", ["phaseZhunbeiBefore", "phaseJudgeBefore", "phaseDrawBefore", "phaseUseBefore", "phaseDiscardBefore", "phaseJieshuBefore", "phaseBefore"]);
			event.num = 1 + ["club", "spade"].indexOf(trigger.result.suit);
			event.logged = false;
			if (event.num == 1 && player.isDamaged()) {
				event.logged = true;
				player.logSkill("toka_jiquan");
				player.recover();
			}
			const result = await player.chooseTarget("极权：是否对一名角色造成" + event.num + "点雷电伤害？")
				.set("ai", target => {
					const player = _status.event.player;
					let eff = get.damageEffect(target, player, target, "thunder");
					if (
						get.event("num") > 1 &&
						!target.hasSkillTag("filterDamage", null, {
							player: player,
							card: null,
							nature: "thunder",
						})
					) {
						if (eff > 0) {
							eff -= 25;
						} else if (eff < 0) {
							eff *= 2;
						}
					}
					return eff * get.attitude(player, target);
				})
				.set("num", event.num).forResult();
			if (result.bool && result.targets && result.targets.length) {
				if (!event.logged) {
					player.logSkill("toka_jiquan", result.targets);
				} else {
					player.line(result.targets, "thunder");
				}
				result.targets[0].damage(event.num, "thunder");
			}
		},
		subSkill: {
			blocker: { charlotte: true },
			judge: {
				trigger: { player: ["useCardAfter", "respondAfter"] },
				filter(event, player) {
					return get.type(event.card) == "basic" && !player.hasSkill("toka_jiquan_blocker");
				},
				judgeCheck(card, bool) {
					var suit = get.suit(card);
					if (suit == "spade") {
						if (bool && get.number(card) > 1 && get.number(card) < 10) {
							return 5;
						}
						return 4;
					}
					if (suit == "club") {
						return 2;
					}
					return 0;
				},
				content() {
					player.judge(lib.skill.toka_jiquan.judgeCheck).judge2 = function (result) {
						return result.bool ? true : false;
					};
				},
				ai: {
					useShan: true,
					effect: {
						target_use(card, player, target, current) {
							let name;
							if (typeof card == "object") {
								if (card.viewAs) {
									name = card.viewAs;
								} else {
									name = get.name(card);
								}
							}
							if (
								get.tag(card, "respondShan") &&
								!player.hasSkillTag(
									"directHit_ai",
									true,
									{
										target: target,
										card: card,
									},
									true
								)
							) {
								let club = 0,
									spade = 0;
								if (
									game.hasPlayer(function (current) {
										return get.attitude(target, current) < 0 && get.damageEffect(current, target, target, "thunder") > 0;
									})
								) {
									club = 2;
									spade = 4;
								}
								if (!target.isHealthy()) {
									club += 2;
								}
								if (!club && !spade) {
									return 1;
								}
								if (name === "sha") {
									if (!target.mayHaveShan(player, "use")) {
										return;
									}
								} else if (!target.mayHaveShan(player)) {
									return 1 - 0.1 * Math.min(5, target.countCards("hs"));
								}
								if (!target.hasSkillTag("rejudge")) {
									return [1, (club + spade) / 4];
								}
								let pos = player == target || player.hasSkillTag("viewHandcard", null, target, true) ? "hes" : "e",
									better = club > spade ? "club" : "spade",
									max = 0;
								target.hasCard(function (cardx) {
									if (get.suit(cardx) == better) {
										max = 2;
										return true;
									}
									if (spade && get.color(cardx) == "black") {
										max = 1;
									}
								}, pos);
								if (max == 2) {
									return [1, Math.max(club, spade)];
								}
								if (max == 1) {
									return [1, Math.min(club, spade)];
								}
								if (pos == "e") {
									return [1, Math.min((Math.max(1, target.countCards("hs")) * (club + spade)) / 4, Math.max(club, spade))];
								}
								return [1, (club + spade) / 4];
							}
						},
						target(card, player, target) {
							if (name == "lebu" || name == "bingliang") {
								return [target.hasSkillTag("rejudge") ? 0.4 : 1, 2, target.hasSkillTag("rejudge") ? 0.4 : 1, 0];
							}
						},
					},
				},
			},
		},
	},
	"toka_zhisuan": {
		mod: {
			aiOrder(player, card, num) {
				if (num > 0 && get.itemtype(card) == "card" && get.color(card) == "black" && get.type(card) == "equip") {
					num * 1.35;
				}
			},
			aiValue(player, card, num) {
				if (num > 0 && get.itemtype(card) == "card" && get.color(card) == "black") {
					return num * 1.15;
				}
			},
			aiUseful(player, card, num) {
				if (num > 0 && get.itemtype(card) == "card" && get.color(card) == "black") {
					return num * 1.35;
				}
			},
		},
		locked: false,
		trigger: { global: "judge" },
		filter(event, player) {
			return player.countCards("hes", { color: "black" }) > 0;
		},
		direct: true,
		content() {
			"step 0";
			player
				.chooseCard(get.translation(trigger.player) + "的" + (trigger.judgestr || "") + "判定为" + get.translation(trigger.player.judging[0]) + "，" + get.prompt("toka_zhisuan"), "hes", function (card) {
					if (get.color(card) != "black") {
						return false;
					}
					var player = _status.event.player;
					var mod2 = game.checkMod(card, player, "unchanged", "cardEnabled2", player);
					if (mod2 != "unchanged") {
						return mod2;
					}
					var mod = game.checkMod(card, player, "unchanged", "cardRespondable", player);
					if (mod != "unchanged") {
						return mod;
					}
					return true;
				})
				.set("ai", function (card) {
					var trigger = _status.event.getTrigger();
					var player = _status.event.player;
					var judging = _status.event.judging;
					var result = trigger.judge(card) - trigger.judge(judging);
					var attitude = get.attitude(player, trigger.player);
					if (attitude == 0 || result == 0) {
						if (trigger.player != player) {
							return 0;
						}
						if (
							game.hasPlayer(function (current) {
								return get.attitude(player, current) < 0;
							})
						) {
							var checkx = lib.skill.toka_jiquan_judge.judgeCheck(card, true) - lib.skill.toka_jiquan_judge.judgeCheck(judging);
							if (checkx > 0) {
								return checkx;
							}
						}
						return 0;
					}
					let val = get.value(card);
					if (get.subtype(card) == "equip2") {
						val /= 2;
					} else {
						val /= 7;
					}
					if (attitude == 0 || result == 0) {
						return 0;
					}
					if (attitude > 0) {
						return result - val;
					}
					return -result - val;
				})
				.set("judging", trigger.player.judging[0]);
			"step 1";
			if (result.bool) {
				player.respond(result.cards, "highlight", "toka_zhisuan", "noOrdering");
			} else {
				event.finish();
			}
			"step 2";
			if (result.bool) {
				player.$gain2(trigger.player.judging[0]);
				player.gain(trigger.player.judging[0]);
				var card = result.cards[0];
				if (get.suit(card) == "spade" && get.number(card) > 1 && get.number(card) < 10) {
					player.draw("nodelay");
				}
				trigger.player.judging[0] = result.cards[0];
				trigger.orderingCards.addArray(result.cards);
				game.log(trigger.player, "的判定牌改为", result.cards[0]);
			}
			"step 3";
			game.delay(2);
		},
		ai: {
			rejudge: true,
			tag: {
				rejudge: 1,
			},
		},
	},
	"blue_haijing":{
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		forced: true,
		filter(event, player) {
			return event.name != "phase" || game.phaseNumber == 0
		},
		async content(event, trigger, player) {
			let cards = [];
			for (let i = 0; i < 8; i++)
				cards.push(game.createCard2("icesha", "spade", 8, "ice"))

			const next = player.addToExpansion(cards, "gain2");
			next.gaintag.add("blue_haijing");
			await next;

			let cards2 = [];
			for (let i = 0; i < 8; i++)
				cards2.push(game.createCard2("icesha", "spade", 8, "ice"))

			game.broadcastAll(function () {
				lib.inpile.add("icesha");
			});

			game.cardsGotoPile(cards2, () => {
				return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
			});
		},
		marktext: "海",
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
		group: ["blue_haijing_lose"],
		subSkill: {
			lose: {
				trigger: { 
					player: "loseAfter",
					global: ["cardsDiscardAfter", "loseAsyncAfter", "equipAfter"],
				},
				forced: true,
				filter(event, player) {
					const filter = card => !(card.name == "sha" && card.nature == "ice")
					if (event.name != "cardsDiscard") {
						return event.getd(player, "cards2").filter(filter).length > 0;
					} else {
						if (event.cards.filterInD("d").filter(filter).length <= 0) {
							return false;
						}
						const evt = event.getParent();
						if (evt.name != "orderingDiscard") {
							return false;
						}
						const evtx = evt.relatedEvent || evt.getParent();
						if (evtx.player != player) {
							return false;
						}
						return player.hasHistory("lose", evtxx => {
							return evtx == (evtxx.relatedEvent || evtxx.getParent());
						});
					}
				},
				async content(event, trigger, player) {
					let cards;
					if (trigger.name != "cardsDiscard") {
						cards = trigger.getd(player, "cards2");
					} else {
						cards = trigger.cards.filterInD("d");
					}
					cards = cards.filter(card => !(card.name == "sha" && card.nature == "ice"))
					if (cards.length) {
						game.cardsGotoSpecial(cards);
						game.log(cards, "被移出了游戏");

						let cards2 = [];
						for (let i = 0; i < cards.length; i++)
							cards2.push(game.createCard2("icesha", "spade", 8, "ice"))

						game.cardsGotoPile(cards2, () => {
							return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
						});
					}
				}
			},
		}
	},
	"blue_bingjie":{
		trigger: {
			global: "damageBegin2",
		},
		filter(event, player, name) {
			return event.card?.name == "sha" && event.card.nature == "ice" && event.player != player && player.getExpansions("blue_haijing")?.length && !player.hasSkill("blue_bingjie_public")
		},
		init(player) {
			player.storage.blue_bingyuan_x = 0
		},
		async cost(event, trigger, player) {
			const target = trigger.player
			const str = get.translation(target)
			event.result = await player.chooseBool("冰结：是否移除一个【海晶】标记，弃置" + str + "最多两张牌或对" + str + "造成一点冰属性伤害？"
				).set("ai", () => {
					const f1 = get.attitude(player, target) < 0
					const f10 = get.attitude(player, target) == 0
					const f2 = get.damageEffect(target, player, player, "ice") > 0
					const f3 = target.getCards("he").length > 0
					return (f1 && (f2 || f3)) || (f10 && f3)
				}).forResult();
		},
		async content(event, trigger, player) {
			player.storage.blue_bingyuan_x++
			player.addTempSkill("blue_bingjie_public")

			const card = player.getExpansions("blue_haijing")[0]
			await player.discard(card)
			if (player.getExpansions("blue_haijing").length == 0)
				player.useSkill("blue_bingyuan")

			const target = trigger.player
			const str = get.translation(trigger.player)
			const f1 = target.getCards("he").length > 0
			//const f2 = true

			let str1 = "弃置" + str + "最多两张牌", str2 = "对" + str + "造成一点冰属性伤害"
			let choice = ["选项一", "选项二"]
			if (!f1) {
				choice.remove("选项一")
				str1 = "无法选择"
			}

			let aichoice
			if (get.damageEffect(target, player, player, "ice") > 0)
				aichoice = "选项二"
			else
				aichoice = "选项一"

			const result = await player.chooseControl(choice)
				.set("prompt", "冰结：请选择一个选项")
				.set("choiceList", [
					str1, str2
				])
				.set("choice", aichoice)
				.set("ai", function () {
					return _status.event.choice;
				})
				.forResultControl();

			player.line(target)
			if (result == "选项一") 
				await player.discardPlayerCard(target, true, "he", [1, 2])
			if (result == "选项二") 
				await target.damage("ice")
		},
		group: ["blue_bingjie_2","blue_bingjie_3","blue_bingjie_gain"],
		subSkill: {
			public: {
				charlotte: true,
				onremove: true,
				nopop: true,
			},
			2:{
				trigger: { global: "useCard1" },
				filter(event, player) {
					return event.card.name == "sha" && !game.hasNature(event.card) && player.getExpansions("blue_haijing")?.length && !player.hasSkill("blue_bingjie_public")
				},
				init(player) {
					player.storage.blue_bingyuan_y = 0
				},
				async cost(event, trigger, player) {
					const target = trigger.player
					const str = get.translation(target)
					event.result = await player.chooseBool("冰结：是否移除一个【海晶】标记，使" + str + "的普通【杀】视为冰属性【杀】？"
						).set("ai", () => {
							const rplayer = trigger.target
							if (!rplayer?.length)
								return true
							let damageff = 0
							const card = {name: "sha", isCard: true}
							const card2 = {name: "sha", nature: "ice", isCard: true}
							for (let i = 0; i < rplayer.length; i++) {
								const eff = get.effect(rplayer, card, target, player)
								const eff2 = get.effect(rplayer, card2, target, player)
								damageff += (eff - eff2)
							}
							return damageff > 0
						}).forResult();
				},
				async content(event, trigger, player) {
					player.storage.blue_bingyuan_y++
					player.addTempSkill("blue_bingjie_public")

					const card = player.getExpansions("blue_haijing")[0]
					await player.discard(card)
					if (player.getExpansions("blue_haijing").length == 0)
						player.useSkill("blue_bingyuan")

					game.setNature(trigger.card, "ice");
					if (get.itemtype(trigger.card) == "card") {
						var next = game.createEvent("blue_bingjie_2_clear");
						next.card = trigger.card;
						event.next.remove(next);
						trigger.after.push(next);
						next.setContent(function () {
							game.setNature(card, []);
						});
					}
				}
			},
			3:{
				trigger: { player: "damageBegin4" },
				filter(event, player) {
					return player.getExpansions("blue_haijing")?.length >= 2 && !player.hasSkill("blue_bingjie_public")
				},
				init(player) {
					player.storage.blue_bingyuan_z = 0
				},
				async cost(event, trigger, player) {
					event.result = await player.chooseBool("冰结：是否移除两个【海晶】标记，使你防止伤害？"
						).set("ai", () => {
							return true
						}).forResult();
				},
				async content(event, trigger, player) {
					player.storage.blue_bingyuan_z++
					player.addTempSkill("blue_bingjie_public")

					const card = player.getExpansions("blue_haijing").slice(0, 2)
					await player.discard(card)
					if (player.getExpansions("blue_haijing").length == 0)
						player.useSkill("blue_bingyuan")

					trigger.cancel()
				}
			},
			gain: {
				trigger: {
					player: "phaseUseBegin",
				},
				frequent: true,
				filter(event, player) {
					return get.cardPile(function (card) {
						return get.name(card) == "sha" && card.nature == "ice";
					});
				},
				async content(event, trigger, player) {
					const card = get.cardPile(function (card) {
						return get.name(card) == "sha" && card.nature == "ice"
					});
					if (card)
						await player.gain(card, "gain2");
				}
			}
		},
	},
	"blue_bingyuan":{
		skillAnimation: true,
		juexingji: true,
		derivation: ["blue_bingjing","blue_donghai"],
		async content(event, trigger, player) {
			player.awakenSkill("blue_bingyuan")
			player.removeSkill("blue_bingjie")
			player.addSkill("blue_bingjing")
			player.addSkill("blue_donghai")
		}
	},
	"blue_bingjing":{
		trigger: { player: "damageBegin4" },
		filter(event) {
			return event.hasNature("ice");
		},
		persevereSkill: true,
		frequent: true,
		content() {
			trigger.cancel();
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (get.nature(card) == "ice" && get.tag(card, "damage")) {
						return "zeroplayertarget";
					}
				},
			},
		},
		group: ["blue_bingjing_1"],
		subSkill: {
			1:{
				enable: ["chooseToUse", "chooseToRespond"],
				persevereSkill: true,
				filter(event, player) {
					if (!player.countCards("he", card => card.nature == "ice" && card.name == "sha") || player.hasSkill("blue_bingjing_used")) {
						return false;
					}
					for (let i of lib.inpile) {
						let type = get.type(i);
						if ((type == "basic" || type == "trick") && event.filterCard(get.autoViewAs({ name: i }, "unsure"), player, event)) {
							return true;
						}
					}
					return false;
				},
				chooseButton: {
					dialog(event, player) {
						let list = [];
						for (let i = 0; i < lib.inpile.length; i++) {
							let name = lib.inpile[i];
							if (name == "sha") {
								if (event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) {
									list.push(["基本", "", "sha"]);
								}
								for (let nature of lib.inpile_nature) {
									if (event.filterCard(get.autoViewAs({ name, nature }, "unsure"), player, event)) {
										list.push(["基本", "", "sha", nature]);
									}
								}
							} else if (get.type(name) == "trick" && event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) {
								list.push(["锦囊", "", name]);
							} else if (get.type(name) == "basic" && event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) {
								list.push(["基本", "", name]);
							}
						}
						return ui.create.dialog("冰晶", [list, "vcard"]);
					},
					check(button) {
						if (_status.event.getParent().type != "phase") {
							return 1;
						}
						let player = _status.event.player;
						if (["wugu", "zhulu_card", "yiyi", "lulitongxin", "lianjunshengyan", "diaohulishan"].includes(button.link[2])) {
							return 0;
						}
						return player.getUseValue({
							name: button.link[2],
							nature: button.link[3],
						});
					},
					backup(links, player) {
						return {
							filterCard: card => card.nature == "ice" && card.name == "sha",
							popname: true,
							check(card) {
								return 8 - get.value(card);
							},
							position: "he",
							viewAs: { name: links[0][2], nature: links[0][3] },
							precontent() {
								player.addTempSkill("blue_bingjing_used");
							},
						};
					},
					prompt(links, player) {
						return "将一张冰【杀】当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用";
					},
				},
				hiddenCard(player, name) {
					if (!lib.inpile.includes(name)) {
						return false;
					}
					var type = get.type(name);
					return (type == "basic" || type == "trick") && player.countCards("he", card => card.nature == "ice" && card.name == "sha") && !player.hasSkill("blue_bingjing_used");
				},
				ai: {
					fireAttack: true,
					respondSha: true,
					respondShan: true,
					skillTagFilter(player) {
						if (!player.countCards("he", card => card.nature == "ice" && card.name == "sha") || player.hasSkill("blue_bingjing_used")) {
							return false;
						}
					},
					order: 1,
					result: {
						player(player) {
							if (_status.event.dying) {
								return get.attitude(player, _status.event.dying);
							}
							return 1;
						},
					},
				},
				mod: {
					aiValue(player, card, num) {
						if (card.name == "sha" && card.nature == "ice") {
							return Math.max(num, 8)
						}
					},
				},
			},
			used: {
				charlotte: true,
				nopop: true,
			},
		}
	},
	"blue_donghai":{
		mark: true,
		marktext: "海",
		intro :{
			content: function (storage, player) {
				let strx = "", stry = "", strz = ""
				if (player.storage.blue_bingyuan_x > 0)
					strx = "①所有冰【杀】造成的伤害+" + player.storage.blue_bingyuan_x + ""
				if (player.storage.blue_bingyuan_y > 0)
					stry = "②你的回合开始时，获得" + player.storage.blue_bingyuan_y + "张冰【杀】"
				if (player.storage.blue_bingyuan_z > 0)
					strz = "③你的回合结束时，摸" + player.storage.blue_bingyuan_z + "张牌"
				return strx + stry + strz
			}
		},
		trigger: {
			global: "damageBegin1",
		},
		filter(event, player) {
			return player.storage.blue_bingyuan_x > 0 && event.card?.name == "sha" && event.card.nature == "ice" && event.getParent("sha", true)?.targets?.includes(event.player)
		},
		init(player) {
			if (!player.storage.blue_bingyuan_x)
				player.storage.blue_bingyuan_x = 0
		},
		forced: true,
		async content(event, trigger, player) {
			trigger.num += player.storage.blue_bingyuan_x
		},
		group: ["blue_donghai_gain","blue_donghai_draw","blue_donghai_die"],
		subSkill: {
			gain: {
				trigger: {
					player: "phaseBegin",
				},
				forced: true,
				init(player) {
					if (!player.storage.blue_bingyuan_y)
						player.storage.blue_bingyuan_y = 0
				},
				filter(event, player) {
					return player.storage.blue_bingyuan_y > 0 && get.cardPile(function (card) {
						return get.name(card) == "sha" && card.nature == "ice";
					});
				},
				async content(event, trigger, player) {
					let cards = []
					for (let i = 0; i < player.storage.blue_bingyuan_y; i++) {
						const card = get.cardPile(function (card) {
							return get.name(card) == "sha" && card.nature == "ice" && !cards.includes(card)
						})
						if (!card)
							break
						cards.push(card)
					}
					await player.gain(cards, "gain2")
				}
			},
			draw: {
				trigger: {
					player: "phaseEnd",
				},
				forced: true,
				init(player) {
					if (!player.storage.blue_bingyuan_z)
						player.storage.blue_bingyuan_z = 0
				},
				filter(event, player) {
					return player.storage.blue_bingyuan_z > 0
				},
				async content(event, trigger, player) {
					await player.draw(player.storage.blue_bingyuan_z)
				}
			},
			die: {
				forced: true,
				forceDie: true,
				trigger: {
					player: "die",
				},
				filter(event, player) {
					return game.filterPlayer(function (current) {
						return !current.hasSkill("blue_donghai")
					}).length > 0
				},
				async content(event, trigger, player) {
					await game.delayx();
					const target = game.filterPlayer(function (current) {
						return !current.hasSkill("blue_donghai")
					}).randomGet()

					player.line(target, "green")

					if (target.storage.blue_bingyuan_x)
						target.storage.blue_bingyuan_x += player.storage.blue_bingyuan_x
					else
						target.storage.blue_bingyuan_x = player.storage.blue_bingyuan_x

					if (target.storage.blue_bingyuan_y)
						target.storage.blue_bingyuan_y += player.storage.blue_bingyuan_y
					else
						target.storage.blue_bingyuan_y = player.storage.blue_bingyuan_y

					if (target.storage.blue_bingyuan_z)
						target.storage.blue_bingyuan_z += player.storage.blue_bingyuan_z
					else
						target.storage.blue_bingyuan_z = player.storage.blue_bingyuan_z

					target.addSkill("blue_donghai")
				},
			}
		}
	},
};
export default skills;