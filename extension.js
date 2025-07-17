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
            game.addGroup("wan", "万方", "万方之人", { color: "#FF8C00" });
            // 特殊标记高亮
            lib.namePrefix.set("DP", { color: "#FFD700" });
            lib.namePrefix.set("圣", { color: "#FFD700" });
            lib.namePrefix.set("谣", { color: "#FFD700" });
            lib.namePrefix.set("神使", { color: "#FFD700" });
        },help:{},config:{},package:{
    character: {
        character: {
            yuma: ["female","yuan",3,["zhijian","guzheng","wangxi"],["des:山猫冲击","ext:魔法纪录/image/yuma.jpg","die:ext:魔法纪录/audio/die/yuma.mp3"]],
            kirika: ["female","yuan",4,["xinshensu","ganglie","shebian"],["des:吸血鬼之牙","ext:魔法纪录/image/kirika.jpg","die:ext:魔法纪录/audio/die/kirika.mp3"]],
            oriko: ["female","yuan",3,["oriko_yuzhi","oriko_jiangsha","weimu","oriko_xianzhong"],["zhu","des:神谕光线","ext:魔法纪录/image/oriko.jpg","die:ext:魔法纪录/audio/die/oriko.mp3"]],
            ashley: ["female","huan",4,["ashley_yuanyu","ashley_mengshu"],["des:Ocean Tick Hurricane","ext:魔法纪录/image/ashley.jpg","die:ext:魔法纪录/audio/die/ashley.mp3"]],
            riko: ["female","huan",3,["dcduliang","dctunchu","dcshuliang"],["des:美味猎手","ext:魔法纪录/image/riko.jpg","die:ext:魔法纪录/audio/die/riko.mp3"]],
            rika: ["female","huan",3,["wanwei","spyuejian","reguose","tianxiang"],["des:闪耀光束","ext:魔法纪录/image/rika.jpg","die:ext:魔法纪录/audio/die/rika.mp3"]],
            tsuruno: ["female","huan",4,["jiang","lianying","hunzi","drlt_qianjie"],["des:炎扇斩舞","ext:魔法纪录/image/tsuruno.jpg","die:ext:魔法纪录/audio/die/tsuruno.mp3"]],
            sana: ["female","huan",4,["sana_touming","xinjushou","xinjiewei"],["des:酷刑牢笼","ext:魔法纪录/image/sana.jpg","die:ext:魔法纪录/audio/die/sana.mp3"]],
            iroha: ["female","huan",3,["olhaoshi","oldimeng","dckrmingshi","yuanjiu"],["zhu","des:未来之路","ext:魔法纪录/image/iroha.jpg","die:ext:魔法纪录/audio/die/iroha.mp3"]],
            yachiyo: ["female","huan",4,["xingshang","fangzhu","yachiyo_gujun"],["zhu","des:绝对之雨","ext:魔法纪录/image/yachiyo.jpg","die:ext:魔法纪录/audio/die/yachiyo.mp3"]],
            felicia: ["female","huan",4,["repojun","reyicong"],["des:超级大大锤","ext:魔法纪录/image/felicia.jpg","die:ext:魔法纪录/audio/die/felicia.mp3"]],
            toka: ["female","ma",3,["xinleiji","xinguidao","tianjie","magius_jiefang"],["zhu","des:新创世纪","ext:魔法纪录/image/toka.jpg","die:ext:魔法纪录/audio/die/toka.mp3"]],
            alina: ["female","ma",3,["moying","juanhui","reshejian"],["des:九相","ext:魔法纪录/image/alina.jpg","die:ext:魔法纪录/audio/die/alina.mp3"]],
            lena: ["female","huan",3,["rehuashen","rexinsheng"],["des:无尽海神","ext:魔法纪录/image/lena.jpg","die:ext:魔法纪录/audio/die/lena.mp3"]],
            kaede: ["female","huan",3,["jijiu","hongyan","xinbuyi","dczhuiyi"],["doublegroup:huan:ma","des:大地审判","ext:魔法纪录/image/kaede.jpg","die:ext:魔法纪录/audio/die/kaede.mp3"]],
            momoko: ["female","huan",4,["qiangxix","buqu"],["des:宇宙之刃","ext:魔法纪录/image/momoko.jpg","die:ext:魔法纪录/audio/die/momoko.mp3"]],
            asuka: ["female","huan",4,["kurou","wushuang"],["des:龙真螺旋咆击","ext:魔法纪录/image/asuka.jpg","die:ext:魔法纪录/audio/die/asuka.mp3"]],
            yueye: ["female","ma",5,["olshuangxiong"],["des:樱隐","ext:魔法纪录/image/yueye.jpg","die:ext:魔法纪录/audio/die/yueye.mp3"]],
            yuexiao: ["female","ma",5,["olfuhun"],["des:樱语","ext:魔法纪录/image/yuexiao.jpg","die:ext:魔法纪录/audio/die/yuexiao.mp3"]],
            madoka: ["female","yuan",3,["madoka_liegong","madoka_yingbian","xieli"],["zhu","des:魔法之雨","ext:魔法纪录/image/madoka.jpg","die:ext:魔法纪录/audio/die/madoka.mp3"]],
            homura: ["female","yuan",3,["reguanxing","luoshen","homura_shiting"],["des:导弹集中轰炸","ext:魔法纪录/image/homura.jpg","die:ext:魔法纪录/audio/die/homura.mp3"]],
            "homura2": ["female","yuan",3,["homura2_jihuo","yiji","huoji"],["des:时间停止攻击","ext:魔法纪录/image/homura2.jpg","die:ext:魔法纪录/audio/die/homura2.mp3"]],
            nanaka: ["female","huan",3,["nanaka_xiaoji","jizhi"],["des:白椿","ext:魔法纪录/image/nanaka.jpg","die:ext:魔法纪录/audio/die/nanaka.mp3"]],
            hazuki: ["female","huan",3,["huituo","mingjian","fangquan"],["des:雷霆激流","ext:魔法纪录/image/hazuki.jpg","die:ext:魔法纪录/audio/die/hazuki.mp3"]],
            karin: ["female","ma",3,["daoshu","weicheng"],["des:幽紫灵火","ext:魔法纪录/image/karin.jpg","doublegroup:huan:ma","die:ext:魔法纪录/audio/die/karin.mp3"]],
            nemu: ["female","ma",5,["nemu_zhiyao","nemu_sanyao","nemu_tiruo"],["des:创造的孩子们","ext:魔法纪录/image/nemu.jpg","die:ext:魔法纪录/audio/die/nemu.mp3"]],
            mami: ["female","yuan",4,["guose","reyingzi","sbluanji","qiaobian"],["des:终幕射击","ext:魔法纪录/image/mami.jpg","die:ext:魔法纪录/audio/die/mami.mp3"]],
            kyoko: ["female","yuan",4,["oltuntian","reguhuo","jixi"],["des:盟神决枪","ext:魔法纪录/image/kyoko.jpg","die:ext:魔法纪录/audio/die/kyoko.mp3"]],
            mabayu: ["female","yuan",3,["nzry_chenglve","nzry_cunmu","nzry_shicai","mabayu_jingxiang"],["zhu","des:空洞人偶","ext:魔法纪录/image/mabayu.jpg","die:ext:魔法纪录/audio/die/mabayu.mp3"]],
            ren: ["female","huan",3,["xinwuyan","olbeige","duanchang"],["des:灵魂救赎","ext:魔法纪录/image/ren.jpg","die:ext:魔法纪录/audio/die/ren.mp3"]],
            "ulti_madoka": ["female","yuan",4,["twshelie","twgongxin","xieli"],["zhu","des:再也没有必要绝望了！","ext:魔法纪录/image/ulti_madoka.jpg","die:ext:魔法纪录/audio/die/ulti_madoka.mp3"]],
            sayaka: ["female","yuan",4,["xinkuanggu","gzyinghun","sayaka_qiangyin"],["des:无畏极强音","ext:魔法纪录/image/sayaka.jpg","die:ext:魔法纪录/audio/die/sayaka.mp3"]],
            Kagome: ["female","huan",3,["hschenzhi","hsdianmo","hszaibi","reqingguo"],["ext:魔法纪录/image/Kagome.jpg","die:ext:魔法纪录/audio/die/Kagome.mp3"]],
            mifuyu: ["female","ma",3,["dcwumei","dczhanmeng"],["doublegroup:huan:ma","ext:魔法纪录/image/mifuyu.jpg","die:ext:魔法纪录/audio/die/mifuyu.mp3"]],
            meru: ["female","huan",3,["zhiming","xingbu"],["des:","ext:魔法纪录/image/meru.jpg","die:ext:魔法纪录/audio/die/meru.mp3"]],
            kazumi: ["female","wan",3,["qixing","kuangfeng","dawu","kazumi_xingyun"],["zhu","ext:魔法纪录/image/kazumi.jpg","die:ext:魔法纪录/audio/die/kazumi.mp3"]],
            kushu: ["female","huan",4,["jiushi","keji","refankui"],["des:肃清天使","ext:魔法纪录/image/kushu.jpg","die:ext:魔法纪录/audio/die/kushu.mp3"]],
            kokoro: ["female","huan",5,["jieyue","yizhong"],["des:离散镭射","ext:魔法纪录/image/kokoro.jpg","die:ext:魔法纪录/audio/die/kokoro.mp3"]],
            ayame: ["female","huan",4,["tianyi","hanzhan"],["des:未确认飞行火焰","ext:魔法纪录/image/ayame.jpg","die:ext:魔法纪录/audio/die/ayame.mp3"]],
            hanna: ["female","ma",3,["reluanwu","xinjuece","dcmieji","dcfencheng"],["des:噩梦毒针","ext:魔法纪录/image/hanna.jpg","die:ext:魔法纪录/audio/die/hanna.mp3"]],
            kuroe: ["female","ma",4,["qingbei","dcsuishi"],["doublegroup:huan:ma","des:灾难盛宴","ext:魔法纪录/image/kuroe.jpg","die:ext:魔法纪录/audio/die/kuroe.mp3"]],
            "anime_iroha": ["female","huan",3,["ani_lieying","yuanjiu","test_skill"],["forbidai","zhu","ext:魔法纪录/image/anime_iroha.jpg","die:ext:魔法纪录/audio/die/anime_iroha.mp3"]],
            kanae: ["female","huan",4,["kaikang"],["ext:魔法纪录/image/kanae.jpg","die:ext:魔法纪录/audio/die/kanae.mp3"]],
            name: ["female","yuan",3,["dcchushan"],["ext:魔法纪录/image/name.jpg","die:ext:魔法纪录/audio/die/name.mp3"]],
            mitama: ["female","huan",3,["gongxiu","jinghe","ns_chuanshu"],["doublegroup:huan:ma","ext:魔法纪录/image/mitama.jpg","die:ext:魔法纪录/audio/die/mitama.mp3"]],
            ui: ["female","ma",3,["ui_jinghua","ui_wangyou","ui_leshan","dckrmingshi"],["doublegroup:huan:ma","ext:魔法纪录/image/ui.jpg","die:ext:魔法纪录/audio/die/ui.mp3"]],
            nagisa: ["female","yuan",3,["tiandu","ollianhuan","olniepan","olsbqiwu"],["ext:魔法纪录/image/nagisa.jpg","die:ext:魔法纪录/audio/die/nagisa.mp3"]],
            kanagi: ["female","huan",4,["reshuishi","kanagi_dongyou"],["zhu","ext:魔法纪录/image/kanagi.jpg","die:ext:魔法纪录/audio/die/kanagi.mp3"]],
            suzune: ["female","wan",4,["retuogu","shanzhuan"],["ext:魔法纪录/image/suzune.jpg","die:ext:魔法纪录/audio/die/suzune.mp3"]],
            dArc: ["female","wan",4,["dArc_congjun","nanaka_xiaoji","gongji"],["ext:魔法纪录/image/dArc.jpg","die:ext:魔法纪录/audio/die/dArc.mp3"]],
            himika: ["female","huan",4,["dclihuo","olchunlao"],["des:陨石拳","ext:魔法纪录/image/himika.jpg","die:ext:魔法纪录/audio/die/himika.mp3"]],
            masara: ["female","huan",4,["rebiyue","zhendu","qiluan"],["des:隐形刺杀","ext:魔法纪录/image/masara.jpg","die:ext:魔法纪录/audio/die/masara.mp3"]],
            seika: ["female","huan",4,["dcxiongyi"],["des:钻石飞溅","ext:魔法纪录/image/seika.jpg","die:ext:魔法纪录/audio/die/seika.mp3"]],
            rera: ["female","huan",4,["xinfu_jijie","xinfu_jiyuan"],["des:火焰之环","ext:魔法纪录/image/rera.jpg","die:ext:魔法纪录/audio/die/rera.mp3"]],
            mito: ["female","huan",5,["dcshuangren","hanzhan"],["des:绿叶如注","ext:魔法纪录/image/mito.jpg","die:ext:魔法纪录/audio/die/mito.mp3"]],
            ryo: ["female","ma",4,["dcsbyaozuo","dcsbzhuanwen"],["ext:魔法纪录/image/ryo.jpg","die:ext:魔法纪录/audio/die/ryo.mp3"]],
            ai: ["female","ma",3,["xingtu","juezhi","ai_shuxin"],["ext:魔法纪录/image/ai.jpg","die:ext:魔法纪录/audio/die/ai.mp3"]],
            asumi: ["female","yuan",4,["spzhuilie","zhaxiang"],["ext:魔法纪录/image/asumi.jpg","die:ext:魔法纪录/audio/die/asumi.mp3"]],
            "saint_mami": {
                sex: "female",
                group: "ma",
                hp: 5,
                maxHp: 5,
                hujia: 0,
                skills: ["reyingzi","reluanji","starxiaoyan","starjiaowang"],
                img: "extension/魔法纪录/image/saint_mami.jpg",
                dieAudios: ["ext:魔法纪录/audio/die/saint_mami.mp3"],
            },
            "uwasa_tsuruno": {
                sex: "female",
                group: "ma",
                hp: 5,
                maxHp: 5,
                hujia: 0,
                skills: ["drlt_qianjie","drlt_jueyan","drlt_huairou","relianying"],
                img: "extension/魔法纪录/image/uwasa_tsuruno.jpg",
                dieAudios: ["ext:魔法纪录/audio/die/uwasa_tsuruno.mp3"],
            },
            "devil_homura": {
                sex: "female",
                group: "yuan",
                hp: 4,
                maxHp: 4,
                hujia: 0,
                skills: ["dcgeyuan", "dcgusuan","bazhen"],
                img: "extension/魔法纪录/image/devil_homura.jpg",
            },
        },
        translate: {
            "ulti_madoka_prefix": "神",
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
            kazumi: "和美",
            kushu: "入名库什",
            kokoro: "粟根心",
            ayame: "三栗菖蒲",
            hanna: "更纱帆奈",
            kuroe: "黑江",
            "anime_iroha": "DP环彩羽",
            "anime_iroha_prefix": "DP",
            kanae: "雪野加奈惠",
            name: "小名",
            mitama: "八云御魂",
            ui: "环忧",
            nagisa: "百江渚",
            kanagi: "和泉十七夜",
            suzune: "天乃铃音",
            dArc: "贞德",
            himika: "真尾日美香",
            masara: "加贺见真良",
            seika: "桑水清佳",
            rera: "伊吹丽良",
            mito: "相野未都",
            ryo: "观鸟令",
            ai: "爱酱",
            asumi: "神名浅海",
            "saint_mami": "圣麻美",
            "saint_mami_prefix": "圣",
            "uwasa_tsuruno": "谣鹤乃",
            "uwasa_tsuruno_prefix": "谣",
            "devil_homura": "魔晓美焰",
            "devil_homura_prefix": "魔",
        },
        perfectPair: {
            oriko: ["kirika"],
            kirika: ["oriko"],
            madoka: ["homura","mami","sayaka","homura2","ulti_madoka","devil_homura"],
            "ulti_madoka": ["sayaka","homura","madoka","devil_homura"],
            homura: ["madoka","homura2","ulti_madoka","kyoko","mabayu","devil_homura"],
            "homura2": ["madoka","mami","sayaka","homura","devil_homura"],
            "devil_homura":["homura","homura2","ulti_madoka","madoka"],
            mami: ["kyoko","mabayu","homura2","madoka","sayaka","nagisa"],
            kyoko: ["mami","homura","homura2","sayaka","yuma"],
            sayaka: ["madoka","kyoko","homura2","mami"],
            yuma: ["kyoko"],
            mabayu: ["mami","homura","homura2"],
            iroha: ["yachiyo","felicia","sana","kuroe","ui"],
            yachiyo: ["iroha","tsuruno","momoko","mifuyu","meru","kanae"],
            felicia: ["iroha","tsuruno"],
            tsuruno: ["felicia","yachiyo"],
            sana: ["iroha"],
            momoko: ["yachiyo","kaede","lena","mitama"],
            lena: ["momoko","kaede"],
            kaede: ["momoko","lena"],
            toka: ["alina","nemu","ui"],
            alina: ["toka","nemu","karin"],
            nemu: ["alina","toka","ui"],
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
            kuroe: ["iroha"],
            kanae: ["yachiyo"],
            mitama: ["momoko"],
            nagisa: ["mami"],
            ui: ["toka","nemu","iroha"],
            kokoro: ["masara"],
            masara: ["kokoro"],
            mito: ["seika","rera"],
            seika: ["mito","rera"],
            rera: ["seika","mito"],
        },
    },
    card: {
        card: {
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
        },
        skill: {
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
        },
        translate: {
            "jk_unform": "JK制服",
            "jk_unform_info": "锁定技。当你成为【杀】的目标后，你进行判定：若结果为黑色，则此牌对你的伤害值基数+1。",
            "jk_unform_skill": "JK制服",
            "maid_uniform": "女仆装",
            "maid_uniform_info": "此牌的使用目标为其他角色。锁定技，当此牌进入或离开你的装备区时，你弃置一张不为此牌的牌。",
            "kuroe_kill": "名刀·黑江切彩羽",
            "kuroe_kill_info": "锁定技，当你造成伤害后，若此伤害对象是黑江，其立刻死亡。",
            "kuroe_kill_skill": "名刀·黑江切彩羽",
            "魔法纪录": "魔法纪录",
            yongzhuang: "泳装",
            "yongzhuang_info": "锁定技。当你成为【水淹七军】、【水攻】的目标时，取消之。",
            "yongzhuang_skill": "泳装",
            shuibojian: "水波剑",
            "shuibojian_info": "每回合限一次，当你使用普通锦囊牌或【杀】时，你可以为此牌增加一个目标。当你失去装备区里的【水波剑】后，你回复1点体力。",
            "shuibojian_skill": "水波剑",
            mengshenjueqiang: "盟神决枪",
            "mengshenjueqiang_info": "每回合限一次，当你使用【杀】造成伤害后，你可以进行判定，若结果为：红色，你回复1点体力；黑色：你摸两张牌。",
            "mengshenjueqiang_skill": "盟神决枪",
        },
        list: [["heart",9,"jk_unform",null,["gifts"]],["heart",10,"maid_uniform"],["spade",2,"kuroe_kill"],["spade",2,"yongzhuang"],["club",1,"shuibojian"],["heart",1,"mengshenjueqiang"]],
    },
    skill: {
        skill: {
            "sayaka_qiangyin": {
                inherit: "jieyin",
                audio: "jieyin",
                filterTarget(card, player, target) {
                    if (target.hp >= target.maxHp) return false;
                    if (target == player) return false;
                    return true;
                },
                async content(event, trigger, player) {
                    player.recover();
                    event.target.recover();
                    player.addTempSkill("buqu", { player: "phaseBegin" });
                    event.target.addTempSkill("buqu", { player: "phaseBegin" });
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
                    global: ["useCardAfter","useSkillAfter","phaseAfter"],
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
                        if (!player.hasZhuSkill("yuanjiu")) return false;
                        return game.hasPlayer(current => current != player && current.group == "huan");
                    },
                },
                "_priority": 0,
            },
            "oriko_yuzhi": {
                group: ["oriko_yuzhi_1","oriko_yuzhi_2"],
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
                            player.addToExpansion(get.cards(1)).gaintag.add("oriko_yuzhi");
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
                },
                "_priority": 0,
            },
            "oriko_jiangsha": {
                trigger: {
                    global: "judge",
                },
                direct: true,
                audio: ["guicai",2],
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
                enable: "phaseUse",
                filter(event, player) {
                    return player.countCards('h') > 0;
                },
                async content(event, trigger, player) {
                    let cards = [get.cardPile("mengshenjueqiang", "field"), get.cardPile("shuiyanqijun", "field")];
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
            "homura_shiting": {
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
                    player: ["damageEnd","loseHpEnd"],
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
                content() {
                    // 判定使用老写法，新写法有错误
                    "step 0";
                    player.judge(function (card) {
                        // 使用get函数访问能让ai改判
                        if (get.color(card) == "black") return 5;
                        return -5;
                    }).judge2 = function (result) {
                        return result.bool;
                    };
                    "step 1";
                    if (result.bool) {
                        player.addMark("nemu_zhiyao", trigger.num * 2);
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
                            if (markNum >= 2 && (attitude < 0 || (attitude > 0 && target.countCards("j") > 0))) return "两个标记";
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
                    player: "phaseBegin",
                },
                filter(event, trigger, player) {
                    return game.hasPlayer(current => current.countCards("j"));
                },
                async content(event, trigger, player) {
                    let result = await player
                        .chooseTarget([1, game.players.length], "弃置每名角色判定区的所有牌", function (card, player, target) {
                            return target.countCards("j");
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

                    for (let target of result.targets) {
                        if(target.countCards("j") > 1) num += target.countCards("j") - 1;
                        target.discard(target.getCards("j"));
                    }

                    player.draw(num);
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
                        if (
                            player !== target &&
                            !game.hasPlayer(function (current) {
                                return current !== player && current !== target && current.countCards("h") < target.countCards("h");
                            }) &&
                            get.attitude(player, target) > 0
                        ) return true;
                        if (target.hp == 1 && get.attitude(player, target) > 0) return true;
                        return false;
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
                    noh: true,
                    skillTagFilter(player, tag) {
                        if (tag == "noh") {
                            if (player.countCards("h") != 2) return false;
                        }
                    },
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
                audio: "ext:魔法纪录:2",
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
                audio: "ext:魔法纪录:2",
                group: ["homura2_jihuo_discard","homura2_jihuo_judge"],
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
                forced: true,
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

                    if (player.storage.mabayu_jingxiang) player.removeSkill(player.storage.mabayu_jingxiang);
                    await player.addSkills(result.control);
                    player.storage.mabayu_jingxiang = result.control;
                },
                "_priority": 0,
            },
            "nanaka_xiaoji": {
                inherit: "xiaoji",
                audio: "xiaoji",
                preHidden: true,
                getIndex(event, player) {
                    const evt = event.getl(player);
                    if (evt && evt.player === player && evt.es && evt.es.length) return 1;
                    return false;
                },
                audioname: ["sp_sunshangxiang","re_sunshangxiang"],
                trigger: {
                    player: "loseAfter",
                    global: ["equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
                },
                frequent: true,
                async content(event, trigger, player) {
                    player.draw(2);
                },
                ai: {
                    noe: true,
                    reverseEquip: true,
                    effect: {
                        target(card, player, target, current) {
                            if (get.type(card) == "equip" && !get.cardtag(card, "gifts")) {
                                return [1, 3];
                            }
                        },
                    },
                },
                "_priority": 0,
            },
            "madoka_liegong": {
                audio: "ext:魔法纪录:2",
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
                            player: ["damageBefore","damageCancelled","damageZero"],
                            target: ["shaMiss","useCardToExcluded","useCardToEnd"],
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
                    player: ["chooseToRespondBefore","chooseToUseBefore"],
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
                        
                        if(player.storage.madoka_liegong.length == 1){
                            player.unmarkSkill("madoka_liegong");
                            player.removeTip("madoka_liegong");
                        }else{
                            player.storage.madoka_liegong.remove(result.card.suit);
                            player.markAuto("madoka_liegong", [get.suit(trigger.card)]);
                            player.addTip("madoka_liegong", get.translation("madoka_liegong") + player.getStorage("madoka_liegong").reduce((str, suit) => str + get.translation(suit), ""));
                        }
                    } else {
                        player.gain(result.card);
                    }
                },
                ai: {
                    respondShan: true,
                    freeShan: true,
                    skillTagFilter(player) {
                        if (!player.storage.madoka_liegong || player.storage.madoka_liegong.length == 0) {
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
        },
        translate: {
            "sayaka_qiangyin": "强音",
            "sayaka_qiangyin_info": "出牌阶段限一次，你可以弃置两张手牌并选择一名已经受伤的角色。你与其各回复1点体力并各获得【不屈】直到各自角色的下个回合开始阶段。",
            xieli: "协力",
            "xieli_info": "主角技，当你需要使用或打出【杀】时，你可以令其他见泷原角色依次选择是否打出一张【杀】。若有角色响应，则你视为使用或打出了此【杀】。",
            yuanjiu: "援救",
            "yuanjiu_info": "主角技，当你需要使用或打出一张【闪】时，你可以令其他神盟角色选择是否打出一张【闪】。若有角色响应，则你视为使用或打出了一张【闪】。",
            "oriko_yuzhi": "预知",
            "oriko_yuzhi_info": "锁定技，一名角色的准备阶段开始时，你从牌堆顶抽取一张牌并放置在武将牌上，称为『视』。『视』的上限与场上玩家数相等。当一名角色死亡时，随机弃置一张『视』。",
            "oriko_jiangsha": "将杀",
            "oriko_jiangsha_info": "当一名角色的判定牌生效前，你可以打出一张『视』代替之。",
            "oriko_xianzhong": "献种",
            "oriko_xianzhong_info": "主角技，见泷原角色造成伤害后，其可以令你摸一张牌。",
            "magius_jiefang": "解放",
            "magius_jiefang_info": "主角技，其他玛吉斯之翼的角色出牌阶段限一次，该角色可以交给你一张【闪】或黑桃手牌。",
            "magius_jiefang2": "解放2",
            "ani_lieying": "猎鹰",
            "ani_lieying_info": "锁定技，若你没有装备武器，你视为装备【名刀·黑江切彩羽】。",
            "homura_shiting": "时停",
            "homura_shiting_info": "锁定技，每名角色的结束阶段时，若你的手牌数为0，你执行额外的一个回合。",
            "nemu_zhiyao": "制谣",
            "nemu_zhiyao_info": "锁定技，当你受到伤害或流失体力时，可进行一次判定，若结果不为红色，你获得等同伤害或流失体力数目2倍的『谣』标记。",
            "nemu_sanyao": "散谣",
            "nemu_sanyao_info": "一名角色的准备阶段开始时，你可：1. 弃置一个『谣』标记，令其受到一点伤害；2. 弃置两个『谣』标记，跳过该角色的判定、摸牌、出牌、弃牌阶段其中之一；3. 弃置三个『谣』标记，令其翻面。",
            "nemu_tiruo": "体弱",
            "nemu_tiruo_info": "锁定技，结束阶段开始时，若你的体力值不为全场最少，你失去一点体力。",
            "ashley_yuanyu": "远域",
            "ashley_yuanyu_info": "锁定技，当你受到伤害时，若伤害来源与你的座次不相邻，防止此伤害。",
            "ashley_mengshu": "萌术",
            "ashley_mengshu_info": "出牌阶段，你可以将一张黑桃手牌当作【知己知彼】或【远交近攻】使用。若你本局游戏内已经发动过了〖萌术〗，则你必须选择与上次不同的选项。",
            "ui_jinghua": "净化",
            "ui_jinghua_info": "你的准备阶段开始时，你可依次弃置一名武将判定区里存在的所有延时类锦囊，并额外摸等量的牌。",
            "ui_leshan": "乐善",
            "ui_leshan_info": "出牌阶段限一次，若你的手牌数大于5，你可将一半的手牌（向下取整）交给体力值最少的一名角色。你与该角色各额外回复一点体力。",
            "ui_wangyou": "忘忧",
            "ui_wangyou_info": "每回合限一次。一名角色的判定结果确定时，若结果的花色为♠，则你可以终止此判定。然后选择一项：①获得判定牌对应的实体牌。②视为对判定角色使用一张火【杀】（无距离和次数限制）。",
            "yachiyo_gujun": "孤军",
            "yachiyo_gujun_info": "主角技，每名角色的回合限一次，当神盟角色濒死状态结束后，其可以令你回复一点体力。",
            "kanagi_dongyou": "东佑",
            "kanagi_dongyou_info": "主角技，锁定技，其余神盟角色对你使用的【桃】回复量+1。",
            "kazumi_xingyun": "星陨",
            "kazumi_xingyun_info": "主角技，锁定技，当场上有角色死亡时，『星』的数量+1。",
            "sana_touming": "透明",
            "sana_touming_info": "锁定技，你翻面时，【杀】对你无效。",
            "homura2_jihuo": "集火",
            "homura2_jihuo_info": "当其他角色的红桃牌因弃置或判定而进入弃牌堆后，你可以获得之。",
            "dArc_congjun": "从军",
            "dArc_congjun_info": "游戏开始时，你获得一名随机角色的一个技能（不含主角技、隐匿技）；当有角色对你使用无懈可击时，你可以废除【从军】及【从军】获得的技能，然后对该角色造成2点伤害。",
            "mabayu_jingxiang": "镜像",
            "mabayu_jingxiang_info": "主角技，回合开始时，你从三个主角技中选择一个作为你的主角技。",
            "test_skill": "摸牌",
            "test_skill_info": "摸一张选定的牌。",
            "nanaka_xiaoji": "枭姬",
            "nanaka_xiaoji_info": "当你失去装备区里的牌后，你可以摸两张牌。",
            "madoka_liegong": "烈弓",
            "madoka_liegong_info": "①若你的装备区内没有武器牌，则你手牌区内所有【杀】的属性视为无属性。②当你使用牌时，或成为其他角色使用牌的目标后，你记录此牌的花色。③当你使用【杀】指定唯一目标后，若你〖烈弓②〗的记录不为空，则你可亮出牌堆顶的X张牌（X为你〖烈弓②〗记录过的花色数-1），令此【杀】的伤害值基数+Y（Y为亮出牌中被〖烈弓②〗记录过的花色的数量），且目标角色不能使用〖烈弓②〗记录过花色的牌响应此【杀】。此【杀】使用结算结束后，你清除〖烈弓②〗的记录。",
            "madoka_yingbian": "应变",
            "madoka_yingbian_info": "当你需要出闪时，你可以进行一次判定：若判定结果在【烈弓】所记载的花色内，你可弃置此花色，视为使用或打出一张【闪】，若在其之外，你获得判定牌。",
            "ai_shuxin": "数心",
            "ai_shuxin_info": "锁定技，除你以外，你不能成为点数为质数的牌的目标。",
        },
    },
    intro: "魔法纪录所有角色的三国杀，玩的开心（",
    author: "Waser",
    diskURL: "https://pan.baidu.com/s/5Yqdpb-Dh-BTnGepipfd3AA",
    forumURL: "",
    version: "1.1",
},files:{"character":["devil_homura.jpg"],"card":[],"skill":[],"audio":[]},connect:false} 
};