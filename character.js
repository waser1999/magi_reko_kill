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
		maxHp: 4,
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
		img: "extension/魔法纪录/image/nagisa.png",
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
		hp: 3,
		maxHp: 3,
		skills: ["ulti_madoka_lianjie", "ulti_madoka_shenxin", "ulti_madoka_zhili"],
		img: "extension/魔法纪录/image/ulti_madoka.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/ulti_madoka.mp3"],
		// isAiForbidden: true,
	},
	"devil_homura": {//魔晓美焰
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["devil_homura_weijie", "devil_homura_yinting", "devil_homura_cuanxiang"],
		img: "extension/魔法纪录/image/devil_homura.png",
		dieAudios: ["ext:魔法纪录/audio/die/devil_homura.mp3"],
		// isAiForbidden: true,
	},
	"iroha": {//环彩羽
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["iroha_dimeng", "iroha_huanyu", "iroha_yuanjiu"],
		img: "extension/魔法纪录/image/iroha.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/iroha.mp3"],
		isZhugong: true,
		clans: ["宝崎环氏"],
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
		img: "extension/魔法纪录/image/lena1.jpg",
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
		doubleGroup: ["Kamihama_Magia_Union", "Magius_Wing"],
	},
	"asuka": {//龙城明日香
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["asuka_longzhen"],
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
		doubleGroup: ["Kamihama_Magia_Union", "Magius_Wing"],
		clans: ["宝崎环氏"],
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
		skills: ["kagome_zhongji", "kagome_longli"],
		img: "extension/魔法纪录/image/kagome.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kagome.mp3"]
	},
	"kanae": {//雪野加奈惠
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 4,
		maxHp: 4,
		skills: ["kaikang", "mashu"],
		img: "extension/魔法纪录/image/kanae.png",
		dieAudios: ["ext:魔法纪录/audio/die/kanae.mp3"]
	},
	"ashley": {//阿什莉·泰勒
		sex: "female",
		group: "Kamihama_Magia_Union",
		hp: 3,
		maxHp: 3,
		skills: ["ashley_mengshu", "ashley_lingzhen"],
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
		skills: ["nanaka_huaxin"],
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
		skills: ["kushu_zhoufu", "kushu_yechu"],
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
		clans: ["宝崎环氏"],
	},
	"mifuyu": {//梓美冬
		sex: "female",
		group: "Magius_Wing",
		hp: 4,
		maxHp: 4,
		skills: ["mifuyu_mengying", "mifuyu_huyu", "mifuyu_huanren"],
		img: "extension/魔法纪录/image/mifuyu.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/mifuyu.mp3"],
		doubleGroup: ["Kamihama_Magia_Union", "Magius_Wing"],
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
		skills: ["karin_daodan", "karin_youhuo"],
		img: "extension/魔法纪录/image/karin.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/karin.mp3"],
		doubleGroup: ["Kamihama_Magia_Union", "Magius_Wing"],
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
		skills: ["kuroe_zhuxing", "kuroe_baoshen"],
		img: "extension/魔法纪录/image/kuroe.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/kuroe.mp3"],
		doubleGroup: ["Kamihama_Magia_Union", "Magius_Wing"],
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
		hp: 3,
		maxHp: 3,
		skills: ["shigure_cunming", "shigure_ciruan"],
		img: "extension/魔法纪录/image/shigure.png",
		dieAudios: ["ext:魔法纪录/audio/die/shigure.mp3"],
	},
	"hagumu": {//安积育梦
		sex: "female",
		group: "Magius_Wing",
		hp: 3,
		maxHp: 3,
		skills: ["hagumu_molie", "hagumu_xushi"],
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
		skills: ["yuma_yuying", "yuma_zuofei"],
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
    "Kazumi": {// 和美
        sex: "female",
        group: "Magia_Others",
        hp: 3,
        maxHp: 5,
        hujia: 0,
        skills: ["Kazumi_xingyun", "Kazumi_baoshi", "Kazumi_xiangxi", "Kazumi_chengzhen"],
        img: "extension/魔法纪录/image/Pleiades_Kazumi.jpg",
        dieAudios: ["ext:魔法纪录/audio/die/Kazumi.mp3"],
		isZhugong: true,
    },
    "Subaru_Kazumi": {// 昴和美
        sex: "female",
        group: "Magia_Others",
        hp: 13,
        maxHp: 13,
        hujia: 0,
        skills: ["Kazumi_xingyun", "Subaru_Kazumi_baoshi",  "Subaru_Kazumi_xiangxi", "Subaru_Kazumi_pojie", "Subaru_Kazumi_zhongxing"],
        img: "extension/魔法纪录/image/Subaru_Kazumi.jpg",
        dieAudios: ["ext:魔法纪录/audio/die/Subaru_Kazumi.mp3"],
		isZhugong: true,
		isUnseen: true,
    },
    // 昴宿星团
    "Pleiades_Saints": {
        sex: "female",
        group: "Magia_Others",
        hp: 7,
        maxHp: 8,
        hujia: 0,
        skills: ["Pleiades_jinnuan", "Pleiades_maosu", "Pleiades_shengtuan"],
        img: "extension/魔法纪录/image/Pleiades_Saints.jpg",
        dieAudios: ["ext:魔法纪录/audio/die/Pleiades_Saints.mp3"],
    },
    // 和纱美千留
    "Michiru": {
        sex: "female",
        group: "Magia_Others",
        hp: 5,
        maxHp: 5,
        hujia: 0,
        skills: ["Michiru_zhenxiang", "Michiru_xiangxi"],
        img: "extension/魔法纪录/image/Pleiades_Michiru.jpg",
        dieAudios: ["ext:魔法纪录/audio/die/Michiru.mp3"],
    },
	// 御崎海香
	"Umika": {
        sex: "female",
        group: "Magia_Others",
        hp: 3,
        maxHp: 3,
        hujia: 0,
        skills: ["Umika_juebi", "Umika_maosu"],
        img: "extension/魔法纪录/image/Pleiades_Umika.png",
        dieAudios: ["ext:魔法纪录/audio/die/Umika.mp3"]
    },
	// 牧薰
	"Kaoru": {
        sex: "female",
        group: "Magia_Others",
        hp: 4,
        maxHp: 4,
        hujia: 0,
        skills: ["Kaoru_rexue", "Kaoru_maosu"],
        img: "extension/魔法纪录/image/Pleiades_Kaoru.png",
        dieAudios: ["ext:魔法纪录/audio/die/Kaoru.mp3"],
    },
	// 浅海早纪
	"Saki": {
        sex: "female",
        group: "Magia_Others",
        hp: 3,
        maxHp: 4,
        hujia: 1,
        skills: ["Saki_zhishu", "Saki_maosu"],
        img: "extension/魔法纪录/image/Pleiades_Saki.jpg",
        dieAudios: ["ext:魔法纪录/audio/die/Saki.mp3"],
    },
	// 若叶未来
    "Mirai": {
        sex: "female",
        group: "Magia_Others",
        hp: 3,
        maxHp: 3,
        hujia: 0,
        skills: ["Mirai_nieai", "Mirai_maosu"],
        img: "extension/魔法纪录/image/Pleiades_Mirai.jpg",
        dieAudios: ["ext:魔法纪录/audio/die/Mirai.mp3"],
    },
	// 宇佐木里美
	"Satomi": {
        sex: "female",
        group: "Magia_Others",
        hp: 3,
        maxHp: 3,
        hujia: 0,
        skills: ["Satomi_leinuo", "Satomi_maosu" ,"Satomi_doumao"],
        img: "extension/魔法纪录/image/Pleiades_Satomi.jpg",
        dieAudios: ["ext:魔法纪录/audio/die/Satomi.mp3"],
    },
    // 神那妮可
    "Niko": {
        sex: "female",
        group: "Magia_Others",
        hp: 3,
        maxHp: 5,
        hujia: 0,
        skills: ["Niko_fushu", "Niko_maosu"],
        img: "extension/魔法纪录/image/Pleiades_Niko.jpg",
        dieAudios: ["ext:魔法纪录/audio/die/Niko.mp3"],
    },
	"dArc": {//塔鲁特（贞德）
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		skills: ["dArc_shengnv", "dArc_susheng", "dArc_shengjian_lv1"],
		img: "extension/魔法纪录/image/dArc.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/dArc.mp3"]
	},
	"Final_dArc": {//极贞德
		sex: "female",
		group: "Magia_Others",
		hp: 21,
		maxHp: 21,
		skills: ["Final_dArc_poge", "Final_dArc_guangying", "Final_dArc_tianmen"],
		img: "extension/魔法纪录/image/Final_dArc.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Final_dArc.mp3"]
	},
	"Riz": {// 莉兹
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 4,
		hujia: 0,
		skills: ["Riz_caoying", "Riz_yingfu", "Riz_anwu"],
		img: "extension/魔法纪录/image/Riz.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Riz.mp3"]
	},
	"Melissa": {// 梅丽莎
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["Melissa_bengmie_lv1", "Melissa_bingjian_lv1", "Melissa_wanyuan"],
		img: "extension/魔法纪录/image/Melissa.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Melissa.mp3"]
	},
	"Elisa": {// 爱丽莎
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["Elisa_longqi", "Elisa_longxiao", "Elisa_jinao"],
		img: "extension/魔法纪录/image/Elisa.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Elisa.mp3"]
	},
	"Corbeau": {// 可鲁波
		sex: "female",
		group: "Witch",
		hp: 2,
		maxHp: 5,
		hujia: 3,
		skills: ["Corbeau_shizhan", "Corbeau_eyu", "Corbeau_siwu", "Isabeau_kamen"],
		img: "extension/魔法纪录/image/Corbeau.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Corbeau.mp3"],
	},
	"Boss_Corbeau": {// boss可鲁波
		sex: "female",
		group: "Witch",
		hp: 14,
		maxHp: 14,
		hujia: 7,
		skills: ["Corbeau_shizhan", "Corbeau_eyu", "Corbeau_kuangyan", "Boss_Corbeau_siwu", "Boss_Corbeau_kamen"],
		img: "extension/魔法纪录/image/Boss_Corbeau.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Boss_Corbeau.mp3"],
		isUnseen: true,
		isBoss: true,
	},
	"Minuo": {// 米诺
		sex: "female",
		group: "Witch",
		hp: 3,
		maxHp: 4,
		hujia: 0,
		skills: ["Minuo_liyin", "Minuo_zongjian", "Isabeau_kamen"],
		img: "extension/魔法纪录/image/Minuo.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Minuo.mp3"],
	},
	"Lapine": {// 拉皮努
		sex: "female",
		group: "Witch",
		hp: 1,
		maxHp: 2,
		hujia: 1,
		skills: ["Lapine_jiegui", "Lapine_xinve", "Isabeau_kamen"],
		img: "extension/魔法纪录/image/Lapine.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Lapine.mp3"],
	},
	"WeepingHare": {// 哭泣兔的魔女
		sex: "female",
		group: "Witch",
		hp: 1,
		maxHp: 2,
		hujia: 1,
		skills: ["WeepingHare_jiegui", "WeepingHare_hebing", "Isabeau_kamen"],
		img: "extension/魔法纪录/image/WeepingHare.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Lapine.mp3"],
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
		doubleGroup: ["Kamihama_Magia_Union", "Magia_Others"],
	},
	"hikaru": {// 煌里光
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 3,
		skills: ["hikaru_zhengzheng", "hikaru_fenshen", "hikaru_chihun"],
		img: "extension/魔法纪录/image/hikaru.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/hikaru.mp3"],
	},
	"sasa": {//优木沙沙
		sex: "female",
		group: "Law_of_Cycles",
		hp: 3,
		maxHp: 3,
		skills: ["sasa_duyan", "sasa_wanning", "sasa_huoyi"],
		img: "extension/魔法纪录/image/sasa.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/sasa.mp3"],
	},
	"Souju": {//双树姐妹
		sex: "female",
		group: "Magia_Others",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["shuangfeng_Souju", "shuanghun", "jihun"],
		img: "extension/魔法纪录/image/Souju.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Souju.mp3"],
	},
	"Airi": {//悠里?
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 4,
		hujia: 1,
		skills: ["Airi_weixing", "Airi_qiangjiao", "Airi_suchou"],
		img: "extension/魔法纪录/image/Airi.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Airi.mp3"],
	},
	"Yuuri": {//飞鸟悠里
		sex: "female",
		group: "Magia_Others",
		hp: 3,
		maxHp: 3,
		hujia: 1,
		skills: ["Yuuri_tongze", "Yuuri_huanchi"],
		img: "extension/魔法纪录/image/Yuuri.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Yuuri.mp3"],
	},
	"Kanna": {// 圣迦南
		sex: "female",
		group: "Witch",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["Kanna_xinshen", "Kanna_eshi", "Kanna_beidan", "Kanna_bixiu"],
		img: "extension/魔法纪录/image/Hyades_Kanna.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Kanna.mp3"]
	},
	"Hyades": {// 海亚蒂斯
		sex: "female",
		group: "Witch",
		hp: 7,
		maxHp: 7,
		hujia: 0,
		skills: ["Hyades_bixiu", "Hyades_huimie", "Hyades_lianjie", "Hyades_xinsui"],
		img: "extension/魔法纪录/image/Hyades.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Kanna.mp3"],
		isUnseen: true,
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
	"Satou": {//砂糖
		sex: "female",
		group: "Witch",
		hp: 3,
		maxHp: 5,
		skills: ["Satou_shuoxing","Satou_xieyue", "Satou_huanri"],
		img: "extension/魔法纪录/image/Satou.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Satou.mp3"],
		isZhugong: true,
		isUnseen: true,
	},
	"Ruiqi": {//瑞麒
		sex: "female",
		group: "Tenkai",
		hp: 3,
		maxHp: 3,
		skills: ["Ruiqi_zhengzhao","Ruiqi_haipo", "Ruiqi_tingzheng"],
		img: "extension/魔法纪录/image/Ruiqi.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Ruiqi.mp3"],
	},
	"Kyukyu": {//啾啾
		sex: "female",
		group: "Tenkai",
		hp: 3,
		maxHp: 3,
		skills: ["Kyukyu_yimeng","Kyukyu_mige"],
		img: "extension/魔法纪录/image/Kyukyu.jpg",
		dieAudios: ["ext:魔法纪录/audio/die/Kyukyu.mp3"],
	},
}

