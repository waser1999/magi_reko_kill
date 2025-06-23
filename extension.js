import { lib, game, ui, get, ai, _status } from "../../noname.js";
export const type = "extension";
export default function(){
	return {name:"魔法纪录",arenaReady:function(){
    
},content:function(config,pack){
    
},prepare:function(){
    
},precontent:function(){
    // 这里写势力
    game.addGroup("yuan","圆","见泷原小队","#FFC0CB");
    game.addGroup("huan","环","神滨魔法联盟","#000000");
    game.addGroup("zhi","织","美国织莉子","#FFFFFF");
    game.addGroup("ma","玛","玛吉斯之翼","#000000");
},help:{},config:{},package:{
    character: {
        character: {
            "1001": ["female","huan",3,["haoshi","dimeng","护援"],["zhu","des:未来之路"]],
            "1002": ["female","huan",4,["xingshang","fangzhu","songwei"],["des:绝对之雨","ext:魔法纪录/1002.jpg","die:ext:魔法纪录/audio/die/1002.mp3"]],
            "1003": ["female","huan",4,["qianxun","jiang","lianying"],["des:炎扇斩舞","ext:魔法纪录/1003.jpg","die:ext:魔法纪录/audio/die/1003.mp3"]],
            "1004": ["female","huan",3,["jushou","rezhenjun"],["des:酷刑牢笼","ext:魔法纪录/1004.jpg","die:ext:魔法纪录/audio/die/1004.mp3"]],
            "1005": ["female","huan",4,["decadepojun"],["des:超级大大锤","ext:魔法纪录/1005.jpg","die:ext:魔法纪录/audio/die/1005.mp3"]],
            "1009": ["female","huan",3,["huashen","xinsheng"],["des:无尽海神","ext:魔法纪录/1009.jpg","die:ext:魔法纪录/audio/die/1009.mp3"]],
            "1010": ["female","huan",4,["qiangxix","gzbuqu"],["des:宇宙之刃","ext:魔法纪录/1010.jpg","die:ext:魔法纪录/audio/die/1010.mp3"]],
            "1011": ["female","huan",3,["qingnang","jijiu","hongyan"],["des:大地审判","ext:魔法纪录/1011.jpg","die:ext:魔法纪录/audio/die/1011.mp3"]],
            "1012": ["female","ma",3,["daoshu","weicheng"],["des:幽紫灵火","ext:魔法纪录/1012.jpg","die:ext:魔法纪录/audio/die/1012.mp3","doublegroup:huan:ma"]],
            "1013": ["female","huan",4,["wushuang","paoxiao"],["des:龙真螺旋咆击","ext:魔法纪录/1013.jpg","die:ext:魔法纪录/audio/die/1013.mp3"]],
            "1018": ["female","ma",5,["shuangxiong"],["des:樱隐","ext:魔法纪录/1018.jpg","die:ext:魔法纪录/audio/die/1018.mp3"]],
            "1019": ["female","ma",5,["fuhun"],["des:樱语","ext:魔法纪录/1019.jpg","die:ext:魔法纪录/audio/die/1019.mp3"]],
            "2001": ["female","yuan",3,["sbliegong","激将"],["zhu","des:魔法之雨","ext:魔法纪录/2001.jpg","die:ext:魔法纪录/audio/die/2001.mp3"]],
            "2002": ["female","yuan",3,["reguanxing","luoshen","longdan"],["des:导弹集中轰炸","ext:魔法纪录/2002.jpg","die:ext:魔法纪录/audio/die/2002.mp3"]],
            "2003": ["female","yuan",3,["luoying","yiji","huoji"],["des:时间停止攻击","ext:魔法纪录/2003.jpg","die:ext:魔法纪录/audio/die/2003.mp3"]],
            "2004": ["female","yuan",4,["xinkuanggu","gzyinghun","义助"],["des:无畏极强音","ext:魔法纪录/2004.jpg","die:ext:魔法纪录/audio/die/2004.mp3"]],
            "2005": ["female","yuan",4,["guose","luanji","qiaobian","yingzi"],["des:终幕射击","ext:魔法纪录/2005.jpg","die:ext:魔法纪录/audio/die/2005.mp3"]],
            "2006": ["female","yuan",4,["tuntian","zaoxian","jixi","xinxuanhuo"],["des:盟神决枪","ext:魔法纪录/2006.jpg","die:ext:魔法纪录/audio/die/2006.mp3"]],
            "2009": ["female","yuan",3,["nzry_chenglve","nzry_cunmu"],["des:空洞人偶","ext:魔法纪录/2009.jpg","die:ext:魔法纪录/audio/die/2009.mp3"]],
            "2201": ["female","yuan",4,["shelie","gongxin"],["des:再也没有必要绝望了！","ext:魔法纪录/2201.jpg","die:ext:魔法纪录/audio/die/2201.mp3"]],
            "3005": ["female","huan",3,["xiaoji","jizhi"],["des:白椿","ext:魔法纪录/3005.jpg","die:ext:魔法纪录/audio/die/3005.mp3"]],
            "3025": ["female","huan",3,["xinwuyan","duanchang","zhichi"],["des:灵魂救赎","ext:魔法纪录/3025.jpg","die:ext:魔法纪录/audio/die/3025.mp3"]],
            "3027": ["female","huan",3,["huituo","mingjian","fangquan"],["des:雷霆激流","ext:魔法纪录/3027.jpg","die:ext:魔法纪录/audio/die/3027.mp3"]],
            "3031": ["female","huan",3,["ganlu","buyi","old_anxu","zhuiyi"],["des:闪耀光束","ext:魔法纪录/3031.jpg","die:ext:魔法纪录/audio/die/3031.mp3"]],
            "3035": ["female","huan",3,["dcduliang","retianxiang"],["des:美味猎手","ext:魔法纪录/3035.jpg","die:ext:魔法纪录/audio/die/3035.mp3"]],
            "3052": ["female","huan",4,["zongkui","guju","baijia","bmcanshi"],["des:Ocean Tick Hurricane","ext:魔法纪录/3052.jpg","die:ext:魔法纪录/audio/die/3052.mp3"]],
            "4001": ["female","zhi",3,["weimu","wansha","guicai","fankui","songwei"],["zhu","des:神谕光线","ext:魔法纪录/4001.jpg","die:ext:魔法纪录/audio/die/4001.mp3"]],
            "4002": ["female","zhi",4,["xinshensu","ganglie"],["des:吸血鬼之牙","ext:魔法纪录/4002.jpg","die:ext:魔法纪录/audio/die/4002.mp3"]],
            "4003": ["female","yuan",3,["zhijian","guzheng","wangxi"],["des:山猫冲击","ext:魔法纪录/4003.jpg","die:ext:魔法纪录/audio/die/4003.mp3"]],
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
            "义助": {
                audio: "ext:魔法纪录:2",
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
        },
        translate: {
            "义助": "义助",
            "义助_info": "出牌阶段限一次，你可以弃置两张手牌并选择一名已经受伤的角色。你与其各回复1点体力。",
        },
    },
    intro: "",
    author: "Waser",
    diskURL: "",
    forumURL: "",
    version: "1.0",
},files:{"character":["1010.jpg","1013.jpg","2001.jpg","2002.jpg","3005.jpg","2006.jpg","4001.jpg","1003.jpg","1004.jpg","1005.jpg","1011.jpg","1012.jpg","1018.jpg","2003.jpg","1019.jpg","2004.jpg","2005.jpg","2009.jpg","2201.jpg","3025.jpg","3031.jpg","1002.jpg","1009.jpg","3035.jpg","3052.jpg","4002.jpg","4003.jpg","3027.jpg","1001.jpg"],"card":[],"skill":[],"audio":[]},connect:false} 
};