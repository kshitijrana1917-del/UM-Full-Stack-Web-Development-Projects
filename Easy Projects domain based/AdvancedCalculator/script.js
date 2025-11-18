const display = document.getElementById("display");
let expression = "";
let isDegree = true;

function factorial(n) {
  if (n < 0) return "Error";
  if (n === 0) return 1;
  return n * factorial(n - 1);
}

document.querySelectorAll(".btn").forEach(button => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    const func = button.dataset.func;

    // Basic calculator functionality
    if (value) {
      if (value === "C") {
        expression = "";
        display.textContent = "0";
      } else if (value === "=") {
        try {
          const result = eval(
            expression.replace(/÷/g, "/").replace(/×/g, "*")
          );
          display.textContent = result;
          expression = result.toString();
        } catch {
          display.textContent = "Error";
          expression = "";
        }
      } else {
        expression += value;
        display.textContent = expression;
      }
    }

    // Scientific buttons
    if (func) {
      let val = parseFloat(display.textContent);
      if (isNaN(val)) return;

      switch (func) {
        case "sin":
          val = Math.sin(isDegree ? val * Math.PI / 180 : val);
          break;
        case "cos":
          val = Math.cos(isDegree ? val * Math.PI / 180 : val);
          break;
        case "tan":
          val = Math.tan(isDegree ? val * Math.PI / 180 : val);
          break;
        case "log":
          val = Math.log10(val);
          break;
        case "ln":
          val = Math.log(val);
          break;
        case "sqrt":
          val = Math.sqrt(val);
          break;
        case "square":
          val = Math.pow(val, 2);
          break;
        case "pow":
          const p = parseFloat(prompt("Enter the power:"));
          if (!isNaN(p)) val = Math.pow(val, p);
          break;
        case "fact":
          val = factorial(val);
          break;
        case "exp":
          val = Math.exp(val);
          break;
        case "pi":
          val = Math.PI;
          break;
        case "e":
          val = Math.E;
          break;
        case "deg":
          isDegree = !isDegree;
          alert(isDegree ? "Mode: Degrees" : "Mode: Radians");
          return;
      }

      display.textContent = val;
      expression = val.toString();
    }
  });
});
