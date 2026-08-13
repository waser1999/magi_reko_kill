import { lib, game, ui, get, ai, _status } from "../../noname.js";

const cards = {
	"chenhuodajie": {
		fullskin: true,
		type: "trick",
		filterTarget: true,
		global: "g_chenhuodajie",
		content() {
			if (target.countCards("he")) {
				player.gainPlayerCard("he", target, true);
			}
		},
		ai: {
			order: 1,
			useful: 6,
			value: 6,
			result: {
				target: -1,
			},
			tag: {
				loseCard: 1,
			},
		},
		image: "ext:魔法纪录/card_image/chenhuodajie.png",
		selectTarget: 1,
	},

	"jk_unform": {
		type: "equip",
		subtype: "equip2",
		fullskin: true,
		skills: ["jk_unform_skill"],
		selectTarget: -1,
		manualConfirm: true,
		ai: {
			order: 9,
			equipValue(card, player) {
				if (get.position(card) == "e") {
					return -7;
				}
				return 2;
			},
			value(card, player) {
				if (player.getEquips(2).includes(card)) {
					return -8;
				}
				return 3;
			},
			basic: {
				equipValue: 5,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				keepAI: true,
				target(player, target) {
					var val = 2.5;
					var val2 = 0;
					var card = target.getEquip(1);
					if (card) {
						val2 = get.value(card, target);
						if (val2 < 0) {
							return 0;
						}
					}
					return -val - val2;
				},
			},
		},
		enable: true,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
			//if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
		},
		toself: true,
		image: "ext:魔法纪录/card_image/jk_uniform.png",
	},
	"maid_uniform": {
		fullskin: true,
		type: "equip",
		subtype: "equip2",
		filterTarget(card, player, target) {
			if (player == target) {
				return false;
			}
			return target.canEquip(card, true);
		},
		selectTarget: 1,
		toself: false,
		loseDelay: false,
		onEquip() {
			if (player.hasSkill("kanagi_nvpu")) return;
			if (
				player.countCards("he", function (cardx) {
					return card.cards && !card.cards.includes(cardx);
				})
			) {
				player
					.chooseToDiscard(
						true,
						function (card) {
							return !_status.event.card?.cards.includes(card);
						},
						"he"
					)
					.set("card", card);
			}
		},
		onLose() {
			if (player.hasSkill("kanagi_nvpu")) return;
			var next = game.createEvent("maid_uniform_lose");
			event.next.remove(next);
			var evt = event.getParent();
			if (evt.getlx === false) {
				evt = evt.getParent();
			}
			evt.after.push(next);
			next.player = player;
			next.setContent(function () {
				if (player.countCards("he")) {
					player.popup("maid_uniform");
					player.chooseToDiscard(true, "he");
				}
			});
		},
		ai: {
			order: 9.5,
			equipValue(card, player) {
				if (player.getEquips(2).includes(card)) {
					var num = player.countCards("he", function (cardx) {
						return cardx != card;
					});
					if (num == 0) {
						return 0;
					}
					return 4 / num;
				}
				return 1;
			},
			value() {
				return lib.card.maid_uniform.ai.equipValue.apply(this, arguments);
			},
			basic: {
				equipValue: 5,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				keepAI: true,
				target(player, target) {
					var card = target.getEquip(2);
					var val = 0;
					var val2 = 0;
					if (card) {
						val2 = get.value(card, target);
						if (val2 < 0) {
							return 0;
						}
					}
					var num = target.countCards("he", function (cardx) {
						return cardx != card;
					});
					if (num > 0) {
						val += 4 / num;
					}
					return -val;
				},
			},
		},
		image: "ext:魔法纪录/card_image/maid_uniform.png",
		enable: true,
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
			//if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
		},
	},
	"kuroe_kill": {
		fullskin: true,
		type: "equip",
		subtype: "equip1",
		distance: {
			attackFrom: -1,
		},
		ai: {
			basic: {
				equipValue: 2,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: (player, target, card) => get.equipResult(player, target, card),
			},
		},
		skills: ["kuroe_kill_skill"],
		image: "ext:魔法纪录/card_image/kuroe_kill.png",
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
			//if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
		},
		toself: true,
	},
	yongzhuang: {
		audio: "ext:魔法纪录",
		fullskin: true,
		type: "equip",
		subtype: "equip2",
		skills: ["yongzhuang_skill"],
		image: "ext:魔法纪录/card_image/yongzhuang.png",
		ai: {
			basic: {
				equipValue: 6,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: (player, target, card) => get.equipResult(player, target, card),
			},
		},
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
			//if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
		},
		toself: true,
	},
	shuibojian: {
		fullskin: true,
		type: "equip",
		subtype: "equip1",
		distance: {
			attackFrom: -1,
		},
		skills: ["shuibojian_skill"],
		ai: {
			basic: {
				equipValue: 5,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: (player, target, card) => get.equipResult(player, target, card),
			},
		},
		loseDelay: false,
		onLose() {
			player.recover();
		},
		image: "ext:魔法纪录/card_image/shuibojian.png",
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
			//if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
		},
		toself: true,
	},
	mengshenjueqiang: {
		fullskin: true,
		type: "equip",
		subtype: "equip1",
		distance: {
			attackFrom: -2,
		},
		skills: ["mengshenjueqiang_skill"],
		ai: {
			basic: {
				equipValue: 4,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: (player, target, card) => get.equipResult(player, target, card),
			},
		},
		image: "ext:魔法纪录/card_image/mengshenjueqiang.png",
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
			//if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
		},
		toself: true,
	},
	"test_tube": {
		fullskin: true,
		type: "equip",
		subtype: "equip1",
		distance: { attackFrom: -1 },
		ai: {
			basic: {
				equipValue: 2,
			},
		},
		skills: ["test_tube_skill"],
		image: "ext:魔法纪录/card_image/test_tube.png",
	},
	"special_week": {
		fullskin: true,
		type: "equip",
		subtype: "equip4",
		distance: { globalFrom: -1 },
		image: "ext:魔法纪录/card_image/special_week.png",
	},
	"SaintessArmor": {
		audio: "ext:魔法纪录",
		fullskin: true,
		type: "equip",
		subtype: "equip2",
		skills: ["SaintessArmor_skill"],
		image: "ext:魔法纪录/card_image/SaintessArmor.png",
		ai: {
			basic: {
				equipValue: 9,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 4,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: (player, target, card) => get.equipResult(player, target, card),
			},
		},
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
		},
		toself: true,
	},
	"AncientSword": {
		derivation: "dArc",
		vanish: true,
		type: "equip",
		subtype: "equip1",
		skills: ["AncientSword_skill1", "AncientSword_skill2", "dArc_exclusive_degrade"],
		distance: {
			attackFrom: 0,
		},
		enable: true,
		fullskin: true,
		image: "ext:魔法纪录/card_image/AncientSword.png",
		ai: {
			equipValue: function (card, player) {
				const isdArc = ["dArc"].some(n => player.name == n || player.name1 == n || player.name2 == n);
				if (isdArc) return 6; // 贞德装备视为高价值
				return -5; // 其他人视为低价值
			},
			basic: {
				equipValue: function (card, player) {
					const isdArc = ["dArc"].some(n => player.name == n || player.name1 == n || player.name2 == n);
					if (isdArc) return 6;
					return -5;
				},
				order: 9,
				useful: 6,
				value: 6,
			},
			result: {
				keepAI: true,
				target: function (player, target, card) {
					const isdArc = ["dArc"].some(n => target.name == n || target.name1 == n || target.name2 == n);
					if (isdArc) return 5;
					return -5;
				},
			},
		},
		onLose: function () {
			if (player.getStat().skill.xinge) {
				delete player.getStat().skill.xinge;
			}
		},
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return player == target && target.canEquip(card, true);
		},
		modTarget: true,
		allowMultiple: false,
		content: async function (event) {
			const { card, target } = event;
			if (!card?.cards.some((card2) => get.position(card2, true) !== "o")) {
				await target.equip(card);
			}
		},
		toself: true,
	},
	"QuubeyFlag": {
		fullskin: true,
		type: "equip",
		subtype: "equip4",
		skills: ["QuubeyFlag_skill", "QuubeyFlag_skill2", "dArc_exclusive_degrade"],
		distance: {
			attackFrom: -1,
		},
		image: "ext:魔法纪录/card_image/QuubeyFlag.png",
		ai: {
			equipValue: function (card, player) {
				const isdArc = ["dArc", "Final_dArc"].some(n => player.name == n || player.name1 == n || player.name2 == n);
				if (isdArc) return 6; // 贞德视为高价值
				return 3; // 其他人视为一般
			},
			basic: {
				equipValue: function (card, player) {
					const isdArc = ["dArc", "Final_dArc"].some(n => player.name == n || player.name1 == n || player.name2 == n);
					if (isdArc) return 6;
					return 3;
				},
				order: 9,
				useful: 4,
				value: 4,
			},
			result: {
				keepAI: true,
				target: function (player, target, card) {
					const isdArc = ["dArc", "Final_dArc"].some(n => target.name == n || target.name1 == n || target.name2 == n);
					// 如果目标是贞德，送给她觉醒
					if (isdArc) return 5;
					// 如果是普通队友，正向支援
					return 1.5;
				},
			},
		},
		onLose: function () {
			if (player.getStat().skill.xinge) {
				delete player.getStat().skill.xinge;
			}
		},
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return player == target && target.canEquip(card, true);
		},
		modTarget: true,
		allowMultiple: false,
		content: async function (event) {
			const { card, target } = event;
			if (!card?.cards.some((card2) => get.position(card2, true) !== "o")) {
				await target.equip(card);
			}
		},
		toself: true,
	},
	// 贞德专属
	"ClovisSword": {
		derivation: "dArc",
		vanish: true,
		type: "equip",
		subtype: "equip1",
		skills: ["ClovisSword_skill", "dArc_exclusive_degrade"],
		distance: {
			attackFrom: -1,
		},
		enable: true,
		fullskin: true,
		image: "ext:魔法纪录/card_image/ClovisSword.png",
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		ai: {
			equipValue: function (card, player) {
				var isdArc = ["dArc", "Final_dArc"].some(function (n) { return player.name === n || player.name1 === n || player.name2 === n; });
				return isdArc ? 15 : 1; // 贞德高价值，其他人低价值
			},
			basic: {
				equipValue: 15,
				order: 10,
				useful: 10,
				value: 10,
			},
			result: {
				keepAI: true,
				target: function (player, target) {
					var isdArc = ["dArc", "Final_dArc"].some(function (n) { return target.name === n || target.name1 === n || target.name2 === n; });
					return isdArc ? 1 : 0.1;
				}
			}
		},
		content: function () {
			if (!card?.cards.some(card => { return get.position(card, true) !== "o"; })) {
				target.equip(card);
			}
		},
		toself: true,
	},
	"LightLance": {
		fullskin: true,
		type: "equip",
		subtype: "equip4",
		skills: ["LightLance_skill", "dArc_exclusive_degrade"],
		distance: { globalFrom: -2 },
		image: "ext:魔法纪录/card_image/LightLance.png",
		ai: {
			equipValue: function (card, player) {
				var isdArc = ["dArc", "Final_dArc"].some(function (n) { return player.name === n || player.name1 === n || player.name2 === n; });
				return isdArc ? 15 : 1; // 贞德高价值，其他人低价值
			},
			basic: {
				equipValue: 15,
				order: 10,
				useful: 10,
				value: 10,
			},
			result: {
				keepAI: true,
				target: function (player, target) {
					var isdArc = ["dArc", "Final_dArc"].some(function (n) { return target.name === n || target.name1 === n || target.name2 === n; });
					return isdArc ? 1 : 0.1;
				}
			}
		}
	},

	"LightSword": {
		derivation: "Final_dArc",
		vanish: true,
		type: "equip",
		subtype: "equip1",
		skills: ["LightSword_skill", "equipment_equip"],
		distance: {
			attackFrom: -9,
		},
		enable: true,
		fullskin: true,
		image: "ext:魔法纪录/card_image/LightSword.png",
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
		},
		toself: true,
		onLose: async function (event, trigger, player) {
			if (event.cards && event.cards.length > 0) {
				setTimeout(async function () {
					// 销毁
					var loseCard = event.cards.find(function (q) { return q.name === "LightSword"; });
					if (loseCard) {
						var npc = get.owner(loseCard);
						if (npc) {
							await npc.lose(loseCard).set('_triggered', null);
						}
						loseCard.selfDestroy();
					}
				}, 600);
			}
		}
	},
	"ShadowGauntlets": {
		derivation: "Final_dArc",
		audio: true,
		fullskin: true,
		type: "equip",
		subtype: "equip5",
		skills: ["ShadowGauntlets_skill1", "ShadowGauntlets_skill2", "equipment_equip"],
		image: "ext:魔法纪录/card_image/ShadowGauntlets.png",
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
		},
		toself: true,
		onLose: async function (event, trigger, player) {
			if (event.cards && event.cards.length > 0) {
				setTimeout(async function () {
					// 销毁
					var loseCard = event.cards.find(function (q) { return q.name === "ShadowGauntlets"; });
					if (loseCard) {
						var npc = get.owner(loseCard);
						if (npc) {
							await npc.lose(loseCard).set('_triggered', null);
						}
						loseCard.selfDestroy();
					}
				}, 600);
			}
		}
	},
	"DragonsFire": {
		derivation: "Elisa",
		vanish: true,
		type: "equip",
		subtype: "equip1",
		skills: ["DargonsFire_skill"],
		distance: {
			attackFrom: -6,
		},
		enable: true,
		fullskin: true,
		image: "ext:魔法纪录/card_image/DragonsFire.png",
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
		},
		toself: true,
		onLose: async function (event, trigger, player) {
			if (event.cards && event.cards.length > 0) {
				setTimeout(async function () {
					// 销毁
					var loseCard = event.cards.find(function (q) { return q.name === "DargonsFire"; });
					if (loseCard) {
						var npc = get.owner(loseCard);
						if (npc) {
							await npc.lose(loseCard).set('_triggered', null);
						}
						loseCard.selfDestroy();
					}
				}, 600);
			}
		},
		ai: {
			equipValue: 9
		}
	},
	"CrowMask": {
		type: "equip",
		subtype: "equip5",
		skills: ["CrowMask_skill"， "equipment_equip5"],
		image: "ext:魔法纪录/card_image/CrowMask.png",
		ai: { basic: { equipValue: 16 } },
		onLose: async function (event, trigger, player) {
			if (event.cards && event.cards.length > 0) {
				setTimeout(async function () {
					var loseCard = event.cards.find(function(q) { return q.name === "CrowMask"; });
					if (loseCard) {
						var npc = get.owner(loseCard);
						if (npc) await npc.lose(loseCard).set('_triggered', null);
						loseCard.selfDestroy();
					}
				}, 600);
			}
		}
	},
	"CatMask": {
		type: "equip",
		subtype: "equip5",
		skills: ["CatMask_skill", "equipment_equip5"],
		image: "ext:魔法纪录/card_image/CatMask.png",
		ai: { basic: { equipValue: 16 } },
		onLose: async function (event, trigger, player) {
			if (event.cards && event.cards.length > 0) {
				setTimeout(async function () {
					var loseCard = event.cards.find(function(q) { return q.name === "CatMask"; });
					if (loseCard) {
						var npc = get.owner(loseCard);
						if (npc) await npc.lose(loseCard).set('_triggered', null);
						loseCard.selfDestroy();
					}
				}, 600);
			}
		}
	},
	"RabbitMask": {
		type: "equip",
		subtype: "equip5",
		skills: ["RabbitMask_skill",  "equipment_equip5"],
		image: "ext:魔法纪录/card_image/RabbitMask.png",
		ai: { basic: { equipValue: 16 } },
		onLose: async function (event, trigger, player) {
			if (event.cards && event.cards.length > 0) {
				setTimeout(async function () {
					var loseCard = event.cards.find(function(q) { return q.name === "RabbitMask"; });
					if (loseCard) {
						var npc = get.owner(loseCard);
						if (npc) await npc.lose(loseCard).set('_triggered', null);
						loseCard.selfDestroy();
					}
				}, 600);
			}
		}
	},
	"EnglandCrown": {
		type: "equip",
		subtype: "equip5",
		skills: ["EnglandCrown_skill",  "equipment_equip5"],
		image: "ext:魔法纪录/card_image/EnglandCrown.png",
		ai: { basic: { equipValue: 20 } },
		onLose: async function (event, trigger, player) {
			if (event.cards && event.cards.length > 0) {
				setTimeout(async function () {
					var loseCard = event.cards.find(function(q) { return q.name === "EnglandCrown"; });
					if (loseCard) {
						var npc = get.owner(loseCard);
						if (npc) await npc.lose(loseCard).set('_triggered', null);
						loseCard.selfDestroy();
					}
				}, 600);
			}
		}
	},

	"evilnut": {
		type: "equip",
		subtype: "equip5",
		fullskin: true,
		skills: ["evilnut_skill"],
		image: "ext:魔法纪录/card_image/evilnut.png",
		loseDelay: false,
		ai: {
			equipValue: function (card, player) {
				const isHyades = ["Pleiades_Niko", "Kanna", "Hyades", "Hyades_Minions"].some(n => player.name == n || player.name1 == n || player.name2 == n);
				if (isHyades) return 6; // 圣迦南/海亚蒂斯之晓/妮可
				return -5;
			},
			basic: {
				equipValue: function (card, player) {
					const isHyades = ["Kanna", "Hyades", "Pleiades Niko"].some(n => player.name == n || player.name1 == n || player.name2 == n);
					if (isHyades) return 6;
					return -5;
				},
				order: 9,
				useful: 6,
				value: 6,
			},
			result: {
				keepAI: true,
				target: function (player, target, card) {
					const isHyades = ["Kanna", "Hyades", "Pleiades Niko"].some(n => target.name == n || target.name1 == n || target.name2 == n);
					// 海亚蒂斯 
					if (isHyades) return 5;
					// 其他人 
					return -5;
				},
			},
		},
		onLose: function () {
			if (player.getStat().skill.xinge) {
				delete player.getStat().skill.xinge;
			}
		},
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return player == target && target.canEquip(card, true);
		},
		modTarget: true,
		allowMultiple: false,
		content: async function (event) {
			const { card, target } = event;
			if (!card?.cards.some((card2) => get.position(card2, true) !== "o")) {
				await target.equip(card);
			}
		},
		toself: true,
	},
	"griefseed": {
		type: "equip",
		subtype: "equip5",
		fullskin: true,
		skills: ["griefseed_skill"],
		image: "ext:魔法纪录/card_image/griefseed.png",
		loseDelay: false,
		ai: {
			equipValue: 8,
			basic: {
				equipValue: 8,
				order: function (card2, player) {
					const equipValue = get.equipValue(card2, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 6,
				value: function (card2, player, index, method) {
					if (!player.getCards("e").includes(card2) && !player.canEquip(card2, true)) {
						return 0.01;
					}
					const info2 = get.info(card2), current = player.getEquip(info2.subtype), value = current && card2 != current && get.value(current, player);
					let equipValue = info2.ai.equipValue || info2.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card2, player);
						}
						if (method == "raw2") {
							return equipValue(card2, player) - value;
						}
						return Math.max(0.1, equipValue(card2, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				keepAI: true,
				target: function (player, target, card2) {
					if (target.hp <= 1) return 20;
					if (target.hp <= 2) return 12;
					if (target.countCards("h") < target.maxHp - 1) return 8;
					if (target.hp < target.maxHp) return 6;
					return 3;
				},
			},
		},
		onLose: function () {
			if (player.getStat().skill.griefseed_skill_phase) {
				delete player.getStat().skill.griefseed_skill_phase;
			}
		},
		enable: true,
		selectTarget: -1,
		filterTarget: function (card2, player, target) {
			return player == target && target.canEquip(card2, true);
		},
		modTarget: true,
		allowMultiple: false,
		content: async function (event) {
			const { card, target } = event;
			if (!card?.cards.some((card2) => get.position(card2, true) !== "o")) {
				await target.equip(card);
			}
		},
		toself: true,
	},
	"qianweihuakai": {
		fullskin: true,
		type: "equip",
		subtype: "equip1",
		image: "ext:魔法纪录/card_image/qianweihuakai.png",
		distance: {
			attackFrom: -2,
		},
		ai: {
			basic: {
				equipValue: 4,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: (player, target, card) => get.equipResult(player, target, card),
			},
		},
		skills: ["qianweihuakai_aishi", "qianweihuakai_jiushi"],
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
			//if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
		},
	},
	// 朱贝
	"Juubey": {
		type: "equip",
		subtype: "equip5",
		skills: ["Juubey_zhuangbei", "Juubey_wangxing", "Juubey_zhuangbei", "Juubey_wangxing_2"],
		ai: {
			basic: {
				equipValue: 15,
				order: function (card, player) { return player && player.hasSkillTag("reverseEquip") ? 8.5 : 8; },
				useful: 4,
			}
		},
		enable: true,
		fullskin: true,
		image: "ext:魔法纪录/card_image/Pleiades_Juubey.png",
		toself: true,
	},
	"fengzhichuandaoshi_zhiyao": {
		fullskin: true,
		type: "equip",
		subtype: "equip5",
		image: "ext:魔法纪录/card_image/Alu.png",
		skills: ["fengzhichuandaoshi_zhiyao_skill"],
		ai: {
			basic: {
				equipValue: -4,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: (player, target, card) => get.equipResult(player, target, card),
			},
		},
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
		},
		toself: true,
	},
}

export default cards;
