import { lib, game, ui, get, ai, _status } from "../../noname.js";

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
};
export default originalSkills;
