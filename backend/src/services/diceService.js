const { createLog, setCurrentStep } = require("./roomService");

function rollDice(params, callback) {
  const diceCount = Math.max(1, Math.min(Number(params.diceCount || 1), 6));
  const sides = Math.max(2, Math.min(Number(params.sides || 6), 20));
  const rolls = [];
  let total = 0;
  for (let i = 0; i < diceCount; i += 1) {
    const value = Math.floor(Math.random() * sides) + 1;
    rolls.push(value);
    total += value;
  }

  const result = {
    diceCount,
    sides,
    rolls,
    total
  };

  if (!params.roomId) {
    callback(null, result);
    return;
  }

  createLog(
    params.roomId,
    params.playerId || null,
    "dice_roll",
    `摇骰结果：${rolls.join(" + ")} = ${total}`,
    result,
    (logErr) => {
      if (logErr) {
        callback(logErr);
        return;
      }
      setCurrentStep(params.roomId, "摇骰移动", (stepErr) => callback(stepErr, result));
    }
  );
}

module.exports = {
  rollDice
};
