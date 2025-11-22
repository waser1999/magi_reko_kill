import { lib, game, ui, get, ai, _status } from "../../noname.js";
import cards from "./card.js";
import characters, { character_translates, characterTitles, perfectPairs, characterReplaces } from "./character.js";
import skills from "./skill.js";
import translates from "./translate.js";

export const type = "extension";
export default function () {
	return {
		name: "魔法纪录", arenaReady: function () {

		}, content: function (config, pack) {
			lib.translate.madoka1 = "魔法少女小圆";
			lib.translate.madoka2 = "魔法纪录";
			lib.translate.madoka3 = "玛吉斯之翼";
			lib.translate.madoka4 = "魔法纪录其它势力";
			lib.translate.madoka5 = "魔圆其它角色";
			lib.translate.madoka6 = "魔法少女山田";
			lib.translate.madoka7 = "作者自设同人";
			lib.characterSort['mode_extension_魔法纪录'] = {
				"madoka1": ["madoka", "homura", "sayaka", "mami", "kyoko", "nagisa", "mabayu", "homura_glasses", "homura_ribbon", "ulti_madoka", "devil_homura"],
				"madoka2": ["iroha", "yachiyo", "tsuruno", "sana", "felicia", "lena", "momoko", "kaede", "asuka", "ui", "kanagi", "mitama", "kagome", "kanae", "ashley", "hinano", "nanaka", "rera", "seika", "mito", "kokoro", "hanna", "himika", "ren", "hazuki", "ayame", "masara", "rika", "riko", "meru", "kushu", "dp_iroha"],
				"madoka3": ["mifuyu", "toka", "alina", "karin", "nemu", "yueye", "yuexiao", "kuroe", "sakura", "ryo", "saint_mami", "uwasa_tsuruno", "ai", "himena", "shigure", "hagumu"],
				"madoka4": ["yuna", "ao", "juri", "shizuka", "nayuta", "mikage"],
				"madoka5": ["kirika", "oriko", "yuma", "name", "asumi", "kazumi", "dArc", "suzune"],
				"madoka6": ["yamada"],
				"madoka7": ["blue"],
			}
		}, prepare: function () {

		}, precontent: function () {
			// 这里写势力
			game.addGroup("Law_of_Cycles", "見泷原", "圆环之理相关", { color: "#C71585" });
			game.addGroup("Kamihama_Magia_Union", "神盟", "神滨魔法联盟相关", { color: "#FF1493" });
			game.addGroup("Magius_Wing", "瑪吉斯", "新旧玛吉斯之翼相关", { color: "#000000" });
			game.addGroup("Magia_Others", "群雄", "其他魔法少女群体/个人", { color: "#8b0000" });
			// 特殊标记高亮
			lib.namePrefix.set("DP", {
				getSpan: () => {
					const span = document.createElement("span"), style = span.style;
					style.writingMode = style.webkitWritingMode = "horizontal-tb";
					style.fontFamily = "MotoyaLMaru";
					style.transform = "scaleY(0.85)";
					style.color = "#FFD700";
					span.textContent = "DP";
					return span.outerHTML;
				}
			});
			lib.namePrefix.set("圣", { color: "#FFD700" });
			lib.namePrefix.set("谣", { color: "#FFD700" });
			lib.namePrefix.set("神使", { color: "#FFD700" });
		}, help: {}, config: {}, package: {
			character: {
				character: { ...characters },
				translate: { ...character_translates },
				perfectPair: { ...perfectPairs },
				characterTitle: { ...characterTitles },
				characterReplace: { ...characterReplaces },
				connect: true,
			},
			card: {
				card: { ...cards },
				skill: { ...skills },
				translate: { ...translates },
				list: [
					["heart", 9, "jk_unform", null, ["gifts"]],
					["heart", 10, "maid_uniform"],
					["spade", 2, "kuroe_kill"],
					["spade", 2, "yongzhuang"],
					["club", 1, "shuibojian"],
					["heart", 1, "mengshenjueqiang"],
					["spade", 2, "test_tube"],
					["spade", 4, "du", null, ["gifts"]],
					["club", 4, "du"],
					["spade", 1, "guaguliaodu"],
					["heart", 5, "special_week"],
				],
			},
			skill: { ...skills },
			translate: { ...translates },
			intro: "魔法纪录所有角色的三国杀，含军争、国战、用间、应变等拓展锦囊。",
			author: "Waser",
			diskURL: "https://github.com/waser1999/magi_reko_kill",
			forumURL: "",
			version: "1.8.1",
		}, files: { "character": ["devil_homura.jpg"], "card": [], "skill": [], "audio": [] }, connect: true,
	}
};