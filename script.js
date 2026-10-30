(function () {
  "use strict";

  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");

  let current = "0";   // current input number (string)
  let previous = null; // previous operand (number)
  let operator = null; // pending operator
  let justEvaluated = false;

  function updateDisplay() {
    expressionEl.textContent = operator && previous !== null
      ? `${formatNumber(previous)} ${symbolFor(operator)}`
      : "";
    resultEl.textContent = current;
  }

  function formatNumber(n) {
    if (!isFinite(n)) return "Error";
    // Avoid long floating point artifacts
    const s = String(n);
    if (s.length > 12) return n.toPrecision(10);
    return s;
  }

  function symbolFor(op) {
    return { "+": "+", "-": "−", "*": "×", "/": "÷", "%": "%" }[op] || op;
  }

  function inputNumber(num) {
    if (justEvaluated) {
      current = num === "." ? "0." : num;
      justEvaluated = false;
      operator = null;
      previous = null;
      updateDisplay();
      return;
    }
    if (num === ".") {
      if (current.includes(".")) return;
      current += ".";
    } else {
      if (current === "0" && num !== ".") {
        current = num;
      } else {
        current += num;
      }
    }
    updateDisplay();
  }

  function inputOperator(op) {
    const value = parseFloat(current);
    if (operator && previous !== null && !justEvaluated) {
      // chain operations
      const res = calculate(previous, value, operator);
      previous = res;
      current = formatNumber(res);
    } else {
      previous = value;
    }
    operator = op;
    justEvaluated = false;
    current = "0";
    updateDisplay();
  }

  function calculate(a, b, op) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? NaN : a / b;
      case "%": return a % b;
      default: return b;
    }
  }

  function equals() {
    if (operator === null || previous === null) return;
    const value = parseFloat(current);
    const res = calculate(previous, value, operator);
    expressionEl.textContent = `${formatNumber(previous)} ${symbolFor(operator)} ${formatNumber(value)} =`;
    current = isFinite(res) ? formatNumber(res) : "Error";
    previous = null;
    operator = null;
    justEvaluated = true;
    resultEl.textContent = current;
  }

  function clear() {
    current = "0";
    previous = null;
    operator = null;
    justEvaluated = false;
    updateDisplay();
  }

  function backspace() {
    if (justEvaluated) {
      clear();
      return;
    }
    if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
      current = "0";
    } else {
      current = current.slice(0, -1);
    }
    updateDisplay();
  }

  // Button clicks
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.num !== undefined) {
        inputNumber(btn.dataset.num);
      } else if (btn.dataset.op !== undefined) {
        inputOperator(btn.dataset.op);
      } else if (btn.dataset.action === "clear") {
        clear();
      } else if (btn.dataset.action === "backspace") {
        backspace();
      } else if (btn.dataset.action === "equals") {
        equals();
      }
    });
  });

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") inputNumber(e.key);
    else if (e.key === ".") inputNumber(".");
    else if (["+", "-", "*", "/", "%"].includes(e.key)) inputOperator(e.key);
    else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
    else if (e.key === "Backspace") backspace();
    else if (e.key === "Escape" || e.key.toLowerCase() === "c") clear();
  });

  updateDisplay();
})();