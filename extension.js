import { lib, game, ui, get, ai, _status } from "../../noname.js";
import cards from "./card.js";
import characters, { character_translates, characterTitles, perfectPairs, characterSubstitutes, characterSorts, sortsTranslates } from "./character.js";
import skills from "./skill.js";
import equipSkills from "./equipSkill.js";
import originalSkills from "./originalSkill.js";
import translates from "./translate.js";

export const type = "extension";
export default function () {
	return {
		name: "魔法纪录",
		arenaReady: function () {
			// 重写选择器，这样可以在国战支持自定义势力啦
			game.getCharacterChoice = function (list, num) {
				const choice = list.splice(0, num).sort(function (a, b) {
					return (get.is.double(a) ? 1 : -1) - (get.is.double(b) ? 1 : -1);
				});
				const map = { wei: [], shu: [], wu: [], qun: [], key: [], jin: [], ye: [], Law_of_Cycles: [], Kamihama_Magia_Union: [], Magius_Wing: [], Magia_Others: [] };
				for (let i = 0; i < choice.length; ++i) {
					if (get.is.double(choice[i])) {
						// @ts-expect-error 祖宗之法就是这么写的
						var group = get.is.double(choice[i], true);
						// @ts-expect-error 祖宗之法就是这么写的
						for (var ii of group) {
							if (map[ii] && map[ii].length) {
								map[ii].push(choice[i]);
								lib.character[choice[i]][1] = ii;
								group = false;
								break;
							}
						}
						if (group) {
							choice.splice(i--, 1);
						}
					} else {
						// @ts-expect-error 祖宗之法就是这么写的
						var group = lib.character[choice[i]][1];
						if (map[group]) {
							map[group].push(choice[i]);
						}
					}
				}
				if (map.ye.length) {
					for (const i in map) {
						if (i != "ye" && map[i].length) {
							return choice.randomSort();
						}
					}
					choice.remove(map.ye[0]);
					map.ye.remove(map.ye[0]);
					for (var i = 0; i < list.length; i++) {
						if (lib.character[list[i]][1] != "ye") {
							choice.push(list[i]);
							list.splice(i--, 1);
							return choice.randomSort();
						}
					}
				}
				for (const i in map) {
					if (map[i].length < 2) {
						if (map[i].length == 1) {
							choice.remove(map[i][0]);
							list.push(map[i][0]);
						}
						map[i] = false;
					}
				}
				if (choice.length == num - 1) {
					for (let i = 0; i < list.length; ++i) {
						if (map[lib.character[list[i]][1]]) {
							choice.push(list[i]);
							list.splice(i--, 1);
							break;
						}
					}
				} else if (choice.length < num - 1) {
					let group = null;
					for (let i = 0; i < list.length; ++i) {
						if (group) {
							if (lib.character[list[i]][1] == group || lib.character[list[i]][1] == "ye") {
								choice.push(list[i]);
								list.splice(i--, 1);
								if (choice.length >= num) {
									break;
								}
							}
						} else {
							if (!map[lib.character[list[i]][1]] && !get.is.double(list[i])) {
								group = lib.character[list[i]][1];
								if (group == "ye") {
									group = null;
								}
								choice.push(list[i]);
								list.splice(i--, 1);
								if (choice.length >= num) {
									break;
								}
							}
						}
					}
				}
				return choice.randomSort();
			};
		}, content: function (config, pack) {

		}, prepare: function () {

		}, precontent: function () {
			// 这里写势力
			game.addGroup("Law_of_Cycles", "见泷原", "圆环之理相关", { color: "#C71585", image: "ext:魔法纪录/image/group/law_of_cycles.png" });
			game.addGroup("Kamihama_Magia_Union", "神盟", "神滨魔法联盟相关", { color: "#FF1493", image: "ext:魔法纪录/image/group/kamihama_union.png" });
			game.addGroup("Magius_Wing", "玛吉斯", "新旧玛吉斯之翼相关", { color: "#000000", image: "ext:魔法纪录/image/group/magius_wing.png" });
			game.addGroup("Magia_Others", "群雄", "其他魔法少女群体/个人", { color: "#8b0000", image: "ext:魔法纪录/image/group/magia_others.png" });
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
		}, help: {

		}, config: {

		},
		package: {
			character: {
				character: { ...characters },
				translate: { ...character_translates, ...sortsTranslates },
				perfectPair: { ...perfectPairs },
				characterTitle: { ...characterTitles },
				// characterReplace: { ...characterReplaces },
				characterSubstitute: { ...characterSubstitutes },
				characterSort: {
					"魔法纪录": characterSorts,
				},
				connect: true,
			},
			card: {
				card: { ...cards },
				skill: { ...skills, ...equipSkills, ...originalSkills },
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
			intro: `
				魔法纪录所有角色的三国杀。玩的开心（<br>
				<span>QQ群：</span><a href="#" onclick="event.preventDefault();navigator.clipboard.writeText('1030543470');alert('QQ群号已复制到剪贴板');">1030543470</a><span>（点击蓝字复制）</span>
				<br>
				<span>版本：v1.9.9。</span><br>
			`,
			author: "Waser",
			diskURL: "https://github.com/waser1999/magi_reko_kill",
			forumURL: "",
		}, files: {
			"character": [], "card": [], "skill": [], "audio": []
		}, connect: true,
	}
};