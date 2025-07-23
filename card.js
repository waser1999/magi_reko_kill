import { lib, game, ui, get, ai, _status } from "../../noname.js";

const cards = {
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
            if (player.hasSkill("kanagi_nvpu")) return;
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
            if (player.hasSkill("kanagi_nvpu")) return;
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
    "test_tube": {
        fullskin: true,
        type: "equip",
        subtype: "equip1",
        distance: { attackFrom: -1 },
        ai: {
            basic: {
                equipValue: 2,
            },
        },
        skills: ["test_tube_skill"],
        image: "ext:魔法纪录/card_image/test_tube.png",
    },
    "special_week": {
        fullskin: true,
        type: "equip",
        subtype: "equip4",
        distance: { globalFrom: -1 },
        image: "ext:魔法纪录/card_image/special_week.png",
    }
}

export default cards;