const character_translates = {
	//前缀
	"ulti_madoka_prefix": "神",
	"魔法纪录": "魔法纪录",
	"dp_iroha_prefix": "DP",
	"saint_mami_prefix": "圣",
	"Kanna_prefix": "圣",
	"uwasa_tsuruno_prefix": "谣",
	"devil_homura_prefix": "魔",
	"Final_dArc_prefix": "极",

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
	Pleiades_Saints: "昴宿星团",
	Kazumi: "和美",
	Subaru_Kazumi: "昴和美",
	Michiru: "和纱美千留",
    Umika: "御崎海香",
	Kaoru: "牧薰",
	Saki: "浅海早纪",
    Mirai: "若叶未来",
	Satomi: "宇佐木里美",
	Niko: "神那妮可",
	dArc: "塔鲁特",
	Final_dArc: "极贞德",
	Riz: "莉兹·霍克伍德",
	Melissa: "梅丽莎·德·维尼奥勒",
	Elisa: "爱丽莎·采列斯卡",
	Corbeau: "可鲁波·德·巴伐利亚",
	Boss_Corbeau: "被虐的月夜乌",
	Minuo: "米诺·德·巴伐利亚",
	Lapine: "拉皮努·德·巴伐利亚",
	WeepingHare: "哭泣兔的魔女",
	suzune: "天乃铃音",
	yamada: "山田正一郎",
	blue: "蓝蓝",
	ceobo: "小刻",
	Satou: "砂糖",
	Ruiqi: "陈瑞麒",
	Kyukyu: "辺銀啾啾",
	sakuya: "铃鹿朔夜",
	hikaru: "煌里光",
	sasa: "优木沙沙",
	Souju: "双树绫濑&流香",
	Airi: "悠里?",
	Yuuri: "飞鸟悠里",
	Kanna: "圣迦南",
	Hyades: "海亚蒂斯之晓"
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
	yuna: ["juri", "ao", "hikaru"],
	ao: ["yuna", "juri", "hikaru"],
	juri: ["yuna", "ao", "hikaru"],
	nayuta: ["toka", "mikage"],
	mikage: ["nayuta", "mitama"],
	kirika: ["oriko"],
	oriko: ["kirika"],
	yuma: ["kyoko"],
	Kazumi: ["Kazumi", "Subaru_Kazumi", "Michiru", "Umika", "Kaoru", "Saki", "Mirai", "Satomi", "Niko"],
	Subaru_Kazumi: ["Kazumi", "Michiru", "Umika", "Kaoru", "Saki", "Mirai", "Satomi", "Niko"],
	Michiru: ["Kazumi", "Subaru_Kazumi", "Umika", "Kaoru", "Saki", "Mirai", "Satomi", "Niko"],
    Umika: ["Kazumi", "Subaru_Kazumi", "Michiru", "Kaoru", "Saki", "Mirai", "Satomi", "Niko"],
	Kaoru: ["Kazumi", "Subaru_Kazumi", "Michiru", "Umika", "Saki", "Mirai", "Satomi", "Niko"],
	Saki: ["Kazumi", "Subaru_Kazumi", "Michiru", "Umika", "Kaoru", "Mirai", "Satomi", "Niko"],
    Mirai: ["Kazumi", "Subaru_Kazumi", "Michiru", "Umika", "Kaoru", "Saki", "Satomi", "Niko"],
	Satomi: ["Kazumi", "Subaru_Kazumi", "Michiru", "Umika", "Kaoru", "Saki", "Mirai", "Niko"],
	Niko: ["Kazumi", "Subaru_Kazumi", "Michiru", "Umika", "Kaoru", "Saki", "Mirai", "Satomi", "Kanna"],
	Kanna: ["Kazumi", "Subaru_Kazumi", "Kanna"],
	Airi: ["Yuuri"],
	Yuuri: ["Kazumi", "Subaru_Kazumi", "Airi"],
	dArc: ["Final_dArc", "Riz", "Melissa", "Elisa"],
    Final_dArc: ["dArc", "Riz", "Melissa", "Elisa"],
	Riz: ["dArc", "Final_dArc", "Melissa", "Elisa"],
	Melissa: ["dArc", "Final_dArc", "Riz", "Elisa"],
	Elisa: ["dArc", "Final_dArc", "Riz", "Melissa"],
	Corbeau: ["Lapine", "Minou"],
	Minou: ["Lapine", "Corbeau", "Isabeau", "QueensTwilight"],
	Lapine: ["Lapine", "Corbeau", "Isabeau", "QueensTwilight"],
	hikaru: ["yuna", "juri", "ao"],
	Ruiqi: ["Kyukyu"],
	Kyukyu: ["Ruiqi"],
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
	devil_homura: "事象篡改", //魔晓美焰
	iroha: "未来之路", //环彩羽
	yachiyo: "绝对之雨", //七海八千代
	tsuruno: "炎扇斩舞", //由比鹤乃
	sana: "酷刑牢笼", //二叶莎奈
	felicia: "超级大大锤", //深月菲莉西亚
	lena: "光与影", //水波玲奈
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
	Pleiades_Saints: "Tocco Del Male",//昴宿星团
	Kazumi: "Limiti Esterni", //和美
	Subaru_Kazumi: "Meteora Finale", //昴和美
	Michiru: "Risotto alle fragole",//和纱美千留
    Umika: "Ex Fille",//御崎海香
	Kaoru: "Palla di Cannone",//牧薰
	Saki: "Pietra Di Tuono",//浅海早纪
    Mirai: "La Bestia Refare",//若叶未来
	Satomi: "Fantasma Bisbiglio",//宇佐木里美
	Niko: "Rendere O Romperlo",//神那妮可
	dArc: "La Lumière", //塔鲁特
	Final_dArc: "La Porte du Paradis",//极贞德
	Riz: "L'ombre",//莉兹
	Melissa :"Désintégration",//梅丽莎
	Elisa :"Der Drache Lindwurm",//爱丽莎
	Corbeau :"La Danse Macabre",//可鲁波
	Boss_Corbeau: "快乐的蹂躏时间到！",//Boss可鲁波
	Minuo: "Chat à neuf queues",//米诺
	Lapine: "Lapine aux cent yeux",//拉皮努
	WeepingHare: "其性质为虐待狂",//哭泣兔的魔女
	suzune: "燃椿之焰", //天乃铃音
	yamada: "超级科学回旋", //山田
	blue: "海晶少女",//蓝蓝
	ceobo: "百种兵器",//小刻
	Satou: "邪月",//砂糖
	Ruiqi: "电子幽麟",//瑞麒
	Kyukyu: "迷梦皉鸠",//啾啾
	sakuya: "辉煌之刃",//铃鹿朔夜
	hikaru: "光之军团",//煌里光
	sasa: "优我者死",//优木沙沙
	Souju: "一体二魂",//双树姐妹
	Airi: "恩仇悖身",//悠里?
	Yuuri: "梦色汤匙",//飞鸟悠里
	Kanna: "海亚蒂斯",//圣迦南
	Hyades: "其性质为毁灭",//海亚蒂斯之晓
};

