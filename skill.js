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
			const next = player.judge(function (card) {
				return 1;
			});
			next.set("callback", lib.skill.kyoko_shengxu.callback);
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
		audio: "ext:魔法纪录/audio/skill:2",
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
		audio: "ext:魔法纪录/audio/skill:2",
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
	"sayaka_yuehun": {
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
		audio: "ext:魔法纪录/audio/skill:2",
		derivation: "sayaka_wuwei",
		filter(event, player) {
			return player.countCards("h", card => lib.filter.cardDiscardable(card, player)) >= 2 && game.hasPlayer(function (current) {
				return current != player;
			});
		},
		async content(event, trigger, player) {
			const result = await player.chooseCardTarget({
				prompt: "弃置两张手牌并选择一名角色，你与其各回复一点体力，然后若体力值不相同，体力值较低的角色获得【无畏】",
				filterTarget(card, player, target) {
					return player != target;
				},
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

				if (player.hp == target.hp) return;

				game.filterPlayer(current =>
					player.hp < target.hp ? current == player : current == target
				)
					.forEach(current => {
						current.addAdditionalSkills("sayaka_qiangyin_" + player.playerid, "sayaka_wuwei", true)
					});

			};
		},
		subSkill: {
			clear: {
				charlotte: true,
				onremove(player) {
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
		audio: "ext:魔法纪录/audio/skill:2",
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
		audio: "ext:魔法纪录/audio/skill:1",
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
	"iroha_dimeng": {
		usable: 1,
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "gainAfter",
			global: "loseAsyncAfter"
		},
		group: ["iroha_dimeng_draw"],
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

			player.line(target1, "green");
			await player.give(player.getCards("h"), target1);

			const result2 = await target1.chooseCard("h", "缔盟：请选择要交给" + get.translation(player) + "的至少" + get.cnNumber(player.maxHp) + "张手牌", true, [Math.min(player.maxHp, target1.countCards("h")), target1.countCards("h")])
				.set("ai", function (card) {
					if ((ncheck && ui.selected.cards.length == nsub) || (!ncheck && att > 0 && ui.selected.cards.length == (n1 - player.hp + 1)))
						return -1
					if (att > 0) {
						if (n3 && n30)
							return get.value(card, target1)
						return 6 - get.value(card, target1)
					} else {
						if (get.value(card, player) > 0)
							return -1
						return -get.value(card, target1)
					}
				})
				.forResult();

			if (!result2.bool) return;
			player.line(target1, "green");
			await target1.give(result2.cards, player);

			if (player.countCards("h") == target1.countCards("h")) {
				await player.draw(1);
				await target1.draw(1);
			}

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
			draw: {
				trigger: { player: "phaseDrawBegin2" },
				frequent: true,
				filter(event, player) {
					return !event.numFixed;
				},
				async content(event, trigger, player) {
					trigger.num += 4;
				},
				ai: {
					threaten: 1.3
				}
			}
		},
		ai: {
			threaten: 4.5,
		},
	},
	"iroha_huanyu": {
		trigger: { player: "damageBegin4" },
		filter(event, player) {
			return event.source;
		},
		clanSkill: true,
		forced: true,
		logTarget: "source",
		async content(event, trigger, player) {
			const target = trigger.source;
			player.line(target);
			let times = player.getHistory("useSkill", evt => evt.skill == "iroha_huanyu").length;
			let clans = game.countPlayer(current => current.hasClan("宝崎环氏"));
			times = Math.max(times, clans);

			if (target.countCards("h") > player.countCards("h")) {
				const {
					result: { bool },
				} = await target
					.chooseToDiscard("环羽：弃置" + times + "张牌，或令对" + get.translation(player) + "造成的伤害-" + times, "he", times)
					.set("ai", card => {
						if (get.event("goon")) {
							return 0;
						}
						return 6 - get.value(card);
					})
					.set("goon", get.damageEffect(player, target, target) <= 0);
				if (!bool) {
					trigger.num -= times;
				}
			} else {
				await player.draw(times);
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
		audio: "ext:魔法纪录/audio/skill:2",
		filter(event, player) {
			return event.name != "phase" || game.phaseNumber == 0;
		},
		init(player) {
			player.storage.yachiyo_zhishui = 0;
		},
		forced: true,
		async content(event, trigger, player) {
			player.addMark("yachiyo_zhishui", 1)
		},
		intro: {
			content: "拥有#个标记",
		},
		group: ["yachiyo_zhishui_1", "yachiyo_zhishui_2"],
		subSkill: {
			1: {
				audio: "yachiyo_zhishui",
				trigger: {
					player: "phaseBegin",
				},
				forced: true,
				async content(event, trigger, player) {
					player.addMark("yachiyo_zhishui", 1);
				},
			},
			2: {
				audio: "yachiyo_zhishui",
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
					}
				},
			}
		}
	},
	"yachiyo_jueyu": {
		trigger: { source: "damageBegin1" },
		audio: "ext:魔法纪录/audio/skill:2",
		filter(event, player) {
			const target = event.player;
			if (player.countMark("yachiyo_zhishui") <= 0) return false;
			return !player.getStat("yachiyo_jueyu1")?.includes(target) && !player.getStat("yachiyo_jueyu2")?.includes(target);
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
				str1 = "对" + str + "造成伤害+1，并获得其一张牌" + (!f01 ? "（本回合已选择过）" : "")
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
			player.storage.yachiyo_zhishui -= 1

			if (result == "选项一") {
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
			draw: {
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

			player.addSkill("yachiyo_xiji_temp")
		},
		subSkill: {
			temp: {
				charlotte: true,
				nopop: true,
				marktext: "希",
				intro: { content: "手牌上限+2，使用【杀】的次数上限+1" },
				mod: {
					maxHandcardBase(player, num) {
						return num + 2
					},
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
		audio: "ext:魔法纪录/audio/skill:2",
		zhuSkill: true,
		forbid: ["guozhan"],
		global: "magius_jiefang2",
		"_priority": 0,
	},
	"magius_jiefang2": {
		audio: "magius_jiefang",
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
			var str = "将一张基本牌交给" + get.translation(list);
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
			return get.type(card, player) == "basic";
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

			while (event.bool) {
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
		audio: "ext:魔法纪录/audio/skill:2",
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
					} else if (get.suit(card) == "heart") {
						return 2;
					}
					return -5;
				}).forResult();
				if (result.bool && result.color == "black") player.addMark("nemu_zhiyao", 2);
				if (result.suit == "heart") {
					player.recover();
				}
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
				.set("prompt", "当前是" + get.translation(trigger.player) + "的回合，请选择标记数")
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
	"ashley_lingzhen": {
		zhuanhuanji: true,
		forced: true,
		locked: true,
		mark: true,
		marktext: "☯",
		trigger: { player: ["loseAfter", "loseAsyncAfter"] },
		filter(event, player) {
			if (event.type != "discard")
				return false;
			const evt = event.getl(player);
			if (!evt || !evt.cards2 || evt.cards2.length == 0)
				return false;
			return evt.cards2.some(card => get.suit(card) == "spade");
		},
		async content(event, trigger, player) {
			player.logSkill("ashley_lingzhen");
			if (!player.storage.ashley_lingzhen) {
				await player.draw(2);
			} else {
				const result = await player.chooseTarget("请选择【知己知彼】的目标", true, (card, player, target) => {
					return target.countCards("h") > 0 && target != player && player.canUse({ name: "zhibi", isCard: true }, target);
				}).set("ai", target => {
					return get.effect(target, { name: "zhibi" }, player, player);
				}).forResult();
				if (result.bool && result.targets.length) {
					await player.useCard({ name: "zhibi", isCard: true }, result.targets[0], false);
				}
			}
			player.changeZhuanhuanji("ashley_lingzhen");
		},
		intro: {
			content(storage) {
				return "转换技，锁定技。当你因弃置而失去牌后，若其中含有黑桃花色，" + (!storage ? "<span style=\"color:red\">阳：你摸两张牌</span>" : "<span style=\"color:blue\">阴：视为使用一张【知己知彼】</span>");
			},
		},
	},
	"ashley_mengshu": {
		trigger: { player: "phaseZhunbeiBegin" },
		audio: "ext:魔法纪录/audio/skill:2",
		group: "ashley_mengshu_block",
		async content(event, trigger, player) {
			await player.chooseToDebate(game.filterPlayer(current => current != player))
				.set("callback", async event => {
					const result = event.debateResult;
					const { bool, opinion, targets, opinions } = result;
					const redTargets = result.red.map(i => i[0]);
					const blackTargets = result.black.map(i => i[0]);

					if (opinion == "red") {
						redTargets.forEach(target => {
							player.addTempSkill("ashley_mengshu_mark_clear", { player: "phaseZhunbeiBegin" });
							target.addMark("ashley_mengshu", 1);
						});
					} else if (opinion == "black") {
						blackTargets.forEach(target => {
							target.damage(1, player);
						});
					}

					targets.forEach(target => {
						if (redTargets.includes(target)) {
							game.asyncDraw([player, target], 1);
						}
						else if (blackTargets.includes(target)) {
							player.line(target);
							player.chooseToDiscard("h", true).set("ai", card => {
								if (get.suit(card) == "spade")
									return 2;
								return 0;
							});
							target.chooseToDiscard("h", true);
						}
					});
				})
				.set("ai", () => {
					return 0;
				});
		},
		subSkill: {
			block: {
				audio: "ashley_mengshu",
				charlotte: true,
				onremove: true,
				trigger: { player: "damageBegin4" },
				forced: true,
				priority: 10,
				filter(event, player) {
					return event.source.countMark("ashley_mengshu") > 0;
				},
				content() {
					trigger.cancel();
				},
				ai: {
					effect: {
						target(card, player, target) {
							if (player.hasSkillTag("jueqing", false, target)) {
								return;
							}
							if (!target.hasMark("ashley_mengshu")) {
								return;
							}
							if (get.tag(card, "damage")) {
								return "zeroplayertarget";
							}
						},
					},
				},
			},
			mark_clear: {
				onremove(player) {
					game.filterPlayer(current => current != player).forEach(target => {
						target.removeMark("ashley_mengshu");
					});
				},
			},
		},
		ai: {
			threaten: 3,
		},
		mark: true,
		markText: "萌术",
		intro: {
			content(storage, player) {
				const targets = game.filterPlayer(current => current.hasMark("ashley_mengshu"));
				if (targets.length == 0) return "暂无角色获得萌术标记";
				return "直至阿什莉的下一回合开始时，" + get.translation(targets) + "不能对其造成伤害";
			}
		}
	},

	// 环忧
	"ui_jinghua": {
		trigger: { global: "phaseJieshu" },
		audio: "ext:魔法纪录/audio/skill:2",
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
						trigger.cancel();
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
    "Kazumi_xingyun": {
        audio: "ext:魔法纪录/audio/skill:2",
        zhuSkill: true, 
        trigger: { 
            global: "dieAfter" 
        },
        forced: true,
        filter: function(event, player) {
            return player.hasZhuSkill("Kazumi_xingyun");
        },
        content: async function(event, trigger, player) {
            var card = get.cardPile(function(c) {
                return get.type(c) === "equip";
            });
            
            if (!card && ui.discardPile) {
                var discards = ui.discardPile.childNodes;
                for (var i = 0; i < discards.length; i++) {
                    if (get.type(discards[i]) === "equip") {
                        card = discards[i];
                        break;
                    }
                }
            }
            
            if (card) {
                player.addToExpansion(card, player, "give").gaintag.add("Kazumi_baoshi_star");
                player.addMark("Kazumi_baoshi_star", 1, false);
                game.log(player, "发动主公技", "#g【星陨】", "，将", card, "化作了", "#y【星】");
            } else {
                game.log(player, "发动了主公技", "#g【星陨】", "，但游戏内已无多余的装备牌");
            }
        }
    },
    "Kazumi_baoshi": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: ["chooseToUse", "chooseToRespond"],
        hiddenCard: function(player, name) {
            if ((name === "tao" || name === "jiu") && player.hasCard(function(c) { return get.type(c) === "equip"; }, "he")) {
                return true;
            }
            return false;
        },
        filter: function(event, player) {
            if (!player.hasCard(function(c) { return get.type(c) === "equip"; }, "he")) {
                return false;
            }
            return ["tao", "jiu"].some(function(name) {
                var card = new lib.element.VCard({ name: name, isCard: true, storage: { Kazumi_baoshi_tao: true } });
                return event.filterCard(card, player, event);
            });
        },
        chooseButton: {
            dialog: function(event, player) {
                var list = ["tao", "jiu"].filter(function(name) {
                    var card = new lib.element.VCard({ name: name, isCard: true, storage: { Kazumi_baoshi_tao: true } });
                    return event.filterCard(card, player, event);
                });
                var dialog = ui.create.dialog("暴食", [list.map(function(name) { return ["基本", "", name]; }), "vcard"], "hidden");
                dialog.direct = true;
                return dialog;
            },
            filter: function(button, player) {
                var evt = _status.event.getParent();
                var card = new lib.element.VCard({ name: button.link[2], isCard: true, storage: { Kazumi_baoshi_tao: true } });
                return evt.filterCard(card, player, evt);
            },
            check: function(button) { 
                var player = _status.event.player;
                if (!player) return 1; 
                var type = button.link[2];
                if (type === "tao") {
                    var friendsNeedHeal = game.filterPlayer(function(current){
                        return get.attitude(player, current) > 0 && current.hp < current.maxHp;
                    });
                    if (friendsNeedHeal.length > 0 || player.hp < player.maxHp) return 2; 
                    return 0; 
                }
                if (type === "jiu") {
                    if (player.hasCard(function(c){ return c.name === "sha"; }, "hs")) return 1.5; 
                    if (player.hp === player.maxHp) return 0.8; 
                    return 0;
                }
                return 1; 
            },
            backup: function(links, player) {
                return {
                    audio: "ext:魔法纪录/audio/skill:2",
                    filterCard: function(card) { return get.type(card) === "equip"; },
                    position: "he",
                    viewAs: { name: links[0][2], storage: { Kazumi_baoshi_tao: true } },
                    popname: true,
                    selectTarget: -1,
                    filterTarget: function(card, player, target) {
                        if (card.name === "jiu") return target === player;
                        if (_status.event.dying) return target === _status.event.dying;
                        return target === player; 
                    }
                };
            },
            prompt: function(links) { return "将一张装备牌当做【" + get.translation(links[0][2]) + "】使用"; }
        },
        ai: {
            order: function(item, player) {
                var p = player || _status.event.player;
                if (p && p.hp <= 2) return 8.5; 
                return 4; 
            },
            result: { player: 1 },
            threaten: 2.5
        },
        mod: {
            targetEnabled: function(card, player, target) { if (card.storage && card.storage.Kazumi_baoshi_tao) return true; },
            cardEnabled2: function(card, player) { if (card.storage && card.storage.Kazumi_baoshi_tao) return true; },
            cardSavable: function(card, player) { if (card.storage && card.storage.Kazumi_baoshi_tao) return true; },
            cardUsable: function(card, player, num) { if (card.storage && card.storage.Kazumi_baoshi_tao) return Infinity; },
            maxHandcard: function(player, num) { return num + (player.countMark("Kazumi_baoshi_star") || 0); }
        },
        group: ["Kazumi_baoshi_trigger"],
        subSkill: {
            trigger: {
                trigger: { player: ["useCardAfter", "respondAfter"] },
                silent: true,
                forced: true,
                filter: function(event, player) {
                    return event.skill === "Kazumi_baoshi_backup" && event.cards && event.cards.length > 0;
                },
                content: async function(event, trigger, player) {
                    player.storage.Kazumi_baoshi_count = (player.storage.Kazumi_baoshi_count || 0) + 1;
                    
                    var target = player;
                    if (trigger.targets && trigger.targets.length > 0) target = trigger.targets[0];
                    player.storage.Kazumi_ignore_xiangxi = true;
                    try {
                        var vName = trigger.card.name === "tao" ? "jiu" : "tao";
                        await target.useCard(game.createCard(vName), target); 
                    } finally {
                        delete player.storage.Kazumi_ignore_xiangxi;
                    }
                    if (trigger.cards && trigger.cards.length > 0) {
                        var card = trigger.cards[0];
                        var pos = get.position(card, true);
                        if (pos === "d" || pos === "e" || pos === "o") {
                            var currentStars = player.getExpansions("Kazumi_baoshi_star").length;
                            if (currentStars < 7) {
                                player.addToExpansion(card, player, "give").gaintag.add("Kazumi_baoshi_star");
                                player.addMark("Kazumi_baoshi_star", 1, false);
                                game.log(player, "将", card, "化作了", "#y【星】");
                            }
                        }
                    }
                }
            }
        }
    },
    "Kazumi_xiangxi": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { global: "recoverEnd", player: "useCardAfter" },
        forced: true,
        filter: function(event, player) {
            if (player.storage.Kazumi_ignore_xiangxi) return false;
            if (event.name === "recover") {
                return event.source === player && event.player.isAlive();
            } else {
                if (event.card && ["tao", "jiu", "taoyuan"].includes(event.card.name)) {
                    if (!event.targets || event.targets.length === 0) return false;
                    return event.targets.every(function(t) { return t.hp >= t.maxHp; });
                }
                return false;
            }
        },
        content: async function(event, trigger, player) {
            if (player.isDamaged()) {
                var targetRes = await player.chooseTarget("相系：请选择一名角色令其摸两张牌", 1, function(card, p, t){ 
                    return true; 
                }).set("ai", function(target) {
                    var p = _status.event.player;
                    var att = get.attitude(p, target);
                    if (att > 0) {
                        if (target !== p) {
                            if (target.hp === 1) return 15 + att; 
                            if (target.hp <= 2 && target.countCards("h") <= 2) return 12 + att;
                        }
                        if (target === p) return 10;
                        return att;
                    }
                    return 0; 
                }).forResult();
                
                if (targetRes.bool && targetRes.targets.length > 0) {
                    await targetRes.targets[0].draw(2);
                }
            } else {
                var num = player.getExpansions("Kazumi_baoshi_star").length;
                if (num > 0) {
                    var pool = [
                        "Pleiades_shuheng", "Pleiades_wangxing", "Pleiades_kuixin", "Pleiades_tijie", "Pleiades_juexiang",
                        "Pleiades_wanxiang", "Pleiades_rongyu", "Pleiades_qiyuan", "Pleiades_fenli", "Pleiades_lingshi",
                        "Pleiades_huanxie", "Pleiades_gongli", "Pleiades_yisu", "Pleiades_zongou", "Pleiades_liecu",
                        "Pleiades_yanru", "Pleiades_xunting", "Pleiades_huifeng", "Pleiades_binyan", "Pleiades_shishan",
                        "Pleiades_tuiyi", "Pleiades_xunjue", "Pleiades_kehen", "Pleiades_jijing", "Pleiades_zhaojue",
                        "Pleiades_shizi", "Pleiades_huanyu", "Pleiades_yixi", "Pleiades_zhiya", "Pleiades_jackpot", 
						"Pleiades_maoxing", "Pleiades_lianzhu", "Pleiades_xingzhui", "Pleiades_yiyuan", "Pleiades_shuijing", 
						"Pleiades_paoqiu", 
                    ];
                    var skills = pool.randomGets(num);
                    var next = player.chooseControl(skills).set("prompt", "相系：请选择获得一个技能（保留至下回合结束）").set("ai", function() {
                        return _status.event.controls[Math.floor(Math.random() * _status.event.controls.length)];
                    });
                    var result = await next.forResult();
                    
                    if (result.control) {
                        var skillName = result.control;
                        var uniqueId = "Kazumi_xiangxi_" + skillName + "_" + get.id();
                        await player.addAdditionalSkills(uniqueId, [skillName], true);
                        delete player.storage[uniqueId + "_phased"];
                        player.when({ player: "phaseBegin" }).step(async () => { player.storage[uniqueId + "_phased"] = true; });
                        player.when({ player: "phaseEnd" }, false).filter(() => { return player.storage[uniqueId + "_phased"]; })
                            .assign({ firstDo: true, priority: Infinity })
                            .step(async () => {
                                delete player.storage[uniqueId + "_phased"];
                                player.removeAdditionalSkills(uniqueId);
                            }).finish();
                    }
                }
            }
        }
    },
     "Kazumi_chengzhen": {
        audio: "ext:魔法纪录/audio/skill:2",
        dutySkill: true,
        locked: false,
        trigger: { 
            global: "phaseJieshuEnd" 
        },
        group: ["Kazumi_chengzhen_success", "Kazumi_chengzhen_fail"],
        filter: function(event, player) {
            return player.getExpansions("Kazumi_baoshi_star").length > 0;
        },
        content: async function(event, trigger, player) {
            var choices = ["取消"];
            var currentStars = player.countMark("Kazumi_baoshi_star") || 0;
            if (currentStars >= 2) choices.unshift("扣减2点手牌上限");
            choices.unshift("扣减1点体力上限");
            
            var next = player.chooseControl(choices).set("prompt", "成真：是否扣减上限并移去一张【星】？").set("ai", function() {
                var p = _status.event.player;
                var stars = p.countMark("Kazumi_baoshi_star") || 0;
                var minus = p.countMark("Kazumi_chengzhen_minus") || 0;
                var limit = p.hp + stars - minus;
                
                if (limit >= 10 && limit < 13) return "取消";
                
                var vulnerableEnemies = game.filterPlayer(function(current) { 
                    return get.attitude(p, current) < 0 && current.countCards("h") > 0 && current.countCards("h") < 3; 
                });
                var friendsNeedEquip = game.filterPlayer(function(current) { 
                    return get.attitude(p, current) > 0 && current.countCards("e") < 2; 
                });
                
                if (p.hp <= 2 || vulnerableEnemies.length > 0 || friendsNeedEquip.length > 0) {
                    var canReduceHand = _status.event.controls.includes("扣减2点手牌上限");
                    var futureHandLimit = limit - 2;
                    
                    if (p.hp < p.maxHp || p.hp <= 2) {
                        return "扣减1点体力上限";
                    }
                    if (canReduceHand && futureHandLimit >= 4) {
                        return "扣减2点手牌上限";
                    }
                    return "扣减1点体力上限";
                }
                return "取消";
            });
            
            var res = await next.forResult();
            
            if (res.control && res.control !== "取消") {
                if (res.control === "扣减2点手牌上限") {
                    player.addMark("Kazumi_chengzhen_minus", 2, false);
                } else {
                    await player.loseMaxHp(1);
                }
                
                var cards = player.getExpansions("Kazumi_baoshi_star");
                var chooseCard = await player.chooseCardButton("请选择移去一张【星】", cards).set("ai", function(button) {
                    var p = _status.event.player;
                    var subtype = get.subtype(button.link) || ""; 
                    var vulnerableEnemies = game.filterPlayer(function(current) { 
                        return get.attitude(p, current) < 0 && current.countCards("h") > 0 && current.countCards("h") < 3; 
                    });
                    
                    if (p.hp <= 2 && subtype.startsWith("equip5")) return 10; 
                    if (vulnerableEnemies.length > 0 && subtype.startsWith("equip1")) return 8; 
                    if (subtype.startsWith("equip2") || subtype.startsWith("equip3") || subtype.startsWith("equip4")) return 6; 
                    return 1;
                }).forResult();
                
                if (chooseCard.bool && chooseCard.links && chooseCard.links.length > 0) {
                    var star = chooseCard.links[0];
                    await player.loseToDiscardpile(star);
                    var subtype = get.subtype(star) || ""; 
                    
                    if (subtype.startsWith("equip1")) { 
                        var targetRes = await player.chooseTarget("弃置一名其他角色的两张手牌", function(card, p, t) { 
                            return t !== p && t.countCards("h") > 0; 
                        }).set("ai", function(target) {
                            var att = get.attitude(_status.event.player, target);
                            if (att >= 0) return 0;
                            if (target.countCards("h") < 3) return -att + 10; 
                            return -att;
                        }).forResult();
                        if (targetRes.bool) await player.discardPlayerCard(targetRes.targets[0], "h", 2, true);
                    } else if (subtype.startsWith("equip2") || subtype.startsWith("equip3") || subtype.startsWith("equip4") || subtype.startsWith("equip6")) {
                        var targetRes2 = await player.chooseTarget("将此牌置入一名角色的装备区并摸一张牌", true).set("ai", function(target) {
                            return get.attitude(_status.event.player, target) + (target.countCards("e") === 0 ? 3 : 0); 
                        }).forResult();
                        if (targetRes2.bool) { 
                            await targetRes2.targets[0].equip(star); 
                            await player.draw(); 
                        }
                    } else if (subtype.startsWith("equip5")) {
                        await player.recover(1); 
                        star.fix(); 
                        ui.special.appendChild(star); 
                    }
                }
            }
        },
        mod: {
            maxHandcard: function(player, num) {
                return num + (player.countMark("Kazumi_baoshi_star") || 0) - (player.countMark("Kazumi_chengzhen_minus") || 0);
            }
        },
        subSkill: {
            success: {
                trigger: {
					player: "phaseZhunbeiBegin"
				},
                forced: true,
                skillAnimation: true,
                animationColor: "orange",
                filter: function(event, player) { 
                    var limit = 0;
                    if (typeof player.getHandcardLimit === "function") limit = player.getHandcardLimit();
                    else limit = player.hp + (player.countMark("Kazumi_baoshi_star") || 0) - (player.countMark("Kazumi_chengzhen_minus") || 0);
                    return limit >= 13; 
                },
                content: async function(event, trigger, player) {
                    player.awakenSkill("Kazumi_chengzhen"); 
                    await player.removeSkills(["olrumo", "Kazumi_tiaowei"]); 
                    game.addGlobalSkill("Innocent_Malice");
                    player.reinit(player.name, "Subaru_Kazumi"); 
                    game.log(player, "签订契约成为人类，终结的陨星划过，迎来了奇迹的显现！");
                }
            },
            fail: {
                trigger: {
					player: "dying"
				},
                forced: true,
                priority: 15, 
                skillAnimation: true,
                animationColor: "fire",
                filter: function(event, player) { 
                    return (player.storage.Kazumi_baoshi_count >= 3) && !player.hasSkill("olrumo"); 
                },
                content: async function(event, trigger, player) {
                    player.logSkill("Kazumi_chengzhen_fail"); 
                    if (typeof player.banSkill === "function") player.banSkill("Kazumi_baoshi");
                    else player.removeSkill("Kazumi_baoshi");
                    
                    if (player.hp < 2) await player.recover(2 - player.hp);
                    await player.addSkills(["olrumo", "Kazumi_tiaowei"]); 
                    game.log(player, "由于（暴食" + player.storage.Kazumi_baoshi_count + "次）而发现真相，陷入了绝望的半魔女状态！");
                }
            }
        }
    },
    // 暴走和美
    "Kazumi_tiaowei": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { 
            player: ["recoverEnd", "damageEnd", "loseHpEnd"] 
        }, 
        forced: true,
        group: ["Kazumi_tiaowei_record", "Kazumi_tiaowei_use", "Kazumi_tiaowei_add", "Kazumi_tiaowei_mark_used"],
        content: async function(event, trigger, player) {
            var equips = [];
            var discards = ui.discardPile ? ui.discardPile.childNodes : [];
            
            for (var i = 0; i < discards.length; i++) {
                if (get.type(discards[i]) === "equip") {
                    equips.push(discards[i]);
                }
            }
            
            if (equips.length > 0) {
                var card = equips.randomGet();
                player.addToExpansion(card, player, "give").gaintag.add("Kazumi_baoshi_star");
                player.addMark("Kazumi_baoshi_star", 1, false);
                game.log(player, "从弃牌堆将", card, "化作了", "#y【星】");
            } else {
                game.log(player, "弃牌堆中没有装备牌，无法获得【星】");
            }
        },
        mod: {
            maxHandcard: function(player, num) {
                var extra = player.countMark("Kazumi_tiaowei_maxhandcard") || 0;
                return num + extra;
            }
        },
        subSkill: {
            record: {
                trigger: { global: "damageEnd" }, 
                forced: true, 
                filter: function(event, player) { 
                    return event.card && event.card.name;
                },
                content: function(event, trigger, player) {
                    if (!player.storage.Kazumi_tiaowei_record) {
                        player.storage.Kazumi_tiaowei_record = [];
                    }
                    if (!player.storage.Kazumi_tiaowei_record.includes(trigger.card.name)) { 
                        player.storage.Kazumi_tiaowei_record.push(trigger.card.name); 
                        player.markSkill("Kazumi_tiaowei_record"); 
                    }
                },
                intro: {
                    content: function(storage) {
                        if (!storage || !storage.length) return "无记录的牌名";
                        var mapped = storage.map(function(s) { return get.translation(s); });
                        return "已记录：" + mapped.join("、");
                    }
                }
            },
            use: {
                enable: ["chooseToUse", "chooseToRespond"],
                filter: function(event, player) { 
                    var record = player.storage.Kazumi_tiaowei_record || [];
                    var stars = player.getExpansions("Kazumi_baoshi_star") || [];
                    return record.length > 0 && stars.length > 0; 
                },
                chooseButton: {
                    dialog: function(event, player) {
                        var record = player.storage.Kazumi_tiaowei_record || [];
                        var list = []; 
                        for (var i = 0; i < record.length; i++) {
                            var name = record[i];
                            var type = get.type({name: name}) || "基本";
                            list.push([type, "", name]);
                        }
                        return ui.create.dialog("调味：请选择要当做哪张已记录的牌使用", [list, "vcard"], "hidden");
                    },
                    filter: function(button, player) { 
                        var used = player.getStorage("Kazumi_tiaowei_used") || [];
                        return !used.includes(button.link[2]); 
                    },
                    check: function(button) { 
                        var player = _status.event.player;
                        if (!player) return 0; 
                        
                        var name = button.link[2];
                        
                        if (_status.event.type !== 'phase') return 1;
                        
                        var val = player.getUseValue({name: name});
                        
                        if (['nanman', 'wanjian', 'juedou', 'huogong', 'sha'].includes(name)) {
                            val += 1; 
                        }
                        
                        return val; 
                    },
                    backup: function(links, player) {
                        return { 
                            audio: "ext:魔法纪录/audio/skill:2",
                            filterCard: function(card) { return false; }, 
                            selectCard: -1, 
                            viewAs: { 
                                name: links[0][2], 
                                storage: { tiaowei_damage: true } 
                            }, 
                            popname: true
                        };
                    },
                    prompt: function(links) { 
                        return "将随机移去一张【星】，当做【" + get.translation(links[0][2]) + "】使用"; 
                    }
                },
                ai: {
                    order: function(item, player) {
                        var stars = player.getExpansions("Kazumi_baoshi_star");
                        if (stars && stars.length >= 2) return 9; 
                        return 6;
                    },
                    result: { player: 1 },
                    threaten: 3.5 
                }
            },
            mark_used: {
                trigger: { player: ["useCard", "respond"] },
                forced: true,
                silent: true,
                popup: false,
                filter: function(event, player) {
                    return event.card && event.card.storage && event.card.storage.tiaowei_damage;
                },
                content: async function(event, trigger, player) {
                    player.addTempSkill("Kazumi_tiaowei_used");
                    player.markAuto("Kazumi_tiaowei_used", [trigger.card.name]);
                    
                    var stars = player.getExpansions("Kazumi_baoshi_star");
                    if (stars && stars.length > 0) {
                        var costCard = stars.randomGet();
                        await player.loseToDiscardpile(costCard);
                        game.log(player, "随机移去了", costCard, "作为代价");
                    }
                }
            },
            used: { charlotte: true, onremove: true },
            add: { 
                trigger: { source: "damageEnd" }, 
                forced: true, 
                silent: true, 
                filter: function(event, player) { 
                    return event.card && event.card.storage && event.card.storage.tiaowei_damage;
                }, 
                content: function(event, trigger, player) { 
                    player.addMark("Kazumi_tiaowei_maxhandcard", 1, false); 
                    game.log(player, "因", "#g【调味】", "造成了伤害，手牌上限永久 +1");
                } 
            }
        }
    },
    // 全局技能：无辜的恶意 
    "Innocent_Malice": {
        trigger: { 
            global: "phaseEnd" 
        },
        forced: true,
        filter: function(event, player) {
            return event.player === player;
        },
        content: async function(event, trigger, player) {
            var targets = [player]; 
            
            var pleiades = [
                "Kazumi", "Subaru_Kazumi", "Michiru", "Kaoru", "Umika", 
                "Niko", "Mirai", "Satomi", "Saki", "Pleiades_Saints"
            ];
            
            var players = game.filterPlayer(function(p) {
                return pleiades.includes(p.name) || 
                       pleiades.includes(p.name1) || 
                       pleiades.includes(p.name2) || 
                       p.group === "Magia_Others";
            });
            
            targets.addArray(players); 
            targets = targets.unique();
            
            for (var i = 0; i < targets.length; i++) { 
                var t = targets[i];
                if (t.isDamaged()) {
                    await t.recover(1); 
                    t.addTempSkill("Innocent_Malice_debuff", { player: "phaseBefore" }); 
                }
            }
        },
        subSkill: { 
            debuff: { 
                mark: true, 
                intro: { 
                    content: "本轮手牌上限-1" 
                }, 
                mod: { 
                    maxHandcard: function(player, num) { 
                        return num - 1; 
                    } 
                } 
            } 
        }
    },

    // 昴和美
    "Subaru_Kazumi_baoshi": {
        audio: "ext:魔法纪录/audio/skill:2",
        persevereSkill: true,
        enable: ["chooseToUse", "chooseToRespond"],
        hiddenCard: function(player, name) { 
            if ((name === "tao" || name === "jiu") && player.hasCard(function(c) { return true; }, "he")) {
                return true;
            }
            return false;
        },
        filter: function(event, player) { 
            if (!player.hasCard(function(c) { return true; }, "he")) {
                return false;
            }
            return ["tao", "jiu"].some(function(name) {
                var card = new lib.element.VCard({ name: name, isCard: true, storage: { Kazumi_baoshi_tao: true } });
                return event.filterCard(card, player, event);
            });
        },
        chooseButton: {
            dialog: function(event, player) { 
                var list = ["tao", "jiu"].filter(function(name) {
                    var card = new lib.element.VCard({ name: name, isCard: true, storage: { Kazumi_baoshi_tao: true } });
                    return event.filterCard(card, player, event);
                });
                var dialog = ui.create.dialog("暴食", [list.map(function(name) { return ["基本", "", name]; }), "vcard"], "hidden");
                dialog.direct = true;
                return dialog;
            },
            filter: function(button, player) { 
                var evt = _status.event.getParent();
                var card = new lib.element.VCard({ name: button.link[2], isCard: true, storage: { Kazumi_baoshi_tao: true } });
                return evt.filterCard(card, player, evt);
            },
            check: function(button) { 
                var player = _status.event.player;
                if (!player) return 1;
                var type = button.link[2];
                if (type === "tao") {
                    var friendsNeedHeal = game.filterPlayer(function(current){
                        return get.attitude(player, current) > 0 && current.hp < current.maxHp;
                    });
                    if (friendsNeedHeal.length > 0 || player.hp < player.maxHp) return 2; 
                    return 0; 
                }
                if (type === "jiu") {
                    if (player.hasCard(function(c){ return c.name === "sha"; }, "hs")) return 1.5; 
                    if (player.hp === player.maxHp) return 0.8; 
                    return 0;
                }
                return 1; 
            },
            backup: function(links, player) {
                return { 
                    audio: "ext:魔法纪录/audio/skill:2", 
                    filterCard: function(card) { 
                        return true; 
                    }, 
                    position: "he", 
                    check: function(card) {
                        return 8 - get.value(card); 
                    },
                    viewAs: { 
                        name: links[0][2], 
                        storage: { 
                            Kazumi_baoshi_tao: true 
                        } 
                    }, 
                    popname: true, 
                    selectTarget: -1, 
                    filterTarget: function(card, player, target) { 
                        if (card.name === "jiu") return target === player;
                        if (_status.event.dying) return target === _status.event.dying;
                        return target === player; 
                    } 
                };
            },
            prompt: function(links) { 
                return "将一张牌当做【" + get.translation(links[0][2]) + "】使用"; 
            }
        },
        ai: {
            order: function(item, player) {
                var p = player || _status.event.player;
                if (p && p.hp <= 2) return 8.5; 
                return 4; 
            },
            result: { player: 1 },
            threaten: 3
        },
        mod: {
            targetEnabled: function(card, player, target) { if (card.storage && card.storage.Kazumi_baoshi_tao) return true; },
            cardEnabled2: function(card, player) { if (card.storage && card.storage.Kazumi_baoshi_tao) return true; },
            cardSavable: function(card, player) { if (card.storage && card.storage.Kazumi_baoshi_tao) return true; },
            cardUsable: function(card) { if (card.storage && card.storage.Kazumi_baoshi_tao) return Infinity; },
            maxHandcard: function(player, num) { 
                var starMark = player.countMark("Kazumi_baoshi_star") || 0;
                return num + starMark; 
            }
        },
        group: ["Subaru_Kazumi_baoshi_trigger", "Subaru_Kazumi_baoshi_prevent"],
        subSkill: {
            trigger: {
                trigger: { player: ["useCardAfter", "respondAfter"] }, 
                forced: true, 
                silent: true, 
                filter: function(event, player) { 
                    return event.skill === "Subaru_Kazumi_baoshi_backup" && event.cards && event.cards.length > 0; 
                },
                content: async function(event, trigger, player) {
                    var target = player;
                    if (trigger.targets && trigger.targets.length > 0) target = trigger.targets[0];
                    
                    var vName = trigger.card.name === "tao" ? "jiu" : "tao";
                    var vCard = new lib.element.VCard({
                        name: vName, isCard: true, storage: { Kazumi_baoshi_generated: true }
                    });
                    await target.useCard(vCard, target); 
                    
                    if (trigger.cards && trigger.cards.length > 0) {
                        var card = trigger.cards[0]; 
                        var pos = get.position(card, true);
                        if (pos === "d" || pos === "e" || pos === "o") { 
                            var currentStars = player.getExpansions("Kazumi_baoshi_star").length;
                            if (currentStars < 7) { 
                                player.addToExpansion(card, player, "give").gaintag.add("Kazumi_baoshi_star"); 
                                player.addMark("Kazumi_baoshi_star", 1, false); 
                            } 
                        }
                    }
                }
            },
            prevent: { 
                trigger: { player: "damageEnd" }, 
                forced: true, 
                content: function(event, trigger, player) { 
                    player.addTempSkill("Subaru_Kazumi_baoshi_invincible", "phaseAfter"); 
                } 
            },
            invincible: { 
                trigger: { player: "damageBegin" }, 
                forced: true, 
                content: function(event, trigger, player) { trigger.cancel(); } 
            }
        }
    },
    "Subaru_Kazumi_xiangxi": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { 
            global: "recoverEnd", player: "useCardAfter"
        }, 
        forced: true, 
        filter: function(event, player) { 
            if (event.name === "recover") {
                if (event.source !== player || !event.player.isAlive()) return false;
                var evt = event.getParent("useCard");
                if (evt && evt.card && evt.card.storage && evt.card.storage.Kazumi_baoshi_generated) return false;
                return true;
            } else {
                if (event.card && ["tao", "jiu", "taoyuan"].includes(event.card.name)) {
                    if (event.card.storage && event.card.storage.Kazumi_baoshi_generated) return false;
                    if (!event.targets || event.targets.length === 0) return false;
                    return event.targets.every(function(t) { return t.hp >= t.maxHp; });
                }
                return false;
            }
        },
        content: async function(event, trigger, player) {
            if (player.isDamaged()) { 
                var targetRes = await player.chooseTarget("相系：请选择一名角色令其摸两张牌", 1, function(c, p, t) { 
                    return true; 
                }).set("ai", function(target) {
                    var p = _status.event.player;
                    var att = get.attitude(p, target);
                    if (att > 0) {
                        if (target !== p) {
                            if (target.hp === 1) return 15 + att; 
                            if (target.hp <= 2 && target.countCards("h") <= 2) return 12 + att;
                        }
                        if (target === p) return 10;
                        return att;
                    }
                    return 0;
                }).forResult(); 
                
                if (targetRes.bool && targetRes.targets.length > 0) {
                    await targetRes.targets[0].draw(2); 
                }
            } else { 
                var pool = [
                    "Pleiades_shuheng", "Pleiades_wangxing", "Pleiades_kuixin", "Pleiades_tijie", "Pleiades_juexiang",
                    "Pleiades_wanxiang", "Pleiades_rongyu", "Pleiades_qiyuan", "Pleiades_fenli", "Pleiades_lingshi",
                    "Pleiades_huanxie", "Pleiades_gongli", "Pleiades_yisu", "Pleiades_zongou", "Pleiades_liecu",
                    "Pleiades_yanru", "Pleiades_xunting", "Pleiades_huifeng", "Pleiades_binyan", "Pleiades_shishan",
                    "Pleiades_tuiyi", "Pleiades_xunjue", "Pleiades_kehen", "Pleiades_jijing", "Pleiades_zhaojue",
                    "Pleiades_shizi", "Pleiades_huanyu", "Pleiades_yixi", "Pleiades_zhiya", "Pleiades_jackpot", 
					"Pleiades_maoxing", "Pleiades_lianzhu", "Pleiades_xingzhui", "Pleiades_yiyuan", "Pleiades_shuijing", 
					"Pleiades_paoqiu", 
                ];
                var skills = pool.randomGets(7); 
                var next = player.chooseControl(skills).set("prompt", "相系：请选择获得一个技能（永久）").set("ai", function() {
                    return _status.event.controls[Math.floor(Math.random() * _status.event.controls.length)];
                });
                var result = await next.forResult(); 
                
                if (result.control) {
                    player.addSkill(result.control); 
                    game.log(player, "永久获得了技能", "#y【" + get.translation(result.control) + "】");
                }
            }
        }
    },
    "Subaru_Kazumi_pojie": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { 
            player: ["phaseBegin", "phaseEnd"] 
        }, 
        filter: function(event, player) { 
            return player.getExpansions("Kazumi_baoshi_star").length > 0; 
        },
        mod: { 
            maxHandcard: function(player, num) { 
                var starMark = player.countMark("Kazumi_baoshi_star") || 0;
                var minusMark = player.countMark("Subaru_Kazumi_pojie_minus") || 0;
                return num + starMark - minusMark; 
            } 
        },
        content: async function(event, trigger, player) {
            var choices = ["扣减1点手牌上限", "取消"]; 
            var next = player.chooseControl(choices).set("prompt", "破戒：是否扣减手牌上限并移去一张【星】？").set("ai", function() {
                var p = _status.event.player;
                var enemies = game.filterPlayer(function(current) { return get.attitude(p, current) < 0 && current.countCards("h") > 0; });
                var friendsNeedEquip = game.filterPlayer(function(current) { return get.attitude(p, current) > 0 && current.countCards("e") < 2; });
                
                if (enemies.length > 0 || friendsNeedEquip.length > 0 || p.hp <= 2) {
                    return "扣减1点手牌上限";
                }
                return "取消";
            });
            await next;
            var res = next.result.control;
            
            if (res === "扣减1点手牌上限") {
                player.addMark("Subaru_Kazumi_pojie_minus", 1, false); 
                
                var chooseCard = await player.chooseCardButton("请选择移去一张【星】", player.getExpansions("Kazumi_baoshi_star")).set("ai", function(button) {
                    var p = _status.event.player;
                    var subtype = get.subtype(button.link) || ""; 
                    var enemies = game.filterPlayer(function(current) { return get.attitude(p, current) < 0 && current.countCards("h") > 0; });
                    
                    if (p.hp <= 2 && subtype.startsWith("equip5")) return 10; 
                    if (enemies.length > 0 && subtype.startsWith("equip1")) return 8; 
                    if (subtype.startsWith("equip2") || subtype.startsWith("equip3") || subtype.startsWith("equip4")) return 6; 
                    return 1;
                }).forResult();
                
                if (chooseCard.bool && chooseCard.links && chooseCard.links.length > 0) {
                    var star = chooseCard.links[0]; 
                    await player.loseToDiscardpile(star); 
                    var type = get.type(star);
                    
                    if (type === "basic") { 
                        var t1 = await player.chooseTarget("破戒：请选择至多两名其他角色，分别弃置其两张牌", [1, 2], function(c, p, t) { 
                            return t !== p; 
                        }).set("ai", function(target) {
                            return -get.attitude(_status.event.player, target); 
                        }).forResult(); 
                        
                        if (t1.bool) {
                            for (var i = 0; i < t1.targets.length; i++) {
                                await player.discardPlayerCard(t1.targets[i], "he", 2, true); 
                            }
                        }
                    } else if (type === "equip") { 
                        var t2 = await player.chooseTarget("破戒：将此牌置入一名角色的装备区并各回1血", 1, true).set("ai", function(target) {
                            return get.attitude(_status.event.player, target) + (target.countCards("e") === 0 ? 3 : 0); 
                        }).forResult(); 
                        
                        if (t2.bool) { 
                            await t2.targets[0].equip(star); 
                            await player.recover(1); 
                            if (t2.targets[0] !== player) {
                                await t2.targets[0].recover(1); 
                            }
                        } 
                    } else if (type === "trick") {
                        var vCard = { name: star.name, nature: star.nature, isCard: true };
                        var nextUse = player.chooseUseTarget(vCard, false);
                        nextUse.set("prompt", "破戒：请为【" + get.translation(star.name) + "】选择目标");
                        await nextUse.forResult();
                    }
                }
            }
        }
    },
    "Subaru_Kazumi_zhongxing": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        filter: function(event, player) {
            return player.getExpansions("Kazumi_baoshi_star").length > 0;
        },
        chooseButton: {
            dialog: function(event, player) {
                return ui.create.dialog("终星", player.getExpansions("Kazumi_baoshi_star"), "hidden");
            },
            select: [1, Infinity],
            filter: function(button, player) {
                return true;
            },
            check: function(button) {
                return 1;
            },
            backup: function(links, player) {
                return {
                    audio: "ext:魔法纪录/audio/skill:2",
                    filterCard: function() { 
                        return false; 
                    },
                    selectCard: -1,
                    cards: links,
                    delay: false,
                    content: lib.skill.Subaru_Kazumi_zhongxing.contentx
                };
            },
            prompt: function(links) {
                return "移去" + links.length + "张“星”，视为使用等量张无限制的【杀】";
            }
        },
        contentx: async function(event, trigger, player) {
            var cards = lib.skill.Subaru_Kazumi_zhongxing_backup.cards;
            var num = cards.length;
            
            await player.loseToDiscardpile(cards);
            
            player.addTempSkill("Subaru_Kazumi_zhongxing_buff");
            
            for (var i = 0; i < num; i++) {
                var sha = game.createCard("sha");
                await player.chooseUseTarget(sha, "终星：请使用一张无限制的【杀】（" + (i + 1) + "/" + num + "）", false);
            }
            
            player.removeSkill("Subaru_Kazumi_zhongxing_buff");
        },
        subSkill: {
            buff: {
                charlotte: true,
                onremove: true,
                mod: {
                    targetInRange: function(card, player, target) {
                        if (card.name === "sha") {
                            return true;
                        }
                    },
                    cardUsable: function(card, player, num) {
                        if (card.name === "sha") {
                            return Infinity;
                        }
                    }
                }
            }
        }
    },
    // 和美星标记
    "Kazumi_baoshi_star": {
        marktext: "星",
        intro: {
            name: "星",
            markcount: "expansion",
            mark: function(dialog, content, player) {
                var expansions = player.getExpansions("Kazumi_baoshi_star");
                if (expansions && expansions.length > 0) {
                    if (player === game.me || player.isUnderControl()) {
                        dialog.addAuto(expansions);
                    } else {
                        return "共有" + get.cnNumber(expansions.length) + "张“星”";
                    }
                }
            },
            content: function(content, player) {
                var expansions = player.getExpansions("Kazumi_baoshi_star");
                if (expansions && expansions.length > 0) {
                    if (player === game.me || player.isUnderControl()) {
                        return get.translation(expansions);
                    }
                    return "共有" + get.cnNumber(expansions.length) + "张“星”";
                }
            }
        }
    },

    "Pleiades_maosu": {
        audio: "ext:魔法纪录/audio/skill:2",
        persevereSkill: true,
        forced: true, 
        unique: true,
        onremove: function(player) {
            delete player.storage.Pleiades_maosu_init;
            delete player.storage.Pleiades_hidden;
            delete player.storage.Pleiades_current;
            delete player.storage.Pleiades_maosu_current;
            delete player.storage.Pleiades_maosu_first_turn;
            delete player.storage.Pleiades_zhenxiang_count;
            delete player.storage.Pleiades_zhenxiang_fired;
            if (player.name1) {
                player.name1 = player.name;
                player.skin.name = player.name;
                if(player.smoothAvatar) player.smoothAvatar(false);
                player.node.avatar.setBackground(player.name, "character");
                player.node.name.innerHTML = get.slimName(player.name);
                delete player.name2;
                delete player.skin.name2;
                player.classList.remove("fullskin2");
                if (player.node.avatar2) {
                    player.node.avatar2.classList.add("hidden");
                    player.node.name2.innerHTML = "";
                }
            }
        },
        trigger: {
            player: "enterGame",
            global: "phaseBefore"
        },
        filter: function(event, player) {
            if (player.storage.Pleiades_maosu_init) return false;
            return event.name != "phase" || game.phaseNumber == 0;
        },
        content: async function(event, trigger, player) {
            player.storage.Pleiades_maosu_init = true;
            player.storage.Pleiades_maosu_first_turn = true; 
            
            const next = game.createEvent("Pleiades_maosu_init_event");
            next.player = player;
            next.setContent(lib.skill.Pleiades_maosu.contentInit);
            await next;
        },
        
        contentInit: async function(event, trigger, player) {
            const pool = ["Umika", "Kaoru", "Saki", "Mirai", "Satomi", "Niko"];
            player.storage.Pleiades_hidden = pool.randomSort();
            const c1 = "Michiru"; 
            
            const selectable = player.storage.Pleiades_hidden.randomGets(3);
            const nextAsk = player.chooseButton([
                "昴宿：请选择与美千瑠组成双将的伙伴。<br>（首轮必须选择一名伙伴）",
                [selectable, "character"]
            ], true).set("ai", function(button) { return Math.random(); });
            
            const res = await nextAsk.forResult();
            
            let c2 = selectable[0];
            if (res && res.bool && res.links && res.links.length > 0) {
                c2 = res.links[0];
            }
            player.storage.Pleiades_hidden.remove(c2);

            await lib.skill.Pleiades_maosu.changeGeneral(player, [c1, c2]);

            player.addSkill("Pleiades_zhenxiang");
            
            player.logSkill("Pleiades_jinnuan");
            game.log(player, "暗置的“昴宿”牌减少了", "#y2", "张");
            await player.loseMaxHp(2);
            await player.draw(2);
        },
        
        group: ["Pleiades_maosu_change", "Pleiades_maosu_clear_lock"],
        subSkill: {
            clear_lock: {
                trigger: { player: "phaseEnd" },
                forced: true, silent: true, charlotte: true,
                filter: function(event, player) { return player.storage.Pleiades_maosu_first_turn; },
                content: function(event, trigger, player) { delete player.storage.Pleiades_maosu_first_turn; }
            },
            change: {
                audio: "ext:魔法纪录/audio/skill:2",
                trigger: { player: "phaseBegin" },
                forced: true,
                filter: function(event, player) {
                    return player.storage.Pleiades_maosu_init && 
                           !player.storage.Pleiades_maosu_first_turn && 
                           player.storage.Pleiades_hidden && 
                           player.storage.Pleiades_hidden.length > 0;
                },
                content: async function(event, trigger, player) {
                    const next = game.createEvent("Pleiades_maosu_change_event");
                    next.player = player;
                    next.setContent(lib.skill.Pleiades_maosu.contentChange);
                    await next;
                }
            }
        },
        
        contentChange: async function(event, trigger, player) {
            if (player.hasSkill("Pleiades_maosu_success")) {
                const ask = await player.chooseBool("昴宿：你的【烬暖】使命已达成，是否更换亮出的昴宿牌？").forResult();
                if (!ask.bool) return;
            }
            
            const hidden = player.storage.Pleiades_hidden;
            const c1 = hidden.shift(); 
            const selectable = hidden.randomGets(Math.min(3, hidden.length));
            
            const nextAsk = player.chooseButton([
                `昴宿：请选择一名角色作为伙伴（点取消则单将出击）<br><div class="text center">当前已亮出主将：【${get.translation(c1)}】</div>`,
                [selectable, "character"]
            ], [0, 1]).set("ai", function(button) { return 1; });
            
            const res = await nextAsk.forResult();
            
            let c2 = null;
            if (res && res.bool && res.links && res.links.length > 0) {
                c2 = res.links[0];
                hidden.remove(c2);
            }
            
            if (player.storage.Pleiades_current && player.storage.Pleiades_current.length > 0) {
                player.removeAdditionalSkills("Pleiades_maosu_skills");
            }
            player.removeAdditionalSkills("Pleiades_jinnuan_generic");
            
            await lib.skill.Pleiades_maosu.changeGeneral(player, c2 ? [c1, c2] : [c1]);
            
            player.logSkill("Pleiades_jinnuan");
            const count = c2 ? 2 : 1;
            game.log(player, "暗置的“昴宿”牌减少了", "#y" + count, "张");
            await player.loseMaxHp(count);
            await player.draw(count);
            player.addMark("Pleiades_change_count", 1, false);

            if (c2 && !lib.skill.Pleiades_maosu.isValidBond(c1, c2)) {
                const pool = [
					"Pleiades_wanxiang", "Pleiades_rongyu", "Pleiades_qiyuan", "Pleiades_fenli", "Pleiades_lingshi", 
					"Pleiades_huanxie", "Pleiades_gongli", "Pleiades_yisu", "Pleiades_zongou", "Pleiades_liecu", 
					"Pleiades_shuheng", "Pleiades_wangxing", "Pleiades_kuixin", "Pleiades_tijie", "Pleiades_juexiang", 
					"Pleiades_yanru", "Pleiades_xunting", "Pleiades_huifeng", "Pleiades_binyan", "Pleiades_shishan", 
					"Pleiades_tuiyi", "Pleiades_xunjue", "Pleiades_kehen", "Pleiades_jijing", "Pleiades_zhaojue", 
					"Pleiades_shizi", "Pleiades_huanyu", "Pleiades_yixi", "Pleiades_zhiya", "Pleiades_jackpot", 
					"Pleiades_maoxing", "Pleiades_lianzhu", "Pleiades_xingzhui", "Pleiades_yiyuan", "Pleiades_shuijing", 
					"Pleiades_paoqiu"
				];
                const genericSkills = pool.randomGets(2);
                game.log(player, "因双将羁绊断裂，获得了临时技能：", "#y【" + get.translation(genericSkills[0]) + "】", "#y【" + get.translation(genericSkills[1]) + "】");
                
                player.addAdditionalSkills("Pleiades_jinnuan_generic", genericSkills);
                player.storage.Pleiades_generic_timer = 2; 
                player.addSkill("Pleiades_generic_timer_skill");
            }
        },
        
        isValidBond: function(c1, c2) {
            if (c1 === "Michiru" || c2 === "Michiru") return true;
            const pair = [c1, c2].sort().join("_");
            if (pair === "Kaoru_Umika" || pair === "Mirai_Saki") return true;
            return false;
        },
        
        charSkills: {
            Michiru: ["Michiru_xiangxi"],
            Umika: ["Umika_juebi", "Umika_maosu"],
            Kaoru: ["Kaoru_rexue", "Kaoru_maosu"],
            Saki: ["Saki_zhishu", "Saki_maosu"],
            Mirai: ["Mirai_nieai", "Mirai_maosu"],
            Satomi: ["Satomi_leinuo", "Satomi_maosu", "Satomi_doumao"],
            Niko: ["Niko_fushu", "Niko_maosu"]
        },
        
        changeGeneral: async function(player, chars) {
            player.storage.Pleiades_current = chars;
            let skills = [];
            chars.forEach(c => {
                if (lib.skill.Pleiades_maosu.charSkills[c]) {
                    skills.addArray(lib.skill.Pleiades_maosu.charSkills[c]);
                }
            });
            player.addAdditionalSkills("Pleiades_maosu_skills", skills);

            if (chars.length === 1) {
                player.storage.Pleiades_maosu_current = [chars[0], "Michiru"];
            } else {
                player.storage.Pleiades_maosu_current = chars;
            }

            game.broadcastAll(function(player, chars) {
                const c1 = chars[0], c2 = chars[1];
                player.name1 = c1; 
                player.skin.name = c1;
                if(player.smoothAvatar) player.smoothAvatar(false);
                player.node.avatar.setBackground(c1, "character");
                player.node.name.innerHTML = get.slimName(c1);
                
                if (c2) {
                    player.name2 = c2; 
                    player.skin.name2 = c2;
                    if(player.smoothAvatar) player.smoothAvatar(true);
                    player.classList.add("fullskin2");
                    player.node.avatar2.classList.remove("hidden");
                    player.node.avatar2.setBackground(c2, "character");
                    player.node.name2.innerHTML = get.slimName(c2);
                } else {
                    delete player.name2; 
                    delete player.skin.name2;
                    player.classList.remove("fullskin2");
                    if(player.node.avatar2) player.node.avatar2.classList.add("hidden");
                    if(player.node.name2) player.node.name2.innerHTML = "";
                }
            }, player, chars);
            
            game.log(player, "亮出了昴宿牌", "#y" + chars.map(c => get.translation(c)).join("、"));
        }
    },
    "Pleiades_zhenxiang": {
        audio: "ext:魔法纪录/audio/skill:2",
        dutySkill: true,
        locked: true,
        trigger: { player: "phaseUseBegin" },
        forced: true,
        skillAnimation: true,
        animationColor: "fire",
        filter: function(event, player) {
            return !player.storage.Pleiades_zhenxiang_fired;
        },
        content: async function(event, trigger, player) {
            player.storage.Pleiades_zhenxiang_count = (player.storage.Pleiades_zhenxiang_count || 0) + 1;
            
            if (player.storage.Pleiades_zhenxiang_count === 2) {
                player.storage.Pleiades_zhenxiang_fired = true;
                player.awakenSkill("Pleiades_zhenxiang");
                game.log(player, "成功触发", "#r【真相】", "！");
                
                var targetRes = await player.chooseTarget("真相：请选择一名存活角色置入【朱贝】并复制其一张手牌", true, function(card, p, target) { 
                    return target.isAlive(); 
                }).forResult();
                
                if (targetRes.bool && targetRes.targets && targetRes.targets.length > 0) {
                    var target = targetRes.targets[0];
                    await target.equip(game.createCard2("Juubey", "diamond", 12));
                    
                    if (target.countCards("h") > 0) {
                        var cardRes = await target.chooseCard("h", 1, true, "复制手牌").forResult();
                        if (cardRes.bool && cardRes.cards && cardRes.cards.length > 0) {
                            var cardToCopy = cardRes.cards[0];
                            var cardx = game.createCard2(cardToCopy.name, cardToCopy.suit, cardToCopy.number, cardToCopy.nature);
                            await target.gain(cardx, "gain2");
                            target.addGaintag(cardx, "Michiru_copy");
                            target.addSkill("Michiru_copy_effect");
                        }
                    }
                }
            }
        }
    },

    "Pleiades_generic_timer_skill": {
        charlotte: true, trigger: { player: "phaseEnd" }, forced: true, silent: true,
        content: function(event, trigger, player) {
            if (player.storage.Pleiades_generic_timer > 0) {
                player.storage.Pleiades_generic_timer--;
                if (player.storage.Pleiades_generic_timer === 0) {
                    player.removeAdditionalSkills("Pleiades_jinnuan_generic");
                    player.removeSkill("Pleiades_generic_timer_skill");
                    game.log(player, "临时获得的昴宿通用技能已失效");
                }
            }
        }
    },
    
    "Pleiades_maosu_success": { 
    charlotte: true 
    },
	
    // 和纱美千留
    "Michiru_xiangxi": {
        audio: "ext:魔法纪录/audio/skill:2",
        group: ["Michiru_xiangxi_wuxie", "Michiru_xiangxi_juedou", "Michiru_xiangxi_tao", "Michiru_xiangxi_effect"],
        getX: function(player) {
            var useCount = player.getHistory("useCard", function(evt) {
                return ["Michiru_xiangxi_wuxie", "Michiru_xiangxi_juedou", "Michiru_xiangxi_tao"].includes(evt.skill);
            }).length;
            var respCount = player.getHistory("respond", function(evt) {
                return ["Michiru_xiangxi_wuxie", "Michiru_xiangxi_juedou", "Michiru_xiangxi_tao"].includes(evt.skill);
            }).length;
            return useCount + respCount;
        },
        hasEnoughCards: function(player, num, type) {
            var cards = player.getCards("he");
            var count = 0;
            for (var i = 0; i < cards.length; i++) {
                var t = get.type(cards[i], false);
                if (t === type || (type === "trick" && t === "delay")) count++;
            }
            return count >= num;
        },
        subSkill: {
            wuxie: {
                audio: "ext:魔法纪录/audio/skill:2",
                enable: ["chooseToRespond", "chooseToUse"],
                hiddenCard: function(player, name) {
                    if (name === "wuxie") {
                        var x = lib.skill.Michiru_xiangxi.getX(player);
                        return lib.skill.Michiru_xiangxi.hasEnoughCards(player, x + 1, "basic");
                    }
                    return false;
                },
                
                filterCard: function(card, player) {
                    return get.type(card, false) === "basic";
                },
                selectCard: function() { return lib.skill.Michiru_xiangxi.getX(_status.event.player) + 1; },
                position: "he",
                viewAs: { name: "wuxie" },
                prompt: function() {
                    var x = lib.skill.Michiru_xiangxi.getX(_status.event.player);
                    return "相系：请选择 " + (x + 1) + " 张基本牌视为【无懈可击】";
                },
                check: function(card) { return 6 - get.value(card); },
                filter: function(event, player) {
                    if (event.name === "phaseUse") return false;
                    if (event.filterCard({name:"wuxie"}, player, event)) {
                        var x = lib.skill.Michiru_xiangxi.getX(player);
                        return lib.skill.Michiru_xiangxi.hasEnoughCards(player, x + 1, "basic");
                    }
                    return false;
                }
            },
            juedou: {
                audio: "ext:魔法纪录/audio/skill:2",
                enable: "chooseToUse",
                hiddenCard: function(player, name) {
                    if (name === "juedou") {
                        var x = lib.skill.Michiru_xiangxi.getX(player);
                        return lib.skill.Michiru_xiangxi.hasEnoughCards(player, x + 1, "trick");
                    }
                    return false;
                },
                
                filterCard: function(card, player) {
                    var t = get.type(card, false);
                    return t === "trick" || t === "delay";
                },
                selectCard: function() { return lib.skill.Michiru_xiangxi.getX(_status.event.player) + 1; },
                position: "he",
                viewAs: { name: "juedou" },
                prompt: function() {
                    var x = lib.skill.Michiru_xiangxi.getX(_status.event.player);
                    return "相系：请选择 " + (x + 1) + " 张锦囊牌视为【决斗】";
                },
                check: function(card) { return 5 - get.value(card); },
                filter: function(event, player) {
                    if (event.filterCard({name:"juedou"}, player, event)) {
                        var x = lib.skill.Michiru_xiangxi.getX(player);
                        return lib.skill.Michiru_xiangxi.hasEnoughCards(player, x + 1, "trick");
                    }
                    return false;
                }
            },
            tao: {
                audio: "ext:魔法纪录/audio/skill:2",
                enable: ["chooseToUse", "chooseToRespond"],
                hiddenCard: function(player, name) {
                    if (name === "tao") {
                        var x = lib.skill.Michiru_xiangxi.getX(player);
                        return lib.skill.Michiru_xiangxi.hasEnoughCards(player, x + 1, "equip");
                    }
                    return false;
                },
                
                filterCard: function(card, player) {
                    return get.type(card, false) === "equip";
                },
                selectCard: function() { return lib.skill.Michiru_xiangxi.getX(_status.event.player) + 1; },
                position: "he",
                viewAs: { name: "tao" },
                prompt: function() {
                    var x = lib.skill.Michiru_xiangxi.getX(_status.event.player);
                    return "相系：请选择 " + (x + 1) + " 张装备牌视为【桃】";
                },
                check: function(card) { return 5 - get.value(card); },
                filter: function(event, player) {
                    if (event.name === "phaseUse" && player.hp >= player.maxHp) return false;
                    if (event.filterCard({name:"tao"}, player, event)) {
                        var x = lib.skill.Michiru_xiangxi.getX(player);
                        return lib.skill.Michiru_xiangxi.hasEnoughCards(player, x + 1, "equip");
                    }
                    return false;
                }
            },
            effect: {
                trigger: { player: ["useCard", "respond"] },
                forced: true, silent: true, charlotte: true,
                filter: function(event, player) {
                    return ["Michiru_xiangxi_wuxie", "Michiru_xiangxi_juedou", "Michiru_xiangxi_tao"].includes(event.skill);
                },
                content: function(event, trigger, player) {
                    player.addTempSkill("Michiru_xiangxi_damage", "phaseAfter");
                    player.addMark("Michiru_xiangxi_damage", 1, false);
                    if (trigger.targets && trigger.targets.length > 0) {
                        for (var i = 0; i < trigger.targets.length; i++) {
                            trigger.targets[i].addTempSkill("Michiru_xiangxi_damage", "phaseAfter");
                            trigger.targets[i].addMark("Michiru_xiangxi_damage", 1, false);
                        }
                        game.log(player, "与", trigger.targets, "本回合受到的伤害将", "#y+1");
                    } else {
                        game.log(player, "本回合受到的伤害将", "#y+1");
                    }
                }
            }
        }
    },

    "Michiru_xiangxi_damage": {
        charlotte: true,
        marktext: "死或饭",
        intro: {
            name: "死或饭",
            content: "本回合受到的伤害将 +#",
        },
        trigger: { player: "damageBegin" },
        forced: true,
        filter: function(event, player) { return player.countMark("Michiru_xiangxi_damage") > 0; },
        content: function(event, trigger, player) {
            var num = player.countMark("Michiru_xiangxi_damage");
            trigger.num += num;
            game.log(player, "因", "#g【相系】", "效果，受到的伤害增加了", "#y" + num + "点");
        },
        onremove: function(player) {
            player.removeMark("Michiru_xiangxi_damage", player.countMark("Michiru_xiangxi_damage"));
        }
    },
	//真相
    "Michiru_zhenxiang": {
        audio: "ext:魔法纪录/audio/skill:2",
        dutySkill: true,
        mark: true,
        intro: { content: "使命技，失败：死亡或销毁时置入【朱贝】并复制手牌。" },
        group: ["Michiru_zhenxiang_trigger"]
    },
   //真相触发器
    "Michiru_zhenxiang_trigger": {
        charlotte: true,
        trigger: { player: ["dieBegin", "Michiru_destroy_event"] },
        forced: true,
        filter: function(event, player) {
            return !player.storage.Michiru_zhenxiang_fired;
        },
        content: async function(event, trigger, player) {
            player.storage.Michiru_zhenxiang_fired = true;
            player.awakenSkill("Michiru_zhenxiang");
            
            var targetRes = await player.chooseTarget("真相：置入【朱贝】并复制手牌", true, function(card, p, target) { return target.isAlive(); }).forResult();
            
            if (targetRes.bool && targetRes.targets.length) {
                var target = targetRes.targets[0];
                await target.equip(game.createCard2("Juubey", "diamond", 12));
                
                if (target.countCards("h") > 0) {
                    var cardRes = await target.chooseCard("h", 1, true, "复制手牌").forResult();
                    if (cardRes.bool && cardRes.cards.length) {
                        var cardToCopy = cardRes.cards[0];
                        var cardx = game.createCard2(cardToCopy.name, cardToCopy.suit, cardToCopy.number, cardToCopy.nature);
                        await target.gain(cardx, "gain2");
                        target.addGaintag(cardx, "Michiru_copy");
                        target.addSkill("Michiru_copy_effect");
                    }
                }
            }
        }
    },
	// 真相复制牌
    "Michiru_copy_effect": {
        charlotte: true,
        trigger: { player: ["useCardAfter", "respondAfter", "loseAfter"] },
        forced: true,
        popup: false,
        mod: {
            aiValue: function(player, card, num) {
                if (num > 0 && get.itemtype(card) == "card" && card.hasGaintag("Michiru_copy")) return num * 2.5; 
            },
            aiUseful: function(player, card, num) {
                if (num > 0 && get.itemtype(card) == "card" && card.hasGaintag("Michiru_copy")) return Math.max(10, num * 5); 
            }
        },
        filter: function(event, player, name) {
            if (name == "loseAfter") {
                if (event.type == "use" || event.type == "respond") return false;
                if (event.gaintag_map) {
                    for (var i in event.gaintag_map) {
                        if (event.gaintag_map[i].includes("Michiru_copy")) return true;
                    }
                }
                return false;
            }
            return player.hasHistory("lose", function(evt) {
                if ((evt.relatedEvent || evt.getParent()) != event) return false;
                for (var i in evt.gaintag_map) {
                    if (evt.gaintag_map[i].includes("Michiru_copy")) {
                        if (event.cards && event.cards.some(card => get.position(card, true) == "o" && card.cardid == i)) return true;
                    }
                }
                return false;
            });
        },
        content: function() {
            "step 0"
            if (event.triggername == "loseAfter") {
                var count = 0;
                for (var i in trigger.gaintag_map) {
                    if (trigger.gaintag_map[i].includes("Michiru_copy")) {
                        var c = trigger.cards.find(card => card.cardid == i);
                        if (c && get.position(c) == "d") count++; 
                    }
                }
                if (count > 0) {
                    player.loseHp(count);
                    game.log(player, "弃置了真相的复制牌，流失了", count, "点体力");
                }
                event.finish(); return;
            }
            "step 1"
            var cards = [];
            player.getHistory("lose", function(evt) {
                if ((evt.relatedEvent || evt.getParent()) != trigger) return false;
                for (var i in evt.gaintag_map) {
                    if (evt.gaintag_map[i].includes("Michiru_copy")) {
                        var cardsx = trigger.cards.filter(card => get.position(card, true) == "o" && card.cardid == i);
                        if (cardsx.length) cards.addArray(cardsx);
                    }
                }
            });
            if (cards.length) {
                player.gain(cards, "gain2").gaintag.addArray(["Michiru_copy", "Michiru_copy_clear"]);
                player.addTempSkill("Michiru_copy_clear", "phaseJieshuEnd");
            }
        }
    },
    // 复制牌禁用
    "Michiru_copy_clear": {
        charlotte: true,
        filter: function() { return true; }, 
        onremove: function(player) { player.removeGaintag("Michiru_copy_clear"); },
        mod: {
            cardEnabled2: function(card, player) {
                var cards = card.cards ? Array.from(card.cards) : [];
                if (get.itemtype(card) == "card") cards.push(card);
                for (var cardx of cards) { if (cardx.hasGaintag("Michiru_copy_clear")) return false; }
            },
            cardRespondable: function(card, player) {
                var cards = card.cards ? Array.from(card.cards) : [];
                if (get.itemtype(card) == "card") cards.push(card);
                for (var cardx of cards) { if (cardx.hasGaintag("Michiru_copy_clear")) return false; }
            },
            cardSavable: function(card, player) {
                var cards = card.cards ? Array.from(card.cards) : [];
                if (get.itemtype(card) == "card") cards.push(card);
                for (var cardx of cards) { if (cardx.hasGaintag("Michiru_copy_clear")) return false; }
            }
        }
    },

    // 御崎海香
    "Umika_juebi": {
        audio: "ext:魔法纪录/audio/skill:2",
        group: ["Umika_juebi_count", "Umika_juebi_zhinang"],
        subSkill: {
            count: {
                trigger: { player: ["useCardAfter", "respondAfter"] },
                forced: true,
                popup: false,
                content: async function(event, trigger, player) {
                    player.storage.Umika_juebi_count = (player.storage.Umika_juebi_count || 0) + 1;
                    
                    if (player.storage.Umika_juebi_count >= 3) { 
                        player.storage.Umika_juebi_count = 0;
                        player.popup("绝笔");
                        game.log(player, "累计使用或打出了3张牌，触发了", "#g【绝笔】");
                        
                        var targetRes = await player.chooseTarget("绝笔：连接至多2名角色各一张手牌", [1, 2], function(card, player, target) {
                            return target.countCards("h") > 0;
                        }).set("ai", function(target) {
                            var player = _status.event.player;
                            var att = get.attitude(player, target);
                            if (att >= 0) return 0; 
                            
                            var val = -att; 
                            var handCount = target.countCards("h");
                            if (handCount <= 3) {
                                val += (4 - handCount) * 3; 
                            }
                            return val / (1 + target.countConnectedCards());
                        }).forResult();

                        if (targetRes.bool && targetRes.targets && targetRes.targets.length > 0) {
                            var connects = new Map();
                            for (var current of targetRes.targets.sortBySeat()) {
                                var cards2 = current.getCards("h");
                                if (!current.isIn() || !cards2.length) continue;
                                
                                var cardRes = cards2.length == 1 ? { links: cards2 } : await player.choosePlayerCard(current, "h", true).set("ai", function(button) {
                                    return Math.random(); 
                                }).forResult();

                                if (cardRes && cardRes.links && cardRes.links.length) {
                                    for(var c of cardRes.links) {
                                        c.addGaintag("Umika_connected");
                                    }
                                    connects.set(current, cardRes.links);
                                }
                            }
                            for (var [current, cards2] of connects) {
                                await current.connectCards(cards2);
                            }
                        }
                    }
                }
            },
            zhinang: {
                trigger: { global: "loseAfter" },
                forced: true,
                filter: function(event, player) {
                    if (event.type == "use" || event.type == "respond") return false;
                    if (event.gaintag_map) {
                        for (var i in event.gaintag_map) {
                            if (event.gaintag_map[i].includes("Umika_connected")) return true;
                        }
                    }
                    if (event.cards && event.cards.some(c => get.is.connectedCard(c) || c.isConnected)) return true;
                    return false;
                },
                content: async function(event, trigger, player) {
                    var zhinangs = ["wuzhong", "guohe", "wuxie"];
                    var zCard = game.createCard2(zhinangs.randomGet(), "spade", 1);
                    await player.gain(zCard, "gain2");
                    game.log(player, "因连接牌被非使用失去，获得了智囊牌", zCard);
                }
            }
        }
    },
    "Umika_maosu": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { global: "phaseJieshuBegin" },
        forced: true, 
        filter: function(event, player) {
            if (player.hasSkill("Pleiades_maosu")) {
                var partner = player.name1 === "Umika" ? player.name2 : player.name1;
                if (partner && !["Michiru", "Kaoru"].includes(partner)) return false;
            }
            var types = player.storage.Umika_maosu_types || [];
            return types.length > 0;
        },
        content: async function(event, trigger, player) {
            var types = player.storage.Umika_maosu_types || [];
            var count = types.length; 
            
            game.log(player, "本回合有", "#y" + count, "种类别的牌因其进入弃牌堆");
            await player.draw(count); 
        },
        group: ["Umika_maosu_track", "Umika_maosu_clear"], 
        subSkill: {
            track: {
                trigger: { global: ["discardAfter", "loseAfter"] },
                forced: true,
                silent: true,
                filter: function(event, player) {
                    if (!event.cards || !event.cards.length) return false;
                    var isOtherPlayer = (event.player && event.player !== player);
                    var causedByUmika = false;
                    if (event.source === player) causedByUmika = true;
                    else if (event.getParent() && event.getParent().player === player) causedByUmika = true;
                    var hasConnected = event.cards.some(c => c.hasGaintag("Umika_connected"));
                    return (isOtherPlayer && causedByUmika) || hasConnected;
                },
                content: function(event, trigger, player) {
                    var types = player.storage.Umika_maosu_types || [];
                    var changed = false;
                    for (var c of trigger.cards) {
                        if (get.position(c) === "d") {
                            var t = get.type(c);
                            if (!types.includes(t)) {
                                types.push(t);
                                changed = true;
                            }
                        }
                    }
                    if (changed) {
                        player.storage.Umika_maosu_types = types;
                    }
                }
            },
            clear: {
                trigger: { global: "phaseAfter" },
                forced: true,
                silent: true,
                content: function(event, trigger, player) {
                    delete player.storage.Umika_maosu_types; 
                }
            }
        }
    },
    
	// 牧薰
    "Kaoru_rexue": {
        audio: "ext:魔法纪录/audio/skill:2",
        group: ["Kaoru_rexue_passive", "Kaoru_rexue_clear", "Kaoru_rexue_gain", "Kaoru_Jiang"],
        trigger: { player: "useCard1" },
        filter: function(event, player) {
            if (player.hasSkill("Kaoru_rexue_banned")) return false;
            if (!event.targets || event.targets.length !== 1) return false;
            if (event.card && get.type(event.card) === "equip") return false;
            
            var targets = game.filterPlayer(current => current != player && get.distance(player, current) <= 1);
            return targets.length > 0;
        },
        cost: async function(event, trigger, player) {
            var res = await player.chooseBool("热血：是否消耗昂扬状态，与距离1以内的角色进行【逐鹿】？").set("ai", function() {
                var player = _status.event.player;
                var trigger = _status.event.getTrigger();
                var card = trigger.card;
                
                if (!card || player.countCards("h") === 0) return false;

                var targets = game.filterPlayer(current => current != player && get.distance(player, current) <= 1);
                var allies = 1; 
                var enemies = 0; 
                var hasLowHpEnemy = false; 

                for (var i = 0; i < targets.length; i++) {
                    var current = targets[i];
                    var att = get.attitude(player, current); 
                    if (att > 0) {
                        allies++;
                    } else if (att < 0) {
                        enemies++;
                        if (current.hp <= 1 || (current.hp === 2 && current.countCards('h') <= 2)) {
                            hasLowHpEnemy = true;
                        }
                    }
                }

                var isBeneficial = (get.tag(card, "recover") || get.tag(card, "draw") || card.name === "tao" || card.name === "wuzhong");
                var isAttack = (get.tag(card, "damage") || card.name === "sha" || card.name === "juedou");

                if (isBeneficial) {
                    if (hasLowHpEnemy) return false;
                    return allies > enemies;
                }

                if (isAttack) {
                    return enemies >= allies && enemies > 0;
                }

                return false; 
            }).forResult();

            if (res.bool) { event.result = { bool: true }; }
        },
        content: async function(event, trigger, player) {
            player.addSkill("Kaoru_rexue_banned"); 
            
            var targets = game.filterPlayer(current => current != player && get.distance(player, current) <= 1);
            
            if (player.hasSkill("Kaoru_rexue_distBuff")) {
                player.removeMark("Kaoru_rexue_distBuff", player.countMark("Kaoru_rexue_distBuff"));
                player.removeSkill("Kaoru_rexue_distBuff"); 
            }
            
            var result = await player.chooseToCompare(targets).setContent("chooseToCompareMeanwhile").forResult();
            
            if (result.winner) {
                var losers = targets.filter(t => t !== result.winner);
                var extraTargets = losers.filter(t => !trigger.targets.includes(t));
                if (extraTargets.length > 0) {
                    game.log(player, "将", extraTargets, "添加为了额外目标！");
                    trigger.targets.addArray(extraTargets);
                }
            }
        },
        subSkill: {
            passive: {
                trigger: { player: ["useCard", "respond"] },
                forced: true, locked: true, popup: false,
                filter: function(event, player) {
                    return !player.hasSkill("Kaoru_rexue_banned");
                },
                content: function(event, trigger, player) {
                    player.addSkill("Kaoru_rexue_distBuff"); 
                    player.addMark("Kaoru_rexue_distBuff", 1, false);
                }
            },
            clear: {
                trigger: { global: "phaseEnd" },
                forced: true, silent: true, charlotte: true,
                content: function(event, trigger, player) {
                    if (player.hasSkill("Kaoru_rexue_distBuff")) {
                        player.removeMark("Kaoru_rexue_distBuff", player.countMark("Kaoru_rexue_distBuff"));
                        player.removeSkill("Kaoru_rexue_distBuff");
                    }
                }
            },
            distBuff: {
                charlotte: true, mark: true,
                intro: { 
                    content: function(storage, player) {
                        return "本回合计算与其他角色的距离 <span style='color:red'><b>-" + player.countMark("Kaoru_rexue_distBuff") + "</b></span>";
                    }
                },
                mod: { globalFrom: function(from, to, distance) { return distance - from.countMark("Kaoru_rexue_distBuff"); } }
            },
            banned: { 
                charlotte: true, mark: true, 
                intro: { content: "昂扬技已消耗，距离加成失效，等待【激昂】重置。" } 
            },
            gain: {
                trigger: { global: "chooseToCompareAfter" },
                forced: true, silent: true,
                filter: function(event, player) {
                    if (event.parent.name !== "Kaoru_rexue") return false;
                    if (event.preserve) return false;
                    
                    if (!event.lose_list || !Array.isArray(event.lose_list)) return false;
                    
                    for (var i of event.lose_list) {
                        if (!i || !i[1]) continue; 
                        var items = Array.isArray(i[1]) ? i[1] : [i[1]];
                        for (var j of items) {
                            if (get.position(j, true) === "o") return true;
                        }
                    }
                    return false;
                },
                content: async function(event, trigger, player) {
                    const cards2 = [];
                    let min = 100; 
                    
                    if (!trigger.lose_list || !Array.isArray(trigger.lose_list)) return;
                    
                    for (const entry of trigger.lose_list) {
                        if (!entry || !entry[1]) continue;
                        const owner = entry[0];
                        const item = entry[1];
                        const items = Array.isArray(item) ? item : [item];
                        
                        for (const j of items) {
                            if (get.position(j, true) === "o") {
                                const num = get.number(j, owner);
                                if (num > 0) { 
                                    if (num < min) {
                                        cards2.length = 0;
                                        min = num;
                                    }
                                    if (num === min) {
                                        cards2.push(j);
                                    }
                                }
                            }
                        }
                    }
                    
                    if (cards2.length) {
                        game.log(player, "获得了点数最小的拼点牌");
                        await player.gain(cards2, "gain2");
                    }
                }
            }
        }
    },
    "Kaoru_Jiang": {
        audio: "ext:魔法纪录/audio/skill:2",
        group: ["Kaoru_Jiang_init", "Kaoru_Jiang_rangeMonitor"],
        trigger: { player: ["useCardAfter", "respondAfter"] },
        forced: true, locked: true, silent: true,
        content: function(event, trigger, player) {
            var triggered = false;

            if (event.player === player) {
                player.addSkill("Kaoru_Jiang_count");
                player.addMark("Kaoru_Jiang_count", 1, false);
                if (player.countMark("Kaoru_Jiang_count") >= 3) {
                    triggered = true;
                    player.removeMark("Kaoru_Jiang_count", player.countMark("Kaoru_Jiang_count")); 
                }
            }

            if (triggered && player.hasSkill("Kaoru_rexue_banned")) {
                game.log(player, "满足了", "#g【激昂】", "的条件（累计使用/打出三张牌）");
                player.removeSkill("Kaoru_rexue_banned"); 
                game.log(player, "昂扬技", "#y【热血】", "已重置！");
                player.popup("激昂");
            }
        },
        subSkill: {
            init: {
                trigger: { global: "gameStart", player: ["enterGame", "gainSkill:Kaoru_rexue"] },
                forced: true, silent: true,
                content: function(event, trigger, player) {
                    player.addSkill("Kaoru_Jiang_count");
                    var newRange = [];
                    var others = game.filterPlayer(current => current != player);
                    for (var p of others) { if (player.inRange(p)) newRange.push(p.name || p.id); }
                    player.storage.Kaoru_inRange = newRange;
                }
            },
            rangeMonitor: {
                trigger: { global: ["equipAfter", "loseAfter", "gainAfter", "phaseBefore", "phaseAfter"] },
                forced: true, locked: true, silent: true,
                content: function(event, trigger, player) {
                    var oldRange = player.storage.Kaoru_inRange || [];
                    var newRange = [];
                    var entered = false;
                    
                    var others = game.filterPlayer(current => current != player);
                    for (var p of others) {
                        if (player.inRange(p)) {
                            newRange.push(p.name || p.id);
                            if (!oldRange.includes(p.name || p.id)) entered = true;
                        }
                    }
                    player.storage.Kaoru_inRange = newRange;

                    if (entered && player.hasSkill("Kaoru_rexue_banned")) {
                        game.log(player, "满足了", "#g【激昂】", "的条件（有角色进入攻击范围）");
                        player.removeSkill("Kaoru_rexue_banned");
                        game.log(player, "昂扬技", "#y【热血】", "已重置！");
                        player.popup("激昂");
                    }
                }
            },
            count: {
                charlotte: true, mark: true,
                intro: {
                    content: function(storage, player) {
                        return "当前已累计使用/打出 <span style='color:orange'><b>" + player.countMark("Kaoru_Jiang_count") + " / 3</b></span> 张牌。<br>（满 3 张将重置【待旦】状态）";
                    }
                }
            }
        }
    },
    "Kaoru_maosu": {
        audio: "ext:魔法纪录/audio/skill:2",
        group: ["Kaoru_maosu_monitor"],
        trigger: { global: "phaseEnd" },
        filter: function(event, player) {
            if (player.hasSkill("Pleiades_maosu")) {
                var partner = player.name1 === "Kaoru" ? player.name2 : player.name1;
                if (partner && !["Michiru", "Umika"].includes(partner)) return false;
            }
            if (!player.hasSkill("Kaoru_maosu_changed")) return false;
            var others = game.filterPlayer(current => current != player);
            if (others.length === 0) return false;
            return others.every(current => player.inRange(current));
        },
        cost: async function(event, trigger, player) {
            var list = [
                ["基本", "", "sha"], ["基本", "", "sha", "fire"], ["基本", "", "sha", "thunder"],
                ["基本", "", "shan"], ["基本", "", "tao"], ["基本", "", "jiu"]
            ];
            var res = await player.chooseButton(["昴宿：是否视为使用一张任意基本牌（不可被响应）？", [list, "vcard"]]).set("ai", function(button) {
                var card = { name: button.link[2], nature: button.link[3], isCard: true };
                return _status.event.player.getUseValue(card);
            }).forResult();
            if (res && res.links && res.links.length > 0) {
                event.result = { bool: true, cost_data: res.links[0] };
            }
        },
        content: async function(event, trigger, player) {
            var link = event.cost_data;
            var card = get.autoViewAs({ name: link[2], nature: link[3], isCard: true });
            player.addTempSkill("Kaoru_maosu_unrespondable", "useCardAfter");
            await player.chooseUseTarget(card, true);
        },
        subSkill: {
            monitor: {
                trigger: {
                    global: ["equipAfter", "loseAfter", "gainAfter", "phaseBefore"],
                    player: ["addMarkAfter", "removeMarkAfter"]
                },
                forced: true, silent: true, charlotte: true,
                filter: function(event, player) {
                    if (event.name === "phase") return true; 
                    if (event.name === "addMark" || event.name === "removeMark") {
                        return event.markname === "Kaoru_rexue_distBuff";
                    }
                    if (event.cards) {
                        for (var i = 0; i < event.cards.length; i++) {
                            if (get.type(event.cards[i]) === "equip") return true;
                        }
                    }
                    return false;
                },
                content: function(event, trigger, player) {
                    if (event.name === "phase") {
                        player.removeSkill("Kaoru_maosu_changed");
                    } else {
                        player.addTempSkill("Kaoru_maosu_changed");
                    }
                }
            },
            changed: { charlotte: true },
            unrespondable: {
                trigger: { player: "useCard" },
                forced: true, silent: true, charlotte: true,
                filter: function(event, player) { return true; },
                content: function(event, trigger, player) {
                    trigger.directHit.addArray(game.players);
                    game.log(trigger.card, "不可被响应");
                    player.removeSkill("Kaoru_maosu_unrespondable"); 
                }
            }
        }
    },

    // 浅海早纪
    "Saki_zhishu": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        manualConfirm: true, 
        multitarget: true, 
        multiline: true,
        group: ["Saki_zhishu_strike"],
        filter: function(event, player) {
            return player.countCards("h") > 0 && player.getHandcardLimit() > 0;
        },
        selectTarget: function() {
            return [1, Math.max(1, _status.event.player.getHandcardLimit())];
        },
        filterTarget: function(card, player, target) {
            return target.countCards("h") > 0;
        },
        ai: {
            order: 6,
            result: {
                target: function(player, target) {
                    // 优先带队友玩，不带敌人议事
                    return get.attitude(player, target) > 0 ? 1 : 0;
                }
            }
        },
        content: async function(event, trigger, player) {
            var targets = event.targets.slice();
            if (!targets.includes(player)) targets.push(player);

            await player.chooseToDebate(targets)
            .set("debateTargets", targets) 
            .set("aiCard", function(target) {
                var debateTargets = _status.event.debateTargets || [];
                
                // ai逻辑（疑似不生效）
                var guessColor = function(p) {
                    if (p.countCards("h") < 2) return "black";
                    if (p.hasCard(function(c) { return c.name === 'tao' || c.name === 'jiu'; }, "h")) return "black";
                    if (p.hp === 1) return "red";
                    if (p.hp === 2 && p.countCards("h") <= 2) return "red";
                    return "black";
                };

                var myColor = guessColor(target);

                var friends = debateTargets.filter(function(p) { return get.attitude(target, p) > 0; });
                var blackVotes = 0, redVotes = 0;
                for (var i = 0; i < friends.length; i++) {
                    if (guessColor(friends[i]) === "black") blackVotes++;
                    else redVotes++;
                }

                if (blackVotes > redVotes) {
                    myColor = "black";
                } else if (redVotes > blackVotes && target.countCards("h") >= 2) {
                    myColor = "red";
                }

                if (target.countCards("h") < 2) myColor = "black";

                var cards = target.getCards("h", { color: myColor });
                if (!cards.length) cards = target.getCards("h"); 
                cards.sort(function(a, b) { return get.value(a) - get.value(b); });

                return { bool: true, cards: [cards[0]] };
            })
            .set("callback", async (cbEvent, cbTrigger, cbPlayer) => {
                try {
                    const result = cbEvent.debateResult || {};
                    if (!result.bool || !result.opinion) {
                        game.log("议事被取消或无结果。");
                        return;
                    }

                    const invoker = player;
                    const opinion = result.opinion;
                    const debateTargets = cbEvent.targets || result.targets || [];
                    const redPlayers = (result.red || []).map(i => i[0]);
                    const blackPlayers = (result.black || []).map(i => i[0]);

                    if (opinion === "black") {
                        game.log("议事结果为", "#b黑色", "！");
                        for (const t of blackPlayers.sortBySeat()) {
                            await t.draw(2);
                            await t.damage(1, "thunder", invoker);
                        }
                    } else if (opinion === "red") {
                        game.log("议事结果为", "#r红色", "！");
                        for (const t of redPlayers.sortBySeat()) {
                            if (t.countCards("h") >= 2) {
                                const discardRes = await t.chooseToDiscard(
                                    "h", 2, "执霆：请弃置两张手牌以回复1点体力", true
                                ).forResult();
                                if (discardRes.bool) await t.recover(1);
                            } else {
                                game.log(t, "手牌不足2张，无法执行弃牌回血");
                            }
                        }
                    } else {
                        game.log("议事结果平局，无事发生。");
                    }

                    if (debateTargets.length > 0) {
                        const allRed = debateTargets.every(tgt => redPlayers.includes(tgt));
                        const allBlack = debateTargets.every(tgt => blackPlayers.includes(tgt));
                        
                        if (allRed || allBlack) {
                            game.log("所有参与者意见一致！获得护甲！");
                            for (const t of debateTargets) {
                                if ((t.hujia || 0) < 5) await t.changeHujia(1);
                                else game.log(t, "护甲已达上限(5点)");
                            }
                        }
                    }
                } catch (err) {
                    console.error("执霆结算遇到系统底层拦截，已静默处理:", err);
                }
            });
        },
        subSkill: {
            strike: {
                audio: "ext:魔法纪录/audio/skill:2",
                trigger: { global: "chooseToDebateAfter" },
                filter: function(event, player) {
                    if (!event.targets || !event.targets.includes(player)) return false;
                    if (!player.hujia || player.hujia <= 0) return false;
                    return game.hasPlayer(current => !event.targets.includes(current));
                },
                cost: async function(event, trigger, player) {
                    var nonParticipants = game.filterPlayer(current => !trigger.targets.includes(current));
                    event.result = await player.chooseTarget(
                        "执霆：你可以对一名未参与议事的角色造成1点雷电伤害",
                        function(card, p, target) {
                            return _status.event.nonParticipants.includes(target);
                        }
                    )
                    .set("nonParticipants", nonParticipants)
                    .set("ai", function(target) {
                        return get.damageEffect(target, _status.event.player, _status.event.player, "thunder");
                    })
                    .forResult();
                },
                content: async function(event, trigger, player) {
                    if (event.targets && event.targets.length > 0) {
                        var target = event.targets[0];
                        player.line(target, "thunder");
                        await target.damage(1, "thunder", player);
                    }
                }
            }
        }
    },
    "Saki_maosu": {
        audio: "ext:魔法纪录/audio/skill:2",
        mark: true,
        intro: {
            content: "当前累计获得/交出牌的进度：# / 4",
        },
        onremove: function(player) {
            delete player.storage.Saki_maosu;
        },
        group: ["Saki_maosu_handcard", "Saki_maosu_hpTracker"],
        trigger: { global: "damageAfter" },
        usable: 2,
        filter: function(event, player) {
            if (player.hasSkill("Pleiades_maosu")) {
                var partner = player.name1 === "Saki" ? player.name2 : player.name1;
                if (partner && !["Michiru", "Mirai"].includes(partner)) return false;
            }
            if (event.nature === "thunder") return true;
            if (event.num === 0) return true; 
            if (event.Saki_hpBefore !== undefined && event.player && event.player.hp >= event.Saki_hpBefore) {
                return true;
            }
            return false;
        },
        content: async function(event, trigger, player) {
            try {
                var res = await player.chooseCardTarget({
                    prompt: "昴宿：你可以交给一名其他角色一张牌并摸一张牌。若为装备牌，其可以使用之",
                    filterCard: function(card) { return true; },
                    filterTarget: function(card, player, target) { return target !== player; },
                    position: "he",
                    ai1: function(card) {
                        if (get.type(card) === "equip") return 8; 
                        return 7 - get.value(card); 
                    },
                    ai2: function(target) { return get.attitude(_status.event.player, target); }
                }).forResult();
                
                if (res.bool && res.targets && res.targets.length > 0) {
                    var target = res.targets[0];
                    var card = res.cards[0];
                    
                    await player.give(card, target, "give");
                    await game.delay(); 
                    await player.draw(1);
                    
                    player.storage.Saki_maosu = (player.storage.Saki_maosu || 0) + 2;
                    
                    if (player.storage.Saki_maosu >= 4) {
                        player.storage.Saki_maosu -= 4; 
                        if ((player.hujia || 0) < 5) {
                            await player.changeHujia(1);
                            game.log(player, "累计交出/获得四张牌，获得了", "#g1点护甲");
                        } else {
                            game.log(player, "累计交出/获得四张牌，但护甲已达上限(5点)");
                        }
                    } else {
                        game.log(player, "当前获得护甲的进度为", "#y" + player.storage.Saki_maosu + " / 4");
                    }
                    
                    player.markSkill("Saki_maosu"); 
                    
                    if (target.getCards("h").includes(card) && get.type(card) === "equip") {
                        await target.chooseUseTarget(card); 
                    }
                }
            } catch (err) {
                console.error("昴宿结算遇到系统底层拦截，已静默处理:", err);
            }
        },
        subSkill: {
            handcard: {
                charlotte: true,
                mod: {
                    maxHandcard: function(player, num) {
                        return num + (player.hujia || 0);
                    }
                }
            },
            hpTracker: {
                trigger: { global: "damageBegin" },
                forced: true, silent: true, charlotte: true,
                filter: function(event, player) { return true; },
                content: function(event, trigger, player) {
                    if (trigger.player) {
                        trigger.Saki_hpBefore = trigger.player.hp;
                    }
                }
            }
        }
    },

	// 宇佐木里美
    "Satomi_leinuo": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { global: "phaseZhunbeiBegin" },
        filter: function(event, player) {
            return !player.hasSkill("Satomi_leinuo_round") && event.player != player;
        },
        content: async function(event, trigger, player) {
            player.addTempSkill("Satomi_leinuo_round", "roundStart");
            var target = trigger.player;

            var res1 = await player.chooseControl("擂进", "变阵", "鸣止", "取消").set("prompt", "幽儡：令 " + get.translation(target) + " 弃置两张牌或执行【整肃】").set("ai", function() {
                var player = _status.event.player;
                var target = _status.event.getTrigger().player;
                var att = get.attitude(player, target);
                var h = target.countCards("h");
                
                if (att < 0) { 
                    if (h <= 4) {
                        if (h < target.hp) return "鸣止"; 
                        if (h <= 3) return ["变阵", "擂进"].randomGet(); 
                        return ["擂进", "变阵", "鸣止"].randomGet();
                    }
                    return Math.random() < 0.4 ? ["擂进", "变阵", "鸣止"].randomGet() : "取消";
                } else if (att > 0) { 
                    if (h > 4 && Math.random() < 0.3) {
                        return ["擂进", "变阵"].randomGet(); 
                    }
                    return "取消";
                }
                return "取消";
            }).forResult();

            if (res1.control && res1.control !== "取消") {
                var secret = res1.control;
                game.log(player, "令", target, "选择弃置两张牌或执行", "#y【" + secret + "】");

                var choices = ["执行整肃"];
                if (target.countCards("he") >= 2) choices.unshift("弃置两张牌");

                var res2 = await target.chooseControl(choices).set("prompt", "幽儡：请选择弃置两张牌，或本回合强制执行【" + secret + "】").set("ai", function() {
                    var player = _status.event.player;
                    if (_status.event.choices.includes("弃置两张牌")) {
                        if (player.countCards("he") >= 4) return "弃置两张牌"; 
                        var att = get.attitude(player, _status.event.source); 
                        if (att > 0) return "执行整肃";
                    }
                    return "执行整肃";
                }).set("source", player).set("choices", choices).forResult();

                if (res2.control === "弃置两张牌") {
                    await target.chooseToDiscard(2, "he", true).set("prompt", "幽儡：请弃置两张牌");
                } else {
                    game.log(target, "本回合被强制执行", "#y【" + secret + "】", "（每次违反流失体力，回合末清算）");
                    var zhengsuMap = { "擂进": "zhengsu_leijin", "变阵": "zhengsu_bianzhen", "鸣止": "zhengsu_mingzhi" };
                    target.addTempSkill(zhengsuMap[secret], "phaseAfter");
                    target.addTempSkill("Satomi_leinuo_monitor", "phaseAfter"); 
                    target.storage.Satomi_leinuo_failed = false; 
                }
            }
        },
        subSkill: {
            round: { charlotte: true },
            monitor: { 
                trigger: { player: ["useCardAfter", "discardAfter", "phaseUseEnd", "phaseDiscardEnd"] },
                forced: true, charlotte: true, popup: false,
                content: async function(event, trigger, player) {
                    var zhengsuType = null;
                    if (player.hasSkill("zhengsu_leijin")) zhengsuType = "擂进";
                    else if (player.hasSkill("zhengsu_bianzhen")) zhengsuType = "变阵";
                    else if (player.hasSkill("zhengsu_mingzhi")) zhengsuType = "鸣止";
                    if (!zhengsuType) return;

                    var violated = false;
                    var isCountCheck = false; 
                    
                    var useHistory = player.getHistory("use") || [];
                    var discardHistory = player.getHistory("discard") || [];

                    if (event.triggername === "useCardAfter" && _status.currentPhase === "phaseUse") {
                        if (useHistory.length > 1) {
                            var currentCard = trigger.card;
                            if (!currentCard) return;
                            
                            if (zhengsuType === "擂进") {
                                var currNum = get.number(currentCard); 
                                if (currNum > 0) {
                                    var lastNum = 0;
                                    for (var i = useHistory.length - 2; i >= 0; i--) {
                                        var prevCard = useHistory[i].card;
                                        if (prevCard && get.number(prevCard) > 0) { lastNum = get.number(prevCard); break; }
                                    }
                                    if (lastNum > 0 && currNum <= lastNum) violated = true;
                                }
                            } else if (zhengsuType === "变阵") {
                                var currSuit = get.suit(currentCard); 
                                if (currSuit !== "none") {
                                    var firstSuit = "none";
                                    for (var i = 0; i < useHistory.length - 1; i++) {
                                        var prevCard = useHistory[i].card;
                                        if (prevCard && get.suit(prevCard) !== "none") { firstSuit = get.suit(prevCard); break; }
                                    }
                                    if (firstSuit !== "none" && currSuit !== firstSuit) violated = true;
                                }
                            }
                        }
                    } 
                    else if (event.triggername === "discardAfter" && _status.currentPhase === "phaseDiscard") {
                        if (zhengsuType === "鸣止") {
                            var allSuits = [];
                            for (var i = 0; i < discardHistory.length; i++) {
                                var evt = discardHistory[i];
                                if (evt.cards) {
                                    for (var j = 0; j < evt.cards.length; j++) {
                                        var suit = get.suit(evt.cards[j]); 
                                        if (suit !== "none") {
                                            if (allSuits.includes(suit)) { violated = true; break; }
                                            allSuits.push(suit);
                                        }
                                    }
                                }
                            }
                        }
                    } 
                    else if (event.triggername === "phaseUseEnd") {
                        if (zhengsuType === "擂进" && useHistory.length < 3) { violated = true; isCountCheck = true; }
                        else if (zhengsuType === "变阵" && useHistory.length < 2) { violated = true; isCountCheck = true; }
                    } else if (event.triggername === "phaseDiscardEnd") {
                        if (zhengsuType === "鸣止") {
                            var discardCount = 0;
                            for (var i = 0; i < discardHistory.length; i++) {
                                if (discardHistory[i].cards) discardCount += discardHistory[i].cards.length;
                            }
                            if (discardCount < 2) { violated = true; isCountCheck = true; }
                        }
                    }

                    if (violated) {
                        player.storage.Satomi_leinuo_failed = true; 
                        if (!isCountCheck && trigger.Satomi_leinuo_punished) return;
                        if (!isCountCheck) trigger.Satomi_leinuo_punished = true;

                        if (!isCountCheck) { 
                            game.log(player, "违反了", "#y【" + zhengsuType + "】", "的指令约束");
                            await player.loseHp(1); 
                        }
                    }

                    if (event.triggername === "phaseDiscardEnd") {
                        if (player.storage.Satomi_leinuo_failed) {
                            game.log(player, "未能完成整肃约束，回合末额外流失 1 点体力");
                            await player.loseHp(1);
                        } else {
                            var reward = await player.chooseControl("摸两张牌", "回复一点体力").set("prompt", "幽儡：整肃成功！请选择奖励").set("ai", function() {
                                if (_status.event.player.isDamaged() && _status.event.player.hp <= 2) return "回复一点体力";
                                return "摸两张牌";
                            }).forResult();
                            if (reward.control === "摸两张牌") await player.draw(2);
                            else await player.recover(1);
                        }
                        delete player.storage.Satomi_leinuo_failed;
                    }
                }
            }
        }
    },
    "Satomi_maosu": {
        audio: "ext:魔法纪录/audio/skill:2",
        group: ["Satomi_maosu_doumao_reset", "Satomi_maosu_collect", "Satomi_maosu_init"],
        trigger: { player: "damageBegin4", source: "damageBegin1" },
        filter: function(event, player) {
            if (player.hasSkill("Pleiades_maosu")) {
                var partner = player.name1 === "Satomi" ? player.name2 : player.name1;
                if (partner && !["Michiru"].includes(partner)) return false;
            }
            return true;
        },
        cost: async function(event, trigger, player) {
            var isDealing = (event.triggername === "damageBegin1");
            var target = isDealing ? trigger.player : player;
            var dmgCard = trigger.card;
            var dmgSuit = (dmgCard && dmgCard.suit && dmgCard.suit !== "none") ? dmgCard.suit : null;
            var promptStr = "";
            if (isDealing) {
                if (player.countCards("h") === 0) return false;
                promptStr = "昴宿：是否将一张手牌进行【蓄谋】，令对 " + get.translation(target) + " 的伤害+1？";
            } else {
                if (!dmgSuit) return false; 
                var validCards = player.getCards("j").filter(c => get.suit(c) === dmgSuit || c.suit === dmgSuit);
                if (validCards.length === 0) return false; 
                promptStr = "昴宿：是否自动移除判定区一张花色为 【" + get.translation(dmgSuit) + "】 的牌，令受到的伤害-1？";
            }
            var res = await player.chooseBool(promptStr).set("ai", function() {
                var player = _status.event.player;
                if (_status.event.isDealing) return get.attitude(player, _status.event.target) < 0;
                return true; 
            }).set("isDealing", isDealing).set("target", target).forResult();
            if (res.bool) event.result = { bool: true };
            else event.cancel();
        },
        content: async function(event, trigger, player) {
            var isDealing = (event.triggername === "damageBegin1");
            var dmgCard = trigger.card;
            var dmgSuit = (dmgCard && dmgCard.suit && dmgCard.suit !== "none") ? dmgCard.suit : null;
            var costPaid = false;
            if (isDealing) {
                var next = player.chooseCard(1, true);
                next.set("position", "h");
                next.set("prompt", "昴宿：请选择一张手牌进行【蓄谋】");
                next.set("ai", function(card) {
                    var player = _status.event.player;
                    var judgeCards = player.getCards("j");
                    var existingSuits = judgeCards.map(c => get.suit(c));
                    var missingSuitBonus = existingSuits.includes(get.suit(card)) ? 0 : 20; 
                    return missingSuitBonus + 10 - get.value(card);
                });
                var cardRes = await next.forResult();
                
                if (cardRes.bool && cardRes.cards && cardRes.cards.length > 0) {
                    await player.addJudge({ name: "xumou_jsrg" }, [cardRes.cards[0]]);
                    costPaid = true;
                }
            } else {
                var validCards = player.getCards("j").filter(c => get.suit(c) === dmgSuit || c.suit === dmgSuit);
                if (validCards.length > 0) {
                    var cardToDiscard = validCards.randomGet(); 
                    await player.discard(cardToDiscard); 
                    costPaid = true;
                    game.log(player, "自动移除了判定区的", cardToDiscard);
                }
            }
            if (costPaid) {
                var oldNum = trigger.num;
                if (isDealing) trigger.num++;
                else trigger.num = Math.max(0, trigger.num - 1);
                game.log(player, "将此伤害由", oldNum, "修改为了", "#r" + trigger.num);
            }
        },
        subSkill: {
            init: {
                trigger: { global: "gameStart" },
                forced: true, silent: true,
                content: function(event, trigger, player) { player.addSkill("Satomi_doumao"); } 
            },
            doumao_reset: {
                trigger: { player: "addSkillAfter" },
                forced: true, silent: true,
                filter: function(event, player) { 
                    return event.skill === "Satomi_doumao" || event.skill === "minidoumao"; 
                },
                content: function(event, trigger, player) {
                    if (player.hasSkill("Satomi_leinuo_round")) {
                        player.removeSkill("Satomi_leinuo_round");
                        game.log(player, "获得了", "#y【逗猫】", "，重置了", "#g【幽儡】");
                    }
                }
            },
            collect: {
                trigger: { global: "phaseUseBegin" },
                filter: function(event, player) {
                    var target = event.player;
                    var history = target.getHistory("lose");
                    if (!history || history.length === 0) return false;
                    for (var i = 0; i < history.length; i++) {
                        var evt = history[i];
                        var parent = evt.getParent();
                        if (parent && (parent.name === "discard" || parent.name === "chooseToDiscard" || parent.name === "Satomi_doumao")) {
                            if (evt.cards) {
                                for (var j = 0; j < evt.cards.length; j++) { if (get.position(evt.cards[j]) === "d") return true; }
                            }
                        }
                    }
                    return false;
                },
                content: async function(event, trigger, player) {
                    var target = trigger.player;
                    var res = await player.chooseBool("昴宿：是否令 " + get.translation(target) + " 摸一张牌，并截获其本回合前弃置的牌作为【蓄谋】牌？").set("ai", function() {
                        var player = _status.event.player;
                        var target = _status.event.target;
                        if (get.attitude(player, target) > 0) return true; 
                        var history = target.getHistory("lose");
                        var validCards = [];
                        for (var i = 0; i < history.length; i++) {
                            var evt = history[i];
                            var parent = evt.getParent();
                            if (parent && (parent.name === "discard" || parent.name === "chooseToDiscard" || parent.name === "Satomi_doumao")) {
                                if (evt.cards) {
                                    for (var j = 0; j < evt.cards.length; j++) {
                                        if (get.position(evt.cards[j]) === "d") validCards.push(evt.cards[j]);
                                    }
                                }
                            }
                        }
                        if (validCards.length > 2) return true; 
                        if (validCards.length > 0) {
                            var totalValue = 0;
                            for (var c of validCards) totalValue += get.value(c);
                            if (totalValue < 4) return false; 
                            return true;
                        }
                        return false;
                    }).set("target", target).forResult();
                    if (res.bool) {
                        game.log(player, "发动了", "#y【昴宿】");
                        await target.draw();
                        var history = target.getHistory("lose");
                        var cardsToXumou = [];
                        for (var i = 0; i < history.length; i++) {
                            var evt = history[i];
                            var parent = evt.getParent();
                            if (parent && (parent.name === "discard" || parent.name === "chooseToDiscard" || parent.name === "Satomi_doumao")) {
                                if (evt.cards) {
                                    for (var j = 0; j < evt.cards.length; j++) {
                                        var c = evt.cards[j];
                                        if (get.position(c) === "d" && !cardsToXumou.includes(c)) cardsToXumou.push(c);
                                    }
                                }
                            }
                        }
                        if (cardsToXumou.length > 0) {
                            game.log(player, "将", cardsToXumou, "截获并依次置入了判定区作为", "#g【蓄谋】");
                            for (var c of cardsToXumou) await player.addJudge({ name: "xumou_jsrg" }, [c]);
                        }
                    }
                }
            }
        }
    },
    "Satomi_doumao": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: ["phaseBegin", "phaseEnd"] },
        filter: function(event, player) { return player.countCards('he') > 0; },
        cost: async function(event, trigger, player) {
            if (event.triggername == 'phaseEnd') {
                event.result = { bool: true };
            } else {
                event.result = await player.chooseCardTarget({
                    prompt: "逗猫：弃置一张牌，失去【逗猫】并令一名其他角色获得【逗猫】，然后其摸一张牌",
                    filterTarget: lib.filter.notMe,
                    filterCard: lib.filter.cardDiscardable,
                    position: 'he',
                    ai1: function(card) { return 7 - get.value(card); },
                    ai2: function(target) {
                        var player = _status.event.player;
                        var att = get.attitude(player, target);
                        if (att > 0) {
                            return 10 + att; 
                        } else {
                            if (target.hp <= 2 || target.countCards("h") <= 2) {
                                return 6; 
                            }
                            return -1; 
                        }
                    }
                }).forResult();
            }
        },
        content: async function(event, trigger, player) {
            if (event.triggername == 'phaseBegin') {
                var cards = event.cards;
                var target = event.targets[0];
                await player.discard(cards);
                player.removeSkill("Satomi_doumao");
                target.addSkill("Satomi_doumao");
                await target.draw();
            } else if (player.countCards('he') > 0) {
                await player.chooseToDiscard(1, true, 'he').set("prompt", "逗猫：回合结束，必须弃置一张牌");
            }
        },
        mark: true,
        marktext: "猫",
        intro: { content: "嘿！有只猫在你身边欸！" }
    },

	// 若叶未来
	"Mirai_nieai": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { global: "phaseBegin" },
        filter: function(event, player) {
            return !player.hasSkill("Mirai_nieai_round") && event.player != player;
        },
        cost: async function(event, trigger, player) {
            var target = trigger.player; 
            var res = await player.chooseBool("孽爱：是否与 " + get.translation(target) + " 进行一次【协力】？").set("ai", function() {
                var player = _status.event.player;
                var target = _status.event.getTrigger().player;
                var att = get.attitude(player, target);
                
                if (player.hasSkill("Mirai_maosu_disable")) {
                    if (att > 0 && target.countCards("h") >= 4) return true; 
                }
                
                if (att < 0) {
                    if (player.hp <= 2 && player.countCards("h") <= 2 && target.hp > 1) {
                        return false; 
                    }
                    return true;
                }
                return false;
            }).forResult();
            
            if (res.bool) event.result = { bool: true }; 
            else event.cancel();
        },
        content: async function(event, trigger, player) {
            player.addTempSkill("Mirai_nieai_round", "roundStart"); 
            var target = trigger.player;
            
            player.storage.Mirai_nieai_active_target = target;
            
            await player.chooseCooperationFor(target, "Mirai_nieai").set("ai", function(button) {
                var player = _status.event.player;
                var target = player.storage.Mirai_nieai_active_target;
                var att = get.attitude(player, target);
                var base = 0;
                
                if (att > 0) {
                    if (button.link === "cooperation_use") base = 10; 
                    else if (button.link === "cooperation_damage" && game.filterPlayer(p => p.isDamaged()).length >= 3) base = 8;
                    else base = 1;
                } else {
                    if (button.link === "cooperation_use") base = -10; 
                    else if (button.link === "cooperation_discard") {
                        if (target.countCards("h") <= 4) base = 10;
                        else base = 2;
                    } else if (button.link === "cooperation_draw" || button.link === "cooperation_damage") {
                        if (target.countCards("h") > 4) base = 8;
                        else base = 1;
                    }
                }
                return base + Math.random();
            }).forResult();
            
            player.addTempSkill("Mirai_nieai_effect", "phaseJieshuAfter");
            game.log(player, "与", target, "发起了", "#g【协力】");
        },
        subSkill: {
            round: { charlotte: true },
            effect: {
                charlotte: true,
                trigger: { global: "phaseJieshuBegin" }, 
                forced: true,
                filter: function(event, player) { 
                    return player.storage.Mirai_nieai_active_target === event.player; 
                },
                content: async function(event, trigger, player) {
                    var target = player.storage.Mirai_nieai_active_target;
                    delete player.storage.Mirai_nieai_active_target;
                    
                    if (target && target.isIn()) {
                        if (player.checkCooperationStatus(target, "Mirai_nieai")) {
                            player.popup("协力成功", "wood");
                            game.log(player, "与", target, "的协力", "#g成功");
                            await player.recover(); await target.recover();
                            await player.draw(2); await target.draw(2);
                            player.removeSkill("Mirai_maosu_disable");
                            game.log(player, "重置了", "#y【昴宿】");
                        } else {
                            player.popup("协力失败", "fire");
                            game.log(player, "与", target, "的协力", "#r未成功");
                            
                            await player.damage(1, player);
                            await target.damage(1, player);
                            
                            if (target.countDiscardableCards(player, "he") > 0) {
                                await player.discardPlayerCard(target, "he", 2, true);
                            }
                        }
                    }
                }
            }
        }
    },
    "Mirai_maosu": {
        audio: "ext:魔法纪录/audio/skill:2",
        categories: ["奋武技"],
        group: ["Mirai_maosu_clear"], 
        trigger: { player: "damageBegin4", source: "damageBegin1" }, 
        
        getNum: function(player) {
            return player.getRoundHistory('damage').concat(player.getRoundHistory('sourceDamage')).reduce((sum, evt) => sum + evt.num, 0) + 1;
        },
        
        filter: function(event, player) {
            if (player.hasSkill("Pleiades_maosu")) {
                var partner = player.name1 === "Mirai" ? player.name2 : player.name1;
                if (partner && !["Michiru", "Saki"].includes(partner)) return false;
            }
            return !player.hasSkill("Mirai_maosu_disable");
        },
        cost: async function(event, trigger, player) {
            var isBegin4 = (event.triggername === "damageBegin4");
            var target = isBegin4 ? player : trigger.player;
            
            var drawNum = player.hp;
            if (typeof player.getHandcardLimit === "function") {
                try { drawNum = player.getHandcardLimit(); } catch(e) {}
            }
            
            var fenwuLimit = Math.min(5, lib.skill.Mirai_maosu.getNum(player)); 
            var usedTimes = player.storage.Mirai_maosu_used || 0;
            var remainTimes = Math.max(0, fenwuLimit - usedTimes);
            var isOverLimit = (drawNum > remainTimes);
            
            var promptStr = "昴宿：是否将对 " + get.translation(target) + " 的伤害改为虚拟伤害并摸 " + drawNum + " 张牌？";
            if (isOverLimit) {
                promptStr += "（触发爆发机制：将重置【孽爱】、令一名角色执行额外弃牌阶段，并令昴宿本轮失效）";
            }
            
            var res = await player.chooseBool(promptStr)
                .set("isBegin4", isBegin4)
                .set("triggerNum", trigger.num)
                .set("dmgTarget", target)
                .set("isOverLimit", isOverLimit)
                .set("drawNum", drawNum)

                .set("ai", function() {
                    var player = _status.event.player;
                    var target = _status.event.dmgTarget; 
                    var isOver = _status.event.isOverLimit;
                    var limit = _status.event.drawNum;
                    var triggerNum = _status.event.triggerNum;
                    
                    if (limit <= 0) return false; 
                    
                    var wantResetNieai = player.hasSkill("Mirai_nieai_round"); 
                    
                    if (_status.event.isBegin4) { 

                        var isGoodState = (player.hp >= 3 && player.countCards("h") >= 3);

                        if (isGoodState && triggerNum < 2 && !wantResetNieai) return false;

                        return true; 
                    } 
                    else { 
                        
                        if (get.attitude(player, target) > 0) return true; 
                        
                        var isPoorState = (player.hp <= 2 || player.countCards("h") <= 2);
                        if (isPoorState) return true;
                        
                        var canFollowUp = (_status.currentPhase === player && player.countCards("h", function(c) {
                            var name = get.name(c);
                            return name === "sha" || name === "juedou" || name === "nanman" || name === "wanjian" || name === "huogong";
                        }) > 0);
                        if (canFollowUp) return true;
                        
                        if (isOver && wantResetNieai) return true;
                        
                        return false; 
                    }
                }).forResult();
            
            if (res.bool) event.result = { bool: true }; 
            else event.cancel();
        },
        content: async function(event, trigger, player) {
            trigger.cancel(); 
            var target = trigger.player;
            var dmgNum = trigger.num;
            
            game.log(player, "将对", target, "的", "#r" + dmgNum + "点", "伤害改为了", "#y虚拟伤害");
            target.damage("unreal", dmgNum, player);
            
            var drawNum = player.hp;
            if (typeof player.getHandcardLimit === "function") {
                try { drawNum = player.getHandcardLimit(); } catch(e) {}
            }
            if (drawNum > 0) {
                await player.draw(drawNum);
                game.log(player, "摸了", drawNum, "张牌");
            }
            
            var fenwuLimit = Math.min(5, lib.skill.Mirai_maosu.getNum(player));
            var usedTimes = player.storage.Mirai_maosu_used || 0;
            var remainTimes = Math.max(0, fenwuLimit - usedTimes);
            player.storage.Mirai_maosu_used = usedTimes + 1;
            
            if (drawNum > remainTimes) {
                player.removeSkill("Mirai_nieai_round"); 
                player.addTempSkill("Mirai_maosu_disable", "roundStart"); 
                game.log(player, "触发超限机制！重置了", "#y【孽爱】", "并令昴宿本轮失效");
                
                var res = await player.chooseTarget("昴宿爆发：请令一名角色执行额外的弃牌阶段", true).set("ai", function(target) {
                    var p = _status.event.player;

                    if (get.attitude(p, target) >= 0) return 0; 
                    var limit = typeof target.getHandcardLimit === "function" ? target.getHandcardLimit() : target.hp;
                    return Math.max(0, target.countCards("h") - limit); 
                }).forResult();
                
                if (res.bool && res.targets && res.targets.length > 0) {
                    res.targets[0].insertPhase().set("phaseList", ["phaseDiscard"]);
                    game.log(res.targets[0], "将于本回合结束后执行一个", "#y额外的弃牌阶段");
                }
            }
        },
        subSkill: { 
            disable: { 
                charlotte: true 
            },
            clear: {
                trigger: { global: "roundStart" },
                forced: true,
                silent: true,
                content: function(event, trigger, player) {
                    player.storage.Mirai_maosu_used = 0;
                }
            }
        }
    },

	
    // 神那妮可
	"Niko_fushu": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        group: ["Niko_fushu_clear_record"],
        filter: function(event, player) { 
            return player.isDamaged() && player.countCards("he") > 0; 
        },
        filterCard: true,
        selectCard: function() {
            var player = _status.event.player;
            var targetNum = Math.max(1, player.maxHp - player.hp);
            return Math.min(targetNum, player.countCards("he")); 
        },
        position: "he",
        prompt: function() {
            var player = _status.event.player;
            var targetNum = Math.max(1, player.maxHp - player.hp);
            var maxNum = Math.min(targetNum, player.countCards("he")); 
            return "覆赎：你必须重铸" + maxNum + "张牌";
        },
        check: function(card) {
            var player = _status.event.player;
            var isUnhealthy = player.hp == 1 || (player.hp == 2 && player.countCards("h") <= 2);
            
            if (get.type(card) == "equip") return -10;
            
            if (isUnhealthy && (card.name == "shan" || card.name == "wuxie")) {
                return 20; 
            }
            
            if (player.hasUseTarget(card)) {
                return 10 + get.value(card); 
            }
            
            return 5 - get.value(card);
        },
        content: function(event, trigger, player) {
            "step 0"
            var cards = event.cards || []; 
            var names = [];
            for(var i=0; i<cards.length; i++){
                if(get.type(cards[i]) != "equip") names.push(cards[i].name);
            }
            if (names.length > 0) {
                player.markAuto("Niko_fushu_record", names);
                player.addTempSkill("Niko_fushu_viewAs", "roundStart");
            }
            event.loseNum = cards.length;
            player.loseToDiscardpile(cards);
            "step 1"
            if (event.loseNum) player.draw(event.loseNum);
        },
        ai: {
            order: 10,
            result: { player: 1 }
        },
        subSkill: {
            viewAs: {
                charlotte: true,
                enable: ["chooseToUse", "chooseToRespond"],
                filterCard: true,
                selectCard: 1,
                position: "he",
                filter: function(event, player) { return player.getStorage("Niko_fushu_record").length > 0; },
                chooseButton: {
                    dialog: function(event, player) { return ui.create.dialog("覆赎：选择要转化的牌", [player.getStorage("Niko_fushu_record"), "vcard"]); },
                    backup: function(links, player) {
                        return {
                            filterCard: true, selectCard: 1, position: "he",
                            viewAs: { name: links[0][2] },
                            ai: {
                                basic: {
                                    order: function(card, player) { return get.order({name: links[0][2]}) + 0.1; },
                                    useful: function(card, player) { return get.useful({name: links[0][2]}) + 0.1; },
                                    value: function(card, player) { return get.value({name: links[0][2]}) + 0.1; }
                                },
                                result: { player: 1 },
                                check: function(card) {
                                    var val1 = get.value({name: links[0][2]}); 
                                    var val2 = get.value(card); 
                                    return val1 - val2 + 5; 
                                }
                            },
                            onuse: function(result, player) {
                                player.unmarkAuto("Niko_fushu_record", [result.card.name]);
                                player.draw(1);
                                if (!player.getStorage("Niko_fushu_record").length) player.addSkill("Niko_fushu_finish");
                            }
                        }
                    },
                    prompt: function(links, player) {
                        return "将一张牌当做【" + get.translation(links[0][2]) + "】使用";
                    }
                },
                ai: {
                    respondShan: true,
                    respondSha: true,
                    respondWuxie: true,
                    skillTagFilter: function(player, tag, arg) {
                        var list = player.getStorage("Niko_fushu_record");
                        if (!list || !list.length) return false;
                        if (tag == "respondShan") return list.includes("shan");
                        if (tag == "respondSha") return list.includes("sha");
                        if (tag == "respondWuxie") return list.includes("wuxie");
                        return false;
                    },
                    order: function() {
                        var player = _status.event.player;
                        var list = player.getStorage("Niko_fushu_record");
                        if (!list || list.length == 0) return 0;
                        var max = 0;
                        for (var i = 0; i < list.length; i++) {
                            var order = get.order({name: list[i]});
                            if (order > max) max = order;
                        }
                        return max + 0.1;
                    },
                    result: { player: 1 }
                }
            },
            finish: {
                trigger: { player: ["useCardAfter", "respondAfter"] },
                forced: true,
                charlotte: true,
                popup: false,
                content: function() {
                    "step 0"
                    player.removeSkill("Niko_fushu_finish");
                    player.chooseControl("弃牌阶段后摸牌", "回合结束后出牌").set("prompt", "覆赎：牌名已全部使用，请选择一项奖励").set("ai", function() {
                        var player = _status.event.player;
                        var hasLowHpEnemy = game.hasPlayer(function(current) {
                            return current != player && get.attitude(player, current) < 0 && 
                                   (current.hp == 1 || (current.hp == 2 && current.countCards("h") <= 2));
                        });
                        var hasSha = player.hasCard(function(c){ return c.name == 'sha'; }, "hs");
                        
                        if (hasLowHpEnemy && hasSha) {
                            return "回合结束后出牌";
                        }
                        return "弃牌阶段后摸牌";
                    });
                    "step 1"
                    if (result.control == "弃牌阶段后摸牌") {
                        player.addTempSkill("Niko_fushu_opt1", "phaseAfter");
                        game.log(player, "将于弃牌阶段结束后执行额外摸牌");
                    } else if (result.control == "回合结束后出牌") {
                        player.addTempSkill("Niko_fushu_opt2", "phaseAfter");
                        game.log(player, "将于回合结束后执行额外出牌");
                    }
                }
            },
            opt1: {
                charlotte: true,
                trigger: { player: "phaseDiscardEnd" },
                forced: true,
                popup: false,
                content: function() {
                    player.removeSkill("Niko_fushu_opt1");
                    player.insertPhase().set("phaseList", ["phaseDraw"]);
                }
            },
            opt2: {
                charlotte: true,
                trigger: { player: "phaseEnd" },
                forced: true,
                popup: false,
                content: function() {
                    player.removeSkill("Niko_fushu_opt2");
                    player.insertPhase().set("phaseList", ["phaseUse"]);
                }
            },
            clear_record: { 
                trigger: { global: "roundStart" }, forced: true, charlotte: true, popup: false,
                content: function(event, trigger, player) {
                    var list = player.getStorage("Niko_fushu_record");
                    if (list && list.length > 0) player.unmarkAuto("Niko_fushu_record", list);
                    player.removeSkill("Niko_fushu_viewAs");
                }
            }
        }
    },
    "Niko_maosu": {
        audio: "ext:魔法纪录/audio/skill:2",
        mark: true, 
        intro: { content: "已累计造成或受到 # 点伤害" },
        trigger: { player: "damageEnd", source: "damageSource" }, 
        forced: true,
        filter: function(event, player) {
            if (player.hasSkill("Pleiades_maosu")) {
                var partner = player.name1 === "Niko" ? player.name2 : player.name1;
                if (partner && !["Michiru", "Kazumi", "Subaru_Kazumi"].includes(partner)) return false;
            }
            return true;
        },
        content: async function(event, trigger, player) {
            player.addMark("Niko_maosu", trigger.num, false);
            
            while (player.countMark("Niko_maosu") >= 2) {
                player.removeMark("Niko_maosu", 2); 
                var evilnut = game.createCard2("evilnut", "spade", 2);
                evilnut.addCardtag("gifts"); 
                
                await player.gain(evilnut, "gain2");
                game.log(player, "获得了", evilnut);
            }
        }
    },
	
    // 昴宿星团通用技能池
    // 1. 万象 
    "Pleiades_wanxiang": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 2,
        filterCard: function(card, player) {
            if (ui.selected.cards.length === 0) return true;
            var selected = ui.selected.cards[0];
            return get.suit(card) !== get.suit(selected) && get.type(card) !== get.type(selected);
        },
        selectCard: 2,
        complexCard: true,
        position: "he",
        viewAs: { name: "wuzhong" },
        prompt: "万象：将两张花色与类别均不同的牌当做【无中生有】使用",
        check: function(card) {
            return 6 - get.value(card); 
        },
        ai: {
            order: 9, 
            result: { 
                player: function(player) {
                    return player.countCards("he") >= 2 ? 1 : 0;
                }
            }
        }
    },

    // 2. 绒御 
    "Pleiades_rongyu": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { target: "useCardToBefore" },
        usable: 1,
        filter: function(event, player) {
            if (event.targets.length !== 1) return false;
            if (event.player === player) return false;
            var cardColor = get.color(event.card);
            if (!cardColor || cardColor === "none") return false;
            
            var cards = player.getCards("h");
            var validCount = 0;
            for (var i = 0; i < cards.length; i++) {
                var cColor = get.color(cards[i]);
                if (cColor && cColor !== "none" && cColor !== cardColor) {
                    validCount++;
                }
            }
            return validCount >= 2;
        },
        check: function(event, player) {
            var val = get.effect(player, event.card, event.player, player);
            if (val >= 0) return false; 
            if (event.card.name === "sha" && player.hp > 1 && player.hasCard(c => c.name === "shan", "h")) {
                return false; 
            }
            return true;
        },
        content: function(event, trigger, player) {
            "step 0"
            var cardColor = get.color(trigger.card);
            var next = player.chooseToDiscard("h", 2, "绒御：是否弃置两张颜色不为 " + get.translation(cardColor) + " 的手牌，令" + get.translation(trigger.card) + "对你无效？");
            next.set("filterCard", function(card) {
                var c = get.color(card);
                return c && c !== "none" && c !== _status.event.cardColor;
            });
            next.set("cardColor", cardColor);
            next.set("ai", function(card) {
                return 8 - get.value(card); 
            });
            "step 1"
            if (result.bool) {
                trigger.cancel();
                game.log(trigger.card, "对", player, "无效了");
            }
        }
    },

    // 3. 祈愿 
    "Pleiades_qiyuan": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        mark: true,
        skillAnimation: true,
        animationColor: "orange",
        intro: { content: "limited" },
        filter: function(event, player) {
            return !player.hasSkill("Pleiades_qiyuan_used");
        },
        filterTarget: function(card, player, target) { return true; },
        ai: {
            order: 10,
            result: {
                target: function(player, target) {
                    var att = get.attitude(player, target);
                    if (att <= 0) return 0; 
                    
                    var skills = target.getSkills();
                    for (var i = 0; i < skills.length; i++) {
                        var info = get.info(skills[i]);
                        if (info && (info.juexing || info.derivation === "juexing") && !target.hasAwakenedSkill(skills[i])) {
                            return 10;
                        }
                    }
                    var limit = typeof target.getHandcardLimit === "function" ? target.getHandcardLimit() : target.hp;
                    if (limit >= 3 && target.countCards("h") <= 1) return 5;
                    return 0;
                }
            }
        },
        content: function(event, trigger, player) {
            "step 0"
            player.addSkill("Pleiades_qiyuan_used");
            var target = event.targets[0];
            event.target = target;
            var skills = target.getSkills();
            var awakenSkills = [];
            
            for (var i = 0; i < skills.length; i++) {
                var info = get.info(skills[i]);
                if (info && (info.juexing || info.derivation === "juexing") && !target.hasAwakenedSkill(skills[i])) {
                    awakenSkills.push(skills[i]);
                }
            }
            
            if (awakenSkills.length > 0) {
                var skillToAwaken = awakenSkills[0];
                game.log(player, "发动的", "#g【祈愿】", "使", target, "迎来了觉醒！");
                target.awakenSkill(skillToAwaken);
                event.finish();
            } else {
                var limit = typeof target.getHandcardLimit === "function" ? target.getHandcardLimit() : target.hp;
                event.limit = limit;
            }
            "step 1"
            if (event.limit > 0) {
                game.log(event.target, "没有可发动的觉醒技，摸", event.limit, "张牌");
                event.target.draw(event.limit);
            } else if (event.limit !== undefined) {
                game.log(event.target, "当前手牌上限为0，无法摸牌");
            }
        }
    },

    // 4. 分理 
    "Pleiades_fenli": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "phaseDrawBefore" },
        filter: function(event, player) {
            return !player.hasSkill("Pleiades_fenli_used");
        },
        check: function(event, player) {
            var num = Math.ceil(game.countPlayer() / 2);
            return num >= 2; 
        },
        content: function(event, trigger, player) {
            "step 0"
            trigger.cancel(); 
            var num = Math.ceil(game.countPlayer() / 2);
            var cards = get.cards(num);
            
            player.showCards(cards, get.translation(player) + "发动了【分理】");
            
            var redCards = [], blackCards = [];
            for (var i = 0; i < cards.length; i++) {
                if (get.color(cards[i]) === "red") redCards.push(cards[i]);
                else if (get.color(cards[i]) === "black") blackCards.push(cards[i]);
                else redCards.push(cards[i]); 
            }
            
            event.redCards = redCards;
            event.blackCards = blackCards;
            
            if (redCards.length > 0) {
                player.gain(redCards, "gain2");
                game.log(player, "获得了", redCards.length, "张红牌");
            }
            "step 1"
            if (event.blackCards.length > 0) {
                var next = player.chooseTarget("分理：请选择一名角色获得这些黑牌", 1, true);
                next.set("ai", function(target) {
                    var att = get.attitude(_status.event.player, target); 
                    return att > 0 ? att + 1 / (target.countCards("h") + 1) : 0;
                });
            } else {
                event.finish();
            }
            "step 2"
            if (result && result.bool && result.targets.length > 0) {
                var target = result.targets[0];
                target.gain(event.blackCards, "gain2");
                game.log(target, "获得了", event.blackCards.length, "张黑牌");
            } else if (event.blackCards && event.blackCards.length > 0) {
                player.gain(event.blackCards, "gain2");
                game.log(player, "获得了", event.blackCards.length, "张黑牌");
            }
        }
    },

    // 5. 灵使 
    "Pleiades_lingshi": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: ["gainAfter", "loseAfter", "equipAfter", "loseEquipAfter"] },
        usable: 2,
        filter: function(event, player) {
            var cards = event.cards || [];
            if (event.card) cards = [event.card];
            
            return cards.some(function(c) {
                return get.type(c) === "equip";
            });
        },
        check: function() { return true; }, 
        ai: {
            effect: {
                target: function(card, player, target) {
                    if (get.type(card) === 'equip') return [1, 2]; 
                }
            }
        },
        content: function(event, trigger, player) {
            player.draw(1);
            game.log(player, "由于装备牌变动，触发了", "#g【灵使】", "摸了一张牌");
        }
    },

    // 6. 幻写 
    "Pleiades_huanxie": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        filterTarget: function(card, player, target) {
            return target !== player && target.countCards("h") > 0;
        },
        ai: {
            order: 7,
            result: {
                target: function(player, target) {
                    if (get.attitude(player, target) > 0) return 1;
                    if (get.attitude(player, target) < 0 && target.countCards("h") <= 2) return -1;
                    return 0; 
                }
            }
        },
        content: function(event, trigger, player) {
            "step 0"
            var target = event.targets[0];
            event.target = target;
            var num = Math.min(3, target.countCards("h"));
            
            var next = target.chooseCard("h", num, "幻写：请选择展示 " + num + " 张手牌，" + get.translation(player) + " 将获得其中一张");
            next.set("ai", function(card) {
                if (get.attitude(_status.event.player, _status.currentPhase) > 0) {
                    return get.value(card); 
                }
                return 8 - get.value(card); 
            });
            "step 1"
            if (result.bool && result.cards && result.cards.length > 0) {
                event.target.showCards(result.cards, get.translation(event.target) + "展示了手牌");
                event.showCards = result.cards;
                
                var next2 = player.chooseCardButton("请选择获得其中一张牌", result.cards, 1, true);
                next2.set("ai", function(button) {
                    return get.value(button.link); 
                });
            } else {
                event.finish();
            }
            "step 2"
            if (result.bool && result.links && result.links.length > 0) {
                player.gain(result.links[0], event.target, "give");
            } else {
                player.gain(event.showCards.randomGet(), event.target, "give");
            }
            "step 3"
            event.target.draw(1);
        }
    },

    // 7. 共砺 
    "Pleiades_gongli": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { global: "useCardToBefore" },
        usable: 1,
        filter: function(event, player) {
            if (event.targets.length !== 1) return false;
            var target = event.targets[0];
            if (target === player || event.player === player) return false;
            if (!player.inRange(target)) return false;
            if (get.type(event.card, "trick") === "delay") return false; 
            return true;
        },
        check: function(event, player) {
            var target = event.targets[0];
            var eff = get.effect(player, event.card, event.player, player);
            if (eff > 0) return true;
            if (get.attitude(player, target) > 0 && player.hp > 2 && get.damageEffect(player, event.player, player) >= 0) return true;
            return false;
        },
        content: function(event, trigger, player) {
            "step 0"
            player.draw(1);
            "step 1"
            trigger.targets[0].draw(1);
            "step 2"
            trigger.targets.push(player);
            game.log(player, "发动的", "#g【共砺】", "成为了", trigger.card, "的额外目标！");
        }
    },

    // 8. 异塑 
    "Pleiades_yisu": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: ["chooseToUse", "chooseToRespond"],
        chooseButton: {
            dialog: function(event, player) {
                return ui.create.dialog("异塑：请选择要转化的【杀】的属性", [
                    [["基本", "", "sha"], ["基本", "", "sha", "fire"], ["基本", "", "sha", "thunder"], ["基本", "", "sha", "ice"], ["基本", "", "cisha"]],
                    "vcard"
                ], "hidden");
            },
            filter: function(button, player) { return true; },
            check: function(button) { 
                var nature = button.link[3];
                if (nature === "cisha") return 2; 
                return 1; 
            },
            backup: function(links, player) {
                var cardName = links[0][2];
                var nature = links[0][3];
                return {
                    audio: "ext:魔法纪录/audio/skill:2",
                    filterCard: function(card, player) { return card.name === "sha"; },
                    selectCard: 1,
                    viewAs: {
                        name: cardName, 
                        nature: nature, 
                        storage: { Pleiades_yisu_flag: true } 
                    },
                    prompt: "将一张【杀】当做【" + get.translation(nature ? nature + cardName : cardName) + "】使用或打出"
                };
            }
        },
        ai: { 
            order: 4, 
            result: { player: 1 } 
        },
        group: ["Pleiades_yisu_damage", "Pleiades_yisu_draw"],
        subSkill: {
            damage: {
                trigger: { source: "damageEnd" },
                forced: true, 
                silent: true,
                filter: function(event, player) {
                    return event.card && event.card.storage && event.card.storage.Pleiades_yisu_flag;
                },
                content: function(event, trigger, player) { 
                    player.storage.Pleiades_yisu_damaged = true; 
                }
            },
            draw: {
                trigger: { player: ["useCardAfter", "respondAfter"] },
                forced: true, 
                silent: true,
                filter: function(event, player) {
                    return event.skill === "Pleiades_yisu_backup";
                },
                content: function(event, trigger, player) {
                    "step 0"
                    if (!player.storage.Pleiades_yisu_damaged) {
                        player.draw(1);
                        game.log(player, "未因", "#g【异塑】", "造成伤害，摸了一张牌");
                    }
                    delete player.storage.Pleiades_yisu_damaged;
                }
            }
        }
    },

    // 9. 纵偶 
    "Pleiades_zongou": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        filterCard: true,
        selectCard: 2,
        position: "h",
        prompt: "交给一名其他角色两张手牌，并指定其杀一名目标",
        ai: {
            order: 5,
            result: {
                target: function(player, target) {
                    if (get.attitude(player, target) > 0) return 1;
                    return -1;
                }
            }
        },
        content: function(event, trigger, player) {
            "step 0"
            event.target = event.targets[0];
            event.target.gain(event.cards, player, "giveAuto");
            "step 1"
            player.chooseTarget("纵偶：请为 " + get.translation(event.target) + " 指定使用【杀】的目标", 1, function(c, p, t) {
                return t !== _status.event.target && _status.event.target.canUse("sha", t, false);
            }).set("target", event.target).set("ai", function(t) {
                var p = _status.event.player;
                var target = _status.event.target;
                if (get.attitude(p, target) > 0) return -get.attitude(p, t);
                if (get.attitude(p, target) < 0) return get.attitude(target, t); 
                return -get.attitude(p, t);
            });
            "step 2"
            if (result.bool && result.targets.length > 0) {
                event.shaTarget = result.targets[0];
                game.log(player, "指定", event.shaTarget, "为", event.target, "需要使用实体【杀】的目标");
                var hasPhysicalSha = event.target.hasCard(function(c) { return c.name === "sha"; }, "hs");
                if (hasPhysicalSha) {
                    event.target.chooseControl("对目标使用实体【杀】", "令其获得你区域内的两张牌").set("prompt", "纵偶：你被要求对" + get.translation(event.shaTarget) + "出杀").set("ai", function() {
                        if (get.attitude(_status.event.player, _status.event.shaTarget) > 0) return "令其获得你区域内的两张牌";
                        return "对目标使用实体【杀】";
                    }).set("shaTarget", event.shaTarget);
                } else {
                    game.log(event.target, "没有实体的【杀】，只能选择被", player, "获得两张牌");
                    event.needRob = true;
                }
            } else {
                event.finish();
            }
            "step 3"
            if (!event.needRob && result.control === "对目标使用实体【杀】") {
                event.target.chooseToUse(function(card, p) {
                    return card.name === "sha" && !card.isVCard;
                }, event.shaTarget, -1).set("prompt", "请对 " + get.translation(event.shaTarget) + " 使用一张实体的【杀】");
                event.usedSha = true;
            } else if (!event.needRob && result.control === "令其获得你区域内的两张牌") {
                event.needRob = true;
            }
            "step 4"
            if (event.needRob) {
                player.choosePlayerCard(event.target, "he", 2, "纵偶：获得其区域内的两张牌", true).set("ai", function(button) {
                    return get.value(button.link);
                });
            } else if (event.usedSha) {
                if (!result.bool) { 
                    event.needRob = true;
                    event.redo(); 
                } else {
                    event.finish();
                }
            }
            "step 5"
            if (event.needRob && result.bool && result.links && result.links.length > 0) {
                player.gain(result.links, event.target, "give");
            }
        }
    },

    // 10. 烈蹴 
    "Pleiades_liecu": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        filterTarget: function(card, player, target) {
            return target !== player && player.countCards("h") > 0 && target.countCards("h") > 0;
        },
        ai: {
            order: 6,
            result: { target: -1 }
        },
        content: function(event, trigger, player) {
            "step 0"
            event.target = event.targets[0];
            player.chooseToCompare(event.target);
            "step 1"
            if (result.bool) {
                player.addTempSkill("Pleiades_liecu_buff", "phaseAfter");
                if (!player.storage.Pleiades_liecu_buff) {
                    player.storage.Pleiades_liecu_buff = [];
                }
                if (!player.storage.Pleiades_liecu_buff.includes(event.target)) {
                    player.storage.Pleiades_liecu_buff.push(event.target);
                }
                game.log(player, "拼点赢了！本回合对", event.target, "使用的【杀】无距离限制且#r不可被响应#text！");
            } else {
                game.log(player, "拼点没赢，未获得【烈蹴】增益");
            }
        },
        subSkill: {
            buff: {
                onremove: function(player) {
                    delete player.storage.Pleiades_liecu_buff;
                },
                mod: {
                    targetInRange: function(card, player, target) {
                        if (card.name === "sha" && player.storage.Pleiades_liecu_buff && player.storage.Pleiades_liecu_buff.includes(target)) {
                            return true;
                        }
                    }
                },
                trigger: { player: "useCardToBefore" },
                forced: true,
                filter: function(event, player) {
                    return event.card.name === "sha" && player.storage.Pleiades_liecu_buff && player.storage.Pleiades_liecu_buff.includes(event.target);
                },
                content: function(event, trigger, player) {
                    game.log(player, "发动的", "#g【烈蹴】", "效果触发，此【杀】不可被响应");
                    if (!trigger.directHit) trigger.directHit = [];
                    trigger.directHit.add(trigger.target);
                }
            }
        }
    },

    // 11. 枢衡 
    "Pleiades_shuheng": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        filterTarget: function(card, player, target) {
            return player !== target && target.countCards("h") > 0;
        },
        content: function(event, trigger, player) {
            "step 0"
            event.target = event.targets[0];
            player.chooseControl(lib.suit).set("prompt", "枢衡：请声明一种花色").set("ai", function() {
                var cards = _status.event.player.getCards("h");
                var counts = {spade:0, heart:0, club:0, diamond:0};
                for(var i=0; i<cards.length; i++) counts[get.suit(cards[i])]++;
                var min = 100; var minSuit = "spade";
                for(var s in counts) { if(counts[s] < min) { min = counts[s]; minSuit = s; } }
                return minSuit;
            });
            "step 1"
            if (result.control) {
                event.suit1 = result.control;
                var cards1 = player.getCards("h").filter(c => get.suit(c) === event.suit1);
                if (cards1.length > 0) player.showCards(cards1);
                
                event.target.chooseControl(lib.suit).set("prompt", "枢衡：请声明一种不同的花色").set("ai", function() {
                    var cards = _status.event.player.getCards("h");
                    var counts = {spade:0, heart:0, club:0, diamond:0};
                    for(var i=0; i<cards.length; i++) counts[get.suit(cards[i])]++;
                    counts[_status.event.suit1] = 100; 
                    var min = 100; var minSuit = "spade";
                    for(var s in counts) { if(counts[s] < min) { min = counts[s]; minSuit = s; } }
                    return minSuit;
                }).set("suit1", event.suit1);
            } else {
                event.finish();
            }
            "step 2"
            if (result.control) {
                event.suit2 = result.control;
                var cards2 = event.target.getCards("h").filter(c => get.suit(c) === event.suit2);
                if (cards2.length > 0) event.target.showCards(cards2);
                
                player.addTempSkill("Pleiades_shuheng_ban");
                player.markAuto("Pleiades_shuheng_ban", [event.suit1]);
                event.target.addTempSkill("Pleiades_shuheng_ban");
                event.target.markAuto("Pleiades_shuheng_ban", [event.suit2]);
                game.log(player, "与", event.target, "分别被禁用了", "#y"+get.translation(event.suit1), "和", "#y"+get.translation(event.suit2));
            }
        },
        subSkill: {
            ban: {
                charlotte: true,
                onremove: true,
                mod: {
                    cardEnabled: function(card, player) {
                        if (player.getStorage("Pleiades_shuheng_ban").includes(get.suit(card))) return false;
                    },
                    cardUsable: function(card, player) {
                        if (player.getStorage("Pleiades_shuheng_ban").includes(get.suit(card))) return false;
                    },
                    cardRespondable: function(card, player) {
                        if (player.getStorage("Pleiades_shuheng_ban").includes(get.suit(card))) return false;
                    }
                }
            }
        }
    },
    
    // 12. 忘形 
    "Pleiades_wangxing": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "phaseDrawBegin" },
        check: function(event, player) {
            return true; 
        },
        content: function(event, trigger, player) {
            trigger.num += 2; 
            player.addTempSkill("Pleiades_wangxing_ban", "phaseJieshuEnd");
            game.log(player, "发动", "#g【忘形】", "额外摸了两张牌");
        },
        subSkill: {
            ban: {
                trigger: { player: "phaseDrawEnd" },
                forced: true,
                charlotte: true,
                content: function(event, trigger, player) {
                    "step 0"
                    player.chooseControl(["basic", "trick", "equip"]).set("prompt", "忘形：请声明一种本回合不能使用的牌类别").set("ai", function() {
                        var p = _status.event.player;
                        if (p.countCards("h", {type: "equip"}) === 0) return "equip";
                        if (p.countCards("h", {type: "trick"}) === 0) return "trick";
                        return "equip"; 
                    });
                    "step 1"
                    if (result.control) {
                        player.markAuto("Pleiades_wangxing_ban", [result.control]);
                        game.log(player, "声明了", "#y" + get.translation(result.control), "，本回合无法使用此类别");
                    }
                },
                mod: {
                    cardEnabled: function(card, player) {
                        if (player.getStorage("Pleiades_wangxing_ban").includes(get.type(card))) return false;
                    },
                    cardUsable: function(card, player) {
                        if (player.getStorage("Pleiades_wangxing_ban").includes(get.type(card))) return false;
                    }
                }
            }
        }
    },

    // 13. 窥心 
    "Pleiades_kuixin": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "damageEnd" },
        usable: 1,
        filter: function(event, player) {
            return event.source && event.source !== player && event.source.countCards("h") > 0 && player.countCards("h") > 0;
        },
        content: function(event, trigger, player) {
            "step 0"
            event.source = trigger.source;
            player.chooseCardButton("窥心：请展示一张手牌", player.getCards("h")).set("ai", function(button) {
                return get.number(button.link); 
            });
            "step 1"
            if (result.bool && result.links && result.links.length > 0) {
                event.show1 = result.links[0];
                player.showCards(event.show1, get.translation(player) + "展示了手牌");
                
                event.source.chooseCardButton("窥心：请展示一张手牌响应", event.source.getCards("h")).set("ai", function(button) {
                    var num = get.number(button.link);
                    var targetNum = get.number(_status.event.show1);
                    if (num > targetNum) return 20 + num; 
                    return 14 - num; 
                }).set("show1", event.show1);
            } else {
                event.finish();
            }
            "step 2"
            if (result.bool && result.links && result.links.length > 0) {
                var show2 = result.links[0];
                event.source.showCards(show2, get.translation(event.source) + "展示了手牌");
                
                event.source.addTempSkill("Pleiades_kuixin_ban", "phaseAfter");
                event.source.markAuto("Pleiades_kuixin_ban", [show2.name]);
                game.log(event.source, "本回合无法使用", show2);
                
                if (get.number(show2) <= get.number(event.show1)) {
                    event.source.discard(show2);
                    game.log(event.source, "的点数不大于", player, "，被迫弃置了", show2);
                }
            }
        },
        subSkill: {
            ban: {
                charlotte: true,
                onremove: true,
                mod: {
                    cardEnabled: function(card, player) {
                        if (player.getStorage("Pleiades_kuixin_ban").includes(card.name)) return false;
                    },
                    cardUsable: function(card, player) {
                        if (player.getStorage("Pleiades_kuixin_ban").includes(card.name)) return false;
                    },
                    cardRespondable: function(card, player) {
                        if (player.getStorage("Pleiades_kuixin_ban").includes(card.name)) return false;
                    }
                }
            }
        }
    },
    
    // 14. 替劫 
    "Pleiades_tijie": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "damageBegin" },
        usable: 1,
        filter: function(event, player) {
            return event.source && player.hasCard(c => get.type(c) !== "basic", "he");
        },
        check: function(event, player) {
            if (player.hp <= event.num) return true; 
            if (event.num >= 2) return true; 
            if (event.source && event.source.countCards("h") <= player.countCards("he", c => get.type(c) !== "basic")) {
                return true;
            }
            return false;
        },
        content: function(event, trigger, player) {
            "step 0"
            var sourceHandCount = trigger.source ? trigger.source.countCards("h") : 0;
            player.chooseToDiscard("he", [1, Infinity], function(card) {
                return get.type(card) !== "basic";
            }).set("prompt", "替劫：可弃置任意张非基本牌防止伤害，若数量≥伤害来源手牌数(" + sourceHandCount + "张)，其流失1点体力")
            .set("ai", function(card) {
                var p = _status.event.player;
                var sourceHandCount = _status.event.sourceHandCount;
                if (p.hp <= 1 || _status.event.isFatal) return 8 - get.value(card); 
                if (sourceHandCount <= 2) return 6 - get.value(card);
                return 0; 
            }).set("sourceHandCount", sourceHandCount).set("isFatal", player.hp <= trigger.num);
            "step 1"
            if (result.bool && result.cards && result.cards.length > 0) {
                trigger.cancel(); 
                game.log(player, "防止了此伤害！");
                if (trigger.source && result.cards.length >= trigger.source.countCards("h")) {
                    trigger.source.loseHp(1);
                    game.log(trigger.source, "受到了", "#g【替劫】", "的反噬，流失了 1 点体力！");
                }
            }
        }
    },
    
    // 15. 绝响 
    "Pleiades_juexiang": {
        audio: "ext:魔法纪录/audio/skill:2",
        mod: {
            targetEnabled: function(card, player, target) {
                if (player !== target && target.hp <= 1 && (card.name === "sha" || card.name === "juedou")) {
                    return false;
                }
            }
        },
        ai: {
            effect: {
                target: function(card, player, target) {
                    if (target.hp <= 1 && (card.name === "sha" || card.name === "juedou")) {
                        return "zerotarget"; 
                    }
                }
            }
        }
    },
	
    // 16. 晏如 
    "Pleiades_yanru": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "damageBegin4" },
        forced: true,
        filter: function(event, player) {
            return !player.getEquip(1) && event.num > 1;
        },
        content: function(event, trigger, player) {
            trigger.num = 1;
            game.log(player, "的", "#g【晏如】", "触发，将伤害降低至 1 点");
        },
        ai: {
            effect: {
                target: function(card, player, target) {
                    if (!target.getEquip(1) && get.tag(card, "damage") > 1) {
                        return 0.5; 
                    }
                }
            }
        },
        group: ["Pleiades_yanru_recover"]
    },
    "Pleiades_yanru_recover": {
        trigger: { player: "damageEnd" },
        forced: true,
        silent: true, 
        filter: function(event, player) {
            return !player.storage.Pleiades_yanru_damaged;
        },
        content: function(event, trigger, player) {
            "step 0"
            player.storage.Pleiades_yanru_damaged = true;
            player.recover(1);
            "step 1"
            game.log(player, "触发了", "#g【晏如】", "，首次受伤回复 1 点体力");
        }
    },

    // 17. 轰雷/奔雷 
    "Pleiades_xunting": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "phaseZhunbeiBegin" },
        filter: function(event, player) {
            return player.countCards("he") > 0;
        },
        content: function(event, trigger, player) {
            "step 0"
            var cards = player.getCards("he");
            var typeSet = new Set();
            cards.forEach(c => {
                var t = get.type(c);
                if (t === "delay") t = "trick"; 
                typeSet.add(t);
            });
            var choices = Array.from(typeSet);
            var choiceNames = choices.map(t => get.translation(t) + "牌");
            choices.push("cancel2");
            choiceNames.push("取消");
            
            player.chooseControl(choices).set("displayList", choiceNames).set("prompt", "轰雷：是否弃置一种类别的所有牌，令你与一名角色依次执行反转的【闪电】？").set("ai", function() {
                var p = _status.event.player;
                if (p.hp <= 3) return "cancel2"; 
                var cards = p.getCards("he");
                var counts = { basic:0, trick:0, equip:0 };
                for (var i=0; i<cards.length; i++) {
                    var t = get.type(cards[i]);
                    if(t==="delay") t="trick";
                    counts[t]++;
                }
                if (counts.equip === 1 && p.countCards("e") > 0) return "equip"; 
                return "cancel2";
            });
            "step 1"
            if (result.control && result.control !== "cancel2") {
                event.targetType = result.control;
                var toDiscard = player.getCards("he").filter(c => {
                    var t = get.type(c);
                    if (t === "delay") t = "trick";
                    return t === event.targetType;
                });
                player.discard(toDiscard);
            } else {
                event.finish();
            }
            "step 2"
            player.chooseTarget("轰雷：请选择一名角色，你们将依次执行反转的【闪电】", 1, true).set("ai", function(target) {
                return -get.attitude(_status.event.player, target);
            });
            "step 3"
            if (result.bool && result.targets.length > 0) {
                event.lightningTarget = result.targets[0];
                player.judge(function(card) {
                    var suit = get.suit(card);
                    var number = get.number(card);
                    if (suit === "spade" && number >= 2 && number <= 9) return 1;
                    return -1;
                });
            } else {
                event.finish();
            }
            "step 4"
            if (result.judge < 0) {
                game.log(player, "判定结果为", result.card, "，受到反转【闪电】的制裁！");
                player.damage(3, "thunder", "nosource");
            } else {
                game.log(player, "判定结果为", result.card, "，安全度过了反转【闪电】");
            }
            "step 5"
            if (event.lightningTarget && event.lightningTarget.isAlive()) {
                event.lightningTarget.judge(function(card) {
                    var suit = get.suit(card);
                    var number = get.number(card);
                    if (suit === "spade" && number >= 2 && number <= 9) return 1;
                    return -1;
                });
            } else {
                event.finish();
            }
            "step 6"
            if (result.judge < 0) {
                game.log(event.lightningTarget, "判定结果为", result.card, "，受到反转【闪电】的制裁！");
                event.lightningTarget.damage(3, "thunder", "nosource");
            } else {
                game.log(event.lightningTarget, "判定结果为", result.card, "，安全度过了反转【闪电】");
            }
        }
    },
    
    // 18. 回锋 
    "Pleiades_huifeng": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "phaseJieshuBegin" },
        filter: function(event, player) {
            return player.countCards("h") > 0;
        },
        content: function(event, trigger, player) {
            "step 0"
            var history = player.getHistory("useCard", function(evt) {
                return get.type(evt.card) !== "equip";
            });
            
            if (history.length > 0) {
                var lastCard = history[history.length - 1].card;
                var targetName = lastCard.name;
                
                player.addTempSkill("Pleiades_huifeng_inf", "phaseJieshuAfter");
                player.storage.Pleiades_huifeng_inf = targetName;
                
                player.chooseToUse(
                    function(card, player2) { return get.position(card) === 'h'; }, 
                    -1 
                ).set("viewAs", targetName).set("prompt", "回锋：选择一张手牌当做无限次数使用的【" + get.translation(targetName) + "】使用（取消则摸一张牌）");
            } else {
                event.goto(2); 
            }
            "step 1"
            if (result.bool) {
                game.log(player, "发动", "#g【回锋】", "将一张手牌转化为了额外的卡牌使用");
                event.finish(); 
            } else {
                player.removeSkill("Pleiades_huifeng_inf");
            }
            "step 2"
            player.draw(1);
            game.log(player, "本回合未因", "#g【回锋】", "追击卡牌，摸了一张牌");
        },
        subSkill: {
            inf: {
                charlotte: true,
                mod: {
                    cardUsable: function(card, player, num) {
                        if (card.name === player.storage.Pleiades_huifeng_inf) return Infinity;
                    }
                }
            }
        }
    },

    // 19. 缤宴 
    "Pleiades_binyan": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "phaseZhunbeiBegin" },
        forced: true,
        content: function(event, trigger, player) {
            "step 0"
            player.useCard({name: "wugu", isCard: true, _virtual: true});
            "step 1"
            player.useCard({name: "wugu", isCard: true, _virtual: true});
            "step 2"
            player.useCard({name: "taoyuan", isCard: true, _virtual: true});
            "step 3"
            player.recover(1);
            game.log(player, "和美缤纷乐，回复了 1 点体力");
        }
    },

    // 20. 拾姗 
    "Pleiades_shishan": {
        audio: "ext:魔法纪录/audio/skill:2", 
        enable: "phaseUse", 
        usable: 1,
        filter: function(event, player) { 
            return player.countCards("h") > 0; 
        },
        ai: { 
            order: 8, 
            result: { player: 1 } 
        },
        group: ["Pleiades_shishan_lose", "Pleiades_shishan_clear"],
        mod: {
            cardUsable: function(card, player, num) {
                if (player.storage.Pleiades_shishan_inf && card.name === player.storage.Pleiades_shishan_inf) {
                    return Infinity;
                }
            }
        },
        content: function(event, trigger, player) {
            "step 0"
            player.chooseCard("h", 1, "拾姗：请选择并展示一张手牌").set("ai", function(card) { 
                return get.value(card); 
            });
            "step 1"
            if (result.bool && result.cards.length > 0) {
                event.showCard = result.cards[0];
                player.showCards(event.showCard, get.translation(player) + "展示了" + get.translation(event.showCard));
                
                player.chooseToDiscard("he", 2, "弃置两张花色和类别与该牌均不同的牌，以复制之", function(card) {
                    return get.suit(card) !== get.suit(_status.event.showCard) && get.type(card) !== get.type(_status.event.showCard);
                }).set("showCard", event.showCard).set("complexCard", true).set("ai", function(card) { 
                    return 6 - get.value(card); 
                });
            } else {
                event.finish();
            }
            "step 2"
            if (result.bool) {
                var cardx = game.createCard2(event.showCard.name, event.showCard.suit, event.showCard.number, event.showCard.nature);
                player.gain(cardx, "gain2");
                
                player.storage.Pleiades_shishan_card = cardx;
                if (get.type(cardx) === "basic") {
                    player.storage.Pleiades_shishan_inf = cardx.name;
                }
            }
        },
        subSkill: {
            clear: {
                trigger: { player: "phaseUseAfter" },
                silent: true, forced: true, charlotte: true,
                content: function(event, trigger, player) {
                    delete player.storage.Pleiades_shishan_inf;
                }
            },
            lose: {
                trigger: { player: ["loseAfter", "cardsDiscardAfter"] }, 
                forced: true, silent: true, charlotte: true,
                filter: function(event, player) {
                    var c = player.storage.Pleiades_shishan_card;
                    if (!c) return false;
                    var evt = (event.name === "cardsDiscard") ? event : event;
                    return evt.cards && evt.cards.includes(c);
                },
                content: function(event, trigger, player) {
                    delete player.storage.Pleiades_shishan_card;
                    var parentName = event.getParent().name;
                    if (parentName !== "useCard" && parentName !== "respond") {
                        game.log(player, "未因使用或打出而失去复制牌，流失 1 点体力");
                        player.loseHp(1);
                    }
                }
            }
        }
    },

    // 21. 褪忆 
    "Pleiades_tuiyi": {
        audio: "ext:魔法纪录/audio/skill:2",
        limited: true, mark: true, skillAnimation: true, animationColor: "gray", intro: { content: "limited" },
        trigger: { global: "useCard" },
        filter: function(event, player) {
            if (player === _status.currentPhase) return false;
            if (event.player === player) return false;
            if (get.type(event.card) === "equip") return false;
            if (player.hasSkill("Pleiades_tuiyi_used")) return false;
            return true;
        },
        content: function(event, trigger, player) {
            "step 0"
            var choices = ["取消"];
            var canDiscard = false;
            var cards = player.getCards("he");
            for (var i = 0; i < cards.length; i++) {
                for (var j = i + 1; j < cards.length; j++) {
                    if (get.color(cards[i]) === get.color(cards[j]) && get.color(cards[i]) !== "none") {
                        canDiscard = true;
                        break;
                    }
                }
                if (canDiscard) break;
            }
            if (canDiscard) choices.unshift("弃置两张同颜色牌");
            choices.unshift("流失1点体力");
            
            player.chooseControl(choices).set("prompt", "褪忆：是否流失体力或弃牌，令 " + get.translation(trigger.card) + " 无效并封印该牌名？").set("ai", function() {
                var player = _status.event.player;
                var trigger = _status.event.getTrigger();
                var att = get.attitude(player, trigger.player);
                if (att > 0) return "取消"; 
                
                var eff = 0;
                if (trigger.targets && trigger.targets.length > 0) {
                    for(var i = 0; i < trigger.targets.length; i++) {
                        eff += get.effect(trigger.targets[i], trigger.card, trigger.player, player);
                    }
                }
                if (eff < -5 || (trigger.card.name === "wuzhong" && att < 0)) {
                    if (_status.event.canDiscard) return "弃置两张同颜色牌";
                    if (player.hp > 2) return "流失1点体力";
                }
                return "取消";
            }).set("canDiscard", canDiscard);
            
            "step 1"
            if (result.control !== "取消") {
                event.choice = result.control;
                player.awakenSkill("Pleiades_tuiyi");
                player.addSkill("Pleiades_tuiyi_used");
                
                if (event.choice === "流失1点体力") {
                    player.loseHp(1);
                    event.success = true;
                } else if (event.choice === "弃置两张同颜色牌") {
                    player.chooseToDiscard("he", 2, "请弃置两张颜色相同的牌", function(card, p) {
                        if (ui.selected.cards.length === 0) return get.color(card) !== "none";
                        return get.color(card) === get.color(ui.selected.cards[0]);
                    }).set("complexCard", true).set("ai", function(card) { 
                        return 6 - get.value(card); 
                    });
                }
            } else {
                event.finish();
            }
            "step 2"
            if (event.choice === "弃置两张同颜色牌") {
                if (result.bool) event.success = true;
            }
            "step 3"
            if (event.success) {
                trigger.cancel();
                trigger.targets.length = 0;
                trigger.all_excluded = true;
                game.log(trigger.card, "被", player, "的魔法无情地遗忘了！");
                
                var target = trigger.player;
                target.addTempSkill("Pleiades_tuiyi_ban", "phaseEnd");
                if (!target.storage.Pleiades_tuiyi_ban) target.storage.Pleiades_tuiyi_ban = [];
                target.storage.Pleiades_tuiyi_ban.push(trigger.card.name);
                game.log(target, "本回合不能再使用或打出牌名包含", trigger.card, "的牌");
            }
        },
        subSkill: {
            used: { charlotte: true },
            ban: {
                charlotte: true,
                mod: {
                    cardEnabled2: function(card, player) {
                        if (player.storage.Pleiades_tuiyi_ban && player.storage.Pleiades_tuiyi_ban.includes(card.name)) return false;
                    },
                    cardRespondable: function(card, player) {
                        if (player.storage.Pleiades_tuiyi_ban && player.storage.Pleiades_tuiyi_ban.includes(card.name)) return false;
                    },
                    cardSavable: function(card, player) {
                        if (player.storage.Pleiades_tuiyi_ban && player.storage.Pleiades_tuiyi_ban.includes(card.name)) return false;
                    }
                }
            }
        }
    },

    // 22. 殉决 
    "Pleiades_xunjue": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { target: "useCardToTargeted" },
        filter: function(event, player) {
            if (player.hasSkill("Pleiades_xunjue_round")) return false;
            return event.player !== player && event.targets.length === 1 && get.type(event.card) === "trick" && event.player.countCards("he") > 0;
        },
        content: function(event, trigger, player) {
            "step 0"
            player.chooseToDiscard("he", [1, Infinity], "殉决：你可以弃置任意张牌，令 " + get.translation(trigger.player) + " 弃置等量的牌（代价：本回合你受到的伤害翻倍）").set("ai", function(card) { 
                var trigger = _status.event.getTrigger();
                if (get.attitude(_status.event.player, trigger.player) > 0) return 0; 
                
                var enemyCards = trigger.player.countCards("he");
                var myCards = _status.event.player.countCards("he");
                if (enemyCards <= 2 && myCards > 3) return 6 - get.value(card);
                return 0; 
            });
            "step 1"
            if (result.bool && result.cards && result.cards.length > 0) {
                player.addSkill("Pleiades_xunjue_round");
                
                var num = result.cards.length;
                player.addTempSkill("Pleiades_xunjue_damage", "phaseAfter");
                game.log(player, "发动的", "#g【殉决】", "令", trigger.player, "需弃置", num, "张牌！");
                
                trigger.player.chooseToDiscard("he", num, true).set("ai", function(card) {
                    return 6 - get.value(card);
                });
            }
        },
        subSkill: {
            round: {
                charlotte: true, trigger: { global: "roundStart" },
                forced: true, silent: true,
                content: function(event, trigger, player) { player.removeSkill("Pleiades_xunjue_round"); }
            },
            damage: {
                trigger: { player: "damageBegin" },
                forced: true, charlotte: true,
                content: function(event, trigger, player) {
                    trigger.num *= 2;
                    game.log(player, "受到的伤害因", "#g【殉决】", "的反噬而翻倍了！");
                }
            }
        }
    },

    // 23. 刻痕 
    "Pleiades_kehen": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "loseAfter" },
        filter: function(event, player) {
            if (player.countCards("h") > 0) return false;
            if (!event.hs || event.hs.length === 0) return false;
            return !player.storage.Pleiades_kehen_name; 
        },
        content: function(event, trigger, player) {
            "step 0"
            var list = get.inpileVCardList(function(info) {
                return info[0] === "basic" || info[0] === "trick";
            });
            player.chooseButton(["刻痕：请声明一种基本牌或普通锦囊牌", [list, "vcard"]]).set("ai", function(button) {
                var p = _status.event.player;
                if (_status.currentPhase === p) return button.link[2] === "wuzhong" ? 1 : 0;
                return button.link[2] === "shan" ? 1 : 0; 
            });
            "step 1"
            if (result.bool && result.links && result.links.length > 0) {
                player.storage.Pleiades_kehen_name = result.links[0][2];
                player.markSkill("Pleiades_kehen");
                game.log(player, "将", "#y【" + get.translation(result.links[0][2]) + "】", "深深刻印在了记忆中");
            }
        },
        intro: {
            content: function(storage, player) {
                if (storage) return "已记录：" + get.translation(storage);
                return "未记录";
            }
        },
        enable: ["chooseToUse", "chooseToRespond"],
        filterCard: function(card, player) { return true; }, 
        selectCard: 1,
        viewAsFilter: function(player) {
            return player.storage.Pleiades_kehen_name && player.countCards("h") <= 2;
        },
        viewAs: function(cards, player) {
            return { name: player.storage.Pleiades_kehen_name };
        },
        prompt: function(links, player) {
            return "将一张牌当做【" + get.translation(player.storage.Pleiades_kehen_name) + "】使用或打出（发动后清空记录）";
        },
        group: "Pleiades_kehen_reset",
        subSkill: {
            reset: {
                trigger: { player: ["useCardAfter", "respondAfter"] },
                silent: true, forced: true,
                filter: function(event, player) {
                    return event.skill === "Pleiades_kehen" && player.storage.Pleiades_kehen_name;
                },
                content: function(event, trigger, player) {
                    delete player.storage.Pleiades_kehen_name;
                    player.unmarkSkill("Pleiades_kehen");
                    game.log(player, "清空了", "#g【刻痕】", "的记忆");
                }
            }
        }
    },

    // 24. 棘荆 
    "Pleiades_jijing": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { global: "useCardToTargeted" },
        filter: function(event, player) {
            var target = event.target;
            var isValidTarget = (target === player) || target.inRange(player);
            var count = player.storage.Pleiades_jijing_count || 0;
            return event.card.name === "sha" && event.player !== target && isValidTarget && count < 2 && player.hasCard(function(c){ return get.type(c) === "equip"; }, "he");
        },
        content: function(event, trigger, player) {
            "step 0"
            var target = trigger.target;
            event.target = target;
            var source = trigger.player;
            event.source = source;
            
            var promptText = (target === player) ? 
                "棘荆：是否使用一张装备牌，并于结算后对该【杀】的使用者进行反击？" : 
                "棘荆：是否交给 " + get.translation(target) + " 一张装备牌并令其使用，以掩护其反击？";
                
            player.chooseCard("he", 1, function(card) {
                return get.type(card) === "equip";
            }, promptText).set("ai", function(card) {
                var p = _status.event.player;
                var t = _status.event.target;
                if (get.attitude(p, t) < 0) return 0; 
                return 6 - get.value(card); 
            }).set("target", target);
            "step 1"
            if (result.bool && result.cards && result.cards.length > 0) {
                var card = result.cards[0];
                player.logSkill("Pleiades_jijing", event.target);
                
                player.storage.Pleiades_jijing_count = (player.storage.Pleiades_jijing_count || 0) + 1;
                event.jijingCard = card;
                
                if (event.target !== player) {
                    event.target.gain(card, player, "giveAuto");
                }
            } else {
                event.finish();
            }
            "step 2"
            if (event.target.hasCard(event.jijingCard, "he")) {
                event.target.useCard(event.jijingCard, event.target);
            }
            "step 3"
            event.target.addTempSkill("Pleiades_jijing_counter");
            event.target.storage.Pleiades_jijing_counter = { source: event.source, evt: trigger };
        },
        group: "Pleiades_jijing_clear",
        subSkill: {
            clear: {
                trigger: { global: "roundStart" },
                silent: true, forced: true,
                content: function(event, trigger, player) {
                    player.storage.Pleiades_jijing_count = 0;
                }
            },
            counter: {
                trigger: { global: "useCardAfter" },
                charlotte: true, forced: true, onremove: true,
                filter: function(event, player) {
                    return player.storage.Pleiades_jijing_counter && event === player.storage.Pleiades_jijing_counter.evt;
                },
                content: function(event, trigger, player) {
                    "step 0"
                    var source = player.storage.Pleiades_jijing_counter.source;
                    if (source && source.isAlive()) {
                        event.source = source;
                        player.chooseToUse(function(card, p) {
                            return card.name === "sha";
                        }, "棘荆：你可以对 " + get.translation(source) + " 使用一张无视距离的【杀】").set("targetRequired", true).set("filterTarget", function(card, p, t) {
                            return t === _status.event.source;
                        }).set("source", source).set("ai", function() { return 1; }); 
                        player.addTempSkill("Pleiades_jijing_range");
                    } else {
                        event.finish();
                    }
                    "step 1"
                    player.removeSkill("Pleiades_jijing_range");
                }
            },
            range: {
                charlotte: true,
                mod: { targetInRange: function(card, player, target) { return true; } }
            }
        }
    },

    // 25. 兆觉 
    "Pleiades_zhaojue": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "phaseZhunbeiBegin" },
        content: function(event, trigger, player) {
            "step 0"
            var list = get.inpileVCardList(function(info) {
                return info[0] !== "equip"; 
            });
            player.chooseButton(["兆觉：请记录一个非装备牌的牌名", [list, "vcard"]]).set("ai", function(button) {
                var name = button.link[2];
                if (name === "sha") return 10;
                if (name === "shan") return 9;
                if (name === "wuxiekeji") return 8;
                if (name === "tao") return 7;
                return 0;
            });
            "step 1"
            if (result.bool && result.links && result.links.length > 0) {
                var cardName = result.links[0][2];
                player.storage.Pleiades_zhaojue_name = cardName;
                player.markSkill("Pleiades_zhaojue");
                game.log(player, "竖起呆毛，警觉地记录了牌名", "#y【" + get.translation(cardName) + "】");
            }
        },
        intro: {
            content: function(storage, player) {
                if (player.storage.Pleiades_zhaojue_name) {
                    return "已记录：" + get.translation(player.storage.Pleiades_zhaojue_name);
                }
                return "未记录";
            }
        },
        group: ["Pleiades_zhaojue_trigger", "Pleiades_zhaojue_clear"],
        subSkill: {
            trigger: {
                audio: "ext:魔法纪录/audio/skill:2",
                trigger: { global: "useCard" },
                filter: function(event, player) {
                    return event.player !== player && 
                           player.storage.Pleiades_zhaojue_name && 
                           event.card.name === player.storage.Pleiades_zhaojue_name;
                },
                prompt2: function(event, player) {
                    return "呆毛狂动！移去记录的【" + get.translation(player.storage.Pleiades_zhaojue_name) + "】，摸一张牌或弃置 " + get.translation(event.player) + " 一张牌";
                },
                check: function(event, player) { return true; },
                content: function(event, trigger, player) {
                    "step 0"
                    delete player.storage.Pleiades_zhaojue_name;
                    player.unmarkSkill("Pleiades_zhaojue");
                    
                    event.target = trigger.player;
                    var choices = ["摸一张牌"];
                    if (event.target.countCards("he") > 0) {
                        choices.push("弃置其一张牌");
                    }
                    
                    player.chooseControl(choices).set("prompt", "兆觉：请选择一项反击效果").set("ai", function() {
                        var p = _status.event.player;
                        var t = _status.event.target;
                        if (get.attitude(p, t) < 0 && t.countCards("h") <= 2) return "弃置其一张牌";
                        return "摸一张牌";
                    }).set("target", event.target);
                    "step 1"
                    if (result.control === "摸一张牌") {
                        player.draw(1);
                        game.log(player, "因", "#g【兆觉】", "摸了一张牌");
                    } else if (result.control === "弃置其一张牌") {
                        player.discardPlayerCard(event.target, "he", 1, true);
                        game.log(player, "因", "#g【兆觉】", "弃置了", event.target, "的一张牌");
                    }
                }
            },
            clear: {
                trigger: { global: "roundStart" },
                silent: true, forced: true,
                filter: function(event, player) { return player.storage.Pleiades_zhaojue_name; },
                content: function(event, trigger, player) {
                    delete player.storage.Pleiades_zhaojue_name;
                    player.unmarkSkill("Pleiades_zhaojue");
                }
            }
        }
    },

    // 26. 十字 
    "Pleiades_shizi": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        filter: function(event, player) {
            return !player.hasSkill("Pleiades_shizi_round") && player.countCards("he") > 0;
        },
        filterTarget: function(card, player, target) { return target !== player; },
        ai: {
            order: 8, 
            result: { target: function(p, t) { return -get.attitude(p, t); } }
        },
        content: function(event, trigger, player) {
            "step 0"
            event.target = event.targets[0];
            player.addSkill("Pleiades_shizi_round");
            
            player.chooseToDiscard("he", 1, true, "十字：请弃置一张牌，对 " + get.translation(event.target) + " 造成1点伤害").set("ai", function(card) { 
                return 8 - get.value(card); 
            }); 
            "step 1"
            if (result.bool && result.cards && result.cards.length > 0) {
                event.lastNumber = get.number(result.cards[0]);
                event.count = 0;
            } else {
                event.finish();
            }
            "step 2" 
            if (!event.target.isAlive() || event.count >= 3) {
                event.finish();
                return;
            }
            event.hpBefore = event.target.hp;
            event.target.damage(1, player);
            "step 3"
            if (event.hpBefore !== event.target.hp) {
                event.finish(); 
                return;
            }
            var hasValidCard = player.hasCard(function(c) {
                return get.number(c) > event.lastNumber;
            }, "he");
            if (!hasValidCard) {
                event.finish();
                return;
            }
            
            event.count++;
            var promptText = "十字：目标体力未变化！是否弃置一张点数大于 " + event.lastNumber + " 的牌继续造成伤害？(已重复 " + event.count + "/3 次)";
            player.chooseToDiscard("he", 1, promptText).set("filterCard", function(c, p) {
                return get.number(c) > _status.event.lastNumber;
            }).set("lastNumber", event.lastNumber).set("ai", function(card) {
                return 8 - get.value(card); 
            });
            "step 4"
            if (result.bool && result.cards && result.cards.length > 0) {
                event.lastNumber = get.number(result.cards[0]);
                event.goto(2); 
            }
        },
        subSkill: {
            round: {
                charlotte: true, trigger: { global: "roundStart" },
                forced: true, silent: true,
                content: function(event, trigger, player) { player.removeSkill("Pleiades_shizi_round"); }
            }
        }
    },

    // 27. 环御 
    "Pleiades_huanyu": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "phaseDiscardEnd" },
        filter: function(event, player) {
            var history = player.getHistory("lose", function(e) {
                return e.getParent("phaseDiscard") === event.getParent("phaseDiscard");
            });
            return history.some(e => e.cards && e.cards.some(c => get.color(c) === "black" && get.position(c, true) === "d"));
        },
        check: function(event, player) { return true; },
        content: function(event, trigger, player) {
            "step 0"
            var history = player.getHistory("lose", function(e) {
                return e.getParent("phaseDiscard") === trigger.getParent("phaseDiscard");
            });
            var blackCards = [];
            history.forEach(function(e) {
                if (e.cards) {
                    e.cards.forEach(function(c) {
                        if (get.color(c) === "black" && get.position(c, true) === "d") {
                            blackCards.push(c);
                        }
                    });
                }
            });
            event.blackCards = blackCards;
            
            player.chooseTarget("环御：是否将刚才弃置的 " + blackCards.length + " 张黑色牌交给一名其他角色？", 1, function(c, p, t) {
                return t !== p;
            }).set("ai", function(target) {
                var att = get.attitude(_status.event.player, target); 
                return att > 0 ? att + 1 / (target.countCards("h") + 1) : 0;
            });
            "step 1"
            if (result.bool && result.targets && result.targets.length > 0) {
                var target = result.targets[0];
                target.gain(event.blackCards, "gain2");
                
                target.addTempSkill("Pleiades_huanyu_buff", "roundEnd");
                target.storage.Pleiades_huanyu_buff = event.blackCards.length;
                game.log(target, "获得了", "#g【环御】", "的庇护，本轮首次受伤可弃置", event.blackCards.length, "张牌抵消 1 点伤害！");
            }
        },
        subSkill: {
            buff: {
                charlotte: true,
                trigger: { player: "damageBegin4" },
                filter: function(event, player) {
                    return player.storage.Pleiades_huanyu_buff > 0;
                },
                content: function(event, trigger, player) {
                    "step 0"
                    event.num = player.storage.Pleiades_huanyu_buff;
                    player.chooseToDiscard("he", event.num, "环御：是否弃置 " + event.num + " 张牌，令此次伤害 -1？").set("ai", function(c) {
                        var p = _status.event.player;
                        if (p.hp <= 2 || p.countCards("he") > _status.event.num + 1) return 8 - get.value(c);
                        return 0;
                    }).set("num", event.num);
                    "step 1"
                    if (result.bool) {
                        trigger.num--;
                        game.log(player, "弃置了", event.num, "张牌，令受到的伤害 -1");
                    }
                    player.removeSkill("Pleiades_huanyu_buff");
                    delete player.storage.Pleiades_huanyu_buff;
                }
            }
        }
    },

    // 28. 忆夕 
    "Pleiades_yixi": {
        audio: "ext:魔法纪录/audio/skill:2",
        limited: true, mark: true, skillAnimation: true, animationColor: "orange", intro: { content: "limited" },
        trigger: { global: "phaseEnd" },
        filter: function(event, player) {
            var count = player.storage.Pleiades_yixi_count || 0;
            return !player.hasSkill("Pleiades_yixi_used") && count >= 3;
        },
        check: function(event, player) { return true; },
        content: function(event, trigger, player) {
            player.awakenSkill("Pleiades_yixi");
            player.addSkill("Pleiades_yixi_used");
            game.log(player, "唤醒了时空的奇迹记忆，将执行一个额外的回合！");
            player.insertPhase();
        },
        group: ["Pleiades_yixi_tracker", "Pleiades_yixi_clear"],
        subSkill: {
            tracker: {
                trigger: { global: ["damageEnd", "recoverEnd"] },
                forced: true, silent: true, charlotte: true,
                filter: function(event, player) { return event.source === player; },
                content: function(event, trigger, player) {
                    var count = player.storage.Pleiades_yixi_count || 0;
                    player.storage.Pleiades_yixi_count = count + trigger.num; 
                }
            },
            clear: {
                trigger: { global: "phaseAfter" },
                forced: true, silent: true, charlotte: true,
                content: function(event, trigger, player) {
                    player.storage.Pleiades_yixi_count = 0;
                }
            },
            used: { charlotte: true }
        }
    },

    // 29. 咫涯 
    "Pleiades_zhiya": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        filterTarget: function(card, player, target) { return target !== player; },
        ai: {
            order: 8,
            result: {
                target: function(player, target) {
                    if (get.attitude(player, target) < 0 && get.distance(player, target) > player.getAttackRange()) return 1;
                    if (get.attitude(player, target) < 0 && player.hp >= 3) return 0.5;
                    return 0; 
                }
            }
        },
        content: function(event, trigger, player) {
            var target = event.targets[0];
            player.storage.Pleiades_zhiya_target = target.playerid;
            player.addSkill("Pleiades_zhiya_effect");
            var hp = Math.max(0, player.hp);
            var lostHp = Math.max(0, player.maxHp - player.hp);
            game.log(player, "发动", "#g【咫涯】", "锁定了", target);
            game.log("空间扭曲：", player, "对其距离 #g-" + hp, "，其对", player, "距离 #r+" + lostHp);
        },
        subSkill: {
            effect: {
                charlotte: true,
                onremove: function(player, skill) { delete player.storage.Pleiades_zhiya_target; },
                mod: {
                    distance: function(from, to, distance) {
                        if (from.hasSkill("Pleiades_zhiya_effect") && to.playerid === from.storage.Pleiades_zhiya_target) return distance - from.hp;
                        if (to.hasSkill("Pleiades_zhiya_effect") && from.playerid === to.storage.Pleiades_zhiya_target) return distance + (to.maxHp - to.hp);
                    }
                },
                trigger: { global: "damageEnd", player: "phaseBegin" },
                forced: true, silent: true,
                filter: function(event, player) {
                    if (event.name === "phase") return true;
                    if (event.name === "damage") return event.player.playerid === player.storage.Pleiades_zhiya_target || event.player === player; 
                    return false;
                },
                content: function(event, trigger, player) { player.removeSkill("Pleiades_zhiya_effect"); }
            }
        }
    },

    // 30. 头彩 
    "Pleiades_jackpot": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { player: "phaseBegin" },
        filter: function(event, player) { return player.countCards("he") > 0; },
        content: function(event, trigger, player) {
            "step 0"
            if (event.blackCount === undefined) event.blackCount = 0;
            
            var promptText = event.blackCount === 1 ? 
                "【头彩】警告：已出现一次黑色判定！再次出现黑色将强制跳过所有阶段！" : 
                "【头彩】：是否弃置一张牌并进行判定？";
                
            player.chooseToDiscard("he", 1, promptText).set("ai", function(card) {
                var p = _status.event.player;
                if (_status.event.blackCount >= 1) return 0; 
                if (p.hp < p.maxHp) return 7 - get.value(card); 
                return 5 - get.value(card); 
            }).set("blackCount", event.blackCount);
            
            "step 1"
            if (result.bool) {
                player.judge(function(card) { return get.color(card) === "red" ? 1 : -1; });
            } else {
                event.finish();
            }
            "step 2"
            if (result.color === "red") {
                event.blackCount = 0; 
                if (player.hp < player.maxHp) {
                    player.recover(1); 
                    game.log(player, "赢得了", "#y【头彩】", "！奇迹显现，伤痛愈合。");
                    event.goto(0); 
                } else {
                    var num = get.number(result.card);
                    if (num > 7) {
                        var drawNum = Math.floor(Math.random() * 5) + 1;
                        player.draw(drawNum);
                        game.log(player, "判定点数为", "#y" + num, "，", "#y【头彩】", "大爆发！随机摸了", drawNum, "张牌！");
                    } else if (num < 7) {
                        var discardNum = Math.floor(Math.random() * 3) + 1;
                        var cards = player.getCards("he");
                        if (cards.length > 0) {
                            var actualDiscardNum = Math.min(discardNum, cards.length);
                            var toDiscard = cards.randomGets(actualDiscardNum);
                            player.discard(toDiscard);
                            game.log(player, "判定点数为", "#r" + num, "，", "#r【头彩】", "遭到反噬！随机弃置了", actualDiscardNum, "张牌。");
                        } else {
                            game.log(player, "判定点数为", "#r" + num, "，但你已经没有牌可以弃置了。");
                        }
                    } else {
                        game.log(player, "判定点数恰好为", "#g 7", "，命运的齿轮并未转动，无事发生。");
                    }
                    event.goto(0); 
                }
            } else {
                event.blackCount++;
                game.log(player, "遭遇了命运的恶意...累计连续黑色次数：", event.blackCount);
                player.damage(1);
            }
            "step 3"
            if (event.blackCount > 0) { 
                if (player.countCards("h") > 0) {
                    player.discard(player.getCards("h").randomGet());
                }
                if (event.blackCount >= 2) {
                    game.log(player, "连续两次判定为黑色！", "#r中了大奖的负面代价", "触发！");
                    trigger.cancel(); 
                    player.skip("phaseZhunbei");
                    player.skip("phaseDraw");
                    player.skip("phaseUse");
                    player.skip("phaseJieshu");
                    game.log(player, "跳过了本回合的其他阶段，直接进入弃牌阶段。");
                    event.finish();
                } else {
                    event.goto(0); 
                }
            }
        }
    },

    // 31. 昴星 
    "Pleiades_maoxing": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        content: function(event, trigger, player) {
            "step 0"
            event.cards = [];
            event.sum = 0;
            "step 1"
            var card = get.cards(1)[0];
            event.cards.push(card);
            event.sum += get.number(card);
            
            player.showCards(card, get.translation(player) + "展示了牌堆顶的 " + get.translation(card));
            game.log(player, "当前点数总和为：", "#y" + event.sum);
            
            "step 2"
            if (event.sum > 14) {
                game.log(player, "点数之和大于14！", "#r【昴星】赌博失败！");
                player.$throw(event.cards, 1000);
                game.cardsDiscard(event.cards);
                player.addTempSkill("Pleiades_maoxing_limit", "phaseAfter");
                event.finish();
            } else {
                player.chooseBool("当前点数和为 " + event.sum + "，是否继续展示牌堆顶的牌？").set("ai", function() {
                    return _status.event.sum < 9;
                }).set("sum", event.sum);
            }
            "step 3"
            if (result.bool) {
                event.goto(1); 
            } else {
                game.log(player, "主动停止了展示，获得了所有展示的牌");
                player.gain(event.cards, "gain2");
            }
        },
        subSkill: {
            limit: {
                charlotte: true,
                mod: {
                    maxHandcard: function(player, num) {
                        return num - 2;
                    }
                }
            }
        }
    },

    // 32. 连诛 
    "Pleiades_lianzhu": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { source: "damageEnd" },
        filter: function(event, player) {
            if (!event.card) return false;
            var color = get.color(event.card);
            if (!color || color === "none") return false;

            var target = event.player;
            var hasValidTarget = game.hasPlayer(function(current) {
                return current !== player && current !== target && get.distance(target, current) <= 1;
            });
            return hasValidTarget && player.hasCard(function(c) {
                return get.color(c) === color;
            }, "he");
        },
        content: function(event, trigger, player) {
            "step 0"
            var color = get.color(trigger.card);
            event.damageTarget = trigger.player;
            
            player.chooseToDiscard("he", 1, "连诛：是否弃置一张" + get.translation(color) + "牌，对" + get.translation(event.damageTarget) + "距离1以内的一名角色造成1点伤害？", function(card) {
                return get.color(card) === _status.event.color;
            }).set("color", color).set("ai", function(card) {
                return 7 - get.value(card); 
            });
            "step 1"
            if (result.bool && result.cards && result.cards.length > 0) {
                player.chooseTarget("请选择对谁造成1点伤害", 1, function(card, p, t) {
                    return t !== p && t !== _status.event.damageTarget && get.distance(_status.event.damageTarget, t) <= 1;
                }).set("damageTarget", event.damageTarget).set("ai", function(target) {
                    return get.damageEffect(target, _status.event.player, _status.event.player);
                });
            } else {
                event.finish();
            }
            "step 2"
            if (result.bool && result.targets && result.targets.length > 0) {
                var hitTarget = result.targets[0];
                player.line(hitTarget, "fire");
                hitTarget.damage(1, player);
                game.log(player, "发动", "#g【连诛】", "对", hitTarget, "造成了 1 点伤害！");
            }
        }
    },

    // 33. 星坠 
    "Pleiades_xingzhui": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        filterCard: true,
        selectCard: [2, Infinity],
        position: "h",
        viewAs: { name: "huogong" },
        prompt: "星坠：将至少两张手牌当做一张【火攻】使用（伤害值为+x，x为你以此法使用牌数的一半，向下取整）。若此【火攻】未造成伤害，你摸x张牌。",
        check: function(card) {
            return 6 - get.value(card);
        },
        ai: {
            order: 6,
            result: { player: 1 }
        },
        group: ["Pleiades_xingzhui_record"]
    },
    "Pleiades_xingzhui_record": {
        trigger: { player: "useCard" },
        forced: true, silent: true, charlotte: true,
        filter: function(event, player) {
            return event.skill === "Pleiades_xingzhui";
        },
        content: function(event, trigger, player) {
            var count = trigger.cards ? trigger.cards.length : 2;
            var x = Math.floor(count / 2); 
            player.storage.Pleiades_xingzhui_x = x;
            player.storage.Pleiades_xingzhui_hit = false;
            player.addTempSkill("Pleiades_xingzhui_buff"); 
        }
    },
    "Pleiades_xingzhui_buff": {
        charlotte: true,
        trigger: { source: "damageBegin1" }, 
        forced: true, silent: true,
        filter: function(event, player) {
            return event.card && event.card.name === "huogong" && player.storage.Pleiades_xingzhui_x > 0;
        },
        content: function(event, trigger, player) {
            var x = player.storage.Pleiades_xingzhui_x || 0;
            trigger.num += x; 
            player.storage.Pleiades_xingzhui_hit = true; 
            game.log(player, "的", "#g【星坠】", "附加了", "#r" + x + "点", "伤害！");
        },
        group: "Pleiades_xingzhui_miss"
    },
    "Pleiades_xingzhui_miss": {
        trigger: { player: "useCardAfter" },
        forced: true, silent: true, charlotte: true,
        filter: function(event, player) {
            return event.skill === "Pleiades_xingzhui";
        },
        content: function(event, trigger, player) {
            if (!player.storage.Pleiades_xingzhui_hit) {
                var x = player.storage.Pleiades_xingzhui_x || 0;
                if (x > 0) {
                    player.draw(x);
                    game.log(player, "的", "#g【星坠】", "未能造成伤害，摸了", x, "张牌");
                }
            }

            delete player.storage.Pleiades_xingzhui_x;
            delete player.storage.Pleiades_xingzhui_hit;
            player.removeSkill("Pleiades_xingzhui_buff");
        }
    },

    "Pleiades_yiyuan": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        filter: function(event, player) {
            return player.countCards("he") > 0;
        },
        content: function(event, trigger, player) {
            "step 0"
            player.chooseToDiscard(1, "he", true).set("prompt", "易元：弃置一张牌并展示牌堆底的一张牌").set("ai", function(card) {
                return 6 - get.value(card);
            });
            "step 1"
            if (result.bool) {
                var card = null;
                if (ui.cardPile.childNodes.length > 0) {
                    card = ui.cardPile.lastChild;
                    ui.cardPile.removeChild(card);
                    card.fix();
                } else {
                    card = get.cards(1)[0]; 
                }
                event.card = card;
                player.showCards(card, get.translation(player) + "展示了牌堆底的 " + get.translation(card));
            } else {
                event.finish();
            }
            "step 2"
            var type = get.type(event.card);
            
            if (type === "equip") {
                player.gain(event.card, "gain2");
                player.draw(3);
                game.log("展示为", "#y装备牌", "，获得之并摸三张牌！");
            } else if (type === "trick" || type === "delay") {
                player.gain(event.card, "gain2");
                player.draw(1);
                player.addTempSkill("Pleiades_yiyuan_sha", "phaseUseAfter");
                player.addMark("Pleiades_yiyuan_sha", 1, false);
                game.log("展示为", "#y锦囊牌", "，获得之并摸一张牌，本回合出【杀】次数+1");
            } else if (type === "basic") {
                game.cardsDiscard(event.card);
                
                player.addTempSkill("Pleiades_yiyuan_limit", "phaseAfter");
                player.addMark("Pleiades_yiyuan_limit", 1, false);
                
                if (player.getStat().skill.Pleiades_yiyuan !== undefined) {
                    player.getStat().skill.Pleiades_yiyuan--;
                }
                game.log("展示为", "#y基本牌", "，将其弃置。本回合手牌上限+1，且", "#g【易元】", "已重置！");
            }
        },
        subSkill: {
            sha: {
                charlotte: true, mark: true,
                intro: { content: "本回合额外出杀次数：#" },
                mod: { cardUsable: function(card, player, num) { if (card.name === "sha") return num + player.countMark("Pleiades_yiyuan_sha"); } }
            },
            limit: {
                charlotte: true, mark: true,
                intro: { content: "本回合手牌上限增加：#" },
                mod: { maxHandcard: function(player, num) { return num + player.countMark("Pleiades_yiyuan_limit"); } }
            }
        }
    },

    // 35. 水镜 
    "Pleiades_shuijing": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { target: "useCardToBefore" },
        filter: function(event, player) {
            var count = player.storage.Pleiades_shuijing_count || 0;
            return count < 2 && event.targets.length === 1;
        },
        content: function(event, trigger, player) {
            "step 0"
            player.storage.Pleiades_shuijing_count = (player.storage.Pleiades_shuijing_count || 0) + 1;
            player.addSkill("Pleiades_shuijing_clear");
            
            player.chooseControl("红色", "黑色").set("prompt", "水镜：请猜测牌堆顶牌的颜色").set("ai", function() {
                return Math.random() > 0.5 ? "红色" : "黑色";
            });
            "step 1"
            if (result.control) {
                event.guessColor = result.control === "红色" ? "red" : "black";
                var card = get.cards(1)[0];
                event.card = card;
                player.showCards(card, get.translation(player) + "展示了牌堆顶的 " + get.translation(card));
                game.log(player, "猜测为", result.control);
                
                var actualColor = get.color(card);
                if (actualColor === event.guessColor) {
                    game.log(player, "猜对了！");
                    event.success = true;
                } else {
                    game.log(player, "猜错了，展示的牌被置入弃牌堆。");
                    game.cardsDiscard(card); 
                    event.finish();
                }
            } else {
                event.finish();
            }
            "step 2"
            if (event.success) {
                player.chooseTarget("水镜：请将此牌的目标转移给一名其他合法角色", 1, function(card, p, t) {
                    return t !== p && lib.filter.targetEnabled2(_status.event.sourceCard, _status.event.sourcePlayer, t);
                }).set("sourceCard", trigger.card).set("sourcePlayer", trigger.player).set("ai", function(target) {
                    var att = get.attitude(_status.event.player, target);
                    var isGood = get.effect(target, _status.event.sourceCard, _status.event.sourcePlayer, target) > 0;
                    return isGood ? att : -att;
                });
            }
            "step 3"
            if (result.bool && result.targets.length > 0) {
                var newTarget = result.targets[0];
                trigger.targets[0] = newTarget;
                trigger.target = newTarget;
                game.log(player, "成功将目标转移给了", newTarget);
            }
            if (event.success) {
                player.gain(event.card, "gain2"); 
            }
        },
        subSkill: {
            clear: {
                trigger: { global: "roundStart" },
                silent: true, forced: true, charlotte: true,
                content: function(event, trigger, player) {
                    player.storage.Pleiades_shuijing_count = 0;
                }
            }
        }
    },
    
    // 36. 炮球 
    "Pleiades_paoqiu": {
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: { source: "damageBegin" },
        filter: function(event, player) {
            return !player.storage.Pleiades_paoqiu_used;
        },
        content: function(event, trigger, player) {
            "step 0"
            player.storage.Pleiades_paoqiu_used = true;
            player.addSkill("Pleiades_paoqiu_clear");
            
            player.chooseControl("摸一张牌", "弃置一名角色一张牌").set("prompt", "炮球：当前阶段首次造成伤害，请选择一项").set("ai", function() {
                var p = _status.event.player;
                if (p.countCards("h") <= 2) return "摸一张牌";
                var enemies = game.filterPlayer(current => get.attitude(p, current) < 0 && current.countCards("he") > 0);
                if (enemies.length > 0) return "弃置一名角色一张牌";
                return "摸一张牌";
            });
            "step 1"
            if (result.control === "摸一张牌") {
                player.draw(1);
                game.log(player, "发动", "#g【炮球】", "摸了一张牌");
                event.finish();
            } else if (result.control === "弃置一名角色一张牌") {
                player.chooseTarget("请选择要弃置牌的角色", 1, function(card, p, t) {
                    return t.countCards("he") > 0;
                }).set("ai", function(target) {
                    return -get.attitude(_status.event.player, target);
                });
            }
            "step 2"
            if (result.bool && result.targets && result.targets.length > 0) {
                var target = result.targets[0];
                player.discardPlayerCard(target, "he", 1, true);
                game.log(player, "发动", "#g【炮球】", "弃置了", target, "的一张牌");
            }
        },
        subSkill: {
            clear: {
                trigger: { global: ["phaseBegin", "phaseAfter"] },
                silent: true, forced: true, charlotte: true,
                content: function(event, trigger, player) {
                    player.storage.Pleiades_paoqiu_used = false;
                }
            }
        }
    },



	// 深月菲莉西亚
	"felicia_chuiji": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { global: "useCardToPlayered" },
		group: "felicia_chuiji_3",
		direct: true,
		usable: 1,
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
					if (get.color(i) == "red") {

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
		subSkill: {
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
	"felicia_yongbing": {
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
			} else {

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
				audio: "ext:魔法纪录/audio/skill:2",
				forced: true,
				filter(event, player) {
					return get.sgn(player.hp - 2.5) != get.sgn(player.hp - 2.5 - event.num);
				},
				content() { },
				mod: {
					globalFrom: function (from, to, current) {
						return from.hp <= 2 ? current - 4 : current - 2;
					},
					globalTo: function (from, to, current) {
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
	"sana_dunwei": {
		trigger: { player: "phaseJieshuBegin" },
		audio: "ext:魔法纪录/audio/skill:2",
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
				filter(event, player) {
					return player.getStorage("sana_touming_2").length > 0;
				},
				async cost(event, trigger, player) {
					const result = await player.chooseTarget("你可以选择一名角色：直到下个你的回合开始，只要你翻面，【杀】对其无效，并且可以额外摸牌", function (card, player, target) {
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
				onremove(player) {
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
	"sana_duntu": {
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
		group: ["sana_duntu_2", "sana_duntu_draw"],
		subSkill: {
			draw: {
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
					return !player.isTurnedOver() && get.cardPile(function (card) { return get.type(card) == 'equip'; }) != undefined;
				},
				async content(event, trigger, player) {
					const card = get.cardPile(function (card) {
						return get.type(card) == "equip";
					});
					if (card) {
						await player.gain(card, "gain2", "log");
					}
					if (player.canMoveCard()) {
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
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "phaseUseBefore" },
		mark: true,
		zhuanhuanji: true,
		marktext: "☯",
		forced: true,
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
				ai: {
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
		audio: "ext:魔法纪录/audio/skill:2",
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
			player.changeSkin("nagisa_beiji", "nagisa2");
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
		audio: "ext:魔法纪录/audio/skill:1",
		trigger: { player: "phaseZhunbeiBegin" },
		async content(event, trigger, player) {
			// 清除之前的类型选择
			if (player.storage.nanaka_huaxin_types) delete player.storage.nanaka_huaxin_types;

			const typeList = [["basic", "基本牌"], ["trick", "锦囊牌"], ["equip", "装备牌"]];
			// chooseButton多选格式
			const result = await player.chooseButton(["华心：选择一种牌的类型", `<div class="text center">牌的类型</div>`, [typeList, "tdnodes"]])
				.set("selectButton", 1)
				.set("ai", button => {
					const player = _status.event.player;
					const type = button.link;
					const counts = {
						basic: player.countCards("h", card => get.type(card) == "basic"),
						trick: player.countCards("h", card => get.type(card) == "trick"),
						equip: player.countCards("h", card => get.type(card) == "equip"),
					};
					return counts[type];
				})
				.forResult();

			if (!result.bool || !result.links?.length) return;
			player.storage.nanaka_huaxin_types = result.links;

			player.addTempSkill("nanaka_huaxin_draw", { player: "phaseBegin" });
			player.addTempSkill("nanaka_huaxin_sha", { player: "phaseBegin" });
		},
		subSkill: {
			draw: {
				trigger: { player: ["useCard", "respond"] },
				filter(event, player) {
					if (!player.storage.nanaka_huaxin_types) return false;

					if (event.name === "useCard") {
						const cardType = get.type(event.card);
						return player.storage.nanaka_huaxin_types.includes(cardType);
					}

					if (event.name === "respond") {
						const cardType = get.type(event.card);
						return player.storage.nanaka_huaxin_types.includes(cardType);
					}

					return false;
				},
				forced: true,
				async content(event, trigger, player) {
					await player.draw(2);
				},
			},
			sha: {
				mod: {
					cardUsable(card, player, num) {
						if (card.name === "sha") return num + 1;
					},
				},
			},
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
			await player.draw(2);
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
	"tsuruno_yanzhan": {
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
					return skills.duexcept_ai(player.getHp() - get.value(card), card, player);
				}
			}
			return skills.duexcept_ai((card.name == "sha" ? 5 : 6) - get.value(card), card, player);
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

			player.addTempSkill("tsuruno_yanzhan_temp", "phaseUseAfter");
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
				if (!player.hasHistory("sourceDamage", evt => evt.card == trigger.card))
					player.draw()
			});
		},
		ai: {
			threaten: 0.4,
			order: 9,
			result: {
				player: 1,
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
			cardUsable(card, player, num) {
				if (card.name == "sha") {
					return Infinity;
				}
			},
		},
		forced: true,
		logTarget: "target",
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
					return event.card && event.card.name == "sha" && get.distance(player, event.player) > 1;
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
		round: 1,
		trigger: { global: "phaseAfter" },
		filter(event, player) {
			return event.player != player && player.countCards("h") < player.hp;
		},
		line: { color: [251, 193, 217] },
		logTarget: "player",
		charlotte: true,
		content() {
			"step 0";
			player.loseHp();
			"step 1";
			player.draw(2);
			player.insertPhase();
			player.storage.shizuka_xueji = trigger.player;
			player.addTempSkill("shizuka_xueji_distance");
		},
		subSkill: {
			distance: {
				mark: "character",
				intro: {
					content: "到$的距离视为1",
				},
				onremove: true,
				charlotte: true,
				mod: {
					globalFrom(from, to) {
						if (from.storage.shizuka_xueji == to) {
							return -Infinity;
						}
					},
				},
			},
		}
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
			player.addSkill("shizuka_xueshang_dying");
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
	"shizuka_xueshang_dying": {
		trigger: { global: "dying" },
		forced: true,
		popup: false,
		charlotte: true,
		filter(event, player) {
			return event.getParent(2).name == "shizuka_xueshang" && event.getParent(2).player == player;
		},
		content() {
			player.removeSkills("shizuka_xueshang");
			player.gainMaxHp(true);
			player.recover();
		},
	},

	// 巴麻美
	"mami_duanbian": {
		trigger: {
			player: ["phaseJudgeBefore", "phaseDrawBefore", "phaseDiscardBefore"],
		},
		filter(event, player) {
			return player.countCards("h") > 0 || player.storage.mami_duanbian_mark;
		},
		preHidden: true,
		async cost(event, trigger, player) {
			let phasenamestr = "弃牌阶段";
			const discardstr = "弃置一张手牌并跳过";
			let aicheck = false;

			const lebu_aif1 = player.hasCard(card => {
				return skills.ducardexcept_ai(get.suit(card) == "diamond" && lib.filter.cardDiscardable(card, player), card, player);
			}, "h");
			const lebu_ai = lebu_aif1 && game.hasPlayer(target => {
				return get.effect(target, { name: "lebu" }, player, player) > 0 && !target.hasJudge("lebu") && !target.hasSkill("tsuruno_qiangyun");
			})
			switch (trigger.name) {
				case "phaseJudge":
					phasenamestr = "判定阶段，然后可以移动场上的一张牌";
					if (!player.canMoveCard(true)) {
						aicheck = false;
					} else {
						aicheck = game.hasPlayer(function (current) {
							if (get.attitude(player, current) > 0) {
								const f11 = current.countCards("j", card => {
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
							if (get.attitude(player, current) <= 0) {
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

			event.result = await player.chooseToDiscard(get.prompt(event.skill), discardstr + phasenamestr, lib.filter.cardDiscardable)
				.set("ai", card => {
					if (!_status.event.check) {
						return -1;
					}
					return skills.duexcept_ai((get.suit(card) == "diamond" && lebu_ai) ? (12 - get.value(card)) : (1 / get.value(card)), card, player);
				})
				.set("check", aicheck)
				.setHiddenSkill(event.skill)
				.forResult()

			if (event.result.bool && !player.hasSkill("mami_duanbian_mark")) {
				player.addTempSkill("mami_duanbian_mark");
				player.draw(2);
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
				case "phaseJudge": {
					triggerstr = "判定";
					if (player.canMoveCard()) {
						await player.moveCard();
					}
					await game.delay();
					break;
				}
				case "phaseDraw": {
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
					await player.draw(3 - result.targets.length);
					await game.delay();
					break;
				}
			}

			game.log(player, "跳过了", "#y" + triggerstr + "阶段");
		},
		subSkill: {
			mark: {
				charlotte: true,
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
			2: {
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
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { global: ["useCard"] },
		forced: true,
		filter(event, player) {
			return event.player != player && event.card.name == "wuxie" && ((event.respondTo && event.respondTo[1].name == "wanjian") || (event.getParent("phaseJudge", true)?.card?.name == "lebu"))
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
			2: {
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
				},
			},
		},
	},

	// 里见那由他
	"nayuta_kanwu": {
		audio: "huanchi",
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
		audio: "ext:魔法纪录/audio/skill:2",
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
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "phaseBegin"
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
				intro: {
					content(storage) {
						return "得到调整屋技能【" + get.translation(storage) + "】：" + get.skillInfoTranslation(storage)
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

			trigger.player.addTempSkill(result, { player: "dieAfter" });
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
	"mitama_shuhun": {
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
			content(storage, player) {
				const storage2 = player.storage.mitama_chuanshu
				if (player.name != "mitama")
					return "①你造成或受到伤害后，八云御魂摸一张牌。②你死亡后，八云御魂重置技能【传术】。③获得传术技能【" + get.translation(storage2) + "】：" + get.skillInfoTranslation(storage2)
				return "①你造成或受到伤害后，摸一张牌。②你死亡后，可令一名角色失去所有手牌。③获得传术技能【" + get.translation(storage2) + "】：" + get.skillInfoTranslation(storage2)
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
							.set("ai", function (target) {
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
					return event.filterCard({ name: "shan" }, player, event);
				},
				selectCard: 1,
				filterCard: { name: "ying" },
				position: "hs",
				locked: false,
				viewAs: {
					name: "shan",
				},
				viewAsFilter(player) {
					if (!player.countCards("hs", "ying")) {
						return false;
					}
				},
				check(card) {
					const val = get.value(card);
					return 5 - val;
				},
				mod: {
					cardUsable(card) {
						if (card.storage && card.storage.Riz_caoying_attack) {
							return Infinity;
						}
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
				ai1(card) {
					if (player.countCards("hes", {
						name: "shan"
					}) > 0) return false
					return true;
				},
				"_priority": 0,
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
	"lena_bianzhuang": {
		enable: "phaseUse",
		usable: 1,
		audio: "ext:魔法纪录/audio/skill:2",
		filter(event, player) {
			return game.hasPlayer(function (target) {
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
					if (game.hasPlayer(function (target) {
						return get.attitude(player, target) > 0 && target.countCards("h") < target.maxHp && player.hasCard(card => lib.filter.cardDiscardable(card, player), "he")
					}) || (player.countCards("h") == player.maxHp && player.hasCard(card => lib.filter.cardDiscardable(card, player), "h")))
						return 1
					return -1
				}
			},
		},
	},
	"lena_nizong": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "damageEnd" },
		forced: true,
		filter(event, player) {
			return event.cost_data != "lena_nizong2" && player.name == "lena"
		},
		async content(event, trigger, player) {
			await lib.skill.lena_bianzhuang.bianshen(player, 1, "lena_nizong")
		},
	},
	"lena_zhiao": {
		audio: "ext:魔法纪录/audio/skill:2",
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
	"lena_bianzhuang2": {
		//Infinity_Aqua:["momoko","kaede"],
		Infinity_Aqua: ["momoko", "kaede", "ren", "ao"],
		Lena_Except: ["lena", "lena2", "ulti_madoka", "devil_homura", "sakura", "ai", "yamada"],
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

			await player.addTempSkill(result, { player: "dieAfter" });
			player.markAuto("lena_bianzhuang2", result)

			if (player.storage.lena_maxHp > player.countCards("h"))
				await player.draw(player.storage.lena_maxHp - player.countCards("h"))

		},
		content() { },
		mark: true,
		marktext: "水",
		intro: {
			content(storage, player) {
				const hp = player.storage.lena_Hp
				const maxHp = player.storage.lena_maxHp
				if (!storage)
					return "【水波玲奈】体力/体力上限为" + hp + "/" + maxHp
				return "【水波玲奈】体力/体力上限为" + hp + "/" + maxHp + "，变装技能为【" + get.translation(storage) + "】：" + get.skillInfoTranslation(storage)
			},
		},
		mod: {
			maxHandcardBase(player, num) {
				if (player.storage.lena_maxHp) {
					return player.storage.lena_maxHp + num;
				}
			},
		}
	},
	"lena_nizong2": {
		enable: "chooseToUse",
		audio: "lena_bianzhuang",
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
	"lena_zhiao2": {
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return game.hasPlayer(function (target) {
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
					if (game.hasPlayer(function (target) {
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

	// 铃鹿朔夜
	"sakuya_tiaoting": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { global: "damageBefore" },
		usable: 1,
		filter(event, player) {
			return event.source != player && player.countCards("he");
		},
		check(event, player) {
			return get.attitude(player, event.player) > 0;
		},
		async content(event, trigger, player) {
			const target = trigger.source;
			player.chooseToDebate([player, trigger.source]).set("callback", async event => {
				const result = event.debateResult;
				if (result?.bool) {
					if (result.opinion === "black") {
						await trigger.source.damage(player, 1);
					} else if (result.opinion === "red") {
						trigger.num--;
					}
				}
				const targets = result.red.map(i => i[0]);
				for (let target of targets) {
					const result = await target.chooseTarget("请选择一名其他角色摸两张牌", function (card, player, current) {
						return current != player;
					}).set("ai", function (target) {
						return get.attitude(_status.event.player, target);
					}).forResult();

					if (result.bool) {
						const chosenTarget = result.targets[0];
						target.line(chosenTarget, "green");
						await chosenTarget.draw(2);
					}
				}
			});
		},
		ai: {
			expose: 0.2,
			threaten: 1.5,
		},
	},
	"sakuya_huanzheng": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { global: "phaseEnd" },
		filter(event, player) {
			const usageCount2 = player.getHistory("useSkill").filter(evt => evt.skill === "sakuya_tiaoting").length;
			return player.getHistory('damage').length > 0 && usageCount2 < 1;
		},
		async content(event, trigger, player) {
			const choiceList = [
				'将手牌摸至体力上限',
				'回复1点体力'
			];

			const controls = [];
			if (player.countCards('h') < player.maxHp) controls.push('选项一');
			if (player.hp < player.maxHp) controls.push('选项二');
			controls.push('cancel2');

			const result = await player.chooseControl(controls).set('choiceList', choiceList).set('ai', function () {
				if (controls.includes('选项二')) return '选项二';
				if (controls.includes('选项一')) return '选项一';
				return 'cancel2';
			}).forResult();

			if (result.control == '选项一') {
				await player.draw(player.maxHp - player.countCards('h'));
			} else if (result.control == '选项二') {
				await player.recover();
			}
		},
		ai: {
			effect: {
				player: function (card, player, target) {
					if (get.tag(card, 'damage') && player.getHistory('damage').length == 0) {
						return [1, 3];
					}
				}
			}
		}
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
		audio: "ext:魔法纪录/audio/skill:2",
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

	// 里见灯花
	"toka_jiquan": {
		audio: "ext:魔法纪录/audio/skill:2",
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
					if (event.getParent().name == "toka_zhisuan") return false;
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
		audio: "ext:魔法纪录/audio/skill:2",
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

	//黑江
	"kuroe_zhuxing": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "gainAfter" },
		forced: true,
		filter(event, player) {
			return event.getParent(2, true)?.name != "kuroe_zhuxing_use";
		},
		async content(event, trigger, player) {
			for (const card of trigger.cards) {
				const suit = get.suit(card);
				if (!player.storage.kuroe_zhuxing_suits) {
					player.storage.kuroe_zhuxing_suits = [];
				}
				if (!player.storage.kuroe_zhuxing_suits.includes(suit)) {
					player.storage.kuroe_zhuxing_suits.push(suit);
					player.markAuto("kuroe_zhuxing_suits", [suit]);
				}
			}
			player.addTip("kuroe_zhuxing", get.translation("kuroe_zhuxing") + player.getStorage("kuroe_zhuxing_suits").reduce((str, suit) => str + get.translation(suit), ""));
		},

		group: ["kuroe_zhuxing_use", "kuroe_zhuxing_recast"],
		subSkill: {
			use: {
				enable: "phaseUse",
				filter(event, player) {
					return player.storage.kuroe_zhuxing_suits?.length > 0;
				},
				async content(event, trigger, player) {
					const suits = player.storage.kuroe_zhuxing_suits.slice();
					const result = await player
						.chooseButton(["逐星：选择要移除的花色", `<div class="text center">花色</div>`, [suits.map(suit => [suit, get.translation(suit)]), "tdnodes"]])
						.set("selectButton", [1, suits.length])
						.set("ai", button => {
							return Math.random();
						})
						.forResult();
					if (!result.bool || !result.links?.length) return;
					const removedSuits = result.links;
					for (const s of removedSuits) {
						player.storage.kuroe_zhuxing_suits.remove(s);
						player.unmarkAuto("kuroe_zhuxing_suits", [s]);
					}
					const cards = [...player.getCards("h"), ...player.getCards("e")].filter(c => removedSuits.includes(get.suit(c)));
					if (cards.length) await player.discard(cards);
					player.draw(removedSuits.length + cards.length);

					if (player.storage.kuroe_zhuxing_suits.length == 0) {
						player.removeTip("kuroe_zhuxing");
					} else {
						player.addTip("kuroe_zhuxing", get.translation("kuroe_zhuxing") + player.getStorage("kuroe_zhuxing_suits").reduce((str, suit) => str + get.translation(suit), ""));
					}
				},
				ai: {
					order: 1,
					result: {
						player: 1,
					},
					threaten: 1.5,
				},
			},
			recast: {
				trigger: {
					player: "phaseEnd",
				},
				filter(event, player) {
					return player.countCards("h") > 0;
				},
				async cost(event, trigger, player) {
					const result = await player.chooseCard(get.prompt("kuroe_zhuxing") + "：是否重铸至多2张牌？", "h", [1, 2])
						.set("ai", (card) => {
							return 10 - get.value(card);
						}).forResult();
					event.result = { bool: result.bool, cards: result.cards };
				},
				async content(event, trigger, player) {
					await player.recast(event.cards);
				},
			}
		},
	},
	"kuroe_baoshen": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: ["chooseToRespondBefore", "chooseToUseBefore"],
		},
		filter(event, player) {
			if (event.responded) return false;
			if (!event.filterCard({ name: "shan", isCard: true }, player, event)) return false;
			return true;
		},
		async content(event, trigger, player) {
			const judge = await player.judge(card => {
				if (!player.storage.kuroe_zhuxing_suits || player.storage.kuroe_zhuxing_suits.length === 0) {
					return 1; // 没有记录花色时，获得判定牌
				}
				const suit = get.suit(card);
				if (player.storage.kuroe_zhuxing_suits.includes(suit)) {
					return 2; // 花色在记录中，视为使用闪
				}
				return 1; // 花色不在记录中，获得判定牌
			}).forResult();

			if (player.storage.kuroe_zhuxing_suits && player.storage.kuroe_zhuxing_suits.includes(get.suit(judge.card))) {
				trigger.untrigger();
				trigger.set("responded", true);
				trigger.result = { bool: true, card: { name: "shan", isCard: true } };
				player.storage.kuroe_zhuxing_suits.remove(get.suit(judge.card));
				if (player.storage.kuroe_zhuxing_suits.length == 0) {
					player.removeTip("kuroe_zhuxing");
				} else {
					player.addTip("kuroe_zhuxing", get.translation("kuroe_zhuxing") + player.getStorage("kuroe_zhuxing_suits").reduce((str, suit) => str + get.translation(suit), ""));
				}
			}
			await player.gain(judge.card, "gain2");
		},
		ai: {
			respondShan: true,
			freeShan: true,
			skillTagFilter(player) {
				return true;
			},
			effect: {
				target(card, player, target) {
					if (get.tag(card, "respondShan")) {
						if (target.storage.kuroe_zhuxing_suits && target.storage.kuroe_zhuxing_suits.length > 0) {
							return [0.8, 0.8];
						}
					}
				},
			},
		},
	},

	// 塔鲁特(贞德)
	"dArc_shengnv": {
		group: ["dArc_shengnv_use", "dArc_shengnv_respond"],
		global: "dArc_shengnv_boost",
		ai: {
			effect: {
				target: function (card, player, target, current) {
					if (player === current) {
						if (card.name === 'sha') return [1, -1.5]; 
						if (card.name === 'tao') return [2, 1];    
					}
				}
			}
		}
	},
	"dArc_shengnv_use": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "useCard" },
		forced: true,
		filter: function (event, player) {
			return get.type(event.card) === "basic";
		},
		content: function () {
			var name = trigger.card.name;
			if (name === 'sha' || name === 'tao' || name === 'jiu') {
				trigger.card.dArc_boosted = true; 
				// 【修复核心】：如果是酒，单独加上专属记忆标记，防止被引擎吞掉
				if (name === 'jiu') {
					player.addTempSkill('dArc_shengnv_jiu_boost', 'damageAfter');
					player.addMark('dArc_shengnv_jiu_boost', 1, false);
				}
			} else {
				player.draw();
			}
		}
	},
	// 专门为【酒】讨回公道的伤害补丁
	"dArc_shengnv_jiu_boost": {
		trigger: { source: "damageBegin1" },
		forced: true,
		charlotte: true,
		filter: function(event, player) {
			return event.card && event.card.name === 'sha' && event.notMe !== true;
		},
		content: function(event, trigger, player) {
			var count = player.countMark('dArc_shengnv_jiu_boost');
			trigger.num += count;
			game.log(player, "的", "#g【酒】", "被", "#y【圣女】", "强化，额外造成了", "#r" + count + "点", "伤害！");
			player.removeSkill('dArc_shengnv_jiu_boost');
		},
		onremove: function(player) {
			player.removeMark('dArc_shengnv_jiu_boost', player.countMark('dArc_shengnv_jiu_boost'));
		}
	},
	"dArc_shengnv_boost": {
		trigger: {
			source: "damageBegin1",
			global: "recoverBegin"
		},
		forced: true,
		charlotte: true,
		filter: function(event, player) {
			if (event.name == 'damage' && event.source == player && event.card && event.card.dArc_boosted) return true;
			if (event.name == 'recover' && event.card && event.card.dArc_boosted) {
				return event.source == player || (event.player == player && !event.source);
			}
			return false;
		},
		content: function() {
			trigger.num++; 
			game.log(trigger.card, "被", "#y【圣女】", "强化，数值额外", "#r+1");
			// 删除了原来错误的 jiu 判定，交由 dArc_shengnv_jiu_boost 完美处理
		}
	},
	"dArc_shengnv_respond": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "respond"
		},
		forced: true,
		filter: function (event, player) {
			return get.type(event.card) === "basic";
		},
		content: function () {
			player.draw();
		}
	},

	"dArc_shengjian_lv1": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) { return player.countCards('h', { color: 'red' }) > 0; },
		ai: {
			order: 9, 
			result: {
				player: function (player) {
					var hasAwaken = player.hasSkill("dArc_sushengheng");
					var hasSaveCard = player.countCards('h', function(c){ 
						return c.name === 'tao' || c.name === 'jiu'; 
					}) > 0;

					if (player.hp === 1 && hasAwaken && hasSaveCard) return 100;
					if (player.hp === 2 && player.countCards('h') <= 2 && hasAwaken) return 100;
					if (player.hp >= 3) return 10;
					if (player.hp === 1 && player.getCards('e').length > 0 && player.countCards('h', {name:'tao'}) > 0) return 1;
					return 0;
				}
			}
		},
		content: function () {
			"step 0"
			event.hasWeapon = player.getCards('e', { subtype: 'equip1' }).length > 0;
			player.chooseToDiscard('h', { color: 'red' }, 1, true)
				.set('prompt', '弃置一张红色手牌并流失1点体力')
				.set('ai', function(card) { return 6 - get.value(card); }); 
			"step 1"
			player.loseHp(1);
			player.equip(game.createCard("ClovisSword", "heart", 2));
			"step 2"
			if (event.hasWeapon) {
				player.chooseControl('sha', 'tao', 'jiu')
					.set('prompt', '视为对攻击范围内一名角色使用一张基本牌')
					.set('cancelDialog', true)
					.set('ai', function() {
						var p = _status.event.player;
						if (game.hasPlayer(function(current){ return get.attitude(p, current) > 0 && current.hp <= 2; })) return 'tao';
						if (game.hasPlayer(function(current){ return get.attitude(p, current) < 0 && p.inRange(current); })) return 'sha';
						return 'tao';
					});
			} else { event.finish(); }
			"step 3"
			if (result.control) {
				event.cardName = result.control;
				player.chooseTarget(1, function (card, player, target) { return player.inRange(target) || target == player; })
					.set('cardN', event.cardName)
					.set('ai', function(target) {
						var p = _status.event.player;
						var cName = _status.event.cardN; 
						if (cName === 'tao') return get.attitude(p, target) > 0 ? (10 - target.hp) : 0;
						if (cName === 'sha') return get.attitude(p, target) < 0 ? (10 - target.hp) : 0;
						if (cName === 'jiu') return target === p ? 1 : 0;
						return 0;
					});
			} else { event.finish(); }
			"step 4"
			if (result.bool && result.targets.length > 0) {
				var target = result.targets[0];
				player.line(target, "green");
				if (event.cardName == 'tao') {
					var tao = game.createCard('tao');
					player.useCard(tao, target, false);
				} else if (event.cardName == 'jiu') {
					var jiu = game.createCard('jiu');
					player.useCard(jiu, target, false);
				} else {
					var sha = game.createCard('sha');
					player.useCard(sha, target, false);
				}
			}
		},
	},
	"dArc_shengjian_lv2": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) { 
			return player.countCards('he', { color: 'red' }) > 0; 
		},
		ai: {
			order: 9, 
			result: {
				player: function (player) {
					if (player.hp === 2 && player.countCards('h') <= 2 && player.hasSkill("dArc_dansheng")) return 100;
					if (player.hp >= 3) return 10;
					if (player.hp === 1 && player.getCards('e').length > 0 && player.countCards('h', {name:'tao'}) > 0) return 1;
					return 0;
				}
			}
		},
		content: function () {
			"step 0"
			event.hasEquip = player.getCards('e').length > 0;
			player.chooseToDiscard('he', { color: 'red' }, 1, true)
				.set('prompt', '弃置一张红色牌并流失1点体力')
				.set('ai', function(card) { return 6 - get.value(card); });
			"step 1"
			player.loseHp(1);
			player.chooseControl("ClovisSword", "LightLance")
				.set('prompt', '请选择置入的装备')
				.set('ai', function() { return "ClovisSword"; });
			"step 2"
			player.equip(game.createCard(result.control || "ClovisSword", "heart", 2));
			"step 3"
			if (event.hasEquip) {
				player.chooseControl('sha', 'tao', 'jiu')
					.set('prompt', '视为对攻击范围内一名角色使用一张基本牌')
					.set('cancelDialog', true)
					.set('ai', function() {
						var p = _status.event.player;
						if (game.hasPlayer(function(current){ return get.attitude(p, current) > 0 && current.hp <= 2; })) return 'tao';
						if (game.hasPlayer(function(current){ return get.attitude(p, current) < 0 && p.inRange(current); })) return 'sha';
						return 'tao';
					});
			} else { event.finish(); }
			"step 4"
			if (result.control) {
				event.cardName = result.control;
				player.chooseTarget(1, function (card, player, target) { return player.inRange(target) || target == player; })
					.set('cardN', event.cardName)
					.set('ai', function(target) {
						var p = _status.event.player;
						var cName = _status.event.cardN;
						if (cName === 'tao') return get.attitude(p, target) > 0 ? (10 - target.hp) : 0;
						if (cName === 'sha') return get.attitude(p, target) < 0 ? (10 - target.hp) : 0;
						if (cName === 'jiu') return target === p ? 1 : 0;
						return 0;
					});
			} else { event.finish(); }
			"step 5"
			if (result.bool && result.targets.length > 0) {
				var target = result.targets[0];
				player.line(target, "green");
				if (event.cardName == 'tao') {
					var tao = game.createCard('tao');
					player.useCard(tao, target, false);
				} else if (event.cardName == 'jiu') {
					var jiu = game.createCard('jiu');
					player.useCard(jiu, target, false);
				} else {
					var sha = game.createCard('sha');
					player.useCard(sha, target, false);
				}
			}
		}
	},

	"dArc_susheng": {
		audio: "ext:魔法纪录/audio/skill:2",
		juexingji: true,
		trigger: { player: "dyingAfter" },
		skillAnimation: true,
		animationColor: "gold",
		forced: true,
		// ai觉醒
		ai: {
			effect: {
				target: function (card, player, target, current) {
					if (target === current && target.hp === 1 && target.countCards('he', function(c){ return c.name === 'tao' || c.name === 'jiu'; }) > 0) {
						if (card.name === 'sha' || card.name === 'juedou' || get.tag(card, 'damage')) {
							return [1, 100]; 
						}
					}
				}
			}
		},
		content: function () {
			"step 0"
			    player.awakenSkill("dArc_susheng");
			    player.$fullscreenpop("圣女复活", "gold"); 
			"step 1" 
			    player.recover(1);
			    player.gainMaxHp(1);
			    player.removeSkill("dArc_shengjian_lv1");
			    player.addSkills(["dArc_shengjian_lv2", "dArc_zaihui", "dArc_dansheng"]);
		}
	},
	"dArc_zaihui": {
		audio: "ext:魔法纪录/audio/skill:2",
		forced: true,
		trigger: { player: ["phaseZhunbeiBegin", "phaseEnd"] },
		filter: function (event, player) { return game.hasPlayer(function(current) { return current.isDamaged(); }); },
		content: function () {
			"step 0"
			player.chooseTarget('令任意名已受伤的角色摸一张牌', [1, Infinity], function (card, player, target) {
				return target.isDamaged();
			})
			.set('ai', function (target) {
				return get.attitude(_status.event.player, target) > 0 ? 1 : 0;
			});
			"step 1"
			if (result.bool) {
				event.targets = result.targets;
				player.line(event.targets, "green");
				game.asyncDraw(event.targets);
				
				player.chooseTarget('令其中一名角色回复一点体力并增加一点体力上限', 1, function(card, player, target) {
					return event.targets.includes(target);
				}, true)
				.set('ai', function(target) {
					return get.attitude(_status.event.player, target) > 0 ? (10 - target.hp) : 0;
				});
			} else { event.finish(); }
			"step 2"
			if (result.bool) {
				var target = result.targets[0];
				target.recover(1);
				target.gainMaxHp(1);
			}
		},
		mod: {
			maxHandcard: function (player, num) { return player.maxHp; }
		},
	},
	"dArc_dansheng": {
		audio: "ext:魔法纪录/audio/skill:2",
		persevereSkill: true,
		juexingji: true,
		trigger: { player: "phaseZhunbeiBegin" }, 
		forced: true,
		skillAnimation: true,
		animationColor: "gold",
		filter: function (event, player) {
			return player.hp === 1 && player.countCards("h") <= 1;
		},
		ai: {
			effect: {
				target: function (card, player, target, current) {
					if (get.attitude(player, target) < 0 && target.hasSkill('dArc_dansheng')) {
						// 敌人检测检贞德状态
						var isNext = (player.next === target);
						var isTeammateNext = (get.attitude(player.next, target) > 0 && player.next.next === target);
						
						if (isNext || isTeammateNext) {
							var hNum = target.countCards('h'); 
							
							// 1. 防觉醒压血
							if (get.tag(card, 'damage') && target.hp === 2 && hNum <= 2) {
								var damageCards = player.countCards('h', function(c) {
									return ['sha', 'juedou', 'huogong', 'nanman', 'wanjian'].includes(c.name);
								});
								
								// 检测爆发
								if (damageCards <= 1 && !player.hasSkill('jiu') && card.name !== 'jiu') {
									return 'zerotarget'; 
								}
							}
							
							// 2. 防觉醒拆牌
							if (['guohe', 'shunshou', 'tui'].includes(card.name) && target.hp === 1 && hNum > 0 && hNum <= 3) {
								return 'zerotarget';
							}
						}
					}
				}
			}
		},
		content: function () {
			"step 0"
				player.awakenSkill("dArc_dansheng");
				player.$fullscreenpop("完美破格者", "gold"); 
			"step 1" 
				var diff = player.maxHp - 1;
				player.removeSkills(["dArc_shengjian_lv1", "dArc_shengjian_lv2", "dArc_zaihui", "dArc_shengnv", "dArc_shengnv_boost"]);
				
				player.reinit(player.name, "Final_dArc");
				
				player.maxHp = 1;
				player.hp = 1;
				player.update();
				
				if (diff > 0) { 
					player.draw(diff); 
				}
			"step 2"
				game.addGlobalSkill("MerciVraiment");
                player.addTempSkill("Final_dArc_invincible");
		}
	},
	"Final_dArc_invincible": {
		charlotte: true,
		mark: true,
		marktext: "致谢",
		intro: { 
		    content: "防止受到的所有伤害" 
		},
		trigger: { 
		    player: "damageBefore" 
		},
		forced: true,
		content: function () { 
			trigger.cancel(); 
		}
	},

	// 极贞德(塔鲁特)
"Final_dArc_poge": {
		audio: "ext:魔法纪录/audio/skill:2",
		persevereSkill: true,
		mod: {
			targetInRange: function(card, player, target) { return true; },
			cardUsable: function(card, player, num) { return Infinity; },
		},
		trigger: { source: "damageBegin1", global: "recoverBegin" },
		forced: true,
		priority: 10,
		filter: function(event, player) {
			if (event.name == 'damage' && event.source == player && event.card && (event.card.name == 'sha' || event.card.name == 'jiu')) return true;
			if (event.name == 'recover' && event.card && event.card.name == 'tao') {
				return event.source == player || (event.player == player && !event.source);
			}
			return false;
		},
		content: function () {
			trigger.num++;
			if (event.name == 'damage') {
				game.log(trigger.card, "被", "#y【破格】", "强化，伤害额外", "#r+1");
			} else {
				game.log(trigger.card, "被", "#y【破格】", "强化，回复量额外", "#g+1");
			}
		},
		// 挂载专用监听器
		group: ["Final_dArc_poge_use", "Final_dArc_poge_MaxHp"] 
	},
	
	"Final_dArc_poge_use": {
		trigger: { player: "useCard" },
		forced: true,
		silent: true,
		filter: function (event, player) {
			return event.card && event.card.name === 'jiu';
		},
		content: function (event, trigger, player) {
			// 喝了酒就挂上记忆标记
			player.addTempSkill('Final_dArc_poge_jiu_boost', 'damageAfter');
			player.addMark('Final_dArc_poge_jiu_boost', 1, false);
		}
	},
	
	"Final_dArc_poge_jiu_boost": {
		trigger: { source: "damageBegin1" },
		forced: true,
		charlotte: true,
		filter: function(event, player) {
			return event.card && event.card.name === 'sha' && event.notMe !== true;
		},
		content: function(event, trigger, player) {
			var count = player.countMark('Final_dArc_poge_jiu_boost');
			trigger.num += count;
			game.log(player, "的", "#g【酒】", "被", "#y【破格】", "强化，额外造成了", "#r" + count + "点", "伤害！");
			player.removeSkill('Final_dArc_poge_jiu_boost');
		},
		onremove: function(player) {
			player.removeMark('Final_dArc_poge_jiu_boost', player.countMark('Final_dArc_poge_jiu_boost'));
		}
	},
	
	"Final_dArc_poge_MaxHp": {
		trigger: { source: "damageEnd" },
		forced: true, 
		priority: -50, // 等待伤害完全结算
		filter: function (event, player) {
			return event.player != player && event.player.maxHp > 0 && event.player.isAlive();
		},
		content: function () {
			trigger.player.loseMaxHp(trigger.num);
			game.log(trigger.player, "因", "#y【破格】", "的压制，失去了", "#r" + trigger.num + "点", "体力上限！");
		}
	},
	"Final_dArc_guangying": {
		persevereSkill: true,
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { 
		    global: "phaseBefore", 
		    player: ["enterGame", "phaseZhunbeiBegin"] 
		},
		forced: true,
		filter: function (event, player) { 
			return event.name != "phase" || game.phaseNumber == 0 || event.name == "phaseZhunbeiBegin"; 
		},
		content: function () {
			player.equip(game.createCard({ name: "LightSword", suit: "heart", number: 13 }));
			player.equip(game.createCard({ name: "ShadowGauntlets", suit: "spade", number: 1 }));
		},
		mod: {
			canBeDiscarded: function (card, player, target, event) { if (get.position(card) == "e") return false; },
			canBeGained: function (card, player, target, event) { if (get.position(card) == "e") return false; }
		}
	},
	"Final_dArc_tianmen": {
		persevereSkill: true,
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { global: "dying", source: "damageEnd" },
		forced: true,
		filter: function (event, player, name) {
			if (name == 'dying') return true;
			if (name == 'damageEnd') return event.num > event.player.maxHp;
		},
		content: function () {
			// 无来源斩杀，如需要更改删除后续部分
			trigger.player.die()._triggered = null;
		}
	},
	"Final_dArc_silence_cards": {
		charlotte: true, mark: true,
		mod: {
			cardEnabled2: function () { 
			    return false; 
			},
			cardRespondable2: function () { 
			    return false; 
			},
		}
	},
	"MerciVraiment": {
		persevereSkill: true,
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { global: "phaseBefore", player: "phaseZhunbeiBegin" },
		forced: true,
		filter: function (event, player) { 
			return (event.name != "phase" || game.phaseNumber == 0) || player.name == "Final_dArc"; 
		},
		content: function () {
			var players = game.filterPlayer();
			for (var i = 0; i < players.length; i++) {
				var p = players[i];
				p.hp = p.maxHp;
				p.update();
				p.draw(4);
			}
		}
	},
	
	// 莉兹
	"Riz_caoying": {
		group: ["Riz_caoying_start", "Riz_caoying_attack", "Riz_caoying_defend", "Riz_caoying_defend_effect"],
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "gainAfter",
		},
		forced: true,
		filter(event, player) {
			if (player.hasSkill("Riz_caoying_ban")) return false; 
			if (event.getg(player).length === 0) return false;
			// 防止多拿影
			return !event.getParent().name.startsWith("Riz_caoying");
		},
		async content(event, trigger, player) {
			await player.gain(lib.card.ying.getYing(), "gain2");
		},
		subSkill: {
			start: {
				trigger: { global: "roundStart" },
				forced: true,
				filter: function (event, player) {
					return game.roundNumber === 1;
				},
				content: async function (event, trigger, player) {
					await player.gain(lib.card.ying.getYing(), "gain2");
				}
			},
			attack: {
				enable: "chooseToUse",
				filter(event, player) {
					if (player.hasSkill("Riz_caoying_ban")) return false; 
					return player.countCards("hs", card => card.name === "ying") >= 2;
				},
				selectCard: 2,
				filterCard: function (card) {
					return card.name === "ying";
				},
				position: "hs",
				locked: false,
				viewAs: {
					name: "sha",
					nature: "stab",
					isCard: true,
					skill: "Riz_caoying_attack", 
				},
				prompt: "将两张【影】当做无次数限制的刺【杀】使用",
				check(card) {
					return 6 - get.value(card);
				},
				ai: {
					order: function() {
						return get.order({name: "sha"}) + 0.2; 
					},
					result: {
						player: function(player, target) {
							if (player.hp <= 2 && player.countCards("hs", {name: "ying"}) < 3) return 0;
							return 1;
						}
					}
				},
				sub: true,
				sourceSkill: "Riz_caoying",
				"_priority": 0,
			},
			defend: {
				audio: false,
				enable: ["chooseToUse", "chooseToRespond"],
				filter(event, player) {
					if (player.hasSkill("Riz_caoying_ban")) return false; 
					if (!event.filterCard({ name: "shan", isCard: true }, player, event)) return false;
					return player.countCards("hs", card => card.name === "ying") >= 1;
				},
				filterCard: function (card) {
					return card.name === "ying";
				},
				selectCard: 1,
				position: "hs",
				viewAs: {
					name: "shan",
					isCard: true
				},
				prompt: "将一张【影】当做【闪】使用并摸一张牌，然后令该技能失效直到本回合结束",
				ai: {
					respondShan: true,
					skillTagFilter(player, tag, arg) {
						if (player.countCards("h", card => card.name === "ying") < 1) return false;
					},
					order: 5,
					result: { player: 1 },
				},
			},
			defend_effect: {
				trigger: { player: ["useCard", "respond"] },
				forced: true,
				popup: false,
				filter: function (event, player) {
					return event.skill === "Riz_caoying_defend";
				},
				async content(event, trigger, player) {
					await player.draw();
					player.addTempSkill("Riz_caoying_ban");
					game.log(player, "的技能", "#g【织影】", "失效直到本回合结束");
				}
			},
			ban: {
				charaction: "temp_ban",
				mark: true,
				intro: { content: "织影已失效" }
			}
		},
		mod: {
			ignoredHandcard(card, player) {
				if (get.name(card) === "ying") return true;
			},
			cardDiscardable(card, player, name) {
				if (name === "phaseDiscard" && get.name(card) === "ying") return false;
			},
			cardUsable(card, player, num) {
				if (card.name === "sha" || card.name === "cisha") {
					if (card.skill === "Riz_caoying_attack") return Infinity;
					
					var count = player.getHistory("useCard", function (evt) {
						return evt.skill === "Riz_caoying_attack" || (evt.card && evt.card.skill === "Riz_caoying_attack");
					}).length;
					
					if (count > 0 && num !== Infinity) {
						return num + count; 
					}
				}
			}
		},
		"_priority": 0,
	},
	"Riz_yingfu": {
		audio: "ext:魔法纪录/audio/skill:2",
		group: ["Riz_yingfu_clear", "Riz_yingfu_damage_track"],
		trigger: {
			global: "damageBegin1",
		},
		filter: function (event, player) {
			if (event.player === player) return false; 
			if (!event.card || event.card.name !== "sha") return false;
			if (!event.source || event.source === player) return false;
			
			var maxLimit = Math.max(0, player.maxHp - player.hp);
			if (maxLimit <= 0) return false;
			// 确保手里有影
			if (!player.countCards("h", function (c) { return c.name === "ying"; })) return false;
			if ((player.storage.Riz_yingfu_roundused || 0) >= maxLimit) return false;
			
			return true;
		},
		prompt: function(event, player) {
			return "是否发动【影缚】？弃置一张【影】，防止 " + get.translation(event.player) + " 受到的伤害，并对 " + get.translation(event.source) + " 视为使用一张【决斗】。";
		},
		// ai修复
		check: function (event, player) {
			var ai_target = event.player; 
			var ai_source = event.source; 
			
			// 1. 对敌不发动
			if (get.attitude(player, ai_target) <= 0) return false;
			if (ai_source && get.attitude(player, ai_source) > 0) return false;
			
			// 2. 状态不佳不发动
			var shaCount = player.countCards("h", {name: "sha"});
			var enemyCards = ai_source ? ai_source.countCards("h") : 0;
			if (player.hp <= 1 && shaCount === 0 && enemyCards >= 2) {
				if (ai_target.hp > 1) return false; // 除非队友也濒死才救
			}
			
			return true;
		},
		init: function (player) {
			if (player.storage.Riz_yingfu_roundused === undefined) {
				player.storage.Riz_yingfu_roundused = 0;
			}
		},
		content: async function (event, trigger, player) {
			var go = await player.chooseToDiscard("h", 1, true, function (card) {
				return card.name === "ying";
			}).forResult();

			if (!go.bool) return;
			
			player.storage.Riz_yingfu_roundused = (player.storage.Riz_yingfu_roundused || 0) + 1;
			var source = trigger.source;
			var target = trigger.player;

			trigger.cancel();
			game.log(player, "防止了", target, "受到的伤害！");

			if (source && source.isAlive()) {
				var juedou = game.createCard({ name: "juedou", isCard: true });
				juedou.Riz_yingfu_card = true;
				await player.useCard(juedou, source);
			}
		},
		subSkill: {
			clear: {
				trigger: { global: "roundStart" },
				forced: true,
				popup: false,
				content: function (event, trigger, player) {
					player.storage.Riz_yingfu_roundused = 0;
				}
			},
			damage_track: {
				trigger: { global: "damageEnd" },
				forced: true,
				popup: false,
				filter: function (event, player) {
					return event.card && event.card.Riz_yingfu_card === true;
				},
				content: function (event, trigger, player) {
					trigger.player.addTempSkill("Riz_yingfu_debuff");
					game.log(trigger.player, "受", "#g【影缚】", "影响，本回合无法使用、打出或弃置黑色牌");
				}
			},
			debuff: {
				mark: true,
				intro: { content: "本回合无法使用、打出或弃置黑色牌" },
				mod: {
					cardDiscardable: function (card, player, name) {
						if (get.color(card) === "black") return false;
					},
					cardEnabled2: function (card, player) { 
						if (get.color(card) === "black") return false;
					},
					cardEnabled: function (card, player) { 
						if (get.color(card) === "black") return false;
					},
					cardUsable: function (card, player) {
						if (get.color(card) === "black") return false;
					},
					cardRespondable: function (card, player) {
						if (get.color(card) === "black") return false;
					}
				}
			}
		}
	},
	"Riz_anwu": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "useCardToPlayered",
		},
		filter(event, player) {
			if (event.target === player) return false; 
			return event.card.name === "sha" || event.card.name === "juedou";
		},
		init(player) {
			if (player.storage.Riz_anwu === undefined) {
				player.storage.Riz_anwu = 0;
			}
		},
		forced: true,
		ai: {
			effect: {
				target: function (card, player, target) {
					if ((card.name === "sha" || card.name === "juedou") && player !== target && get.attitude(player, target) < 0) {
						return [1, -1.5];
					}
				}
			}
		},
		async content(event, trigger, player) {
			var target = trigger.target;
			var cards = target.getCards("he");
			if (cards.length > 0) {
				var toDiscard = cards.randomGet();
				await target.discard(toDiscard);
				
				player.storage.Riz_anwu++;
				if (player.storage.Riz_anwu % 2 === 0) {
					await player.draw();
				}
			}
		},
		"_priority": 0,
	},
	
    // 梅丽莎
	"Melissa_bengmie_lv1": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "shaMiss",
			global: ["useCard", "respond"]
		},
		forced: true,
		group: [
			"Melissa_bengmie_clear",
			"Melissa_bengmie_damage" 
		],
		// 【修复核心】：引入第三个参数 name，精准获取触发器名称
		filter: function (event, player, name) {
			var history = player.storage.Melissa_bengmie_history || [];
			
			if (name === "shaMiss" || event.name === "sha") {
				if (!event.card) return false;
				return !history.includes(event.card.name);
			} else {
				if (event.player === player) return false; 
				if (event.card && event.card.name === "wuxie") {
					var p = event.getParent("useCard");
					if (p && p.player === player && p.card) {
						if (!history.includes(p.card.name) && !p.bengmie_wuxie_caught) {
							return true;
						}
					}
				}
				return false;
			}
		},
		content: function () {
			"step 0"
			var history = player.storage.Melissa_bengmie_history || [];
			var target;
			
			// 结算时通过卡牌名反向精准推导
			if (trigger.card && trigger.card.name === "wuxie") {
				var p = trigger.getParent("useCard");
				history.push(p.card.name);
				target = trigger.player;
				p.bengmie_wuxie_caught = true; 
			} else {
				history.push(trigger.card.name);
				target = trigger.target;
			}
			
			player.storage.Melissa_bengmie_history = history;
			event.cancelTarget = target; 

			if (event.cancelTarget && event.cancelTarget.isAlive()) {
				player.line(event.cancelTarget, "green");
				player.draw();
				event.cancelTarget.draw();
			} else {
				event.finish();
			}
			"step 1"
			var target = event.cancelTarget;
			var op1_prompt = "受到1点伤害（并获得【愤】标记）";
			var count = target.countMark("Melissa_bengmie_nu") + 1;
			var op2_prompt = "弃置两张牌，本轮内其下次对你造成伤害翻" + Math.max(2, count) + "倍（并获得【怒】标记）";
			
			target.chooseControl("选项一", "选项二")
				.set("prompt", "请选择【崩灭】的一项效果")
				.set("choiceList", [op1_prompt, op2_prompt])
				.set("ai", function () {
					var evtPlayer = _status.event.player; 
					if (evtPlayer.hp <= 1) return "选项二";
					if (evtPlayer.countCards("he") < 2) return "选项一";
					if (evtPlayer.hp >= 3) return "选项一";
					return "选项二";
				});
			"step 2"
			var target = event.cancelTarget;
			if (result.control === "选项一") {
				target.damage(1);
				target.addMark("Melissa_bengmie_fen", 1, false);
				target.storage.Melissa_bengmie_op1_count = (target.storage.Melissa_bengmie_op1_count || 0) + 1;
			} else {
				target.chooseToDiscard("he", 2, true);
				target.addMark("Melissa_bengmie_nu", 1, false);
			}
		}
	},
	"Melissa_bengmie_lv2": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "shaMiss",
			global: ["useCard", "respond"]
		},
		forced: true,
		group: [
			"Melissa_bengmie_clear",
			"Melissa_bengmie_damage" 
		],
		filter: function (event, player, name) {
			var history = player.storage.Melissa_bengmie_history || [];
			
			if (name === "shaMiss" || event.name === "sha") {
				if (!event.card) return false;
				return !history.includes(event.card.name);
			} else {
				if (event.player === player) return false; 
				if (event.card && event.card.name === "wuxie") {
					var p = event.getParent("useCard");
					if (p && p.player === player && p.card) {
						if (!history.includes(p.card.name) && !p.bengmie_wuxie_caught) {
							return true;
						}
					}
				}
				return false;
			}
		},
		content: function () {
			"step 0"
			var history = player.storage.Melissa_bengmie_history || [];
			var target;
			
			if (trigger.card && trigger.card.name === "wuxie") {
				var p = trigger.getParent("useCard");
				history.push(p.card.name);
				target = trigger.player;
				p.bengmie_wuxie_caught = true; 
			} else {
				history.push(trigger.card.name);
				target = trigger.target;
			}
			
			player.storage.Melissa_bengmie_history = history;
			event.cancelTarget = target; 

			if (event.cancelTarget && event.cancelTarget.isAlive()) {
				player.line(event.cancelTarget, "green");
				player.draw();
				event.cancelTarget.draw();
			} else {
				event.finish();
			}
			"step 1"
			var target = event.cancelTarget;
			var op1_count = target.storage.Melissa_bengmie_op1_count || 0;
			var op2_count = target.countMark("Melissa_bengmie_nu");
			
			var op1_prompt = "受到1点伤害" + (op1_count > 0 ? "（因此项已触发过，你将随机废除一个装备栏）" : "") + "（【愤】标记）";
			var op2_prompt = "弃置两张牌，本轮内其每次对你造成伤害翻" + Math.max(2, op2_count + 1) + "倍（【怒】标记）";
			
			target.chooseControl("选项一", "选项二")
				.set("prompt", "请选择【崩灭】(Lv2)的一项效果")
				.set("choiceList", [op1_prompt, op2_prompt])
				.set("ai", function () {
					var evtPlayer = _status.event.player; 
					if (evtPlayer.hp <= 1) return "选项二";
					if (evtPlayer.countCards("he") < 2) return "选项一";
					if (evtPlayer.hp >= 3) return "选项一";
					return "选项二";
				});
			"step 2"
			var target = event.cancelTarget;
			if (result.control === "选项一") {
				target.damage(1);
				event.op1_count = target.storage.Melissa_bengmie_op1_count || 0;
				target.addMark("Melissa_bengmie_fen", 1, false);
				target.storage.Melissa_bengmie_op1_count = event.op1_count + 1;
			} else {
				target.chooseToDiscard("he", 2, true);
				target.addMark("Melissa_bengmie_nu", 1, false);
				event.finish(); 
			}
			"step 3"
			var target = event.cancelTarget;
			if (event.op1_count > 0 && target.hasEnabledSlot) {
				var list = [];
				for (var i = 1; i <= 5; i++) {
					if (!target.isDisabled("equip" + i)) list.push("equip" + i);
				}
				if (list.length > 0) {
					var slot = list.randomGet();
					target.disableEquip(slot);
					game.log(target, "的一个装备栏被随机废除了");
				}
			}
		}
	},
	"Melissa_bengmie_fen": {
		charlotte: true, 
		mark: true, 
		marktext: "愤",
		intro: { 
			content: "本轮内曾选择受到一点伤害"
		}
	},
	"Melissa_bengmie_nu": {
		charlotte: true, 
		mark: true, 
		marktext: "怒",
		intro: { 
			content: "本轮内曾选择弃置两张牌，受到梅丽莎伤害将翻倍"
		}
	},
	"Melissa_bengmie_damage": {
		trigger: { 
			source: "damageBegin1"
		},
		forced: true,
		charlotte: true,
		filter: function (event, player) {
			return event.player.countMark("Melissa_bengmie_nu") > 0 && (player.hasSkill("Melissa_bengmie_lv1") || player.hasSkill("Melissa_bengmie_lv2"));
		},
		content: function () {
			var target = trigger.player;
			var x = target.countMark("Melissa_bengmie_nu");
			if (x > 0) {
				var multi = Math.max(2, x); 
				trigger.num *= multi;
				game.log(player, "的【崩灭】触发，", target, "身上的【怒】使其受到的伤害翻了", multi, "倍！");
				
				if (player.hasSkill("Melissa_bengmie_lv1") && !player.hasSkill("Melissa_bengmie_lv2")) {
					target.removeMark("Melissa_bengmie_nu", x);
				}
			}
		}
	},
	"Melissa_bengmie_clear": {
		trigger: { 
			global: "roundStart",
			player: "phaseAfter"
		}, 
		silent: true,
		charlotte: true,
		filter: function (event, player) { return true; },
		content: function () {
			if (trigger.name === "phase") {
				delete player.storage.Melissa_bengmie_history;
			}
			if (trigger.name === "roundStart") {
				game.players.forEach(function(p) {
					delete p.storage.Melissa_bengmie_op1_count;
					if (p.hasMark("Melissa_bengmie_fen")) p.removeMark("Melissa_bengmie_fen", p.countMark("Melissa_bengmie_fen"));
					if (p.hasMark("Melissa_bengmie_nu")) p.removeMark("Melissa_bengmie_nu", p.countMark("Melissa_bengmie_nu"));
				});
			}
		}
	},
	
	"Melissa_bingjian_lv2_used": { 
	    charlotte: true 
	},
	"Melissa_tongxin_mark": {
		charlotte: true,
		mark: true,
		marktext: "心",
		intro: {
			content: "与梅丽莎处于【同心】状态"
		}
	},
	"Melissa_bingjian_lv1": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filterCard: function(card, player) {
			if (ui.selected.cards.length === 0) return true;
			var suits = ui.selected.cards.map(function(c) { return get.suit(c); });
			return !suits.includes(get.suit(card));
		},
		selectCard: [0, 2], 
		position: "he",
		discard: false,
		delay: false,
		prompt: "【并肩】: 可与同心角色各重铸至多两张花色不同的牌。若本次重铸共包含至少三种花色，各得1点护甲",
		check: function (card) {
			return 6 - get.value(card);
		},
		group: [
			"Melissa_bingjian_lv1_hujia",
			"Melissa_tongxin_core"
		],
		content: async function (event, trigger, player) {
			var allReforgedCards = []; 
			var participants = []; 

			var discardCards = event.cards || [];
			if (discardCards.length > 0) {
				allReforgedCards.addArray(discardCards);
				await player.discard(discardCards);
				await player.draw(discardCards.length);
			}
			participants.push(player);

			var pool = player.getStorage("Melissa_tx_pool") || [];
			for (var i = 0; i < pool.length; i++) {
				var p = pool[i];
				if (p !== player && p.isAlive()) {
					var result = await p.chooseToDiscard("he", [0, 2], "【并肩】可重铸至多两张花色不同的牌。团队重铸凑齐三种花色可获护甲")
						.set("ai", function(card) { return 6 - get.value(card); })
						.set("complexCard", true)
						.set("filterCard", function(card, p) {
							if (ui.selected.cards.length === 0) return true;
							var suits = ui.selected.cards.map(function(c) { return get.suit(c); });
							return !suits.includes(get.suit(card));
						}).forResult();
						
					if (result.bool && result.cards && result.cards.length > 0) {
						allReforgedCards.addArray(result.cards);
						await p.draw(result.cards.length);
					}
					participants.push(p);
				}
			}

			var uniqueSuits = [];
			for (var k = 0; k < allReforgedCards.length; k++) {
				var s = get.suit(allReforgedCards[k]);
				if (!uniqueSuits.includes(s)) uniqueSuits.push(s);
			}

			if (uniqueSuits.length >= 3) {
				game.log("本次重铸共包含了", "#y" + uniqueSuits.length, "种花色！");
				for (var j = 0; j < participants.length; j++) {
					participants[j].changeHujia(1);
				}
			} else {
				game.log("本次重铸仅包含", uniqueSuits.length, "种花色，未激活护甲。");
			}
		},
		ai: {
			order: 4, 
			result: {
				player: function(player, target) {
					var cards = player.getCards("he");
					for (var i = 0; i < cards.length; i++) {
						if (get.value(cards[i]) < 6) return 1;
					}
					return 0;
				}
			}
		},
	},

	"Melissa_bingjian_lv1_hujia": {
		trigger: { 
			global: ["damageEnd", "changeHujia"] 
		},
		filter: function (event, player) {
			var target = event.player;
			if (event.name === "damage") {
				if (!event.hujia || target.hujia > 0) return false;
			} else {
				if (event.getParent("damage") || event.num >= 0 || target.hujia > 0) return false;
			}
			return target.hasSkill("Melissa_tongxin_mark") || target === player;
		},
		content: async function (event, trigger, player) {
			var targets = game.filterPlayer(function(current) {
				return current !== trigger.player && current.isAlive() && current.hujia > 0 && 
					(current.hasSkill("Melissa_tongxin_mark") || current === player);
			});
			
			for (var i = 0; i < targets.length; i++) {
				var p = targets[i];
				var next = p.chooseBool("同心角色【" + get.translation(trigger.player) + "】护甲破裂！是否失去1点护甲，弃置一张牌并视为使用之？");
				
				next.set("ai", function() { 
					var evtPlayer = _status.event.player;
					if (evtPlayer.hp <= 1 && evtPlayer.hujia <= 1 && !evtPlayer.hasCard(function(c){ return c.name === 'tao' || c.name === 'jiu'; }, 'he')) {
						return false;
					}
					var cards = evtPlayer.getCards("he");
					for (var j = 0; j < cards.length; j++) {
						var card = cards[j];
						if (['shan', 'wuxie', 'jiu'].includes(card.name)) continue; 
						var vcard = game.createCard(card.name, card.suit, card.number);
						
						if (get.type(card) === 'equip') {
							if (get.equipValue(vcard) > 0) return true;
							continue;
						}
						
						if (evtPlayer.hasUseTarget(vcard)) {
							if (card.name === 'tao' && evtPlayer.hp < evtPlayer.maxHp) return true;
							var tempTargets = game.filterPlayer(function(current) { return evtPlayer.canUse(vcard, current); });
							for (var k = 0; k < tempTargets.length; k++) {
								// 碎甲逻辑，对任意合法目标的效果是正收益（打人，救队友）
								if (get.effect(tempTargets[k], vcard, evtPlayer, evtPlayer) > 0) return true;
							}
						}
					}
					return false; 
				});
				var result = await next.forResult();
				
				if (result.bool) {
					p.changeHujia(-1);
					var cardResult = await p.chooseCard("he", 1, "请选择你要当做使用打出的牌", function(card, p) {
						var vcard = game.createCard(card.name);
						return p.hasUseTarget(vcard) && !['shan', 'wuxie'].includes(card.name);
					})
					.set("ai", function(card) {
						var evtPlayer = _status.event.player;
						if (card.name === 'tao' && evtPlayer.hp < evtPlayer.maxHp) return 100;
						
						var vcard = game.createCard(card.name, card.suit, card.number);
						
						if (get.type(card) === 'equip') {
							return get.equipValue(vcard) > 0 ? get.equipValue(vcard) * 2 : -100; 
						}
						
						var tempTargets = game.filterPlayer(function(current) { return evtPlayer.canUse(vcard, current); });
						var maxEff = 0;
						for (var k = 0; k < tempTargets.length; k++) {
							var eff = get.effect(tempTargets[k], vcard, evtPlayer, evtPlayer);
							if (eff > maxEff) maxEff = eff;
						}
						return maxEff > 0 ? (maxEff + get.useful(vcard)) : -100; 
					}).forResult();
					
					if (cardResult.bool) {
						await p.discard(cardResult.cards);
						var vcard = game.createCard(cardResult.cards[0].name);
						await p.chooseUseTarget(vcard, true, false);
					}
				}
			}
		}
	},

	"Melissa_bingjian_lv2": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filterCard: function(card, player) {
			if (ui.selected.cards.length === 0) return true;
			var suits = ui.selected.cards.map(function(c) { return get.suit(c); });
			return !suits.includes(get.suit(card));
		},
		selectCard: [0, 2],
		position: "he",
		filterTarget: function (card, player, target) {
			return target !== player && !target.hasSkill("Melissa_tongxin_mark");
		},
		selectTarget: [0, 1],
		prompt: "选择至多1名角色同心并重铸至多两张牌。若团队本次重铸共包含至少三种花色，额外摸牌并各得1点护甲",
		check: function (card) { return 6 - get.value(card); },
		discard: false,
		delay: false,
		group: [
			"Melissa_bingjian_lv2_hujia",
			"Melissa_tongxin_core"
		],
		content: async function (event, trigger, player) {
			var allReforgedCards = []; 
			var participants = [];

			if (event.targets && event.targets.length > 0) {
				player.line(event.targets, "green");
				var pool = player.getStorage("Melissa_tx_pool") || [];
				if (!pool.includes(player)) pool.push(player);
				for (var i = 0; i < event.targets.length; i++) {
					if (!pool.includes(event.targets[i])) {
						pool.push(event.targets[i]);
						event.targets[i].addSkill("Melissa_tongxin_mark");
					}
				}
				player.storage.Melissa_tx_pool = pool;
			}

			var discardCards = event.cards || [];
			if (discardCards.length > 0) {
				allReforgedCards.addArray(discardCards);
				await player.discard(discardCards);
				await player.draw(discardCards.length);
			}
			participants.push(player);

			var currentPool = player.getStorage("Melissa_tx_pool") || [];
			for (var i = 0; i < currentPool.length; i++) {
				var p = currentPool[i];
				if (p !== player && p.isAlive()) {
					var result = await p.chooseToDiscard("he", [0, 2], "【并肩】重铸至多两张不同花色的牌，团队重铸凑齐三种花色可激活奖励")
						.set("ai", function(card) { return 6 - get.value(card); })
						.set("complexCard", true)
						.set("filterCard", function(card, p) {
							if (ui.selected.cards.length === 0) return true;
							var suits = ui.selected.cards.map(function(c) { return get.suit(c); });
							return !suits.includes(get.suit(card));
						}).forResult();
						
					if (result.bool && result.cards && result.cards.length > 0) {
						allReforgedCards.addArray(result.cards);
						await p.draw(result.cards.length);
					}
					participants.push(p);
				}
			}

			var uniqueSuits = [];
			for (var k = 0; k < allReforgedCards.length; k++) {
				var s = get.suit(allReforgedCards[k]);
				if (!uniqueSuits.includes(s)) uniqueSuits.push(s);
			}

			if (uniqueSuits.length >= 3) {
				game.log("本次重铸共包含了", "#y" + uniqueSuits.length, "种花色！");
				for (var j = 0; j < participants.length; j++) {
					await participants[j].draw(1);
					participants[j].changeHujia(1);
				}
			} else {
				game.log("本次重铸仅包含", uniqueSuits.length, "种花色，未激活奖励。");
			}
		},
		ai: {
			order: 4,
			result: {
				player: function(player, target) {
					var cards = player.getCards("he");
					for (var i = 0; i < cards.length; i++) {
						if (get.value(cards[i]) < 6) return 1;
					}
					return 0;
				},
				target: function(player, target) {
					if (target.hasSkill("Melissa_tongxin_mark")) return 0;
					if (get.attitude(player, target) <= 0) return 0;
					return target.hujia === 0 ? 1.5 : 1; 
				}
			}
		},
	},

	"Melissa_bingjian_lv2_hujia": {
		trigger: { 
			global: ["damageEnd", "changeHujia"] 
		},
		filter: function (event, player) {
			var target = event.player;
			if (event.name === "damage") {
				if (!event.hujia || target.hujia > 0) return false;
			} else {
				if (event.getParent("damage") || event.num >= 0 || target.hujia > 0) return false;
			}
			return (target.hasSkill("Melissa_tongxin_mark") || target === player) && !player.hasSkill("Melissa_bingjian_lv2_used");
		},
		content: async function (event, trigger, player) {
			var targets = game.filterPlayer(function(current) {
				return current !== trigger.player && current.isAlive() && current.hujia > 0 && 
					(current.hasSkill("Melissa_tongxin_mark") || current === player);
			}).randomSort();
			
			for (var i = 0; i < targets.length; i++) {
				var p = targets[i];
				var next = p.chooseBool("同心角色【" + get.translation(trigger.player) + "】护甲破裂！是否失去1点护甲，弃置一张牌并视为使用之？(本回合全队限一人)");
				
				next.set("ai", function() { 
					var evtPlayer = _status.event.player;
					if (evtPlayer.hp <= 1 && evtPlayer.hujia <= 1 && !evtPlayer.hasCard(function(c){ return c.name === 'tao' || c.name === 'jiu'; }, 'he')) {
						return false;
					}
					var cards = evtPlayer.getCards("he");
					for (var j = 0; j < cards.length; j++) {
						var card = cards[j];
						if (['shan', 'wuxie', 'jiu'].includes(card.name)) continue; 
						var vcard = game.createCard(card.name, card.suit, card.number);
						
						if (get.type(card) === 'equip') {
							if (get.equipValue(vcard) > 0) return true;
							continue;
						}
						
						if (evtPlayer.hasUseTarget(vcard)) {
							if (card.name === 'tao' && evtPlayer.hp < evtPlayer.maxHp) return true;
							var tempTargets = game.filterPlayer(function(current) { return evtPlayer.canUse(vcard, current); });
							for (var k = 0; k < tempTargets.length; k++) {
								if (get.effect(tempTargets[k], vcard, evtPlayer, evtPlayer) > 0) return true;
							}
						}
					}
					return false;
				});
				var result = await next.forResult();
				
				if (result.bool) {
					player.addTempSkill("Melissa_bingjian_lv2_used", "phaseEnd"); 
					p.changeHujia(-1);
					var cardResult = await p.chooseCard("he", 1, "请选择你要当做使用打出的牌", function(card, p) {
						var vcard = game.createCard(card.name);
						return p.hasUseTarget(vcard) && !['shan', 'wuxie'].includes(card.name);
					})
					.set("ai", function(card) {
						var evtPlayer = _status.event.player;
						if (card.name === 'tao' && evtPlayer.hp < evtPlayer.maxHp) return 100;
						
						var vcard = game.createCard(card.name, card.suit, card.number);
						
						if (get.type(card) === 'equip') {
							return get.equipValue(vcard) > 0 ? get.equipValue(vcard) * 2 : -100;
						}
						
						var tempTargets = game.filterPlayer(function(current) { return evtPlayer.canUse(vcard, current); });
						var maxEff = 0;
						for (var k = 0; k < tempTargets.length; k++) {
							var eff = get.effect(tempTargets[k], vcard, evtPlayer, evtPlayer);
							if (eff > maxEff) maxEff = eff;
						}
						return maxEff > 0 ? (maxEff + get.useful(vcard)) : -100; 
					}).forResult();
					
					if (cardResult.bool) {
						await p.discard(cardResult.cards);
						var vcard = game.createCard(cardResult.cards[0].name);
						await p.chooseUseTarget(vcard, true, false);
					}
					break; 
				}
			}
		}
	},
	"Melissa_bingjian_lv2_used": { 
	    charlotte: true 
	},
	"Melissa_tongxin_core": {
		trigger: { player: "phaseBegin" },
		forced: true,
		charlotte: true,
		ruleSkill: true,
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return current !== player;
			});
		},
		content: async function (event, trigger, player) {
			var oldPool = player.getStorage("Melissa_tx_pool") || [];
			for (var i = 0; i < oldPool.length; i++) {
				if (oldPool[i] !== player) {
					oldPool[i].removeSkill("Melissa_tongxin_mark");
				}
			}
			player.storage.Melissa_tx_pool = [player];

			var targets = await player.chooseTarget("请选择你的“同心”角色", 1, function (card, player, target) {
				return target !== player;
			}).set("ai", function (target) {
				var player = _status.event.player;
				return get.attitude(player, target) > 1;
			}).forResultTargets();

			if (targets && targets.length > 0) {
				player.line(targets, "green");
				player.storage.Melissa_tx_pool.push(targets[0]);
				targets[0].addSkill("Melissa_tongxin_mark");
				player.addSkill("Melissa_tongxin_mark");
				game.log(player, "选择了", targets[0], "作为本回合的同心角色");
			}
		}
	},
	"Melissa_tongxin_mark": {
		charlotte: true,
		mark: true,
		marktext: "心",
		intro: {
			content: "与梅丽莎处于【同心】状态"
		}
	},
	"Melissa_wanyuan": {
		audio: "ext:魔法纪录/audio/skill:2",
		limited: true,
		skillAnimation: true,
		animationColor: "orange",
		trigger: { global: "dying" },
		filter: function (event, player) {
			return player.countCards("h") > 0;
		},
		check: function (event, player) {
			return get.attitude(player, event.player) > 1;
		},
		content: async function (event, trigger, player) {
			"step 0"
			player.awakenSkill("Melissa_wanyuan");
			var result = await player.chooseToDiscard("h", [1, 4], "【挽愿】弃置x张不同花色的手牌，令目标回1血并获x-1点护甲")
				.set("complexCard", true)
				.set("filterCard", function(card, p) {
					if (ui.selected.cards.length === 0) return true;
					var suits = ui.selected.cards.map(function(c) { return get.suit(c); });
					return !suits.includes(get.suit(card));
				})
				.set("ai", function(card) { 
					return 8 - get.value(card); 
				})
				.forResult();
			
			if (result.bool) {
				event.discardNum = result.cards.length;
			} else {
				event.finish();
			}
			"step 1"
			trigger.player.recover(1);
			if (event.discardNum - 1 > 0) {
				trigger.player.changeHujia(event.discardNum - 1);
			}
			"step 2"
			var upgradeResult = await player.chooseControl("升级崩灭", "升级并肩")
				.set("prompt", "请选择升级一个技能")
				.set("ai", function() {
					return _status.event.player.hp >= 3 ? "升级崩灭" : "升级并肩";
				})
				.forResult();
				
			if (upgradeResult.control === "升级崩灭") {
				player.removeSkill("Melissa_bengmie_lv1");
				player.addSkill("Melissa_bengmie_lv2");
				player.$fullscreenpop("崩灭觉醒", "purple"); 
			} else {
				player.removeSkill("Melissa_bingjian_lv1");
				player.addSkill("Melissa_bingjian_lv2");
				player.$fullscreenpop("并肩觉醒", "orange"); 
			}
		}
	},

	// 爱丽莎
	"Elisa_longqi": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "phaseZhunbeiEnd" },
		direct: true,
		filter: function (event, player) {
			return !player.hasSkill("Elisa_longqi_used") && player.countCards("he") > 0;
		},
		content: async function (event, trigger, player) {
			var result = await player.chooseToDiscard("he", [1, 4], "龙骑：弃置任意张花色不同的牌，视为对自己使用向下取整一半数量的【洞烛先机】", function (card, p) {
				if (ui.selected.cards.length === 0) return true;
				var suits = ui.selected.cards.map(function (c) { return get.suit(c); });
				return !suits.includes(get.suit(card));
			}).set("complexCard", true).set("ai", function (card) {
				return 6 - get.value(card);
			}).forResult();

			if (result.bool && result.cards && result.cards.length > 0) {
				player.logSkill("Elisa_longqi");
				var x = result.cards.length;
				var useCount = Math.floor(x / 2);
				
				for (var i = 0; i < useCount; i++) {
					var dzxj = game.createCard("dongzhuxianji");
					await player.useCard(dzxj, player);
				}
				
				if (x === 4) {
					var next = await player.chooseBool("【龙骑】以此法弃置了 4 张牌，是否令其失效直至下个准备阶段？").set("ai", function () { return true; }).forResult();
					if (next.bool) {
						player.addSkill("Elisa_longqi_used");
					}
				}
			}
		}
	},
	"Elisa_longqi_used": {
		mark: true,
		intro: {
			content: "龙骑已失效。下个准备阶段开始时，将触发一次 X=2 的衍生【龙哮】并解除失效。"
		},
		trigger: { player: "phaseZhunbeiBegin" },
		forced: true,
		priority: 50,
		content: async function(event, trigger, player) {
			game.log(player, "的", "#g【龙骑】", "失效期结束，触发衍生", "#y【龙哮】", "！");
			
			var chooseTarget = await player.chooseTarget("龙哮 (衍生)：请选择 1 名角色", 1, function(card, p, target) {
				return true;
			}).set("ai", function(target) {
				return -get.attitude(_status.event.player, target);
			}).forResult();

			if (chooseTarget.bool && chooseTarget.targets) {
				var target = chooseTarget.targets[0];
				var handcards = target.getCards("h");
				var uniqueSuits = [];
				for (var j = 0; j < handcards.length; j++) {
					var suit = get.suit(handcards[j]);
					if (!uniqueSuits.includes(suit) && suit !== "none") uniqueSuits.push(suit);
				}

				if (uniqueSuits.length < 2) {
					game.log(target, "无法展示两张花色不同的手牌");
					await target.damage(1, "fire", player);
				} else {
					var showResult = await target.chooseCard("h", 2, true, "衍生龙哮：请展示两张花色不同的手牌", function (card, p) {
						if (ui.selected.cards.length === 0) return true;
						return get.suit(card) !== get.suit(ui.selected.cards[0]);
					}).set("complexCard", true).forResult();

					if (showResult.bool && showResult.cards && showResult.cards.length === 2) {
						target.showCards(showResult.cards);
						var choice = await target.chooseControl("受到一点火焰伤害", "弃置这些牌").set("ai", function () {
							var t = _status.event.player;
							return (t.hp <= 1 || (t.hp <= 2 && t.countCards("h") > 2)) ? "弃置这些牌" : "受到一点火焰伤害";
						}).forResult();

						if (choice.control === "弃置这些牌") await target.discard(showResult.cards);
						else await target.damage(1, "fire", player);
					}
				}
			}
			player.removeSkill("Elisa_longqi_used");
		}
	},
	"Elisa_longxiao": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "phaseJieshuEnd" },
		direct: true,
		filter: function (event, player) {
			if (player.hasSkill("Elisa_longxiao_used")) return false;
			return Math.floor((player.storage.Elisa_discard_count || 0) / 2) > 0;
		},
		content: async function (event, trigger, player) {
			var x = player.storage.Elisa_discard_count || 0;
			var targetCount = Math.floor(x / 2);

			var chooseTarget = await player.chooseTarget("龙哮：请选择至多 " + targetCount + " 名角色", [1, targetCount], function (card, p, target) {
				return true; 
			}).set("ai", function (target) {
				return -get.attitude(_status.event.player, target);
			}).forResult();

			if (chooseTarget.bool && chooseTarget.targets) {
				player.logSkill("Elisa_longxiao", chooseTarget.targets);
				var totalDiscarded = 0;

				for (var i = 0; i < chooseTarget.targets.length; i++) {
					var target = chooseTarget.targets[i];
					var handcards = target.getCards("h");
					var uniqueSuits = [];
					for (var j = 0; j < handcards.length; j++) {
						var suit = get.suit(handcards[j]);
						if (!uniqueSuits.includes(suit) && suit !== "none") uniqueSuits.push(suit);
					}

					if (uniqueSuits.length < 2) {
						game.log(target, "无法展示两张花色不同的手牌");
						await target.damage(1, "fire", player);
					} else {
						var showResult = await target.chooseCard("h", 2, true, "龙哮：请展示两张花色不同的手牌", function (card, p) {
							if (ui.selected.cards.length === 0) return true;
							return get.suit(card) !== get.suit(ui.selected.cards[0]);
						}).set("complexCard", true).forResult();

						if (showResult.bool && showResult.cards && showResult.cards.length === 2) {
							target.showCards(showResult.cards);
							var choice = await target.chooseControl("受到一点火焰伤害", "弃置这些牌").set("ai", function () {
								var t = _status.event.player;
								return (t.hp <= 1 || (t.hp <= 2 && t.countCards("h") > 2)) ? "弃置这些牌" : "受到一点火焰伤害";
							}).forResult();

							if (choice.control === "弃置这些牌") {
								await target.discard(showResult.cards);
								totalDiscarded += showResult.cards.length;
							} else {
								await target.damage(1, "fire", player);
							}
						}
					}
				}

				if (totalDiscarded >= 4) {
					var next = await player.chooseBool("【龙哮】目标以此法弃置了不小于 4 张牌，是否令其失效直至下个结束阶段？").set("ai", function () { return true; }).forResult();
					if (next.bool) {
						player.addSkill("Elisa_longxiao_used");
					}
				}
			}
		}
	},
	"Elisa_longxiao_used": {
		mark: true,
		intro: {
			content: "龙哮已失效。下个结束阶段开始时，将触发一次 X=2 的衍生【龙骑】并解除失效。"
		},
		trigger: { player: "phaseJieshuBegin" },
		forced: true,
		priority: 50,
		content: async function(event, trigger, player) {
			game.log(player, "的", "#g【龙哮】", "失效期结束，触发衍生", "#y【龙骑】", "！");
			var dzxj = game.createCard("dongzhuxianji");
			await player.useCard(dzxj, player);
			player.removeSkill("Elisa_longxiao_used");
		}
	},
	"Elisa_discard_tracker_add": {
		trigger: { player: ["loseAfter", "cardsDiscardAfter"] },
		forced: true,
		silent: true,
		filter: function(event, player) {
			if (event.name === "lose" && event.type !== "discard") return false;
			return event.cards && event.cards.length > 0;
		},
		content: function(event, trigger, player) {
			player.storage.Elisa_discard_count = (player.storage.Elisa_discard_count || 0) + trigger.cards.length;
		}
	},
	"Elisa_discard_tracker_clear": {
		trigger: { player: "phaseAfter", global: "roundStart" },
		silent: true,
		forced: true,
		content: function(event, trigger, player) {
			if (trigger.name === "phase" && trigger.player === player) {
				player.storage.Elisa_discard_count = 0;
			}
		}
	},
	"Elisa_jinao": {
		group: [
			"Elisa_jinao_1", "Elisa_jinao_2", "Elisa_jinao_3", "Elisa_jinao_4", 
			"Elisa_jinao_cleaner", 
			"Elisa_discard_tracker_add", "Elisa_discard_tracker_clear"
		]
	},
	"Elisa_jinao_cleaner": {
		trigger: {
			global: "roundStart",
			player: "phaseAfter"
		},
		silent: true,
		forced: true,
		content: function(event, trigger, player) {
			if (trigger.name === 'phase' && trigger.player === player) {
				player.storage.Elisa_jinao_count = 0;
			}
		}
	},
	// 基础（1人1牌）
	"Elisa_jinao_1": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { 
			player: "loseAfter"
		},
		direct: true,
		filter: function(event, player) {
			if (player.hasSkill("Elisa_longqi_used") || player.hasSkill("Elisa_longxiao_used")) return false;
			if ((player.storage.Elisa_jinao_count || 0) >= 1) return false;
			return event.cards && event.cards.length > 0;
		},
		content: async function(event, trigger, player) {
			var chooseTarget = await player.chooseTarget("矜傲：是否令 1 名角色摸 1 张牌？", [1, 1]).set("ai", function(target){ return get.attitude(_status.event.player, target); }).forResult();
			if (chooseTarget.bool && chooseTarget.targets) {
				player.logSkill("Elisa_jinao_1", chooseTarget.targets);
				player.storage.Elisa_jinao_count = (player.storage.Elisa_jinao_count || 0) + 1;
				await chooseTarget.targets[0].draw(1);
			}
		}
	},
	// 龙骑失效（1人2牌）
	"Elisa_jinao_2": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "loseAfter"
		},
		direct: true,
		filter: function(event, player) {
			if (!player.hasSkill("Elisa_longqi_used") || player.hasSkill("Elisa_longxiao_used")) return false;
			if ((player.storage.Elisa_jinao_count || 0) >= 1) return false;
			return event.cards && event.cards.length > 0;
		},
		content: async function(event, trigger, player) {
			var chooseTarget = await player.chooseTarget("矜傲(增幅)：是否令 1 名角色摸 2 张牌？", [1, 1]).set("ai", function(target){ return get.attitude(_status.event.player, target); }).forResult();
			if (chooseTarget.bool && chooseTarget.targets) {
				player.logSkill("Elisa_jinao_2", chooseTarget.targets);
				player.storage.Elisa_jinao_count = (player.storage.Elisa_jinao_count || 0) + 1;
				await chooseTarget.targets[0].draw(2);
			}
		}
	},
	// 状态3：龙哮失效（2人1牌）
	"Elisa_jinao_3": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "loseAfter"
		},
		direct: true,
		filter: function(event, player) {
			if (player.hasSkill("Elisa_longqi_used") || !player.hasSkill("Elisa_longxiao_used")) return false;
			if ((player.storage.Elisa_jinao_count || 0) >= 1) return false;
			return event.cards && event.cards.length > 0;
		},
		content: async function(event, trigger, player) {
			var chooseTarget = await player.chooseTarget("矜傲(扩军)：是否令至多 2 名角色各摸 1 张牌？", [1, 2]).set("ai", function(target){ return get.attitude(_status.event.player, target); }).forResult();
			if (chooseTarget.bool && chooseTarget.targets) {
				player.logSkill("Elisa_jinao_3", chooseTarget.targets);
				player.storage.Elisa_jinao_count = (player.storage.Elisa_jinao_count || 0) + 1;
				for (var i = 0; i < chooseTarget.targets.length; i++) {
					await chooseTarget.targets[i].draw(1);
				}
			}
		}
	},
	// 双重失效，背水解禁（2人2牌）
	"Elisa_jinao_4": {
		audio: "ext:魔法纪录/audio/skill:3",
		trigger: {
			player: "loseAfter"
		},
		direct: true,
		filter: function(event, player) {
			if (!player.hasSkill("Elisa_longqi_used") || !player.hasSkill("Elisa_longxiao_used")) return false;
			
			var limit = player.hasSkill("Elisa_jinao_backwater") ? 2 : 1;
			if ((player.storage.Elisa_jinao_count || 0) >= limit) return false;
			return event.cards && event.cards.length > 0;
		},
		content: async function(event, trigger, player) {
			var canBackwater = false;
			if (!player.hasSkill("Elisa_jinao_backwater")) {
				var reds = player.getCards("he", function(c){ return get.color(c) === "red"; });
				var blacks = player.getCards("he", function(c){ return get.color(c) === "black"; });
				if (reds.length > 0 && blacks.length > 0) {
					if (reds.length > 1 || blacks.length > 1 || reds[0] !== blacks[0]) canBackwater = true;
				}
			}

			var choiceList = ["普通发动"];
			if (canBackwater) choiceList.push("背水发动");
			choiceList.push("取消");

			var chooseMethod = await player.chooseControl(choiceList)
				.set("prompt", "矜傲(极)：是否令至多 2 名角色各摸 2 张牌？")
				.set("ai", function () { return canBackwater ? "背水发动" : "普通发动"; })
				.forResult();

			if (chooseMethod.control === "取消" || !chooseMethod.control) return;

			var chooseTarget = await player.chooseTarget("请选择至多 2 名角色", [1, 2]).set("ai", function(target) {
				return get.attitude(_status.event.player, target);
			}).forResult();

			if (chooseTarget.bool && chooseTarget.targets) {
				player.logSkill("Elisa_jinao_4", chooseTarget.targets);
				player.storage.Elisa_jinao_count = (player.storage.Elisa_jinao_count || 0) + 1;

				for (var i = 0; i < chooseTarget.targets.length; i++) {
					await chooseTarget.targets[i].draw(2);
				}

				if (chooseMethod.control === "背水发动") {
					player.addTempSkill("Elisa_jinao_backwater", {player: "phaseAfter"});
					game.log(player, "发动了", "#g【背水】", "，本回合发动次数上限修改为 2 ！");

					var discardResult = await player.chooseToDiscard("he", 2, true, function (card, p) {
						if (ui.selected.cards.length === 0) return get.color(card) === "red" || get.color(card) === "black";
						var firstColor = get.color(ui.selected.cards[0]);
						return get.color(card) !== firstColor && (get.color(card) === "red" || get.color(card) === "black");
					}).set("complexCard", true).set("prompt", "请弃置红黑各一张牌，将【龙之雷火】置入装备区").forResult();

					if (discardResult.bool) {
						var leihuo = game.createCard("DragonsFire");
						await player.equip(leihuo);
						game.log(player, "将", leihuo, "置入了装备区，无尽的雷火即将降临！");
					}
				}
			}
		}
	},
	"Elisa_jinao_backwater": {
		charlotte: true
	},
	
	// 御园花凛
	"karin_daodan": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: ["chooseToUse"],
		usable: 1,
		// 选择视为使用的面板【桃】
		hiddenCard(player, name) {
			return name === "tao";
		},
		filter(event, player) {
			if (event.getParent().name == 'phaseUse') {
				return true;
			}
			if (event.responded) {
				return false;
			}
			return game.hasPlayer(target => player != target) && event.filterCard({ name: "tao", isCard: true }, player, event);
		},
		async content(event, trigger, player) {
			const targets = game.filterPlayer(target => player != target);
			const target = await player.chooseTarget("捣蛋：选择一名其他角色", true, targets)
				.set("ai", target => get.attitude(player, target) < 0)
				.forResult();
			if (!target || !target.targets.length) return;
			const targetPlayer = target.targets[0];
			player.line(targetPlayer, "green");
			if (targetPlayer.getCards("h").length == 0) {
				targetPlayer.damage();
				return;
			}

			const card = await targetPlayer.chooseCard("捣蛋：请选择一张【桃】交给" + get.translation(player), function (card) {
				return get.name(card) == "tao";
			})
				.set("ai", card => -get.value(card, targetPlayer))
				.forResult();
			if (!card || !card.cards || !card.cards.length) {
				game.log(get.translation(targetPlayer) + "拒绝了给糖，那就捣蛋！");
				const suits = ["spade", "heart", "club", "diamond"];
				const suitNames = ["♠️", "♥️", "♣️", "♦️"];
				const choice = await player.chooseControl(suitNames)
					.set("prompt", "选择一种花色，并获得其手牌")
					.forResult();

				const suitIndex = suitNames.indexOf(choice.control);
				game.log(get.translation(player) + "选择了" + suitNames[suitIndex] + "的牌");
				if (suitIndex < 0 || suitIndex >= suits.length) return;
				const chosenSuit = suits[suitIndex];
				const randomCard = player.gain(targetPlayer.getCards("h").randomGet(), targetPlayer, "giveAuto", "bySelf")
				if (get.suit(randomCard.cards[0]) == chosenSuit) {
					targetPlayer.damage();
				}
				return;
			};

			const givenCard = card.cards[0];
			await targetPlayer.give(givenCard, player);
		},
		ai: {
			order: 8,
			result: {
				player(player) {
					return 1;
				}
			}
		}
	},
	"karin_youhuo": {
		trigger: {
			player: "damageBegin4",
		},
		filter(event, player) {
			if (!event.source || event.source == player) {
				return false;
			}
			if (!player.canCompare(event.source)) {
				return false;
			}
			return (
				game.getGlobalHistory("everything", evt => {
					return evt.name == "damage" && evt.player == player;
				}, event).indexOf(event) == 0
			);
		},
		logTarget: "source",
		async content(event, trigger, player) {
			const target = event.targets[0];
			const next = await player.chooseToCompare(target).set("isDelay", true);
			trigger.num--;
			let bool = get.damageEffect(player, target, target) + get.effect(target, { name: "guohe_copy2" }, player, target) > 0;
			bool = Math.random() > 0.4 ? bool : false;
			const result = await target
				.chooseBool(`幽火：是否交给${get.translation(player)}一张对应花色的手牌，然后揭示拼点结果？`)
				.set("choice", bool)
				.forResult();
			if (result.bool) {
				const suits = ["spade", "heart", "club", "diamond"];
				const suitNames = ["♠️", "♥️", "♣️", "♦️"];
				const choice = await player.chooseControl(suitNames)
					.set("prompt", "选择一种花色")
					.forResult();

				const suitIndex = suitNames.indexOf(choice.control);
				game.log(get.translation(player) + "选择了" + suitNames[suitIndex] + "的牌");

				const giveResult = await target.chooseToGive(player, "h", card => get.suit(card) == suits[suitIndex]).forResult();
				if (!giveResult.bool) return;

				const result2 = await game.createEvent("chooseToCompare", false).set("player", player).set("parentEvent", next).setContent("chooseToCompareEffect").forResult();

				if (result2?.winner == player) {
					trigger.num == 0;
				} else {
					trigger.num++;
				}
			} else {
				await game.delayx();
			}
		},
	},

	// 煌里光
	"hikaru_zhengzheng": {
		trigger: { player: ["phaseBegin", "phaseEnd"] },
		filter(event, player) {
			return game.hasPlayer(current => !current.hasMark("hikaru_zhengzheng_gold_shield") || !current.hasMark("hikaru_zhengzheng_thunder_spear"));
		},
		group: ["hikaru_zhengzheng_gold_shield_effect", "hikaru_zhengzheng_thunder_spear_effect"],
		async cost(event, trigger, player) {
			const choice = await player.chooseTarget("铮铮：选择一名角色获得标记")
				.set("filterTarget", (card, player, target) => !target.hasMark("hikaru_zhengzheng_gold_shield") || !target.hasMark("hikaru_zhengzheng_thunder_spear"))
				.set("ai", target => get.attitude(player, target))
				.forResult();

			if (!choice.bool || !choice.targets || !choice.targets.length) return;

			const target = choice.targets[0];
			let choiceList = [];
			if (!target.hasMark("hikaru_zhengzheng_gold_shield")) choiceList.push("金盾");
			if (!target.hasMark("hikaru_zhengzheng_thunder_spear")) choiceList.push("雷矛");

			const control = await player.chooseControl()
				.set("prompt", "铮铮：选择获得哪种标记")
				.set("choiceList", choiceList)
				.set("ai", () => Math.random() > 0.5 ? 0 : 1)
				.forResult();
			event.result = { bool: true, targets: [target], cost_data: choiceList[control.index] };
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			const mark = event.cost_data === "金盾" ? "hikaru_zhengzheng_gold_shield" : "hikaru_zhengzheng_thunder_spear";
			target.addMark(mark);
			target.addTempSkill(mark, "roundStart");
		},
		subSkill: {
			gold_shield_effect: {
				trigger: { global: "damageBegin" },
				forced: true,
				filter(event, player) {
					return event.player.hasMark("hikaru_zhengzheng_gold_shield");
				},
				async cost(event, trigger, player) {
					if (player.countCards("h") > 0) {
						const next = player.chooseToDiscard("h", true);
						next.set("prompt", "金盾：是否弃一张牌令受伤角色摸一张牌？");
						next.set("ai", card => get.value(card, player) - 5);
						const result = await next.forResult();
						event.result = { bool: result.bool };
					} else {
						event.result = { bool: false };
					}

				},
				async content(event, trigger, player) {
					trigger.player.draw();
				},
			},
			gold_shield: {
				mark: true,
				marktext: "金盾",
				intro: {
					content: "金盾：当受伤角色受到伤害时，煌里光可以弃一张牌令其摸一张牌。",
				},
				onremove(player, skill) {
					player.removeMark("hikaru_zhengzheng_gold_shield", player.countMark("hikaru_zhengzheng_gold_shield"));
					if (player.hasSkill("hikaru_chihun_awakened")) player.addMark("hikaru_zhengzheng_gold_shield", 1);
				}
			},
			thunder_spear_effect: {
				trigger: { global: "damageBegin" },
				filter(event, player) {
					return event.source && event.source.hasMark("hikaru_zhengzheng_thunder_spear");
				},
				async cost(event, trigger, player) {
					if (player.countCards("h") > 0) {
						const next = player.chooseToDiscard("h", true);
						next.set("prompt", "雷矛：是否弃一张牌令伤害来源摸一张牌？");
						next.set("ai", card => get.value(card, player) - 5);
						const result = await next.forResult();
						event.result = { bool: result.bool };
					} else {
						event.result = { bool: false };
					}
				},
				async content(event, trigger, player) {
					trigger.source.draw();
				},
			},
			thunder_spear: {
				mark: true,
				marktext: "雷矛",
				intro: {
					content: "雷矛：当伤害来源受到伤害时，煌里光可以弃一张牌令其摸一张牌。",
				},
				onremove(player, skill) {
					player.removeMark("hikaru_zhengzheng_thunder_spear", player.countMark("hikaru_zhengzheng_thunder_spear"));
					if (player.hasSkill("hikaru_chihun_awakened")) player.addMark("hikaru_zhengzheng_thunder_spear", 1);
				}
			},
		},
	},
	"hikaru_fenshen": {
		trigger: { global: ["loseAfter", "loseAsyncAfter"] },
		filter(event, player) {
			if (event.type != "discard") return false;
			const evt = event.getl(player);
			return evt && evt.cards2 && evt.cards2.length > 0;
		},
		async cost(event, trigger, player) {
			const choice = await player.chooseTarget("奋身：选择一名角色摸一张牌")
				.set("filterTarget", (card, player, target) => target.isIn())
				.set("ai", target => get.attitude(player, target) * (target.hasMark("hikaru_zhengzheng_gold_shield") && target.hasMark("hikaru_zhengzheng_thunder_spear") ? 2 : 1))
				.forResult();

			event.result = { bool: choice.bool, targets: choice.targets };
		},
		async content(event, trigger, player) {
			if (!event.targets || !event.targets.length) return;

			const target = event.targets[0];
			const hasBothMarks = target.hasMark("hikaru_zhengzheng_gold_shield") && target.hasMark("hikaru_zhengzheng_thunder_spear");
			const drawNum = hasBothMarks ? 2 : 1;

			if (player.hasSkill("hikaru_chihun_awakened")) {
				await target.draw(drawNum);
			} else {
				await player.loseHp();
				await target.draw(drawNum);
			}
		},
	},
	"hikaru_chihun": {
		trigger: { player: "dying" },
		filter(event, player) {
			return event.getParent(2).name == "hikaru_fenshen";
		},
		limited: true,
		skillAnimation: true,
		animationColor: "fire",
		async content(event, trigger, player) {
			player.awakenSkill("hikaru_chihun");

			await player.recover(2 - player.hp);

			player.addSkill("hikaru_chihun_awakened");
			player.addMark("hikaru_zhengzheng_gold_shield", 1);
			player.addMark("hikaru_zhengzheng_thunder_spear", 1);
			player.addTempSkill("hikaru_zhengzheng_gold_shield_effect", { player: "dieAfter" });
			player.addTempSkill("hikaru_zhengzheng_thunder_spear_effect", { player: "dieAfter" });

			game.delayx();
			player.insertPhase();
		},
	},
	"hikaru_chihun_awakened": {
		marktext: "赤魂",
		intro: {
			name: "赤魂",
			content: "已觉醒，获得“金盾”“雷矛”",
		},
	},

	// 千岁由麻
	"yuma_yuying": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filterTarget: function (card, player, target) {
			return target !== player;
		},
		// ai修复
		ai: {
			order: 8, 
			result: {
				target: function (player, target) {
					var att = get.attitude(player, target);

					if (att <= 0) return 0; 
					

					if (target.hp <= 2) return 2;

					if (target.countCards('h') <= 2) return 1.5;

					return 1;
				}
			}
		},
		content: function () {
			"step 0"
			player.addTempSkill('yuma_yuying_buff', 'phaseAfter');
			target.addTempSkill('yuma_yuying_buff', 'phaseAfter');

			if (player.countCards('he') === 0) {
				event.playerGive = [];
				event.goto(2);
			} else {
				player.chooseCard('he', [0, 2], '愈萤：选择至多两张区域内的牌展示并交给' + get.translation(target))
					.set('visible', true)
					.set('ai', function (card) {
						var att = get.attitude(player, target);
						if (att > 0) {
							var hasDyingEnemy = game.hasPlayer(function (p) {
								return get.attitude(player, p) < 0 && p.hp <= 2;
							});
							if (hasDyingEnemy && target.countCards('h') >= 3) {
								if (get.tag(card, 'damage')) return 10 + get.value(card, target);
							}
							if (target.hp <= 2) {
								if (card.name == 'shan' || card.name == 'tao' || card.name == 'jiu' || card.name == 'wuxie' || get.type(card) == 'equip') {
									return 10 + get.value(card, target);
								}
							}
							var val = get.value(card, target) - get.value(card, player);
							return val > 0 ? val : 0.1;
						}
						return -get.value(card, player);
					});
			}

			"step 1"
			event.playerGive = result.bool ? result.cards : [];
			if (event.playerGive.length > 0) {
				player.showCards(event.playerGive, '愈萤');
				player.lose(event.playerGive, 'visible');
				target.gain(event.playerGive, 'give', player);
			}

			"step 2"
			if (target.countCards('he') === 0) {
				event.targetGive = [];
				event.goto(4);
			} else {
				target.chooseCard('he', [0, 2], '愈萤：选择至多两张区域内的牌展示并交给' + get.translation(player))
					.set('visible', true)
					.set('ai', function (card) {
						var att = get.attitude(target, player);
						if (att > 0) {
							var hasDyingEnemy = game.hasPlayer(function (p) {
								return get.attitude(target, p) < 0 && p.hp <= 2;
							});
							if (hasDyingEnemy && player.countCards('h') >= 3) {
								if (get.tag(card, 'damage')) return 10 + get.value(card, player);
							}
							if (player.hp <= 2) {
								if (card.name == 'shan' || card.name == 'tao' || card.name == 'jiu' || card.name == 'wuxie' || get.type(card) == 'equip') {
									return 10 + get.value(card, player);
								}
							}
							var val = get.value(card, player) - get.value(card, target);
							return val > 0 ? val : 0.1;
						}
						return -get.value(card, target);
					});
			}

			"step 3"
			event.targetGive = result.bool ? result.cards : [];
			if (event.targetGive.length > 0) {
				target.showCards(event.targetGive, '愈萤');
				target.lose(event.targetGive, 'visible');
				player.gain(event.targetGive, 'give', target);
			}

			"step 4"
			event.choices = [];
			if (event.playerGive.length >= 2) event.choices.push({ chooser: player, receiver: target });
			if (event.targetGive.length >= 2) event.choices.push({ chooser: target, receiver: player });

			if (event.choices.length === 0) {
				event.goto(7);
				return;
			}
			event.choiceIndex = 0;

			"step 5"
			if (event.choiceIndex < event.choices.length) {
				var currentChoice = event.choices[event.choiceIndex];
				event.currentChooser = currentChoice.chooser;
				event.currentReceiver = currentChoice.receiver;

				event.currentChooser.chooseControl(['摸两张牌', '回复一点体力'])
					.set('prompt', '愈萤：你因交换失去至少两张牌，请为 ' + get.translation(event.currentReceiver) + ' 选择一项')
					.set('ai', function () {
						var chooser = _status.event.player;
						var receiver = _status.event.getParent().currentReceiver;
						var att = get.attitude(chooser, receiver);

						if (att > 0) {
							if (receiver.hp <= 2) {
								var hasDyingEnemy = game.hasPlayer(function (p) {
									return get.attitude(chooser, p) < 0 && p.hp <= 2;
								});
								if (hasDyingEnemy) return '摸两张牌';
								else return '回复一点体力';
							} else {
								return '摸两张牌';
							}
						} else {
							if (receiver.hp === receiver.maxHp) return '回复一点体力';
							else return '摸两张牌';
						}
					});
			} else {
				event.goto(7);
			}

			"step 6"
			if (result.control === '摸两张牌' || result.index === 0) {
				event.currentReceiver.draw(2);
				game.log(event.currentChooser, '为', event.currentReceiver, '选择了', '#g摸两张牌');
			} else {
				event.currentReceiver.recover(1);
				game.log(event.currentChooser, '为', event.currentReceiver, '选择了', '#g回复一点体力');
			}
			event.choiceIndex++;
			event.goto(5);

			"step 7"
			player.removeSkill('yuma_yuying_buff');
			target.removeSkill('yuma_yuying_buff');
		},
		ai: {
			order: 8,
			result: {
				target: function (player, target) {
					var att = get.attitude(player, target);
					if (att > 0) {
						var num = player.countCards('he');
						return num >= 2 ? 1 : 0.5;
					}
					return 0;
				}
			}
		},
		subSkill: {
			buff: {
				charlotte: true,
				trigger: {
					player: "loseAfter",
					global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
				},
				forced: true,
				popup: false,
				filter: function (event, player) {
					if (player.countCards("he") > 0) return false;
					var evt = event.getl(player);
					return evt && evt.player === player && evt.cards && evt.cards.length > 0;
				},
				content: function () {
					player.draw();
					game.log(player, '交出了最后一张牌，触发', '#g【愈萤】', '摸一张牌');
					player.removeSkill('yuma_yuying_buff');
				}
			}
		}
	},
	"yuma_zuofei": {
		audio: "ext:魔法纪录/audio/skill:2",
		limited: true,
		forced: false,
		trigger: { global: 'dying' },
		filter: function (event, player) {
			return (
				player.isAlive() &&
				event.player !== player &&
				event.player.isIn() &&
				event.player.hp <= 0
			);
		},
		// ai修复
		check: function (event, player) {
			return get.attitude(player, event.player) >= 2;
		},
		content: function () {
			"step 0"
			if (trigger.player === player || !trigger.player.isIn()) {
				event.finish();
				return;
			}
			var cards = player.getCards('hej');
			event.cards = cards;
			if (!cards || cards.length === 0) {
				event.goto(5);
				return;
			}
			player.showCards(cards, '昨非');
			"step 1"
			event.hasBasic = false;
			event.hasTrick = false;
			event.hasEquip = false;
			event.target = trigger.player;
			if (!event.target || event.target === player || !event.target.isAlive()) {
				event.finish();
				return;
			}
			for (var i = 0; i < event.cards.length; i++) {
				var type = get.type(event.cards[i], player);
				if (type === 'basic') event.hasBasic = true;
				else if (type === 'trick') event.hasTrick = true;
				else if (type === 'equip') event.hasEquip = true;
			}

			"step 2"
			if (event.hasBasic && event.target.isAlive()) {
				var need = Math.max(0, 2 - event.target.hp);
				if (need > 0) event.target.recover(need);
			}

			"step 3"
			if (event.hasEquip && event.target.isAlive()) {
				event.target.insertPhase();
			}

			"step 4"
			if (event.hasTrick && event.target.isAlive()) {
				var card = game.createCard('wanjian', 'heart', 4);
				var gainEvent = event.target.gain(card, 'gain2');
				gainEvent.gaintag = ['yuma_zuofei_shi'];
				event.target.addSkill("yuma_zuofei_buff");
			}

			"step 5"
			player.awakenSkill('yuma_zuofei');
			player.unmarkSkill('yuma_zuofei');
		},
		ai: {
			expose: 0.8,
			result: { target: function (player, target) { return 10; } }
		}
	},
	"yuma_zuofei_buff": {
		trigger: { player: ["useCard", "loseAfter", "cardsDiscardAfter"] },
		forced: true,
		silent: true,
		popup: false,
		charlotte: true,
		mark: true,
		intro: {
			name: "昨非·势",
			content: "当你使用带有【势】标记的【万箭齐发】时，此牌不可被响应。"
		},
		filter: function (event, player) {
			if (event.name === 'useCard') {
				return event.card && event.card.hasGaintag('yuma_zuofei_shi');
			} else {
				return !player.hasCard(function (card) {
					return card.hasGaintag('yuma_zuofei_shi');
				}, 'h');
			}
		},
		content: function () {
			if (event.name === 'useCard') {
				game.players.forEach(function (current) {
					if (current.isAlive()) {
						trigger.directHit.add(current);
					}
				});
				player.removeSkill('yuma_zuofei_buff');
			} else {
				player.removeSkill('yuma_zuofei_buff');
			}
		},
		"_priority": 0,
	},

	// 神·鹿目圆
	"ulti_madoka_lianjie": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return player.countCards("h") > 0;
		},
		async content(event, trigger, player) {
			const result = await player.chooseCard("h", true, [1, 4], "连结：请选择展示的手牌（花色需各不相同）", (card, player) => {
				if (!ui.selected.cards.length) {
					return true;
				}
				return !ui.selected.cards.some(i => get.suit(i, player) == get.suit(card));
			})
				.set("complexCard", true)
				.set("ai", (card) => {
					const player = _status.event.player;
					if (get.value(card) < 5) return 10;
					return 5 - get.value(card);
				}).forResult();

			if (!result.bool) return;

			const cards = result.cards;
			const num = cards.length;
			await player.showCards(cards, get.translation(player) + "发动了【连结】");

			const result2 = await player.chooseTarget("连结：请选择一名其他角色，你与其各重铸" + get.cnNumber(num) + "张牌", true)
				.set("filterTarget", (card, player, target) => {
					return target !== player;
				}).set("ai", (target) => {
					const player = _status.event.player;
					const num = _status.event.num;
					let value = get.attitude(player, target) * num;
					return value;
				}).set("num", num).forResult();

			if (!result2.bool) return;

			const target = result2.targets[0];
			player.line(target, "green");

			await player.recast(cards);
			if (target.isIn()) {
				const discardNum = Math.min(num, target.countCards("h"));
				await target.chooseToDiscard(discardNum, true, "he");
				await target.draw(discardNum);
			}
		},
		ai: {
			order: 10,
			result: {
				player(player) {
					if (player.countCards("h", (card) => get.value(card) < 5) >= 2) return 1;
					return 0;
				}
			}
		}
	},
	"ulti_madoka_shenxin": {
		audio: "ext:魔法纪录/audio/skill:2",
		locked: true,
		trigger: {
			player: "useCardToTargeted"
		},
		filter(event, player) {
			if (!event.card || !event.target) return false;
			if (!get.tag(event.card, "damage")) return false;
			if (event.targets && event.targets.length > 1) return false;
			return true;
		},
		async content(event, trigger, player) {
			const card = trigger.card;
			const discardPile = get.discarded() || [];

			let damagePlus = false;
			let directHit = false;

			for (let discarded of discardPile) {
				if (get.suit(discarded) === get.suit(card)) {
					damagePlus = true;
				}
				if (get.number(discarded) === get.number(card)) {
					directHit = true;
				}
			}

			if (damagePlus) {
				trigger.getParent().baseDamage++;
				player.chat("伤害+1");
			}
			if (directHit) {
				trigger.directHit.addArray(game.players);
				player.chat("不可响应");
			}
		},
		group: ["ulti_madoka_shenxin_draw", "ulti_madoka_shenxin_limit", "ulti_madoka_shenxin_discardDisplay"],
		subSkill: {
			draw: {
				trigger: { player: "useCardAfter" },
				audio: "ulti_madoka_shenxin",
				forced: true,
				filter(event, player) {
					if (get.type(event.card) === "equip") return false;
					const history = player.getHistory("useCard", (evt) => {
						return evt.card.name === event.card.name;
					});
					if (history.length === 1) return true;
					return false;
				},
				async content(event, trigger, player) {
					const discardPile = get.discarded() || [];
					let otherCount = 0;
					for (let card of discardPile) {
						if (get.type(card) === get.type(trigger.card) && get.color(card) === get.color(trigger.card)) otherCount++;
					}
					if (otherCount > 0) {
						await player.draw(Math.min(otherCount, 5));
					}
				}
			},
			limit: {
				mod: {
					ignoredHandcard(card, player) {
						if (get.color(card) === "red") return true
					},
					cardDiscardable(card, player, name) {
						if (name == "phaseDiscard" && get.color(card) === "red") {
							return false;
						}
					},
				}
			},
			discardDisplay: {
				trigger: {
					global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter", "loseAfter"],
					player: "phaseEnd"
				},
				forced: true,
				popup: false,
				filter(event, player) {
					return _status.currentPhase == player;
				},
				async content(event, trigger, player) {
					const discardPile = get.discarded() || [];
					if (trigger.name === "phase" || discardPile.length === 0) {
						player.removeTip("ulti_madoka_shenxin");
						return;
					}
					const cardInfo = [...new Set(discardPile.map((card) => {
						return get.translation(get.number(card));
					}))];
					player.addTip("ulti_madoka_shenxin", "本回合弃牌堆点数：\n" + cardInfo.join(" "));
				}
			},
		}
	},
	"ulti_madoka_zhili": {
		usable: 1,
		trigger: { player: "damageBegin4" },
		filter(event, player) {
			return player.countCards("h", (card) => get.color(card) === "red") > 0 && event.source;
		},
		async content(event, trigger, player) {
			const result = await player.chooseCard("h", [1, Infinity], "织理：请选择展示的红色手牌", (card) => {
				return get.color(card) === "red";
			}).set("ai", (card) => {
				return 5;
			}).forResult();

			if (!result.bool) return;

			const myCards = result.cards;
			const myCount = myCards.length;
			await player.showCards(myCards, get.translation(player) + "发动了【织理】");

			const source = trigger.source;
			if (!source || !source.isIn()) return;

			const sourceHearts = source.getCards("h", (card) => get.color(card) === "red");
			await source.showCards(sourceHearts, get.translation(source) + "展示了红色手牌");

			if (sourceHearts.length <= myCount) {
				trigger.num = 0;
			}
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (get.tag(card, "damage") && target.countCards("h", (c) => get.color(c) === "red") > 0) {
						return [1, 0.5];
					}
				}
			}
		}
	},

	// 宫尾时雨
	"shigure_cunming": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: ["phaseUseBegin", "phaseEnd"],
		},
		async cost(event, trigger, player) {
			if (trigger.name === "phaseUse") {
				const num = game.countPlayer(current => current.hasSkill("shigure_cunming"));
				const result = await player.chooseTarget(get.prompt("shigure_cunming") + "：是否对一名无此技能的角色造成1点伤害？", function (card, player, target) {
					return target !== player && !target.hasSkill("shigure_cunming");
				}).set("ai", function (target) {
					return get.damageEffect(target, player, player) > 0 ? 1 : 0;
				}).forResult();
				event.result = { bool: true, targets: result.bool ? result.targets : [], cost_data: { draw: num * 2 } };
			} else {
				const result = await player.chooseTarget(get.prompt("shigure_cunming") + "：是否令一名其他角色获得此技能直到游戏结束？", function (card, player, target) {
					return target !== player && !target.hasSkill("shigure_cunming");
				}).set("ai", function (target) {
					return get.attitude(player, target);
				}).forResult();
				event.result = { bool: result.bool, targets: result.bool ? result.targets : [], cost_data: "giveSkill" };
			}
		},
		async content(event, trigger, player) {
			if (trigger.name === "phaseUse") {
				const num = event.cost_data.draw;
				await player.draw(num);
				if (event.targets && event.targets.length > 0) {
					const target = event.targets[0];
					player.line(target, "green");
					await target.damage(1, player);
				}
			} else {
				if (event.targets && event.targets.length > 0) {
					const target = event.targets[0];
					player.line(target, "green");
					await target.addSkill("shigure_cunming");
					game.log(player, "令", target, "获得了技能【忖命】");
				}
			}
		},
		ai: {
			threaten: 1.5,
		},
	},
	"shigure_ciruan": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "phaseDiscardEnd",
		},
		filter(event, player) {
			return player.canMoveCard();
		},
		async cost(event, trigger, player) {
			const result = await player.chooseBool(get.prompt("shigure_ciruan") + "：是否移动场上的一张牌？")
				.forResult();
			event.result = { bool: result.bool };
		},
		async content(event, trigger, player) {
			const moveResult = await player.moveCard().forResult();
			if (!moveResult || !moveResult.bool) return;

			const movedCard = moveResult.card;
			const source = moveResult.targets[0];
			const target = moveResult.targets[1];

			const hasCunming = (source && source.hasSkill("shigure_cunming")) || (target && target.hasSkill("shigure_cunming"));

			if (hasCunming) {
				const result = await player.chooseControl(["摸两张牌", "回复一点体力", "取消"])
					.set("prompt", "刺软：这张牌的来源或对象拥有【忖命】，请选择一项")
					.set("ai", function () {
						if (player.hp < player.maxHp && player.hp <= 2) return "回复一点体力";
						return "摸两张牌";
					}).forResult();

				if (result.control === "摸两张牌") {
					await player.draw(2);
					game.log(player, "摸了两张牌");
				} else if (result.control === "回复一点体力") {
					await player.recover(1);
					game.log(player, "回复了一点体力");
				}
			}
		},
		ai: {
			threaten: 1.2,
		},
	},

	// 安积育梦
	"hagumu_molie": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "phaseBegin",
		},
		forced: true,
		filter(event, player) {
			return game.hasPlayer(current => current !== player);
		},
		async content(event, trigger, player) {
			player.addMark("hagumu_molie_mark", 1);

			const result = await player.chooseTarget("魔猎：选择一名其他角色获得“魔猎”标记", true, function (card, player, target) {
				return target !== player;
			}).set("ai", function (target) {
				return get.effect(target, { name: "sha" }, player, player);
			}).forResult();

			if (result.bool && result.targets.length > 0) {
				const target = result.targets[0];
				target.addMark("hagumu_molie_mark", 1);
				player.addTempSkill("hagumu_molie_mark_clear", { player: "phaseBegin" });
				target.addTempSkill("hagumu_molie_mark_clear", { player: "phaseBegin" });
				game.log(player, "令", target, "获得了“魔猎”标记");
			}
		},
		group: ["hagumu_molie_damage"],
		subSkill: {
			damage: {
				trigger: { global: "damageEnd" },
				filter(event, player) {
					if (event.num <= 0) return false;
					const hasMark = (event.source && event.source.hasMark("hagumu_molie_mark")) || event.player.hasMark("hagumu_molie_mark");
					return hasMark;
				},
				forced: true,
				async content(event, trigger, player) {
					const isDoubleNum = trigger.source.hasMark("hagumu_molie_mark") && trigger.player.hasMark("hagumu_molie_mark");
					if (isDoubleNum) {
						await player.draw(trigger.num * 2);
					} else {
						await player.draw(trigger.num);
					}
				},
			},
			mark_clear: {
				onremove(player) {
					player.removeMark("hagumu_molie_mark", player.countMark("hagumu_molie_mark"));
				},
			},
		},
		mark: true,
		intro: {
			content: "魔猎标记：拥有此标记的角色造成或受到伤害后，安积育梦摸一张牌。",
		},
	},
	"hagumu_molie_mark": {
		mark: true,
		marktext: "猎",
		intro: {
			content: "魔猎标记：你造成或受到伤害后，安积育梦摸一张牌。",
		},
	},
	"hagumu_xushi": {
		audio: "ext:魔法纪录/audio/skill:2",
		limited: true,
		enable: "phaseUse",
		filter(event, player) {
			return game.hasPlayer(current => current !== player);
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);

			const result = await player.chooseTarget("虚势：选择一名目标角色", true, function (card, player, target) {
				return target !== player;
			}).set("ai", function (target) {
				return -get.attitude(player, target);
			}).forResult();

			if (!result.bool || !result.targets.length) return;

			const target = result.targets[0];
			player.line(target, "thunder");

			const others = game.filterPlayer(current => current !== player && current !== target);

			for (const other of others) {
				if (!other.isIn()) continue;

				const canUseSha = other.canUse("sha", target, false);
				let usedSha = false;

				if (canUseSha) {
					const useResult = await other.chooseToUse({
						prompt: "虚势：对" + get.translation(target) + "使用一张【杀】，否则将受到1点雷电伤害",
						filterCard(card, player) {
							return card.name === "sha" && player.canUse(card, target, false);
						},
						filterTarget(card, player, cur) {
							return cur === target;
						},
						ai1(card) {
							if (get.attitude(other, target) < 0) return 10;
							return 0;
						},
					}).forResult();

					usedSha = useResult.bool;
				}

				if (!usedSha) {
					await other.damage(1, "thunder", player);
				}
			}
		},
		ai: {
			order: 1,
			result: {
				player(player) {
					if (game.countPlayer(current => current !== player) >= 3) return 1;
					return 0;
				},
			},
		},
	},

	// 入名库什
	"kushu_zhoufu": {
		audio: "ext:魔法纪录/audio/skill:2",
		group: ["kushu_zhoufu_1", "kushu_zhoufu_2"],
		subSkill: {
			1: {
				audio: "kushu_zhoufu",
				usable: 1,
				enable: ["chooseToUse"],
				filter(event, player) {
					if (!event.filterCard({ name: "jiu" }, player, event)) return false;
					return true;
				},
				async cost(event, trigger, player) {
					const result = await player.chooseBool(get.prompt("kushu_zhoufu"), "将牌堆顶的一张牌置于判定区，视为使用一张【酒】").set("ai", () => true).forResult();
					event.result = result;
				},
				async content(event, trigger, player) {
					const card = get.cards(1)[0];
					await game.cardsGotoOrdering(card);
					// 蓄谋牌的写法
					await player.addJudge({ name: "xumou_jsrg" }, card);
					game.log(player, "将", card, "置于判定区");
					await player.useCard({ name: "jiu", isCard: true }, player, false);
				},
				ai: {
					save: true,
					skillTagFilter(player, tag, arg) {
						return _status.event?.dying == player;
					},
					order: 5,
					result: {
						player(player) {
							if (_status.event.parent.name == "phaseUse") {
								if (player.countCards("h", "jiu") > 0) {
									return 0;
								}
								if (player.getEquip("zhuge") && player.countCards("h", "sha") > 1) {
									return 0;
								}
								if (!player.countCards("h", "sha")) {
									return 0;
								}
								var targets = [];
								var target;
								var players = game.filterPlayer();
								for (var i = 0; i < players.length; i++) {
									if (get.attitude(player, players[i]) < 0) {
										if (player.canUse("sha", players[i], true, true)) {
											targets.push(players[i]);
										}
									}
								}
								if (targets.length) {
									target = targets[0];
								} else {
									return 0;
								}
								var num = get.effect(target, { name: "sha" }, player, player);
								for (var i = 1; i < targets.length; i++) {
									var num2 = get.effect(targets[i], { name: "sha" }, player, player);
									if (num2 > num) {
										target = targets[i];
										num = num2;
									}
								}
								if (num <= 0) {
									return 0;
								}
								var e2 = target.getEquip(2);
								if (e2) {
									if (e2.name == "tengjia") {
										if (!player.countCards("h", { name: "sha", nature: "fire" }) && !player.getEquip("zhuque")) {
											return 0;
										}
									}
									if (e2.name == "renwang") {
										if (!player.countCards("h", { name: "sha", color: "red" })) {
											return 0;
										}
									}
									if (e2.name == "baiyin") {
										return 0;
									}
								}
								if (player.getEquip("guanshi") && player.countCards("he") > 2) {
									return 1;
								}
								return target.countCards("h") > 3 ? 0 : 1;
							}
							if (player == _status.event.dying || player.isTurnedOver()) {
								return 3;
							}
						},
					},
				},
			},
			2: {
				trigger: {
					player: "damageEnd",
				},
				forced: true,
				async content(event, trigger, player) {
					for (let i = 0; i < trigger.num; i++) {
						const card = get.cards(1)[0];
						await game.cardsGotoOrdering(card);
						await player.addJudge({ name: "xumou_jsrg" }, card);
						game.log(player, "将", card, "置于判定区");

						if (trigger.source && trigger.source.countGainableCards(player, trigger.source != player ? "he" : "e") > 0) {
							player.gainPlayerCard(true, trigger.source, trigger.source != player ? "he" : "e");
						}
					}
				},
				ai: {
					maixie_defend: true,
					effect: {
						target(card, player, target) {
							if (player.countCards("he") > 1 && get.tag(card, "damage")) {
								if (player.hasSkillTag("jueqing", false, target)) {
									return [1, -1.5];
								}
								if (get.attitude(target, player) < 0) {
									return [1, 1];
								}
							}
						},
					},
				},
			},
		},
		mod: {
			maxHandcard(player, num) {
				return num + player.countCards("j");
			},
		},
	},
	"kushu_yechu": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		forced: true,
		filter(event, player) {
			return player.countCards("j") > 0;
		},
		async content(event, trigger, player) {
			const num = player.countCards("j");
			player.addTempSkill("kushu_yechu_effect", "phaseEnd");
			player.storage.kushu_yechu_sha = num;
			const cards = player.getCards("j");
			await player.gain(cards, "gain2");
			game.log(player, "获得了判定区的所有牌");
		},
		subSkill: {
			effect: {
				charlotte: true,
				onremove(player, skill) {
					delete player.storage.kushu_yechu_sha;
				},
				mod: {
					cardUsable(card, player, num) {
						if (card.name === "sha") {
							return num + (player.storage.kushu_yechu_sha || 0);
						}
					},
				},
			},
		},
	},

	// 优木沙沙
	"sasa_duyan": {
		trigger: {
			global: "damageBegin4"
		},
		forced: true,
		audio: true,
		filter: function (event, player) {
			if (_status.currentPhase != event.player && event.player.hasMark("sasa_huoyi_mark")) return true;
			return (
				_status.currentPhase == player &&
				(event.player.countCards("h") >= player.countCards("h") || event.player.hp >= player.hp)
			);
		},
		content: function () {
			trigger.num++;
		},
	},
	"sasa_wanning": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.countCards("h") > 0;
		},
		filterTarget: function (card, player, target) {
			//					if (player == target) return false;
			if (!ui.selected.targets.length) return target.countCards("h") > 0;
			return ui.selected.targets[0].canCompare(target);
		},
		selectTarget: 2,
		multitarget: true,
		multiline: true,
		filterCard: true,
		check: function (card) {
			return 10 - get.value(card);
		},
		discard: false,
		lose: false,
		delay: false,
		content: function () {
			"step 0";
			player.showCards(cards, get.translation(player) + "发动了【婉佞】");
			if (targets[0].canCompare(targets[1])) {
				targets[0].chooseToCompare(targets[1]);
			} else {
				event.finish();
			}
			"step 1";
			if (!result.tie) {
				if (result.bool) {
					event.win = targets[0];
					event.loser = [targets[1]];
				} else {
					event.win = targets[1];
					event.loser = [targets[0]];
				}
				event.win.useCard({
					name: "sha"
				}, event.loser, false, "noai");
			}
			else {
				event.loser = targets;
			}
			"step 2";
			if (event.loser.length > 0) {
				var target = event.loser.shift();
				event.target = target;
				target
					.chooseBool("是否失去1点体力并获得" + get.translation(cards) + "？<br><small>或获得一枚“役”标记</small>")
					.set("ai", function () {
						if (_status.event.target.hp < 3) return false;
						return get.attitude(_status.event.target, _status.event.player) > 2;
					})
					.set("target", target);
			} else event.finish();
			"step 3";
			var target = event.target;
			if (result.bool) {
				target.loseHp();
				//								target.gain("give", cards, player);
				target.gain(cards, "gain2");
			} else {
				target.addMark("sasa_huoyi", 1)
			}
			"step 4";
			event.goto(2)
		},
		ai: {
			order: 9,
			result: {
				target: function (player, target) {
					return -target.countCards("he") - (player.countCards("h", "du") ? 1 : 0);
				},
			},
			threaten: 2,
		},
	},
	"sasa_huoyi": {
		trigger: {
			global: ["chooseToCompareAfter", "compareMultipleAfter"],
		},
		direct: true,
		content() {
			"step 0"
			var targets = [];
			if (trigger.num1 <= trigger.num2) targets.push(trigger.player);
			if (trigger.num1 >= trigger.num2) targets.push(trigger.target);
			event.targets = targets.filter(i => i.countCards("hej") > 0);
			"step 1"
			if (event.targets?.length > 0) {
				var target = event.targets.shift();
				event.target = target;
				player.gainPlayerCard("【惑役】：你可以选择获得" + get.translation(target) + "区域内的至多两张牌", target, "hej", [1, 2], false);
			} else event.finish();
			"step 2"
			if (result.bool) {
				player.logSkill("sasa_huoyi", event.target);
				if (event.target.countCards("h") == 0) event.target.addMark("sasa_huoyi", 1);
			}
			"step 3";
			event.goto(1);
		},
		intro: { content: "mark" },
		marktext: "惑",
		group: "sasa_huoyi_huoxin",
		subSkill: {
			huoxin: {
				forced: true,
				trigger: {
					global: "phaseBeginStart"
				},
				filter(event, player) {
					return (
						!event.player._trueMe &&
						event.player.countMark("sasa_huoyi") >= 2
					);
				},
				logTarget: "player",
				skillAnimation: true,
				animationColor: "key",
				content() {
					"step 0";
					trigger.player.removeMark("sasa_huoyi", trigger.player.countMark("sasa_huoyi"));
					if (player == trigger.player) {
						player
							.chooseControl("摸牌阶段", "出牌阶段")
							.set("prompt", "【惑役】：选择要执行的额外阶段");
					} else event.goto(2);
					"step 1";
					if (result.index == 0) {
						var next = player.phaseDraw();
						event.next.remove(next);
						trigger.getParent().next.push(next);
						player.addTempSkill("fengyin", "phaseDrawAfter");
					} else if (result.index == 1) {
						var next = player.phaseUse();
						event.next.remove(next);
						trigger.getParent().next.push(next);
						player.addTempSkill("fengyin", "phaseUseAfter");
					}
					event.finish();
					"step 2";
					trigger.player._trueMe = player;
					game.addGlobalSkill("autoswap");
					if (trigger.player == game.me) {
						game.notMe = true;
						if (!_status.auto) ui.click.auto();
					}
					trigger.player.addSkill("sasa_huoyi_zbjxingwu");
				},
			},
			zbjxingwu: {
				trigger: {
					player: ["phaseAfter", "dieAfter"],
					global: "phaseBeforeStart",
				},
				nopop: true, //技能在面板隐藏
				lastDo: true,
				charlotte: true,
				forceDie: true,
				forced: true,
				silent: true,
				content() {
					player.removeSkill("sasa_huoyi_zbjxingwu");
				},
				onremove(player) {
					if (player == game.me) {
						if (!game.notMe) game.swapPlayerAuto(player._trueMe);
						else delete game.notMe;
						if (_status.auto) ui.click.auto();
					}
					delete player._trueMe;
				},
			},
		}
	},

	//双树姐妹
	"shuangfeng": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		limited: true,
		filter: function (event, player) {
			return player.countCards("h") >= 0;
		},
		content: function () {
			"step 0";
			player.awakenSkill("shuangfeng");
			player.draw(4);
			"step 1";
			if (player.countCards("h") >= 2) {
				player.chooseToDiscard("h", 2, true, "双峰：请弃置两张牌");
			} else if (player.countCards("h") > 0) {
				player.chooseToDiscard("h", true, "双峰：请弃置所有手牌");
			}
			"step 2";
			// 更换原画为双树姐妹
			player.setNickname();
			player.changeSkin("shuanghun", "Souju Full");
			player.removeSkill("shuanghun_Luca");
			player.removeSkill("shuanghun_Ayase");
			player.addSkill("shuangfeng_Souju");
			game.log(player, "将武将牌替换为", "#g【双树姐妹】");
		},
		ai: {
			order: 8,
			result: {
				player: function (player) {
					if (player.countCards("h") >= 2) return 1.5;
					return 0.5;
				}
			}
		}
	},
	"shuangfeng_Souju": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		limited: true,
		filter: function (event, player) {
			return player.countCards("h") > 0;
		},
		selectCard: [1, Infinity],
		filterCard: true,
		position: "h",
		check: function (card) {
			return 5 - get.value(card);
		},
		content: function () {
			"step 0";
			player.awakenSkill("shuangfeng_Souju");
			var num = Math.floor(cards.length / 2);
			if (num < 1) {
				event.finish();
				return;
			}
			event.num = num;
			player.chooseTarget("冰火：选择" + num + "名角色造成火焰伤害", num, true).set("ai", function (target) {
				return get.damageEffect(target, player, player, "fire");
			});
			"step 1";
			if (result.bool) {
				event.targets = result.targets;
				player.line(event.targets, "fire");
			} else {
				event.finish();
			}
			"step 2";
			event.index = 0;
			"step 3";
			if (event.index < event.targets.length) {
				event.currentTarget = event.targets[event.index];
				event.currentTarget.damage("fire");
			} else {
				event.finish();
			}
			"step 4";
			if (event.currentTarget && event.currentTarget.isIn()) {
				if (event.currentTarget.countCards("hej") >= 2) {
					player.discardPlayerCard(event.currentTarget, "hej", 2, true);
				} else if (event.currentTarget.countCards("hej") > 0) {
					player.discardPlayerCard(event.currentTarget, "hej", event.currentTarget.countCards("hej"), true);
				}
			}
			"step 5";
			if (event.currentTarget && event.currentTarget.isIn()) {
				event.currentTarget.addTempSkill("fengyin");
				game.log(event.currentTarget, "的非锁定技失效直到回合结束");
			}
			"step 6";
			event.index++;
			event.goto(3);
		},
		ai: {
			order: 7,
			result: {
				player: function (player) {
					if (player.countCards("h") >= 2) return 1;
					return 0;
				},
				target: function (player, target) {
					return get.damageEffect(target, player, player, "fire") - 2;
				}
			}
		}
	},
	"shuanghun": {
		audio: "ext:魔法纪录/audio/skill:2",
		mark: true,
		zhuanhuanji: true,
		marktext: "☯",
		intro: {
			content: function (storage, player, skill) {
				if (storage) {
					return "出牌阶段限一次，你可以摸两张牌，将武将牌替换为〖双树绫濑〗，然后弃置等量的牌。若你以此法弃置了两张红色牌，你获得一张伤害+1的【火攻】。";
				}
				return "出牌阶段限一次，你可以弃置两张牌，将武将牌替换为〖双树流香〗，然后摸等量的牌。若你以此法弃置了两张黑色牌，你获得一张不计入次数的冰【杀】。";
			},
		},
		enable: "phaseUse",
		usable: 1,
		derivation: ["shuangfeng", "shuanghun_Ayase", "shuanghun_Luca"],
		filter: function (event, player) {
			if (!player.storage.shuanghun) {
				// 阴状态
				return player.countCards("h") >= 2;
			} else {
				return true;
			}
		},
		content: async function (event, trigger, player) {
			player.changeZhuanhuanji("shuanghun");
			const isYang = player.storage.shuanghun; // true=阳(绫濑), false=阴(流香)
			if (!isYang) {
				// 阴状态：流香
				const { bool: bool1, cards: discardCards } = await player.chooseToDiscard("h", 2, true, "双魂：请弃置两张牌").forResult();
				if (!bool1) return;
				const blackCount = discardCards.filter(card => get.color(card) == "black").length;
				// 2. 更换原画为双树流香
				player.setNickname("双树流香");
				player.changeSkin("shuanghun", "Souju Luca");
				player.removeSkill("shuangfeng_Souju");
				player.removeSkill("shuanghun_Ayase");
				player.addSkill("shuanghun_Luca");
				player.addSkill("shuangfeng");
				await player.draw(1);
				if (blackCount >= 2) {
					const sha = game.createCard("sha", "spade", 2);
					sha.nature = "ice";
					sha.storage.shuanghun_icesha = true;
					if (player.gain(sha, "gain2")) {
						player.addTempSkill("shuanghun_ice_effect");
						game.log(player, "获得了一张", "#y不计入次数的冰【杀】");
					}
				}
			} else {
				// 阳状态：绫濑
				await player.draw(1);
				// 2. 更换原画为双树姐妹
				player.setNickname("双树绫濑");
				player.changeSkin("shuanghun", "Souju Ayase");
				player.removeSkill("shuangfeng_Souju");
				player.removeSkill("shuanghun_Luca");
				player.addSkill("shuanghun_Ayase");
				const { bool: bool2, cards: discardCards2 } = await player.chooseToDiscard("h", 2, true, "双魂：请弃置两张牌").forResult();
				if (!bool2) return;
				const redCount = discardCards2.filter(card => get.color(card) == "red").length;
				if (redCount >= 2) {
					const huogong = game.createCard("huogong", "heart", 2);
					huogong.storage.shuanghun_firehuogong = true;
					if (player.gain(huogong, "gain2")) {
						player.addTempSkill("shuanghun_fire_effect");
						game.log(player, "获得了一张", "#y伤害+1的【火攻】");
					}
				}
			}
		},
		ai: {
			order: 7,
			result: {
				player: function (player) {
					if (!player.storage.shuanghun) {
						const blackCards = player.getCards("h", { color: "black" });
						if (blackCards.length >= 2) return 1.5;
						return player.countCards("h") > 4 ? 1 : 0.5;
					} else {
						const redCards = player.getCards("h", { color: "red" });
						if (redCards.length >= 2) return 1.5;
						return 1;
					}
				}
			}
		},
		subSkill: {
			ice_effect: {
				charlotte: true,
				mark: true,
				marktext: "冰",
				intro: { content: "使用此冰【杀】不计入次数限制" },
				trigger: { player: "useCard1" },
				filter: function (event, player) {
					return event.card && event.card.name == "sha" && event.card.nature == "ice"
						&& event.card.storage && event.card.storage.shuanghun_icesha;
				},
				forced: true,
				content: function () {
					trigger.addCount = false;
				},
				mod: {
					cardUsable: function (card, player, num) {
						if (card.name == "sha" && card.nature == "ice" && card.storage && card.storage.shuanghun_icesha) {
							// 防止不生效
						}
					}
				}
			},
			fire_effect: {
				charlotte: true,
				mark: true,
				marktext: "炎",
				intro: { content: "【火攻】伤害+1" },
				trigger: { source: "damageBegin1" },
				filter: function (event, player) {
					return event.card && event.card.name == "huogong"
						&& event.card.storage && event.card.storage.shuanghun_firehuogong;
				},
				forced: true,
				content: function () {
					trigger.num++;
				}
			}
		}
	},
	"shuanghun_Ayase": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.countCards("he", { color: "red" }) > 0;
		},
		filterCard: function (card, player) {
			return get.color(card) == "red" && lib.filter.cardDiscardable(card, player);
		},
		position: "he",
		check: function (card) {
			return 6 - get.value(card);
		},
		content: function () {
			"step 0";
			player.chooseTarget("二季：选择一名角色造成火焰伤害", true).set("ai", function (target) {
				return get.damageEffect(target, player, player, "fire");
			});
			"step 1";
			if (result.bool) {
				event.target = result.targets[0];
				player.line(event.target, "fire");
				player.discard(cards);
			} else {
				event.finish();
			}
			"step 2";
			if (event.target) {
				event.target.damage("fire");
			}
			"step 3";
			player.addTempSkill("shuanghun_Ayase_effect", { player: "phaseEnd" });
			player.storage.shuanghun_Ayase_target = event.target;
			player.markSkill("shuanghun_Ayase_effect");
		},
		ai: {
			order: 7,
			result: {
				target: function (player, target) {
					return get.damageEffect(target, player, player, "fire");
				}
			}
		},
		subSkill: {
			effect: {
				charlotte: true,
				mark: true,
				marktext: "炎",
				intro: {
					content: function (storage, player) {
						if (player.storage.shuanghun_Ayase_target) {
							return "对" + get.translation(player.storage.shuanghun_Ayase_target) + "使用牌无距离限制";
						}
						return "对目标角色使用牌无距离限制";
					}
				},
				onremove: function (player) {
					delete player.storage.shuanghun_Ayase_target;
				},
				mod: {
					targetInRange: function (card, player, target) {
						if (target == player.storage.shuanghun_Ayase_target) {
							return true;
						}
					}
				}
			}
		}
	},
	"shuanghun_Luca": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "useCardToPlayered"
		},
		usable: 1,
		filter: function (event, player) {
			if (get.color(event.card) != "black") return false;
			if (event.targets.length != 1) return false;
			if (event.target == player) return false;
			if (event.target.countCards("he") == 0) return false;
			return true;
		},
		direct: true,
		content: function () {
			"step 0";
			player.chooseBool(get.prompt("shuanghun_Luca", trigger.target), "令其弃置两张牌，然后你获得其中一张").set("ai", function () {
				return get.attitude(player, trigger.target) < 0;
			});
			"step 1";
			if (result.bool) {
				player.logSkill("shuanghun_Luca", trigger.target);
				player.addExpose(0.2);
				var num = Math.min(2, trigger.target.countCards("he"));
				trigger.target.chooseToDiscard("he", true, num);
			} else {
				event.finish();
			}
			"step 2";
			if (result.bool && result.cards && result.cards.length > 0) {
				var cards = result.cards.filterInD("d");
				if (cards.length == 1) {
					player.gain(cards, "gain2");
					event.finish();
				} else if (cards.length > 1) {
					player.chooseButton(["冷案：选择获得其中一张牌", cards], true).set("ai", function (button) {
						return get.value(button.link);
					});
				} else {
					event.finish();
				}
			} else {
				event.finish();
			}
			"step 3";
			if (result.links && result.links.length > 0) {
				player.gain(result.links, "gain2");
			}
		},
		ai: {
			threaten: 1.3,
			expose: 0.2
		}
	},
	"jihun": {
		audio: "ext:魔法纪录/audio/skill:2",
		charlotte: true,
		group: ["jihun_reset", "jihun_kill"],
		subSkill: {
			reset: {
				audio: "jihun",
				trigger: {
					source: "dying"
				},
				usable: 1,
				forced: true,
				filter: function (event, player) {
					return event.source == player;
				},
				content: async function (event, trigger, player) {
					var stat = player.getStat().skill;
					for (var skill in stat) {
						if (skill == "jihun" || skill == "jihun_reset" || skill == "jihun_kill") {
							continue;
						}
						if (stat[skill] > 0) {
							delete stat[skill];
						}
					}
					var skills = player.getOriginalSkills();
					for (var skill of skills) {
						if (skill == "jihun") continue;
						if (lib.skill[skill] && lib.skill[skill].limited && player.awakenedSkills.includes(skill)) {
							player.restoreSkill(skill);
							game.log(player, "重置了限定技", "#g【" + get.translation(skill) + "】");
						}
					}
					game.log(player, "令除【集魂】外所有技能视为未发动过");
				}
			},
			kill: {
				audio: "jihun",
				trigger: {
					source: "die"
				},
				filter: function (event, player) {
					return event.source == player && (event.player.countCards("he") > 0 || player.isDamaged());
				},
				direct: true, // 使用 direct: true，避免在不发动时错误弹出技能提示
				content: function () {
					"step 0";
					var target = trigger.player;
					var choice = [];

					// 动态检测可以执行的选项
					if (target.countCards("he") > 0) {
						choice.push("获得其所有牌");
					}
					if (player.isDamaged()) {
						choice.push("恢复一点体力");
					}

					if (choice.length === 0) {
						event.finish();
						return;
					}

					choice.push("cancel2"); // 增加取消选项，防止卡死

					player.chooseControl(choice).set("prompt", "集魂：当你杀死" + get.translation(target) + "后，请选择一项").set("ai", function () {
						var targetCardsCount = trigger.player.countCards("he");
						var playerHp = player.hp;
						var playerHand = player.countCards("h");

						if (playerHp <= 2 && playerHand <= 2 && choice.includes("恢复一点体力")) {
							return "恢复一点体力";
						}

						if (targetCardsCount >= 2 && choice.includes("获得其所有牌")) {
							return "获得其所有牌";
						}

						if (player.hp < player.maxHp && choice.includes("恢复一点体力")) {
							return "恢复一点体力";
						}
						// 兜底选拿牌
						if (choice.includes("获得其所有牌")) {
							return "获得其所有牌";
						}
						return "cancel2";
					});
					"step 1";
					if (result.control && result.control !== "cancel2") {
						player.logSkill("jihun_kill", trigger.player);

						if (result.control === "获得其所有牌") {
							var cards = trigger.player.getCards("he");
							if (cards.length > 0) {
								// 使用 giveAuto bySelf，完美继承行殇的拿牌逻辑
								player.gain(cards, trigger.player, "giveAuto", "bySelf");
							}
						} else if (result.control === "恢复一点体力") {
							player.recover();
						}
					}
				}
			}
		}
	},

	// 悠里？
	"Airi_weixing": {
		//测试用
		//init(player, skill) {
		//player.gain(game.createCard('evilnut'), 'gain2');
		//var cards = game.createCard('yonglv');
		//cards.addCardtag("gifts")
		//player.gain(cards, 'gain2');
		//},
		group: ["Airi_weixing_gift", "Airi_weixing_gain", "Airi_weixing_damage"],
		subSkill: {
			gift: {
				trigger: {
					player: "giftAccepted"
				},
				filter: function (event, player) {
					return event.target != player && event.target.isIn();
				},
				content: async function (event, trigger, player) {
					var choices = ["是", "否"];
					var result = await player.chooseControl(choices).set("prompt", "伪形：是否变更势力为【" + get.translation(trigger.target.group) + "】？").forResult();
					if (result.control == "是") {
						await player.changeGroup(trigger.target.group);
						player.popup(trigger.target.group + "2", get.groupnature(trigger.target.group, "raw"));
						game.log(player, "变更势力为", "#g【" + get.translation(trigger.target.group) + "】");
					}
				}
			},
			gain: {
				trigger: {
					player: "gainAfter",
					global: "loseAsyncAfter"
				},
				filter: function (event, player) {
					if (!event.getg) return false;
					var cards = event.getg(player);
					if (!cards.length) return false;
					return game.hasPlayer(current => {
						if (current == player) return false;
						var lose = event.getl(current);
						return lose && lose.cards2 && lose.cards2.some(card => cards.includes(card));
					});
				},
				content: async function (event, trigger, player) {
					var targets = game.filterPlayer(current => {
						if (current == player) return false;
						var lose = trigger.getl(current);
						return lose?.cards2?.some(card => trigger.getg(player).includes(card));
					});
					if (targets.length > 0) {
						var target = targets[0];
						var choices = ["是", "否"];
						var result = await player.chooseControl(choices).set("prompt", "伪形：是否变更势力为【" + get.translation(target.group) + "】？").forResult();
						if (result.control == "是") {
							await player.changeGroup(target.group);
							player.popup(target.group + "2", get.groupnature(target.group, "raw"));
							game.log(player, "变更势力为", "#g【" + get.translation(target.group) + "】");
						}
					}
				}
			},
			damage: {
				trigger: {
					source: "damageBegin1"
				},
				filter: function (event, player) {
					return event.player.group == player.group && event.player != player;
				},
				forced: true,
				content: async function (event, trigger, player) {
					trigger.num++;
					game.log(player, "触发了", "#g【伪形】", "，对", trigger.player, "的伤害+1");
					await player.changeGroup("Magia_Others");
					player.popup("Magia_Others", get.groupnature("Magia_Others", "raw"));
					game.log(player, "变更势力为", "#g【其他魔法少女】");
					if (trigger.player.getEquip("evilnut")) {
						await player.draw();
						game.log(player, "因其装备区存在", "#y邪念之实", "，摸一张牌");
					}
				}
			}
		}
	},
	"Airi_qiangjiao": {
		comboSkill: true,
		mod: {
			aiOrder: function (player, card, num) {
				if (typeof card == "object") {
					const evt = lib.skill.dcjianying.getLastUsed(player);
					const isEquip = evt?.card && get.type(evt.card) == "equip" && !evt.Airi_qiangjiao;
					const giftRecord = player.getStorage("Airi_qiangjiao_giftRecord");
					const hasGift = giftRecord && giftRecord.valid;
					if ((isEquip || hasGift) && get.is.damageCard(card)) {
						return num + 10;
					}
				}
			},
		},
		trigger: {
			player: 'useCard'
		},
		filter: function (event, player) {
			var preCard, postCard;
			postCard = player.getAllHistory('useCard')[player.getAllHistory('useCard').length - 1]?.card;
			if (player.getAllHistory('useCard').length > 1) preCard = player.getAllHistory('useCard')[player.getAllHistory('useCard').length - 2]?.card;
			if (preCard && postCard && get.type(preCard) == "equip" && get.tag(postCard, "damage")) return true;
			if (!get.tag(postCard, "damage")) return false;
			var bool = false;
			var evevtX = player.getAllHistory("lose", evt => {
				var evtx = evt.getParent(),
					name = evtx.getParent().name;
				if ((evtx.giver || name == "gift") && evtx.cards?.some(i => get.type(i) == "equip")) bool = true;
				if (evtx.name == "useCard" && evtx.card !== event.card) bool = false;
				return evtx.name == "useCard";
			});
			if (!evevtX?.length) return false;
			var ext = evevtX[evevtX.length - 1]?.getParent();
			return bool && ext == event;
		},
		cost: async function (event, trigger, player) {
			const result = await player.chooseTarget(
				get.prompt2(event.skill),
				function (card, player, target) {
					return target != player;
				}
			).set("ai", function (target) {
				const player = get.player();
				let eff = get.damageEffect(target, player, player);
				if (get.attitude(player, target) < 0) {
					eff += 1.5;
				}
				return eff;
			}).forResult();

			if (result.bool) {
				event.result = {
					bool: true,
					targets: result.targets
				};
			}
		},
		content: async function (event, trigger, player) {
			const target = event.targets[0];
			const vcard = new lib.element.VCard({ name: "chenhuodajie" });
			await player.useCard(vcard, target, false);

			const canOpt1 = !player.hasSkill('Airi_qiangjiao_count1');
			const canOpt2 = !player.hasSkill('Airi_qiangjiao_count2');

			if (!canOpt1 && !canOpt2) return;

			const colorText = get.translation(get.color(trigger.card));
			const choices = [];
			const choiceMap = [];

			if (canOpt1) {
				choices.push("令其本回合无法使用或打出" + colorText + "牌");
				choiceMap.push(1);
			}
			if (canOpt2) {
				choices.push("对其造成一点伤害");
				choiceMap.push(2);
			}

			const result2 = await player.chooseControl(choices)
				.set("prompt", "强角：请选择一项（每回合各项限一次）")
				.set("ai", function () {
					if (canOpt2 && (!player.hujia || player.hujia < 1)) return choices.indexOf("对其造成一点伤害");
					return 0;
				})
				.forResult();

			const actualChoice = choiceMap[result2.index];

			if (actualChoice === 1) {
				player.addTempSkill('Airi_qiangjiao_count1', { player: 'phaseAfter' });
				const color = get.color(trigger.card);
				target.addTempSkill("Airi_qiangjiao_block");
				target.markAuto("Airi_qiangjiao_block", [color]);
				player.addTempSkill("Airi_qiangjiao_addsha");
			} else if (actualChoice === 2) {
				player.addTempSkill('Airi_qiangjiao_count2', { player: 'phaseAfter' });
				await target.damage();
				if (!player.hujia || player.hujia < 1) {
					await player.changeHujia(1);
				}
			}
		},
		subSkill: {
			count1: { charlotte: true },
			count2: { charlotte: true },
			block: {
				charlotte: true,
				onremove: true,
				mod: {
					cardEnabled: function (card, player) {
						const blocked = player.getStorage("Airi_qiangjiao_block");
						if (blocked && blocked.includes(get.color(card))) return false;
					},
					cardRespondable: function (card, player) {
						const blocked = player.getStorage("Airi_qiangjiao_block");
						if (blocked && blocked.includes(get.color(card))) return false;
					},
					cardSavable: function (card, player) {
						const blocked = player.getStorage("Airi_qiangjiao_block");
						if (blocked && blocked.includes(get.color(card))) return false;
					}
				},
				mark: true,
				intro: { content: "本回合不能使用或打出$颜色的牌" },
				sourceSkill: "Airi_qiangjiao"
			},
			addsha: {
				charlotte: true,
				onremove: true,
				mod: {
					cardUsable: function (card, player, num) {
						if (card.name == "sha") return num + 1;
					}
				},
				sourceSkill: "Airi_qiangjiao"
			}
		}
	},
	"Airi_suchou": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: "phaseJieshuBegin"
		},
		init: function (player, skill) {
			if (lib.card.evilnut && !lib.card.evilnut.gifts) {
				lib.card.evilnut.gifts = true;
			}
		},
		filter: function (event, player) {
			return player.getDamagedHp() > 0;
		},
		content: function () {
			"step 0";
			var x = player.getDamagedHp();
			var cards = get.bottomCards(3);
			if (!cards || cards.length === 0) {
				event.finish();
				return;
			}
			event.cards = cards;
			var toGain = Math.min(x, cards.length);
			player.chooseCardButton("宿仇：请选择获得至多" + toGain + "张牌", [1, toGain], cards).set("ai", function (button) {
				return get.value(button.link, player);
			});
			"step 1";
			event.gainedCards = [];
			event.gainedTypes = [];
			if (result.bool && result.links && result.links.length > 0) {
				event.gainedCards = result.links;
				for (var i = 0; i < event.gainedCards.length; i++) {
					event.gainedTypes.push(get.type2(event.gainedCards[i]));
				}
				player.gain(event.gainedCards, "gain2");
			}

			event.remaining = event.cards.filter(function (card) {
				return !event.gainedCards.includes(card);
			});
			"step 2";
			if (event.remaining.length > 0) {
				if (event.remaining.length === 1) {
					ui.cardPile.insertBefore(event.remaining[0], ui.cardPile.firstChild);
				} else {
					player.chooseToMove("宿仇：将剩余牌按顺序置于牌堆顶（先选择的在上）")
						.set("list", [["牌堆顶", event.remaining]])
						.set("processAI", function (list) {
							return [list[0][1].sort((a, b) => get.value(b, player) - get.value(a, player))];
						});
				}
			} else {
				event.goto(4);
			}
			"step 3";
			if (result && result.bool && result.moved && result.moved[0]) {
				var sorted = result.moved[0];
				for (var i = sorted.length - 1; i >= 0; i--) {
					ui.cardPile.insertBefore(sorted[i], ui.cardPile.firstChild);
				}
			} else if (event.remaining && event.remaining.length > 0) {
				for (var i = event.remaining.length - 1; i >= 0; i--) {
					ui.cardPile.insertBefore(event.remaining[i], ui.cardPile.firstChild);
				}
			}
			"step 4";
			var x = player.getDamagedHp();
			var uniqueTypes = [...new Set(event.gainedTypes)];
			if (uniqueTypes.length >= (4 - x) && event.gainedCards.length > 0) {
				var evilnut = game.createCard("evilnut", "spade", 2);
				evilnut.addCardtag("gifts");
				player.gain(evilnut, "gain2");
				game.log(player, "获得了一张", "#y邪念之实");
			}
		},
		ai: {
			threaten: function (player, target) {
				return 0.5 + 0.5 * target.getDamagedHp();
			}
		}
	},
	
	// 飞鸟悠里
    "Yuuri_tongze": {
        audio: "ext:魔法纪录/audio/skill:2",
        init: function(player) {
            player.storage.renku = true;
        },
        group: ["Yuuri_tongze_gain", "Yuuri_tongze_damage"],
        subSkill: {
            gain: {
                audio: "Yuuri_tongze",
                trigger: { player: "gainAfter" },
                filter: function(event, player) {
                    if (_status.currentPhase !== player) return false;
                    if (!event.cards || event.cards.length === 0) return false;
                    return event.cards.some(c => get.position(c) === "h");
                },
                content: function(event, trigger, player) {
                    "step 0"
                    var cards = trigger.cards.filter(c => get.position(c) === "h");
                    if (cards.length === 0) {
                        event.finish();
                        return;
                    }
                    player.chooseCard("h", 1, "同泽：你可以将获得的一张牌置入【仁库】").set("filterCard", function(card) {
                        return _status.event.cards.includes(card);
                    }).set("cards", cards).set("ai", function(card) {
                        return 6 - get.value(card); 
                    });
                    "step 1"
                    if (result.bool && result.cards && result.cards.length > 0) {
                        var cardToRenku = result.cards;
                        player.$throw(cardToRenku, 1000);
                        game.log(player, "将", cardToRenku, "置入了", "#y【仁库】");
                        player.lose(cardToRenku, ui.special, "toRenku");
                        game.cardsGotoSpecial(cardToRenku, "toRenku");
                    }
                }
            },
            damage: {
                audio: "Yuuri_tongze",
                trigger: { global: "damageEnd" },
                filter: function(event, player) {
                    return _status.renku && _status.renku.length > 0;
                },
                cost: function(event, trigger, player) {
                    "step 0"
                    player.chooseButton([
                        "同泽：你可以将【仁库】内的一张牌置于牌堆底，然后你与 " + get.translation(trigger.player) + " 各选择一种类别获得之", 
                        _status.renku
                    ]).set("ai", function(button) { 
                        var player = _status.event.player;
                        var target = _status.event.getTrigger().player;
                        var att = get.attitude(player, target);
                        
                        if (att >= 0) return 1;
                        
                        var enemies = game.filterPlayer(current => get.attitude(player, current) < 0);
                        var isTurnSoon = (_status.currentPhase && (_status.currentPhase.next === target || _status.currentPhase === target));
                        if (enemies.length <= 2 && target.hp === 1 && target.countCards("h") <= 2 && isTurnSoon) {
                            return 1;
                        }
                        return 0; 
                    });
                    "step 1"
                    if (result.bool && result.links && result.links.length > 0) {
                        event.result = { bool: true, cost_data: result.links[0] };
                    }
                },
                content: function(event, trigger, player) {
                    "step 0"
                    var target = trigger.player;
                    var renkuCard = event.cost_data;
                    
                    _status.renku.remove(renkuCard);
                    renkuCard.fix();
                    ui.cardPile.insertBefore(renkuCard, ui.cardPile.childNodes[0]);
                    game.log(player, "将", renkuCard, "从", "#y【仁库】", "置于了牌堆底");
                    
                    var chooseAI = function() {
                        var p = _status.event.choosingPlayer;
                        var isTurnSoon = (_status.currentPhase && (_status.currentPhase.next === p || _status.currentPhase === p));
                        var hasSaveCard = p.countCards("h", function(c) { return c.name === "tao" || c.name === "jiu"; }) > 0;
                        var isLowHp = p.hp <= 2;
                        var teammateLowHp = game.filterPlayer(current => get.attitude(p, current) > 0 && current.hp <= 2).length > 0;
                        
                        if (isLowHp || teammateLowHp) return "basic";
                        if (hasSaveCard || isTurnSoon) return Math.random() > 0.5 ? "trick" : "equip";
                        return "trick"; 
                    };
                    
                    player.chooseControl("basic", "trick", "equip")
                        .set("prompt", "同泽：请选择从牌堆中获得一种类别的牌")
                        .set("choosingPlayer", player)
                        .set("ai", chooseAI);

					//ai逻辑
                    "step 1"
                    if (result.control) {
                        var type = result.control;
                        var c = get.cardPile(function(card) {
                            return get.type2(card, false) === type || get.type(card, false) === type;
                        });
                        if (c) player.gain(c, "gain2", "log");
                    }
                    
                    "step 2"
                    var target = trigger.player;
                    var chooseAI = function() {
                        var p = _status.event.choosingPlayer;
                        var isTurnSoon = (_status.currentPhase && (_status.currentPhase.next === p || _status.currentPhase === p));
                        var hasSaveCard = p.countCards("h", function(c) { return c.name === "tao" || c.name === "jiu"; }) > 0;
                        var isLowHp = p.hp <= 2;
                        var teammateLowHp = game.filterPlayer(current => get.attitude(p, current) > 0 && current.hp <= 2).length > 0;
                        if (isLowHp || teammateLowHp) return "basic";
                        if (hasSaveCard || isTurnSoon) return Math.random() > 0.5 ? "trick" : "equip";
                        return "trick";
                    };

                    if (target.isAlive() && target !== player) {
                        target.draw();
                        target.chooseControl("basic", "trick", "equip")
                            .set("prompt", "同泽：作为受伤角色，请选择从牌堆中获得一种类别的牌")
                            .set("choosingPlayer", target)
                            .set("ai", chooseAI);
                        event.target_choose = true;
                    } else if (target.isAlive() && target === player) {
                        player.draw();
                        player.chooseControl("basic", "trick", "equip")
                            .set("prompt", "同泽：作为受伤角色，请再次选择从牌堆中获得一种类别的牌")
                            .set("choosingPlayer", player)
                            .set("ai", chooseAI);
                        event.target_choose = true;
                    }
                    
                    "step 3"
                    if (event.target_choose && result.control) {
                        var type = result.control;
                        var c = get.cardPile(function(card) {
                            return get.type2(card, false) === type || get.type(card, false) === type;
                        });
                        if (c) trigger.player.gain(c, "gain2", "log");
                    }
                }
            }
        }
    },
    "Yuuri_huanchi": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        group: ["Yuuri_huanchi_init"],
        filter: function(event, player) {
            return player.countCards("he") > 0;
        },
        ai: {
            order: 7, 
            result: {
                player: function(player) {
                    if (player.hp <= 1) return 0; 
                    
                    var allies = game.filterPlayer(current => get.attitude(player, current) > 0 && current !== player);
                    if (allies.length > 0) return 1; 
                    
                    var enemies = game.filterPlayer(current => get.attitude(player, current) < 0);
                    if (enemies.length > 0 && _status.renku && _status.renku.length <= 3) return 1;
                    
                    return 0;
                }
            }
        },
        content: function(event, trigger, player) {
            "step 0"
            player.loseHp(1);
            "step 1"
            player.chooseCardTarget({
                prompt: "幻匙：请选择至多两张牌扣置于一名其他角色的武将牌上作为【梦味】",
                selectCard: [1, 2],
                position: "he",
                filterTarget: function(card, player, target) { return target !== player; },
                ai1: function(card) {
                    return 6 - get.value(card); 
                },
                ai2: function(target) {
                    var player = _status.event.player;
                    var att = get.attitude(player, target);
                    if (att > 0) return att; 
                    var allies = game.filterPlayer(current => get.attitude(player, current) > 0 && current !== player);
                    var alliesLowCards = allies.length === 0 || allies.every(a => a.countCards('h') <= 2);
                    if (att < 0 && alliesLowCards && _status.renku && _status.renku.length <= 3) {
                        return 0.1; 
                    }
                    return 0;
                }
            });
            "step 2"
            if (result.bool && result.targets && result.targets.length > 0 && result.cards && result.cards.length > 0) {
                var target = result.targets[0];
                var cards = result.cards;
                if (player.isUnderControl && !player.isUnderControl() && get.attitude(player, target) < 0 && cards.length > 1) {
                    cards = [cards[0]]; 
                }
                
                player.lose(cards, ui.special, "toExt");
                target.addSkill("Yuuri_mengwei");
                target.markAuto("Yuuri_mengwei", cards);
                
                if (!target.storage.Yuuri_mengwei_source) target.storage.Yuuri_mengwei_source = [];
                if (!target.storage.Yuuri_mengwei_source.includes(player)) {
                    target.storage.Yuuri_mengwei_source.push(player);
                }
                
                game.log(player, "将", cards, "作为", "#g【梦味】", "扣置于了", target, "的武将牌上");
            }
        },
        subSkill: {
            init: {
                trigger: { global: "phaseBefore", player: ["enterGame", "phaseZhunbeiBegin"] },
                forced: true,
                filter: function(event, player) {
                    if (player.storage.Yuuri_huanchi_init) return false;
                    return event.name !== "phase" || game.phaseNumber === 0;
                },
                content: function(event, trigger, player) {
                    player.storage.Yuuri_huanchi_init = true;
                    var cards = get.cards(2);
                    game.cardsGotoSpecial(cards, "toRenku");
                    game.log(player, "触发", "#g【幻匙】", "将牌堆顶的两张牌置入了", "#y【仁库】");
                }
            }
        }
    },
    "Yuuri_mengwei": {
        charlotte: true,
        mark: true,
        intro: {
            content: "cards",
            name: "梦味"
        },
        trigger: { global: "damage" },
        forced: true,
        filter: function(event, player) {
            return event.source === player && player.storage.Yuuri_mengwei && player.storage.Yuuri_mengwei.length > 0;
        },
        content: function(event, trigger, player) {
            "step 0"
            var cards = player.storage.Yuuri_mengwei.slice();
            
            player.unmarkAuto("Yuuri_mengwei", cards);
            player.removeSkill("Yuuri_mengwei");
            
            game.cardsGotoSpecial(cards, "toRenku");
            game.log(player, "武将牌上的【梦味】被置入了", "#y【仁库】");
            
            var armorNum = Math.floor(cards.length / 2);
            event.armorNum = armorNum;
            
            if (armorNum > 0) {
                player.changeHujia(armorNum);
                player.addSkill("Yuuri_huanchi_draw");
                game.log(player, "获得了", "#g" + armorNum + "点护甲");
            } else {
                game.log("【梦味】牌数量不足两张，未能产生护甲");
            }
            
            "step 1"
            if (event.armorNum > 0 && player.storage.Yuuri_mengwei_source) {
                var sources = player.storage.Yuuri_mengwei_source.filter(p => p && p.isAlive());
                event.sources = sources;
                event.index = 0;
            } else {
                event.finish();
            }
            
            "step 2"
            if (event.sources && event.index < event.sources.length) {
                var yuuri = event.sources[event.index];
                yuuri.changeHujia(event.armorNum);
                yuuri.addSkill("Yuuri_huanchi_draw");
                game.log(yuuri, "获得了", "#g" + event.armorNum + "点护甲");
                event.index++;
                event.redo(); 
            } else {
                player.storage.Yuuri_mengwei_source = [];
            }
        }
    },
    "Yuuri_huanchi_draw": {
        charlotte: true,
        marktext: "味",
        intro: {
            name: "梦味",
            content: "摸牌阶段多摸X张牌（X为你的护甲值）"
        },
        trigger: { player: "phaseDrawBegin2" },
        forced: true,
        filter: function(event, player) {
            var hujia = typeof player.countHujia === "function" ? player.countHujia() : (player.hujia || 0);
            return !event.numFixed && hujia > 0;
        },
        content: function(event, trigger, player) {
            var hujia = typeof player.countHujia === "function" ? player.countHujia() : (player.hujia || 0);
            trigger.num += hujia;
            game.log(player, "因", "#g【梦味】", "多摸了", "#y" + hujia + "张牌");
        }
    },







	// 魔晓美焰
	"devil_homura_weijie": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			global: ["gameStart"],
		},
		forced: true,
		filter(event, player) {
			return event.name != "phase" || game.phaseNumber == 0;
		},
		async content(event, trigger, player) {
			const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
			let cards = [];
			for (let num of numbers) {
				cards.push(game.createCard2("ying", "spade", num));
			}
			const next = player.addToExpansion(cards, "gain2");
			next.gaintag.add("devil_homura_weijie");
			await next;
		},
		marktext: "伪",
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
		group: ["devil_homura_weijie_gain"],
		subSkill: {
			gain: {
				audio: "devil_homura_weijie",
				trigger: { global: ["useCardAfter", "respondAfter"] },
				filter(event, player) {
					if (event.player == player) return false;
					const num = get.number(event.card);
					if (typeof num != "number") return false;
					return player.getExpansions("devil_homura_weijie").some(card => get.number(card) == num && card.name == "ying");
				},
				check(event, player) {
					if (get.attitude(player, event.player) > 0) {
						if (get.type(event.card) == "equip") {
							return false;
						}
						if (get.type(event.card) == "trick" && get.subtype(event.card) == "delay") {
							return false;
						}
					}
					return get.value(event.card) > 0;
				},
				prompt2(event, player) {
					return "获得" + get.translation(event.player) + "使用或打出的" + get.translation(event.card) + "，并弃置对应点数的【影】";
				},
				logTarget: "player",
				async content(event, trigger, player) {
					await player.gain(trigger.cards[0], "gain2");
					player.loseToDiscardpile(player.getExpansions("devil_homura_weijie").find(card => get.number(card) == get.number(trigger.card) && card.name == "ying"));
				},
			},
		},
		ai: {
			threaten: 2,
			effect: {
				target(card, player, target) {
					if (get.suit(card) == "spade" && player != target) {
						return [0.5, 1];
					}
				},
			},
		},
	},
	"devil_homura_yinting": {
		trigger: { player: "phaseZhunbeiBegin" },
		frequent: true,
		async content(event, trigger, player) {
			const shadowCount = player.getExpansions("devil_homura_weijie").length;
			const viewNum = shadowCount + 1;
			const num = Math.min(shadowCount, 7);

			if (viewNum > 0) {
				const viewCards = get.cards(Math.min(viewNum, 7));
				const viewCards2 = [];
				game.cardsGotoOrdering(viewCards);

				const result = await player.chooseToMove(true)
					.set("list", [["牌堆顶", viewCards], ["牌堆底", viewCards2]])
					.set("prompt", "银庭：将牌以任意顺序置于牌堆顶或牌堆底")
					.set("processAI", function (list) {
						const cards = list[0][1].slice(0);
						const poisonCards = cards.filter(card => card.name == 'du');
						const nonPoisonCards = cards.filter(card => card.name != 'du');
						const redCards = nonPoisonCards.filter(card => get.color(card) == 'red');
						const blackCards = nonPoisonCards.filter(card => get.color(card) == 'black');
						const redValue = redCards.reduce((sum, card) => sum + get.value(card), 0);
						const blackValue = blackCards.reduce((sum, card) => sum + get.value(card), 0);
						const cards1 = redValue >= blackValue ? redCards : blackCards;
						const cards2 = redValue >= blackValue ? blackCards : redCards;
						return [cards1, cards2.concat(poisonCards)];
					})
					.forResult();

				if (result?.bool) {
					let top = result.moved[0];
					let bottom = result.moved[1];
					top.reverse();
					game.cardsGotoPile(top.concat(bottom), ["top_cards", top], function (event, card) {
						if (event.top_cards.includes(card)) return ui.cardPile.firstChild;
						return null;
					});
				}

				await player.discard(player.getExpansions("devil_homura_weijie"));

				const targetResult = await player.chooseTarget([1, num], true, "对" + (num > 1 ? "至多" : "") + get.cnNumber(num) + "名角色造成1点伤害")
					.set("ai", function (target) {
						var player = _status.event.player;
						return get.attitude(target, player) < 0;
					}).forResult();

				if (targetResult.bool) {
					var targets = targetResult.targets.sortBySeat();
					player.line(targets, "green");
					for (var i of targets) {
						i.damage();
					}
				}

				await player.useSkill("devil_homura_weijie");
			}
		},
		ai: {
			threaten: 2.5,
		},
	},
	"devil_homura_cuanxiang": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: {
			player: ["phaseBegin"],
		},
		async cost(event, trigger, player) {
			const basicTypes = ["sha", "ying"];
			const choices = basicTypes.map(name => get.translation(name));
			choices.push("cancel2");
			const result = await player.chooseControl(choices)
				.set("prompt", "篡象：选择一种基本牌，令场上其他角色的黑桃牌视为该基本牌")
				.set("ai", function () {
					return [0, 1].randomGet();
				})
				.forResult();
			if (result.index == choices.length - 1) {
				event.result = { bool: false };
			} else {
				event.result = {
					bool: true,
					cost_data: basicTypes[result.index],
				};
			}
		},
		async content(event, trigger, player) {
			const cardName = event.cost_data;
			game.filterPlayer(current => current != player).forEach(target => {
				target.addAdditionalSkills("devil_homura_cuanxiang_" + player.playerid, "devil_homura_cuanxiang_viewas", true);
				target.storage.devil_homura_cuanxiang_viewas = cardName;
			});
		},
		group: ["devil_homura_cuanxiang_block"],
		subSkill: {
			viewas: {
				charlotte: true,
				onremove: true,
				mark: true,
				marktext: "篡象",
				intro: {
					content(storage) {
						return "场上的黑桃牌视为" + get.translation(storage);
					},
				},
				mod: {
					cardname(card, player) {
						if (get.position(card) == "h" && get.suit(card) == "spade") {
							return player.storage.devil_homura_cuanxiang_viewas;
						}
					},
				},
			},
			block: {
				trigger: { player: ["damageBegin4", "loseHpBegin", "recoverBegin"] },
				forced: true,
				filter(event, player) {
					if (event.name == "damage") {
						return event.card && get.suit(event.card) == "spade";
					}
					if (event.name == "loseHp") {
						if (event.card && get.suit(event.card) == "spade") return true;
						return event.type == "du";
					}
					if (event.name == "recover") {
						return event.card && get.suit(event.card) == "spade";
					}
					return false;
				},
				content() {
					trigger.cancel();
				},
				ai: {
					nodu: true,
					effect: {
						target(card, player, target) {
							if (get.suit(card) == "spade" && get.tag(card, "damage")) {
								return "zeroplayertarget";
							}
						},
					},
				},
			},
		},
		ai: {
			threaten: 2,
		},
	},

	// 梓美冬
	"mifuyu_mengying": {
		audio: "ext:魔法纪录/audio/skill:2",
		limited: true,
		trigger: {
			player: "phaseBegin",
		},
		filter(event, player) {
			if (player.awakenedSkills.includes("mifuyu_mengying")) return false;
			if (!player.storage.mifuyu_mengying_round) return false;
			return true;
		},
		async cost(event, trigger, player) {
			let prompt2 = "将一名角色的体力值与手牌数恢复至本轮开始时，然后该角色执行一个额外回合。以此法进行的回合结束时，此角色翻面。<br>";
			prompt2 += "与本轮开始时的状态发生变化的角色有：<br>";
			const players = game.filterPlayer();
			for (const current of players) {
				const data = player.storage.mifuyu_mengying_round[current.playerid];
				if (data && data.hp != current.hp || data.handCount != current.countCards("h")) {
					prompt2 += `${get.translation(current)}：体力${data.hp}/${current.maxHp}，手牌${data.handCount}<br>`;
				}
			}
			const result = await player.chooseTarget(get.prompt("mifuyu_mengying"), prompt2, function (card, player, target) {
				const data = player.storage.mifuyu_mengying_round[target.playerid];
				if (!data) return false;
				return true;
			}).set("ai", function (target) {
				const data = player.storage.mifuyu_mengying_round[target.playerid];
				if (!data) return 0;
				const hpDiff = data.hp - target.hp;
				const handDiff = data.handCount - target.countCards("h");
				return (hpDiff + handDiff + 1) * get.attitude(player, target);
			}).forResult();
			if (result.bool) {
				event.result = result;
			}
		},
		async content(event, trigger, player) {
			player.awakenSkill("mifuyu_mengying");
			const target = event.targets[0];
			const data = player.storage.mifuyu_mengying_round[target.playerid];
			if (!data) return;

			player.line(target, "green");

			if (target.hp < data.hp) {
				await target.recover(data.hp - target.hp);
			} else if (target.hp > data.hp) {
				await target.loseHp(target.hp - data.hp);
			}

			if (!target.isAlive()) return;

			const currentHand = target.countCards("h");
			if (currentHand < data.handCount) {
				await target.draw(data.handCount - currentHand);
			} else if (currentHand > data.handCount) {
				await target.chooseToDiscard("h", currentHand - data.handCount, true);
			}
			target.storage.mifuyu_mengying_extra = true;
			target.addSkill("mifuyu_mengying_turn");
			target.insertPhase();
			player.addTempSkill("mifuyu_mengying_restore", { player: "dieAfter" });
		},
		group: ["mifuyu_mengying_roundSave"],
		subSkill: {
			roundSave: {
				trigger: { global: "roundStart" },
				silent: true,
				firstDo: true,
				forced: true,
				popup: false,
				async content(event, trigger, player) {
					player.storage.mifuyu_mengying_round = {};
					const players = game.filterPlayer();
					for (const current of players) {
						player.storage.mifuyu_mengying_round[current.playerid] = {
							hp: current.hp,
							handCount: current.countCards("h"),
						};
					}
				},
			},
			restore: {
				trigger: { player: "damageAfter" },
				forced: true,
				async content(event, trigger, player) {
					if (player.awakenedSkills.includes("mifuyu_mengying")) {
						player.restoreSkill("mifuyu_mengying");
						game.log(player, "恢复了限定技", "#g【梦影】");
					}

					if (!game.hasPlayer(current => current.isTurnedOver())) return;

					const result = await player.chooseTarget("梦影：是否将一名已翻面的角色复原？", function (card, player, target) {
						return target.isTurnedOver();
					}).set("ai", function (target) {
						return get.attitude(player, target);
					}).forResult();

					if (result.bool && result.targets.length) {
						const target = result.targets[0];
						player.line(target, "green");
						await target.turnOver(false);
					}
				},
			},
			turn: {
				charlotte: true,
				silent: true,
				onremove: true,
				trigger: { player: "phaseAfter" },
				forced: true,
				popup: false,
				filter(event, player) {
					return player.storage.mifuyu_mengying_extra;
				},
				async content(event, trigger, player) {
					delete player.storage.mifuyu_mengying_extra;
					if (!player.isTurnedOver()) {
						await player.turnOver();
					}
					player.removeSkill("mifuyu_mengying_turn");
				},
			},
		},
		ai: {
			threaten: 5,
		},
	},
	"mifuyu_huyu": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { global: "damageBegin4" },
		usable: 1,
		groupSkill: "Magius_Wing",
		prompt(event, player) {
			return "护羽：是否令对" + get.translation(event.player) + "的伤害无效并令" + get.translation(event.source) + "结束此阶段";
		},
		filter(event, player) {
			if (player.group != "Magius_Wing") return false;
			if (!event.source || !event.source.isIn()) return false;
			if (!player.countCards("he")) return false;
			const totalDamage = event.player.getHistory("damage").reduce(function (sum, evt) {
				return sum + evt.num;
			}, 0) + event.num;
			return totalDamage > 1;
		},
		async content(event, trigger, player) {
			const result = await player.chooseToDiscard("he", 1)
				.set("ai", function (card) {
					const player = _status.event.player;
					const trigger = _status.event.getTrigger();
					if (get.attitude(player, trigger.player) > 0 && get.attitude(player, trigger.source) < 0) {
						return 7 - get.value(card);
					}
					return 0;
				}).forResult();
			if (!result.bool) return;

			trigger.cancel();
			const source = trigger.source;
			player.line(source, "green");
			if (source && source.isIn()) {
				let evt = trigger;
				while (evt) {
					if (evt.player === source && evt.name !== "phaseLoop" && evt.name !== "phase" && evt.name.startsWith("phase")) {
						evt.finish();
						game.log(source, "的", evt.name, "被结束");
						break;
					}
					evt = evt.getParent();
				}
			}
		},
		ai: {
			expose: 0.3,
			threaten: 1.5,
		},
	},
	"mifuyu_huanren": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "useCard" },
		usable: 1,
		groupSkill: "Kamihama_Magia_Union",
		filter(event, player) {
			if (player.group != "Kamihama_Magia_Union") return false;
			return true;
		},
		async cost(event, trigger, player) {
			const result = await player.chooseTarget(get.prompt("mifuyu_huanren"), "令一名其他角色弃置两张牌", function (card, player, target) {
				return target.countCards("he") > 0 && target != player;
			}).set("ai", function (target) {
				return -get.attitude(player, target);
			}).forResult();
			if (result.bool) {
				event.result = result;
			}
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			player.line(target, "green");

			const discardNum = Math.min(2, target.countCards("he"));
			const result = await target.chooseToDiscard("he", discardNum, true, "环刃：请弃置" + get.cnNumber(discardNum) + "张牌")
				.set("ai", function (card) {
					if (ui.selected.cards.length == 0) {
						return -get.value(card, target);
					}
					const first = ui.selected.cards[0];
					const sameSuit = get.suit(card) == get.suit(first);
					const sameType = get.type(card) == get.type(first);
					if (sameSuit || sameType) {
						return skills.duexcept_ai(-get.value(card, target) - 5, card, target);
					}
					return skills.duexcept_ai(-get.value(card, target), card, target);
				})
				.forResult();

			if (result.bool && result.cards && result.cards.length >= 2) {
				const card1 = result.cards[0];
				const card2 = result.cards[1];
				const sameSuit = get.suit(card1) == get.suit(card2);
				const sameType = get.type(card1) == get.type(card2);
				if (sameSuit || sameType) {
					await target.damage(player, "fire");
				}
			}
		},
		ai: {
			threaten: 2,
		},
	},

	// 圣迦南
	"Kanna_eshi": {
		audio: "ext:魔法纪录/audio/skill:2",
		group: ["Kanna_eshi_init", "Kanna_eshi_recover", "Kanna_eshi_clear"],
		mod: {
			maxHandcard: function (player, num) {
				return num + (player.countMark("Kanna_eshi_clear") || 0);
			}
		},
		subSkill: {
			init: {
				trigger: { global: "phaseBefore", player: "enterGame" },
				forced: true,
				filter: function (event, player) {
					return (event.name != "phase" || game.phaseNumber == 0) && !player.storage.Kanna_eshi_init;
				},
				content: async function (event, trigger, player) {
					player.storage.Kanna_eshi_init = true;
					var equipCard = game.createCard2("evilnut", "spade", 12);
					equipCard.addCardtag("gifts");
					player.$gain2(equipCard, false);
					await player.equip(equipCard);
					var cards = [
						game.createCard2("evilnut", "spade", 1),
						game.createCard2("evilnut", "spade", 11),
						game.createCard2("evilnut", "spade", 13)
					];
					cards.forEach(function (card) { card.addCardtag("gifts"); });
					game.broadcastAll(function () {
						if (lib.inpile && !lib.inpile.includes("evilnut")) lib.inpile.add("evilnut");
					});
					game.cardsGotoPile(cards, function () {
						return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
					});
				}
			},
			recover: {
				trigger: { global: ["loseAfter", "loseAsyncAfter", "cardsDiscardAfter"] },
				filter: function (event, player) {
					var cards = (event.name == "cardsDiscard") ? event.cards : (event.cards2 || []);
					if (!cards || cards.length == 0) return false;
					return cards.some(function (card) { return card.name == "evilnut" && get.position(card, true) == "d"; });
				},
				content: async function (event, trigger, player) {
					var cards = (trigger.name == "cardsDiscard") ? trigger.cards : (trigger.cards2 || trigger.getl(trigger.player).cards2 || []);
					var nuts = cards.filter(function (card) { return card.name == "evilnut" && get.position(card, true) == "d"; });
					if (!nuts.length) return;

					player.addMark("Kanna_eshi_clear", nuts.length, false);
					game.log(player, "因", "#y【邪念之实】", "进入弃牌堆，本回合手牌上限+", nuts.length);

					var next = player.chooseToDiscard("he", 2, "恶实：是否弃置两张牌，将一张【邪念之实】置于牌堆顶？");
					
					next.set("ai", function (card) { 
						var p = _status.event.player;
						var current = _status.currentPhase;
						
						if (current == p) {
							if (p.countCards("h") > 3) return 5 - get.value(card);
							return 0;
						}
						if (p.next == current || current.next == p || get.attitude(p, current) < 0) {
							if (p.countCards("he") > 3) return 5 - get.value(card);
						}
						
						return 0;
					});

					var result = await next.forResult();
					if (result.bool) {
						var nut = nuts[0];
						ui.cardPile.insertBefore(nut.fix(), ui.cardPile.firstChild);
						game.log(player, "将", nut, "置于了牌堆顶");
					}
				}
			},
			clear: {
				trigger: { global: "phaseAfter" },
				silent: true,
				filter: function (event, player) {
					return player.countMark("Kanna_eshi_clear") > 0;
				},
				content: function (event, trigger, player) {
					player.removeMark("Kanna_eshi_clear", player.countMark("Kanna_eshi_clear"));
				},
				mark: true,
				intro: {
					content: function (storage, player, skill) {
						return "本回合手牌上限已被增加：" + (player.countMark("Kanna_eshi_clear") || 0);
					}
				}
			}
		}
	},

	"Kanna_beidan": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		position: "he",
		filterCard: function (card, player) { return true; },
		selectCard: [1, Infinity],
		check: function (card) { 
			var player = _status.event.player || get.owner(card);
			if (!player) return 0;

			var val = get.value(card);
			if (card.name === 'evilnut') {
				if (!player.hasSkill("Kanna_beidan_reset")) return 20;
				if (player.countCards("h") > 4) return 8;
				return 0;
			}
			if (player.hp <= 1 && player.countCards("h") <= 2) {
				if (card.name === 'shan' || card.name === 'tao') return 0;
			}
			if (val >= 7) return 0;
			return 7 - val; 
		},
		content: async function (event, trigger, player) {
			"step 0";
			var cards = event.cards;
			var types = cards.map(function (c) { return get.type(c); }).toUniqued().length;
			event.types_count = types;

			var nuts = cards.filter(function (c) { return c.name === "evilnut"; });

			if (nuts.length > 0) {
				for (var i = 0; i < nuts.length; i++) {
					var copy = game.createCard(nuts[i]);
					copy.addCardtag("gifts");
					ui.cardPile.appendChild(copy.fix());
				}
				if (!player.hasSkill("Kanna_beidan_reset")) {
					player.addTempSkill("Kanna_beidan_reset"); 
					if (player.getStat().skill.Kanna_beidan) {
						player.getStat().skill.Kanna_beidan--; 
					}
					game.log(player, "因重铸了", "#y【邪念之实】", "，重置了", "#g【悖诞】", "的使用次数");
				}
			}
			await player.recast(cards);
			"step 1";
			if (event.types_count > 0) {
				await player.draw(event.types_count);
				game.log(player, "因重铸了", event.types_count, "种类别，额外摸了", event.types_count, "张牌");
			}
		},
		ai: {
			order: 7, 
			result: {
				player: 1 
			}
		},
		subSkill: {
			reset: { charlotte: true, onremove: true }
		}
	},
	"Kanna_bixiu": {
		audio: "ext:魔法纪录/audio/skill:2",
		dutySkill: true,
		group: ["Kanna_bixiu_mission", "Kanna_bixiu_achieve", "Kanna_bixiu_fail"],
		subSkill: {
			mission: {
				trigger: { global: "die" },
				filter: function (event, player) { return !player.awakenedSkills.includes("Kanna_bixiu"); },
				content: async function (event, trigger, player) {
					"step 0";
					var list = trigger.player.getStockSkills(trigger.player.name, true, false).filter(function (s) {
						var info = get.info(s);
						return info && !info.juexingji && !info.zhuSkill && !info.charlotte && !info.limited && !info.dutySkill && !player.hasSkill(s);
					});
					var choices = ["聚收邪念"];
					if (player.maxHp > 2 && list.length > 0) choices.unshift("夺取技能");
					var result = await player.chooseControl(choices).set("ai", function () { return "聚收邪念"; }).forResult();
					if (result.control == "夺取技能") {
						player.loseMaxHp(2);
						var sResult = await player.chooseControl(list).forResult();
						await player.addSkills(sResult.control);
						player.storage.Kanna_bixiu_count = (player.storage.Kanna_bixiu_count || 0) + 1;
					} else {
						player.gainMaxHp(1);
						var nut = get.cardPile2(function (c) { return c.name == "evilnut"; });
						if (nut) await player.gain(nut, "gain2");
					}
				}
			},
			achieve: {
				trigger: { player: "gainMaxHpAfter", global: "dieAfter" },
				filter: function (event, player) { return player.maxHp >= 7 && !player.awakenedSkills.includes("Kanna_bixiu"); },
				forced: true,
				content: async function (event, trigger, player) {
					player.awakenSkill("Kanna_bixiu");
					await player.reinitCharacter(player.name1, "Hyades");
				}
			},
			fail: {
				trigger: { player: "dying" },
				filter: function (event, player) { return !player.awakenedSkills.includes("Kanna_bixiu"); },
				forced: true,
				content: async function (event, trigger, player) {
					player.awakenSkill("Kanna_bixiu");
					if (player.hp < 1) await player.recover(1 - player.hp);
					await player.removeSkill("Kanna_bixiu");
					await player.addSkills("Hyades_xinsui");
				}
			}
		}
	},
	// 海亚蒂斯之晓
    "Hyades_bixiu": {
        persevereSkill: true,
        group: ["Hyades_bixiu_start", "Hyades_bixiu_handcard"],
        subSkill: {
                start: {
                        trigger: { global: "phaseBefore", player: ["enterGame", "gainSkill:Hyades_bixiu"] },
                        forced: true,
                        filter: function (event, player) {
                                if (player.storage.Hyades_bixiu_inited) return false;
                                if (event.name == "phase" && game.phaseNumber != 0) return false;
                                return true;
                        },
                        content: async function (event, trigger, player) {
                                player.storage.Hyades_bixiu_inited = true;

            game.broadcastAll(() => {
                ui.backgroundMusic.pause();
                ui.backgroundMusic.src = `${lib.assetURL}extension/魔法纪录/audio/background/Magia.mp3`;
                ui.backgroundMusic.loop = true;
            });
                                const toSortPlayers = game.filterPlayer(function(current) { return true; });
                                toSortPlayers.sortBySeat(game.findPlayer2(function(current) { return current.getSeatNum() == 1; }, true));
                                const next = player.chooseToMove("破晓：是否分配所有角色的座次？");
                                next.set("list", [
                                        ["（以下排列的顺序即为发动技能后角色的座次顺序）", [toSortPlayers.map(function(i) { return i.getSeatNum() + "|" + i.name; }), lib.skill.Hyades_bixiu.$createButton]],
                                ]);
                                next.set("toSortPlayers", toSortPlayers.slice(0));
                                next.set("processAI", function () {
                                        const players = get.event().toSortPlayers, p = get.player();
                                        players.randomSort().sort(function(a, b) { return get.attitude(p, b) - get.attitude(p, a); });
                                        return [players.map(function(i) { return i.getSeatNum() + "|" + i.name; })];
                                });
                                const result = await next.forResult();
                                if (result && result.moved) {
                                        const moved = result.moved;
                                        const resultList = moved[0].map(function(info) { return parseInt(info.split("|")[0]); });
                                        const toSwapList = [];
                                        const cmp = function(a, b) { return resultList.indexOf(a) - resultList.indexOf(b); };
                                        for (let i = 0; i < toSortPlayers.length; i++) {
                                                for (let j = 0; j < toSortPlayers.length; j++) {
                                                        if (cmp(toSortPlayers[i].getSeatNum(), toSortPlayers[j].getSeatNum()) < 0) {
                                                                toSwapList.push([toSortPlayers[i], toSortPlayers[j]]);
                                                                var tmp = toSortPlayers[i];
                                                                toSortPlayers[i] = toSortPlayers[j];
                                                                toSortPlayers[j] = tmp;
                                                        }
                                                }
                                        }
                                        game.broadcastAll(function (toSwapList) {
                                                for (let i = 0; i < toSwapList.length; i++) {
                                                        game.swapSeat(toSwapList[i][0], toSwapList[i][1], false);
                                                }
                                        }, toSwapList);
                                }

                                var nuts = [];
                                for (var i = 0; i < ui.cardPile.childNodes.length; i++) {
                                        if (ui.cardPile.childNodes[i].name == "evilnut") nuts.push(ui.cardPile.childNodes[i]);
                                }
                                for (var j = 0; j < ui.discardPile.childNodes.length; j++) {
                                        if (ui.discardPile.childNodes[j].name == "evilnut") nuts.push(ui.discardPile.childNodes[j]);
                                }
                                if (nuts.length > 0) {
                                        await player.gain(nuts, "gain2");
                                }
                        }
                },
                handcard: {
                        mod: {
                                ignoredHandcard: function (card, player) {
                                        if (card.name == "evilnut") return true;
                                }
                        }
                }
        },
        "$createButton": function (item, type, position, noclick, node) {
                const info = item.split("|");
                const _item = item;
                const seat = parseInt(info[0]);
                item = info[1];
                if (node) {
                        node.classList.add("button");
                        node.classList.add("character");
                        node.style.display = "";
                } else {
                        node = ui.create.div(".button.character", position);
                }
                node._link = item;
                node.link = item;
                const func = function (node, item) {
                        const currentPlayer = game.findPlayer(function(current) { return current.getSeatNum() == seat; });
                        if (currentPlayer.classList.contains("unseen_show")) {
                                node.setBackground("hidden_image", "character");
                        } else if (item != "unknown") {
                                node.setBackground(item, "character");
                        }
                        if (node.node) {
                                if (node.node.name) node.node.name.remove();
                                if (node.node.hp) node.node.hp.remove();
                                if (node.node.group) node.node.group.remove();
                                if (node.node.intro) node.node.intro.remove();
                                if (node.node.replaceButton) node.node.replaceButton.remove();
                        }
                        node.node = {
                                name: ui.create.div(".name", node),
                                group: ui.create.div(".identity", node),
                                intro: ui.create.div(".intro", node),
                        };
                        const infoitem = [currentPlayer.sex, currentPlayer.group, currentPlayer.hp + "/" + currentPlayer.maxHp + "/" + currentPlayer.hujia];
                        node.node.name.innerHTML = get.slimName(item);
                        if (lib.config.buttoncharacter_style == "default" || lib.config.buttoncharacter_style == "simple") {
                                if (lib.config.buttoncharacter_style == "simple") {
                                        node.node.group.style.display = "none";
                                }
                                node.classList.add("newstyle");
                                node.node.name.dataset.nature = get.groupnature(get.bordergroup(infoitem));
                                node.node.group.dataset.nature = get.groupnature(get.bordergroup(infoitem), "raw");
                        }
                        node.node.name.style.top = "8px";
                        if (node.node.name.querySelectorAll("br").length >= 4) {
                                node.node.name.classList.add("long");
                                if (lib.config.buttoncharacter_style == "old") {
                                        node.addEventListener("mouseenter", ui.click.buttonnameenter);
                                        node.addEventListener("mouseleave", ui.click.buttonnameleave);
                                }
                        }
                        node.node.intro.innerHTML = lib.config.intro;
                        if (!noclick) {
                                lib.setIntro(node);
                        }
                        node.node.group.innerHTML = "<div>" + get.cnNumber(seat, true) + "号</div>";
                        node.node.group.style.backgroundColor = get.translation(get.bordergroup(infoitem) + "Color");
                };
                node.refresh = func;
                node.refresh(node, item);
                node.link = _item;
                node.seatNumber = seat;
                node._customintro = function(uiintro) {
                        uiintro.add(get.translation(node._link) + "(原" + get.cnNumber(node.seatNumber, true) + "号位)");
                };
                return node;
        }
    },
	"Hyades_huimie": {
		persevereSkill: true,
		mod: {
			targetInRange: function () { return true; },
			cardUsable: function () { return Infinity; }
		},
		trigger: { source: "damageBegin1" },
		forced: true,
		logTarget: "player", // 强制亮起技能指示灯
		content: function (event, trigger, player) {
			var count = player.storage.Kanna_bixiu_count || 0;

			var x = Math.max(1, count);

			trigger.num += x;

			game.log(player, "发动了", "#g【破灭】", "，此伤害额外+#y" + x);
		}
	},
	"Hyades_lianjie": {
		persevereSkill: true,
		group: ["Hyades_lianjie_draw", "Hyades_lianjie_use"],
		subSkill: {
			draw: {
				trigger: { global: ["phaseBegin", "phaseEnd"] },
				forced: true,
				content: async function (event, trigger, player) {
					await player.draw((player.storage.Kanna_bixiu_count || 1) + 1);
				}
			},
			use: {
				trigger: { global: ["damageAfter", "loseAfter", "cardsDiscardAfter"] },
				filter: function (event, player) {
					if (event.name == "damage") {
						if (player.hasSkill("Hyades_lianjie_lock1")) return false;
						return true;
					} else {
						if (player.hasSkill("Hyades_lianjie_lock2")) return false;
						if (event.name == "lose" && event.type != "discard") return false;
						var cards = (event.name == "cardsDiscard") ? event.cards : event.getl(event.player).cards2;
						if (!cards || !cards.length) return false;
						return cards.some(function (c) { return get.color(c) == "black"; });
					}
				},
				direct: true,
				content: async function (event, trigger, player) {
					var type = (trigger.name == "damage") ? 1 : 2;

					player.addTempSkill("Hyades_lianjie_lock" + type);

					var next = player.chooseToUse("连结：是否使用一张牌？（触发时机：" + (type == 1 ? "角色受伤" : "角色弃置黑色牌") + "）");
					var result = await next.forResult();

					if (result.bool) {
						player.logSkill("Hyades_lianjie", trigger.player);
					} else {

						player.removeSkill("Hyades_lianjie_lock" + type);
					}
				}
			},
			lock1: { charlotte: true, onremove: true },
			lock2: { charlotte: true, onremove: true }
		}
	},
	"Hyades_xinsui": {
		audio: "ext:魔法纪录/audio/skill:2",
		limited: true,
		forced: true,
		trigger: { global: "roundStart" },
		skillAnimation: true,
		animationColor: "thunder",
		init: function (player, skill) {
			// 记录真实轮数
			if (player.storage[skill + "_round"] === undefined) {
				player.storage[skill + "_round"] = game.roundNumber || 0;
			}
		},
		filter: function (event, player) {
			// 强制死亡
			if (player.storage.Hyades_xinsui_triggered) return false;


			var enterRound = Math.max(1, player.storage.Hyades_xinsui_round);


			return game.roundNumber > enterRound;
		},
		content: async function (event, trigger, player) {

			player.awakenSkill("Hyades_xinsui");
			player.storage.Hyades_xinsui_triggered = true;

			await player.reinitCharacter(player.name1, "Kanna");

			await game.delayx(3);

			await player.recover(1);

			await player.die();
		}
	},
};
export default skills;
