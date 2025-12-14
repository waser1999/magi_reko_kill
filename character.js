import { lib, game, ui, get, ai, _status } from "../../noname.js";

const characters = {
	"madoka": {//鹿目圆
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["madoka_pomo", "madoka_lingyue", "madoka_yuanhuan"],
		img: "extension/魔法纪录/image/madoka.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/madoka.mp3"],
		isZhugong: true
	},
	"homura": {//晓美焰
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 4,
		skills: ["homura_yeyin", "homura_juwu", "homura_shiting"],
		img: "extension/魔法纪录/image/homura.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/homura.mp3"],
	},
	"homura_ribbon": {//缎带焰
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["homura_lunzhuan", "homura_chongyuan"],
		img: "extension/魔法纪录/image/homura_ribbon.png",
		dieAudios: ["ext:魔法纪录/audio/die/homura_ribbon.mp3"],
	},
	"sayaka": {//美树沙耶香
		sex: "female",
		group: "Law_of_Cycles",
		hp: 4,
		maxHp: 5,
		skills: ["sayaka_kuangzou", "sayaka_qiangyin", "sayaka_yuehun"],
		img: "extension/魔法纪录/image/sayaka.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/sayaka.mp3"],
	},
	"mami": {//巴麻美
		sex: "female",
		group: "Law_of_Cycles",
		hp: 4,
		maxHp: 4,
		skills: ["mami_duanbian", "mami_zhongmu", "mami_jiandan"],
		img: "extension/魔法纪录/image/mami.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/mami.mp3"],
	},
	"kyoko": {//佐仓杏子
		sex: "female",
		group: "Law_of_Cycles",
		hp: 4,
		maxHp: 4,
		skills: ["kyoko_shengxu", "kyoko_xiqiang", "kyoko_xunshen"],
		img: "extension/魔法纪录/image/kyoko.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kyoko.mp3"],
	},
	"nagisa": {//百江渚
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["nagisa_tianlao", "nagisa_beiji"],
		img: "extension/魔法纪录/image/nagisa.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/nagisa.mp3"]
	},
	"mabayu": {//爱生眩
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["mabayu_jingying", "mabayu_henyi", "mabayu_jingxiang"],
		img: "extension/魔法纪录/image/mabayu.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/mabayu.mp3"],
		isZhugong: true
	},
	"homura_glasses": {//麻花焰
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["homura_glasses_jihuo", "homura_glasses_baopo", "homura_glasses_liandan"],
		img: "extension/魔法纪录/image/homura_glasses.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/homura_glasses.mp3"],
	},
	"ulti_madoka": {//神鹿目圆
		sex: "female",
		group: "Law_of_Cycles",
		hp: 4,
		maxHp: 4,
		skills: ["twshelie", "sbliegong"],
		img: "extension/魔法纪录/image/ulti_madoka.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ulti_madoka.mp3"],
		isZhugong: true,
		isAiForbidden: true,
	},
	"devil_homura": {//魔晓美焰
		sex: "female",
		group: "Law_of_Cycles",
		hp: 4,
		maxHp: 4,
		skills: ["dcgeyuan", "dcgusuan", "dcjieshu", "bazhen"],
		img: "extension/魔法纪录/image/devil_homura.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/devil_homura.mp3"],
		isAiForbidden: true,
	},
	"iroha": {//环彩羽
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["iroha_shukun", "iroha_dimeng", "iroha_huanyu", "iroha_yuanjiu"],
		img: "extension/魔法纪录/image/iroha.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/iroha.mp3"],
		isZhugong: true,
	},
	"yachiyo": {//七海八千代
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["yachiyo_zhishui", "yachiyo_jueyu", "yachiyo_xiji", "yachiyo_gujun"],
		img: "extension/魔法纪录/image/yachiyo.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/yachiyo.mp3"],
		isZhugong: true
	},
	"tsuruno": {//由比鹤乃
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["tsuruno_qiangyun", "tsuruno_jizhi"],
		img: "extension/魔法纪录/image/tsuruno.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/tsuruno.mp3"],
	},
	"sana": {//二叶莎奈
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["sana_dunwei", "sana_touming", "sana_duntu"],
		img: "extension/魔法纪录/image/sana.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/sana.mp3"],
	},
	"felicia": {//深月菲莉西亚
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["felicia_chuiji", "felicia_yongbing"],
		img: "extension/魔法纪录/image/felicia.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/felicia.mp3"],
	},
	"lena": {//水波玲奈
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 2,
		maxHp: 3,
		skills: ["lena_bianzhuang", "lena_nizong", "lena_zhiao"],
		img: "extension/魔法纪录/image/lena.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/lena.mp3"],
	},
	"lena2": {//水波玲奈.变装
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 1,
		maxHp: 1,
		skills: ["lena_bianzhuang2", "lena_nizong2", "lena_zhiao2"],
		img: "extension/魔法纪录/image/lena.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/lena.mp3"],
		isUnseen: true,
	},
	"momoko": {//十咎桃子
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["momoko_liji", "momoko_liji2"],
		img: "extension/魔法纪录/image/momoko.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/momoko.mp3"],
	},
	"kaede": {//秋野枫
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["kaede_manmiao", "kaede_qudu", "kaede_zhuisi"],
		img: "extension/魔法纪录/image/kaede.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kaede.mp3"],
	},
	"asuka": {//龙城明日香
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["asuka_kurou", "asuka_longzhen"],
		img: "extension/魔法纪录/image/asuka.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/asuka.mp3"],
	},
	"ui": {//环忧
		sex: "female",
		group: "Magius_Wing",
		hp: 3,
		maxHp: 3,
		skills: ["ui_jinghua", "ui_jieyou", "iroha_huanyu"],
		img: "extension/魔法纪录/image/ui.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ui.mp3"],
	},
	"kanagi": {//和泉十七夜
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["kanagi_yinshi", "kanagi_duxin", "kanagi_dongyou"],
		img: "extension/魔法纪录/image/kanagi.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kanagi.mp3"],
		isZhugong: true
	},
	"mitama": {//八云御魂
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 3,
		skills: ["mitama_yuhun", "mitama_tiaozheng", "mitama_chuanshu"],
		img: "extension/魔法纪录/image/mitama.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/mitama.mp3"],
	},
	"kagome": {//佐鸟笼目
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["hsdianmo", "hszaibi"],
		img: "extension/魔法纪录/image/kagome.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kagome.mp3"]
	},
	"kanae": {//雪野加奈惠
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["kaikang", "mashu"],
		img: "extension/魔法纪录/image/kanae.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kanae.mp3"]
	},
	"ashley": {//阿什莉·泰勒
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["ashley_yuanyu", "ashley_mengshu"],
		img: "extension/魔法纪录/image/ashley.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ashley.mp3"],
	},
	"hinano": {//都雏乃
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["hinano_huawu", "hinano_duji", "hinano_shiyao", "hinano_baoming"],
		img: "extension/魔法纪录/image/hinano.png",
		dieAudios: ["ext:魔法纪录/audio/die/hinano.mp3"],
	},
	"nanaka": {//常盘七香
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["nanaka_huaxin", "rejizhi"],
		img: "extension/魔法纪录/image/nanaka.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/nanaka.mp3"],
	},
	"rera": {//伊吹丽良
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["xinfu_jijie", "rera_nuanxin"],
		img: "extension/魔法纪录/image/rera.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/rera.mp3"],
	},
	"seika": {//桑水清佳
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["seika_huzhu"],
		img: "extension/魔法纪录/image/seika.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/seika.mp3"],
	},
	"mito": {//相野未都
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 5,
		maxHp: 5,
		skills: ["dcsbkuangzhan", "hanzhan"],
		img: "extension/魔法纪录/image/mito.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/mito.mp3"],
	},
	"kokoro": {//粟根心
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["jieyue", "yizhong"],
		img: "extension/魔法纪录/image/kokoro.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kokoro.mp3"],
	},
	"hanna": {//更纱帆奈
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 3,
		skills: ["xinjuece", "dcmieji", "dcfencheng", "reluanwu"],
		img: "extension/魔法纪录/image/hanna.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/hanna.mp3"],
	},
	"himika": {//真尾日美香
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["dclihuo", "olchunlao"],
		img: "extension/魔法纪录/image/himika.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/himika.mp3"],
	},
	"ren": {//五十铃怜
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["xinwuyan", "ren_beige", "duanchang"],
		img: "extension/魔法纪录/image/ren.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ren.mp3"],
	},
	"hazuki": {//游佐叶月
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["huituo", "hazuki_mingjian"],
		img: "extension/魔法纪录/image/hazuki.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/hazuki.mp3"],
	},
	"ayame": {//三栗菖蒲
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["tianyi", "hanzhan"],
		img: "extension/魔法纪录/image/ayame.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ayame.mp3"],
	},
	"masara": {//加贺见真良
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["masara_cisha", "masara_wuying"],
		img: "extension/魔法纪录/image/masara.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/masara.mp3"],
	},
	"rika": {//绫野梨花
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["rika_sanshe", "reguose", "rika_liuge"],
		img: "extension/魔法纪录/image/rika.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/rika.mp3"],
	},
	"riko": {//千秋理子
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["dcduliang", "tunchu", "shuliang"],
		img: "extension/魔法纪录/image/riko.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/riko.mp3"],
	},
	"meru": {//安名梅露
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["zhiming", "twxingbu"],
		img: "extension/魔法纪录/image/meru.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/meru.mp3"]
	},
	"kushu": {//入名库什
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["jiushi", "keji", "refankui"],
		img: "extension/魔法纪录/image/kushu.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kushu.mp3"],
	},
	"dp_iroha": {//DP环彩羽
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["iroha2_huzi", "iroha2_chengmo", "iroha_huanyu"],
		img: "extension/魔法纪录/image/dp_iroha.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/dp_iroha.mp3"],
	},
	"mifuyu": {//梓美冬
		sex: "female",
		group: "Magius_Wing",
		hp: 3,
		maxHp: 3,
		skills: ["dcwumei", "dczhanmeng"],
		img: "extension/魔法纪录/image/mifuyu.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/mifuyu.mp3"],
	},
	"toka": {//里见灯花
		sex: "female",
		group: "Magius_Wing",
		hp: 3,
		maxHp: 3,
		skills: ["toka_jiquan", "toka_zhisuan", "magius_jiefang"],
		img: "extension/魔法纪录/image/toka.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/toka.mp3"],
		isZhugong: true
	},
	"alina": {//阿莉娜·格雷
		sex: "female",
		group: "Magius_Wing",
		hp: 3,
		maxHp: 3,
		skills: ["alina_moying", "juanhui"],
		img: "extension/魔法纪录/image/alina.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/alina.mp3"],
	},
	"karin": {//御园花凛
		sex: "female",
		group: "Magius_Wing",
		hp: 3,
		maxHp: 3,
		skills: ["daoshu", "weicheng"],
		img: "extension/魔法纪录/image/karin.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/karin.mp3"],
	},
	"nemu": {//柊音梦
		sex: "female",
		group: "Magius_Wing",
		hp: 5,
		maxHp: 5,
		skills: ["nemu_zhiyao", "nemu_sanyao", "nemu_tiruo"],
		img: "extension/魔法纪录/image/nemu.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/nemu.mp3"],
	},
	"yueye": {//天音月夜
		sex: "female",
		group: "Magius_Wing",
		hp: 5,
		maxHp: 5,
		skills: ["yueye_yingyin"],
		img: "extension/魔法纪录/image/yueye.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/yueye.mp3"],
	},
	"yuexiao": {//天音月咲
		sex: "female",
		group: "Magius_Wing",
		hp: 5,
		maxHp: 5,
		skills: ["yuexiao_yingyu"],
		img: "extension/魔法纪录/image/yuexiao.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/yuexiao.mp3"],
	},
	"kuroe": {//黑江
		sex: "female",
		group: "Magius_Wing",
		hp: 3,
		maxHp: 3,
		skills: ["qingbei", "dcsuishi"],
		img: "extension/魔法纪录/image/kuroe.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kuroe.mp3"],
	},
	"sakura": {//柊樱子
		sex: "female",
		group: "Magius_Wing",
		hp: 4,
		maxHp: 4,
		skills: ["tiandu", "sakura_yinghu", "sakura_yingmeng"],
		img: "extension/魔法纪录/image/sakura.png",
		dieAudios: ["ext:魔法纪录/audio/die/sakura.mp3"],
	},
	"ryo": {//观鸟令
		sex: "female",
		group: "Magius_Wing",
		hp: 3,
		maxHp: 3,
		skills: ["ryo_yaozuo", "dcsbzhuanwen"],
		img: "extension/魔法纪录/image/ryo.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ryo.mp3"]
	},
	"saint_mami": {//圣巴麻美
		sex: "female",
		group: "Magius_Wing",
		hp: 5,
		maxHp: 5,
		skills: ["saint_mami_zhongye", "saint_mami_xiaoyan"],
		img: "extension/魔法纪录/image/saint_mami.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/saint_mami.mp3"],
	},
	"uwasa_tsuruno": {//谣由比鹤乃
		sex: "female",
		group: "Magius_Wing",
		hp: 4,
		maxHp: 4,
		skills: ["tsuruno_qiangyun", "drlt_jueyan", "tsuruno_tuanluan"],
		img: "extension/魔法纪录/image/uwasa_tsuruno.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/uwasa_tsuruno.mp3"],
	},
	"ai": {//爱酱
		sex: "female",
		group: "Magius_Wing",
		hp: 3,
		maxHp: 3,
		skills: ["xingtu", "scls_juezhi", "ai_shuxin"],
		img: "extension/魔法纪录/image/ai.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ai.mp3"],
	},
	"himena": {//蓝家姬奈
		isZhugong: true,
		sex: "female",
		group: "Magius_Wing",
		hp: 4,
		maxHp: 4,
		skills: ["himena_zhiquan", "himena_shanji", "magius_zhishang"],
		img: "extension/魔法纪录/image/himena.png",
		dieAudios: ["ext:魔法纪录/audio/die/himena.mp3"],
	},
	"shigure": {//宫尾时雨
		sex: "female",
		group: "Magius_Wing",
		hp: 5,
		maxHp: 5,
		skills: ["olkanpo", "ollongdan"],
		img: "extension/魔法纪录/image/shigure.png",
		dieAudios: ["ext:魔法纪录/audio/die/shigure.mp3"],
	},
	"hagumu": {//安积育梦
		sex: "female",
		group: "Magius_Wing",
		hp: 5,
		maxHp: 5,
		skills: ["new_rewusheng", "oltiaoxin"],
		img: "extension/魔法纪录/image/hagumu.png",
		dieAudios: ["ext:魔法纪录/audio/die/hagumu.mp3"],
	},
	"yuna": {//红晴结菜
		isZhugong: true,
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		skills: ["yuna_chouhai", "yuna_xuehen", "yuna_liuli", "yuna_xuemeng"],
		img: "extension/魔法纪录/image/yuna.png",
		dieAudios: ["ext:魔法纪录/audio/die/yuna.mp3"],
	},
	"ao": {//笠音青
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 3,
		skills: ["ao_qulong", "ao_fuhu", "oljieming"],
		img: "extension/魔法纪录/image/ao.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ao.mp3"],
	},
	"juri": {//大庭树里
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		skills: ["juri_fenyan", "juri_longhuo"],
		img: "extension/魔法纪录/image/juri.png",
		dieAudios: ["ext:魔法纪录/audio/die/juri.mp3"],
	},
	"shizuka": {//时女静香
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		skills: ["shizuka_xueji", "shizuka_xueshang", "tokime_shinv"],
		img: "extension/魔法纪录/image/shizuka.png",
		dieAudios: ["ext:魔法纪录/audio/die/shizuka.mp3"],
		clans: ["时女一族"],
	},
	"nayuta": {//里见那由他
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		skills: ["nayuta_kanwu", "nayuta_mingsu", "olhongyuan"],
		img: "extension/魔法纪录/image/nayuta.png",
		dieAudios: ["ext:魔法纪录/audio/die/nayuta.mp3"],
	},
	"mikage": {//八云御影
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 3,
		skills: ["mikage_yuying", "mikage_yingbing"],
		img: "extension/魔法纪录/image/mikage.png",
		dieAudios: ["ext:魔法纪录/audio/die/mikage.mp3"],
	},
	"kirika": {//吴纪里香
		sex: "female",
		group: "Law_of_Cycles",
		hp: 4,
		maxHp: 4,
		skills: ["kirika_shensu", "kirika_renya", "shebian"],
		img: "extension/魔法纪录/image/kirika.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kirika.mp3"],
	},
	"oriko": {//美国织莉子
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["oriko_yuzhi", "oriko_jiangsha", "weimu", "oriko_xianzhong"],
		img: "extension/魔法纪录/image/oriko.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/oriko.mp3"],
		isZhugong: true
	},
	"yuma": {//千岁由麻
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["zhijian", "guzheng", "wangxi"],
		img: "extension/魔法纪录/image/yuma.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/yuma.mp3"],
	},
	"name": {//小名
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["name_dengtai"],
		img: "extension/魔法纪录/image/name.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/name.mp3"]
	},
	"asumi": {//神名浅海
		sex: "female",
		group: "Law_of_Cycles",
		hp: 4,
		maxHp: 4,
		skills: ["asumi_zhuilie"],
		img: "extension/魔法纪录/image/asumi.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/asumi.mp3"],
	},
	"kazumi": {//和美
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 3,
		skills: ["qixing", "kuangfeng", "dawu", "kazumi_xingyun"],
		img: "extension/魔法纪录/image/kazumi.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kazumi.mp3"],
		isZhugong: true
	},
	"dArc": {//贞德
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		skills: ["retieji", "nanaka_huaxin", "gongji"],
		img: "extension/魔法纪录/image/dArc.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/dArc.mp3"]
	},
	"suzune": {//天乃铃音
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		skills: ["suzune_chuancheng", "suzune_zhuanlu"],
		img: "extension/魔法纪录/image/suzune.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/suzune.mp3"]
	},
	"sakuya": {//铃鹿朔夜
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		skills: ["sakuya_tiaoting", "sakuya_huanzheng"],
		img: "extension/魔法纪录/image/sakuya.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/sakuya.mp3"],
	},
	"yamada": {//山田正一郎
		sex: "male",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		skills: ["yamada_feixiang", "yamada_mofa"],
		img: "extension/魔法纪录/image/yamada.png",
		dieAudios: ["ext:魔法纪录/audio/die/yamada.mp3"]
	},
	"blue": {//蓝蓝
		sex: "female",
		group: "Law_of_Cycles",
		hp: 4,
		maxHp: 4,
		skills: ["blue_haijing", "blue_bingjie", "blue_bingyuan"],
		img: "extension/魔法纪录/image/blue.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/blue.mp3"],
	},
	"ceobo": {//小刻
		sex: "female",
		group: "Law_of_Cycles",
		hp: 4,
		maxHp: 4,
		skills: ["ceobo_kuangai", "ceobo_qingmei"],
		img: "extension/魔法纪录/image/ceobo.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ceobo.mp3"],
	},
}

