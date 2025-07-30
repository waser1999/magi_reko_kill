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
                player.line(trigger.player);
                trigger.player.die();
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
        }
    },
    "sayaka_qiangyin": {
        inherit: "jieyin",
        audio: "jieyin",
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
    xieli: {
        audio: "jijiang",
        group: ["xieli1"],
        zhuSkill: true,
        filter(event, player) {
            if (!player.hasZhuSkill("xieli") || !game.hasPlayer(current => current != player && current.group == "yuan")) return false;
            return !event.xieli && (event.type != "phase" || !player.hasSkill("xieli3"));
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
                if (!player.hasZhuSkill("xieli") || !game.hasPlayer(current => current != player && current.group == "yuan")) return false;
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
    "xieli1": {
        trigger: {
            player: ["useCardBegin", "respondBegin"],
        },
        logTarget: "targets",
        sourceSkill: "xieli",
        filter(event, player) {
            return event.skill == "xieli";
        },
        forced: true,
        async content(event, trigger, player) {
            delete trigger.skill;
            trigger.getParent().set("xieli", true);
            while (true) {
                if (event.current == undefined) event.current = player.next;
                if (event.current == player) {
                    player.addTempSkill("xieli3");
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
                    chooseToRespondEvent.set("xieli", true);
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
    "xieli3": {
        trigger: {
            global: ["useCardAfter", "useSkillAfter", "phaseAfter"],
        },
        silent: true,
        charlotte: true,
        sourceSkill: "xieli",
        filter(event) {
            return event.skill != "xieli";
        },
        async content(event, trigger, player) {
            player.removeSkill("xieli3");
        },
        forced: true,
        popup: false,
        "_priority": 1,
    },
    yuanjiu: {
        audio: "hujia",
        zhuSkill: true,
        trigger: {
            player: ["chooseToRespondBefore", "chooseToUseBefore"],
        },
        filter(event, player) {
            if (event.responded) return false;
            if (player.storage.yuanjiuing) return false;
            if (!player.hasZhuSkill("yuanjiu")) return false;
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
                if (!player.hasZhuSkill("yuanjiu")) return false;
                return game.hasPlayer(current => current != player && current.group == "huan");
            },
        },
        "_priority": 0,
    },
    "oriko_yuzhi": {
        group: ["oriko_yuzhi_1", "oriko_yuzhi_2", "oriko_yuzhi_use"],
        mark: true,
        marktext: "视",
        intro: {
            name: "未来视",
            content: "expansion",
            markcount: "expansion",
        },
        subSkill: {
            "1": {
                trigger: {
                    global: "phaseBegin",
                },
                forced: true,
                filter: function (event, player) {
                    return player.countExpansions("oriko_yuzhi") < game.players.length;
                },
                content: function () {
                    player.addToExpansion(get.cards()).gaintag.add("oriko_yuzhi");
                },
                sub: true,
                sourceSkill: "oriko_yuzhi",
                "_priority": 0,
            },
            "2": {
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
                        player.addToExpansion(result.cards).gaintag.add("oriko_yuzhi");
                    }
                }

            }
        },
        "_priority": 0,
    },
    "oriko_jiangsha": {
        trigger: {
            global: "judge",
        },
        direct: true,
        audio: ["guicai", 2],
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
        audio: "songwei",
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
        audio: "sbsongwei",
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
        audio: "xinhuangtian",
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
        "_priority": 0,
    },
    "nemu_zhiyao": {
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
        "_priority": 0,
    },
    "nemu_sanyao": {
        trigger: {
            global: "phaseBegin",
        },
        filter(event, player) {
            return player.hasMark("nemu_zhiyao");
        },
        async content(event, trigger, player) {
            let markNum = player.countMark("nemu_zhiyao");
            let choices = ["一个标记"]
            if (markNum >= 2) choices.push("两个标记");
            if (markNum >= 3) choices.push("三个标记");

            let choice = await player.chooseControl(choices)
                .set("ai", () => {
                    const target = _status.currentPhase;
                    let attitude = get.attitude(player, target);
                    let markNum = player.countMark("nemu_zhiyao");

                    if (markNum == 1 && attitude < 0 && (target.hp - player.hp >= 2 || target.hp == 1)) return "一个标记";
                    if (markNum >= 3 && attitude < 0 && target.hasSkillTag('threaten')) return "三个标记";
                    if (markNum >= 2 && ((attitude < 0 && target.countCards("j") == 0)) || (attitude > 0 && target.countCards("j") > 0)) return "两个标记";
                    return false;
                })
                .set("prompt", "请选择标记数")
                .forResult();

            if (choice.control) game.playAudio("skill/resanyao1.mp3");

            switch (choice.control) {
                case "一个标记":
                    trigger.player.damage();
                    player.line(trigger.player);
                    player.removeMark("nemu_zhiyao", 1);
                    break;
                case "两个标记":
                    let stage = await player.chooseControl(["判定阶段", "摸牌阶段", "出牌阶段", "弃牌阶段"])
                        .set("ai", () => {
                            const target = _status.currentPhase;
                            let attitude = get.attitude(player, target);
                            let markNum = player.countMark("nemu_zhiyao");

                            if (attitude > 0) {
                                if (target.countCards("j") > 0) return "判定阶段";
                                if (target.countCards("s") - target.hp >= 0) return "弃牌阶段";
                            }
                            if (attitude < 0) {
                                if (target.countCards("h") <= 1) return "摸牌阶段";
                                return "出牌阶段";
                            }
                            return false;
                        })
                        .set("prompt", "请选择跳过阶段")
                        .forResult();

                    game.log(player, "跳过了", trigger.player, "的" + stage.control);

                    switch (stage.control) {
                        case "判定阶段":
                            trigger.player.skip("phaseJudge");
                            break;
                        case "摸牌阶段":
                            trigger.player.skip("phaseDraw");
                            break;
                        case "出牌阶段":
                            trigger.player.skip("phaseUse");
                            break;
                        case "弃牌阶段":
                            trigger.player.skip("phaseDiscard");
                            break;
                    }

                    player.removeMark("nemu_zhiyao", 2);
                    player.line(trigger.player);
                    break;
                case "三个标记":
                    trigger.cancel();
                    trigger.player.turnOver();
                    player.removeMark("nemu_zhiyao", 3);
                    player.line(trigger.player);
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
        "_priority": 0,
    },
    "ashley_yuanyu": {
        audio: "zongkui",
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
                    audio: "bmcanshi",
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
                    if (target.name == "toka") return true;
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
    "ui_leshan": {
        enable: "phaseUse",
        filter(event, trigger, player) {
            return _status.event.player.countCards("h") > 5;
        },
        check(event, player) {
            return (game.hasPlayer(function (target) {
                return (
                    player !== target &&
                    !game.hasPlayer(function (current) {
                        return current !== player && current !== target && current.hp < target.hp;
                    }) &&
                    get.attitude(player, target) > 0
                )
            })
            );
        },
        async content(event, trigger, player) {
            const { result } = await player.chooseCardTarget({
                selectCard: Math.floor(player.countCards("h") / 2),
                filterTarget(card, player, target) {
                    return target.isMinHp() && target != player;
                },
                prompt: "将一半的手牌交给场上体力值最少的一名角色",
                forced: true,
                ai2(target) {
                    return get.attitude(_status.event.player, target);
                },
            });
            player.line(result.targets, "green");

            if (result.targets && result.targets[0]) {
                await player.give(result.cards, result.targets[0]);
                player.recover();
                result.targets[0].recover();
            }
        },
        ai: {
            threaten: 2,
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
            return event.result.judge * get.attitude(player, event.player) <= 0;
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
        audio: "jiuyuan",
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
        audio: "luoying",
        group: ["homura2_jihuo_discard", "homura2_jihuo_judge"],
        subfrequent: ["judge"],
        subSkill: {
            discard: {
                audio: "luoying",
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
                audio: "luoying",
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
    "dArc_congjun": {
        unique: true,
        forceunique: true,
        locked: true,
        init(player) {
            if (player.storage.dArc_congjun || ![player.name1, player.name2].includes("dArc")) {
                return false;
            }
            var change = function (target) {
                if (target == player) {
                    var list;
                    if (_status.connectMode) {
                        list = get.charactersOL();
                    } else {
                        list = get.gainableCharacters();
                    }
                    var name = list.randomGet();
                    var skill = get.character(name).skills.filter(skill => {
                        let info = get.info(skill);
                        return info && !info.hiddenSkill && !info.zhuSkill && !info.charlotte;
                    }).randomGet();
                    player.storage.dArc_congjun = skill;
                    player.addSkill(skill);
                    player._inits.remove(change);
                }
            };
            if (!player._inits) {
                player._inits = [];
            }
            player._inits.push(change);
        },
        subSkill: {
            show: {
                trigger: {
                    global: "useCard",
                },
                filter(event, player) {
                    return player.storage.dArc_congjun && event.card.name == "wuxie" && event.getRand() < 0.1 && player.getEnemies().includes(event.player);
                },
                direct: true,
                skillAnimation: true,
                animationColor: "thunder",
                content() {
                    "step 0";
                    game.delay(0.5);
                    "step 1";
                    player.logSkill("dArc_congjun_show");
                    "step 2";
                    player.removeSkill("dArc_congjun_show");
                    player.removeSkill(player.storage.dArc_congjun);
                    player.line(trigger.player, "green");
                    trigger.player.damage(2);
                },
                sub: true,
                sourceSkill: "dArc_congjun",
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
        getIndex(event, player) {
            const evt = event.getl(player);
            if (evt && evt.player === player && evt.es && evt.es.length) return 1;
            return false;
        },
    },
    "madoka_liegong": {
        audio: "sbliegong",
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
        content() {
            "step 0";
            player.judge(card => {
                if (player.storage.madoka_liegong?.includes(get.suit(card))) return 2;
                return -1;
            }).judge2 = function (result) {
                return result.bool;
            };
            "step 1";
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
        audio: "paoxiao",
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
                    if (player.getStorage("asuka_longzhen").length >= 4) player.recover();

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
    "kanagi_duxin": {
        audio: "shangyi",
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
        audio: "mingjian",
        content(event, trigger, player) {
            player.give(cards, target);
            target.insertPhase();
        },
        "_priority": 0,
    },
    "kaede_manmiao": {
        audio: "new_reqingnang",
        forced: true,
        charlotte: true,
        trigger: {
            player: "taoAfter",
        },
        group: ["kaede_manmiao_du"],
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
        }
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
        audio: "drlt_qianjie",
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
                    effect: {
                        target(card, player, target, current) {
                            if (get.tag(card, "turnOver")) {
                                return "zeroplayertarget";
                            }
                        },
                    },
                },
            },
        },
    },
    "rera_nuanxin": {
        inherit: "xinfu_jiyuan",
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
                    trigger.target.draw();
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
    "mami_qiaobian": {
        inherit: "qiaobian",
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
                    check = player.countCards("j");
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
        },
    },
    "homura_juwu": {
        audio: "luoshen",
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
            if (get.mode() != "guozhan" && !player.hasSkillTag("rejudge")) {
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
                player.chooseBool("是否再次发动【洛神】？").set("frequentSkill", "homura_juwu");
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
        audio: "dcsbyaozuo",
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
                audio: "dcsbyaozuo",
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
        audio: "gzquanji",
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
                    audio: "gzpaiyi",
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
                                if (player == target) {
                                    return 0;
                                }
                                if (get.attitude(player, target) < 0) return -3;
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
            if (target != player) {
                target.damage();
            }
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
            // get.tag()判断是伤害类锦囊牌
            return get.type(event.card) == "trick" && get.tag(event.card, "damage") && event.targets.length > 1 && event.player.isIn();
        },
        preHidden: true,
        async content(event, trigger, player) {
            const result = await player.chooseTarget("请选择“流离”的对象")
                .set("ai", target => {
                    var card = _status.event.getTrigger().card;
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
                    player.useSkill("rejijun");
                }
            }
        },
    },
};
export default skills;