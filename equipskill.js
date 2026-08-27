import { lib, game, ui, get, ai, _status } from "../../noname.js";

const equipSkills = {
	// 公式化标签技能
	// 不可被弃置
	"equipment_equip":{
        mod: {
            canBeDiscarded: function(card) {
              if (get.position(card) == "e" && get.type(card) == "equip") {
                return false;
              }
            },
            cardDiscardable: function(card) {
              if (get.position(card) == "e" && get.type(card) == "equip") {
                return false;
              }
            },
        },
    },

    "equipment_equip1": {
        mod: {
            canBeDiscarded: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip1") {
                    return false;
                }
            },
            cardDiscardable: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip1") {
                    return false;
                }
            },
        },
    },
    "equipment_equip2": {
        mod: {
            canBeDiscarded: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip2") {
                    return false;
                }
            },
            cardDiscardable: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip2") {
                    return false;
                }
            },
        },
    },
    "equipment_equip3": {
        mod: {
            canBeDiscarded: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip3") {
                    return false;
                }
            },
            cardDiscardable: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip3") {
                    return false;
                }
            },
        },
    },
    "equipment_equip4": {
        mod: {
            canBeDiscarded: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip4") {
                    return false;
                }
            },
            cardDiscardable: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip4") {
                    return false;
                }
            },
        },
    },
    "equipment_equip5": {
        mod: {
            canBeDiscarded: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip5") {
                    return false;
                }
            },
            cardDiscardable: function(card) {
                if (get.position(card) == "e" && get.subtype(card) == "equip5") {
                    return false;
                }
            },
        },
    },
	
    "g_chenhuodajie": {
        trigger: { global: "damageEnd" },
        filter(event, player) {
            if (event.player === player) {
                return false;
            }
            if (!event.player.countCards("he")) {
                return false;
            }
            if (!lib.filter.targetEnabled({ name: "chenhuodajie" }, player, event.player)) {
                return false;
            }
            if (event._notrigger.includes(event.player)) {
                return false;
            }
            return player.hasUsableCard("chenhuodajie");
        },
        direct: true,
        async content(event, trigger, player) {
            await player
                .chooseToUse(
                    get.prompt("chenhuodajie", trigger.player).replace(/发动/, "使用"),
                    function (card, player) {
                        if (get.name(card) !== "chenhuodajie") {
                            return false;
                        }
                        return lib.filter.cardEnabled(card, player, "forceEnable");
                    },
                    -1
                )
                .set("sourcex", trigger.player)
                .set("filterTarget", function (card, player, target) {
                    if (target !== _status.event.sourcex) {
                        return false;
                    }
                    return lib.filter.targetEnabled.apply(this, arguments);
                })
                .set("targetRequired", true);
        },
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
            if (trigger.player.group == player.group) {
                player.equip(game.createCard("griefseed", "heart", 1));
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
	"AncientSword_skill1": {
		equipSkill: true,
		trigger: {
			player: "useCardToPlayered"
		},
		forced: true,
		logTarget: "target",
		filter: function (event, player) {
			return event.target !== player && event.card && event.card.name === "sha";
		},
		content: async function (event, trigger, player) {
			let result = await player.judge(function() {
				return 0;
			}).forResult();
			
			if (!trigger.target.hasSkill("fengyin")) {
				trigger.target.addTempSkill("fengyin");
			}
			
			const suit = result.suit;
			const target = trigger.target;
			const num = target.countCards("h", "shan");
			
			result = await target.chooseToDiscard("请弃置一张" + get.translation(suit) + "牌，否则不能响应此牌", "he", function(card) {
				return get.suit(card) === _status.event.suit;
			}).set("ai", function(card) {
				var num2 = _status.event.num;
				if (num2 === 0) return 0; 
				if (card.name === "shan") return num2 > 1 ? 2 : 0; 
				return 1 - get.value(card); 
			}).set("num", num).set("suit", suit).forResult();
			
			if (!result.bool) {
				trigger.getParent().directHit.add(trigger.target);
			}
		},
		group: ["AncientSword_skill1_damage"]
	},
	"AncientSword_skill1_damage": {
		equipSkill: true,
		trigger: {
			source: "damageBegin1"
		},
		forced: true,
		filter: function (event, player) {
			return event.card && event.card.name === "sha" && !event.card.nature;
		},
		content: function (event, trigger, player) {
			game.log("因", "#g【古代锈剑】", "的锋芒减退，造成的伤害", "#y-1", "。");
			
			trigger.num -= 1;
			if (trigger.num <= 0) {
			}
		}
	},
	"AncientSword_skill2": {
		equipSkill: true,
		trigger: {
			player: ["equipAfter", "phaseZhunbeiBegin"]
		},
		forced: true,
		filter: function (event, player) {
			var isdArc = ["dArc", "Final_dArc"].some(function (n) {
				return player.name === n || player.name1 === n || player.name2 === n;
			});
			if (!isdArc) return false;
			
			var weapon = player.getEquip("equip1");
			return weapon && weapon.name === "AncientSword";
		},
		content: async function (event, trigger, player) {
			var oldSword = player.getEquip("equip1");
			
			if (oldSword && oldSword.name === "AncientSword") {
				await player.lose(oldSword, ui.discardPile, "visible");
				
				var newSword = game.createCard({
					name: "ClovisSword",
					suit: oldSword.suit || "diamond",
					number: oldSword.number || 2
				});
				
				await player.equip(newSword);
				
				player.$fullscreenpop("圣剑复苏", "gold");
				game.log(player, "的", oldSword, "洗尽铅华，化为了", newSword);


				// 附加功能：觉醒后印基本牌
				var chooseAction = await player.chooseControl('sha', 'tao', 'jiu')
					.set('prompt', '圣剑复苏：你可以视为对攻击范围内一名角色使用一张基本牌')
					.set('cancelDialog', true)
					.set('ai', function() {
						var p = _status.event.player;
						// AI 优化：有残血队友或者自己不满血，优先桃；有敌人在攻击范围内，就出杀；否则喝酒
						if (game.hasPlayer(function(current){ return get.attitude(p, current) > 0 && current.hp <= 2; })) return 'tao';
						if (game.hasPlayer(function(current){ return get.attitude(p, current) < 0 && p.inRange(current); })) return 'sha';
						if (p.hp < p.maxHp) return 'tao';
						return 'jiu';
					}).forResult();

				if (chooseAction.control) {
					var cardName = chooseAction.control;
					var chooseTarget = await player.chooseTarget(1, function (card, p, target) { 
						return p.inRange(target) || target === p; 
					})
					.set('cardN', cardName)
					.set('ai', function(target) {
						var p = _status.event.player;
						var cName = _status.event.cardN;
						if (cName === 'tao') return get.attitude(p, target) > 0 ? (10 - target.hp) : 0;
						if (cName === 'sha') return get.attitude(p, target) < 0 ? (10 - target.hp) : 0;
						if (cName === 'jiu') return target === p ? 1 : 0;
						return 0;
					}).forResult();

					if (chooseTarget.bool && chooseTarget.targets.length > 0) {
						var target = chooseTarget.targets[0];
						player.line(target, "green");
						var vcard = game.createCard(cardName);
						await player.useCard(vcard, target, false);
					}
				}
			}
		}
	},

	"dArc_exclusive_degrade": {
		equipSkill: true,
		trigger: {
			player: ["equipAfter", "phaseZhunbeiBegin"]
		},
		forced: true,
		filter: function (event, player) {
			// 1. 判断是不是贞德（塔鲁特）
			var isdArc = ["dArc", "Final_dArc"].some(function (n) {
				return player.name === n || player.name1 === n || player.name2 === n;
			});
			// 如果是贞德，就不触发退化
			if (isdArc) return false;
			
			// 2. 如果不是贞德，检查身上是不是正穿着这两件神器
			return player.hasCard(function(c){ return c.name === "ClovisSword" || c.name === "LightLance"; }, "e");
		},
		content: async function (event, trigger, player) {
			var cards = player.getCards("e", function(card) {
				return card.name === "ClovisSword" || card.name === "LightLance";
			});
			
			for (var i = 0; i < cards.length; i++) {
				var oldEquip = cards[i];
				// 退化
				var newName = oldEquip.name === "ClovisSword" ? "AncientSword" : "QuubeyFlag";
				
				await player.lose(oldEquip, ui.discardPile, "visible");
				
				var newEquip = game.createCard(newName, oldEquip.suit, oldEquip.number);
				await player.equip(newEquip);
				
				// 提示
				game.log(player, "无法驾驭圣物，", oldEquip, "黯然失色，化为了", newEquip);
			}
		}
	},

	"QuubeyFlag_skill": {
		equipSkill: true,
		mod: {
			maxHandcard: function (player, num) {
				return num + 1;
			}
		}
	},

	"QuubeyFlag_skill2": {
		equipSkill: true,
		trigger: {
			player: ["equipAfter", "phaseZhunbeiBegin"]
		},
		forced: true,
		filter: function (event, player) {
			var isdArc = ["dArc", "Final_dArc"].some(function (n) {
				return player.name === n || player.name1 === n || player.name2 === n;
			});
			if (!isdArc) return false;
			
			var flag = player.getEquip("equip4");
			return flag && flag.name === "QuubeyFlag";
		},
		content: async function (event, trigger, player) {
			var oldFlag = player.getEquip("equip4");
			
			if (oldFlag && oldFlag.name === "QuubeyFlag") {
				await player.lose(oldFlag, ui.discardPile, "visible");
				
				var newLance = game.createCard({
					name: "LightLance",
					suit: oldFlag.suit || "diamond",
					number: oldFlag.number || 2
				});
				
				await player.equip(newLance);
				
				player.$fullscreenpop("圣枪复苏", "gold");
				game.log(player, "的", oldFlag, "洗尽铅华，化为了", newLance);


				// 武器觉醒后印基本牌
				var chooseAction = await player.chooseControl('sha', 'tao', 'jiu')
					.set('prompt', '圣枪复苏：你可以视为对攻击范围内一名角色使用一张基本牌')
					.set('cancelDialog', true)
					.set('ai', function() {
						var p = _status.event.player;
						if (game.hasPlayer(function(current){ return get.attitude(p, current) > 0 && current.hp <= 2; })) return 'tao';
						if (game.hasPlayer(function(current){ return get.attitude(p, current) < 0 && p.inRange(current); })) return 'sha';
						if (p.hp < p.maxHp) return 'tao';
						return 'jiu';
					}).forResult();

				if (chooseAction.control) {
					var cardName = chooseAction.control;
					var chooseTarget = await player.chooseTarget(1, function (card, p, target) { 
						return p.inRange(target) || target === p; 
					})
					.set('cardN', cardName)
					.set('ai', function(target) {
						var p = _status.event.player;
						var cName = _status.event.cardN;
						if (cName === 'tao') return get.attitude(p, target) > 0 ? (10 - target.hp) : 0;
						if (cName === 'sha') return get.attitude(p, target) < 0 ? (10 - target.hp) : 0;
						if (cName === 'jiu') return target === p ? 1 : 0;
						return 0;
					}).forResult();

					if (chooseTarget.bool && chooseTarget.targets.length > 0) {
						var target = chooseTarget.targets[0];
						player.line(target, "green");
						var vcard = game.createCard(cardName);
						await player.useCard(vcard, target, false);
					}
				}
			}
		}
	},
	"SaintessArmor_skill": {
		equipSkill: true,
		trigger: {
			target: "useCardToTarget" 
		},
		usable: 1, 
		filter: function (event, player) {
			if (!event.targets || event.targets.length !== 1 || event.targets[0] !== player) {
				return false;
			}
			var count = player.storage.SaintessArmor_round_count || 0;
			var x = Math.max(1, count);
			return player.countCards("he") >= x;
		},
		check: function (event, player) {
			return get.effect(player, event.card, event.player, player) < 0;
		},
		content: async function (event, trigger, player) {
			var count = player.storage.SaintessArmor_round_count || 0;
			var x = Math.max(1, count);

			var isBadCard = get.effect(player, trigger.card, trigger.player, player) < 0;
			var promptStr = "是否弃置 " + x + " 张牌，发动【圣女胸甲】令【" + get.translation(trigger.card) + "】对你无效？";

			var result = await player.chooseToDiscard("he", x, promptStr).set("ai", function (card) {
				if (!_status.event.isBadCard) return 0;
				return 8 - get.value(card);
			}).set("isBadCard", isBadCard).forResult();

			if (result.bool) {
				await player.discard(result.cards);
				player.storage.SaintessArmor_round_count = count + 1;
				game.log(player, "发动了", "#g【圣女胸甲】", "，令", trigger.card, "对其无效");
				trigger.excluded.add(player); 
			}
		},
		group: ["SaintessArmor_skill_roundReset"]
	},
	"SaintessArmor_skill_roundReset": {
		equipSkill: true,
		trigger: { global: "roundStart" },
		forced: true,
		silent: true,
		filter: function (event, player) { 
			return player.storage.SaintessArmor_round_count !== undefined; 
		},
		content: function (event, trigger, player) { 
			delete player.storage.SaintessArmor_round_count; 
		}
	},
    // 贞德专属
	"ClovisSword_skill": {
		trigger: { 
		    player: "useCardToPlayered" 
		}, 
		forced: true,
		logTarget: "target",
		equipSkill: true,
		priority: 11,
		filter: function (event, player) {
			return event.target != player;
		},
		content: async function (event, trigger, player) {
			trigger.target.addTempSkill("qinggang2");
			if (typeof trigger.target.storage.qinggang2 === "undefined") {
				trigger.target.storage.qinggang2 = [];
			}
			trigger.target.storage.qinggang2.add(trigger.card);
			trigger.target.markSkill("qinggang2");

			if (trigger.card && trigger.card.name == "sha") {
				let result = await player.judge(function() {
					return 0;
				}).forResult();
				
				if (!trigger.target.hasSkill("fengyin")) {
					trigger.target.addTempSkill("fengyin");
				}
				
				const suit = result.suit;
				const target = trigger.target;
				const num = target.countCards("h", "shan");
				
				result = await target.chooseToDiscard("请弃置一张" + get.translation(suit) + "牌，否则不能响应此牌", "he", function(card) {
					return get.suit(card) == _status.event.suit;
				}).set("ai", function(card) {
					var num2 = _status.event.num;
					if (num2 == 0) return 0;
					if (card.name == "shan") return num2 > 1 ? 2 : 0;
					return 8 - get.value(card);
				}).set("num", num).set("suit", suit).forResult();
				
				if (!result.bool) {
					trigger.getParent().directHit.add(trigger.target);
				}
			}
		}
	},

	"LightLance_skill": {
		equipSkill: true,
		mod: {
			globalFrom: function (from, to, distance) {
				return distance - 2;
			}
		},
		trigger: { source: "damageEnd" },
		direct: true,
		filter: function (event, player) {
			return event.card && get.type(event.card) === "basic";
		},
		content: async function (event, trigger, player) {
			var chooseTarget = await player.chooseTarget(
				"光之旗枪：是否令一名与你距离为 1 以内的角色摸两张牌或弃置两张牌？",
				1,
				function (card, player, target) {
					return get.distance(player, target) <= 1;
				}
			)

			.set("ai", function (target) {
				var evtPlayer = _status.event.player;
				var att = get.attitude(evtPlayer, target);

				if (att > 0) {
					// ai选择
					// 1. 救命保人
					if (target.hp <= 1 && target.countCards("h") <= 2) return 15;
					
					// 2. 自身爆发
					if (target === evtPlayer && _status.currentPhase === evtPlayer && evtPlayer.countCards("h") <= 3) return 12;
					
					// 3. 正常补给
					if (target.hp <= 2 || target.countCards("h") < target.hp) return 10;
					
					// 4. 锦上添花
					if (target === evtPlayer) return 9;
					return 8;
					
				} else {

					var heCount = target.countCards("he"); 
					
					// 0. 防呆
					if (heCount === 0) return 0; 
					
					// 1. 绝杀
					if (target.hp === 1) return 14;
					
					// 2. 破防
					if (heCount === 2 || target.getCards("e").length >= 2) return 11;
					
					// 3. 常规
					return 7;
				}
			}).forResult();

			if (chooseTarget.bool && chooseTarget.targets && chooseTarget.targets.length > 0) {
				var target = chooseTarget.targets[0];
				player.logSkill("LightLance_skill", target);
				
				var chooseAction = await player.chooseControl("摸两张牌", "弃置两张牌")
					.set("prompt", "请为【" + get.translation(target) + "】选择一项：")
	
	
					.set("ai", function () {
						var evtPlayer = _status.event.player;
						var evtTarget = _status.event.target;

						return get.attitude(evtPlayer, evtTarget) > 0 ? "摸两张牌" : "弃置两张牌";
					})
					.set("target", target)
					.forResult();

				if (chooseAction.control === "摸两张牌") {
					await target.draw(2);
				} else {
					await target.chooseToDiscard("he", 2, true);
				}
			}
		}
	},
	"LightSword_skill": {
		persevereSkill: true,
		trigger: { 
			player: "useCardAfter" 
		},
		forced: true,
		group: [
			"LightSword_skill_keep" 
		],
		content: function (event, trigger, player) {
			var others = game.filterPlayer(function (current) { return current != player; });
			for (var i = 0; i < others.length; i++) {
				// 使其武将牌技能失效直至回合结束
				others[i].addTempSkill("baiban", "phaseAfter");
				// 防具失效，并且禁止响应/使用牌
				others[i].addTempSkill("LightSword_debuff", "phaseAfter");
			}
		},
		subSkill: {
			keep: {
				trigger: {
					player: "loseBefore"
				},
				forced: true,
				filter: function (event, player) {
					if (event.parent.name === "useCard") {
						return false;
					}
					return event.cards && event.cards.some(function(q) { 
						return q.name === "LightSword"; 
					});
				},
				content: async function (event, trigger, player) {
					trigger.cards = trigger.cards.filter(function(q) { 
						return q.name !== "LightSword"; 
					});
				}
			}
		}
	},
	"LightSword_debuff": {
		charlotte: true,
		mark: true,
		marktext: "封",
		intro: {
			content: "防具失效，且不能使用或打出牌",
		},
		mod: {
			cardEnabled2: function (card, player) {
				return false;
			},
			cardRespondable2: function (player, card) {
				return false;
			},
			cardSavable2: function (card, player) {
				return false;
			}
		},
		ai: {
			unequip2: true, 
		}
	},
	"LightSword_silence": {
		charlotte: true, 
		mark: true,
		mod: {
			cardEnabled2: function () { 
				return false; 
			},
			cardRespondable2: function () { 
				return false; 
			},
		}
	},
	"ShadowGauntlets_skill1": {
		persevereSkill: true,
		trigger: {
			player: "useCard"
		},
		forced: true, 
		group: [
			"ShadowGauntlets_skill1_keep" 
		],
		filter: function (event, player) {
			return event.card && event.card.isCard && !event.card.isVirtual && event.targets && event.targets.length > 0;
		},
		content: async function (event, trigger, player) {
			if (trigger.card.name === "tiesuo") {
				var result = await player.chooseBool("是否令【铁索连环】额外结算一次？").forResult();
				if (result.bool) {
					trigger.effectCount++;
				}
			} 
			else {
				trigger.effectCount++;
			}
		},
		subSkill: {
			keep: {
				trigger: {
					player: "loseBefore"
				},
				forced: true,
				filter: function (event, player) {
					if (event.parent.name === "useCard") {
						return false;
					}
					return event.cards && event.cards.some(function(q) { 
						return q.name === "ShadowGauntlets"; 
					});
				},
				content: async function (event, trigger, player) {
					trigger.cards = trigger.cards.filter(function(q) { 
						return q.name !== "ShadowGauntlets"; 
					});
				}
			}
		}
	},
	"ShadowGauntlets_skill2": {
		persevereSkill: true,
		trigger: { source: "damageBegin1" },
		forced: true,
		priority: -10, 
		content: function (event, trigger, player) { 
			trigger.num *= 2; 
		}
	},
	//询问触发版手甲
		//"ShadowGauntlets_skill1": {
		//persevereSkill: true,
		//trigger: {
			//player: "useCard"
		//},
		//prompt2: "是否令此牌额外结算一次？", 
		//filter: function (event, player) {
			//return event.card && event.card.isCard && !event.card.isVirtual && event.targets && event.targets.length > 0;
		//},
		//content: function (event, trigger, player) {
			//trigger.effectCount++;
		//}
	//},

	"DragonsFire_skill": {
		equipSkill: true,
		trigger: { source: "damageEnd" },
		direct: true,
		filter: function (event, player) {
			return event.nature === "fire" && player.countCards("he") > 0;
		},
		content: async function (event, trigger, player) {
			var next = player.chooseTarget("龙之雷火：是否弃置1张牌，对另一名角色造成 1 点雷电伤害？", [0, 1], function(card, p, target) {

				return target !== trigger.player; 
			}).set("ai", function(target) {
				return get.damageEffect(target, _status.event.player, _status.event.player, "thunder");
			});

			var res = await next.forResult();
			if (res.bool && res.targets && res.targets.length > 0) {
				var target = res.targets[0];
				
				var discardRes = await player.chooseToDiscard("he", 1, true).set("prompt", "请弃置1张牌引发雷电连锁");
				if (discardRes.bool) {
					player.logSkill("DragonsFire_skill", target);
					player.line(target, "thunder");
					await target.damage(1, "thunder", player);
				}
			}
		}
	},
	"DragonsFire_destroy_global": {
		trigger: { global: ["loseAfter", "equipAfter"] },
		forced: true, silent: true, charlotte: true,
		filter: function (event, player) {
			if (!event.cards) return false;
			return event.cards.some(function(c) { return c.name === "DragonsFire" && get.position(c, true) !== "e"; });
		},
		content: async function (event, trigger, player) {
			var cards = trigger.cards.filter(function(c) { return c.name === "DragonsFire" && get.position(c, true) !== "e"; });
			if (cards.length > 0) {
				await game.cardsGotoSpecial(cards);
				game.log(cards, "化作了灰烬，被彻底销毁了！");
			}
		}
	},
	"CrowMask_skill": {
		equipSkill: true,
		mod: {
			maxHandcard: function(player, num) { return num + 2; },
			canBeDiscarded: function(card) { if (card.name === 'CrowMask') return false; },
			cardDiscardable: function(card) { if (card.name === 'CrowMask') return false; },
			targetEnabled: function(card, player, target) {
				if (player !== target && get.type(card) === 'equip') {
					var currentEquip = target.getEquip(get.subtype(card));
					if (currentEquip && ['RabbitMask', 'CrowMask', 'CatMask', 'EnglandCrown'].includes(currentEquip.name)) return false;
				}
			}
		},
		trigger: { global: "loseHpAfter" },
		forced: true,
		filter: function(event, player) {
			return event.Corbeau_source === player;
		},
		content: function(event, trigger, player) {
			trigger.player.damage('unreal', trigger.num, player);
		}
	},
	"CatMask_skill": {
		equipSkill: true,
		group: ["CatMask_skill_tracker"],
		mod: {
			maxHandcard: function(player, num) { return num + 1; },
			canBeDiscarded: function(card) { if (card.name === 'CatMask') return false; },
			cardDiscardable: function(card) { if (card.name === 'CatMask') return false; },
			targetEnabled: function(card, player, target) {
				if (player !== target && get.type(card) === 'equip') {
					var currentEquip = target.getEquip(get.subtype(card));
					if (currentEquip && ['RabbitMask', 'CrowMask', 'CatMask', 'EnglandCrown'].includes(currentEquip.name)) return false;
				}
			}
		},
		trigger: { global: ["damageEnd", "loseHpEnd", "recoverEnd"] },
		forced: true,
		filter: function(event, player) {
			if (event.player === player) return false;
			var isSource = (event.source === player) || (event.Minuo_source === player) || (event.Corbeau_source === player);
			if (!isSource) return false;
			
			var useEvt = event.getParent('useCard');
			if (useEvt && useEvt.player === player && useEvt.CatMask_fromHand) {
				return false; 
			}
			return true;
		},
		content: async function(event, trigger, player) {
			var target = trigger.player;
			if (target.countCards("he") > 0) {
				var res = await player.choosePlayerCard(target, "he", 1, true, "猫之假面：获得其区域内一张牌").forResult();
				if (res.bool && res.links && res.links.length > 0) {
					await player.gain(res.links, target, "giveAuto");
					game.log(player, "发动了", "#g【猫之假面】", "，获得了", target, "的一张牌");
				}
			}
		},
		subSkill: {
			tracker: {
				trigger: { player: "useCard1" },
				forced: true, silent: true, charlotte: true,
				filter: function(event, player) {
					return event.cards && event.cards.length > 0;
				},
				content: function(event, trigger, player) {
					if (trigger.cards.some(c => get.position(c, true) === 'h' || c.original === 'h')) {
						trigger.CatMask_fromHand = true; 
					}
				}
			}
		}
	},
    "RabbitMask_skill": {
        equipSkill: true,
        mod: {
            maxHandcard: function(player, num) { return num + 3; },
            canBeDiscarded: function(card) { if (card.name === 'RabbitMask' && get.position(card) === 'e') return false; },
            cardDiscardable: function(card) { if (card.name === 'RabbitMask' && get.position(card) === 'e') return false; }
        },
        trigger: { target: "useCardToTargeted" },
        filter: function(event, player) {
            return event.player !== player && !player.hasSkill("RabbitMask_skill_round"); // 【修复命名】
        },
        cost: async function(event, trigger, player) {
            var res = await player.chooseBool("兔之假面：是否流失1点体力，于此牌结算后从弃牌堆使用一张【桃】？").set("ai", function() {
                var p = _status.event.player;
                return p.hp > 1 || p.hp <= 0;
            }).forResult();
            if (res.bool) {
                event.result = { bool: true };
            }
        },
        content: async function(event, trigger, player) {
            player.addSkill("RabbitMask_skill_round"); 
            await player.loseHp(1);
            player.addTempSkill("RabbitMask_skill_peach", "roundStart"); 
            
            player.storage.RabbitMask_peach_card = trigger.card; 
            game.log(player, "将于", trigger.card, "结算结束后从弃牌堆使用一张【桃】");
        },
        subSkill: {
            round: {
                charlotte: true,
                trigger: { global: "roundStart" },
                forced: true,
                silent: true,
                content: function(event, trigger, player) { player.removeSkill("RabbitMask_skill_round"); }
            },
            peach: {
                charlotte: true,
                trigger: { global: "useCardAfter" },
                forced: true,
                popup: false,
                filter: function(event, player) {
                    return event.card === player.storage.RabbitMask_peach_card;
                },
                content: async function(event, trigger, player) {
                    player.removeSkill("RabbitMask_skill_peach");
                    delete player.storage.RabbitMask_peach_card;
                    
                    var tao = Array.from(ui.discardPile.childNodes).find(card => card.name === "tao");
                    
                    if (tao) {
                        game.log(player, "发动", "#g【兔之假面】", "，从弃牌堆使用了", tao);
                        await player.useCard(tao, player);
                    } else {
                        game.log(player, "发动", "#g【兔之假面】", "，但弃牌堆中没有【桃】");
                    }
                }
            }
        }
    },

"EnglandCrown_skill": {
		equipSkill: true,
		mod: {
			maxHandcard: function(player, num) { return num + 4; }, 
			canBeDiscarded: function(card) { if (card.name === 'EnglandCrown' && get.position(card) === 'e') return false; },
			cardDiscardable: function(card) { if (card.name === 'EnglandCrown' && get.position(card) === 'e') return false; }
		},
		trigger: { player: ["gainAfter", "recoverAfter", "changeHujiaAfter", "insertPhaseAfter"] },
		forced: true,
		filter: function(event, player) {
			var x = 0;
			if (event.name === 'gain') x = (event.cards || []).length;
			else if (event.name === 'recover' || event.name === 'changeHujia') x = event.num;
			else if (event.name === 'insertPhase') x = 1;
			
			if (x <= 0) return false; 
			
			var source = event.source;
			if (!source) {
				var parent = event.getParent();
				while (parent && parent.name !== 'phase') {
					if (parent.player && parent.player !== player && parent.player.name) {
						source = parent.player;
						break;
					}
					if (parent.source && parent.source !== player && parent.source.name) {
						source = parent.source;
						break;
					}
					parent = parent.parent;
				}
			}
			return source && source !== player;
		},
		content: async function(event, trigger, player) {
			var x = 0;
			var logStr = "";
			
			if (trigger.name === 'gain') {
				x = trigger.cards.length;
				logStr = "获得了牌";
			} else if (trigger.name === 'recover') {
				x = trigger.num;
				logStr = "回复了体力";
			} else if (trigger.name === 'changeHujia') {
				x = trigger.num;
				logStr = "获得了护甲";
			} else if (trigger.name === 'insertPhase') {
				x = 1;
				logStr = "执行了额外阶段";
			}
			
			var busuanNum = x * 2;
			game.log(player, "因其他角色" + logStr + "，触发了", "#y【女王皇冠】");
			
			if (busuanNum > 0) {
				var cards = get.cards(busuanNum);
				var cards2 = [];
				await game.cardsGotoOrdering(cards);
				var res = await player.chooseToMove("女王皇冠：卜算" + busuanNum, true)
					.set("list", [["牌堆顶", cards], ["牌堆底", cards2]])
					.forResult();
					
				if (res && res.bool) {
					var top = res.moved[0];
					var bottom = res.moved[1];
					top.reverse(); 
					
					await game.cardsGotoPile(top.concat(bottom), ["top_cards", top], function (evt, card) {
						if (evt.top_cards.includes(card)) return ui.cardPile.firstChild;
						return null;
					});
					game.log(player, "进行了", "#y【卜算】" + busuanNum);
				}
			}
			
			if (ui.cardPile.childNodes.length > 0) {
				var bottomCard = ui.cardPile.lastChild;
				ui.cardPile.removeChild(bottomCard);
				bottomCard.fix(); 
				
				await player.showCards(bottomCard, get.translation(player) + "展示了牌堆底的 " + get.translation(bottomCard));
				game.log(player, "对牌堆底的", bottomCard, "进行了判定");
				
				var color = get.color(bottomCard);
				if (color === 'black') {
					game.log(player, "判定结果为", "#b黑色", "，将其置入了", "#g【蓄谋】");
					await player.addJudge({ name: "xumou_jsrg" }, [bottomCard]);
				} else {
					game.log(player, "判定结果为", "#r红色", "，置入弃牌堆");
					await game.cardsDiscard(bottomCard);
				}
			} else {
				game.log(player, "牌堆已空，无法进行底牌判定");
			}
		}
	},

    "griefseed_skill": {
        equipSkill: true,
        locked: true,
        limited: true,
        mod: {
            maxHandcard: function (player, num) {
                return num + 1;
            }
        },
        group: ["griefseed_skill_phase", "griefseed_skill_dying"],
        subSkill: {
            phase: {
                equipSkill: true,
                enable: "phaseUse",
                usable: 1,
                filter: function (event, player) {
                    return player.getEquip("griefseed");
                },
                content: function () {
                    "step 0";
                    player.recover();
                    "step 1";
                    var maxHand = player.maxHp;
                    var currentHand = player.countCards("h");
                    if (currentHand < maxHand) {
                        player.draw(maxHand - currentHand);
                    } else if (currentHand > maxHand) {
                        player.chooseToDiscard("h", true, currentHand - maxHand, "悲叹之种：请将手牌数调整至体力上限");
                    }
                    "step 2";
                    var card = player.getEquip("griefseed");
                    if (card) {
                        player.lose(card, "visible", ui.ordering);
                    }
                }
            },
            dying: {
                equipSkill: true,
                trigger: {
                    player: "dying"
                },
                filter: function (event, player) {
                    return player.getEquip("griefseed");
                },
                content: function () {
                    "step 0";
                    player.recover();
                    "step 1";
                    var maxHand = player.maxHp;
                    var currentHand = player.countCards("h");
                    if (currentHand < maxHand) {
                        player.draw(maxHand - currentHand);
                    } else if (currentHand > maxHand) {
                        player.chooseToDiscard("h", true, currentHand - maxHand, "悲叹之种：请将手牌数调整至体力上限");
                    }
                    "step 2";
                    var card = player.getEquip("griefseed");
                    if (card) {
                        player.lose(card, "visible", ui.ordering);
                    }
                }
            }
        }
    },
    "evilnut_skill": {
        equipSkill: true,
        locked: true,
        group: ["evilnut_skill_enter", "evilnut_skill_damage"],
        mod: {
            maxHandcard: function (player, num) {
                const isKanna = ["Kanna", "Hyades", "Pleiades_Niko"].some(n => player.name == n || player.name1 == n || player.name2 == n);
                if (isKanna) return num + 1;
                return num - 1;
            }
        },
        subSkill: {
            enter: {
                equipSkill: true,
                trigger: {
                    player: "equipAfter"
                },
                forced: true,
                filter: function (event, player) {
                    return event.card && event.card.name == "evilnut";
                },
                content: async function (event, trigger, player) {
                    const isKanna = ["Kanna", "Hyades", "Pleiades_Niko"].some(n => player.name == n || player.name1 == n || player.name2 == n);
                    const isGift = trigger.giver && trigger.giver != player;

                    if (isKanna) {
                        await player.draw();
                        return;
                    }
                    const canDiscard = (card) => card.name != "evilnut";

                    if (isGift) {
                        const cards = player.getCards("he", (card) => !trigger.cards.includes(card) && canDiscard(card));
                        if (cards.length > 0) {
                            const randomCard = cards.randomGet();
                            await player.discard(randomCard, "he");
                            game.log(player, "因", "#y【邪念之实】", "被强制弃置了一张牌");
                        }
                    } else {
                        const count = player.countCards("he", canDiscard);
                        if (count > 0) {
                            await player.chooseToDiscard(1, "he", true).set('filterCard', canDiscard).set('prompt', "邪念之实：请弃置一张牌（不能弃置邪念之实）");
                        }
                    }
                }
            },
            damage: {
                equipSkill: true,
                trigger: {
                    player: "damageBegin4"
                },
                filter: function (event, player) {
                    return player.getEquip("evilnut");
                },
                content: async function (event, trigger, player) {
                    const isKanna = ["Kanna", "Hyades", "Pleiades_Niko"].some(n => player.name == n || player.name1 == n || player.name2 == n);
                    const evilnutCard = player.getEquip("evilnut");
                    if (!evilnutCard) return;

                    if (isKanna) {
                        await player.discard(evilnutCard);
                        await player.draw();
                        return;
                    }

                    const canDiscard = (card) => card.name != "evilnut";
                    const choices = ["取消"];
                    if (player.countCards("he", canDiscard) > 0) {
                        choices.unshift("弃置一张牌");
                    }
                    choices.push("流失一点体力");

                    const next = player.chooseControl(choices).set("prompt", "邪念之实：是否弃置一张牌或流失1点体力，将此牌置入弃牌堆？");
                    
                    next.set("ai", function() {
                        var player = _status.event.player;
                        if (player.hasSkillTag("loseHp")) {
                            return "流失一点体力";
                        }
                        if (player.hp >= 2 && player.countCards("he") > 3 && _status.event.controls.includes("弃置一张牌")) {
                            return "弃置一张牌";
                        }
                        return "取消";
                    });

                    const result = await next.forResult();

                    if (result.control === "流失一点体力") {
                        await player.loseHp();
                        if (player.getEquip("evilnut")) {
                            await player.discard(evilnutCard);
                        }
                    } else if (result.control === "弃置一张牌") {
                        var discardNext = await player.chooseToDiscard(1, "he", true).set('filterCard', canDiscard).set('prompt', "邪念之实：请弃置一张牌以移除此牌").forResult();
                        if (discardNext.bool && player.getEquip("evilnut")) {
                            await player.discard(evilnutCard);
                        }
                    }
                }
            }
        }
    },
    "qianweihuakai_jiushi": {
        trigger: {
            source: "damageSource",
        },
        direct: true,
        equipSkill: true,
        filter(event, player) {
            return event.card && event.card.name == "sha" && event.getParent().name == "sha" && player.isDamaged() && player.countCards("h") > 0;
        },
        content() {
            "step 0";
            player.chooseToDiscard("h", get.prompt("救世"), "弃置一张手牌并回复1点体力").set("ai", card => 7 - get.value(card)).logSkill = "qianweihuakai_jiushi";
            "step 1";
            if (result.bool) {
                player.recover();
            }
        },
        "_priority": -25,
    },
    "qianweihuakai_aishi": {
        equipSkill: true,
        trigger: {
            player: "useCardToPlayered",
        },
        logTarget: "target",
        filter(event, player) {
            if (event.card.name != "sha") {
                return false;
            }
            return true;
        },
        async cost(event, trigger, player) {
            let choice = ["选项一"];
            if (trigger.target.countCards("he")) {
                choice.push("选项二");
            }
            choice.push("cancel2");
            const result = await player
                .chooseControl(choice)
                .set("prompt", get.prompt(event.name.slice(0, -5), trigger.target))
                .set("choiceList", ["摸一张牌", "令其弃置一张牌"])
                .set(
                    "res",
                    (function () {
                        if (get.attitude(player, trigger.target) > 0 || trigger.target.hasSkillTag("noh")) {
                            return "选项一";
                        }
                        return choice[choice.length - 2];
                    })()
                )
                .set("ai", () => get.event("res"))
                .forResult();
            event.result = {
                bool: result.control != "cancel2",
                targets: [trigger.target],
                cost_data: result.control,
            };
        },
        async content(event, trigger, player) {
            const result = event.cost_data;
            if (result == "选项一") {
                await player.draw();
            } else {
                await trigger.target.chooseToDiscard("弃置一张牌", "he", true);
            }
        },
        "_priority": -25,
    },

    // 朱贝
    "Juubey_wangxing": {
        audio: 2,
        trigger: { player: "phaseDrawBegin2" }, 
        forced: true,
        filter: function(event, player) { return !event.numFixed; },
        content: function(event, trigger, player) {
            "step 0"; 
            if (!player.hasSkill("Juubey_wangxing_sha")) {
                player.addSkill("Juubey_wangxing_sha");
            }
            var aiChoice = "1";
            if (player.countCards("h") >= 2) aiChoice = "2";
            var hasDyingEnemy = game.hasPlayer(function(current) {
                return current != player && get.attitude(player, current) < 0 && (current.hp <= 2);
            });
            if (player.countCards("h") >= 4 || hasDyingEnemy) aiChoice = "4"; 

            player.chooseControl("1", "2", "3", "4", "取消")
                  .set("prompt", "妄行：选择多摸1-4张牌。")
                  .set("ai", function() { return _status.event.aiChoice; })
                  .set("aiChoice", aiChoice);
            "step 1";
            if (result.control && result.control !== "取消") {
                var num = parseInt(result.control);
                trigger.num += num; 
                player.addMark("Juubey_wangxing_sha", num, false); 
                game.log(player, "发动了", "#g【妄行】", "，多摸了", num, "张牌");
            }
        }
    },
    "Juubey_wangxing_sha": {
        charlotte: true,
        mark: true,
        intro: { content: "本回合需弃置 # 张牌。" },
        filter: function() { return true; }, 
        mod: {
            cardUsable: function(card, player, num) {
                if (get.type(card) === "basic" && player.countMark("Juubey_wangxing_sha") > 0) {
                    return num + player.countMark("Juubey_wangxing_sha"); 
                }
            }
        },
        trigger: { player: "phaseJieshuBegin" }, 
        forced: true,
        popup: false,
        content: function(event, trigger, player) {
            "step 0";
            event.num = player.countMark("Juubey_wangxing_sha");
            player.removeMark("Juubey_wangxing_sha", event.num);
            player.removeSkill("Juubey_wangxing_sha"); 
            event.penalty = event.num + 1; 
            
            var discardableCards = player.getCards("he").filter(function(c) {
                return lib.filter.cardDiscardable(c, player);
            });

            if (discardableCards.length < event.num) {
                player.loseMaxHp(event.penalty);
                game.log(player, "由于可弃置的牌数不足，被强制违悖宇宙法则，失去了", event.penalty, "点体力上限！");
                event.finish();
                return;
            }

            var aiChoice = "弃置牌"; 
            if (player.hp <= 2 && (player.maxHp - event.penalty > 0)) {
                aiChoice = "减体力上限";
            }

            player.chooseControl("弃置牌", "减体力上限")
                  .set("prompt", "妄行结算：请弃置 " + event.num + " 张牌，或减 " + event.penalty + " 点体力上限")
                  .set("ai", function() { return _status.event.aiChoice; })
                  .set("aiChoice", aiChoice);
            "step 1";
            if (result.control === "弃置牌") {
                player.chooseToDiscard(event.num, "he", true).set("prompt", "妄行：请弃置 " + event.num + " 张牌");
            } else {
                player.loseMaxHp(event.penalty);
                game.log(player, "想要违悖宇宙的法则，失去了", event.penalty, "点体力上限！");
                event.finish(); 
            }
        }
    },
    "Juubey_zhuangbei": {
        equipSkill: true,
        filter: function() { return true; }, 
        mod: {
            canBeDiscarded: function(card) { if (card.name === "Juubey") return false; },
            cardDiscardable: function(card) { if (card.name === "Juubey") return false; }
        },
        nopop: true,
        charlotte: true,
        "skill_id": "Juubey_zhuangbei",
        forced: true,
    },
    "Juubey_wangxing_2": {
        charlotte: true,
        filter: function() { return true; }, 
        content: function() { }
    },
};

export default equipSkills;