const character_translates = {
	//前缀
	"ulti_madoka_prefix": "神",
	"魔法纪录": "魔法纪录",
	"dp_iroha_prefix": "DP",
	"saint_mami_prefix": "圣",
	"uwasa_tsuruno_prefix": "谣",
	"devil_homura_prefix": "魔",

	madoka: "鹿目圆",
	homura: "晓美焰",
	sayaka: "美树沙耶香",
	mami: "巴麻美",
	kyoko: "佐仓杏子",
	nagisa: "百江渚",
	mabayu: "爱生眩",
	homura_glasses: "麻花焰",
	homura_ribbon: "缎带焰",
	"ulti_madoka": "神鹿目圆",
	"devil_homura": "魔晓美焰",
	iroha: "环彩羽",
	yachiyo: "七海八千代",
	tsuruno: "由比鹤乃",
	sana: "二叶莎奈",
	felicia: "深月菲莉西亚",
	lena: "水波玲奈",
	lena2: "水波玲奈.变装",
	momoko: "十咎桃子",
	kaede: "秋野枫",
	asuka: "龙城明日香",
	ui: "环忧",
	kanagi: "和泉十七夜",
	mitama: "八云御魂",
	kagome: "佐鸟笼目",
	kanae: "雪野加奈惠",
	ashley: "阿什莉·泰勒",
	hinano: "都雏乃",
	nanaka: "常盘七香",
	rera: "伊吹丽良",
	seika: "桑水清佳",
	mito: "相野未都",
	kokoro: "粟根心",
	hanna: "更纱帆奈",
	himika: "真尾日美香",
	ren: "五十铃怜",
	hazuki: "游佐叶月",
	ayame: "三栗菖蒲",
	masara: "加贺见真良",
	rika: "绫野梨花",
	riko: "千秋理子",
	meru: "安名梅露",
	kushu: "入名库什",
	"dp_iroha": "DP环彩羽",
	mifuyu: "梓美冬",
	toka: "里见灯花",
	alina: "阿莉娜·格雷",
	karin: "御园花凛",
	nemu: "柊音梦",
	yueye: "天音月夜",
	yuexiao: "天音月咲",
	kuroe: "黑江",
	sakura: "柊樱子",
	ryo: "观鸟令",
	"saint_mami": "圣巴麻美",
	"uwasa_tsuruno": "谣由比鹤乃",
	ai: "爱酱",
	himena: "蓝家姬奈",
	shigure: "宫尾时雨",
	hagumu: "安积育梦",
	yuna: "红晴结菜",
	ao: "笠音青",
	juri: "大庭树里",
	shizuka: "时女静香",
	nayuta: "里见那由他",
	mikage: "八云御影",
	kirika: "吴纪里香",
	oriko: "美国织莉子",
	yuma: "千岁由麻",
	name: "小名",
	asumi: "神名浅海",
	kazumi: "和美",
	dArc: "贞德",
	suzune: "天乃铃音",
	yamada: "山田正一郎",
	blue: "蓝蓝",
	ceobo: "小刻",
	sakuya: "铃鹿朔夜",
};

