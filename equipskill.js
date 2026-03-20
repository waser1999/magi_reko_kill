import { lib, game, ui, get, ai, _status } from "../../noname.js";

const equipSkills = {
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
            source: "damageBefore",
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
                if (type == 'trick' || type == 'delay' | type == 'sha') return true;
            },
            canBeDiscarded(card) {
                if (get.position(card) == 'e' && ['equip1', 'equip2'].includes(get.subtype(card))) return false;
            },
        },
        "_priority": 0,
    },
};

export default equipSkills;