import { lib, game, ui, get, ai, _status } from "../../noname.js";
import skills from './skill.js';

const originalSkills = {
    // 自创武将
    "blue_haijing": {
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
                lib.inpile_nature.add("ice")
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
    "blue_bingjie": {
        trigger: {
            global: "damageBegin1",
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
        group: ["blue_bingjie_2", "blue_bingjie_3", "blue_bingjie_gain"],
        subSkill: {
            public: {
                charlotte: true,
                onremove: true,
                nopop: true,
            },
            2: {
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
                        if (rplayer.includes(player))
                            return false
                        let damageff = 0
                        const card = { name: "sha", isCard: true }
                        const card2 = { name: "sha", nature: "ice", isCard: true }
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
            3: {
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
    "blue_bingyuan": {
        skillAnimation: true,
        juexingji: true,
        derivation: ["blue_bingjing", "blue_donghai"],
        async content(event, trigger, player) {
            player.awakenSkill("blue_bingyuan")
            player.removeSkill("blue_bingjie")
            player.addSkill("blue_bingjing")
            player.addSkill("blue_donghai")
        }
    },
    "blue_bingjing": {
        trigger: { player: "damageBefore" },
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
            1: {
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
    "blue_donghai": {
        mark: true,
        marktext: "海",
        intro: {
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
            global: "damageBegin2",
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
        group: ["blue_donghai_gain", "blue_donghai_draw", "blue_donghai_die"],
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
    "ceobo_kuangai": {
        enable: "phaseUse",
        usable: 1,
        init(player) {
            player.storage.ceobo_kuangai = 1
        },
        mark: true,
        onremove: true,
        unique: true,
        filter(event, player) {
            switch (player.storage.ceobo_kuangai) {
                case 0:
                    return player.countCards("h", card => get.nature(card) && get.name(card) == "sha" && lib.filter.cardDiscardable(card, player)) && game.hasPlayer(target => target != player && player.canUse({ name: "sha", nature: "fire" }, target, false))
                case 1:
                    return player.countCards("h") > 0 && player.countCards("h", card => get.nature(card) && get.name(card) == "sha") <= 5 && game.hasPlayer(target => target != player)
                case 2:
                    return player.countCards("h") > 0 && game.hasPlayer(target => target != player)
                case 3:
                    return player.countCards("h", card => get.tag(card, "natureDamage"))
                case 4:
                    return game.hasPlayer(target => target != player && player.canUse({ name: "sha", nature: "fire" }, target, false))
                default:
                    return false
            }
        },
        async content(event, trigger, player) {
            const lv = player.storage.ceobo_kuangai
            const lvstr = "狂爱Lv" + lv + "："

            let target
            switch (lv) {
                case 1:
                case 2:
                case 3:
                    const result = await player.chooseTarget(true, lvstr + "请选择一名角色", function (card, player, target) {
                        return target != player || lv == 3
                    })
                        .set("ai", function (target) {
                            return get.attitude(player, target)
                        })
                        .forResult()
                    target = result.targets[0]
                    player.line(target, "green")
                    break
            }

            let aichoice
            const handct = player.countCards("h")
            const nums = [0, 1, 2, 3, 4, 5].slice(0, handct)
            switch (lv) {
                case 1:
                    const min = Math.max(0, Math.floor(handct / 3))
                    const max = Math.min(5, Math.floor(handct / 2))
                    aichoice = (Math.floor(Math.random() * (max - min + 1)) + min).toString()
                    break
                case 2:
                    aichoice = (handct < 8 ? Math.min(handct, 5) : 0).toString()
                    break
            }

            let choice
            switch (lv) {
                case 1:
                case 2:
                    choice = await target.chooseControl(nums)
                        .set("prompt", lvstr + "请猜测" + get.translation(player) + "持有的属性【杀】数量")
                        .set("choice", aichoice)
                        .set("ai", function () {
                            return _status.event.choice;
                        })
                        .forResultControl();
                    game.log(target, "猜测", player, "手牌中有", parseInt(choice), "张属性【杀】");
                    const handsn = player.getCards("h", card => get.nature(card) && get.name(card) == "sha")
                    if (handsn.length > 0) {
                        await player.showCards(handsn)
                    } else {
                        game.log(player, "手牌中没有属性【杀】");
                    }
                    break
                case 3:
                    player.showCards(player.getCards("h", card => get.tag(card, "natureDamage")))
                    break
            }

            //处理对敌人前的逻辑
            switch (lv) {
                case 0:
                    await player.discard(player.getCards("h", card => get.nature(card) && get.name(card) == "sha"))
                    break
                case 1:
                    const n = Math.abs(parseInt(choice) - player.countCards("h", card => get.nature(card) && get.name(card) == "sha"))
                    if (n != 0) {
                        const aick = game.hasPlayer(function (current) {
                            if (current == player || current == target)
                                return false
                            for (let i of lib.skill.ceobo_kuangai.libnatureaddice()) {
                                const card = { name: "sha", nature: i }
                                if (player.canUse(card, current, false) && get.effect(current, card, player, target) > 0)
                                    return true
                            }
                            return false
                        })
                        const discard = await target.chooseToDiscard(lvstr + "请弃置" + get.cnNumber(n) + "张牌，若不弃置则不触发后续", n, "he")
                            .set("goon", aick)
                            .set("ai", card => {
                                if (!_status.event.goon)
                                    return -99
                                return skills.duexcept_ai(8 - get.value(card, target), card, target)
                            })
                            .forResult()
                        if (!discard.bool) {
                            game.log(target, "拒绝弃牌，" + "#g【狂爱】" + "效果失效")
                            return
                        }
                    }
                    break
                case 2:
                    await target.draw(Math.abs(parseInt(choice) - player.countCards("h", card => get.nature(card) && get.name(card) == "sha")))
                    break
                case 3:
                    const m = player.countCards("h", card => get.tag(card, "natureDamage"))
                    await player.draw(m)
                    await target.draw(m)
                    break
            }

            let enemy
            switch (lv) {
                case 0:
                    enemy = await player.chooseTarget(true, lvstr + "请选择一名角色，" + get.translation(player) + "视为对其依次使用火【杀】雷【杀】冰【杀】", function (card, player, current) {
                        if (current == player)
                            return false
                        if (player.canUse({ name: "sha", nature: "fire" }, current, false))
                            return true
                        return false
                    }).set("ai", function (current) {
                        let num = 0
                        for (let i of lib.skill.ceobo_kuangai.libnatureaddice()) {
                            const card = { name: "sha", nature: i }
                            if (player.canUse(card, current, false))
                                num += get.effect(current, card, player, player)
                        }
                        return num
                    }).forResult()
                    break
                case 1:
                case 2:
                case 3:
                    enemy = await target.chooseTarget(lvstr + "请选择一名角色，" + get.translation(player) + "视为对其使用" + get.cnNumber(lv == 3 ? 2 : 1) + "张随机属性【杀】", function (card, player, current) {
                        if (current == player || current == target)
                            return false
                        for (let i of lib.skill.ceobo_kuangai.libnatureaddice())
                            if (player.canUse({ name: "sha", nature: i }, current, false))
                                return true
                        return false
                    })
                        .set("ai", function (current) {
                            let num = 0
                            for (let i of lib.skill.ceobo_kuangai.libnatureaddice()) {
                                const card = { name: "sha", nature: i }
                                if (player.canUse(card, current, false))
                                    num += get.effect(current, card, player, target)
                            }
                            return num
                        })
                        .forResult()
                    if (!enemy.bool) {
                        game.log(target, "不选择出【杀】对象，" + "#g【狂爱】" + "效果失效")
                        return
                    }
                    break
                case 4:
                    enemy = await player.chooseTarget(true, lvstr + "请选择一名角色", function (card, player, current) {
                        if (current == player)
                            return false
                        for (let i of lib.skill.ceobo_kuangai.libnatureaddice())
                            if (player.canUse({ name: "sha", nature: i }, current, false))
                                return true
                        return false
                    }).set("ai", function (current) {
                        let num = 0
                        for (let i of lib.skill.ceobo_kuangai.libnatureaddice()) {
                            const card = { name: "sha", nature: i }
                            if (i == "thunder")
                                if (player.canUse(card, current, false))
                                    num += get.effect(current, card, player, player)
                                else
                                    if (player.canUse(card, current, false))
                                        num += get.effect(current, card, player, player) * 2
                        }
                        return num
                    }).forResult()
                    break
            }

            const enemy0 = enemy.targets[0];
            switch (lv) {
                case 4:
                    if (enemy0.isIn() && player.canUse({ name: "sha", nature: "fire" }, enemy0, false))
                        await player.useCard({ name: "sha", nature: "fire" }, enemy0, false)
                    if (enemy0.isIn() && player.canUse({ name: "sha", nature: "ice" }, enemy0, false))
                        await player.useCard({ name: "sha", nature: "ice" }, enemy0, false)
                case 0:
                    if (enemy0.isIn() && player.canUse({ name: "sha", nature: "fire" }, enemy0, false))
                        await player.useCard({ name: "sha", nature: "fire" }, enemy0, false)
                    if (enemy0.isIn() && player.canUse({ name: "sha", nature: "thunder" }, enemy0, false))
                        await player.useCard({ name: "sha", nature: "thunder" }, enemy0, false)
                    if (enemy0.isIn() && player.canUse({ name: "sha", nature: "ice" }, enemy0, false))
                        await player.useCard({ name: "sha", nature: "ice" }, enemy0, false)
                    break
                case 1:
                case 2:
                case 3:
                    let nature = lib.skill.ceobo_kuangai.libnatureaddice();
                    for (let i of nature) {
                        if (player.canUse({ name: "sha", nature: i }, enemy0, false)) {
                            if (i == "ice" && lib.skill.ceobo_kuangai.randomnaturebluecheck(player)) {
                                nature = [i]
                                break
                            }
                        } else
                            nature.remove(i)
                    }
                    await player.useCard({ name: "sha", nature: nature.randomGet() }, enemy0, false)
                    if (lv == 3 && enemy0.isIn())
                        await player.useCard({ name: "sha", nature: nature.randomGet() }, enemy0, false)
                    break
            }
        },
        ai: {
            order: 8,
            result: {
                player(player) {
                    switch (player.storage.ceobo_kuangai) {
                        case 0:
                            return lib.skill.ceobo_kuangai.aicheckfunc(game.hasPlayer(function (target) {
                                if (target == player || !player.canUse({ name: "sha", nature: "fire" }, target, false))
                                    return false
                                let num = 0
                                for (let i of lib.skill.ceobo_kuangai.libnatureaddice()) {
                                    const card = { name: "sha", nature: i }
                                    if (player.canUse(card, target, false))
                                        num += get.effect(target, card, player, player)
                                }
                                return num > 0
                            }))
                        case 1:
                            const friendplayer = game.filterPlayer(function (target) {
                                return target != player && get.attitude(player, target) > 0
                            })
                            const n = lib.skill.ceobo_kuangai.aicheckfunc(friendplayer.length > 0 && game.hasPlayer(function (target) {
                                if (target == player || friendplayer.includes(target))
                                    return false
                                let num = 0
                                for (let i of lib.skill.ceobo_kuangai.libnatureaddice()) {
                                    const card = { name: "sha", nature: i }
                                    if (player.canUse(card, target, false))
                                        num += get.effect(target, card, player, player)
                                }
                                return num > 0
                            }))
                            return n
                        case 2:
                            return lib.skill.ceobo_kuangai.aicheckfunc(game.filterPlayer(function (target) {
                                return target != player && get.attitude(player, target) > 0
                            }))
                        case 3:
                            return 1
                        case 4:
                            return lib.skill.ceobo_kuangai.aicheckfunc(game.hasPlayer(function (target) {
                                if (target == player || !player.canUse({ name: "sha", nature: "fire" }, target, false))
                                    return false
                                let num = 0
                                for (let i of lib.skill.ceobo_kuangai.libnatureaddice()) {
                                    const card = { name: "sha", nature: i }
                                    if (i == "thunder")
                                        if (player.canUse(card, target, false))
                                            num += get.effect(target, card, player, player)
                                        else
                                            if (player.canUse(card, target, false))
                                                num += get.effect(target, card, player, player) * 2
                                }
                                return num > 0
                            }))
                        default:
                            return 0
                    }
                },
            },
        },
        libnatureaddice() {
            let nature = [...lib.inpile_nature]
            if (!nature.includes("ice"))
                nature.push("ice")
            nature.randomSort()
            return nature
        },
        randomnaturebluecheck(player) {
            return player.name == "ceobo" && game.hasPlayer2(target => target.name == "blue")
        },
        updatestoragekuangai(player, num) {
            const n = player.storage.ceobo_kuangai
            if (!n)
                return
            if (typeof num == "number")
                player.storage.ceobo_kuangai = num
            else if ((player.name == "ceobo" && game.hasPlayer(target => target.name == "blue")) || n < 3)
                player.storage.ceobo_kuangai++
            if (n != player.storage.ceobo_kuangai)
                game.log(player, "的【狂爱】等级变为", player.storage.ceobo_kuangai)
            player.updateMarks()
        },
        iceshaspecialdeal() {
            if (!lib.inpile_nature.includes("ice")) {
                game.broadcastAll(function () {
                    lib.inpile_nature.add("ice")
                })
            }
        },
        storagekuangaicheck(storage, ...numbers) {
            return numbers.some(n => n == storage)
        },
        aicheckfunc(filter) {
            return filter ? 1 : 0
        },
        group: ["ceobo_kuangai_add", "ceobo_kuangai_update", "ceobo_kuangai_sp"],
        subSkill: {
            add: {
                trigger: {
                    global: "damageEnd",
                },
                silent: true,
                filter(event, player) {
                    return event.nature && event.num > 0 && lib.skill.ceobo_kuangai.storagekuangaicheck(player.storage.ceobo_kuangai, 1, 2, 3, 4)
                },
                async content(event, trigger, player) {
                    let cardname = [['basic', '', 'sha', 'ice']]
                    if (!lib.skill.ceobo_kuangai.randomnaturebluecheck(player))
                        cardname = get.inpileVCardList(info => {
                            return get.tag({ name: info[2], nature: info[3], isCard: true }, "natureDamage")
                        });

                    if (!cardname.includes(['basic', '', 'sha', 'ice']))
                        cardname.push(['basic', '', 'sha', 'ice'])

                    let cards = [], ck = false
                    for (let i = 0; i < player.storage.ceobo_kuangai * trigger.num; i++) {
                        const name = cardname.randomGet()
                        cards.push(game.createCard2(name[2], "heart", 8, name[3]))
                        if (name[3] == 'ice')
                            ck = true
                    }

                    if (ck)
                        lib.skill.ceobo_kuangai.iceshaspecialdeal()

                    if (player.storage.ceobo_kuangai == 3) {
                        game.cardsGotoPile(cards, () => {
                            return ui.cardPile.childNodes[0];
                        });
                        game.log(player, "把", cards, "加入牌堆顶")
                    } else if (player.storage.ceobo_kuangai == 4) {
                        const cards2 = ["cardPile", "discardPile"].map(pos => Array.from(ui[pos].childNodes)).flat()
                        const filter = card => get.suit(card) != "heart"
                        const cardx = cards2.filter(filter).randomGets(4);
                        if (cardx.length) {
                            await game.cardsGotoSpecial(cardx);
                            game.log(player, "把牌堆或弃牌堆的", cardx, "被移出了游戏");
                        }
                        game.cardsGotoPile(cards, () => {
                            return ui.cardPile.childNodes[0];
                        });
                        game.log(player, "把", cards, "加入牌堆顶")
                    } else {
                        game.cardsGotoPile(cards, () => {
                            return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
                        });

                        game.log(player, "把", cards, "加入牌堆的随机位置")
                    }
                }
            },
            sp: {
                trigger: {
                    source: "damageSource"
                },
                silent: true,
                filter(event, player) {
                    return player.storage.ceobo_kuangai == Math.ceil(Math.LN10) + Math.floor(Math.SQRT2) && event.nature
                },
                async content(event, trigger, player) {
                    await player.recover(trigger.num)
                    await player.draw(trigger.num)
                }
            },
            update: {
                trigger: {
                    global: ["loseAfter", "loseAsyncAfter", "cardsDiscardAfter"]
                },
                forced: true,
                filter(event, player) {
                    if (!event.getd()?.someInD("d") && !lib.skill.ceobo_kuangai.storagekuangaicheck(player.storage.ceobo_kuangai, 1, 2))
                        return false
                    let num = 0
                    for (let i of ui.discardPile.childNodes) {
                        if (get.name(i) == "sha" && get.nature(i)) {
                            num++
                            if ((num >= 8 && player.storage.ceobo_kuangai == 1) || (num >= 16 && player.storage.ceobo_kuangai == 2))
                                return true
                        }
                    }
                    return false
                },
                async content(event, trigger, player) {
                    let cards = []
                    for (let i of ui.discardPile.childNodes) {
                        if (get.name(i) == "sha" && get.nature(i))
                            cards.push(i)
                    }

                    game.cardsGotoPile(cards, () => {
                        return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
                    });

                    game.log(player, "把弃牌堆的", cards, "加入牌堆的随机位置")

                    lib.skill.ceobo_kuangai.updatestoragekuangai(player)
                }
            },
        },
        derivation: ["ceobo_kuangai_lv2", "ceobo_kuangai_lv3"],
        intro: {
            content(storage) {
                const lvstr = "你的狂爱等级为" + storage
                let info = ""
                if (lib.skill.ceobo_kuangai.storagekuangaicheck(storage, 1, 2)) {
                    let num = 0
                    for (let i of ui.discardPile.childNodes)
                        if (get.name(i) == "sha" && get.nature(i))
                            num++
                    info = ",弃牌堆中有" + num + "张属性【杀】"
                }
                return lvstr + info
            }
        },
    },
    "ceobo_qingmei": {
        dutySkill: true,
        forced: true,
        trigger: {
            source: "damageSource"
        },
        filter(event, player) {
            return event.nature
        },
        async content(event, trigger, player) {
            let card = game.createCard2("sha", "heart", 8, lib.skill.ceobo_kuangai.randomnaturebluecheck(player) ? "ice" : lib.skill.ceobo_kuangai.libnatureaddice()[0])

            if (card.nature == "ice")
                lib.skill.ceobo_kuangai.iceshaspecialdeal()

            await player.gain(card, "gain2")
        },
        group: ["ceobo_qingmei_achieve", "ceobo_qingmei_fail"],
        subSkill: {
            achieve: {
                trigger: { global: "die" },
                forced: true,
                filter(event, player) {
                    return event.getParent("damage", true)?.nature
                },
                dutySkill: true,
                skillAnimation: true,
                async content(event, trigger, player) {
                    game.log(player, "使命成功")
                    player.awakenSkill("ceobo_qingmei")
                    player.addSkill("ceobo_renqing")
                    let cardname = get.inpileVCardList()

                    if (!cardname.includes(['basic', '', 'sha', 'ice']))
                        cardname.push(['basic', '', 'sha', 'ice'])

                    let cards = [], ck = false
                    for (let i = 0; i < 4; i++) {
                        const card = cardname.randomGet()
                        cards.push(game.createCard2(card[2], "heart", 8, card[3]))
                        if (card[3] == "ice")
                            ck = true
                    }

                    if (ck)
                        lib.skill.ceobo_kuangai.iceshaspecialdeal()
                    await player.gain(cards, "gain2")

                    lib.skill.ceobo_kuangai.updatestoragekuangai(player)
                    await game.delayx();
                }
            },
            fail: {
                trigger: { global: "die" },
                forced: true,
                filter(event, player) {
                    const evt = event.getParent("damage", true)
                    return evt && !evt.nature && evt.source == player
                },
                dutySkill: true,
                async content(event, trigger, player) {
                    game.log(player, "使命失败")
                    player.awakenSkill("ceobo_qingmei")
                    lib.skill.ceobo_kuangai.updatestoragekuangai(player, 0)
                    await game.delayx();
                }
            }
        },
        derivation: ["ceobo_kuangai_lv0", "ceobo_renqing"]
    },
    "ceobo_renqing": {
        async init(player) {
            let n = 0
            let cardsname = get.inpileVCardList(info => {
                const card = { name: info[2], nature: info[3], isCard: true }
                return ['火', '雷', '冰'].some(char => (!lib.skill.ceobo_kuangai.randomnaturebluecheck(player) || info[0] == 'equip') && (get.translation(card).includes(char) || get.cardDescription(card, player).includes(char)))
            })

            if (lib.skill.ceobo_kuangai.randomnaturebluecheck(player)) {
                const n = cardsname.length
                for (let i = 0; i < n + 3; i++)
                    cardsname.push(['basic', '', 'sha', 'ice'])
            } else {
                if (!cardsname.includes(['basic', '', 'sha', 'ice']))
                    cardsname.push(['basic', '', 'sha', 'ice'])
                const old = [...cardsname]
                for (let i of old)
                    if (i[2] == 'sha' && i[3]) {
                        cardsname.push([i[0], i[1], i[2], i[3]])
                        cardsname.push([i[0], i[1], i[2], i[3]])
                        cardsname.push([i[0], i[1], i[2], i[3]])
                    }
            }
            cardsname.randomSort()

            const targets = game.filterPlayer().sortBySeat()
            for (let i = 0; i < targets.length; i++) {
                const cards = targets[i].getCards("ej");
                if (cards.length > 0) {
                    n += cards.length
                    await targets[i].discard(cards);
                    await game.delayx()
                }
            }

            let cards2 = ["cardPile", "discardPile"].map(pos => Array.from(ui[pos].childNodes)).flat()
            const filter = card => get.type(card) == "equip" && !get.subtypes(card).includes("equip2")
            const cardx = cards2.filter(filter);
            cards2 = cards2.filter(card => !filter(card))
            if (cardx.length) {
                n += cardx.length
                await game.cardsGotoSpecial(cardx);
                game.log(player, "把牌堆或弃牌堆的", cardx, "被移出了游戏");
            }

            let cardsn = cards2.filter(card => !get.tag(card, "natureDamage"))
            if (cardsn.length) {
                cardsn = cardsn.randomGets(Math.floor(Math.random() * cardsn.length) + 1)
                n += cardsn.length
                await game.cardsGotoSpecial(cardsn);
                game.log(player, "随机把牌堆或弃牌堆的", cardsn, "被移出了游戏");
            }

            if (n > 0 && cardsname.length) {
                let newcards = [], ck = false

                for (let i = 0; i < n; i++) {
                    const name = cardsname.randomGet()
                    newcards.push(game.createCard2(name[2], "heart", 8, name[3]))
                    if (name[3] == 'ice')
                        ck = true
                }
                if (ck)
                    lib.skill.ceobo_kuangai.iceshaspecialdeal()

                game.cardsGotoPile(newcards, () => {
                    return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
                });

                function countElements(x) {
                    const countMap = new Map();

                    for (const item of x) {
                        let key = get.translation(item);
                        countMap.set(key, (countMap.get(key) || 0) + 1);
                    }

                    const result = [];
                    for (const [element, count] of countMap) {
                        result.push([element, count]);
                    }

                    return result;
                }
                const logMessages = countElements(newcards).map(([element, count]) => `${count}张${get.translation(element)}`);
                game.log(player, "把", `#y${logMessages.join('、')}`, "加入牌堆的随机位置");
            }

        },
        forced: true,
        trigger: {
            source: "damageSource"
        },
        filter(event, player) {
            return event.nature
        },
        async content(event, trigger, player) {
            const targets = game.filterPlayer().sortBySeat()
            for (let i of targets) {
                const card = get.cardPile(card => get.tag(card, "natureDamage"))
                if (card) {
                    await i.gain(card, "gain2")
                    await game.delayx()
                } else
                    break
            }
        },
        group: ["ceobo_renqing_imm"],
        subSkill: {
            imm: {
                trigger: { player: "damageBefore" },
                filter(event) {
                    return event.card?.suit == "heart"
                },
                forced: true,
                content() {
                    trigger.cancel();
                },
                ai: {
                    effect: {
                        target(card, player, target, current) {
                            if (get.suit(card) == "heart" && get.tag(card, "damage")) {
                                return "zeroplayertarget";
                            }
                        },
                    },
                },
            }
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

	// 陈瑞麒
	"Ruiqi_zhengzhao": {
		audio: "ext:魔法纪录/audio/skill:2",
		trigger: { player: "phaseJudgeEnd" },
		forced: true,
		filter: function(event, player) {
			var limit = typeof player.getHandcardLimit === "function" ? player.getHandcardLimit() : player.hp;
			return limit > 0;
		},
		content: async function(event, trigger, player) {
			var limit = typeof player.getHandcardLimit === "function" ? player.getHandcardLimit() : player.hp;
			if (limit <= 0) return;
			var cards = get.cards(limit);
			await game.cardsGotoOrdering(cards);
			
			var hNum = player.countCards("h");
			var selected = [];
			
			var next = player.chooseCardButton("征兆：请按顺序选择要【蓄谋】的牌（字数 ≤ " + (hNum - 1) + "）", cards, [1, cards.length])
				.set("filterButton", function(button) {
					var len = get.cardNameLength ? get.cardNameLength(button.link) : get.translation(button.link.name).length;
					return len <= (_status.event.hNum - 1); 
				}).set("hNum", hNum).set("ai", function(button) { 
					var val = get.value(button.link);
					var name = button.link.name;
					if (name === 'sha' || name === 'tao' || name === 'jiu' || name === 'wuxiekeji' || name === 'shan') val += 15;
					return val; 
				});
			var res = await next.forResult();
			
			if(res.bool && res.links && res.links.length > 0) {
				for (var i = 0; i < res.links.length; i++) {
					var c = res.links[i];
					cards.remove(c);
					selected.push(c);
					await player.addJudge({ name: "xumou_jsrg" }, [c]);
					game.log(player, "将", c, "置入了判定区作为【蓄谋】");
					await game.delay(0.5); 
				}
			}
			
			if (cards.length > 0) {
				var moveRes = await player.chooseToMove("征兆：将剩余的牌置于牌堆顶或牌堆底", true)
					.set("list", [["牌堆顶", cards], ["牌堆底", []]])
					.set("processAI", function(list) {
						return [list[0][1], []]; 
					}).forResult();
					
				if (moveRes && moveRes.moved) {
					var top = moveRes.moved[0];
					var bottom = moveRes.moved[1];
					top.reverse();
					game.cardsGotoPile(top.concat(bottom), ["top_cards", top], function(event, card) {
						if (event.top_cards.includes(card)) return ui.cardPile.firstChild;
						return null;
					});
				}
			}
		},
		mod: {
			maxHandcard: function(player, num) {
				return num + player.countMark("Ruiqi_tingzheng_plus") - player.countMark("Ruiqi_haipo_minus");
			}
		}
	},

	"Ruiqi_haipo": {
		audio: "ext:魔法纪录/audio/skill:2",
		group: ["Ruiqi_haipo_blocker", "Ruiqi_haipo_counter"],
		subSkill: {
			blocker: {
				trigger: { player: ["useCard1", "respond"] },
				forced: true, silent: true,
				filter: function(event, player) { 
					var pCards = event.cards && event.cards.length > 0 ? event.cards : (event.card && event.card.cards ? event.card.cards : []);
					if (event.card && event.card.Ruiqi_tingzheng_cards) pCards = event.card.Ruiqi_tingzheng_cards;
					return pCards.length > 0; 
				},
				content: function(event, trigger, player) {
					var getRealNames = function(cardsList) {
						var res = [];
						for (var c of cardsList) {
							if (c.cards && c.cards.length > 0) res.addArray(getRealNames(c.cards));
							else if (c.name) res.push(c.name);
						}
						return res;
					};
					
					var pCards = trigger.cards && trigger.cards.length > 0 ? trigger.cards : (trigger.card && trigger.card.cards ? trigger.card.cards : [trigger.card]);
					if (trigger.card && trigger.card.Ruiqi_tingzheng_cards) pCards = trigger.card.Ruiqi_tingzheng_cards;
					
					var names = getRealNames(pCards);
					if (names.length === 0) return;
					
					game.filterPlayer(current => current != player).forEach(p => {
						p.addTempSkill("Ruiqi_haipo_silence", ["useCardAfter", "respondAfter"]);
						if (!p.storage.Ruiqi_haipo_silence) p.storage.Ruiqi_haipo_silence = [];
						for(var name of names) {
							if(!p.storage.Ruiqi_haipo_silence.includes(name)) p.storage.Ruiqi_haipo_silence.push(name);
						}
					});
					
					var transNames = names.map(n => get.translation(n)).join("】、【");
					game.log(player, "实体牌【" + transNames + "】的同名牌已被", "#g【骇破】", "锁定，其他角色暂时无法使用或打出！");
				}
			},
			silence: {
				charlotte: true, onremove: true,
				mod: {
					cardEnabled: function(card, player) {
						if (player.storage.Ruiqi_haipo_silence && player.storage.Ruiqi_haipo_silence.includes(card.name)) return false;
					},
					cardUsable: function(card, player) {
						if (player.storage.Ruiqi_haipo_silence && player.storage.Ruiqi_haipo_silence.includes(card.name)) return false;
					},
					cardRespondable: function(card, player) {
						if (player.storage.Ruiqi_haipo_silence && player.storage.Ruiqi_haipo_silence.includes(card.name)) return false;
					}
				}
			},
			counter: {
				trigger: { global: "useCard1" }, 
				filter: function(event, player) {
					if (event.player === player || !event.card) return false;
					var jCards = player.getCards("j");
					for (var i = 0; i < jCards.length; i++) {
						var realName = jCards[i].name;
						if (jCards[i].cards && jCards[i].cards.length > 0) realName = jCards[i].cards[0].name;
						if (realName === event.card.name) return true;
					}
					return false;
				},
				cost: async function(event, trigger, player) {
					var promptStr = "骇破：是否减少1点手牌上限并弃置判定区的【" + get.translation(trigger.card.name) + "】，令其无效？";
					var res = await player.chooseBool(promptStr).set("ai", function() {
						var p = _status.event.player;
						var source = _status.event.source;
						var triggerCard = _status.event.triggerCard;
						
						var limit = typeof p.getHandcardLimit === "function" ? p.getHandcardLimit() : p.hp;
						var isEmergency = false;
						
						// ai逻辑
						if (p.hp <= 2) isEmergency = true;
						game.countPlayer(function(current){
							if (get.attitude(p, current) > 0 && current.hp <= 2) isEmergency = true;
						});
						
						if (limit < 3 && !isEmergency) return false;
						
						if (triggerCard.name === 'tao' && get.attitude(p, source) < 0) return true;
						
						var eff = get.effect(p, triggerCard, source, p);
						if (eff < 0) return true;
						
						return false;
					}).set("triggerCard", trigger.card).set("source", trigger.player).forResult();
					
					if (res.bool) event.result = { bool: true };
				},
				content: async function(event, trigger, player) {
					player.addMark("Ruiqi_haipo_minus", 1, false);
					
					var targetCard = null;
					var jCards = player.getCards("j");
					for (var i = 0; i < jCards.length; i++) {
						var realName = jCards[i].name;
						if (jCards[i].cards && jCards[i].cards.length > 0) realName = jCards[i].cards[0].name;
						if (realName === trigger.card.name) {
							targetCard = jCards[i];
							break;
						}
					}
					if (targetCard) await player.discard(targetCard);
					
					var targets = trigger.targets.slice(); 
					var isDamage = get.tag(trigger.card, "damage");
					
					trigger.cancel();
					trigger.targets.length = 0;
					trigger.all_excluded = true;
					game.log(trigger.card, "被", "#g【骇破】", "骇客入侵，此牌无效！");
					
					if (isDamage) {
						var toDraw = targets.slice();
						toDraw.push(player);
						toDraw = toDraw.unique().filter(p => p.isAlive());
						if (toDraw.length > 0) {
							game.log(toDraw, "各摸了一张牌");
							await game.asyncDraw(toDraw, 1);
						}
					}
				}
			}
		}
	},
	"Ruiqi_tingzheng": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		filter: function(event, player) {
			var zones = 0;
			if (player.countCards("h") > 0) zones++;
			if (player.countCards("e") > 0) zones++;
			if (player.countCards("j") > 0) zones++;
			return zones >= 2;
		},
		content: async function(event, trigger, player) {
			var hej = player.getCards("hej");
			var next = player.chooseCardButton("霆铮：选择不同区域的两张牌", hej, 2).set("filterButton", function(button) {
				if (ui.selected.buttons.length === 0) return true;
				return get.position(button.link, true) !== get.position(ui.selected.buttons[0].link, true);
			}).set("ai", function(button) { 
				var c = button.link;
				var val = 8 - get.value(c);
				var pos = get.position(c, true);
				var realName = c.cards && c.cards.length ? c.cards[0].name : c.name;
				
				if (pos === 'j') {
					if (realName === 'sha' || realName === 'tao' || realName === 'jiu' || realName === 'wuxiekeji') return -20; 
				}
				if (pos === 'h' || pos === 'e') {
					if (realName === 'shan' || realName === 'sha') val += 5; 
				}
				return val;
			});
			
			var res1 = await next.forResult();
			if(!res1.bool || !res1.links || res1.links.length < 2) return;
			
			var selectedCards = res1.links;
			var c1 = selectedCards[0], c2 = selectedCards[1];
			var name1 = c1.cards && c1.cards.length ? c1.cards[0].name : c1.name;
			var name2 = c2.cards && c2.cards.length ? c2.cards[0].name : c2.name;
			
			var len1 = get.cardNameLength ? get.cardNameLength({name:name1}) : get.translation(name1).length;
			var len2 = get.cardNameLength ? get.cardNameLength({name:name2}) : get.translation(name2).length;
			var maxLen = len1 + len2;
			
			var usedNames = player.getStorage("Ruiqi_tingzheng_used") || [];
			var list = [];
			for (let name of lib.inpile) {
				var type = get.type(name);
				if ((type === "basic" || type === "trick") && !usedNames.includes(name)) {
					var nLen = get.cardNameLength ? get.cardNameLength({name: name}) : get.translation(name).length;
					if (nLen <= maxLen) {
						list.push([type === "basic" ? "基本" : "锦囊", "", name]);
						if (name === "sha") {
							for(let nature of lib.inpile_nature) list.push(["基本", "", "sha", nature]);
						}
					}
				}
			}
			
			if (list.length === 0) {
				game.log(player, "没有可转化的牌名或本回合已全部转化过");
				return;
			}
			
			var next2 = player.chooseButton(["霆铮：请选择要转化的牌（字数 ≤ " + maxLen + "）", [list, "vcard"]]).set("ai", function(button) {
				var vName = button.link[2];
				var vCard = { name: vName, nature: button.link[3], isCard: true };
				var val = _status.event.player.getUseValue(vCard);
				
				if (vName === 'wuzhongshengyou' || vName === 'shunshouqianyang') val += 15;
				
				var sc = _status.event.selectedCards;
				var hasShan = sc.some(c => (c.cards && c.cards.length ? c.cards[0].name : c.name) === 'shan');
				var hasSha = sc.some(c => (c.cards && c.cards.length ? c.cards[0].name : c.name) === 'sha');
				
				if (hasShan && vName === 'wanjianqifa') val += 20;
				if (hasSha && (vName === 'nanmanruqin' || vName === 'juedou')) val += 20;
				
				return val;
			}).set("selectedCards", selectedCards);
			
			var res2 = await next2.forResult();
			if(!res2.bool || !res2.links || res2.links.length === 0) return;
			
			var vName = res2.links[0][2];
			var vNature = res2.links[0][3];
			var vLen = get.cardNameLength ? get.cardNameLength({name: vName}) : get.translation(vName).length;
			
			var vCard = { name: vName, nature: vNature, isCard: true, Ruiqi_tingzheng_cards: selectedCards };
			
			var useRes = player.chooseUseTarget(vCard, false).set("prompt", "霆铮：请为【" + get.translation(vName) + "】指定目标");
			await useRes;
			
			if (useRes.result && useRes.result.bool) {
				player.$throw(selectedCards, 1000);
				await player.loseToDiscardpile(selectedCards);
				
				player.addMark("Ruiqi_tingzheng_plus", 1, false);
				game.log(player, "手牌上限 +1");
				
				if (vLen === maxLen) {
					await player.draw(1);
					game.log(player, "转化牌名字数等同于两张牌字数之和，摸了一张牌");
				}
				
				player.addTempSkill("Ruiqi_tingzheng_clear", "phaseAfter");
				player.markAuto("Ruiqi_tingzheng_used", [vName]);
			}
		},
		ai: {
			order: 8,
			result: { 
				player: function(player) {
					var hasLowHpEnemy = game.hasPlayer(function(current){
						return get.attitude(player, current) < 0 && current.hp <= 2;
					});
					var cardsCount = player.countCards("hej");
					if (!hasLowHpEnemy && cardsCount <= 4) return 0; 
					return 1;
				}
			}
		},
		group: "Ruiqi_tingzheng_clear",
		subSkill: {
			clear: {
				charlotte: true,
				trigger: { global: "phaseAfter" },
				forced: true, silent: true,
				content: function(event, trigger, player) {
					player.unmarkAuto("Ruiqi_tingzheng_used", player.getStorage("Ruiqi_tingzheng_used"));
				}
			}
		}
	},


	// 辺銀啾啾
	"Kyukyu_tongxin": {
		trigger: { player: "phaseBegin" },
		filter: function(event, player) { return game.hasPlayer(t => t != player); },
		forced: true,
		content: async function(event, trigger, player) {
			var res = await player.chooseTarget("同心：请选择一名角色与之同心", 1, lib.filter.notMe).set("ai", function(target) {
				var p = _status.event.player;
				var att = get.attitude(p, target);
				if (att <= 0) return 0; 
				var score = att;
				if (target.hp <= 2) score += 5; 
				if (target.countCards('h') <= 2) score += 3; 
				return score;
			}).forResult();
			if (res.bool && res.targets && res.targets.length > 0) {
				var target = res.targets[0];
				player.storage.Kyukyu_tongxin_target = target;
				player.markSkill("Kyukyu_tongxin");
				game.log(player, "与", target, "达成了", "#p【同心】");
			}
		},
		onremove: function(player) { delete player.storage.Kyukyu_tongxin_target; },
		mark: true,
		marktext: "心",
		intro: {
			content: function(storage, player) {
				var t = player.storage.Kyukyu_tongxin_target;
				return t ? "当前同心角色：" + get.translation(t) : "无";
			}
		}
	},
	"Kyukyu_yimeng": {
		audio: "ext:魔法纪录/audio/skill:2",
		enable: "phaseUse",
		usable: 2,
		filterTarget: function(card, player, target) { return true; }, 
		filterCard: true,
		selectCard: 1,
		position: "h",
		prompt: "遗梦：将一张手牌置于一名角色的判定区。黑当兵粮，红当乐不思蜀。",
		check: function(card) { return 6 - get.value(card); },
		content: async function(event, trigger, player) {
			var target = event.targets[0];
			var card = event.cards[0];
			var color = get.color(card);
			
			await target.addJudge({ name: color === "red" ? "lebu" : "bingliang" }, [card]);
			
			if (color === "black") {
				await target.recover(1);
			} else if (color === "red") {
				await target.draw(2);
			}
			
			if (!target.hasSkill("Kyukyu_dun")) target.addSkill("Kyukyu_dun");
			target.addMark("Kyukyu_dun", 1);
			target.update(); 
			game.log(target, "被精神污染，获得了 1 枚", "#y【钝】", "标记");
		},
		ai: {
			order: 1, 
			result: {
				target: function(player, target) {
					var card = ui.selected.cards[0];
					var color = get.color(card);
					var att = get.attitude(player, target);
					
					var migeUses = player.getStat('skill').Kyukyu_mige_use || 0;
					var canCleanse = migeUses < 2 || player.hasCard('wuxiekeji', 'h');

					if (att > 0) { 
						// 对友ai
						if (target.countCards('j') > 0 && !canCleanse) return 0; 
						// 贴乐
						if (color === "red") return 2; 
						// 贴兵
						if (color === "black" && target.hp < target.maxHp) return 1.5; 
						return 0.1;
					} else { 
						// 对敌ai
						var isHealthy = target.hp >= 3 && target.countCards('h') >= 3;
						if (isHealthy) return 1; 
						
						if (color === "red") { 
							// 贴乐
							if (target.hp <= 2) return 1.5; 
							return 1;
						} else { 

							if (target.countCards('h') <= 2 && target.hp <= 2) return 1.2; 
							return -1; 
						}
					}
				}
			}
		}
	},
	"Kyukyu_mige": {
		audio: "ext:魔法纪录/audio/skill:2",
		group: ["Kyukyu_mige_tx", "Kyukyu_mige_use", "Kyukyu_mige_tongxin_effect"],
		subSkill: {
			tx: {
				trigger: { player: "phaseBegin" },
				filter: function(event, player) {
					if (!game.hasPlayer(current => current !== player)) return false;
					return true;
				},
				forced: true,
				ruleSkill: true,
				content: async function(event, trigger, player) {
					const targets = await player.chooseTarget(
						"请选择你的“同心”角色",
						function(card, player, target) {
							return player != target;
						},
						1
					).set("ai", function(target) {
						var p = _status.event.player;
						var att = get.attitude(p, target);
						if (att <= 0) return 0; 
						var score = att;
						if (target.hp <= 2) score += 5; 
						if (target.countCards('h') <= 2) score += 3; 
						return score;
					}).forResultTargets();
					
					if (!targets || !targets.length) return;
					player.line(targets, "green");
					game.log(player, "选择了", targets, "作为自己的同心角色");
					player.markSkill("Kyukyu_mige_tx");
					player.storage.Kyukyu_mige_txWith = targets;
					
					player.when({ player: "phaseBegin" }, false)
						.assign({ firstDo: true })
						.then(() => {
							delete player.storage.Kyukyu_mige_txWith;
							player.unmarkSkill("Kyukyu_mige_tx");
						})
						.finish();
					await game.delayx();
				},
				marktext: "心",
				aiCheck: [null],
				intro: {
					name: "同心",
					content: function(_, player) {
						return `当前同心角色：${get.translation(player.getStorage("Kyukyu_mige_txWith"))}`;
					}
				}
			},
			use: {
				trigger: { global: "phaseJudgeBefore" },
				usable: 2,
				filter: function(event, player) {
					return event.player.countCards("ej") > 0;
				},
				cost: async function(event, trigger, player) {
					var res = await player.chooseBool("弥歌：是否视为对 " + get.translation(trigger.player) + " 使用一张【瞒天过海】？").set("ai", function() {
						var p = _status.event.player;
						var t = _status.event.target;
						if (get.attitude(p, t) > 0) {
							return t.countCards('j') > 0; 
						}
						return false;
					}).set("target", trigger.player).forResult();
					if (res.bool) event.result = { bool: true };
				},
				content: async function(event, trigger, player) {
					var target = trigger.player;
					await player.useCard({ name: "dz_mantianguohai", isCard: true }, target, false);
					
					player.addMark("Kyukyu_mige_plus", 2, false);
					var tongxinTargets = player.storage.Kyukyu_mige_txWith;
					if (tongxinTargets && tongxinTargets.length > 0 && tongxinTargets[0].isAlive()) {
						tongxinTargets[0].addMark("Kyukyu_mige_plus", 2, false);
					}
					game.log(player, "与同心角色本回合手牌上限 +2");
				}
			},
			tongxin_effect: {
				trigger: { player: ["equipAfter", "loseAfter", "gainAfter", "addJudgeAfter"] },
				forced: true, silent: true,
				filter: function(event, player) {
					if (event.name === "equip" || event.name === "addJudge") return true;
					if (event.cards) {
						return event.cards.some(c => get.position(c, true) === "e" || get.position(c, true) === "j");
					}
					return false;
				},
				content: async function(event, trigger, player) {
					var targets = [player];
					var tongxinTargets = player.storage.Kyukyu_mige_txWith;
					if (tongxinTargets && tongxinTargets.length > 0 && tongxinTargets[0].isAlive()) {
						targets.push(tongxinTargets[0]);
					}
					
					for (var t of targets) {
						var res = await t.chooseControl(["基本牌", "锦囊牌", "装备牌"]).set("prompt", "弥歌同心：请选择获得一种类型的牌").set("ai", function() {
							var p = _status.event.player;
							// 找牌ai逻辑
							if (_status.currentPhase !== p && !p.hasCard(c => c.name === 'shan', 'h')) return "基本牌";
							
							var tongxinTgt = p.storage.Kyukyu_mige_txWith ? p.storage.Kyukyu_mige_txWith[0] : null;
							var lowHp = p.hp <= 2 || (tongxinTgt && tongxinTgt.hp <= 2);
							if (lowHp) return "基本牌";
							
							if (!p.hasCard(c => get.type(c) === 'equip', 'e')) return "装备牌";
							return "锦囊牌";
						}).forResult();
						var type = res.control === "基本牌" ? "basic" : (res.control === "锦囊牌" ? "trick" : "equip");
						var card = get.cardPile(c => get.type(c) === type || (type === "trick" && get.type(c) === "delay"));
						
						if (card) {
							var otherNames = t.getCards("hej").map(x => {
								if (x.cards && x.cards.length > 0) return x.cards[0].name;
								return x.name;
							}); 
							await t.gain(card, "gain2");
							
							if (!otherNames.includes(card.name)) {
								t.addTempSkill("Kyukyu_mige_dist", "useCardAfter");
								var useRes = await t.chooseToUse("弥歌：你可以使用一张无视距离的【杀】", function(c, p, evt) {
									if (get.name(c) !== 'sha') return false;
									return lib.filter.cardEnabled(c, p, evt);
								}).set('targetRequired', true).set('complexCard', true).set('ai1', function(c){
									return _status.event.player.getUseValue(c);
								}).forResult();
								
								t.removeSkill("Kyukyu_mige_dist");
								if (useRes && useRes.bool) {
									game.log(t, "同心爆发，使用了一张无视距离的【杀】");
								}
							}
						}
					}
				}
			}
		},
		mod: {
			maxHandcard: function(player, num) {
				return num + player.countMark("Kyukyu_mige_plus");
			}
		}
	},

	"Kyukyu_mige_dist": {
		charlotte: true,
		mod: {
			targetInRange: function(card, player, target) {
				if (card.name === "sha") return true;
			}
		}
	},
	"Kyukyu_dun": {
		mark: true,
		marktext: "钝",
		intro: { content: "拥有 # 枚钝标记，使用单体锦囊或基本牌将随机重定向！" },
		trigger: { global: "useCard" },
		forced: true,
		filter: function(event, player) {
			if (player.countMark("Kyukyu_dun") === 0) return false;
			var type = get.type(event.card);
			if (type !== "basic" && type !== "trick" && type !== "delay") return false;
			if (event.targets.length !== 1) return false;
			if (_status.dying && _status.dying.length > 0) return false;
			return true;
		},
		content: async function(event, trigger, player) {
			var source = trigger.player;
			source.removeMark("Kyukyu_dun", 1);
			var oldTarget = trigger.targets[0];
			
			var allLegals = game.filterPlayer(current => lib.filter.targetEnabled2(trigger.card, source, current));
			if (allLegals.length > 0) {
				trigger.targets.remove(oldTarget);
				var newTarget = allLegals.randomGet();
				trigger.targets.push(newTarget);
				trigger.target = newTarget;
				source.line(newTarget, "fire");
				game.log(trigger.card, "受到", "#y【钝】", "的干扰，目标被随机改为了", newTarget);
				
				if (newTarget === oldTarget) {
					game.log("目标未发生实质改变，", source, "遭到反噬！");
					await source.loseHp(1);
					var phaseUse = trigger.getParent("phaseUse");
					if (phaseUse && phaseUse.player === source) {
						phaseUse.skipped = true;
						game.log(source, "的出牌阶段被强制结束");
					}
				}
			}
		}
	},
};

export default originalSkills;
