import { lib, game, ui, get, ai, _status } from "../../noname.js";
import cards from "./card.js";
import characters, { character_translates, perfectPairs } from "./character.js";
import skills from "./skill.js";
import translates from "./translate.js";

export const type = "extension";
export default function () {
    return {
        name: "魔法纪录", arenaReady: function () {

        }, content: function (config, pack) {

        }, prepare: function () {

        }, precontent: function () {
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
        }, help: {}, config: {}, package: {
            character: {
                character: { ...characters },
                translate: { ...character_translates },
                perfectPair: { ...perfectPairs },
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
                    ["club", 4, "du", null, ["gifts"]],
                    ["club", 5, "du", null, ["gifts"]],
                    ["club", 9, "du", null, ["gifts"]],
                    ["club", 10, "du", null, ["gifts"]],
                    ["spade", 4, "du"],
                    ["club", 4, "du", null, ["gifts"]],
                    ["club", 5, "du", null, ["gifts"]],
                    ["club", 9, "du", null, ["gifts"]],
                    ["club", 10, "du", null, ["gifts"]],
                    ["spade", 4, "du"],
                    ["spade", 1, "guaguliaodu"],
                    ["heart", 1, "guaguliaodu"],
                    ["club", 1, "guaguliaodu"],
                    ["diamond", 1, "guaguliaodu"],
                ],
            },
            skill: { ...skills },
            translate: { ...translates },
            intro: "魔法纪录所有角色的三国杀，含军争、国战、用间、应变等拓展锦囊。",
            author: "Waser",
            diskURL: "https://github.com/waser1999/magi_reko_kill",
            forumURL: "",
            version: "1.1",
        }, files: { "character": ["devil_homura.jpg"], "card": [], "skill": [], "audio": [] }, connect: false,
    }
};