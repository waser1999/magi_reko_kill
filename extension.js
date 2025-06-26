import { lib, game, ui, get, ai, _status } from "../../noname.js";
export const type = "extension";
export default function(){
	return {name:"魔法纪录",arenaReady:function () {

        },content:function (config, pack) {

        },prepare:function () {

        },precontent:function () {
            // 这里写势力
            game.addGroup("yuan", "见泷原", "圆环之理", { color: "#C71585" });
            game.addGroup("huan", "神盟", "神滨魔法联盟", { color: "#FF1493" });
            game.addGroup("ma", "玛吉斯", "玛吉斯之翼", { color: "#000000" });
            game.addGroup("faguo", "法国", "法兰西", { color: "#FFD700" });
            game.addGroup("ling", "鬼灯", "鬼灯势力", { color: "#808080" });
            game.addGroup("mao", "昴宿星团", "昴宿星团", { color: "#000000" });
        },help:{},config:{},package:{
    character: {
        character: {
            yuma: ["female","yuan",3,["zhijian","guzheng","wangxi"],["des:山猫冲击","ext:魔法纪录/yuma.jpg","die:ext:魔法纪录/audio/die/yuma.mp3"]],
            kirika: ["female","yuan",4,["xinshensu","ganglie"],["des:吸血鬼之牙","ext:魔法纪录/kirika.jpg","die:ext:魔法纪录/audio/die/kirika.mp3"]],
            oriko: ["female","yuan",3,["weimu","wansha","guicai","oriko_xianzhong"],["zhu","des:神谕光线","ext:魔法纪录/oriko.jpg","die:ext:魔法纪录/audio/die/oriko.mp3"]],
            ashley: ["female","huan",4,["zongkui","guju","baijia","bmcanshi"],["des:Ocean Tick Hurricane","ext:魔法纪录/ashley.jpg","die:ext:魔法纪录/audio/die/ashley.mp3"]],
            riko: ["female","huan",3,["dcduliang","retianxiang"],["des:美味猎手","ext:魔法纪录/riko.jpg","die:ext:魔法纪录/audio/die/riko.mp3"]],
            rika: ["female","huan",3,["ganlu","buyi","old_anxu","zhuiyi"],["des:闪耀光束","ext:魔法纪录/rika.jpg","die:ext:魔法纪录/audio/die/rika.mp3"]],
            tsuruno: ["female","huan",4,["qianxun","jiang","lianying","hunzi"],["des:炎扇斩舞","ext:魔法纪录/tsuruno.jpg","die:ext:魔法纪录/audio/die/tsuruno.mp3"]],
            sana: ["female","huan",3,["jushou","rezhenjun"],["des:酷刑牢笼","ext:魔法纪录/sana.jpg","die:ext:魔法纪录/audio/die/sana.mp3"]],
            iroha: ["female","huan",3,["haoshi","dimeng","lirang","dckrmingshi","yuanjiu"],["zhu","des:未来之路","ext:魔法纪录/iroha.jpg","die:ext:魔法纪录/audio/die/iroha.mp3"]],
            yachiyo: ["female","huan",4,["xingshang","fangzhu","songwei"],["des:绝对之雨","ext:魔法纪录/yachiyo.jpg","die:ext:魔法纪录/audio/die/yachiyo.mp3"]],
            felicia: ["female","huan",4,["repojun"],["des:超级大大锤","ext:魔法纪录/felicia.jpg","die:ext:魔法纪录/audio/die/felicia.mp3"]],
            toka: ["female","ma",3,["xinleiji","xinguidao","magius_jiefang","tianjie"],["zhu","ext:魔法纪录/toka.jpg","die:ext:魔法纪录/audio/die/toka.mp3"]],
            alina: ["female","ma",3,["moying","juanhui","rekuangcai","reshejian"],["ext:魔法纪录/alina.jpg","die:ext:魔法纪录/audio/die/alina.mp3"]],
            lena: ["female","huan",3,["huashen","xinsheng"],["des:无尽海神","ext:魔法纪录/lena.jpg","die:ext:魔法纪录/audio/die/lena.mp3"]],
            kaede: ["female","huan",3,["qingnang","jijiu","hongyan"],["des:大地审判","ext:魔法纪录/kaede.jpg","doublegroup:huan:ma","die:ext:魔法纪录/audio/die/kaede.mp3"]],
            momoko: ["female","huan",4,["qiangxix","gzbuqu"],["des:宇宙之刃","ext:魔法纪录/momoko.jpg","die:ext:魔法纪录/audio/die/momoko.mp3"]],
            asuka: ["female","huan",4,["wushuang","paoxiao"],["des:龙真螺旋咆击","ext:魔法纪录/asuka.jpg","die:ext:魔法纪录/audio/die/asuka.mp3"]],
            yueye: ["female","ma",5,["shuangxiong"],["des:樱隐","ext:魔法纪录/yueye.jpg","die:ext:魔法纪录/audio/die/yueye.mp3"]],
            yuexiao: ["female","ma",5,["fuhun"],["des:樱语","ext:魔法纪录/yuexiao.jpg","die:ext:魔法纪录/audio/die/yuexiao.mp3"]],
            madoka: ["female","yuan",3,["sbliegong","xieli"],["zhu","des:魔法之雨","ext:魔法纪录/madoka.jpg","die:ext:魔法纪录/audio/die/madoka.mp3"]],
            homura: ["female","yuan",3,["reguanxing","luoshen","longdan"],["des:导弹集中轰炸","ext:魔法纪录/homura.jpg","die:ext:魔法纪录/audio/die/homura.mp3"]],
            "homura2": ["female","yuan",3,["luoying","yiji","huoji"],["des:时间停止攻击","ext:魔法纪录/homura2.jpg","die:ext:魔法纪录/audio/die/homura2.mp3"]],
            nanaka: ["female","huan",3,["xiaoji","jizhi"],["des:白椿","ext:魔法纪录/nanaka.jpg","die:ext:魔法纪录/audio/die/nanaka.mp3"]],
            hazuki: ["female","huan",3,["huituo","mingjian","fangquan"],["des:雷霆激流","ext:魔法纪录/hazuki.jpg","die:ext:魔法纪录/audio/die/hazuki.mp3"]],
            karin: ["female","ma",3,["daoshu","weicheng"],["des:幽紫灵火","ext:魔法纪录/karin.jpg","doublegroup:huan:ma","die:ext:魔法纪录/audio/die/karin.mp3"]],
            nemu: ["female","ma",5,["resanyao","rezhiman","zhendu","qiluan","benghuai"],["ext:魔法纪录/nemu.jpg","die:ext:魔法纪录/audio/die/nemu.mp3"]],
            mami: ["female","yuan",4,["guose","luanji","qiaobian","yingzi"],["des:终幕射击","ext:魔法纪录/mami.jpg","die:ext:魔法纪录/audio/die/mami.mp3"]],
            kyoko: ["female","yuan",4,["tuntian","reguhuo","jixi"],["des:盟神决枪","ext:魔法纪录/kyoko.jpg","die:ext:魔法纪录/audio/die/kyoko.mp3"]],
            mabayu: ["female","yuan",3,["nzry_chenglve","nzry_cunmu","weidi","nzry_shicai"],["des:空洞人偶","ext:魔法纪录/mabayu.jpg","die:ext:魔法纪录/audio/die/mabayu.mp3"]],
            ren: ["female","huan",3,["xinwuyan","duanchang","zhichi"],["des:灵魂救赎","ext:魔法纪录/ren.jpg","die:ext:魔法纪录/audio/die/ren.mp3"]],
            "ulti_madoka": ["female","yuan",4,["shelie","gongxin","xieli"],["zhu","des:再也没有必要绝望了！","ext:魔法纪录/ulti_madoka.jpg","die:ext:魔法纪录/audio/die/ulti_madoka.mp3"]],
            sayaka: ["female","yuan",4,["xinkuanggu","gzyinghun","sayaka_yizhu"],["des:无畏极强音","ext:魔法纪录/sayaka.jpg","die:ext:魔法纪录/audio/die/sayaka.mp3"]],
            Kagome: ["female","huan",3,["nschenzhi","nsdianmo","nszaibi"],["ext:魔法纪录/Kagome.jpg","die:ext:魔法纪录/audio/die/Kagome.mp3"]],
            mifuyu: ["female","ma",3,["dcwumei","dczhanmeng"],["doublegroup:huan:ma"]],
            meru: ["female","huan",3,["shiming","jiangxi"],[]],
        },
        translate: {
            "2201_prefix": "神",
            "魔法纪录": "魔法纪录",
            yuma: "千岁由麻",
            kirika: "吴纪里香",
            oriko: "美国织莉子",
            ashley: "阿什莉·泰勒",
            riko: "千秋理子",
            rika: "绫野梨花",
            tsuruno: "由比鹤乃",
            sana: "二叶莎奈",
            iroha: "环彩羽",
            yachiyo: "七海八千代",
            felicia: "深月菲莉西亚",
            toka: "里见灯花",
            alina: "阿莉娜·格雷",
            lena: "水波玲奈",
            kaede: "秋野枫",
            momoko: "十咎桃子",
            asuka: "龙城明日香",
            yueye: "天音月夜",
            yuexiao: "天音月咲",
            madoka: "鹿目圆",
            homura: "晓美焰",
            "homura2": "麻花焰",
            nanaka: "常盘七香",
            hazuki: "游佐夜月",
            karin: "御园花凛",
            nemu: "柊音梦",
            mami: "巴麻美",
            kyoko: "佐仓杏子",
            mabayu: "爱生眩",
            ren: "五十铃怜",
            "ulti_madoka": "神鹿目圆",
            sayaka: "美树沙耶香",
            Kagome: "佐鸟笼目",
            mifuyu: "梓美冬",
            meru: "安名梅露",
        },
        perfectPair: {
            oriko: ["kirika"],
            kirika: ["oriko"],
            madoka: ["homura","mami","sayaka","homura2","ulti_madoka"],
            "ulti_madoka": ["sayaka","homura","madoka"],
            homura: ["madoka","homura2","ulti_madoka","kyoko","mabayu"],
            "homura2": ["madoka","mami","sayaka","homura"],
            mami: ["kyoko","mabayu","homura","madoka","sayaka"],
            kyoko: ["mami","homura","homura2","sayaka","yuma"],
            yuma: ["kyoko"],
            mabayu: ["mami","homura","homura2"],
            iroha: ["yachiyo","felicia","sana"],
            yachiyo: ["iroha","tsuruno","momoko","mifuyu","meru"],
            felicia: ["iroha","tsuruno"],
            tsuruno: ["felicia","yachiyo"],
            sana: ["iroha"],
            momoko: ["yachiyo","kaede","lena"],
            lena: ["momoko","kaede"],
            kaede: ["momoko","lena"],
            toka: ["alina","nemu"],
            alina: ["toka","nemu","karin"],
            nemu: ["alina","toka"],
            karin: ["alina"],
            nanaka: ["hazuki"],
            hazuki: ["nanaka"],
            yueye: ["yuexiao","mifuyu"],
            yuexiao: ["yueye"],
            ashley: ["riko"],
            riko: ["ashley"],
            rika: ["ren"],
            ren: ["rika"],
            mifuyu: ["yachiyo","toka","yueye"],
            meru: ["yachiyo"],
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
            "sayaka_yizhu": {
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
                "_priority": 0,
            },
            xieli: {
                group: ["xieli1"],
                zhuSkill: true,
                filter(event, player) {
                    if (!player.hasZhuSkill("xieli") || !game.hasPlayer(current => current != player && current.group == "yuan")) return false;
                    return !event.xieli && (event.type != "phase" || !player.hasSkill("xieli3"));
                },
                enable: ["chooseToUse","chooseToRespond"],
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
                        useful: [5,3,1],
                        value: [5,3,1],
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
                    player: ["useCardBegin","respondBegin"],
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
                    global: ["useCardAfter","useSkillAfter","phaseAfter"],
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
                    player: ["chooseToRespondBefore","chooseToUseBefore"],
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
                "audioname2": {
                    yuanshu: "weidi",
                },
            },
            "oriko_xianzhong": {
                zhuSkill: true,
                trigger: {
                    global: "damage",
                },
                filter(event, player) {
                    // 伤害为0时不触发
                    if (event.num <= 0) return false;
                    if (!player.hasZhuSkill("oriko_xianzhong")) return false;
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
        },
        translate: {
            "sayaka_yizhu": "义助",
            "sayaka_yizhu_info": "出牌阶段限一次，你可以弃置两张手牌并选择一名已经受伤的角色。你与其各回复1点体力。",
            xieli: "协力",
            "xieli_info": "主角技，当你需要使用或打出【杀】时，你可以令其他见泷原角色依次选择是否打出一张【杀】。若有角色响应，则你视为使用或打出了此【杀】。",
            yuanjiu: "援救",
            "yuanjiu_info": "主角技，当你需要使用或打出一张【闪】时，你可以令其他神盟角色选择是否打出一张【闪】。若有角色响应，则你视为使用或打出了一张【闪】。",
            "oriko_xianzhong": "献种",
            "oriko_xianzhong_info": "主角技，见泷原角色造成伤害后，其可以令你摸一张牌。",
            "magius_jiefang": "解放",
            "magius_jiefang_info": "主角技，其他玛吉斯之翼的角色出牌阶段限一次，该角色可以交给你一张【闪】或黑桃手牌。",
        },
    },
    intro: "",
    author: "Waser",
    diskURL: "",
    forumURL: "",
    version: "1.0",
},files:{"character":["ashley.jpg","yuma.jpg","kirika.jpg","riko.jpg","rika.jpg","oriko.jpg","toka.jpg","alina.jpg","nemu.jpg","tsuruno.jpg","Kagome.jpg","sana.jpg","iroha.jpg","felicia.jpg","kaede.jpg","momoko.jpg","asuka.jpg","yueye.jpg","yuexiao.jpg","madoka.jpg","homura.jpg","homura2.jpg","nanaka.jpg","karin.jpg","kyoko.jpg","mami.jpg","ren.jpg","mabayu.jpg","ulti_madoka.jpg","sayaka.jpg","yachiyo.jpg","lena.jpg","hazuki.jpg","mifuyu.jpg","meru.jpg"],"card":[],"skill":[],"audio":[]},connect:false} 
};