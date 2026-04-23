import { lib, game, ui, get, ai, _status } from "../../noname.js";

const equipSkills = {
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
    "ClovisSword_skill": {
        mod: {
            maxHandcard(player, num) {
                return num + 2;
            }
        },
        inherit: "qinggang_skill",
        equipSkill: true,
        audio: true,
        trigger: {
            player: "useCardToPlayered",
        },
        filter(event) {
            return event.card.name === "sha";
        },

        logTarget: "target",
        content() {
            trigger.target.chooseToDiscard('he', 1, true);
            trigger.target.addTempSkill("qinggang2");
            trigger.target.storage.qinggang2.add(trigger.card);
            trigger.target.markSkill("qinggang2");
        },
        ai: {
            "unequip_ai": true,
            skillTagFilter(player, tag, arg) {
                if (arg && arg.name === "sha") {
                    return true;
                }
                return false;
            }
        },
        "_priority": 0,
    },
    "LightLance_skill1": {
        equipSkill: true,
        trigger: {
            source: "damageAfter",
        },
        filter: function (event, player) {
            return event.player != player && event.player.maxHp > 0 && event.player.isAlive();
        },
        "prompt2": function (event, player) {
            return '令其减少等同伤害值的体力上限。';
        },
        content: function () {
            trigger.player.loseMaxHp(trigger.num);
        },
        mod: {
            cardUsable: () => Infinity,
        },
        "_priority": 0,
    },
    "LightLance_skill2": {
        mod: {
            targetInRange(card, player, target, now) {
                var type = get.type(card);
                if (type == 'trick' || type == 'delay' | type == 'sha') return Infinity;
            },
            canBeDiscarded(card) {
                if (get.position(card) == 'e' && ['equip1', 'equip2'].includes(get.subtype(card))) return false;
            },
        },
        "_priority": 0,
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
                const isKanna = player.name == "Kanna" || player.name1 == "Kanna" || player.name2 == "Kanna";
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
                    const isKanna = player.name == "Kanna" || player.name1 == "Kanna" || player.name2 == "Kanna";
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
                            game.log(player, "因「邪念之实」被强制弃置了一张牌");
                        }
                    } else {
                        const count = player.countCards("he", canDiscard);
                        if (count > 0) {
                            await player.chooseToDiscard("he", true, "邪念之实：请弃置一张牌（不能弃置悲叹之种）", canDiscard);
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
                    const isKanna = player.name == "Kanna" || player.name1 == "Kanna" || player.name2 == "Kanna";
                    const evilnutCard = player.getEquip("evilnut");
                    if (!evilnutCard) return;

                    if (isKanna) {
                        await player.discard(evilnutCard);
                        await player.draw();
                        return;
                    }

                    const canDiscard = (card) => card.name != "evilnut";
                    const choices = ["流失一点体力"];
                    if (player.countCards("he", canDiscard) > 0) {
                        choices.push("弃置一张牌");
                    }

                    const { result } = await player.chooseControl(choices)
                        .set("prompt", "邪念之实：请选择一项，然后将此牌置入弃牌堆");

                    if (result.control == "流失一点体力") {
                        await player.loseHp();
                    } else if (result.control == "弃置一张牌") {
                        await player.chooseToDiscard("he", true, "邪念之实：请弃置一张牌（不能弃置悲叹之种）", canDiscard);
                    }

                    if (player.getEquip("evilnut")) {
                        await player.discard(evilnutCard);
                    }
                }
            }
        }
    },
};

export default equipSkills;