const perfectPairs = {
	madoka: ["homura", "mami", "sayaka", "homura_glasses", "ulti_madoka", "devil_homura"],
	homura: ["madoka", "homura_glasses", "ulti_madoka", "kyoko", "mabayu", "devil_homura", "homura_ribbon"],
	homura_ribbon: ["madoka", "homura", "homura_glasses", "ulti_madoka", "kyoko", "mabayu", "devil_homura"],
	sayaka: ["madoka", "kyoko", "homura_glasses", "mami"],
	mami: ["kyoko", "mabayu", "homura_glasses", "madoka", "sayaka", "nagisa"],
	kyoko: ["mami", "homura", "homura_glasses", "sayaka", "yuma"],
	nagisa: ["mami"],
	mabayu: ["mami", "homura", "homura_glasses"],
	homura_glasses: ["madoka", "mami", "sayaka", "homura", "devil_homura", "homura_ribbon"],
	ulti_madoka: ["sayaka", "homura", "madoka", "devil_homura"],
	devil_homura: ["homura", "homura_glasses", "ulti_madoka", "madoka"],
	iroha: ["yachiyo", "felicia", "sana", "kuroe", "ui", "dp_iroha"],
	yachiyo: ["iroha", "tsuruno", "momoko", "mifuyu", "meru", "kanae"],
	tsuruno: ["felicia", "yachiyo"],
	sana: ["iroha"],
	felicia: ["iroha", "tsuruno"],
	lena: ["momoko", "kaede"],
	momoko: ["yachiyo", "kaede", "lena", "mitama"],
	kaede: ["momoko", "lena"],
	ui: ["toka", "nemu", "iroha", "sakura"],
	mitama: ["momoko", "mikage"],
	kanae: ["yachiyo"],
	ashley: ["riko"],
	nanaka: ["hazuki"],
	rera: ["seika", "mito"],
	seika: ["mito", "rera"],
	mito: ["seika", "rera"],
	kokoro: ["masara"],
	ren: ["rika"],
	hazuki: ["nanaka"],
	masara: ["kokoro"],
	rika: ["ren"],
	riko: ["ashley"],
	meru: ["yachiyo"],
	dp_iroha: ["iroha"],
	mifuyu: ["yachiyo", "toka", "yueye"],
	toka: ["alina", "nemu", "ui", "nayuta", "sakura"],
	alina: ["toka", "nemu", "karin"],
	karin: ["alina"],
	nemu: ["alina", "toka", "ui", "ai", "sakura"],
	yueye: ["yuexiao", "mifuyu"],
	yuexiao: ["yueye"],
	kuroe: ["iroha"],
	sakura: ["nemu", "ryo", "toka", "ui"],
	ai: ["nemu"],
	himena: ["hagumu", "shigure"],
	shigure: ["hagumu", "himena"],
	hagumu: ["shigure", "himena"],
	yuna: ["juri", "ao"],
	ao: ["yuna", "juri"],
	juri: ["yuna", "ao"],
	nayuta: ["toka", "mikage"],
	mikage: ["nayuta", "mitama"],
	kirika: ["oriko"],
	oriko: ["kirika"],
	yuma: ["kyoko"],
};

