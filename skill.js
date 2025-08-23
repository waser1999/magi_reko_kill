import { lib, game, ui, get, ai, _status } from "../../noname.js";

const skills = {
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
    "sayaka_qiangyin": {
        inherit: "jieyin",
        filterTarget(card, player, target) {
            if (target.hp >= target.maxHp) return false;
            if (target == player) return false;
            return true;
        },
        async content(event, trigger, player) {
            player.addTempSkill("sayaka_qiangyin_clear", { player: "phaseBegin" });
            player.recover();
            event.target.recover();
            player.addAdditionalSkills("sayaka_buqu", "buqu", true);
            event.target.addAdditionalSkills("sayaka_buqu", "buqu", true);
        },
        subSkill: {
            clear: {
                onremove(player) {
                    game.countPlayer(function (current) {
                        current.removeAdditionalSkills("sayaka_buqu");
                    });
                },
            },
        },
        "_priority": 0,
        enable: "phaseUse",
        filterCard: true,
        usable: 1,
        selectCard: 2,
        check(card) {
            const player = get.owner(card);
            if (player.countCards("h") > player.hp) {
                return 8 - get.value(card);
            }
            if (player.hp < player.maxHp) {
                return 6 - get.value(card);
            }
            return 4 - get.value(card);
        },
        ai: {
            order: 5.5,
            result: {
                player(player) {
                    if (player.hp < player.maxHp) {
                        return 4;
                    }
                    if (player.countCards("h") > player.hp) {
                        return 0;
                    }
                    return -1;
                },
                target: 4,
            },
            threaten: 2,
        },
    },
    "madoka_xieli": {
        group: ["madoka_xieli1"],
        zhuSkill: true,
        filter(event, player) {
            if (!player.hasZhuSkill("madoka_xieli") || !game.hasPlayer(current => current != player && current.group == "yuan")) return false;
            return !event.madoka_xieli && (event.type != "phase" || !player.hasSkill("madoka_xieli3"));
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
                if (!player.hasZhuSkill("madoka_xieli") || !game.hasPlayer(current => current != player && current.group == "yuan")) return false;
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
    "madoka_xieli1": {
        trigger: {
            player: ["useCardBegin", "respondBegin"],
        },
        logTarget: "targets",
        sourceSkill: "madoka_xieli",
        filter(event, player) {
            return event.skill == "madoka_xieli";
        },
        forced: true,
        async content(event, trigger, player) {
            delete trigger.skill;
            trigger.getParent().set("madoka_xieli", true);
            while (true) {
                if (event.current == undefined) event.current = player.next;
                if (event.current == player) {
                    player.addTempSkill("madoka_xieli3");
                    trigger.cancel();
                    trigger.getParent().goto(0);
                    return;
                } else if (event.current.group == "yuan") {
                    const chooseToRespondEvent = event.current.chooseToRespond("是否替" + get.translation(player) + "打出一张杀？", { name: "sha" });
                    chooseToRespondEvent.set("ai", () => {
                        const event = _status.event;
                        return get.attitude(event.player, event.source) - 2;
                    });
                    chooseToRespondEvent.set("source", player);
                    chooseToRespondEvent.set("madoka_xieli", true);
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
    "madoka_xieli3": {
        trigger: {
            global: ["useCardAfter", "useSkillAfter", "phaseAfter"],
        },
        silent: true,
        charlotte: true,
        sourceSkill: "madoka_xieli",
        filter(event) {
            return event.skill != "madoka_xieli";
        },
        async content(event, trigger, player) {
            player.removeSkill("madoka_xieli3");
        },
        forced: true,
        popup: false,
        "_priority": 1,
    },
    "iroha_yuanjiu": {
        zhuSkill: true,
        trigger: {
            player: ["chooseToRespondBefore", "chooseToUseBefore"],
        },
        filter(event, player) {
            if (event.responded) return false;
            if (player.storage.yuanjiuing) return false;
            if (!player.hasZhuSkill("iroha_yuanjiu")) return false;
            if (!event.filterCard({ name: "shan", isCard: true }, player, event)) return false;
            return game.hasPlayer(current => current != player && current.group == "huan");
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
                else if (event.current.group == "huan") {
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
                if (!player.hasZhuSkill("iroha_yuanjiu")) return false;
                return game.hasPlayer(current => current != player && current.group == "huan");
            },
        },
        "_priority": 0,
    },
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
                    global: "phaseBegin",
                },
                forced: true,
                filter: function (event, player) {
                    return player.countExpansions("oriko_yuzhi") < game.players.length;
                },
                content: function () {
                    player.addToExpansion(get.cards(), player, "draw").gaintag.add("oriko_yuzhi");
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
        trigger: {
            global: "judge",
        },
        direct: true,
        filter(event, player) {
            return player.getExpansions("oriko_yuzhi").length && event.player.isIn();
        },
        content() {
            "step 0";
            var list = player.getExpansions("oriko_yuzhi");
            player
                .chooseButton([get.translation(trigger.player) + "的" + (trigger.judgestr || "") + "判定为" + get.translation(trigger.player.judging[0]) + "，" + get.prompt("oriko_jiangsha"), list, "hidden"], function (button) {
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
                });
            "step 1";
            if (result.bool) {
                event.forceDie = true;
                player.respond(result.links, "oriko_jiangsha", "highlight", "noOrdering");
                result.cards = result.links;
                var card = result.cards[0];
                event.card = card;
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
                game.log(trigger.player, "的判定牌改为", card);
                game.delay(2);
                player.draw();
            }
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
    "oriko_xianzhong": {
        zhuSkill: true,
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
            if (!trigger.source || trigger.source.group != "yuan") return false;
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
    "yachiyo_gujun": {
        zhuSkill: true,
        trigger: {
            global: "dying",
        },
        filter(event, player) {
            if (player.hp == player.maxHp) return false;
            if (player.hasSkill("yachiyo_gujun2")) return false;
            return player.hasZhuSkill("yachiyo_gujun", event.player);
        },
        async cost(event, trigger, player) {
            // 防止其他势力触发
            if (trigger.player.group != "huan") return false;
            event.result = await trigger.player
                .chooseBool("是否发动【孤军】，令" + get.translation(player) + "回复一点体力？")
                .set("choice", get.attitude(trigger.player, player) > 0)
                .forResult();
        },
        async content(event, trigger, player) {
            player.recover();
            player.addTempSkill("yachiyo_gujun2", "phaseEnd");
        },
        "_priority": 0,
    },
    "yachiyo_gujun2": {
        "_priority": 0,
    },
    "magius_jiefang": {
        zhuSkill: true,
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
            if (player.group != "ma") return false;
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
    "test_skill": {
        enable: ["phaseUse"],
        filter(event, player) {
            return player.countCards('h') > 0;
        },
        async content(event, trigger, player) {
            let cards = [get.cardPile("test_tube", "field"), get.cardPile("sha", "field")];
            player.gain(cards, "gain2");
        },
        "_priority": 0,
    },
    "ani_lieying": {
        group: "ani_lieying2",
        locked: true,
        "_priority": 0,
    },
    "ani_lieying2": {
        forced: true,
        equipSkill: true,
        noHidden: true,
        inherit: "kuroe_kill_skill",
        sourceSkill: "ani_lieying",
        filter(event, player) {
            if (!player.hasEmptySlot(1)) {
                return false;
            }
            return true;
        },
        "_priority": 0,
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
            // 执行额外回合
            player.insertPhase();
        },
        ai: {
            noh: true,
        },
        "_priority": 0,
    },
    "nemu_zhiyao": {
        audio: "ext:魔法纪录/audio/skill:2",
        forced: true,
        charlotte: true,
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
    "ui_jinghua": {
        trigger: {
            global: "roundStart",
        },
        async content(event, trigger, player) {
            let result = await player
                .chooseTarget([1, player.maxHp], "令其获得技能【强运】，并弃置每名角色判定区的所有牌", function (card, player, target) {
                    return !target.hasSkill("tsuruno_qiangyun");
                })
                .set("ai", function (target) {
                    if (target.hasSkill("xinleiji") && get.attitude(_status.event.player, target) < 0) return true;
                    return get.attitude(_status.event.player, target) > 0;
                })
                .forResult();
            if (!result.bool) return;

            player.line(result.targets, "green");
            if (!result.targets.length) return;
            let num = result.targets.length;
            player.addTempSkill("ui_jinghua_cancel", { global: "roundStart" })

            for (let target of result.targets) {
                target.addAdditionalSkills("ui_qiangyun", "tsuruno_qiangyun", true);
                if (target.countCards("j")) num += target.countCards("j");
                target.discard(target.getCards("j"));
                if (target.isLinked()) target.link();
                if (target.isTurnedOver()) target.turnOver();
            }

            player.draw(num);
        },
        subSkill: {
            cancel: {
                onremove(player) {
                    game.countPlayer(function (current) {
                        current.removeAdditionalSkills("ui_qiangyun");
                    });
                },
            },
        },
        ai: {
            threaten: 3,
        },
        "_priority": 0,
    },
    "ui_wangyou": {
        audio: "ext:魔法纪录:2",
        trigger: {
            global: "judgeFixing",
        },
        usable: 1,
        filter(event, player) {
            return event.result && event.result.suit == "spade";
        },
        check(event, player) {
            return event.result.judge * get.attitude(player, event.player) < 0;
        },
        content() {
            "step 0";
            var evt = trigger.getParent();
            if (evt.name == "phaseJudge") evt.excluded = true;
            else {
                evt.finish();
                evt._triggered = null;
                if (evt.name.startsWith("pre_")) {
                    var evtx = evt.getParent();
                    evtx.finish();
                    evtx._triggered = null;
                }
                var nexts = trigger.next.slice();
                for (var next of nexts) {
                    if (next.name == "judgeCallback") trigger.next.remove(next);
                }
                var evts = game.getGlobalHistory("cardMove", function (evt) {
                    return evt.getParent(2) == trigger.getParent();
                });
                var cards = [];
                for (var i = evts.length - 1; i >= 0; i--) {
                    var evt = evts[i];
                    for (var card of evt.cards) {
                        if (get.position(card, true) == "o") cards.push(card);
                    }
                }
                trigger.orderingCards.addArray(cards);
            }
            var list = [];
            if (get.position(trigger.result.card) == "d") list.push(0);
            if (trigger.player.isIn() && player.canUse({ name: "sha", nature: "fire", isCard: true }, trigger.player, false)) list.push(1);
            if (list.length == 2)
                player
                    .chooseControl()
                    .set("choiceList", ["获得" + get.translation(trigger.result.card), "视为对" + get.translation(trigger.player) + "使用一张火【杀】"])
                    .set("choice", get.effect(trigger.player, { name: "sha" }, player, player) > 0 ? 1 : 0);
            else if (list.length == 1) event._result = { index: list[0] };
            else event.finish();
            "step 1";
            if (result.index == 0) player.gain(trigger.result.card, "gain2");
            else player.useCard({ name: "sha", nature: "fire", isCard: true }, trigger.player, false);
            trigger.cancel();
        },
        "_priority": 0,
    },
    "kanagi_dongyou": {
        trigger: {
            target: "taoBegin",
        },
        zhuSkill: true,
        forced: true,
        filter(event, player) {
            if (player == event.player) return false;
            if (!player.hasZhuSkill("kanagi_dongyou")) return false;
            if (event.player.group != "huan") return false;
            return true;
        },
        async content(event, trigger, player) {
            trigger.baseDamage++;
        },
        "_priority": 0,
    },
    "kazumi_xingyun": {
        trigger: {
            global: "die",
        },
        forced: true,
        zhuSkill: true,
        async content(event, trigger, player) {
            player.addToExpansion(get.cards(), "draw").gaintag.add("qixing");
        },
        "_priority": 0,
    },
    "sana_touming": {
        trigger: {
            target: "shaBefore",
        },
        forced: true,
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
        "_priority": 0,
    },
    "homura2_jihuo": {
        group: ["homura2_jihuo_discard", "homura2_jihuo_judge"],
        subfrequent: ["judge"],
        subSkill: {
            discard: {
                trigger: {
                    global: "loseAfter",
                },
                filter(event, player) {
                    if (event.type != "discard" || event.getlx === false) {
                        return false;
                    }
                    var cards = event.cards.slice(0);
                    var evt = event.getl(player);
                    if (evt && evt.cards) {
                        cards.removeArray(evt.cards);
                    }
                    for (var i = 0; i < cards.length; i++) {
                        if (cards[i].original != "j" && get.suit(cards[i], event.player) == "heart" && get.position(cards[i], true) == "d") {
                            return true;
                        }
                    }
                    return false;
                },
                direct: true,
                content() {
                    "step 0";
                    if (trigger.delay == false) {
                        game.delay();
                    }
                    "step 1";
                    var cards = [],
                        cards2 = trigger.cards.slice(0),
                        evt = trigger.getl(player);
                    if (evt && evt.cards) {
                        cards2.removeArray(evt.cards);
                    }
                    for (var i = 0; i < cards2.length; i++) {
                        if (cards2[i].original != "j" && get.suit(cards2[i], trigger.player) == "heart" && get.position(cards2[i], true) == "d") {
                            cards.push(cards2[i]);
                        }
                    }
                    if (cards.length) {
                        player.chooseButton(["集火：选择要获得的牌", cards], [1, cards.length]).set("ai", function (button) {
                            return get.value(button.link, _status.event.player, "raw");
                        });
                    }
                    "step 2";
                    if (result.bool) {
                        player.logSkill(event.name);
                        player.gain(result.links, "gain2", "log");
                    }
                },
                sub: true,
                sourceSkill: "homura2_jihuo",
                "_priority": 0,
            },
            judge: {
                trigger: {
                    global: "cardsDiscardAfter",
                },
                direct: true,
                filter(event, player) {
                    var evt = event.getParent().relatedEvent;
                    if (!evt || evt.name != "judge") {
                        return;
                    }
                    if (evt.player == player) {
                        return false;
                    }
                    if (get.position(event.cards[0], true) != "d") {
                        return false;
                    }
                    return get.suit(event.cards[0]) == "heart";
                },
                content() {
                    "step 0";
                    player.chooseButton(["集火：选择要获得的牌", trigger.cards], [1, trigger.cards.length]).set("ai", function (button) {
                        return get.value(button.link, _status.event.player, "raw");
                    });
                    "step 1";
                    if (result.bool) {
                        player.logSkill(event.name);
                        player.gain(result.links, "gain2", "log");
                    }
                },
                sub: true,
                sourceSkill: "homura2_jihuo",
                "_priority": 0,
            },
        },
        "_priority": 0,
    },
    "mabayu_jingxiang": {
        zhuSkill: true,
        trigger: {
            player: "phaseBegin",
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
                        return lib.skill[skill] && lib.skill[skill].zhuSkill;
                    })
                ) {
                    characters.push(_status.characterlist[i]);
                    if (characters.length >= 3) {
                        break;
                    }
                }
            }

            const skills = [];

            for (let i of characters) {
                skills.push(
                    get
                        .character(i, 3)
                        .filter(skill => {
                            return lib.skill[skill] && lib.skill[skill].zhuSkill;
                        })
                        .randomGet()
                );
            }

            const result = await player
                .chooseControl(skills)
                .set("dialog", ["请选择主角技", [characters, "character"]])
                .forResult();

            if (player.storage.mabayu_jingxiang) player.removeAdditionalSkills("mabayu_jingxiang");
            await player.addAdditionalSkills("mabayu_jingxiang", result.control, true);
            player.storage.mabayu_jingxiang = result.control;
        },
        "_priority": 0,
    },
    "nanaka_huaxin": {
        inherit: "xiaoji",
        audio: "ext:魔法纪录/audio/skill:2",
        getIndex(event, player) {
            const evt = event.getl(player);
            if (evt && evt.player === player && evt.es && evt.es.length) return 1;
            return false;
        },
    },
    "madoka_liegong": {
        mod: {
            cardnature(card, player) {
                if (!player.getVEquip(1) && get.name(card, player) == "sha") {
                    return false;
                }
            },
        },
        trigger: {
            player: "useCardToPlayered",
        },
        filter(event, player) {
            return !event.getParent()._madoka_liegong_player && event.targets.length == 1 && event.card.name == "sha" && player.getStorage("madoka_liegong").length > 0;
        },
        prompt2(event, player) {
            let str = "",
                storage = player.getStorage("madoka_liegong");
            if (storage.length > 1) {
                str += "亮出牌堆顶的" + get.cnNumber(storage.length - 1) + "张牌并增加伤害；且";
            }
            str += "令" + get.translation(event.target) + "不能使用花色为";
            for (let i = 0; i < storage.length; i++) {
                str += get.translation(storage[i]);
            }
            str += "的牌响应" + get.translation(event.card);
            return str;
        },
        logTarget: "target",
        locked: false,
        check(event, player) {
            const target = event.target;
            if (get.attitude(player, target) > 0) {
                return false;
            }
            if (
                target.hasSkillTag("filterDamage", null, {
                    player: player,
                    card: event.card,
                })
            ) {
                return false;
            }
            const storage = player.getStorage("madoka_liegong");
            if (storage.length >= 4) {
                return true;
            }
            if (storage.length < 3) {
                return false;
            }
            if (target.hasShan()) {
                return storage.includes("heart") && storage.includes("diamond");
            }
            return true;
        },
        async content(event, trigger, player) {
            const storage = player.getStorage("madoka_liegong").slice(0);
            const num = storage.length - 1;
            const evt = trigger.getParent();
            if (num > 0) {
                if (typeof evt.baseDamage != "number") {
                    evt.baseDamage = 1;
                }
                const cards = get.cards(num);
                let no_repeat_cards = [];
                await game.cardsGotoOrdering(cards);
                await player.showCards(cards.slice(0), get.translation(player) + "发动了【烈弓】");
                while (cards.length > 0) {
                    const card = cards.pop();
                    if (storage.includes(get.suit(card, false)) && !no_repeat_cards.includes(get.suit(card, false))) {
                        no_repeat_cards.add(card.suit);
                    }
                    //ui.cardPile.insertBefore(card,ui.cardPile.firstChild);
                }
                evt.baseDamage += no_repeat_cards.length;
                //game.updateRoundNumber();
            }
            evt._madoka_liegong_player = player;
            player.addTempSkill("madoka_liegong_clear");
            const target = trigger.target;
            target.addTempSkill("madoka_liegong_block");
            if (!target.storage.madoka_liegong_block) {
                target.storage.madoka_liegong_block = [];
            }
            target.storage.madoka_liegong_block.push([evt.card, storage]);
            lib.skill.madoka_liegong.updateBlocker(target);
        },
        updateBlocker(player) {
            const list = [],
                storage = player.storage.madoka_liegong_block;
            if (storage?.length) {
                for (const i of storage) {
                    list.addArray(i[1]);
                }
            }
            player.storage.madoka_liegong_blocker = list;
        },
        ai: {
            threaten: 3.5,
            "directHit_ai": true,
            skillTagFilter(player, tag, arg) {
                if (arg?.card?.name == "sha") {
                    const storage = player.getStorage("madoka_liegong");
                    if (storage.length < 3 || !storage.includes("heart") || !storage.includes("diamond")) {
                        return false;
                    }
                    const target = arg.target;
                    if (target.hasSkill("bagua_skill") || target.hasSkill("bazhen") || target.hasSkill("rw_bagua_skill")) {
                        return false;
                    }
                    return true;
                }
                return false;
            },
        },
        intro: {
            content: "已记录花色：$",
            onunmark: true,
        },
        group: "madoka_liegong_count",
        subSkill: {
            clear: {
                trigger: {
                    player: "useCardAfter",
                },
                forced: true,
                charlotte: true,
                popup: false,
                filter(event, player) {
                    return event._madoka_liegong_player == player;
                },
                content() {
                    player.unmarkSkill("madoka_liegong");
                    player.removeTip("madoka_liegong");
                },
                sub: true,
                sourceSkill: "madoka_liegong",
                "_priority": 0,
            },
            block: {
                mod: {
                    cardEnabled(card, player) {
                        if (!player.storage.madoka_liegong_blocker) {
                            return;
                        }
                        const suit = get.suit(card);
                        if (suit == "none") {
                            return;
                        }
                        let evt = _status.event;
                        if (evt.name != "chooseToUse") {
                            evt = evt.getParent("chooseToUse");
                        }
                        if (!evt || !evt.respondTo || evt.respondTo[1].name != "sha") {
                            return;
                        }
                        if (player.storage.madoka_liegong_blocker.includes(suit)) {
                            return false;
                        }
                    },
                },
                trigger: {
                    player: ["damageBefore", "damageCancelled", "damageZero"],
                    target: ["shaMiss", "useCardToExcluded", "useCardToEnd"],
                    global: ["useCardEnd"],
                },
                forced: true,
                firstDo: true,
                charlotte: true,
                popup: false,
                onremove(player) {
                    delete player.storage.madoka_liegong_block;
                    delete player.storage.madoka_liegong_blocker;
                },
                filter(event, player) {
                    const evt = event.getParent("useCard", true, true);
                    if (evt && evt.effectedCount < evt.effectCount) {
                        return false;
                    }
                    if (!event.card || !player.storage.madoka_liegong_block) {
                        return false;
                    }
                    return player.storage.madoka_liegong_block.some(i => i[0] == event.card);
                },
                content() {
                    const storage = player.storage.madoka_liegong_block;
                    for (let i = 0; i < storage.length; i++) {
                        if (storage[i][0] == trigger.card) {
                            storage.splice(i--, 1);
                        }
                    }
                    if (!storage.length) {
                        player.removeSkill(event.name);
                    } else {
                        lib.skill.madoka_liegong.updateBlocker(player);
                    }
                },
                sub: true,
                sourceSkill: "madoka_liegong",
                "_priority": 0,
            },
            count: {
                trigger: {
                    player: "useCard",
                    target: "useCardToTargeted",
                },
                forced: true,
                locked: false,
                popup: false,
                filter(event, player, name) {
                    if (name != "useCard" && player == event.player) {
                        return false;
                    }
                    const suit = get.suit(event.card);
                    if (!lib.suit.includes(suit)) {
                        return false;
                    }
                    if (player.storage.madoka_liegong?.includes(suit)) {
                        return false;
                    }
                    return true;
                },
                content() {
                    player.markAuto("madoka_liegong", [get.suit(trigger.card)]);
                    player.storage.madoka_liegong.sort((a, b) => lib.suit.indexOf(b) - lib.suit.indexOf(a));
                    player.addTip("madoka_liegong", get.translation("madoka_liegong") + player.getStorage("madoka_liegong").reduce((str, suit) => str + get.translation(suit), ""));
                },
                sub: true,
                sourceSkill: "madoka_liegong",
                "_priority": 0,
            },
        },
        "_priority": 0,
    },
    "madoka_yingbian": {
        trigger: {
            player: ["chooseToRespondBefore", "chooseToUseBefore"],
        },
        filter(event, player, name) {
            if (event.responded) return false;
            if (!player.storage.madoka_liegong || player.storage.madoka_liegong.length == 0) return false;
            if (!event.filterCard({ name: "shan", isCard: true }, player, event)) return false;
            return true;
        },
        async content(event, trigger, player) {
            let result = await player.judge(card => {
                if (player.storage.madoka_liegong?.includes(get.suit(card))) return 2;
                return -1;
            }).forResult();

            if (result.bool) {
                trigger.untrigger();
                trigger.set("responded", true);
                trigger.result = { bool: true, card: { name: "shan", isCard: true } };

                player.unmarkAuto("madoka_liegong", [get.suit(result.card)]);
                player.addTip("madoka_liegong", get.translation("madoka_liegong") + player.getStorage("madoka_liegong").reduce((str, suit) => str + get.translation(suit), ""));
            } else {
                player.gain(result.card);
            }
        },
        ai: {
            respondShan: true,
            freeShan: true,
            skillTagFilter(player) {
                if (!player.getStorage("madoka_liegong")) {
                    return false;
                }
                return true;
            },
            effect: {
                target(card, player, target, current) {
                    if (get.tag(card, "respondShan") && current < 0) {
                        return 0.6;
                    }
                },
            },
            order: 4,
            useful: -1,
            value: -1,
        },
        "_priority": 0,
    },
    "madoka_dengshen": {
        trigger: {
            source: "damageBefore",
        },
        forced: true,
        async content(event, trigger, player) {
            trigger.cancel();
            trigger.player.loseMaxHp(trigger.num);
        },
    },
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
    "kanagi_duxin": {
        trigger: { player: "phaseUseBegin" },
        usable: 1,
        filterTarget(card, player, target) {
            return player != target && target.countCards("h");
        },
        check(event, player) {
            if (player.hp == player.maxHp || player.maxHp <= 3) return false;
            return true;
        },
        async content(event, trigger, player) {
            let result = await player.chooseTarget().set("ai", target => {
                return -get.attitude(player, target);
            }).forResult();

            if (!result.bool) {
                event.finish();
                return;
            }
            let target = result.targets[0];
            if (player.maxHp >= 8) {
                player.loseMaxHp(2);
            } else {
                player.loseMaxHp();
            }

            player.line(target, "green");
            if (!target || !target.countCards("h")) {
                event.finish();
            } else {
                let card = await player.chooseCardButton(target, target.getCards("h")).forResult();
                if (card.bool) {
                    target.discard(card.links[0]);
                }
            }
        },
        ai: {
            order: 11,
            result: {
                target(player, target) {
                    return -target.countCards("h");
                },
            },
            threaten: 1.1,
        },
    },
    "tsuruno_tuanluan": {
        inherit: "drlt_huairou",
        async content(event, trigger, player) {
            let equip_type = get.subtype(event.cards[0]);
            player.recast(event.cards);

            if (player.isDisabled(equip_type)) player.enableEquip(equip_type);
            delete player.getStat().skill.drlt_jueyan;
        },
    },
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
    "kaede_manmiao": {
        audio: "ext:魔法纪录/audio/skill:2",
        forced: true,
        charlotte: true,
        trigger: {
            player: "taoAfter",
        },
        group: ["kaede_manmiao_jijiu"],
        content() {
            player.draw();
        },
        mod: {
            cardname(card, player, name) {
                if (card.name == "du") {
                    return "tao";
                }
            },
            aiValue(player, card, num) {
                if (card.name == "du") {
                    return get.value({ name: "tao" });
                }
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
                        return lib.skill.kanpo.mod.aiValue.apply(this, arguments);
                    },
                },
                locked: false,
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
    "kaede_buyi": {
        trigger: { global: "dying" },
        filter(event, player) {
            return event.player.countCards("h") > 0;
        },
        check(event, player) {
            return get.attitude(player, event.player) > 0;
        },
        content() {
            "step 0";
            if (player == trigger.player) {
                player.chooseCard("h", true).set("ai", function (card) {
                    if (get.type(card) != "basic") {
                        return 100 - get.value(card);
                    }
                    return 0;
                });
            } else {
                player.choosePlayerCard("h", trigger.player, true);
            }
            "step 1";
            var card = result.cards[0],
                target = trigger.player;
            player.showCards(card, get.translation(player) + "对" + (player == target ? "自己" : get.translation(target)) + "发动了【补益】");
            if (get.type(card, null, target) != "basic") {
                player.useCard({ name: "tao", isCard: true }, target, false);
                target.discard(card);
                if (target.countCards("h") == 1) {
                    target.draw();
                }
            }
        },
        logTarget: "player",
    },
    "kanagi_nvpu": {
        trigger: {
            player: ["equipAfter", "loseAfter"],
        },
        forced: true,
        charlotte: true,
        filter(event, player, name) {
            return get.name(event.cards[0]) == "maid_uniform";
        },
        content() {
        },
    },
    "tsuruno_qiangyun": {
        audio: "ext:魔法纪录/audio/skill:2",
        group: ["tsuruno_qiangyun_1", "tsuruno_qiangyun_2", "tsuruno_qiangyun_3"],
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
            1: {
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
            2: {
                mod: {
                    targetEnabled(card, player, target) {
                        if (get.type(card) == "delay") {
                            return false;
                        }
                    },
                },
            },
            3: {
                audio: "tsuruno_qiangyun",
                trigger: {
                    player: "turnOverBefore",
                },
                filter(event, player) {
                    return !player.isTurnedOver();
                },
                forced: true,
                content() {
                    trigger.cancel();
                },
                ai: {
                    noturnOver: true,
                },
            },
        },
    },
    "tsuruno_jizhi": {
        derivation: ["jiang", "reyingzi", "rezhiheng", "gzyinghun"],
        init2(player) {
            player.removeSkill(["jiang", "rezhiheng", "reyingzi", "gzyinghun"]);
            if (player.hp <= 4) {
                player.addSkill("jiang");
            }
            if (player.hp <= 3) {
                player.addSkill("reyingzi");
            }
            if (player.hp <= 2) {
                player.addSkill("rezhiheng");
            }
            if (player.hp <= 1) {
                player.addSkill("gzyinghun");
            }
        },
        trigger: { player: "changeHp" },
        firstDo: true,
        silent: true,
        content() {
            lib.skill.tsuruno_jizhi.init2(player);
        },
    },
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
            game.addGlobalSkill("g_du");    //赠毒程序代码
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
        selectTarget: -1,        // 表示选择所有目标
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
    "mami_duanbian": {
        trigger: {
            player: ["phaseJudgeBefore", "phaseDrawBefore", "phaseUseBefore", "phaseDiscardBefore"],
        },
        filter(event, player) {
            return player.countCards("h") > 0;
        },
        preHidden: true,
        async cost(event, trigger, player) {
            let check,
                str = "弃置一张手牌并跳过";
            str += ["判定", "摸牌", "出牌", "弃牌"][lib.skill.qiaobian.trigger.player.indexOf(event.triggername)];
            str += "阶段";
            if (trigger.name == "phaseDraw") {
                str += "，然后可以获得至多三名角色各一张手牌";
            }
            if (trigger.name == "phaseUse") {
                str += "，然后可以移动场上的一张牌";
            }
            switch (trigger.name) {
                case "phaseJudge":
                    check = player.countCards("j") || player.hasCard(card => get.suit(card) == "diamond" || get.name(card) == "lebu");
                    break;
                case "phaseDraw": {
                    let i,
                        num = 0,
                        num2 = 0;
                    const players = game.filterPlayer();
                    for (i = 0; i < players.length; i++) {
                        if (player != players[i] && players[i].countCards("h")) {
                            const att = get.attitude(player, players[i]);
                            if (att <= 0) {
                                num++;
                            }
                            if (att < 0) {
                                num2++;
                            }
                        }
                    }
                    check = num >= 2 && num2 > 0;
                    break;
                }
                case "phaseUse":
                    if (!player.canMoveCard(true)) {
                        check = false;
                    } else {
                        check = game.hasPlayer(function (current) {
                            return get.attitude(player, current) > 0 && current.countCards("j");
                        });
                        if (!check) {
                            if (player.countCards("h") > player.hp + 1) {
                                check = false;
                            } else if (player.countCards("h", { name: "wuzhong" })) {
                                check = false;
                            } else {
                                check = true;
                            }
                        }
                    }
                    break;
                case "phaseDiscard":
                    check = player.needsToDiscard();
                    break;
            }
            event.result = await player
                .chooseToDiscard(get.prompt(event.skill), str, lib.filter.cardDiscardable)
                .set("ai", card => {
                    if (!_status.event.check) {
                        return -1;
                    }
                    if (get.suit(card) == "diamond" || get.name(card) == "lebu") {
                        return 7;
                    }
                    return 7 - get.value(card);
                })
                .set("check", check)
                .setHiddenSkill(event.skill)
                .forResult();
        },
        async content(event, trigger, player) {
            trigger.cancel();
            game.log(player, "跳过了", "#y" + ["判定", "摸牌", "出牌", "弃牌"][lib.skill.qiaobian.trigger.player.indexOf(event.triggername)] + "阶段");
            if (trigger.name == "phaseUse") {
                if (player.canMoveCard()) {
                    await player.moveCard();
                }
            } else if (trigger.name == "phaseDraw") {
                const { result } = await player
                    .chooseTarget([1, 3], "获得至多三名角色各一张手牌", function (card, player, target) {
                        return target != player && target.countCards("h");
                    })
                    .set("ai", function (target) {
                        return 1 - get.attitude(_status.event.player, target);
                    });
                if (!result.bool) {
                    return;
                }
                result.targets.sortBySeat();
                player.line(result.targets, "green");
                if (!result.targets.length) {
                    return;
                }
                await player.gainMultiple(result.targets);
                await game.delay();
            }

            let card = event.cards[0];
            if (get.suit(card) == "diamond" || get.name(card) == "lebu") {
                let result = await player.chooseTarget("请选择使用【乐不思蜀】的目标", true, function (card, player, target) {
                    if (target == player) return false;
                    return true;
                }).set("ai", function (target) {
                    return get.effect(target, { name: "lebu" }, player, player) > 0;
                }).forResult();

                if (result.bool && !result.targets[0].hasJudge("lebu")) {
                    player.line(result.targets, "green");
                    result.targets[0].addJudge({ name: "lebu" }, card);
                }
            }
        },
        ai: { threaten: 3 },
    },
    "homura_juwu": {
        trigger: { player: "phaseZhunbeiBegin" },
        frequent: true,
        content() {
            "step 0";
            event.cards = [];
            "step 1";
            var next = player.judge(function (card) {
                var color = get.color(card);
                var evt = _status.event.getParent("homura_juwu");
                if (evt) {
                    if (!evt.color) {
                        evt.color = color;
                    } else if (evt.color != color) {
                        return -1;
                    }
                }
                return 1;
            });
            next.judge2 = function (result) {
                return result.bool;
            };
            if (!player.hasSkillTag("rejudge")) {
                next.set("callback", function () {
                    if (get.position(card, true) == "o") {
                        player.gain(card, "gain2");
                    }
                });
            } else {
                next.set("callback", function () {
                    event.getParent().orderingCards.remove(card);
                });
            }
            "step 2";
            if (result.judge > 0) {
                event.cards.push(result.card);
                player.chooseBool("是否再次发动【聚武】？").set("frequentSkill", "homura_juwu");
            } else {
                for (var i = 0; i < event.cards.length; i++) {
                    if (get.position(event.cards[i], true) != "o") {
                        event.cards.splice(i, 1);
                        i--;
                    }
                }
                if (event.cards.length) {
                    player.gain(event.cards, "gain2");
                }
                event.finish();
            }
            "step 3";
            if (result.bool) {
                event.goto(1);
            } else {
                if (event.cards.length) {
                    player.gain(event.cards, "gain2");
                }
            }
        },
    },
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
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog("雪恨", player.getExpansions("yuna_chouhai"), "hidden");
            },
            backup(links, player) {
                return {
                    filterTarget: true,
                    filterCard() {
                        return false;
                    },
                    selectCard: -1,
                    card: links[0],
                    delay: false,
                    content: lib.skill.yuna_xuehen.contentx,
                    ai: {
                        order: 10,
                        result: {
                            target(player, target) {
                                if (get.attitude(player, target) < 0 && target.hp == 1) {
                                    if (!target.hasSkill("buqu")) return 0;
                                    if (target.countCards("h") > target.maxHp) return 0;
                                    return -3;
                                }
                                if (get.attitude(player, target) > 0) {
                                    if (player == target && player.countCards("h") <= 1 && player.hp > 1) {
                                        return 2;
                                    }
                                    if (target.hp >= 3 && target.countCards("h") <= 1) return 1;
                                }
                                return 0;
                            },
                        },
                    },
                };
            },
            prompt() {
                return "请选择〖雪恨〗的目标";
            },
        },
        contentx() {
            "step 0";
            var card = lib.skill.yuna_xuehen_backup.card;
            player.loseToDiscardpile(card);
            "step 1";
            target.damage();
            target.draw(2);
        },
        ai: {
            order: 1,
            combo: "yuna_chouhai",
            result: {
                player: 1,
            },
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
        forced: true,
        trigger: {
            global: ["gameStart"],
        },
        filter(event, player) {
            if (!player.hasZhuSkill("yuna_xuemeng", event.source)) {
                return false;
            }
            let n = game.countPlayer(current => {
                return current.group == "huan" || current.group == "ma";
            })
            if (n == 0) return false;
            return true;
        },
        content() {
            player.storage.xuemeng = true;
        }
    },
    "magius_zhishang": {
        zhuSkill: true,
        locked: true,
        forced: true,
        filter(event, player) {
            if (!event.source || !event.source.isIn() || event.source.group != "ma") {
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
                            if (player.group != "ma") {
                                return;
                            }
                            return (
                                num +
                                game.countPlayer(current => {
                                    return current.hasZhuSkill("magius_zhishang", player) || current.group == "ma";
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
                    if (!event.player || event.player.group != "ma") return false;
                    return true;
                },
                content() {
                    player.useSkill("himena_zhiquan");
                }
            }
        },
    },
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
            const next = player.judge(function (card) {
                return get.type(card) == "equip" ? 6 : -6;
            });
            next.judge2 = function (result) {
                return result.bool;
            };
            const { result } = await next;
            if (trigger.getParent().addCount !== false) {
                trigger.getParent().addCount = false;
                var stat = player.getStat();
                if (stat && stat.card && stat.card.sha) {
                    stat.card.sha--;
                }
            }
            if (result.bool === true) {
                var map = trigger.customArgs;
                var id = trigger.target.playerid;
                if (!map[id]) {
                    map[id] = {};
                }
                if (typeof map[id].extraDamage != "number") {
                    map[id].extraDamage = 0;
                }
                map[id].extraDamage += trigger.target.hp - 1;
            } else if (result.bool === false && get.type(result.card) != "basic") {
                await player.loseHp();
                await player.gain(result.card);
            }
        },
        group: "asumi_zhuilie_sha",
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
    "asumi_yinhu": {
        trigger: { player: "loseHpEnd" },
        filter(event, player) {
            return player.isIn() && event.num > 0;
        },
        getIndex: event => event.num,
        forced: true,
        async content(event, trigger, player) {
            await player.draw(3);
        },
        ai: {
            maihp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, "damage")) {
                        if (player.hasSkillTag("jueqing", false, target)) {
                            return [1, 1];
                        }
                        return 1.2;
                    }
                    if (get.tag(card, "loseHp")) {
                        if (target.hp <= 1) {
                            return;
                        }
                        var using = target.isPhaseUsing();
                        if (target.hp <= 2) {
                            return [1, player.countCards("h") <= 1 && using ? 3 : 0];
                        }
                        if (using && target.countCards("h", { name: "sha", color: "red" })) {
                            return [1, 3];
                        }
                        return [1, target.countCards("h") <= target.hp || (using && game.hasPlayer(current => current != player && get.attitude(player, current) < 0 && player.inRange(current))) ? 3 : 2];
                    }
                },
            },
        },
    },
    "name_dengtai": {
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
    "iroha_dimeng": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        filter(event, player) {
            return game.hasPlayer(current => lib.skill.iroha_dimeng.filterTarget(null, player, current));
        },
        selectTarget: 2,
        complexTarget: true,
        filterTarget(card, player, target) {
            if (target == player) {
                return false;
            }
            var ps = player.countCards("he");
            if (!ui.selected.targets.length) {
                var hs = target.countCards("h");
                return game.hasPlayer(function (current) {
                    if (current == player || current == target) {
                        return false;
                    }
                    var cs = current.countCards("h");
                    return (hs > 0 || cs > 0) && Math.abs(hs - cs) <= ps;
                });
            }
            var current = ui.selected.targets[0],
                hs = target.countCards("h"),
                cs = current.countCards("h");
            return (hs > 0 || cs > 0) && Math.abs(hs - cs) <= ps;
        },
        multitarget: true,
        multiline: true,
        content() {
            targets[0].swapHandcards(targets[1]);
            player.addTempSkill("iroha_dimeng_discard", "phaseUseAfter");
            player.markAuto("iroha_dimeng_discard", [targets]);
        },
        ai: {
            threaten: 4.5,
            pretao: true,
            nokeep: true,
            order: 1,
            expose: 0.2,
            result: {
                target(player, target) {
                    if (!ui.selected.targets.length) {
                        return -Math.sqrt(target.countCards("h"));
                    }
                    var h1 = ui.selected.targets[0].getCards("h"),
                        h2 = target.getCards("h");
                    if (h2.length > h1.length) {
                        return 0;
                    }
                    var delval = get.value(h2, target) - get.value(h1, ui.selected.targets[0]);
                    if (delval >= 0) {
                        return 0;
                    }
                    return -delval * (h1.length - h2.length);
                },
            },
        },
        subSkill: {
            discard: {
                audio: "ext:魔法纪录/audio/skill:2",
                trigger: { player: "phaseUseEnd" },
                forced: true,
                charlotte: true,
                onremove: true,
                filter(event, player) {
                    return player.countCards("he") > 0;
                },
                async content(event, trigger, player) {
                    for (let targets of player.getStorage("iroha_dimeng_discard")) {
                        if (targets.length < 2) {
                            continue;
                        }
                        const num = Math.abs(targets[0].countCards("h") - targets[1].countCards("h"));
                        if (num > 0 && player.countCards("he") > 0) {
                            await player.chooseToDiscard("he", true, num);
                        }
                    }
                },
            },
        },
    },
    "mami_tiro_finale": {
        enable: "phaseUse",
        usable: 1,
        viewAs: { name: "wanjian" },
        audio: "ext:魔法纪录/audio/skill:2",
        group: "mami_tiro_finale_draw",
        filterCard: true,
        selectCard: 2,
        position: "hs",
        prompt: "将两张手牌当【万箭齐发】使用",
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
                if (get.attitude(player, targets[i]) == 0 || targets[i].group == "yuan") {
                    eff += 0.5;
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
            return 6 - get.value(card);
        },
        ai: {
            threaten: 1.6,
        },
        subSkill: {
            draw: {
                trigger: { global: "respond" },
                forced: true,
                locked: false,
                filter(event, player) {
                    var evt = event.getParent(2);
                    return (
                        evt.name == "wanjian" &&
                        evt.getParent().player == player &&
                        event.player != player &&
                        player.getHistory("gain", function (evt) {
                            return evt.getParent(2).name == "mami_tiro_finale_draw";
                        }).length < 3
                    );
                },
                content() {
                    player.draw();
                },
            },
        },
    },
    "saint_mami_tiro_finale": {
        audio: "ext:魔法纪录/audio/skill:2",
        enable: "phaseUse",
        viewAs: { name: "wanjian" },
        filterCard(card, player) {
            if (!player.storage.saint_mami_tiro_finale) {
                return true;
            }
            return !player.storage.saint_mami_tiro_finale.includes(get.suit(card));
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
        group: ["saint_mami_tiro_finale_count", "saint_mami_tiro_finale_reset", "saint_mami_tiro_finale_respond", "saint_mami_tiro_finale_damage", "saint_mami_tiro_finale_draw"],
        subSkill: {
            reset: {
                trigger: { player: "phaseAfter" },
                silent: true,
                async content(event, trigger, player) {
                    delete player.storage.saint_mami_tiro_finale;
                    delete player.storage.saint_mami_tiro_finale2;
                },
            },
            count: {
                trigger: { player: "useCard" },
                silent: true,
                filter(event) {
                    return event.skill == "saint_mami_tiro_finale";
                },
                async content(event, trigger, player) {
                    player.storage.saint_mami_tiro_finale2 = trigger.card;
                    if (!player.storage.saint_mami_tiro_finale) {
                        player.storage.saint_mami_tiro_finale = [];
                    }
                    player.storage.saint_mami_tiro_finale.addArray(trigger.cards.map(c => get.suit(c)));
                },
            },
            respond: {
                trigger: { global: "respond" },
                silent: true,
                filter(event) {
                    return event.getParent(2).skill == "saint_mami_tiro_finale";
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
                    return player.storage.saint_mami_tiro_finale2 && event.card == player.storage.saint_mami_tiro_finale2;
                },
                async content(event, trigger, player) {
                    delete player.storage.saint_mami_tiro_finale2;
                },
            },
            draw: {
                trigger: { player: "useCardAfter" },
                forced: true,
                silent: true,
                popup: false,
                filter(event, player) {
                    return player.storage.saint_mami_tiro_finale2 && event.card == player.storage.saint_mami_tiro_finale2;
                },
                async content(event, trigger, player) {
                    await player.draw(trigger.targets.length);
                    delete player.storage.saint_mami_tiro_finale2;
                },
            },
        },
    },
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
    "ren_beige": {
        inherit: "olbeige",
        audio: "ext:魔法纪录/audio/skill:2",
    },
    "momoko_qiangxi": {
        inherit: "qiangxix",
        audio: "ext:魔法纪录/audio/skill:2",
    },
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
    "lena_huashen": {
        unique: true,
        audio: "ext:魔法纪录/audio/skill:2",
        trigger: {
            global: "phaseBefore",
            player: ["enterGame", "phaseBegin", "phaseEnd"],
        },
        filter(event, player, name) {
            if (event.name != "phase") {
                return true;
            }
            if (name == "phaseBefore") {
                return game.phaseNumber == 0;
            }
            return player.storage.lena_huashen?.character?.length > 0;
        },
        async cost(event, trigger, player) {
            if (trigger.name !== "phase" || event.triggername === "phaseBefore") {
                event.result = { bool: true, cost_data: ["替换当前化身"] };
                return;
            }
            const prompt = "###" + get.prompt(event.skill) + '###<div class="text center">替换当前化身牌或制衡至多两张其他化身牌</div>';
            const result = await player
                .chooseControl("替换当前化身", "制衡其他化身", "cancel2")
                .set("ai", () => {
                    const { player, cond } = get.event();
                    let skills = player.storage.lena_huashen.character.map(i => get.character(i).skills).flat();
                    skills.randomSort();
                    skills.sort((a, b) => get.skillRank(b, cond) - get.skillRank(a, cond));
                    if (skills[0] === player.storage.lena_huashen.current2 || get.skillRank(skills[0], cond) < 1) {
                        return "制衡其他化身";
                    }
                    return "替换当前化身";
                })
                .set("cond", event.triggername)
                .set("prompt", prompt)
                .forResult();
            const control = result.control;
            event.result = { bool: typeof control === "string" && control !== "cancel2", cost_data: control };
        },
        async content(event, trigger, player) {
            let choice = event.cost_data;
            if (Array.isArray(choice)) {
                lib.skill.lena_huashen.addHuashens(player, 3);
                [choice] = choice;
            }
            _status.noclearcountdown = true;
            const id = lib.status.videoId++,
                prompt = choice === "替换当前化身" ? "化身：请选择你要更换的武将牌" : "化身：选择制衡至多两张武将牌";
            const cards = player.storage.lena_huashen.character;
            if (player.isOnline2()) {
                player.send(
                    (cards, prompt, id) => {
                        const dialog = ui.create.dialog(prompt, [cards, lib.skill.lena_huashen.$createButton]);
                        dialog.videoId = id;
                    },
                    cards,
                    prompt,
                    id
                );
            }
            const dialog = ui.create.dialog(prompt, [cards, lib.skill.lena_huashen.$createButton]);
            dialog.videoId = id;
            if (!event.isMine()) {
                dialog.style.display = "none";
            }
            if (choice === "替换当前化身") {
                const buttons = dialog.content.querySelector(".buttons");
                const array = dialog.buttons.filter(item => !item.classList.contains("nodisplay") && item.style.display !== "none");
                const choosed = player.storage.lena_huashen.choosed;
                const groups = array
                    .map(i => get.character(i.link).group)
                    .unique()
                    .sort((a, b) => {
                        const getNum = g => (lib.group.includes(g) ? lib.group.indexOf(g) : lib.group.length);
                        return getNum(a) - getNum(b);
                    });
                if (choosed.length > 0 || groups.length > 1) {
                    dialog.style.bottom = (parseInt(dialog.style.top || "0", 10) + get.is.phoneLayout() ? 230 : 220) + "px";
                    dialog.addPagination({
                        data: array,
                        totalPageCount: groups.length + Math.sign(choosed.length),
                        container: dialog.content,
                        insertAfter: buttons,
                        onPageChange(state) {
                            const { pageNumber, data, pageElement } = state;
                            const { groups, choosed } = pageElement;
                            data.forEach(item => {
                                item.classList[
                                    (() => {
                                        const name = item.link,
                                            goon = choosed.length > 0;
                                        if (goon && pageNumber === 1) {
                                            return choosed.includes(name);
                                        }
                                        const group = get.character(name).group;
                                        return groups.indexOf(group) + (1 + goon) === pageNumber;
                                    })()
                                        ? "remove"
                                        : "add"
                                ]("nodisplay");
                            });
                            ui.update();
                        },
                        pageLimitForCN: ["←", "→"],
                        pageNumberForCN: (choosed.length > 0 ? ["常用"] : []).concat(
                            groups.map(i => {
                                const isChineseChar = char => {
                                    const regex = /[\u4e00-\u9fff\u3400-\u4dbf\ud840-\ud86f\udc00-\udfff\ud870-\ud87f\udc00-\udfff\ud880-\ud88f\udc00-\udfff\ud890-\ud8af\udc00-\udfff\ud8b0-\ud8bf\udc00-\udfff\ud8c0-\ud8df\udc00-\udfff\ud8e0-\ud8ff\udc00-\udfff\ud900-\ud91f\udc00-\udfff\ud920-\ud93f\udc00-\udfff\ud940-\ud97f\udc00-\udfff\ud980-\ud9bf\udc00-\udfff\ud9c0-\ud9ff\udc00-\udfff]/u;
                                    return regex.test(char);
                                }; //友情提醒：regex为基本汉字区间到扩展G区的Unicode范围的正则表达式，非加密/混淆
                                const str = get.plainText(lib.translate[i + "2"] || lib.translate[i] || "无");
                                return isChineseChar(str.slice(0, 1)) ? str.slice(0, 1) : str;
                            })
                        ),
                        changePageEvent: "click",
                        pageElement: {
                            groups: groups,
                            choosed: choosed,
                        },
                    });
                }
            }
            const finish = () => {
                if (player.isOnline2()) {
                    player.send("closeDialog", id);
                }
                dialog.close();
                delete _status.noclearcountdown;
                if (!_status.noclearcountdown) {
                    game.stopCountChoose();
                }
            };
            while (true) {
                const next = player.chooseButton(true).set("dialog", id);
                if (choice === "制衡其他化身") {
                    next.set("selectButton", [1, 2]);
                    next.set("filterButton", button => button.link !== get.event().current);
                    next.set("current", player.storage.lena_huashen.current);
                } else {
                    next.set("ai", button => {
                        const { player, cond } = get.event();
                        let skills = player.storage.lena_huashen.character.map(i => get.character(i).skills).flat();
                        skills.randomSort();
                        skills.sort((a, b) => get.skillRank(b, cond) - get.skillRank(a, cond));
                        return player.storage.lena_huashen.map[button.link].includes(skills[0]) ? 2.5 : 1 + Math.random();
                    });
                    next.set("cond", event.triggername);
                }
                const result = await next.forResult();
                if (choice === "制衡其他化身") {
                    finish();
                    lib.skill.lena_huashen.removeHuashen(player, result.links);
                    lib.skill.lena_huashen.addHuashens(player, result.links.length);
                    return;
                } else {
                    const card = result.links[0];
                    const func = function (card, id) {
                        const dialog = get.idDialog(id);
                        if (dialog) {
                            //禁止翻页
                            const paginationInstance = dialog.paginationMap?.get(dialog.content.querySelector(".buttons"));
                            if (paginationInstance?.state) {
                                paginationInstance.state.pageRefuseChanged = true;
                            }
                            for (let i = 0; i < dialog.buttons.length; i++) {
                                if (dialog.buttons[i].link == card) {
                                    dialog.buttons[i].classList.add("selectedx");
                                } else {
                                    dialog.buttons[i].classList.add("unselectable");
                                }
                            }
                        }
                    };
                    if (player.isOnline2()) {
                        player.send(func, card, id);
                    } else if (event.isMine()) {
                        func(card, id);
                    }
                    const result2 = await player
                        .chooseControl(player.storage.lena_huashen.map[card], "返回")
                        .set("ai", () => {
                            const { player, cond, controls } = get.event();
                            let skills = controls.slice();
                            skills.randomSort();
                            skills.sort((a, b) => get.skillRank(b, cond) - get.skillRank(a, cond));
                            return skills[0];
                        })
                        .set("cond", event.triggername)
                        .forResult();
                    const control = result2.control;
                    if (control === "返回") {
                        const func2 = function (card, id) {
                            const dialog = get.idDialog(id);
                            if (dialog) {
                                //允许翻页
                                const paginationInstance = dialog.paginationMap?.get(dialog.content.querySelector(".buttons"));
                                if (paginationInstance?.state) {
                                    paginationInstance.state.pageRefuseChanged = false;
                                }
                                for (let i = 0; i < dialog.buttons.length; i++) {
                                    dialog.buttons[i].classList.remove("selectedx");
                                    dialog.buttons[i].classList.remove("unselectable");
                                }
                            }
                        };
                        if (player.isOnline2()) {
                            player.send(func2, card, id);
                        } else if (event.isMine()) {
                            func2(card, id);
                        }
                    } else {
                        finish();
                        player.storage.lena_huashen.choosed.add(card);
                        if (player.storage.lena_huashen.current != card) {
                            const old = player.storage.lena_huashen.current;
                            player.storage.lena_huashen.current = card;
                            game.broadcastAll(
                                (player, character, old) => {
                                    player.tempname.remove(old);
                                    player.tempname.add(character);
                                },
                                player,
                                card,
                                old
                            );
                        }
                        player.storage.lena_huashen.current2 = control;
                        if (!player.additionalSkills.lena_huashen?.includes(control)) {
                            player.flashAvatar("lena_huashen", card);
                            player.syncStorage("lena_huashen");
                            player.updateMarks("lena_huashen");
                            await player.addAdditionalSkills("lena_huashen", control);
                        }
                        return;
                    }
                }
            }
        },
        init(player, skill) {
            if (!player.storage[skill]) {
                player.storage[skill] = {
                    character: [],
                    choosed: [],
                    map: {},
                };
            }
        },
        banned: ["lisu", "sp_xiahoudun", "xushao", "jsrg_xushao", "zhoutai", "old_zhoutai", "shixie", "xin_zhoutai", "dc_shixie", "old_shixie"],
        bannedType: ["Charlotte", "主公技", "觉醒技", "限定技", "隐匿技", "使命技"],
        addHuashen(player) {
            if (!player.storage.lena_huashen) {
                return;
            }
            if (!_status.characterlist) {
                game.initCharactertList();
            }
            _status.characterlist.randomSort();
            for (let i = 0; i < _status.characterlist.length; i++) {
                let name = _status.characterlist[i];
                if (name.indexOf("zuoci") != -1 || name.indexOf("key_") == 0 || name.indexOf("sp_key_") == 0 || get.is.double(name) || lib.skill.lena_huashen.banned.includes(name) || player.storage.lena_huashen.character.includes(name)) {
                    continue;
                }
                let skills = lib.character[name][3].filter(skill => {
                    const categories = get.skillCategoriesOf(skill, player);
                    return !categories.some(type => lib.skill.lena_huashen.bannedType.includes(type));
                });
                if (skills.length) {
                    player.storage.lena_huashen.character.push(name);
                    player.storage.lena_huashen.map[name] = skills;
                    _status.characterlist.remove(name);
                    return name;
                }
            }
        },
        addHuashens(player, num) {
            var list = [];
            for (var i = 0; i < num; i++) {
                var name = lib.skill.lena_huashen.addHuashen(player);
                if (name) {
                    list.push(name);
                }
            }
            if (list.length) {
                player.syncStorage("lena_huashen");
                player.updateMarks("lena_huashen");
                game.log(player, "获得了", get.cnNumber(list.length) + "张", "#g化身");
                lib.skill.lena_huashen.drawCharacter(player, list);
            }
        },
        removeHuashen(player, links) {
            player.storage.lena_huashen.character.removeArray(links);
            _status.characterlist.addArray(links);
            game.log(player, "移去了", get.cnNumber(links.length) + "张", "#g化身");
        },
        drawCharacter(player, list) {
            game.broadcastAll(
                function (player, list) {
                    if (player.isUnderControl(true)) {
                        var cards = [];
                        for (var i = 0; i < list.length; i++) {
                            var cardname = "huashen_card_" + list[i];
                            lib.card[cardname] = {
                                fullimage: true,
                                image: "character:" + list[i],
                            };
                            lib.translate[cardname] = get.rawName2(list[i]);
                            cards.push(game.createCard(cardname, "", ""));
                        }
                        player.$draw(cards, "nobroadcast");
                    }
                },
                player,
                list
            );
        },
        $createButton(item, type, position, noclick, node) {
            node = ui.create.buttonPresets.character(item, "character", position, noclick);
            const info = lib.character[item];
            const skills = info[3].filter(function (skill) {
                const categories = get.skillCategoriesOf(skill, get.player());
                return !categories.some(type => lib.skill.lena_huashen.bannedType.includes(type));
            });
            if (skills.length) {
                const skillstr = skills.map(i => `[${get.translation(i)}]`).join("<br>");
                const skillnode = ui.create.caption(`<div class="text" data-nature=${get.groupnature(info[1], "raw")}m style="font-family: ${lib.config.name_font || "xinwei"},xinwei">${skillstr}</div>`, node);
                skillnode.style.left = "2px";
                skillnode.style.bottom = "2px";
            }
            node._customintro = function (uiintro, evt) {
                const character = node.link,
                    characterInfo = get.character(node.link);
                let capt = get.translation(character);
                if (characterInfo) {
                    capt += `&nbsp;&nbsp;${get.translation(characterInfo.sex)}`;
                    let charactergroup;
                    const charactergroups = get.is.double(character, true);
                    if (charactergroups) {
                        charactergroup = charactergroups.map(i => get.translation(i)).join("/");
                    } else {
                        charactergroup = get.translation(characterInfo.group);
                    }
                    capt += `&nbsp;&nbsp;${charactergroup}`;
                }
                uiintro.add(capt);

                if (lib.characterTitle[node.link]) {
                    uiintro.addText(get.colorspan(lib.characterTitle[node.link]));
                }
                for (let i = 0; i < skills.length; i++) {
                    if (lib.translate[skills[i] + "_info"]) {
                        let translation = lib.translate[skills[i] + "_ab"] || get.translation(skills[i]).slice(0, 2);
                        if (lib.skill[skills[i]] && lib.skill[skills[i]].nobracket) {
                            uiintro.add('<div><div class="skilln">' + get.translation(skills[i]) + "</div><div>" + get.skillInfoTranslation(skills[i]) + "</div></div>");
                        } else {
                            uiintro.add('<div><div class="skill">【' + translation + "】</div><div>" + get.skillInfoTranslation(skills[i]) + "</div></div>");
                        }
                        if (lib.translate[skills[i] + "_append"]) {
                            uiintro._place_text = uiintro.add('<div class="text">' + lib.translate[skills[i] + "_append"] + "</div>");
                        }
                    }
                }
            };
            return node;
        },
        mark: true,
        intro: {
            onunmark(storage, player) {
                _status.characterlist.addArray(storage.character);
                storage.character = [];
                const name = player.name ? player.name : player.name1;
            },
            mark(dialog, storage, player) {
                if (storage && storage.current) {
                    dialog.addSmall([[storage.current], (item, type, position, noclick, node) => lib.skill.lena_huashen.$createButton(item, type, position, noclick, node)]);
                }
                if (storage && storage.current2) {
                    dialog.add('<div><div class="skill">【' + get.translation(lib.translate[storage.current2 + "_ab"] || get.translation(storage.current2).slice(0, 2)) + "】</div><div>" + get.skillInfoTranslation(storage.current2, player) + "</div></div>");
                }
                if (storage && storage.character.length) {
                    if (player.isUnderControl(true)) {
                        dialog.addSmall([storage.character, (item, type, position, noclick, node) => lib.skill.lena_huashen.$createButton(item, type, position, noclick, node)]);
                    } else {
                        dialog.addText("共有" + get.cnNumber(storage.character.length) + "张“化身”");
                    }
                } else {
                    return "没有化身";
                }
            },
            content(storage, player) {
                return "共有" + get.cnNumber(storage.character.length) + "张“化身”";
            },
            markcount(storage, player) {
                if (storage && storage.character) {
                    return storage.character.length;
                }
                return 0;
            },
        },
    },
    "lena_xinsheng": {
        inherit: "xinsheng",
        async content(event, trigger, player) {
            lib.skill.lena_huashen.addHuashens(player, 1);
        },
        ai: { combo: "lena_huashen" },
    },
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
            if (player.isMinHp(true) && player.isDamaged()) {
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
    },
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

            let bool1 = target1 != result.winner, bool2 = target2 != result.winner;
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
    }
};
export default skills;