// 更改武将原画
const characterSubstitutes = {
	dArc: [
		["dArc_v2", ["ext:魔法纪录/image/dArc_v2.jpg"]],
	],
	Souju: [
		["Souju Ayase", ["ext:魔法纪录/image/Souju Ayase.jpg"]],
		["Souju Luca", ["ext:魔法纪录/image/Souju Luca.jpg"]],
		["Souju Full", ["ext:魔法纪录/image/Souju.jpg"]],
	],
	nagisa: [
		["nagisa2", ["ext:魔法纪录/image/nagisa2.jpg"]],
	],
}

// 武将分类
const sortsTranslates = {
	madoka1: "魔法少女小圆",
	madoka11: "魔法少女小圆·Scene 0",
	madoka12: "魔法少女织莉子",
	madoka13: "魔法少女和美",
	madoka14: "魔法少女铃音",
	madoka15: "魔法少女贞德",
	madoka16: "非·魔法少女",

	madoka2: "神滨魔法联盟",
	madoka21: "玛吉斯之翼（含Neo-Magius）",
	madoka22: "誓约之血",
	madoka23: "时女一族",
	madoka24: "午夜0时的民间传说",
	madoka25: "调整屋",
	madoka26: "其他势力",

	madoka3: "魔法少女小圆Magia Exedra",
	madoka31: "魔法纪录·弦月记忆",

	madoka5: "魔圆其它角色",
	madoka6: "魔法少女山田",
	madoka7: "作者自设同人",
}