const characterTitles = {
	madoka: "魔法之雨", //鹿目圆
	homura: "导弹集中轰炸", //晓美焰
	homura_ribbon: "黑色魔法压制",//缎带焰
	sayaka: "无畏极强音", //美树沙耶香
	mami: "终幕射击", //巴麻美
	kyoko: "盟神抉枪", //佐仓杏子
	nagisa: "魔法肥皂泡", //百江渚
	mabayu: "空洞人偶", //爱生眩
	homura_glasses: "时间停止攻击", //麻花焰
	ulti_madoka: "已经没必要再绝望了！", //神鹿目圆
	devil_homura: "棒针的连续穿刺", //魔晓美焰
	iroha: "未来之路", //环彩羽
	yachiyo: "绝对之雨", //七海八千代
	tsuruno: "炎扇斩舞", //由比鹤乃
	sana: "酷刑牢笼", //二叶莎奈
	felicia: "超级大大锤", //深月菲莉西亚
	lena: "无尽海神", //水波玲奈
	lena2: "无尽海神", //水波玲奈
	momoko: "宇宙之刃", //十咎桃子
	kaede: "大地审判", //秋野枫
	asuka: "龙真螺旋咆击", //龙城明日香
	ui: "希望之光", //环忧
	kanagi: "断罪的光芒", //和泉十七夜
	mitama: "绝对自坏演舞", //八云御魂
	kagome: "幻想之树", //佐鸟笼目
	kanae: "无思考", //雪野加奈惠
	ashley: "Ocean Tick Hurricane", //阿什莉·泰勒
	hinano: "狂怒原子", //都雏乃
	nanaka: "白椿", //常盘七香
	rera: "火焰之轮", //伊吹丽良
	seika: "钻石飞溅", //桑水清佳
	mito: "绿叶如注", //相野未都
	kokoro: "离散镭射", //粟根心
	hanna: "噩梦毒针", //更纱帆奈
	himika: "陨石拳", //真尾日美香
	ren: "灵魂救赎", //五十铃怜
	hazuki: "雷霆激流", //游佐叶月
	ayame: "未确认飞行火焰", //三栗菖蒲
	masara: "隐形暗杀", //加贺见真良
	rika: "闪耀光束", //绫野梨花
	riko: "美味猎手", //千秋理子
	meru: "漆黑的阿卡纳", //安名梅露
	kushu: "肃清天使", //入名库什
	dp_iroha: "沉默的魔女化身", //DP环彩羽
	mifuyu: "侵袭妄想", //梓美冬
	toka: "新创世纪☆彡", //里见灯花
	alina: "九相", //阿莉娜·格雷
	karin: "幽紫灵火", //御园花凛
	nemu: "创造的孩子们", //柊音梦
	yueye: "樱隐", //天音月夜
	yuexiao: "樱语", //天音月咲
	kuroe: "灾难盛宴", //黑江
	sakura: "万年樱之谣", //柊樱子
	ryo: "绝对炎上观鸟炮!!", //观鸟令
	saint_mami: "神滨圣女之谣", //圣巴麻美
	uwasa_tsuruno: "螯合游乐园之谣", //谣由比鹤乃
	ai: "无名人工智能之谣", //爱酱
	himena: "情绪摇滚爱★水妖", //蓝家姬奈
	shigure: "极限爆破怨恨", //宫尾时雨
	hagumu: "转圈圈再见", //安积育梦
	yuna: "雷霆埋葬", //红晴结菜
	ao: "超必·音速之刃No.Ⅵ", //笠音青
	juri: "无限灼热火焰龙击波", //大庭树里
	shizuka: "巫流·祈祷通天之光", //时女静香
	nayuta: "文化跃进的气流", //里见那由他
	mikage: "只有现在是坏孩子！", //八云御影
	kirika: "吸血鬼之牙", //吴纪里香
	oriko: "神谕光线", //美国织莉子
	yuma: "山猫冲击", //千岁由麻
	name: "无名少女", //小名
	asumi: "绝望交响曲", //神名浅海
	kazumi: "外缘极限", //和美
	dArc: "La Lumière", //贞德
	suzune: "燃椿之焰", //天乃铃音
	yamada: "超级科学回旋", //山田
	blue: "海晶少女",//蓝蓝
	ceobo: "百种兵器",//小刻
	sakuya: "辉煌之刃",//铃鹿朔夜
};

const characterReplaces = {

};

export default characters;
export { character_translates, perfectPairs, characterTitles, characterReplaces };