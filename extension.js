import { lib, game, ui, get, ai, _status } from "../../noname.js";
export const type = "extension";
export default function () {
    return {
        name: "魔法纪录", arenaReady: function () {

        }, content: function (config, pack) {

        }, prepare: function () {

        }, precontent: function () {
            // 这里写势力
            game.addGroup("yuan", "圆", "见泷原小队", { color: "#C71585" });
            game.addGroup("huan", "环", "神滨魔法联盟", { color: "#FF1493" });
            game.addGroup("zhi", "织", "美国织莉子", { color: "#C0C0C0" });
            game.addGroup("ma", "玛", "玛吉斯之翼", { color: "#000000" });
            game.addGroup("faguo", "法", "法兰西", { color: "#FFD700" });
            game.addGroup("ling", "铃", "天乃铃音", { color: "#808080" });
            game.addGroup("mao", "昴", "昴宿星团", { color: "#000000" });
        }, help: {}, config: {}, package: {
            character: {
                character: {
                    "1001": ["female", "huan", 3, ["haoshi", "dimeng", "lirang", "dckrmingshi", "yuanjiu"], ["zhu", "des:未来之路", "ext:魔法纪录/1001.jpg", "die:ext:魔法纪录/audio/die/1001.mp3"]],
                    "1002": ["female", "huan", 4, ["xingshang", "fangzhu", "songwei"], ["des:绝对之雨", "ext:魔法纪录/1002.jpg", "die:ext:魔法纪录/audio/die/1002.mp3"]],
                    "1003": ["female", "huan", 4, ["qianxun", "jiang", "lianying", "hunzi"], ["des:炎扇斩舞", "ext:魔法纪录/1003.jpg", "die:ext:魔法纪录/audio/die/1003.mp3"]],
                    "1004": ["female", "huan", 3, ["jushou", "rezhenjun"], ["des:酷刑牢笼", "ext:魔法纪录/1004.jpg", "die:ext:魔法纪录/audio/die/1004.mp3"]],
                    "1005": ["female", "huan", 4, ["repojun"], ["des:超级大大锤", "ext:魔法纪录/1005.jpg", "die:ext:魔法纪录/audio/die/1005.mp3"]],
                    "1009": ["female", "huan", 3, ["huashen", "xinsheng"], ["des:无尽海神", "ext:魔法纪录/1009.jpg", "die:ext:魔法纪录/audio/die/1009.mp3"]],
                    "1010": ["female", "huan", 4, ["qiangxix", "gzbuqu"], ["des:宇宙之刃", "ext:魔法纪录/1010.jpg", "die:ext:魔法纪录/audio/die/1010.mp3"]],
                    "1011": ["female", "huan", 3, ["qingnang", "jijiu", "hongyan"], ["des:大地审判", "ext:魔法纪录/1011.jpg", "die:ext:魔法纪录/audio/die/1011.mp3","doublegroup:huan:ma"]],
                    "1012": ["female", "ma", 3, ["daoshu", "weicheng"], ["des:幽紫灵火", "ext:魔法纪录/1012.jpg", "doublegroup:huan:ma", "die:ext:魔法纪录/audio/die/1012.mp3"]],
                    "1013": ["female", "huan", 4, ["wushuang", "paoxiao"], ["des:龙真螺旋咆击", "ext:魔法纪录/1013.jpg", "die:ext:魔法纪录/audio/die/1013.mp3"]],
                    "1018": ["female", "ma", 5, ["shuangxiong"], ["des:樱隐", "ext:魔法纪录/1018.jpg", "die:ext:魔法纪录/audio/die/1018.mp3"]],
                    "1019": ["female", "ma", 5, ["fuhun"], ["des:樱语", "ext:魔法纪录/1019.jpg", "die:ext:魔法纪录/audio/die/1019.mp3"]],
                    "2001": ["female", "yuan", 3, ["sbliegong", "xieli"], ["zhu", "des:魔法之雨", "ext:魔法纪录/2001.jpg", "die:ext:魔法纪录/audio/die/2001.mp3"]],
                    "2002": ["female", "yuan", 3, ["reguanxing", "luoshen", "longdan"], ["des:导弹集中轰炸", "ext:魔法纪录/2002.jpg", "die:ext:魔法纪录/audio/die/2002.mp3"]],
                    "2003": ["female", "yuan", 3, ["luoying", "yiji", "huoji"], ["des:时间停止攻击", "ext:魔法纪录/2003.jpg", "die:ext:魔法纪录/audio/die/2003.mp3"]],
                    "2004": ["female", "yuan", 4, ["xinkuanggu", "gzyinghun", "sayaka_yizhu"], ["des:无畏极强音", "ext:魔法纪录/2004.jpg", "die:ext:魔法纪录/audio/die/2004.mp3"]],
                    "2005": ["female", "yuan", 4, ["guose", "luanji", "qiaobian", "yingzi"], ["des:终幕射击", "ext:魔法纪录/2005.jpg", "die:ext:魔法纪录/audio/die/2005.mp3"]],
                    "2006": ["female", "yuan", 4, ["tuntian", "zaoxian", "jixi", "xinxuanhuo"], ["des:盟神决枪", "ext:魔法纪录/2006.jpg", "die:ext:魔法纪录/audio/die/2006.mp3"]],
                    "2009": ["female", "yuan", 3, ["nzry_chenglve", "nzry_cunmu"], ["des:空洞人偶", "ext:魔法纪录/2009.jpg", "die:ext:魔法纪录/audio/die/2009.mp3"]],
                    "2201": ["female", "yuan", 4, ["shelie", "gongxin", "xieli"], ["zhu", "des:再也没有必要绝望了！", "ext:魔法纪录/2201.jpg", "die:ext:魔法纪录/audio/die/2201.mp3"]],
                    "3005": ["female", "huan", 3, ["xiaoji", "jizhi"], ["des:白椿", "ext:魔法纪录/3005.jpg", "die:ext:魔法纪录/audio/die/3005.mp3"]],
                    "3025": ["female", "huan", 3, ["xinwuyan", "duanchang", "zhichi"], ["des:灵魂救赎", "ext:魔法纪录/3025.jpg", "die:ext:魔法纪录/audio/die/3025.mp3"]],
                    "3027": ["female", "huan", 3, ["huituo", "mingjian", "fangquan"], ["des:雷霆激流", "ext:魔法纪录/3027.jpg", "die:ext:魔法纪录/audio/die/3027.mp3"]],
                    "3031": ["female", "huan", 3, ["ganlu", "buyi", "old_anxu", "zhuiyi"], ["des:闪耀光束", "ext:魔法纪录/3031.jpg", "die:ext:魔法纪录/audio/die/3031.mp3"]],
                    "3035": ["female", "huan", 3, ["dcduliang", "retianxiang"], ["des:美味猎手", "ext:魔法纪录/3035.jpg", "die:ext:魔法纪录/audio/die/3035.mp3"]],
                    "3052": ["female", "huan", 4, ["zongkui", "guju", "baijia", "bmcanshi"], ["des:Ocean Tick Hurricane", "ext:魔法纪录/3052.jpg", "die:ext:魔法纪录/audio/die/3052.mp3"]],
                    "4001": ["female", "zhi", 3, ["weimu", "wansha", "guicai", "fankui", "oriko_xianzhong"], ["zhu", "des:神谕光线"]],
                    "4002": ["female", "zhi", 4, ["xinshensu", "ganglie"], ["des:吸血鬼之牙", "ext:魔法纪录/4002.jpg", "die:ext:魔法纪录/audio/die/4002.mp3"]],
                    "4003": ["female", "yuan", 3, ["zhijian", "guzheng", "wangxi"], ["des:山猫冲击", "ext:魔法纪录/4003.jpg", "die:ext:魔法纪录/audio/die/4003.mp3", "doublegroup:yuan:zhi"]],
                },
                translate: {
                    "1001": "环彩羽",
                    "1002": "七海八千代",
                    "1003": "由比鹤乃",
                    "1004": "二叶莎奈",
                    "1005": "深月菲莉西亚",
                    "1009": "水波玲奈",
                    "1010": "十咎桃子",
                    "1011": "秋野枫",
                    "1012": "御园花凛",
                    "1013": "龙城明日香",
                    "1018": "天音月夜",
                    "1019": "天音月咲",
                    "2001": "鹿目圆",
                    "2002": "晓美焰",
                    "2003": "麻花焰",
                    "2004": "美树沙耶香",
                    "2005": "巴麻美",
                    "2006": "佐仓杏子",
                    "2009": "爱生眩",
                    "2201": "神鹿目圆",
                    "2201_prefix": "神",
                    "3005": "常盘七香",
                    "3025": "五十铃怜",
                    "3027": "游佐夜月",
                    "3031": "绫野梨花",
                    "3035": "千秋理子",
                    "3052": "阿什莉·泰勒",
                    "4001": "美国织莉子",
                    "4002": "吴纪里香",
                    "4003": "千岁由麻",
                    "魔法纪录": "魔法纪录",
                },
            },
            card: {
                card: {
                },
                translate: {
                },
                list: [],
            },
            skill: {
                skill: {
                    sayaka_yizhu: {
                        enable: "phaseUse",
                        filterCard: true,
                        usable: 1,
                        selectCard: 2,
                        check(card) {
                            const player = get.owner(card);
                            if (player.countCards("h") > player.hp) return 8 - get.value(card);
                            if (player.hp < player.maxHp) return 6 - get.value(card);
                            return 4 - get.value(card);
                        },
                        filterTarget(card, player, target) {
                            if (target.hp >= target.maxHp) return false;
                            if (target == player) return false;
                            return true;
                        },
                        async content(event, trigger, player) {
                            player.recover();
                            event.target.recover();
                        },
                        ai: {
                            order: 5.5,
                            result: {
                                player(player) {
                                    if (player.hp < player.maxHp) return 4;
                                    if (player.countCards("h") > player.hp) return 0;
                                    return -1;
                                },
                                target: 4,
                            },
                            threaten: 2,
                        },
                    },
                    xieli: {
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
                                    const { bool, card, cards } = await chooseToRespondEvent.forResult();
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
                            return event.skill != "xieli" && event.skill != "qinwang";
                        },
                        async content(event, trigger, player) {
                            player.removeSkill("xieli3");
                        },
                        forced: true,
                        popup: false,
                        "_priority": 1,
                    },
                    yuanjiu: {
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
                                if (!player.hasZhuSkill("hujia")) return false;
                                return game.hasPlayer(current => current != player && current.group == "wei");
                            },
                        },
                        "_priority": 0,
                    },
                    "oriko_xianzhong": {
                        group: "oriko_xianzhong2",
                        zhuSkill: true,
                    },
                    oriko_xianzhong2: {
                        //造成伤害时触发
                        trigger: { global: "damage" },
                        sourceSkill: "oriko_xianzhong",
                        filter(event, player) {
                            // 伤害为0时不触发
                            if (event.num <= 0) return false;
                            if (!player.hasZhuSkill("oriko_xianzhong")) return false;
                            return player.hasZhuSkill("oriko_xianzhong", event.player);
                        },
                        async cost(event, trigger, player) {
                            // 防止其他势力触发
                            if (!trigger.source || trigger.source.group != "zhi") return false;
                            event.result = await trigger.source
                                .chooseBool("是否发动【献种】，令" + get.translation(player) + "摸一张牌？")
                                .set("choice", get.attitude(trigger.source, player) > 0)
                                .forResult();
                        },
                        async content(event, trigger, player) {
                            trigger.source.line(player, "green");
                            player.draw();
                        },
                    },

                },
                translate: {
                    sayaka_yizhu: "义助",
                    "sayaka_yizhu_info": "出牌阶段限一次，你可以弃置两张手牌并选择一名已经受伤的角色。你与其各回复1点体力。",
                    xieli: "协力",
                    "xieli_info": "主角技，当你需要使用或打出【杀】时，你可以令其他见泷原小队角色依次选择是否打出一张【杀】。若有角色响应，则你视为使用或打出了此【杀】。",
                    yuanjiu: "援救",
                    "yuanjiu_info": "主角技，当你需要使用或打出一张【闪】时，你可以令其他神滨魔法联盟势力角色选择是否打出一张【闪】。若有角色响应，则你视为使用或打出了一张【闪】。",
                    "oriko_xianzhong": "献种",
                    "oriko_xianzhong_info": "主角技，织莉子势力的角色造成伤害后，其可以令你摸一张牌。",
                },
            },
            intro: "",
            author: "Waser",
            diskURL: "",
            forumURL: "",
            version: "1.0",
        }, files: { "character": ["1001.jpg", "1011.jpg", "2002.jpg", "3005.jpg", "1009.jpg", "1010.jpg", "1013.jpg", "2006.jpg", "2201.jpg", "3035.jpg", "1018.jpg", "2004.jpg", "4003.jpg", "1005.jpg", "1003.jpg", "2003.jpg", "3052.jpg", "1004.jpg", "1019.jpg", "2005.jpg", "3031.jpg", "4002.jpg", "3027.jpg", "3025.jpg", "1012.jpg", "2009.jpg", "2001.jpg", "1002.jpg", "4001.jpg"], "card": [], "skill": [], "audio": [] }, connect: false
    }
};