const characterSorts = {
	"madoka1": ["madoka", "homura", "sayaka", "mami", "kyoko", "nagisa", "homura_glasses", "ulti_madoka", "devil_homura", "homura_ribbon"],
	"madoka11": ["mabayu"],
	"madoka12": ["kirika", "oriko", "yuma", "sasa"],
	"madoka13": ["Pleiades_Saints", "Kazumi", "Subaru_Kazumi", "Michiru", "Umika", "Kaoru", "Saki", "Mirai", "Satomi", "Niko", "Souju", "Airi", "Yuuri", "Kanna", "Hyades"],
	"madoka14": ["suzune"],
	"madoka15": ["dArc", "Final_dArc", "Riz", "Melissa", "Elisa", "Lapine", "Corbeau", "Minou", "Isabeau", "QueensTwilight"],

	"madoka2": ["iroha", "yachiyo", "tsuruno", "sana", "felicia", "lena", "momoko", "kaede", "asuka", "ui", "kanagi", "kagome", "kanae", "ashley", "hinano", "nanaka", "rera", "seika", "mito", "kokoro", "himika", "ren", "hazuki", "ayame", "masara", "rika", "riko", "meru", "kushu", "dp_iroha"],
	"madoka21": ["mifuyu", "toka", "alina", "karin", "nemu", "yueye", "yuexiao", "kuroe", "sakura", "ryo", "saint_mami", "uwasa_tsuruno", "ai", "himena", "shigure", "hagumu"],
	"madoka22": ["yuna", "ao", "juri", "sakuya", "hikaru"],
	"madoka23": ["shizuka"],
	"madoka24": [],
	"madoka25": ["mitama"],
	"madoka26": ["nayuta", "mikage", "hanna"],

	"madoka3": ["name"],
	"madoka31": [],

	"madoka5": ["asumi"],
	"madoka6": ["yamada"],
	"madoka7": ["blue", "ceobo", "Satou", "Ruiqi", "Kyukyu"],
}

export default characters;
export { character_translates, perfectPairs, characterTitles, characterSubstitutes, characterSorts, sortsTranslates };
